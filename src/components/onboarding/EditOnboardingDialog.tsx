'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, UserCircle, Save, Loader2, CheckCircle2, Send, XCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatPrenom } from '@/lib/utils'

interface EditOnboardingDialogProps {
  onboarding: any | null
  onClose: () => void
}

export function EditOnboardingDialog({ onboarding, onClose }: EditOnboardingDialogProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedManager, setSelectedManager] = useState<any | null>(null)
  const [nomTemp, setNomTemp] = useState('')
  const [prenomTemp, setPrenomTemp] = useState('')
  const [directionTemp, setDirectionTemp] = useState('')
  const [serviceTemp, setServiceTemp] = useState('')
  const [posteTemp, setPosteTemp] = useState('')
  const [dateArriveePrevue, setDateArriveePrevue] = useState('')

  useEffect(() => {
    if (onboarding) {
      setNomTemp(onboarding.nom_temp || '')
      setPrenomTemp(onboarding.prenom_temp || '')
      setDirectionTemp(onboarding.direction_temp || onboarding.agent?.nom_direction || '')
      setServiceTemp(onboarding.service_temp || onboarding.agent?.nom_service || '')
      setPosteTemp(onboarding.poste_temp || onboarding.agent?.poste_l || onboarding.agent?.position_l || '')
      setDateArriveePrevue(onboarding.date_arrivee_prevue ? new Date(onboarding.date_arrivee_prevue).toISOString().split('T')[0] : '')
      setSelectedManager(onboarding.manager || null)
      setSearch('')
    }
  }, [onboarding])

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
    mutationFn: async (actionType: 'save' | 'launch' | 'cancel') => {
      if (!onboarding) return

      const bodyPayload: any = {
          nom_temp: nomTemp || null,
          prenom_temp: prenomTemp || null,
          direction_temp: directionTemp || null,
          service_temp: serviceTemp || null,
          poste_temp: posteTemp || null,
          date_arrivee_prevue: dateArriveePrevue || null,
          action: actionType !== 'save' ? actionType : undefined
      }

      if (selectedManager) {
        bodyPayload.manager_id = selectedManager.id
      }

      const res = await fetch(`/api/onboarding/${onboarding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      })
      if (!res.ok) throw new Error('Erreur lors de la mise à jour')
      return res.json()
    },
    onSuccess: (data, actionType) => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] })
      onClose()
      if (actionType === 'launch') {
         alert("L'onboarding est lancé et le manager a été notifié par email.")
      }
    }
  })

  if (!onboarding) return null

  return (
    <Dialog open={!!onboarding} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-display font-bold text-slate-800 flex items-center gap-3">
            <UserCircle className="text-indigo-500" size={24} />
            Modifier l'Onboarding
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Identity Fields (if manual or temp) */}
          {(onboarding.nom_temp || !onboarding.agent_id) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prénom</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={prenomTemp}
                  onChange={(e) => setPrenomTemp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nom</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={nomTemp}
                  onChange={(e) => setNomTemp(e.target.value)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date d'arrivée prévue</label>
                <input
                  type="date"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={dateArriveePrevue}
                  onChange={(e) => setDateArriveePrevue(e.target.value)}
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
                  placeholder="Ex: DSI..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={directionTemp}
                  onChange={(e) => setDirectionTemp(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service</label>
                <input
                  type="text"
                  placeholder="Ex: Études..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                  value={serviceTemp}
                  onChange={(e) => setServiceTemp(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Current / New Manager */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manager Responsable</label>
            
            {selectedManager && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                      {selectedManager.prenom[0]}{selectedManager.nom[0]}
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-800 uppercase">{selectedManager.nom} <span className="normal-case font-medium text-slate-400 ml-1">{formatPrenom(selectedManager.prenom)}</span></div>
                      <div className="text-[10px] text-slate-500 uppercase">{selectedManager.position_l}</div>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedManager(null)}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  Modifier
                </button>
              </div>
            )}

            {!selectedManager && (
              <div className="space-y-3 animate-in fade-in">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher un nouveau manager..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {isLoading && <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Recherche...</div>}
                  {agents.map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedManager(m)}
                      className="w-full text-left p-3 rounded-xl border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                        {m.prenom[0]}{m.nom[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 uppercase">{m.nom} <span className="normal-case font-medium text-slate-400 ml-1">{formatPrenom(m.prenom)}</span></div>
                        <div className="text-[10px] text-slate-500 uppercase">{m.position_l}</div>
                        {!(m.mail || m.azure_id) && <div className="text-[9px] text-rose-500 font-bold uppercase mt-1">⚠️ Aucun Email Défini</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-2 flex-wrap">
             <button 
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all shrink-0"
             >
                Annuler
             </button>
             <button 
              onClick={() => mutation.mutate('save')}
              disabled={!selectedManager || mutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm shadow-sm hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all min-w-fit"
             >
                {mutation.isPending && mutation.variables === 'save' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Enregistrer
             </button>
             {onboarding.statut === 'a_faire' && (
               <button 
                 onClick={() => mutation.mutate('launch')}
                 disabled={!selectedManager || mutation.isPending}
                 className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-2"
               >
                 {mutation.isPending && mutation.variables === 'launch' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                 Enregistrer et Lancer l'Onboarding
               </button>
             )}
             <button 
               onClick={() => {
                   if(confirm("Êtes-vous sûr de ne pas vouloir onboarder cet agent ? L'onboarding sera annulé et archivé.")) {
                       mutation.mutate('cancel')
                   }
               }}
               disabled={mutation.isPending}
               className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-bold text-sm shadow-sm hover:bg-rose-100 flex items-center justify-center gap-2 transition-all mt-2"
             >
               {mutation.isPending && mutation.variables === 'cancel' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
               Ne pas onboarder
             </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
