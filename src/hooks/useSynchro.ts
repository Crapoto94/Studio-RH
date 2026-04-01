'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SynchroLog } from '@/types'

export const useSynchro = () => {
  const queryClient = useQueryClient()

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['synchro_logs'],
    queryFn: async () => {
      const res = await fetch('/api/synchro/logs')
      if (!res.ok) throw new Error('Failed to fetch logs')
      return res.json() as Promise<SynchroLog[]>
    },
    refetchInterval: 5000 // Poll every 5s while on the page
  })

  const syncMutation = useMutation({
    mutationFn: async (type: 'brut' | 'rh' | 'ad' | 'azure') => {
      const res = await fetch(`/api/synchro/${type}`, { method: 'POST' })
      if (!res.ok) throw new Error('Erreur de synchronisation')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synchro_logs'] })
    }
  })

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/synchro/cancel', { method: 'POST' })
      if (!res.ok) throw new Error('Erreur lors de l\'annulation')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synchro_logs'] })
    }
  })

  // Start sync helper to avoid repeating mutate params
  const startSync = (type: 'brut' | 'rh' | 'ad' | 'azure') => {
    // Optimistic log refresh
    queryClient.invalidateQueries({ queryKey: ['synchro_logs'] })
    syncMutation.mutate(type)
  }

  const activeLog = logs.length > 0 && logs[0].statut === 'en_cours' ? logs[0] : null
  const progress = activeLog ? (activeLog as any).progress || 0 : 0

  return {
    logs,
    loadingLogs,
    isSyncing: syncMutation.isPending || !!activeLog,
    isCancelling: cancelMutation.isPending,
    syncingType: syncMutation.variables || activeLog?.type,
    progress,
    startSync,
    cancelSync: () => cancelMutation.mutate()
  }
}
