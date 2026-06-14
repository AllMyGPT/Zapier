import type { SupabaseClient } from '@supabase/supabase-js'
import { computeBudgetStatus } from './budgets'

/**
 * Budget-gated approval reconciliation.
 *
 * Freelancers are auto-OK ('approved') as long as a project stays within
 * budget. Once a project exceeds its budget, the auto-managed (not yet
 * admin-decided, not yet synced) entries flip to 'needs_justification' so the
 * freelancer must justify them before an admin approves.
 *
 * Only touches "auto-managed" rows: approved_by IS NULL and synced_at IS NULL.
 * Admin decisions, rejections and already-synced rows are never altered. Rows
 * already 'pending' (justification submitted) are left for the admin.
 */
export async function reconcileBudgetApproval(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  projectIds: string[]
): Promise<void> {
  const unique = Array.from(new Set(projectIds))

  for (const pid of unique) {
    const { data: project } = await supabase
      .from('everhour_projects')
      .select('*')
      .eq('id', pid)
      .single()

    if (!project) continue

    // No budget defined → freelancers are always OK on this project.
    if (!project.budget_type) {
      await supabase
        .from('everhour_time_entries')
        .update({ status: 'approved' })
        .eq('everhour_project_id', pid)
        .is('approved_by', null)
        .is('synced_at', null)
        .eq('status', 'needs_justification')
      continue
    }

    const { data: entries } = await supabase
      .from('everhour_time_entries')
      .select('hours, logged_date, billable')
      .eq('everhour_project_id', pid)
      .neq('status', 'rejected')

    const status = computeBudgetStatus(project, entries ?? [])

    if (status.level === 'over') {
      // Over budget → auto-approved hours now need a justification.
      await supabase
        .from('everhour_time_entries')
        .update({ status: 'needs_justification' })
        .eq('everhour_project_id', pid)
        .is('approved_by', null)
        .is('synced_at', null)
        .eq('status', 'approved')
    } else {
      // Back within budget → release the gate again.
      await supabase
        .from('everhour_time_entries')
        .update({ status: 'approved' })
        .eq('everhour_project_id', pid)
        .is('approved_by', null)
        .is('synced_at', null)
        .eq('status', 'needs_justification')
    }
  }
}
