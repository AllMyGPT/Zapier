import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/features/sync/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: settings } = await supabase
    .from('integration_settings')
    .select('*')

  const everhour = settings?.find(s => s.type === 'everhour')
  const zoho = settings?.find(s => s.type === 'zoho')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-0.5">Claves de API para Everhour y Zoho Books</p>
      </div>

      <SettingsForm
        everhourKey={everhour?.api_key ?? ''}
        everhourActive={everhour?.is_active ?? false}
        zohoToken={zoho?.api_key ?? ''}
        zohoOrgId={zoho?.extra_config?.organization_id ?? ''}
        zohoActive={zoho?.is_active ?? false}
      />

      {/* Connection status */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <h2 className="font-semibold text-slate-800 text-sm mb-4">Estado de conexiones</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${everhour?.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
              <span className="text-sm text-slate-700">Everhour</span>
            </div>
            <span className={`text-xs font-medium ${everhour?.is_active ? 'text-green-600' : 'text-slate-400'}`}>
              {everhour?.is_active ? 'Conectado' : 'Sin configurar'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${zoho?.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
              <span className="text-sm text-slate-700">Zoho Books</span>
            </div>
            <span className={`text-xs font-medium ${zoho?.is_active ? 'text-green-600' : 'text-slate-400'}`}>
              {zoho?.is_active ? 'Conectado' : 'Sin configurar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
