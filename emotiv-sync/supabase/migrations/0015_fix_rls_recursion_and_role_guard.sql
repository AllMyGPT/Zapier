-- ============================================================
-- Security fixes (from Codex review on PR #8)
--   1. Avoid recursive RLS on user_profiles via SECURITY DEFINER helper
--   2. Prevent freelancers from self-promoting to admin
-- ============================================================

-- --- 1. Non-recursive admin check ---
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = uid AND role = 'admin'
  );
$$;

-- --- Recreate user_profiles policies without self-reference ---
DROP POLICY IF EXISTS "users_own_profile"         ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile"  ON public.user_profiles;
DROP POLICY IF EXISTS "admins_update_any_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile"  ON public.user_profiles;

CREATE POLICY "profiles_select" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "profiles_insert" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- --- 2. Block role self-promotion ---
CREATE OR REPLACE FUNCTION public.prevent_role_self_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only admins can change user roles'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_self_promotion_trigger ON public.user_profiles;
CREATE TRIGGER prevent_role_self_promotion_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_promotion();

-- --- Switch remaining policies to the non-recursive helper ---
DROP POLICY IF EXISTS "admins_manage_projects"  ON public.everhour_projects;
DROP POLICY IF EXISTS "admins_manage_entries"   ON public.everhour_time_entries;
DROP POLICY IF EXISTS "freelancers_own_entries" ON public.everhour_time_entries;
DROP POLICY IF EXISTS "admins_insert_logs"      ON public.sync_logs;
DROP POLICY IF EXISTS "admins_manage_settings"  ON public.integration_settings;

CREATE POLICY "admins_manage_projects" ON public.everhour_projects
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "entries_select" ON public.everhour_time_entries
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "admins_manage_entries" ON public.everhour_time_entries
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "admins_insert_logs" ON public.sync_logs
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admins_manage_settings" ON public.integration_settings
  FOR ALL USING (public.is_admin(auth.uid()));
