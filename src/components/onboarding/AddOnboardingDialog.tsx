'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, UserCircle, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatPrenom } from '@/lib/utils'

interface AddOnboardingDialogProps {
  agent: any | null
  onClose: () => void
}

export function AddOnboardingDialog({ agent, onClose }: AddOnboardingDialogProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedManager, setSelectedManager] = useState<any | null>(null)
  const [nomTemp, setNomTemp] = useState('')
  const [prenomTemp, setPrenomTemp] = useState('')
  const [directionTemp, setDirectionTemp] = useState('')
  const [serviceTemp, setServiceTemp] = useState('')
  const [posteTemp, setPosteTemp] = useState('')

  const isManual = agent === 'manual' || (typeof agent === 'string' && agent.toLowerCase() === 'manual')

  useEffect(() => {
    if (agent) {
      setSearch('')
      setSelectedManager(null)
      setNomTemp('')
      setPrenomTemp('')
      setDirectionTemp(isManual ? '' : (agent?.nom_direction || ''))
      setServiceTemp(isManual ? '' : (agent?.nom_service || ''))
      setPosteTemp(isManual ? '' : (agent?.poste_l || agent?.position_l || ''))
    }
  }, [agent])

  // Fetch managers
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents', 'search', search],
    queryFn: async () => {
      if (search.length < 3) return []
      const res = await fetch(`/api/agents?search=${search}&limit=5`)
      const json = await res.json()
      return json.data || []
    },
    enabled: search.length >= 3
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedManager) return
      if (isManual && (!nomTemp || !prenomTemp)) return

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: isManual ? null : (agent as any).id,
          nom_temp: isManual ? nomTemp : null,
          prenom_temp: isManual ? prenomTemp : null,
          direction_temp: directionTemp || null,
          service_temp: serviceTemp || null,
          poste_temp: posteTemp || null,
          manager_id: selectedManager.id,
          date_arrivee_prevue: isManual ? null : (agent as any).date_arrivee
        })
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la création');
      }
      return res.json()
    },
    onError: (err: any) => {
      alert(`Erreur lors de la création: ${err.message}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] })
      onClose()
      alert("L'onboarding est lancé et le manager a été notifié.")
    }
  })

  if (!agent) return null

  return (
    <Dialog open={!!agent} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-display font-bold text-slate-800 flex items-center gap-3">
            <UserCircle className="text-indigo-500" size={24} />
            {isManual ? "Nouvel Arrivant Hors-Base" : "Assigner un Manager"}
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1 italic">
             {isManual ? "Veuillez saisir l'identité de l'arrivant" : `Onboarding de ${formatPrenom((agent as any).prenom)} ${(agent as any).nom?.toUpperCase()}`}
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Manual Entry Fields */}
          {isManual && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prénom</label>
                <input
                  type="text"
                  placeholder="Prénom..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={prenomTemp}
                  onChange={(e) => setPrenomTemp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nom</label>
                <input
                  type="text"
                  placeholder="Nom..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={nomTemp}
                  onChange={(e) => setNomTemp(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fonction</label>
                <input
                  type="text"
                  placeholder="Ex: Auxiliaire de vie, Chef de projet..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={posteTemp}
                  onChange={(e) => setPosteTemp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Direction</label>
                <input
                  type="text"
                  placeholder="DSI, DRH..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={directionTemp}
                  onChange={(e) => setDirectionTemp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service</label>
                <input
                  type="text"
                  placeholder="Infrastructures, Études..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={serviceTemp}
                  onChange={(e) => setServiceTemp(e.target.value)}
                />
              </div>
            </div>
          )}
          {/* Manager Search */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rechercher le manager</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Nom, prénom ou direction..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Results */}
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {isLoading && <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Recherche...</div>}
              
              {agents.map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedManager(m)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    selectedManager?.id === m.id 
                      ? 'bg-indigo-50 border-indigo-200' 
                      : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                      {m.prenom[0]}{m.nom[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 uppercase">{m.nom} <span className="normal-case font-medium text-slate-400 ml-1">{formatPrenom(m.prenom)}</span></div>
                      <div className="text-[10px] text-slate-500 uppercase">{m.position_l}</div>
                      {!(m.mail || m.azure_id) && <div className="text-[9px] text-rose-500 font-bold uppercase mt-1">⚠️ Aucun Email Défini</div>}
                    </div>
                  </div>
                  {selectedManager?.id === m.id && <CheckCircle2 size={16} className="text-indigo-500" />}
                </button>
              ))}

              {!isLoading && search.length >= 3 && agents.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs">Aucun agent trouvé</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
             <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
             >
                Annuler
             </button>
             <button 
              onClick={() => mutation.mutate()}
              disabled={!selectedManager || mutation.isPending || (isManual && (!nomTemp || !prenomTemp))}
              className="flex-[2] px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
             >
                {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isManual && (!nomTemp || !prenomTemp) ? "Saisir l'identité..." : "Lancer l'onboarding"}
             </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
