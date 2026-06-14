-- ============================================================
-- Tighten RLS policies identified in security review
--   - sync_logs: restrict SELECT to admins (freelancers don't need
--     to read raw sync history; messages can contain project names)
-- ============================================================

DROP POLICY IF EXISTS "authenticated_view_logs" ON public.sync_logs;

CREATE POLICY "admins_view_logs" ON public.sync_logs
  FOR SELECT USING (public.is_admin(auth.uid()));
