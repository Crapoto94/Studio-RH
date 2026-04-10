'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Link2, Loader2, User } from 'lucide-react'
import { AgentAvatar } from './AgentAvatar'
import { formatPrenom } from '@/lib/utils'

interface AgentPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: any
  onSuccess: () => void
}

export function AgentPickerModal({ open, onOpenChange, account, onSuccess }: AgentPickerModalProps) {
  const [search, setSearch] = useState('')
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [linking, setLinking] = useState<number | null>(null)

  const fetchAgents = async (term: string) => {
    if (!term || term.length < 2) {
      setAgents([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/agents?search=${encodeURIComponent(term)}&limit=10`)
      const json = await res.json()
      setAgents(json.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Native debounce with useEffect
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAgents(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  const handleLink = async (agentId: number) => {
    if (!account) return
    setLinking(agentId)
    try {
      const res = await fetch('/api/ad/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'link', 
          samAccount: account.sam_account,
          agentId
        })
      })
      if (!res.ok) throw new Error('Erreur lors de la liaison')
      onSuccess()
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la liaison')
    } finally {
      setLinking(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="bg-indigo-600 p-8 text-white">
            <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Link2 size={24} />
                    Associer à un Agent
                </DialogTitle>
                <p className="text-indigo-100 text-sm mt-1">Recherchez l'agent RH auquel rattacher ce compte AD.</p>
            </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-inner">
            <div className="text-[10px] font-black uppercase text-indigo-400 tracking-wider mb-1">Compte AD à lier</div>
            <div className="font-bold text-indigo-900">{account?.display_name}</div>
            <div className="text-xs text-indigo-400 font-mono tracking-tight">{account?.sam_account}</div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un agent (Nom, Prénom, Matricule...)"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                debouncedSearch(e.target.value)
              }}
              className="w-full pl-12 pr-4 py-3.5 text-sm border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-medium"
              autoFocus
            />
            {loading && (
              <div className="absolute right-4 top-3.5">
                <Loader2 className="animate-spin text-indigo-500" size={18} />
              </div>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {agents.length === 0 && search.length >= 2 && !loading ? (
              <div className="py-8 text-center text-slate-400 text-sm italic">Aucun agent trouvé pour "{search}"</div>
            ) : agents.map(agent => (
              <div 
                key={agent.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                    <AgentAvatar agent={agent} size="sm" />
                    <div>
                        <div className="font-bold text-slate-800 text-sm">{agent.nom?.toUpperCase()} {formatPrenom(agent.prenom)}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase truncate max-w-[150px]">{agent.nom_direction}</div>
                    </div>
                </div>
                <button
                    onClick={() => handleLink(agent.id)}
                    disabled={linking !== null}
                    className="px-4 py-2 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                >
                    {linking === agent.id ? <Loader2 className="animate-spin" size={14} /> : <User size={14} />}
                    Lier
                </button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
