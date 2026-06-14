-- ============================================================
-- Emotiv Sync becomes the time tracker (replaces Everhour).
-- Projects and time entries are now created IN-APP, not imported.
-- The budget gate (auto-OK until over budget, then justify) is moved
-- into the database so it cannot be bypassed by direct inserts.
-- ============================================================

-- Projects are created in-app: everhour_id is no longer required.
ALTER TABLE public.everhour_projects ALTER COLUMN everhour_id DROP NOT NULL;

-- Timer support: a running timer is a row with timer_started_at set.
ALTER TABLE public.everhour_time_entries
  ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;

-- At most one running timer per user.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_running_timer_per_user
  ON public.everhour_time_entries(user_id)
  WHERE timer_started_at IS NOT NULL;

-- ============================================================
-- RLS: users manage their OWN time entries (the guard trigger
-- restricts WHICH fields/when; admins keep full access via existing policy).
-- ============================================================
DROP POLICY IF EXISTS "freelancers_justify_own" ON public.everhour_time_entries;

CREATE POLICY "users_insert_own_entries" ON public.everhour_time_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_entries" ON public.everhour_time_entries
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users may delete their own entries only while still editable
-- (not admin-decided, not synced to Zoho).
CREATE POLICY "users_delete_own_entries" ON public.everhour_time_entries
  FOR DELETE USING (
    user_id = auth.uid() AND approved_by IS NULL AND synced_at IS NULL
  );

-- ============================================================
-- Budget reconciliation in SQL (SECURITY DEFINER).
-- Flips auto-managed entries between approved <-> needs_justification.
-- Sets a transaction-local flag so the status guard permits these flips.
-- ============================================================
CREATE OR REPLACE FUNCTION public.reconcile_budget_approval(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proj RECORD;
  consumed NUMERIC := 0;
  month_start DATE := date_trunc('month', now())::date;
BEGIN
  SELECT * INTO proj FROM public.everhour_projects WHERE id = p_project_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Mark this transaction as the automatic reconciler so the status guard
  -- permits approved <-> needs_justification flips for non-admins.
  PERFORM set_config('app.reconciling', 'on', true);

  -- No budget => release any gate (everything auto-approved).
  IF proj.budget_type IS NULL OR proj.budget_amount IS NULL THEN
    UPDATE public.everhour_time_entries
       SET status = 'approved'
     WHERE everhour_project_id = p_project_id
       AND approved_by IS NULL AND synced_at IS NULL
       AND status = 'needs_justification';
    RETURN;
  END IF;

  -- Compute consumption (exclude rejected; monthly budgets only count this month).
  IF proj.budget_type = 'money' THEN
    SELECT COALESCE(SUM(CASE WHEN billable THEN hours * COALESCE(proj.hourly_rate, 0) ELSE 0 END), 0)
      INTO consumed
      FROM public.everhour_time_entries
     WHERE everhour_project_id = p_project_id
       AND status <> 'rejected'
       AND (proj.budget_period <> 'monthly' OR logged_date >= month_start);
  ELSE
    SELECT COALESCE(SUM(hours), 0)
      INTO consumed
      FROM public.everhour_time_entries
     WHERE everhour_project_id = p_project_id
       AND status <> 'rejected'
       AND (proj.budget_period <> 'monthly' OR logged_date >= month_start);
  END IF;

  IF consumed >= proj.budget_amount THEN
    -- Over budget: auto-OK hours now need a justification.
    UPDATE public.everhour_time_entries
       SET status = 'needs_justification'
     WHERE everhour_project_id = p_project_id
       AND approved_by IS NULL AND synced_at IS NULL
       AND status = 'approved';
  ELSE
    -- Back within budget: release the gate.
    UPDATE public.everhour_time_entries
       SET status = 'approved'
     WHERE everhour_project_id = p_project_id
       AND approved_by IS NULL AND synced_at IS NULL
       AND status = 'needs_justification';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reconcile_budget_approval(uuid) TO authenticated;

-- ============================================================
-- Auto-reconcile after any content change to an entry, at the DB level,
-- so the budget gate holds regardless of how the row was written.
-- The app.reconciling flag prevents recursion from the reconciler's own UPDATEs.
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_reconcile_after_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('app.reconciling', true) = 'on' THEN
    RETURN NULL; -- the reconciler is running; do not recurse
  END IF;
  IF NEW.everhour_project_id IS NOT NULL THEN
    PERFORM public.reconcile_budget_approval(NEW.everhour_project_id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS auto_reconcile_after_insert ON public.everhour_time_entries;
CREATE TRIGGER auto_reconcile_after_insert
  AFTER INSERT ON public.everhour_time_entries
  FOR EACH ROW EXECUTE FUNCTION public.auto_reconcile_after_entry();

DROP TRIGGER IF EXISTS auto_reconcile_after_update ON public.everhour_time_entries;
CREATE TRIGGER auto_reconcile_after_update
  AFTER UPDATE OF hours, billable, logged_date ON public.everhour_time_entries
  FOR EACH ROW EXECUTE FUNCTION public.auto_reconcile_after_entry();

-- ============================================================
-- Rewrite the status guard: freelancers may freely edit the CONTENT of
-- their own entries while unlocked, but cannot touch approval/sync metadata,
-- and may only change status via the justification flow (or the reconciler).
-- ============================================================
CREATE OR REPLACE FUNCTION public.guard_time_entry_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW; -- admins may do anything
  END IF;

  -- Automatic budget reconciler may flip statuses.
  IF current_setting('app.reconciling', true) = 'on' THEN
    RETURN NEW;
  END IF;

  -- Non-admins can never touch sync/approval metadata.
  IF NEW.approved_by IS DISTINCT FROM OLD.approved_by
     OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
     OR NEW.synced_at IS DISTINCT FROM OLD.synced_at
     OR NEW.zoho_timesheet_id IS DISTINCT FROM OLD.zoho_timesheet_id THEN
    RAISE EXCEPTION 'Not allowed to modify these fields'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Once admin-decided or synced, the entry is locked, except submitting a
  -- justification on an over-budget entry.
  IF OLD.approved_by IS NOT NULL OR OLD.synced_at IS NOT NULL THEN
    IF OLD.status = 'needs_justification' AND NEW.status = 'pending' THEN
      IF NEW.justification IS NULL OR length(btrim(NEW.justification)) = 0 THEN
        RAISE EXCEPTION 'A justification is required' USING ERRCODE = 'check_violation';
      END IF;
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'This entry is locked' USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Not locked: content edits allowed. Status changes restricted to justifying.
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (OLD.status = 'needs_justification' AND NEW.status = 'pending') THEN
      RAISE EXCEPTION 'Freelancers may only submit a justification for over-budget hours'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    IF NEW.justification IS NULL OR length(btrim(NEW.justification)) = 0 THEN
      RAISE EXCEPTION 'A justification is required' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
