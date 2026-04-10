'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ShieldOff, Loader2 } from 'lucide-react'

interface IgnoreAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: any
  onSuccess: () => void
}

export function IgnoreAccountModal({ open, onOpenChange, account, onSuccess }: IgnoreAccountModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleIgnore = async () => {
    if (!account) return
    setLoading(true)
    try {
      const res = await fetch('/api/ad/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'ignore', 
          samAccount: account.sam_account,
          reason: reason || 'Compte technique / équipe'
        })
      })
      if (!res.ok) throw new Error('Erreur lors de l\'exclusion')
      onSuccess()
      setReason('')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de l\'action')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <ShieldOff className="text-slate-400" size={20} />
            Exclure le compte de l'analyse
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Compte AD ciblé</div>
            <div className="font-bold text-slate-700">{account?.display_name}</div>
            <div className="text-xs text-slate-400 font-mono tracking-tight">{account?.sam_account}</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Raison de l'exclusion</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ex: Compte de service SAP, Compte d'équipe DSI, Utilisateur technique..."
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
            onClick={handleIgnore}
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
