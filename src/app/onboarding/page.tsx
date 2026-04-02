'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { UserCheck, Plus, Search, Calendar, MoreVertical, Briefcase, UserPlus, Send, Clock, Trash2, Edit2, AlertTriangle, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDate, formatPrenom, cn } from '@/lib/utils'
import { AddOnboardingDialog } from '@/components/onboarding/AddOnboardingDialog'
import { OnboardingDetailDialog } from '@/components/onboarding/OnboardingDetailDialog'
import { EditOnboardingDialog } from '@/components/onboarding/EditOnboardingDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function OnboardingPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null)
  const [selectedOnboarding, setSelectedOnboarding] = useState<any | null>(null)
  const [editingOnboarding, setEditingOnboarding] = useState<any | null>(null)
  const [deletingOnboarding, setDeletingOnboarding] = useState<any | null>(null)

  // 1. Fetch Onboardings actifs
  const { data: onboardings = [], isLoading: loadingActive } = useQuery({
    queryKey: ['onboardings', 'active'],
    queryFn: async () => {
      const res = await fetch('/api/onboarding')
      return res.json()
    }
  })

  // 2. Fetch Futurs Agents
  const { data: futurs = [], isLoading: loadingFuturs } = useQuery({
    queryKey: ['onboardings', 'futurs'],
    queryFn: async () => {
      const res = await fetch('/api/onboarding?mode=futurs')
      return res.json()
    }
  })

  // 3. Mutations
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/onboarding/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] })
      setDeletingOnboarding(null)
    }
  })

  const isLoading = loadingActive || loadingFuturs

  const safeFuturs = Array.isArray(futurs) ? futurs : []
  const safeActive = Array.isArray(onboardings) ? onboardings : []

  const cols = {
    'A_FAIRE': [
      ...safeFuturs,
      ...safeActive.filter((o: any) => o.statut === 'a_faire')
    ].filter((f: any) => {
      const n = f.nom_temp || f.agent?.nom || f.nom || ''
      const p = f.prenom_temp || f.agent?.prenom || f.prenom || ''
      return !search || n.toLowerCase().includes(search.toLowerCase()) || p.toLowerCase().includes(search.toLowerCase())
    }),
    'DEMANDE': safeActive.filter((o: any) => o.statut === 'en_cours_demande'),
    'REALISATION': safeActive.filter((o: any) => o.statut === 'en_cours_realisation'),
    'TERMINE': safeActive.filter((o: any) => o.statut === 'termine'),
  }

  return (
    <div className="flex bg-[#f4f6fb] text-[#1a2340] min-h-screen">
      <Sidebar />
      <PageContainer
        title="Onboardings"
        subtitle="Suivi des arrivées et demandes d'équipement"
        className="pb-12 !max-w-none px-4"
      >
        <PageHeader
          title="Pipeline d'intégration"
          icon={UserCheck}
          actions={
            <button
              onClick={() => setSelectedAgent('manual')}
              className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Nouvel Arrivant Manuel
            </button>
          }
        />

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Filtrer un agent..."
                className="bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm focus:border-indigo-400 focus:outline-none transition-all w-64 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-160px)] min-h-[600px]">
          <KanbanColumn
            title="À FAIRE (RH)"
            color="#f59e0b"
            items={cols['A_FAIRE']}
            loading={isLoading}
            type="mixed"
            onAssign={setSelectedAgent}
            onSelect={setSelectedOnboarding}
            onDelete={setDeletingOnboarding}
            onEdit={setEditingOnboarding}
          />
          <KanbanColumn
            title="DEMANDES ENVOYÉES"
            color="#3b82f6"
            items={cols['DEMANDE']}
            loading={isLoading}
            type="onboarding"
            onSelect={setSelectedOnboarding}
            onDelete={setDeletingOnboarding}
            onEdit={setEditingOnboarding}
          />
          <KanbanColumn
            title="EN RÉALISATION"
            color="#8b5cf6"
            items={cols['REALISATION']}
            loading={isLoading}
            type="onboarding"
            onSelect={setSelectedOnboarding}
            onDelete={setDeletingOnboarding}
            onEdit={setEditingOnboarding}
          />
          <KanbanColumn
            title="TERMINÉ"
            color="#10b981"
            items={cols['TERMINE']}
            loading={isLoading}
            type="onboarding"
            onSelect={setSelectedOnboarding}
            onDelete={setDeletingOnboarding}
            onEdit={setEditingOnboarding}
          />
        </div>

        <AddOnboardingDialog agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        <OnboardingDetailDialog onboarding={selectedOnboarding} onClose={() => setSelectedOnboarding(null)} />
        <EditOnboardingDialog onboarding={editingOnboarding} onClose={() => setEditingOnboarding(null)} />

        {/* Dialogue de confirmation de suppression */}
        <Dialog open={!!deletingOnboarding} onOpenChange={(open) => !open && setDeletingOnboarding(null)}>
          <DialogContent className="max-w-md bg-white rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
              <DialogTitle className="text-xl font-display font-bold text-rose-600 flex items-center gap-3">
                <AlertTriangle size={24} />
                Confirmer la suppression
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-2">
                Êtes-vous sûr de vouloir supprimer définitivement le dossier onboarding de <strong>{deletingOnboarding?.nom_temp || deletingOnboarding?.agent?.nom} {deletingOnboarding?.prenom_temp || deletingOnboarding?.agent?.prenom}</strong> ?<br /><br />
                Cette action est <strong>irréversible</strong> et supprimera également toutes les tâches logistiques associées.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 flex gap-3">
              <button
                onClick={() => setDeletingOnboarding(null)}
                className="flex-[1] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => deletingOnboarding && deleteMutation.mutate(deletingOnboarding.id)}
                disabled={deleteMutation.isPending}
                className="flex-[2] px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Confirmer la suppression
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </div>
  )
}

