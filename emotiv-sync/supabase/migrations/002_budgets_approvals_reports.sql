-- ============================================================
-- Everhour power features: budgets, approvals, profitability
-- ============================================================

-- --- Budgets + cost rate on projects ---
ALTER TABLE public.everhour_projects
  ADD COLUMN IF NOT EXISTS budget_type TEXT CHECK (budget_type IN ('money', 'hours')),
  ADD COLUMN IF NOT EXISTS budget_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS budget_period TEXT DEFAULT 'overall' CHECK (budget_period IN ('overall', 'monthly')),
  ADD COLUMN IF NOT EXISTS budget_recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS disallow_overbudget BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cost_rate NUMERIC(10,2);

-- --- Approval workflow + billable flag on time entries ---
ALTER TABLE public.everhour_time_entries
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS billable BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_everhour_time_entries_status
  ON public.everhour_time_entries(status);

-- --- Capacity + cost rate on users (for utilization & profitability) ---
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS weekly_capacity_hours NUMERIC(5,2) DEFAULT 40,
  ADD COLUMN IF NOT EXISTS cost_rate NUMERIC(10,2);

-- ============================================================
-- Guard: an entry can only be pushed to Zoho once it is approved.
-- ============================================================
CREATE OR REPLACE FUNCTION public.guard_sync_requires_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.zoho_timesheet_id IS NOT NULL
     AND OLD.zoho_timesheet_id IS NULL
     AND NEW.status <> 'approved' THEN
    RAISE EXCEPTION 'Cannot sync a time entry that is not approved'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_sync_requires_approval_trigger ON public.everhour_time_entries;
CREATE TRIGGER guard_sync_requires_approval_trigger
  BEFORE UPDATE ON public.everhour_time_entries
  FOR EACH ROW EXECUTE FUNCTION public.guard_sync_requires_approval();
