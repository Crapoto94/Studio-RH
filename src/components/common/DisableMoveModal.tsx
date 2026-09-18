'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { UserX, Loader2, FolderTree } from 'lucide-react'

interface DisableMoveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  loading?: boolean
  onConfirm: (targetOu: string) => void
}

export function DisableMoveModal({ open, onOpenChange, count, loading = false, onConfirm }: DisableMoveModalProps) {
  const [ous, setOus] = useState<{ dn: string; name: string }[]>([])
  const [targetOu, setTargetOu] = useState('')
  const [loadingOus, setLoadingOus] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setTargetOu('')
    setError('')
    setLoadingOus(true)
    fetch('/api/ad/ous')
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Erreur de chargement des OU')
        setOus(Array.isArray(data.ous) ? data.ous : [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingOus(false))
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <UserX className="text-rose-500" size={20} />
            Désactiver et déplacer {count} compte{count > 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-500">
            Les comptes sélectionnés seront <strong>désactivés</strong> puis <strong>déplacés</strong> dans
            l'unité d'organisation choisie.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <FolderTree size={14} className="text-slate-400" />
              OU de destination
            </label>
            {loadingOus ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                <Loader2 className="animate-spin" size={16} /> Chargement des OU...
              </div>
            ) : (
              <select
                value={targetOu}
                onChange={e => setTargetOu(e.target.value)}
                className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/20 bg-white"
              >
                <option value="">— Sélectionner une OU —</option>
                {ous.map(ou => (
                  <option key={ou.dn} value={ou.dn}>{ou.dn}</option>
                ))}
              </select>
            )}
            {error && <p className="text-xs text-rose-500">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(targetOu)}
            disabled={loading || !targetOu}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <UserX size={16} />}
            Désactiver et déplacer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
