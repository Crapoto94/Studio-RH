import { useState, useEffect } from 'react'
import { Agent } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AgentAvatar } from './AgentAvatar'
import { StatusBadge } from './StatusBadge'
import { formatDate, formatPrenom } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Star, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface AgentModalProps {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgentModal({ agent, open, onOpenChange }: AgentModalProps) {
  const queryClient = useQueryClient()
  const [brutData, setBrutData] = useState<{ brutRh: any, brutAds: any[], brutAzure: any } | null>(null)
  const [loadingBrut, setLoadingBrut] = useState(false)
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)

  const reloadData = async () => {
    if (!agent?.id) return
    setBrutData(null)
    setLoadingBrut(true)
    try {
        const res = await fetch(`/api/agents/${agent.id}/brut`)
        const data = await res.json()
        setBrutData(data)
    } finally {
        setLoadingBrut(false)
    }
  }

  const handlePromote = async () => {
    if (!agent || !brutData?.brutAds[currentAdIndex]) return
    const sam = brutData.brutAds[currentAdIndex].sam_account
    if (confirm(`Promouvoir ${sam} comme compte principal ?`)) {
      setActionLoading(true)
      try {
        await fetch('/api/agents/link-ad', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: agent.id, adId: sam })
        })
        queryClient.invalidateQueries({ queryKey: ['agents'] })
        reloadData()
        setCurrentAdIndex(0)
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handleDeleteExtra = async () => {
    if (!agent || !brutData?.brutAds[currentAdIndex]) return
    const sam = brutData.brutAds[currentAdIndex].sam_account
    if (confirm(`Supprimer le lien avec le compte ${sam} ?`)) {
      setActionLoading(true)
      try {
        await fetch(`/api/agents/extra-ad-links?agentId=${agent.id}&samAccount=${sam}`, {
          method: 'DELETE'
        })
        queryClient.invalidateQueries({ queryKey: ['agents'] })
        reloadData()
        setCurrentAdIndex(0)
      } finally {
        setActionLoading(false)
      }
    }
  }

  useEffect(() => {
    if (open && agent?.id) {
      setCurrentAdIndex(0)
      reloadData()
    }
  }, [open, agent?.id])

  if (!agent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white border border-slate-200 text-slate-800 shadow-2xl p-0 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-row items-center gap-6">
          <AgentAvatar agent={agent} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight">
                {agent.nom?.toUpperCase()} {formatPrenom(agent.prenom)}
              </DialogTitle>
              <StatusBadge status={agent.actif ? 'success' : 'warning'} className="mt-0.5">
                {agent.actif ? 'Actif' : 'Inactif'}
              </StatusBadge>
            </div>
            <p className="text-slate-500 font-medium text-lg">
                {agent.poste_l || ''}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">Matricule: {agent.matricule}</span>
            <div className="flex gap-2">
              {agent.ad_id && (
                <StatusBadge status="success">
                    {agent.ad_count && agent.ad_count > 1 ? `AD Lié (${agent.ad_count})` : 'AD Lié'}
                </StatusBadge>
              )}
              {agent.azure_id && <StatusBadge status="info">Azure Lié</StatusBadge>}
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full flex-col">
          <div className="px-6 bg-slate-50/50 border-b border-slate-100">
            <TabsList className="bg-transparent h-12 gap-6 p-0">
                <TabsTrigger value="general" className="tab-trigger">Fiche Pro</TabsTrigger>
                <TabsTrigger value="rh" className="tab-trigger">Import Brut RH</TabsTrigger>
                <TabsTrigger value="ad" className="tab-trigger">Import Brut AD</TabsTrigger>
                <TabsTrigger value="azure" className="tab-trigger">Import Brut Azure</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 h-[500px] overflow-y-auto">
            <TabsContent value="general" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-7 py-2">
                    <InfoBlock label="NOM" value={agent.nom?.toUpperCase()} bold />
                    <InfoBlock label="PRENOM" value={formatPrenom(agent.prenom)} bold />
                    <InfoBlock label="MATRICULE" value={agent.matricule} />
                    
                    <InfoBlock label="POSTE" value={agent.poste_l} bold />
                    <InfoBlock label="FONCTION" value={agent.fonction_l} />
                    <InfoBlock label="AFFECTATION" value={agent.nom_affect_l} sub={agent.code_affect} />
                    
                    <InfoBlock label="SERVICE" value={agent.nom_service} sub={agent.code_service} />
                    <InfoBlock label="DIRECTION" value={agent.nom_direction} sub={agent.code_direction} />
                    <InfoBlock label="DG / CABINET" value={agent.nom_dg_cab_l} sub={agent.code_dg_cab} />
                    
                    <InfoBlock label="POSITION" value={agent.position_l} />
                    <InfoBlock label="CATEGORIE" value={agent.niveau_hierarchie?.toUpperCase()} />
                    <InfoBlock label="DATE ARRIVEE" value={formatDate(agent.date_arrivee)} />
                    
                    <InfoBlock label="DATE DEPART" value={formatDate(agent.date_depart)} />
                    <InfoBlock label="DERNIERE SYNCHRO" value={formatDate(agent.plus_vu?.toString())} />
                </div>
            </TabsContent>

            <TabsContent value="rh" className="mt-0">
                {loadingBrut ? <LoadingPlaceholder /> : !brutData?.brutRh ? <EmptyPlaceholder type="RH" /> : (
                    <RawDataGrid data={brutData.brutRh} />
                )}
            </TabsContent>

            <TabsContent value="ad" className="mt-0">
                {loadingBrut ? <LoadingPlaceholder /> : !brutData?.brutAds?.length ? <EmptyPlaceholder type="Active Directory" /> : (
                    <div className="space-y-4">
                        {brutData.brutAds.length > 1 && (
                            <div className="flex items-center justify-between bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 mb-2">
                                <div className="flex flex-col pl-2">
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1">
                                        Compte AD {currentAdIndex + 1} / {brutData.brutAds.length}
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 font-mono">
                                        {brutData.brutAds[currentAdIndex].sam_account}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {currentAdIndex > 0 && (
                                        <>
                                            <button 
                                                onClick={handlePromote}
                                                disabled={actionLoading}
                                                className="p-2 rounded-lg bg-amber-50 shadow-sm border border-amber-100 hover:bg-amber-600 hover:text-white transition-all text-amber-600"
                                                title="Définir comme compte principal"
                                            >
                                                <Star size={18} fill={actionLoading ? 'currentColor' : 'none'} />
                                            </button>
                                            <button 
                                                onClick={handleDeleteExtra}
                                                disabled={actionLoading}
                                                className="p-2 rounded-lg bg-rose-50 shadow-sm border border-rose-100 hover:bg-rose-600 hover:text-white transition-all text-rose-600 mr-2"
                                                title="Supprimer ce lien secondaire"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        onClick={() => setCurrentAdIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentAdIndex === 0 || actionLoading}
                                        className="p-2 rounded-lg bg-white shadow-sm border border-indigo-100 hover:bg-indigo-50 disabled:opacity-30 transition-all text-indigo-600"
                                        title="Compte précédent"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentAdIndex(prev => Math.min(brutData.brutAds.length - 1, prev + 1))}
                                        disabled={currentAdIndex === brutData.brutAds.length - 1 || actionLoading}
                                        className="p-2 rounded-lg bg-white shadow-sm border border-indigo-100 hover:bg-indigo-50 disabled:opacity-30 transition-all text-indigo-600"
                                        title="Compte suivant"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <RawDataGrid data={brutData.brutAds[currentAdIndex]} />
                    </div>
                )}
            </TabsContent>

            <TabsContent value="azure" className="mt-0">
                {loadingBrut ? <LoadingPlaceholder /> : !brutData?.brutAzure ? <EmptyPlaceholder type="Azure AD" /> : (
                    <RawDataGrid data={brutData.brutAzure} />
                )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function RawDataGrid({ data }: { data: any }) {
    const keys = Object.keys(data).filter(k => k !== 'id' && !k.includes('id_agent'));
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {keys.map(k => (
                <div key={k} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">{k.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium text-slate-700 max-w-[200px] truncate" title={data[k]?.toString()}>
                        {data[k]?.toString() || <span className="text-slate-300 italic">null</span>}
                    </span>
                </div>
            ))}
        </div>
    )
}

function InfoBlock({ label, value, sub, bold }: { label: string; value?: string | null; sub?: string | null; bold?: boolean }) {
  return (
    <div className="group">
      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
      <span className={`block text-sm ${bold ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
        {value || <span className="text-slate-300 font-normal">Non renseigné</span>}
      </span>
      {sub && <span className="block text-[11px] text-slate-400 mt-1 font-mono">{sub}</span>}
    </div>
  )
}

function LoadingPlaceholder() {
    return (
        <div className="space-y-4 animate-pulse pt-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 bg-slate-100 rounded w-full" />
            ))}
        </div>
    )
}

function EmptyPlaceholder({ type }: { type: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <p className="text-sm italic">Aucune donnée brute trouvée pour la source {type}.</p>
        </div>
    )
}


