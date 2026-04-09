'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { History, Search, ArrowRight, User } from 'lucide-react'
import { cn, formatDate, formatPrenom } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface SynchroLog {
  id: number
  type: string
  statut: string
  message: string
  created_at: string
}

interface SyncAgentLog {
  id: number
  matricule: string
  agent_nom: string
  field: string
  old_value: string
  new_value: string
  created_at: string
}

export default function SynchroLogsPage() {
  const [synchros, setSynchros] = useState<SynchroLog[]>([])
  const [selectedSync, setSelectedSync] = useState<number | null>(null)
  const [details, setDetails] = useState<SyncAgentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/synchro/logs?limit=50')
      .then(res => res.json())
      .then(data => {
        setSynchros(data)
        if (data.length > 0) setSelectedSync(data[0].id)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedSync) {
      setLoading(true)
      fetch(`/api/synchro/logs/${selectedSync}`)
        .then(res => res.json())
        .then(data => {
          setDetails(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(() => {
          setDetails([])
          setLoading(false)
        })
    }
  }, [selectedSync])

  const filteredDetails = (Array.isArray(details) ? details : []).filter(d => 
    d.agent_nom?.toLowerCase().includes(search.toLowerCase()) || 
    d.matricule?.toLowerCase().includes(search.toLowerCase()) ||
    d.field?.toLowerCase().includes(search.toLowerCase())
  )

  const groupedLogs = useMemo(() => {
    const groups: Record<string, { matricule: string, agent_nom: string, changes: SyncAgentLog[] }> = {}
    filteredDetails.forEach(log => {
      if (!groups[log.matricule]) {
        groups[log.matricule] = {
          matricule: log.matricule,
          agent_nom: log.agent_nom,
          changes: []
        }
      }
      groups[log.matricule].changes.push(log)
    })
    return Object.values(groups)
  }, [filteredDetails])

  return (
    <div className="flex bg-[#f4f6fb] text-[#1a2340]">
      <Sidebar />
      <PageContainer title="Traçabilité RH" subtitle="Historique détaillé des changements détectés">
        <PageHeader title="Logs de Synchronisation" icon={History} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Liste des Sessions */}
          <div className="lg:col-span-1 space-y-3">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Sessions récentes</h3>
             <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {synchros.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => setSelectedSync(s.id)}
                    className={cn(
                      "p-4 rounded-2xl cursor-pointer transition-all border",
                      selectedSync === s.id 
                        ? "bg-white border-indigo-500 shadow-lg shadow-indigo-100 ring-1 ring-indigo-500" 
                        : "bg-white/60 border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={s.statut === 'success' ? 'success' : 'outline'} className="text-[9px] uppercase font-black">
                        {s.type}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(s.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-700 truncate mb-1">
                      {new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed italic">
                      {s.message}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Détails des changements */}
          <div className="lg:col-span-3">
             <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl min-h-[600px]">
                <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-50">
                  <div>
                    <CardTitle className="text-lg font-black text-slate-800 tracking-tight uppercase">
                       Changements détectés
                    </CardTitle>
                    <div className="text-xs font-medium text-slate-400">
                       {filteredDetails.length} modification{filteredDetails.length > 1 ? 's' : ''} sur {groupedLogs.length} agent{groupedLogs.length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <Input 
                      placeholder="Filtrer agent ou champ..." 
                      className="pl-9 h-9 rounded-xl border-slate-200 text-xs"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                       <History size={40} className="animate-spin opacity-20" />
                       <span className="text-sm font-medium">Chargement des données...</span>
                    </div>
                  ) : groupedLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                       <History size={40} className="opacity-20" />
                       <span className="text-sm font-medium italic">Aucun changement détecté dans cette session</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       {groupedLogs.map(group => (
                         <div key={group.matricule} className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-50">
                               <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                  <User size={20} />
                               </div>
                               <div>
                                  <div className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                     {group.agent_nom?.split(' ')[0]} {formatPrenom(group.agent_nom?.split(' ').slice(1).join(' '))}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400">
                                     Matricule {group.matricule} • {group.changes.length} modification{group.changes.length > 1 ? 's' : ''}
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-3">
                               {group.changes.map(d => (
                                 <div key={d.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                                    <div className="md:col-span-3">
                                       <Badge variant="outline" className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 border-indigo-100/50">
                                          {d.field}
                                       </Badge>
                                    </div>
                                    <div className="md:col-span-4 p-2 rounded-xl bg-red-500/5 border border-red-500/10">
                                       <div className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1">Ancien</div>
                                       <div className="text-xs text-slate-600 truncate">{d.old_value || '(vide)'}</div>
                                    </div>
                                    <div className="hidden md:flex md:col-span-1 justify-center text-slate-300">
                                       <ArrowRight size={14} />
                                    </div>
                                    <div className="md:col-span-4 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                       <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Nouveau</div>
                                       <div className="text-xs text-slate-800 font-semibold truncate">{d.new_value || '(vide)'}</div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
                </CardContent>
             </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
