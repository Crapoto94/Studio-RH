'use client'

import { useMemo, useRef, useState } from 'react'
import { parseDate } from '@/lib/utils'

export type SortDir = 'asc' | 'desc'
export type SortType = 'string' | 'date' | 'boolean' | 'number'

export interface SortColumn<T> {
  get: (item: T) => any
  type?: SortType
  defaultDir?: SortDir
}

function normalize(raw: any, type: SortType): number | string | null {
  if (raw === null || raw === undefined || raw === '') return null
  switch (type) {
    case 'date': {
      const d = parseDate(raw)
      return d ? d.getTime() : null
    }
    case 'number':
      return Number.isNaN(Number(raw)) ? null : Number(raw)
    case 'boolean':
      return raw ? 1 : 0
    default:
      return String(raw).toLowerCase()
  }
}

/**
 * Tri générique des tableaux de la Gestion AD. Les colonnes sont décrites via
 * un mapping { clé -> accesseur + type }, ce qui permet de trier aussi bien des
 * dates (format AD, ISO ou FR) que des noms ou des booléens.
 */
export function useSortable<T>(items: T[], columns: Record<string, SortColumn<T>>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(columnsRef.current[key]?.defaultDir || 'asc')
    }
  }

  const sorted = useMemo(() => {
    const col = sortKey ? columnsRef.current[sortKey] : null
    if (!col) return items

    const type = col.type || 'string'
    return [...items].sort((a, b) => {
      const av = normalize(col.get(a), type)
      const bv = normalize(col.get(b), type)
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [items, sortKey, sortDir])

  return { sorted, sortKey, sortDir, toggleSort }
}
