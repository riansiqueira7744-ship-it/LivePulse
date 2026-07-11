
-- 1. Enum: add awaiting_payment
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'awaiting_payment' BEFORE 'trial';

-- 2. Livepulse ID generator
CREATE OR REPLACE FUNCTION public.generate_livepulse_id(_prefix text)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  candidate text;
  exists_count int;
BEGIN
  LOOP
    candidate := 'LP-' || _prefix || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    SELECT
      (SELECT count(*) FROM public.profiles WHERE livepulse_id = candidate)
      + (SELECT count(*) FROM public.agencies WHERE livepulse_id = candidate)
      + (SELECT count(*) FROM public.managers WHERE livepulse_id = candidate)
      + (SELECT count(*) FROM public.hosts WHERE livepulse_id = candidate)
    INTO exists_count;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN candidate;
END $$;

-- 3. Add livepulse_id columns
ALTER TABLE public.profiles  ADD COLUMN IF NOT EXISTS livepulse_id text UNIQUE;
ALTER TABLE public.agencies  ADD COLUMN IF NOT EXISTS livepulse_id text UNIQUE;
ALTER TABLE public.managers  ADD COLUMN IF NOT EXISTS livepulse_id text UNIQUE;
ALTER TABLE public.hosts     ADD COLUMN IF NOT EXISTS livepulse_id text UNIQUE;

-- Profile extras for host self-signup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS platform_user_id text;

-- Subscription extras
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS activated_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS activated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payment_notes text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS max_hosts integer;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS max_managers integer;

-- Backfill livepulse_id
UPDATE public.profiles p SET livepulse_id = generate_livepulse_id(
  CASE
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_id=p.id AND role='super_admin') THEN 'A'
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_id=p.id AND role='agency_owner') THEN 'O'
    WHEN EXISTS(SELECT 1 FROM user_roles WHERE user_id=p.id AND role='manager') THEN 'M'
    ELSE 'H'
  END
) WHERE livepulse_id IS NULL;

UPDATE public.agencies SET livepulse_id = generate_livepulse_id('G') WHERE livepulse_id IS NULL;
UPDATE public.managers SET livepulse_id = generate_livepulse_id('M') WHERE livepulse_id IS NULL;
UPDATE public.hosts    SET livepulse_id = generate_livepulse_id('H') WHERE livepulse_id IS NULL;

-- 4. Auto-assign triggers
CREATE OR REPLACE FUNCTION public.set_livepulse_id_agency()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.livepulse_id IS NULL THEN NEW.livepulse_id := generate_livepulse_id('G'); END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_livepulse_id_manager()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.livepulse_id IS NULL THEN NEW.livepulse_id := generate_livepulse_id('M'); END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_livepulse_id_host()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.livepulse_id IS NULL THEN NEW.livepulse_id := generate_livepulse_id('H'); END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_agencies_lpid ON public.agencies;
CREATE TRIGGER trg_agencies_lpid BEFORE INSERT ON public.agencies FOR EACH ROW EXECUTE FUNCTION set_livepulse_id_agency();

DROP TRIGGER IF EXISTS trg_managers_lpid ON public.managers;
CREATE TRIGGER trg_managers_lpid BEFORE INSERT ON public.managers FOR EACH ROW EXECUTE FUNCTION set_livepulse_id_manager();

DROP TRIGGER IF EXISTS trg_hosts_lpid ON public.hosts;
CREATE TRIGGER trg_hosts_lpid BEFORE INSERT ON public.hosts FOR EACH ROW EXECUTE FUNCTION set_livepulse_id_host();

-- 5. Update handle_new_user to populate all data + auto-assign host role for host signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _account_type text := COALESCE(NEW.raw_user_meta_data->>'account_type', 'host');
  _prefix text;
