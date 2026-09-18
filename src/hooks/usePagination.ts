'use client'

import { useState, useMemo, useEffect } from 'react'

/**
 * Pagination cliente : le filtrage doit être fait sur la liste complète en amont,
 * puis on découpe le résultat en pages (50 par défaut).
 */
export function usePagination<T>(items: T[], initialPageSize = 50) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Repart en page 1 dès que le filtre (donc le total) ou la taille de page change
  useEffect(() => {
    setPage(1)
  }, [total, pageSize])

  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  )

  return { page, setPage, pageSize, setPageSize, total, totalPages, paginatedItems }
}
