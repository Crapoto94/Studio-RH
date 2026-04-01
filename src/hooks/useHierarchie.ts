'use client'

import { useQuery } from '@tanstack/react-query'

export const useHierarchie = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hierarchie'],
    queryFn: async () => {
      const res = await fetch('/api/hierarchy')
      if (!res.ok) throw new Error('Erreur récupération hiérarchie')
      return res.json()
    }
  })

  return {
    items: data?.items || [],
    levels: data?.levels || [],
    isLoading,
    error,
    refetch
  }
}
