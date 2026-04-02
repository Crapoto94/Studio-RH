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

interface AgentModalProps {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgentModal({ agent, open, onOpenChange }: AgentModalProps) {
  const [brutData, setBrutData] = useState<{ brutRh: any, brutAd: any, brutAzure: any } | null>(null)
  const [loadingBrut, setLoadingBrut] = useState(false)

  useEffect(() => {
    if (open && agent?.id) {
      setLoadingBrut(true)
      fetch(`/api/agents/${agent.id}/brut`)
        .then(res => res.json())
        .then(data => {
            setBrutData(data)
            setLoadingBrut(false)
        })
        .catch(console.error)
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
              {agent.ad_id && <StatusBadge status="success">AD Lié</StatusBadge>}
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
                {loadingBrut ? <LoadingPlaceholder /> : !brutData?.brutAd ? <EmptyPlaceholder type="Active Directory" /> : (
                    <RawDataGrid data={brutData.brutAd} />
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


