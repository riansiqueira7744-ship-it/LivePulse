ALTER TABLE public.hosts
  ALTER COLUMN agency_id DROP NOT NULL;

ALTER TABLE public.hosts
  ADD COLUMN IF NOT EXISTS platform_user_id text;

CREATE UNIQUE INDEX IF NOT EXISTS hosts_user_id_unique
  ON public.hosts (user_id)
  WHERE user_id IS NOT NULL;

DROP POLICY IF EXISTS profiles_search_free_hosts ON public.profiles;

CREATE OR REPLACE FUNCTION public.search_unaffiliated_host_by_livepulse_id(_livepulse_id text)
RETURNS TABLE (
  id uuid,
  name text,
  livepulse_id text,
  country text,
  city text,
  platform text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.livepulse_id, p.country, p.city, p.platform
  FROM public.profiles p
  JOIN public.user_roles ur
    ON ur.user_id = p.id
   AND ur.role = 'host'::public.app_role
  WHERE p.agency_id IS NULL
    AND upper(p.livepulse_id) = upper(trim(_livepulse_id))
    AND (
      public.is_super_admin()
      OR public.has_role(auth.uid(), 'agency_owner'::public.app_role)
      OR public.has_role(auth.uid(), 'manager'::public.app_role)
    )
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.search_unaffiliated_host_by_livepulse_id(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_unaffiliated_host_by_livepulse_id(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_unaffiliated_host_by_livepulse_id(text) TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _account_type text := COALESCE(NEW.raw_user_meta_data->>'account_type', 'host');
  _prefix text;
  _livepulse_id text;
BEGIN
  _prefix := CASE _account_type WHEN 'agency_owner' THEN 'O' WHEN 'manager' THEN 'M' ELSE 'H' END;
  _livepulse_id := public.generate_livepulse_id(_prefix);

  INSERT INTO public.profiles (
    id, email, name, locale, whatsapp, country, city,
    platform, platform_user_id, livepulse_id, agency_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'pt-BR'),
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'platform',
    NEW.raw_user_meta_data->>'platform_user_id',
    _livepulse_id,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  IF _account_type = 'host' THEN
    INSERT INTO public.user_roles (user_id, role, agency_id)
    SELECT NEW.id, 'host'::public.app_role, NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = NEW.id AND role = 'host'::public.app_role
    );

    INSERT INTO public.hosts (
      agency_id, user_id, nickname, email, whatsapp, avatar_url,
      platform, platform_user_id, country, city, status, livepulse_id
    )
    VALUES (
      NULL,
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      NEW.raw_user_meta_data->>'whatsapp',
      NULL,
      COALESCE((NEW.raw_user_meta_data->>'platform')::public.host_platform, 'tiktok'::public.host_platform),
      NEW.raw_user_meta_data->>'platform_user_id',
      NEW.raw_user_meta_data->>'country',
      NEW.raw_user_meta_data->>'city',
      'active'::public.host_status,
      _livepulse_id
    )
    ON CONFLICT (user_id) WHERE user_id IS NOT NULL DO UPDATE SET
      nickname = EXCLUDED.nickname,
      email = EXCLUDED.email,
      whatsapp = EXCLUDED.whatsapp,
      platform = EXCLUDED.platform,
      platform_user_id = EXCLUDED.platform_user_id,
      country = EXCLUDED.country,
      city = EXCLUDED.city,
      livepulse_id = EXCLUDED.livepulse_id;
  END IF;

  RETURN NEW;
END
$$;

INSERT INTO public.user_roles (user_id, role, agency_id)
SELECT p.id, 'host'::public.app_role, p.agency_id
FROM public.profiles p
WHERE p.livepulse_id LIKE 'LP-H-%'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role = 'host'::public.app_role
  );

INSERT INTO public.hosts (
  agency_id, user_id, nickname, email, whatsapp, avatar_url,
  platform, platform_user_id, country, city, status, livepulse_id, created_at
)
SELECT
  p.agency_id,
  p.id,
  COALESCE(p.name, split_part(p.email, '@', 1)),
  p.email,
  p.whatsapp,
  p.avatar_url,
  COALESCE(p.platform::public.host_platform, 'tiktok'::public.host_platform),
  p.platform_user_id,
  p.country,
  p.city,
  'active'::public.host_status,
  p.livepulse_id,
  p.created_at
FROM public.profiles p
JOIN public.user_roles ur
  ON ur.user_id = p.id
 AND ur.role = 'host'::public.app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.hosts h WHERE h.user_id = p.id
);

