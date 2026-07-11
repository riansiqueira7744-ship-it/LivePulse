
-- =========================================================================
-- ENUMS
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'agency_owner', 'manager', 'host');
CREATE TYPE public.agency_status AS ENUM ('active', 'trial', 'suspended', 'cancelled');
CREATE TYPE public.agency_plan AS ENUM ('starter', 'growth', 'scale', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'trial', 'suspended', 'cancelled', 'past_due');
CREATE TYPE public.host_platform AS ENUM ('tiktok', 'kwai', 'bigo', 'other');
CREATE TYPE public.host_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE public.goal_period AS ENUM ('weekly', 'monthly', 'quarterly');
CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'failed', 'cancelled');
CREATE TYPE public.transaction_type AS ENUM ('revenue', 'payout', 'commission', 'refund', 'adjustment');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'confirmed', 'paid', 'failed');
CREATE TYPE public.notification_type AS ENUM ('info', 'success', 'warning', 'danger');

-- =========================================================================
-- UPDATED_AT TRIGGER
-- =========================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- =========================================================================
-- AGENCIES
-- =========================================================================
CREATE TABLE public.agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  country text,
  city text,
  plan public.agency_plan NOT NULL DEFAULT 'starter',
  status public.agency_status NOT NULL DEFAULT 'trial',
  mrr numeric(12,2) NOT NULL DEFAULT 0,
  hosts_count int NOT NULL DEFAULT 0,
  managers_count int NOT NULL DEFAULT 0,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agencies TO authenticated;
GRANT ALL ON public.agencies TO service_role;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_agencies_updated BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  email text,
  name text,
  avatar_url text,
  whatsapp text,
  country text,
  city text,
  locale text NOT NULL DEFAULT 'pt-BR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- USER ROLES (separate table, security-critical)
-- =========================================================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, agency_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- SECURITY DEFINER HELPERS
-- =========================================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.current_agency_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT agency_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
$$;

CREATE OR REPLACE FUNCTION public.is_agency_owner_of(_agency_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'agency_owner'
      AND p.agency_id = _agency_id
  )
$$;

-- =========================================================================
-- HANDLE NEW USER — create profile automatically
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, locale)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'pt-BR')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- MANAGERS
-- =========================================================================
CREATE TABLE public.managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  whatsapp text,
  avatar_url text,
  team_size int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.managers TO authenticated;
GRANT ALL ON public.managers TO service_role;
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_managers_updated BEFORE UPDATE ON public.managers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_managers_agency ON public.managers(agency_id);
CREATE INDEX idx_managers_user ON public.managers(user_id);

-- =========================================================================
-- HOSTS
-- =========================================================================
CREATE TABLE public.hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  manager_id uuid REFERENCES public.managers(id) ON DELETE SET NULL,
  nickname text NOT NULL,
  email text,
  whatsapp text,
  avatar_url text,
  platform public.host_platform NOT NULL DEFAULT 'tiktok',
  category text,
  country text,
  city text,
  status public.host_status NOT NULL DEFAULT 'active',
  live_hours numeric(10,2) NOT NULL DEFAULT 0,
  gifts_total numeric(14,2) NOT NULL DEFAULT 0,
  earnings_total numeric(14,2) NOT NULL DEFAULT 0,
  score int NOT NULL DEFAULT 0,
  joined_at date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hosts TO authenticated;
GRANT ALL ON public.hosts TO service_role;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_hosts_updated BEFORE UPDATE ON public.hosts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_hosts_agency ON public.hosts(agency_id);
CREATE INDEX idx_hosts_manager ON public.hosts(manager_id);
CREATE INDEX idx_hosts_user ON public.hosts(user_id);

-- =========================================================================
-- GOALS
-- =========================================================================
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  host_id uuid REFERENCES public.hosts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  period public.goal_period NOT NULL DEFAULT 'monthly',
  target numeric(14,2) NOT NULL,
  progress numeric(14,2) NOT NULL DEFAULT 0,
  status public.goal_status NOT NULL DEFAULT 'active',
  starts_at date NOT NULL DEFAULT CURRENT_DATE,
  ends_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_goals_updated BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_goals_agency ON public.goals(agency_id);
CREATE INDEX idx_goals_host ON public.goals(host_id);

-- =========================================================================
-- SUBSCRIPTIONS
-- =========================================================================
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL UNIQUE REFERENCES public.agencies(id) ON DELETE CASCADE,
  plan public.agency_plan NOT NULL DEFAULT 'starter',
  status public.subscription_status NOT NULL DEFAULT 'trial',
  price_monthly numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  seats int NOT NULL DEFAULT 0,
  trial_ends_at date,
  current_period_end date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- FINANCIAL TRANSACTIONS
-- =========================================================================
CREATE TABLE public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  host_id uuid REFERENCES public.hosts(id) ON DELETE SET NULL,
  manager_id uuid REFERENCES public.managers(id) ON DELETE SET NULL,
  type public.transaction_type NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  description text,
  reference text,
  occurred_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_transactions TO authenticated;
GRANT ALL ON public.financial_transactions TO service_role;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_ft_updated BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_ft_agency ON public.financial_transactions(agency_id);
CREATE INDEX idx_ft_host ON public.financial_transactions(host_id);
CREATE INDEX idx_ft_date ON public.financial_transactions(occurred_at);

