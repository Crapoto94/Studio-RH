'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { 
  CheckCircle2, Circle, Clock, User, Briefcase, FileText, Loader2, 
  CheckSquare, Copy, Link as LinkIcon, Mail, History, AlertCircle,
  ExternalLink, Smartphone, Monitor, ChevronRight, MessageSquare,
  LayoutPanelLeft, Hash, Info, Target, Calendar, ShieldCheck, X
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDate, formatPrenom } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'

interface OnboardingDetailDialogProps {
  onboarding: any | null
  onClose: () => void
}

export function OnboardingDetailDialog({ onboarding: initialOnboarding, onClose }: OnboardingDetailDialogProps) {
  const [copied, setCopied] = useState(false)
  const [taskToValidate, setTaskToValidate] = useState<any>(null)
  const [validationComment, setValidationComment] = useState('')

  const queryClient = useQueryClient()
  const id = initialOnboarding?.id

  const { data: onboarding, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['onboarding', id],
    queryFn: async () => {
      const res = await fetch(`/api/onboarding/${id}`)
      if (!res.ok) throw new Error('Erreur lors du chargement des détails')
      return res.json()
    },
    enabled: !!id,
    initialData: initialOnboarding 
  })

  const { data: logsData, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['onboarding-logs', id],
    queryFn: async () => {
      const res = await fetch(`/api/onboarding/${id}/logs`)
      return res.json()
    },
    enabled: !!id
  })

  const groupedResponses = useMemo(() => {
    if (!onboarding?.reponses_formulaire || !onboarding?.config) return null
    try {
      const responses = JSON.parse(onboarding.reponses_formulaire)
      const config = JSON.parse(onboarding.config)
      const groups: { title: string, items: { label: string, value: any }[] }[] = []
      let currentGroup: { title: string, items: { label: string, value: any }[] } = { title: 'Informations Générales', items: [] }
      
      config.forEach((f: any) => {
        if (f.type === 'title' || f.type === 'section') {
          if (currentGroup.items.length > 0) groups.push(currentGroup)
          currentGroup = { title: f.label, items: [] }
        } else {
            const val = responses[f.id]
            if (val !== undefined && val !== null && val !== '' && val !== false) {
                currentGroup.items.push({ label: f.label, value: val })
            }
        }
      })
      if (currentGroup.items.length > 0) groups.push(currentGroup)
      return groups
    } catch (e) { return null }
  }, [onboarding])

  const resendMutation = useMutation({
      mutationFn: async () => {
        const res = await fetch(`/api/onboarding/${id}/resend`, { method: 'POST' })
        if (!res.ok) throw new Error('Erreur lors de l\'envoi')
        return res.json()
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['onboarding-logs', id] })
    })

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, done, commentaire }: { taskId: number, done: boolean, commentaire?: string }) => {
      const res = await fetch(`/api/onboarding/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done, commentaire })
      })
      if (!res.ok) throw new Error('Erreur lors de la mise à jour')
      return res.json()
    },
    onSuccess: () => {
      setTaskToValidate(null)
      queryClient.invalidateQueries({ queryKey: ['onboardings'] })
      queryClient.invalidateQueries({ queryKey: ['onboarding', id] })
    }
  })

  if (!initialOnboarding) return null
  
  const agentFirstName = onboarding.agent ? onboarding.agent.prenom : onboarding.prenom_temp
  const agentLastName = onboarding.agent ? onboarding.agent.nom : onboarding.nom_temp
  const agentNameTotal = `${formatPrenom(agentFirstName || '')} ${(agentLastName || '').toUpperCase()}`
  const totalTasks = onboarding.tasks?.length || 0
  const completedTasks = onboarding.tasks?.filter((t: any) => t.done).length || 0
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <>
      <Dialog open={!!initialOnboarding} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[1280px] w-[95vw] h-[92vh] p-0 bg-white border-none rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col font-sans select-none">
          
          <div className="flex flex-1 min-h-0">
             {/* --- COLONNE GAUCHE (70%) : CONTENU DE TRAVAIL --- */}
             <div className="flex-[7] flex flex-col h-full bg-white relative">
                
                {/* Header Gauche Minimaliste */}
                <header className="p-10 px-12 border-b border-slate-50 shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Dossier Onboarding</span>
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase py-0 ${onboarding.statut === 'termine' ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-amber-50 text-amber-600 border-none'}`}>
                      {onboarding.statut.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h2 className="text-5xl font-black text-slate-800 tracking-tight leading-none italic">
                    {agentNameTotal || 'Agent sans nom'}
                  </h2>
                </header>

                <Tabs defaultValue="logistics" className="flex-1 flex flex-col min-h-0 min-w-0">
                   <div className="px-12 bg-white shrink-0">
                      <TabsList className="bg-transparent h-14 p-0 gap-12 justify-start border-b border-slate-100 rounded-none w-full">
                        <TabsTrigger value="logistics" className="h-full rounded-none border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 px-0 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-all">
                          Suivi Logistique
                        </TabsTrigger>
                        <TabsTrigger value="needs" className="h-full rounded-none border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 px-0 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-all">
                          Besoins du Manager
                        </TabsTrigger>
                        <TabsTrigger value="history" className="h-full rounded-none border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 px-0 text-[11px] font-black uppercase tracking-widest text-slate-400 transition-all">
                          Historique
                        </TabsTrigger>
                      </TabsList>
                   </div>

                   <div className="flex-1 relative overflow-hidden">
                     <ScrollArea className="h-full w-full" scrollHideDelay={0}>
                        <div className="p-12 pr-16 pb-32">
                          <TabsContent value="logistics" className="mt-0 outline-none">
                             <div className="grid grid-cols-2 gap-4">
                                {onboarding.tasks?.map((task: any) => (
                                  <div key={task.id} className={`flex items-center gap-5 p-5 border border-slate-100 rounded-2xl group transition-all ${task.done ? 'bg-slate-50 opacity-50' : 'bg-white hover:border-slate-200 hover:shadow-sm'}`}>
                                     <button 
                                        onClick={() => !task.done ? setTaskToValidate(task) : toggleTaskMutation.mutate({ taskId: task.id, done: false })}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${task.done ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-300 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'}`}
                                     >
                                        {task.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                     </button>
                                     <div className="flex-1 min-w-0">
                                        <h4 className={`text-[14px] font-bold ${task.done ? 'text-slate-500' : 'text-slate-800'}`}>{task.titre}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{task.responsable_mail?.split('@')[0] || 'DSI'}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </TabsContent>

                          <TabsContent value="needs" className="mt-0 outline-none">
                             {!groupedResponses ? (
                                <div className="py-20 text-center text-slate-200">
                                   <Clock size={64} className="mx-auto mb-4 opacity-50" />
                                   <p className="text-sm font-black uppercase tracking-[0.2em]">Formulaire non soumis par le manager</p>
                                </div>
                             ) : (
                                <div className="space-y-12">
                                   {groupedResponses.map((group, idx) => (
                                      <section key={`${group.title}-${idx}`} className="space-y-6">
                                         <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] pl-4 border-l-4 border-indigo-500">{group.title}</h3>
                                         <div className="divide-y divide-slate-100 border-t border-slate-100">
                                            {group.items.map((item, iIdx) => (
                                               <div key={`${item.label}-${iIdx}`} className="flex justify-between items-center py-4 group">
                                                  <span className="text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-tight">{item.label}</span>
                                                  <span className="text-[13px] font-black text-slate-900 border-b-2 border-indigo-50">
                                                     {String(item.value) === 'true' ? 'OUI' : 
                                                      String(item.value) === 'false' ? 'NON' : 
                                                      String(item.value)}
                                                  </span>
                                               </div>
                                            ))}
                                         </div>
                                      </section>
                                   ))}
                                </div>
                             )}
                          </TabsContent>

                          <TabsContent value="history" className="mt-0 outline-none">
                             {logsData?.emails?.map((log: any) => (
                               <div key={log.id} className="flex gap-5 p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-slate-300 transition-all mb-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.status === 'SUCCESS' ? 'bg-white text-emerald-500 shadow-sm' : 'bg-white text-rose-500'}`}>
                                     <Mail size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex justify-between mb-1">
                                        <h4 className="text-xs font-black text-slate-800 tracking-tight pr-6">{log.subject}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 shrink-0">{formatDate(log.sent_at)}</span>
                                     </div>
                                     <p className="text-[11px] font-medium text-slate-500">{log.to}</p>
                                  </div>
                               </div>
                             ))}
                          </TabsContent>
                        </div>
                     </ScrollArea>
                   </div>
                </Tabs>
             </div>

             {/* --- COLONNE DROITE (30%) : INFOS CONTEXTUELLES --- */}
             <div className="flex-[3] bg-slate-50 border-l border-slate-100 flex flex-col min-w-[320px]">
                <div className="p-10 flex-1 space-y-12 overflow-y-auto">
                   
                   {/* Progression */}
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progression</p>
                         <p className="text-3xl font-black text-indigo-600 leading-none">{progressPercent}%</p>
                      </div>
                      <Progress value={progressPercent} className="h-3 bg-slate-200 border border-slate-200 rounded-full" />
                   </div>

                   {/* Éléments Clés */}
                   <div className="space-y-8">
                      <div className="flex items-start gap-4 pb-6 border-b border-slate-200/60">
                         <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <Briefcase size={18} />
                         </div>
                         <div className="min-w-0">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Poste</p>
                             {(onboarding.agent?.poste_l || onboarding.poste_temp) ? (
                               <p className="text-sm font-bold text-slate-700 leading-tight">
                                  {onboarding.agent?.poste_l || onboarding.poste_temp}
                               </p>
                             ) : null}
                             <p className="text-[10px] text-slate-400 mt-1 italic">
                                {onboarding.agent?.nom_direction_l || onboarding.direction_temp || ''} 
                                { (onboarding.agent?.nom_service_l || onboarding.service_temp) ? ` > ${onboarding.agent?.nom_service_l || onboarding.service_temp}` : '' }
                             </p>
                          </div>
                       </div>

                      <div className="flex items-start gap-4 pb-6 border-b border-slate-200/60">
                         <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                            <User size={18} />
                         </div>
                         <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Manager</p>
                            <p className="text-sm font-bold text-slate-700">{formatPrenom(onboarding.manager?.prenom)} {onboarding.manager?.nom?.toUpperCase()}</p>
                         </div>
                      </div>

                      <div className="flex items-start gap-4 pb-6 border-b border-slate-200/60">
                         <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                            <Calendar size={18} />
                         </div>
                         <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Arrivée Prévue</p>
                            <p className="text-sm font-bold text-slate-700">{formatDate(onboarding.date_arrivee_prevue) || 'Date inconnue'}</p>
                         </div>
                      </div>
                   </div>

                   {/* Actions Rapides */}
                   <div className="space-y-4 pt-4">
                      <button 
                        onClick={() => resendMutation.mutate()}
                        disabled={resendMutation.isPending}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                      >
                        {resendMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                        Rappeler Manager
                      </button>
                      
                      <button 
                         onClick={() => {
                            const link = `${window.location.origin}/onboarding/form?token=${onboarding.token_formulaire}`
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                navigator.clipboard.writeText(link)
                            } else {
                                const textArea = document.createElement("textarea")
                                textArea.value = link
                                document.body.appendChild(textArea)
                                textArea.select()
                                try { document.execCommand('copy') } catch (e) {}
                                document.body.removeChild(textArea)
                            }
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                         }}
                         className="w-full flex items-center justify-center gap-3 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                      >
                         {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                         {copied ? "Lien Copié !" : "URL Formulaire"}
                      </button>
                   </div>
                </div>

                <div className="p-10 pt-0 footer">
                   <button 
                      onClick={onClose}
                      className="w-full py-5 bg-slate-200 text-slate-500 font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-300 transition-all"
                   >
                      Fermer
                   </button>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Validation Custom */}
      <Dialog open={!!taskToValidate} onOpenChange={() => setTaskToValidate(null)}>
        <DialogContent className="max-w-md p-10 bg-white rounded-[2.5rem] border-none shadow-[0_40px_80px_rgba(0,0,0,0.2)]">
          <div className="text-center pb-4">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Valider l'action</h3>
            <p className="text-[13px] font-bold text-indigo-600 bg-indigo-50 py-3 px-6 rounded-2xl inline-block shadow-sm">{taskToValidate?.titre}</p>
          </div>
          <div className="mt-8 space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Observations</label>
                <textarea 
                  value={validationComment}
                  onChange={(e) => setValidationComment(e.target.value)}
                  className="w-full h-36 p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all resize-none shadow-inner"
                  placeholder="Notes de réalisation..."
                />
             </div>
             <div className="flex gap-4">
                <button onClick={() => setTaskToValidate(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-200">Annuler</button>
                <button 
                  onClick={() => toggleTaskMutation.mutate({ taskId: taskToValidate.id, done: true, commentaire: validationComment })}
                  disabled={toggleTaskMutation.isPending}
                  className="flex-[2] py-4 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3"
                >
                  {toggleTaskMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Confirmer
                </button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
