
-- 1. Convert enum columns to text for flexible plan slugs and statuses
ALTER TABLE public.subscriptions ALTER COLUMN plan TYPE text USING plan::text;
ALTER TABLE public.agencies ALTER COLUMN plan TYPE text USING plan::text;
ALTER TABLE public.agencies ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE public.subscriptions ALTER COLUMN status TYPE text USING status::text;

-- 2. New plan metadata
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS billing_period text NOT NULL DEFAULT 'monthly';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS total_price numeric NOT NULL DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS savings_label text;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS license_limit integer;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS licenses_used integer NOT NULL DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_period text NOT NULL DEFAULT 'monthly';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS total_price numeric;

-- 3. Reseed plans
DELETE FROM public.plans;
INSERT INTO public.plans (slug, name, description, price_monthly, total_price, billing_period, currency, max_hosts, max_managers, duration_days, active, savings_label, featured, license_limit, sort_order) VALUES
  ('mensal',     'Mensal',            'Para começar sem compromisso.',       147,     147,   'monthly',    'BRL', 50, 10, 30,   true, NULL,                                     false, NULL, 1),
  ('trimestral', 'Trimestral',        'Economize aproximadamente 10%.',      132.33,  397,   'quarterly',  'BRL', 50, 10, 90,   true, 'Economia aproximada de 10%',             false, NULL, 2),
  ('semestral',  'Semestral',         'Economize aproximadamente 15%.',      124.50,  747,   'semiannual', 'BRL', 50, 10, 180,  true, 'Economia aproximada de 15%',             false, NULL, 3),
  ('anual',      'Anual',             'Melhor custo-benefício.',             108.08,  1297,  'annual',     'BRL', 50, 10, 365,  true, 'Economia de R$ 467 vs. mensal',          true,  NULL, 4),
  ('founder',    'Founder Vitalício', 'Licença vitalícia para a V1.',        0,       2497,  'lifetime',   'BRL', 50, 10, 36500,true, 'Oferta Founder — 100 licenças',          false, 100,  5);

-- 4. Any existing pre-approval agencies with 'trial' status become 'pending'
UPDATE public.agencies SET status = 'pending' WHERE status = 'trial';
ALTER TABLE public.agencies ALTER COLUMN status SET DEFAULT 'pending';

-- 5. Recreate handle_new_user so agency signups do NOT auto-receive host role/host row
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
  ) VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'pt-BR'),
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'platform',
    NEW.raw_user_meta_data->>'platform_user_id',
    _livepulse_id, NULL
  ) ON CONFLICT (id) DO NOTHING;

  IF _account_type = 'host' THEN
    INSERT INTO public.user_roles (user_id, role, agency_id)
    VALUES (NEW.id, 'host'::public.app_role, NULL)
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.hosts (
      agency_id, user_id, nickname, email, whatsapp, avatar_url,
      platform, platform_user_id, country, city, status, livepulse_id
    ) VALUES (
      NULL, NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email, NEW.raw_user_meta_data->>'whatsapp', NULL,
      COALESCE((NEW.raw_user_meta_data->>'platform')::public.host_platform, 'tiktok'::public.host_platform),
      NEW.raw_user_meta_data->>'platform_user_id',
      NEW.raw_user_meta_data->>'country', NEW.raw_user_meta_data->>'city',
      'active'::public.host_status, _livepulse_id
    ) ON CONFLICT (user_id) WHERE user_id IS NOT NULL DO NOTHING;
  END IF;

  RETURN NEW;
END $$;

-- 6. confirm_subscription_payment: grant agency_owner + increment founder license counter
CREATE OR REPLACE FUNCTION public.confirm_subscription_payment(_subscription_id uuid, _notes text DEFAULT NULL)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _sub public.subscriptions%ROWTYPE;
  _agency public.agencies%ROWTYPE;
  _duration int;
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Apenas super admin'; END IF;
  SELECT * INTO _sub FROM public.subscriptions WHERE id = _subscription_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Assinatura não encontrada'; END IF;
  SELECT * INTO _agency FROM public.agencies WHERE id = _sub.agency_id;

  SELECT duration_days INTO _duration FROM public.plans WHERE slug = _sub.plan LIMIT 1;
  IF _duration IS NULL THEN _duration := 30; END IF;

  UPDATE public.subscriptions
    SET status = 'active', activated_at = now(), activated_by = auth.uid(),
        current_period_end = (CURRENT_DATE + (_duration || ' days')::interval)::date,
        payment_notes = COALESCE(_notes, payment_notes)
    WHERE id = _subscription_id;

  UPDATE public.agencies SET status = 'active' WHERE id = _sub.agency_id;

  IF _agency.owner_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, agency_id)
    VALUES (_agency.owner_id, 'agency_owner'::public.app_role, _sub.agency_id)
    ON CONFLICT (user_id, role) DO UPDATE SET agency_id = EXCLUDED.agency_id;

    UPDATE public.profiles SET agency_id = _sub.agency_id WHERE id = _agency.owner_id;

    IF _sub.plan = 'founder' THEN
      UPDATE public.plans SET licenses_used = licenses_used + 1 WHERE slug = 'founder';
    END IF;
  END IF;
END $$;

-- 7. Reject payment
CREATE OR REPLACE FUNCTION public.reject_subscription_payment(_subscription_id uuid, _notes text DEFAULT NULL)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _sub public.subscriptions%ROWTYPE;
BEGIN
  IF NOT is_super_admin() THEN RAISE EXCEPTION 'Apenas super admin'; END IF;
  SELECT * INTO _sub FROM public.subscriptions WHERE id = _subscription_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Assinatura não encontrada'; END IF;

  UPDATE public.subscriptions
    SET status = 'cancelled', payment_notes = COALESCE(_notes, payment_notes)
    WHERE id = _subscription_id;
  UPDATE public.agencies SET status = 'cancelled' WHERE id = _sub.agency_id;
END $$;

-- 8. RLS — let the future owner read their own pending agency/subscription (by owner_id) even before role is granted
DROP POLICY IF EXISTS "Owner can read their agency" ON public.agencies;
CREATE POLICY "Owner can read their agency" ON public.agencies FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_super_admin() OR public.is_agency_owner_of(id));

DROP POLICY IF EXISTS "Owner can read their subscription" ON public.subscriptions;
CREATE POLICY "Owner can read their subscription" ON public.subscriptions FOR SELECT TO authenticated
  USING (public.is_super_admin() OR EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = subscriptions.agency_id AND a.owner_id = auth.uid()));

-- 9. Public read of plans (needed for landing/pricing before login)
GRANT SELECT ON public.plans TO anon;
DROP POLICY IF EXISTS "Plans public read" ON public.plans;
CREATE POLICY "Plans public read" ON public.plans FOR SELECT TO anon, authenticated USING (active = true);
