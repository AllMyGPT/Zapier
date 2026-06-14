'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateProjectModal from './CreateProjectModal'

export default function CreateProjectButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nuevo proyecto</span>
      </button>
      {open && <CreateProjectModal onClose={() => setOpen(false)} />}
    </>
  )
}
