'use client'

import { useState, useCallback, useEffect } from 'react'
import { Agent, PaginatedResponse } from '@/types'

// Simple debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

// Custom hook without @tanstack/react-query for simplicity, or we can use SWR/fetch directly easily.
// Since we want to respect the user's GEMINI.md, I'll use traditional fetch with a query state,
// or I can implement it just fetching in useEffect to avoid adding the missing query library.
// But wait, the user's instructions specifically mention:
// import { useQuery } from '@tanstack/react-query'
// I'll provide the react-query version, assuming my concurrent npm install succeeds.
// (In this file I just put the code; the install runs in parallel)

import { useQuery } from '@tanstack/react-query'

export const useAgents = (initialFilters: Record<string, any> = { 
  page: 1, 
  limit: 25, 
  search: '', 
  direction: '', 
  service: '', 
  statut: '',
  position: '',
  dateArriveeMin: '',
  dateArriveeMax: '',
  dateDepartMin: '',
  dateDepartMax: '',
  multiAdOnly: '',
  noAzureOnly: ''
}) => {
  const [filters, setFilters] = useState(initialFilters)
  const debouncedSearch = useDebounce(filters.search, 300)

  // the query key uses the debounced search to avoid fetching on every keystroke
  const activeFilters: Record<string, any> = { ...filters, search: debouncedSearch }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['agents', activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', activeFilters.page.toString())
      params.append('limit', activeFilters.limit.toString())
      if (activeFilters.search) params.append('search', activeFilters.search)
      if (activeFilters.direction) params.append('direction', activeFilters.direction)
      if (activeFilters.service) params.append('service', activeFilters.service)
      if (activeFilters.statut) params.append('statut', activeFilters.statut)
      if (activeFilters.position) params.append('position', activeFilters.position)
      if (activeFilters.dateArriveeMin) params.append('dateArriveeMin', activeFilters.dateArriveeMin)
      if (activeFilters.dateArriveeMax) params.append('dateArriveeMax', activeFilters.dateArriveeMax)
      if (activeFilters.dateDepartMin) params.append('dateDepartMin', activeFilters.dateDepartMin)
      if (activeFilters.dateDepartMax) params.append('dateDepartMax', activeFilters.dateDepartMax)
      if (activeFilters.multiAdOnly) params.append('multiAdOnly', activeFilters.multiAdOnly)
      if (activeFilters.noAzureOnly) params.append('noAzureOnly', activeFilters.noAzureOnly)
        
      const res = await fetch(`/api/agents?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<PaginatedResponse<Agent>>
    }
  })

  const handleSearchChange = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  const setFilter = useCallback((name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
  }, [])

  return {
    agents: data?.data || [],
    count: data?.count || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    loading: isLoading,
    error,
    refetch,
    filters,
    handleSearchChange,
    handlePageChange,
    setFilter,
    resetFilters: () => setFilters(initialFilters)
  }
}
