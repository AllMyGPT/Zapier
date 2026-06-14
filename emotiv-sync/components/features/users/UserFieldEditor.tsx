'use client'

import { useRouter } from 'next/navigation'
import InlineEdit from './InlineEdit'

interface UserFieldEditorProps {
  userId: string
  field: 'weekly_capacity_hours' | 'cost_rate' | 'everhour_user_id'
  value: string | number | null
  type?: 'text' | 'number'
}

export default function UserFieldEditor({ userId, field, value, type = 'text' }: UserFieldEditorProps) {
  const router = useRouter()

  async function handleSave(raw: string) {
    const payload: Record<string, string | number | null> = {}
    if (type === 'number') {
      const num = raw === '' ? null : Number(raw)
      if (raw !== '' && isNaN(num as number)) throw new Error('Valor numérico inválido')
      payload[field] = num
    } else {
      payload[field] = raw === '' ? null : raw
    }

    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error(d.error ?? 'Error al guardar')
    }
    router.refresh()
  }

  return (
    <InlineEdit
      value={value}
      onSave={handleSave}
      type={type}
      placeholder="—"
      displayFallback="—"
    />
  )
}
