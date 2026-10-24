-- Audit trail de acciones de admin
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_view_audit" ON public.audit_log
  FOR SELECT USING (public.is_admin(auth.uid()));
-- Los inserts los hace el service role a través de SECURITY DEFINER o trigger
CREATE POLICY "authenticated_insert_audit" ON public.audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
