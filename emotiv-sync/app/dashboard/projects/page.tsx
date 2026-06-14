import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { FolderKanban, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import SyncProjectsButton from '@/components/features/projects/SyncProjectsButton'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: projects } = await supabase
    .from('everhour_projects')
    .select('*')
    .order('name')

  const total = projects?.length ?? 0
  const synced = projects?.filter(p => p.zoho_project_id).length ?? 0
  const pending = total - synced

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Proyectos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} proyectos · {synced} en Zoho</p>
        </div>
        {isAdmin && <SyncProjectsButton />}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-slate-900">{total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-green-600">{synced}</p>
          <p className="text-xs text-slate-500">Sync</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-amber-600">{pending}</p>
          <p className="text-xs text-slate-500">Pendientes</p>
        </div>
      </div>

      {/* Projects list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {(projects ?? []).length === 0 ? (
          <div className="p-10 text-center">
            <FolderKanban className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No hay proyectos aún.</p>
            {isAdmin && <p className="text-slate-400 text-xs mt-1">Usa "Importar de Everhour" para comenzar.</p>}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {(projects ?? []).map((project) => (
              <div key={project.id} className="p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  project.zoho_project_id ? 'bg-green-50' : 'bg-amber-50'
                }`}>
                  {project.zoho_project_id
                    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                    : <AlertCircle className="w-5 h-5 text-amber-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{project.name}</p>
                  {project.client_name && (
                    <p className="text-xs text-slate-500 mt-0.5">{project.client_name}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      project.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {project.status === 'active' ? 'Activo' : 'Archivado'}
                    </span>
                    {project.billable && (
                      <span className="text-xs text-violet-600 font-medium">Facturable</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {project.zoho_project_id ? (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Zoho</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600">Sin Zoho ID</span>
                  )}
                  {project.last_synced_at && (
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateTime(project.last_synced_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
