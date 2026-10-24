-- ============================================================
-- Budget-gated approval: freelancers are auto-OK until a project
-- exceeds its budget, then hours need a justification + admin approval.
-- ============================================================

-- New status value + justification field
ALTER TABLE public.everhour_time_entries
  DROP CONSTRAINT IF EXISTS everhour_time_entries_status_check;
ALTER TABLE public.everhour_time_entries
  ADD CONSTRAINT everhour_time_entries_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'needs_justification'));

ALTER TABLE public.everhour_time_entries
  ADD COLUMN IF NOT EXISTS justification TEXT;

-- Default is now 'approved' (auto-OK); reconciliation flips over-budget ones.
ALTER TABLE public.everhour_time_entries ALTER COLUMN status SET DEFAULT 'approved';

-- ============================================================
-- Let freelancers update ONLY their own entries...
-- ============================================================
DROP POLICY IF EXISTS "freelancers_justify_own" ON public.everhour_time_entries;
CREATE POLICY "freelancers_justify_own" ON public.everhour_time_entries
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ...but a trigger restricts WHAT a non-admin may change:
-- only the transition needs_justification -> pending (submitting a reason).
CREATE OR REPLACE FUNCTION public.guard_time_entry_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW; -- admins may approve / reject / anything
  END IF;

  -- Non-admins cannot tamper with sync or approval metadata
  IF NEW.approved_by IS DISTINCT FROM OLD.approved_by
     OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
     OR NEW.synced_at IS DISTINCT FROM OLD.synced_at
     OR NEW.zoho_timesheet_id IS DISTINCT FROM OLD.zoho_timesheet_id
     OR NEW.hours IS DISTINCT FROM OLD.hours THEN
    RAISE EXCEPTION 'Not allowed to modify these fields'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- The only status change a non-admin may make is justifying over-budget hours
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (OLD.status = 'needs_justification' AND NEW.status = 'pending') THEN
      RAISE EXCEPTION 'Freelancers may only submit a justification for over-budget hours'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    IF NEW.justification IS NULL OR length(btrim(NEW.justification)) = 0 THEN
      RAISE EXCEPTION 'A justification is required'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_time_entry_status_trigger ON public.everhour_time_entries;
CREATE TRIGGER guard_time_entry_status_trigger
  BEFORE UPDATE ON public.everhour_time_entries
  FOR EACH ROW EXECUTE FUNCTION public.guard_time_entry_status();
