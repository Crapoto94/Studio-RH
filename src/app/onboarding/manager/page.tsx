'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPrenom } from '@/lib/utils'
import { LayoutGrid, UserCheck, Clock, CheckCircle2, AlertCircle, Calendar, Briefcase, MapPin, Loader2, Mail, FileText } from 'lucide-react'
import { Suspense } from 'react'

function ManagerDashboardContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const { data: onboardings = [], isLoading, error } = useQuery({
    queryKey: ['onboarding-manager', token],
    queryFn: async () => {
      if (!token) return []
      const res = await fetch(`/api/onboarding/manager?token=${token}`)
      if (!res.ok) throw new Error('Jeton invalide ou accès refusé')
      return res.json()
    },
    enabled: !!token
  })

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full border-rose-100 shadow-xl shadow-rose-50">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Accès Refusé</CardTitle>
            <CardDescription className="text-sm font-medium">Aucun jeton de sécurité n'a été fourni.</CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4">
            <p className="text-slate-500 text-xs leading-relaxed">
              Veuillez utiliser le lien fourni dans vos emails de notification pour accéder à votre espace manager RH.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-bounce">
           <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
        <div className="text-slate-400 font-extrabold uppercase tracking-[0.3em] text-[10px] animate-pulse">
           Chargement de votre espace...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full border-rose-100 shadow-xl shadow-rose-50">
          <CardHeader className="text-center">
             <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
             <CardTitle className="text-rose-700">Erreur d'accès</CardTitle>
             <CardDescription>{(error as Error).message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const manager = onboardings[0]?.manager
  const managerName = manager ? `${manager.prenom} ${manager.nom}` : "Manager"

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-20">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                  <LayoutGrid size={20} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Espace Manager Onboarding</h1>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Bienvenue, {managerName}</p>
            </div>
            
            <div className="flex gap-4">
               <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                     <UserCheck size={20} />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dossiers Actifs</div>
                     <div className="text-xl font-black text-slate-800 tracking-tighter">{onboardings.length}</div>
                  </div>
               </div>
               <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                     <CheckCircle2 size={20} />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tâches Finies</div>
                     <div className="text-xl font-black text-slate-800 tracking-tighter">
                        {onboardings.reduce((acc: number, o: any) => acc + (o.tasks?.filter((t: any) => t.done).length || 0), 0)}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {onboardings.map((o: any) => {
            const totalTasks = o.tasks?.length || 0
            const doneTasks = o.tasks?.filter((t: any) => t.done).length || 0
            const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
            
            const agentNom = (o.agent?.nom || o.nom_temp)?.toUpperCase()
            const agentPrenom = formatPrenom(o.agent?.prenom || o.prenom_temp)
            const arrivalDate = o.date_arrivee_prevue || o.agent?.date_arrivee
            const statusMap: Record<string, string> = {
              'a_faire': 'Initialisation RH',
              'en_cours_demande': 'En attente formulaire',
              'en_cours_realisation': 'En cours de préparation',
              'termine': 'Prêt pour arrivée',
              'annule': 'Annulé'
            }
            const statusLabel = statusMap[o.statut as keyof typeof statusMap] || o.statut

            return (
              <Card key={o.id} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                <div className={o.statut === 'termine' ? 'h-2 bg-emerald-500' : 'h-2 bg-indigo-600'} />
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex flex-col gap-1.5">
                          <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 py-1 px-3 w-fit">
                            {statusLabel}
                          </Badge>
                          <button 
                            onClick={() => window.open(`/api/onboarding/${o.id}/pdf?token=${token}`, '_blank')}
                            className="flex items-center gap-1.5 text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                          >
                            <FileText size={12} />
                            Récapitulatif (PDF)
                          </button>
                       </div>
                       <div className="text-[10px] font-bold text-slate-400 italic">
                          Arrivée {formatDate(arrivalDate)}
                       </div>
                    </div>
                   <CardTitle className="text-xl font-black text-slate-800 tracking-tight uppercase">
                      {agentNom} <span className="normal-case font-medium text-slate-400 ml-1">{agentPrenom}</span>
                   </CardTitle>
                   <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                         <Briefcase size={13} className="text-indigo-500" />
                         {o.poste_temp || o.agent?.poste_l || 'Poste à définir'}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 opacity-80">
                         <MapPin size={13} className="text-slate-300" />
                         {o.service_temp || o.direction_temp || 'Structure non définie'}
                      </div>
                   </div>
                </CardHeader>

                <CardContent className="space-y-6">
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <div className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Avancement Logistique</div>
                         <div className="text-lg font-black text-slate-800 tabular-nums">{progress}%</div>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                         <div 
                           className={`h-full transition-all duration-1000 ${o.statut === 'termine' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-indigo-600 shadow-lg shadow-indigo-200'}`} 
                           style={{ width: `${progress}%` }} 
                         />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-1">
                         <span>{doneTasks} tâches terminées</span>
                         <span>sur {totalTasks} planifiées</span>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-slate-50">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Détails des préparations</div>
                      <div className="space-y-2">
                         {o.tasks?.slice(0, 3).map((task: any) => (
                           <div key={task.id} className="flex items-center gap-3">
                              {task.done ? (
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                              ) : (
                                <Clock size={14} className="text-slate-200 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <span className={`text-[11px] block truncate ${task.done ? 'text-slate-400 line-through' : 'text-slate-600 font-bold'}`}>
                                   {task.titre}
                                </span>
                                {task.commentaire && (
                                  <span className="text-[10px] text-indigo-500/80 font-medium italic block leading-tight mt-0.5">
                                    • {task.commentaire}
                                  </span>
                                )}
                              </div>
                           </div>
                         ))}
                         {totalTasks > 3 && (
                           <div className="text-[10px] font-bold text-indigo-500 pl-6 italic">
                              + {totalTasks - 3} autres tâches...
                           </div>
                         )}
                         {totalTasks === 0 && (
                            <div className="py-4 text-center text-[10px] font-bold text-slate-300 bg-slate-50/50 rounded-xl uppercase tracking-widest border border-dashed border-slate-100">
                               Configuration en cours...
                            </div>
                         )}
                      </div>
                   </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {onboardings.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center gap-6">
             <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-100">
                <Clock size={48} />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Aucun dossier à afficher</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">
                  Il n'y a actuellement aucun agent arrivé récemment ou prévu prochainement lié à votre compte manager.
                </p>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function ManagerDashboardPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ManagerDashboardContent />
    </Suspense>
  )
}
