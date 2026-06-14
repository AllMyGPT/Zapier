import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { Users, Shield, User } from 'lucide-react'
import ChangeRoleButton from '@/components/features/users/ChangeRoleButton'
import CreateUserForm from '@/components/features/users/CreateUserForm'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">{(users ?? []).length} usuarios registrados</p>
        </div>
        <CreateUserForm />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {(users ?? []).length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {(users ?? []).map((u) => (
              <div key={u.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-700 text-sm font-bold uppercase">
                    {(u.full_name || u.email)[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {u.full_name || u.email}
                  </p>
                  {u.full_name && (
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    Desde {formatDateTime(u.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === 'admin'
                      ? 'bg-violet-50 text-violet-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role === 'admin'
                      ? <Shield className="w-3 h-3" />
                      : <User className="w-3 h-3" />
                    }
                    {u.role === 'admin' ? 'Admin' : 'Freelancer'}
                  </div>
                  {u.id !== user!.id && (
                    <ChangeRoleButton userId={u.id} currentRole={u.role} />
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
