'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  label?: string
  pageSizeOptions?: number[]
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  label = 'éléments',
  pageSizeOptions = [25, 50, 100, 200],
}: PaginationProps) {
  if (total === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-4 border-t border-slate-100 bg-slate-50/30">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>
          Affichage de <strong className="text-slate-700">{start}</strong> à{' '}
          <strong className="text-slate-700">{end}</strong> sur{' '}
          <strong className="text-slate-700">{total}</strong> {label}
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 focus:outline-none focus:border-indigo-400"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} /> Précédent
        </button>
        <div className="px-4 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-lg">
          {page} / {totalPages}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Suivant <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