BEGIN
  _prefix := CASE _account_type WHEN 'agency_owner' THEN 'O' WHEN 'manager' THEN 'M' ELSE 'H' END;

  INSERT INTO public.profiles (id, email, name, locale, whatsapp, country, city, platform, platform_user_id, livepulse_id)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'locale','pt-BR'),
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'platform',
    NEW.raw_user_meta_data->>'platform_user_id',
    generate_livepulse_id(_prefix)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-assign host role for free host self-signup (agency_id = NULL)
  IF _account_type = 'host' THEN
    INSERT INTO public.user_roles (user_id, role, agency_id)
    VALUES (NEW.id, 'host', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_monthly numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  max_hosts integer NOT NULL DEFAULT 10,
  max_managers integer NOT NULL DEFAULT 2,
  duration_days integer NOT NULL DEFAULT 30,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO authenticated, anon;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON public.plans FOR SELECT USING (active = true OR is_super_admin());
CREATE POLICY "plans_admin_all" ON public.plans FOR ALL TO authenticated USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO public.plans (slug,name,description,price_monthly,max_hosts,max_managers,duration_days) VALUES
  ('starter','Starter','Para começar sua agência',97,10,2,30),
  ('growth','Growth','Para agências em crescimento',297,50,5,30),
  ('scale','Scale','Para agências consolidadas',597,150,15,30),
  ('enterprise','Enterprise','Sob medida',1497,999,999,30)
ON CONFLICT (slug) DO NOTHING;

-- 7. invitations
CREATE TYPE invitation_status AS ENUM ('pending','accepted','declined','cancelled');

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  host_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  livepulse_id text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  message text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX invitations_unique_pending ON public.invitations(agency_id, host_user_id) WHERE status='pending';
CREATE INDEX idx_invitations_host ON public.invitations(host_user_id, status);
CREATE INDEX idx_invitations_agency ON public.invitations(agency_id, status);

GRANT SELECT, INSERT, UPDATE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inv_agency_read" ON public.invitations FOR SELECT TO authenticated
  USING (agency_id = current_agency_id());
CREATE POLICY "inv_host_read" ON public.invitations FOR SELECT TO authenticated
  USING (host_user_id = auth.uid());
CREATE POLICY "inv_agency_insert" ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (agency_id = current_agency_id() AND (has_role(auth.uid(),'agency_owner') OR has_role(auth.uid(),'manager')));
CREATE POLICY "inv_agency_update" ON public.invitations FOR UPDATE TO authenticated
  USING (agency_id = current_agency_id() AND (has_role(auth.uid(),'agency_owner') OR has_role(auth.uid(),'manager')))
  WITH CHECK (agency_id = current_agency_id());
CREATE POLICY "inv_host_update" ON public.invitations FOR UPDATE TO authenticated
  USING (host_user_id = auth.uid()) WITH CHECK (host_user_id = auth.uid());
CREATE POLICY "inv_super_admin_all" ON public.invitations FOR ALL TO authenticated
  USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE TRIGGER trg_inv_updated BEFORE UPDATE ON public.invitations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 8. Allow authenticated users to search unassigned hosts by livepulse_id (for invites)
CREATE POLICY "profiles_search_free_hosts" ON public.profiles FOR SELECT TO authenticated
  USING (agency_id IS NULL);

-- 9. accept_invitation function
CREATE OR REPLACE FUNCTION public.accept_invitation(_invitation_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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

  UPDATE public.profiles SET agency_id = _inv.agency_id WHERE id = auth.uid();

  INSERT INTO public.hosts (agency_id, user_id, nickname, email, whatsapp, avatar_url, country, city, platform)
  VALUES (
    _inv.agency_id, auth.uid(),
    COALESCE(_profile.name, split_part(_profile.email,'@',1)),
    _profile.email, _profile.whatsapp, _profile.avatar_url,
    _profile.country, _profile.city,
    COALESCE(_profile.platform::host_platform, 'tiktok'::host_platform)
  )
  RETURNING id INTO _host_id;

  INSERT INTO public.user_roles (user_id, role, agency_id)
  VALUES (auth.uid(), 'host', _inv.agency_id)
  ON CONFLICT DO NOTHING;

  UPDATE public.invitations SET status = 'accepted', responded_at = now() WHERE id = _invitation_id;
  RETURN _host_id;
END $$;

GRANT EXECUTE ON FUNCTION public.accept_invitation(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.decline_invitation(_invitation_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  UPDATE public.invitations
    SET status = 'declined', responded_at = now()
    WHERE id = _invitation_id AND host_user_id = auth.uid() AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Convite não encontrado ou já respondido'; END IF;
END $$;
GRANT EXECUTE ON FUNCTION public.decline_invitation(uuid) TO authenticated;

-- 10. confirm_payment (super admin)
CREATE OR REPLACE FUNCTION public.confirm_subscription_payment(_subscription_id uuid, _notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _sub public.subscriptions%ROWTYPE;
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Apenas super admin'; END IF;
  SELECT * INTO _sub FROM public.subscriptions WHERE id = _subscription_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Assinatura não encontrada'; END IF;

  UPDATE public.subscriptions
    SET status = 'active',
        activated_at = now(),
        activated_by = auth.uid(),
        current_period_end = (CURRENT_DATE + INTERVAL '30 days')::date,
        payment_notes = COALESCE(_notes, payment_notes)
    WHERE id = _subscription_id;

  UPDATE public.agencies SET status = 'active' WHERE id = _sub.agency_id;
END $$;
GRANT EXECUTE ON FUNCTION public.confirm_subscription_payment(uuid, text) TO authenticated;
