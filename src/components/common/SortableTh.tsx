'use client'

import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'

interface SortableThProps {
  label: string
  sortKey: string
  activeKey?: string | null
  dir?: 'asc' | 'desc'
  onSort: (key: string) => void
  className?: string
}

export function SortableTh({ label, sortKey, activeKey, dir, onSort, className = '' }: SortableThProps) {
  const active = activeKey === sortKey

  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 uppercase tracking-widest transition-colors ${
          active ? 'text-indigo-600' : 'hover:text-slate-600'
        }`}
      >
        {label}
        {active ? (
          dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        ) : (
          <ChevronsUpDown size={12} className="opacity-30" />
        )}
      </button>
    </th>
  )
}
