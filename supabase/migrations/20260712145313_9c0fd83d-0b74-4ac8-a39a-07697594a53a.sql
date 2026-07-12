
-- 1) Grant Data API privileges on every public base table.
DO $$
DECLARE tbl record;
BEGIN
  FOR tbl IN SELECT c.relname AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND n.nspname='public'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.n);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.n);
  END LOOP;
END $$;

-- Public read on plans (policy already restricts to active=true OR super_admin).
GRANT SELECT ON public.plans TO anon;

-- Also grant usage/select on sequences to authenticated (for any serial defaults).
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 2) Allow the signing-up owner to insert their own agency and subscription.
DROP POLICY IF EXISTS agencies_owner_insert ON public.agencies;
CREATE POLICY agencies_owner_insert ON public.agencies
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS subs_owner_insert ON public.subscriptions;
CREATE POLICY subs_owner_insert ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'awaiting_payment'
    AND EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = subscriptions.agency_id AND a.owner_id = auth.uid())
  );

-- Allow the owner to link their own profile.agency_id right after creating the agency.
-- profiles_self_update already exists (USING id = auth.uid()).

-- 3) Backfill orphan "teste" agency-owner signup that never got agency/subscription.
DO $$
DECLARE
  u_id uuid;
  u_email text;
  u_name text;
  a_id uuid;
  has_agency boolean;
BEGIN
  FOR u_id, u_email, u_name IN
    SELECT p.id, p.email, p.name FROM public.profiles p
    WHERE p.livepulse_id LIKE 'LP-O-%'
      AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id)
  LOOP
    SELECT EXISTS (SELECT 1 FROM public.agencies WHERE owner_id = u_id) INTO has_agency;
    IF NOT has_agency THEN
      INSERT INTO public.agencies (name, slug, status, plan, owner_id)
      VALUES (
        COALESCE(NULLIF(u_name, ''), split_part(u_email, '@', 1)),
        lower(regexp_replace(COALESCE(NULLIF(u_name, ''), split_part(u_email, '@', 1)), '[^a-z0-9]+', '-', 'g')) || '-' || substr(u_id::text, 1, 6),
        'pending',
        'mensal',
        u_id
      )
      RETURNING id INTO a_id;

      UPDATE public.profiles SET agency_id = a_id WHERE id = u_id;

      INSERT INTO public.subscriptions (agency_id, plan, status, billing_period, price_monthly, total_price, seats, max_hosts, max_managers)
      SELECT a_id, 'mensal', 'awaiting_payment', 'monthly', price_monthly, total_price, max_hosts, max_hosts, max_managers
      FROM public.plans WHERE slug = 'mensal' LIMIT 1;
    END IF;
  END LOOP;
END $$;
