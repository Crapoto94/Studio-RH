'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react'

interface RemoveLicenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: number
  licenses: string[]
  loading?: boolean
  onConfirm: () => void
}

export function RemoveLicenseModal({ open, onOpenChange, count, licenses, loading = false, onConfirm }: RemoveLicenseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <CreditCard className="text-amber-500" size={20} />
            Retirer les licences de {count} compte{count > 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-amber-700">
              Toutes les licences Microsoft 365 actuellement assignées à ces comptes seront retirées via
              Microsoft Graph. Cette action libère les sièges immédiatement.
            </p>
          </div>

          {licenses.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Licences concernées</label>
              <div className="flex flex-wrap gap-1">
                {licenses.map(l => (
                  <span key={l} className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md text-[10px] font-bold uppercase">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <CreditCard size={16} />}
            Retirer les licences
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