function KanbanColumn({ title, color, items, loading, type, onAssign, onSelect, onDelete, onEdit }: {
  title: string,
  color: string,
  items: any[],
  loading: boolean,
  type: 'agent' | 'onboarding' | 'mixed',
  onAssign?: (agent: any) => void,
  onSelect?: (onboarding: any) => void,
  onDelete?: (id: number) => void,
  onEdit?: (onboarding: any) => void
}) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 font-display font-bold text-[13px] tracking-wide" style={{ color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
          {title}
        </div>
        <span className="bg-slate-50 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-400 border border-slate-200">
          {items.length}
        </span>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-32 bg-white/50 animate-pulse rounded-xl border border-slate-200"></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 flex flex-col items-center gap-2">
            <Clock size={24} className="opacity-20" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Aucun dossier</span>
          </div>
        ) : (
          items.map((item, index) => (
            <KanbanCard
              key={item.id ? `id-${item.id}-${index}` : `idx-${index}`}
              item={item}
              color={color}
              type={type}
              onAssign={onAssign}
              onSelect={onSelect}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  )
}

function KanbanCard({ item, color, type, onAssign, onSelect, onDelete, onEdit }: {
  item: any,
  color: string,
  type: 'agent' | 'onboarding' | 'mixed',
  onAssign?: (agent: any) => void,
  onSelect?: (onboarding: any) => void,
  onDelete?: (id: number) => void,
  onEdit?: (onboarding: any) => void
}) {
  const actualType = (type === 'mixed' && item.statut) ? 'onboarding' : (type === 'mixed' ? 'agent' : type)
  const nom = (actualType === 'agent' ? item.nom : (item.agent ? item.agent.nom : item.nom_temp))?.toUpperCase() || ''
  const prenom = formatPrenom(actualType === 'agent' ? item.prenom : (item.agent ? item.agent.prenom : item.prenom_temp))
  const arrivalDate = actualType === 'agent' ? item.date_arrivee : item.date_arrivee_prevue
  const fonction = actualType === 'agent'
    ? (item.poste_l || item.grade_l || 'Poste à définir')
    : (item.poste_temp || item.agent?.poste_l || item.agent?.grade_l || 'Poste à définir')
  const direction = actualType === 'agent' ? item.nom_direction : (item.direction_temp || item.agent?.nom_direction || '')
  const service = actualType === 'agent' ? item.nom_service : (item.service_temp || item.agent?.nom_service || '')

  return (
    <div
      onClick={() => {
        if (actualType === 'onboarding' && item.statut === 'a_faire') {
          onEdit?.(item)
        } else if (actualType === 'onboarding') {
          onSelect?.(item)
        } else {
          onAssign?.(item)
        }
      }}
      className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group relative cursor-pointer"
    >
      <div className="absolute top-0 left-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: color }}></div>

      <div className="flex justify-between items-start mb-1 pl-1">
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-bold text-slate-800 text-[13px] leading-tight group-hover:text-indigo-600 transition-colors uppercase truncate">
            {nom} <span className="normal-case font-medium text-slate-400 ml-1">{prenom}</span>
          </h4>
        </div>

        {actualType === 'onboarding' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <MoreVertical size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-100">
              <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Actions Dossier</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="gap-2 px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer">
                <Edit2 size={14} className="text-indigo-500" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete?.(item); }}
                className="gap-2 px-3 py-2 text-xs font-bold text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
              >
                <Trash2 size={14} /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="pl-1 space-y-1">
        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-tight">
          <Briefcase size={12} className="text-indigo-500" />
          <span className="truncate">{fonction}</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-medium pl-5 truncate italic italic">
          {service || 'Service non défini'}
        </div>

        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            <Calendar size={11} className="text-emerald-500" />
            <span>{formatDate(arrivalDate)}</span>
          </div>

          {actualType === 'agent' && (
            <button
              onClick={(e) => { e.stopPropagation(); onAssign?.(item); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              <UserPlus size={11} /> INITIALISER
            </button>
          )}

          {actualType === 'onboarding' && item.statut === 'a_faire' && (
            <div className="flex items-center gap-1.5 font-bold italic truncate flex-1 justify-end">
              <span className={`text-[10px] ${item.manager_id ? 'text-emerald-500' : 'text-amber-500'} uppercase font-black`}>
                {item.manager_id ? "MANAGER PRÊT" : "MANAGER MANQUANT"}
              </span>
            </div>
          )}

          {actualType === 'onboarding' && item.statut === 'en_cours_demande' && (
            <div className="flex items-center gap-1.5 text-[10px] text-blue-500 font-bold italic">
              <Send size={11} /> ATTENTE RETOUR
            </div>
          )}

          {actualType === 'onboarding' && (item.statut === 'en_cours_realisation' || item.statut === 'termine') && (
            <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold underline">
              VOIR TÂCHES ({item.tasks?.filter((t: any) => t.done).length || 0}/{item.tasks?.length || 0})
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

