-- ============================================================
-- Emotiv Sync: Everhour <-> Zoho Books
-- ============================================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'freelancer' CHECK (role IN ('admin', 'freelancer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Everhour projects cache
CREATE TABLE IF NOT EXISTS public.everhour_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  everhour_id TEXT NOT NULL UNIQUE,
  zoho_project_id TEXT,
  zoho_customer_id TEXT,
  name TEXT NOT NULL,
  client_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending_sync')),
  billable BOOLEAN NOT NULL DEFAULT false,
  hourly_rate NUMERIC(10,2),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time entries cache
CREATE TABLE IF NOT EXISTS public.everhour_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  everhour_id TEXT UNIQUE,
  everhour_project_id UUID REFERENCES public.everhour_projects(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  everhour_user_id TEXT,
  hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  logged_date DATE NOT NULL,
  description TEXT,
  zoho_timesheet_id TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sync operation logs
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('projects', 'time_entries')),
  direction TEXT NOT NULL DEFAULT 'everhour_to_zoho',
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  message TEXT,
  records_processed INT NOT NULL DEFAULT 0,
  records_failed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Integration API credentials (admin only)
CREATE TABLE IF NOT EXISTS public.integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE CHECK (type IN ('everhour', 'zoho')),
  api_key TEXT,
  extra_config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_everhour_time_entries_user_id ON public.everhour_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_everhour_time_entries_date ON public.everhour_time_entries(logged_date);
CREATE INDEX IF NOT EXISTS idx_everhour_time_entries_synced ON public.everhour_time_entries(synced_at);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.everhour_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.everhour_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- user_profiles: users see their own, admins see all
CREATE POLICY "users_own_profile" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admins_update_any_profile" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- everhour_projects: all authenticated users can view
CREATE POLICY "authenticated_view_projects" ON public.everhour_projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admins_manage_projects" ON public.everhour_projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- time_entries: admins see all, freelancers see own
CREATE POLICY "freelancers_own_entries" ON public.everhour_time_entries
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "admins_manage_entries" ON public.everhour_time_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- sync_logs: all authenticated users can view
CREATE POLICY "authenticated_view_logs" ON public.sync_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "admins_insert_logs" ON public.sync_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- integration_settings: admin only
CREATE POLICY "admins_manage_settings" ON public.integration_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  admin_count INT;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.user_profiles WHERE role = 'admin';

  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN admin_count = 0 THEN 'admin' ELSE 'freelancer' END
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
