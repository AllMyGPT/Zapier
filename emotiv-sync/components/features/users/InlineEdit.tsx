'use client'

import { useState, useRef } from 'react'
import { Pencil } from 'lucide-react'

interface InlineEditProps {
  value: string | number | null
  onSave: (val: string) => Promise<void>
  type?: 'text' | 'number'
  placeholder?: string
  displayFallback?: string
}

export default function InlineEdit({
  value,
  onSave,
  type = 'text',
  placeholder = '—',
  displayFallback = '—',
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value != null ? String(value) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(value != null ? String(value) : '')
    setError(null)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  async function save() {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      await onSave(draft)
      setEditing(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-0.5">
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={saving}
          className="w-24 px-2 py-1 text-xs border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <button
      onClick={startEdit}
      className="group flex items-center gap-1 text-xs text-slate-700 hover:text-violet-700 transition-colors"
    >
      <span>{value != null && value !== '' ? String(value) : displayFallback}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
    </button>
  )
}
