'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ShieldOff, Loader2 } from 'lucide-react'

interface BulkIgnoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  loading?: boolean
  onConfirm: (reason: string) => void
}

export function BulkIgnoreModal({ open, onOpenChange, count, loading = false, onConfirm }: BulkIgnoreModalProps) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) setReason('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <ShieldOff className="text-slate-400" size={20} />
            Exclure {count} compte{count > 1 ? 's' : ''} de l'analyse
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-500">
            La même raison sera appliquée à l'ensemble de la sélection.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Raison globale de l'exclusion</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ex: Comptes de service SAP, comptes d'équipe DSI, comptes techniques..."
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 min-h-[100px] resize-none"
            />
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
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldOff size={16} />}
            Confirmer l'exclusion
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