CREATE OR REPLACE FUNCTION public.accept_invitation(_invitation_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inv public.invitations%ROWTYPE;
  _profile public.profiles%ROWTYPE;
  _host_id uuid;
BEGIN
  SELECT * INTO _inv FROM public.invitations WHERE id = _invitation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Convite não encontrado'; END IF;
  IF _inv.host_user_id <> auth.uid() THEN RAISE EXCEPTION 'Não autorizado'; END IF;
  IF _inv.status <> 'pending' THEN RAISE EXCEPTION 'Convite já respondido'; END IF;

  SELECT * INTO _profile FROM public.profiles WHERE id = auth.uid();
  IF _profile.agency_id IS NOT NULL THEN
    RAISE EXCEPTION 'Host já vinculado a uma agência';
  END IF;

  UPDATE public.profiles
  SET agency_id = _inv.agency_id
  WHERE id = auth.uid();

  UPDATE public.hosts
  SET agency_id = _inv.agency_id,
      nickname = COALESCE(_profile.name, split_part(_profile.email, '@', 1)),
      email = _profile.email,
      whatsapp = _profile.whatsapp,
      avatar_url = _profile.avatar_url,
      country = _profile.country,
      city = _profile.city,
      platform = COALESCE(_profile.platform::public.host_platform, 'tiktok'::public.host_platform),
      platform_user_id = _profile.platform_user_id,
      livepulse_id = _profile.livepulse_id
  WHERE user_id = auth.uid()
  RETURNING id INTO _host_id;

  IF _host_id IS NULL THEN
    INSERT INTO public.hosts (
      agency_id, user_id, nickname, email, whatsapp, avatar_url,
      country, city, platform, platform_user_id, livepulse_id
    )
    VALUES (
      _inv.agency_id,
      auth.uid(),
      COALESCE(_profile.name, split_part(_profile.email, '@', 1)),
      _profile.email,
      _profile.whatsapp,
      _profile.avatar_url,
      _profile.country,
      _profile.city,
      COALESCE(_profile.platform::public.host_platform, 'tiktok'::public.host_platform),
      _profile.platform_user_id,
      _profile.livepulse_id
    )
    RETURNING id INTO _host_id;
  END IF;

  UPDATE public.user_roles
  SET agency_id = _inv.agency_id
  WHERE user_id = auth.uid() AND role = 'host'::public.app_role;

  UPDATE public.invitations
  SET status = 'accepted', responded_at = now()
  WHERE id = _invitation_id;

  RETURN _host_id;
END
$$;

DROP VIEW IF EXISTS public.host_directory;
CREATE VIEW public.host_directory
WITH (security_invoker = true)
AS
SELECT
  h.id,
  h.agency_id,
  h.user_id,
  h.manager_id,
  COALESCE(p.name, h.nickname) AS nickname,
  COALESCE(p.email, h.email) AS email,
  COALESCE(p.whatsapp, h.whatsapp) AS whatsapp,
  COALESCE(p.avatar_url, h.avatar_url) AS avatar_url,
  COALESCE(p.platform, h.platform::text) AS platform,
  COALESCE(p.platform_user_id, h.platform_user_id) AS platform_user_id,
  h.category,
  COALESCE(p.country, h.country) AS country,
  COALESCE(p.city, h.city) AS city,
  h.status::text AS status,
  h.live_hours,
  h.gifts_total,
  h.earnings_total,
  h.score,
  h.joined_at,
  h.created_at,
  h.updated_at,
  COALESCE(p.livepulse_id, h.livepulse_id) AS livepulse_id,
  m.name AS manager_name,
  a.name AS agency_name
FROM public.hosts h
LEFT JOIN public.profiles p ON p.id = h.user_id
LEFT JOIN public.managers m ON m.id = h.manager_id
LEFT JOIN public.agencies a ON a.id = h.agency_id;

REVOKE ALL ON public.host_directory FROM PUBLIC;
GRANT SELECT ON public.host_directory TO authenticated;
GRANT ALL ON public.host_directory TO service_role;