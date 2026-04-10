'use client'

import { useState } from 'react'
import { Agent } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Link2, Loader2, Check, Plus, Unlink } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface AdLinkingModalProps {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdLinkingModal({ agent, open, onOpenChange }: AdLinkingModalProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState<string | null>(null)

  const handleOpenEnter = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (isOpen && agent) {
      setSearch(agent.nom)
      handleSearch(agent.nom)
    } else {
      setSearch('')
      setResults([])
    }
  }

  const handleSearch = async (term: string) => {
    if (!term.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/ad/search?q=${encodeURIComponent(term)}`)
      const data = await res.json()
      setResults(data)
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async (adId: string, type: 'primary' | 'secondary' = 'primary') => {
    if (!agent) return
    setLinking(adId)
    try {
      const endpoint = type === 'primary' ? '/api/agents/link-ad' : '/api/agents/extra-ad-links'
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, adId })
      })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
      // On recharge aussi si on est dans la modale
      onOpenChange(false)
    } finally {
      setLinking(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenEnter}>
      <DialogContent className="max-w-md bg-white shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle>Liaison AD Manuelle</DialogTitle>
        </DialogHeader>

        {agent && (
          <div className="space-y-4 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Agent RH ciblé</div>
              <div className="font-semibold text-slate-800">{agent.nom} {agent.prenom}</div>
              <div className="text-xs text-slate-500 mt-1">{agent.position_l || 'Sans position'}</div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch(search)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
              <button
                onClick={() => handleSearch(search)}
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                title="Lancer la recherche"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  Recherche...
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  Aucun compte trouvé.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {results.map((r, i) => (
                    <li key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 group transition-colors">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="font-medium text-slate-800 text-sm truncate">{r.display_name}</div>
                        <div className="text-xs text-slate-500 font-mono truncate">{r.sam_account}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleLink(r.sam_account, 'primary')}
                          disabled={!!linking}
                          className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Définir comme compte principal"
                        >
                          {linking === r.sam_account ? <Loader2 className="animate-spin" size={12} /> : <Link2 size={12} />}
                          Principal
                        </button>
                        <button
                          onClick={() => handleLink(r.sam_account, 'secondary')}
                          disabled={!!linking}
                          className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-slate-50 hover:bg-slate-800 hover:text-white text-slate-600 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Ajouter comme compte secondaire"
                        >
                          {linking === r.sam_account ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
                          Secondaire
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {agent.ad_id && (
              <div className="pt-2 text-center">
                 <button
                    onClick={() => handleLink('')}
                    disabled={!!linking}
                    className="text-xs text-red-500 hover:text-red-700 underline flex items-center justify-center gap-1 mx-auto"
                    title="Supprime uniquement l'identifiant AD principal de cet agent. Les comptes secondaires doivent être gérés dans la fiche détaillée."
                  >
                    <Unlink size={12} /> Détacher le compte principal ({agent.ad_id})
                 </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