-- =========================================================================
-- COMMISSIONS
-- =========================================================================
CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  host_id uuid REFERENCES public.hosts(id) ON DELETE CASCADE,
  manager_id uuid REFERENCES public.managers(id) ON DELETE SET NULL,
  percentage numeric(5,2) NOT NULL,
  base text NOT NULL DEFAULT 'gross',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_com_updated BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_commissions_agency ON public.commissions(agency_id);

-- =========================================================================
-- RANKINGS
-- =========================================================================
CREATE TABLE public.rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
  period public.goal_period NOT NULL DEFAULT 'monthly',
  period_start date NOT NULL,
  position int NOT NULL,
  score numeric(14,2) NOT NULL DEFAULT 0,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, host_id, period, period_start, category)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rankings TO authenticated;
GRANT ALL ON public.rankings TO service_role;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_rankings_agency_period ON public.rankings(agency_id, period, period_start);

-- =========================================================================
-- NOTIFICATIONS
-- =========================================================================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);

-- =========================================================================
-- RLS POLICIES
-- =========================================================================

-- AGENCIES
CREATE POLICY "agencies_super_admin_all" ON public.agencies FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "agencies_member_read" ON public.agencies FOR SELECT TO authenticated
  USING (id = public.current_agency_id());
CREATE POLICY "agencies_owner_update" ON public.agencies FOR UPDATE TO authenticated
  USING (id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'))
  WITH CHECK (id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));

-- PROFILES
CREATE POLICY "profiles_super_admin_all" ON public.profiles FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "profiles_self_read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "profiles_same_agency_read" ON public.profiles FOR SELECT TO authenticated
  USING (agency_id IS NOT NULL AND agency_id = public.current_agency_id());
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- USER_ROLES
CREATE POLICY "user_roles_super_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "user_roles_owner_manage" ON public.user_roles FOR ALL TO authenticated
  USING (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'))
  WITH CHECK (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner') AND role <> 'super_admin');

-- MANAGERS
CREATE POLICY "managers_super_admin_all" ON public.managers FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "managers_agency_read" ON public.managers FOR SELECT TO authenticated
  USING (agency_id = public.current_agency_id());
CREATE POLICY "managers_owner_write" ON public.managers FOR ALL TO authenticated
  USING (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'))
  WITH CHECK (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));

-- HOSTS
CREATE POLICY "hosts_super_admin_all" ON public.hosts FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "hosts_owner_all" ON public.hosts FOR ALL TO authenticated
  USING (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'))
  WITH CHECK (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));
CREATE POLICY "hosts_manager_read_team" ON public.hosts FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager')
    AND agency_id = public.current_agency_id()
    AND manager_id IN (SELECT id FROM public.managers WHERE user_id = auth.uid())
  );
CREATE POLICY "hosts_manager_update_team" ON public.hosts FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager')
    AND agency_id = public.current_agency_id()
    AND manager_id IN (SELECT id FROM public.managers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'manager')
    AND agency_id = public.current_agency_id()
    AND manager_id IN (SELECT id FROM public.managers WHERE user_id = auth.uid())
  );
CREATE POLICY "hosts_self_read" ON public.hosts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'host') AND user_id = auth.uid());
CREATE POLICY "hosts_self_update" ON public.hosts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'host') AND user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'host') AND user_id = auth.uid());

-- GOALS
CREATE POLICY "goals_super_admin_all" ON public.goals FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "goals_owner_all" ON public.goals FOR ALL TO authenticated
  USING (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'))
  WITH CHECK (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));
CREATE POLICY "goals_manager_team_read" ON public.goals FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'manager')
    AND agency_id = public.current_agency_id()
    AND (host_id IS NULL OR host_id IN (
      SELECT h.id FROM public.hosts h
      JOIN public.managers m ON m.id = h.manager_id
      WHERE m.user_id = auth.uid()
    ))
  );
CREATE POLICY "goals_host_self_read" ON public.goals FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'host')
    AND host_id IN (SELECT id FROM public.hosts WHERE user_id = auth.uid())
  );

-- SUBSCRIPTIONS — never visible to manager/host
CREATE POLICY "subs_super_admin_all" ON public.subscriptions FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "subs_owner_read" ON public.subscriptions FOR SELECT TO authenticated
  USING (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));

-- FINANCIAL TRANSACTIONS — never visible to manager/host
CREATE POLICY "ft_super_admin_all" ON public.financial_transactions FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "ft_owner_all" ON public.financial_transactions FOR ALL TO authenticated
  USING (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'))
  WITH CHECK (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));

-- COMMISSIONS — never visible to manager/host
CREATE POLICY "commissions_super_admin_all" ON public.commissions FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "commissions_owner_all" ON public.commissions FOR ALL TO authenticated
  USING (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'))
  WITH CHECK (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));

-- RANKINGS
CREATE POLICY "rankings_super_admin_all" ON public.rankings FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "rankings_agency_read" ON public.rankings FOR SELECT TO authenticated
  USING (agency_id = public.current_agency_id());
CREATE POLICY "rankings_owner_write" ON public.rankings FOR INSERT TO authenticated
  WITH CHECK (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));
CREATE POLICY "rankings_owner_update" ON public.rankings FOR UPDATE TO authenticated
  USING (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));
CREATE POLICY "rankings_owner_delete" ON public.rankings FOR DELETE TO authenticated
  USING (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));

-- NOTIFICATIONS
CREATE POLICY "notif_super_admin_all" ON public.notifications FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "notif_self_read" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "notif_self_update" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_owner_insert" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (agency_id = public.current_agency_id() AND public.has_role(auth.uid(), 'agency_owner'));
