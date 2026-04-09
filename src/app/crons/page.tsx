'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Clock, Play, Plus, Trash2, Edit2, Loader2, Power } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function CronsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'rh', schedule_type: 'daily', schedule: '02:00' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: crons, isLoading } = useQuery({
    queryKey: ['crons'],
    queryFn: async () => {
      const res = await fetch('/api/crons')
      return res.json()
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId ? `/api/crons/${editingId}` : '/api/crons'
      const res = await fetch(url, {
        method, body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error('Erreur de sauvegarde')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crons'] })
      setShowForm(false)
      setEditingId(null)
    }
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number, is_active: boolean }) => {
      await fetch(`/api/crons/${id}`, {
        method: 'PATCH', body: JSON.stringify({ is_active }), headers: { 'Content-Type': 'application/json' }
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crons'] })
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/crons/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crons'] })
  })

  const handleEdit = (cron: any) => {
    setFormData(cron)
    setEditingId(cron.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  return (
    <div className="flex bg-[#f4f6fb] text-[#1a2340] min-h-screen">
      <Sidebar />
      <PageContainer title="Automatisations" subtitle="Gestion des tâches planifiées en arrière-plan">
        <PageHeader 
          title="Tâches Cron"
          icon={Clock}
          actions={
            <button 
              onClick={() => { setEditingId(null); setFormData({ name: '', type: 'rh', schedule_type: 'daily', schedule: '02:00' }); setShowForm(true); }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
            >
              <Plus size={16} /> Nouvelle tâche
            </button>
          }
        />

        {showForm && (
          <div className="glass-card p-6 mb-8 border-t-4 border-indigo-500 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">
              {editingId ? 'Modifier la tâche' : 'Nouvelle automatisation'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nom explicite</label>
                <input required type="text" className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Synchro Nuit" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cible (Synchro)</label>
                <select className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="rh">Ressources Humaines (RH)</option>
                  <option value="ad">Active Directory (AD)</option>
                  <option value="azure">Azure AD (Office 365)</option>
                  <option value="mairie">Base Noms (Mairie)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type de cycle</label>
                <select className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white" value={formData.schedule_type} onChange={e => setFormData({...formData, schedule_type: e.target.value})}>
                  <option value="daily">Quotidien (Heure fixe)</option>
                  <option value="hourly">Toutes les heures</option>
                  <option value="every_x_hours">Toutes les X heures</option>
                  <option value="custom">Personnalisé (Cron Unix)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   {formData.schedule_type === 'daily' ? 'Heure (MM:HH)' : formData.schedule_type === 'every_x_hours' ? 'Nombre d\'heures' : formData.schedule_type === 'hourly' ? 'Ignoré' : 'Expression cron'}
                </label>
                <input required disabled={formData.schedule_type === 'hourly'} type={formData.schedule_type === 'daily' ? 'time' : formData.schedule_type === 'every_x_hours' ? 'number' : 'text'} min="1" max="23" className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white disabled:opacity-50" value={formData.schedule_type === 'hourly' ? '0 * * * *' : formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} placeholder={formData.schedule_type === 'custom' ? '0 2 * * *' : ''} />
              </div>

              <div className="lg:col-span-4 flex gap-3 pt-2">
                <button disabled={saveMutation.isPending} type="submit" className="px-5 py-2.5 bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition">
                  {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer et planifier'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-white text-slate-500 text-[11px] font-black uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          {isLoading ? (
             <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : crons?.length === 0 ? (
             <div className="p-12 text-center text-slate-400 font-medium">Aucune automatisation configurée.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-4 pl-6 text-[10px] font-black tracking-widest text-slate-400 uppercase">Tâche</th>
                  <th className="py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">Cible</th>
                  <th className="py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">Planification</th>
                  <th className="py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">Dernier Lancement</th>
                  <th className="py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">Statut</th>
                  <th className="py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crons?.map((cron: any) => (
                  <tr key={cron.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-6">
                       <span className="font-bold text-slate-800">{cron.name}</span>
                    </td>
                    <td className="py-4">
                       <StatusBadge status={cron.type === 'rh' ? 'success' : 'info'}>{cron.type.toUpperCase()}</StatusBadge>
                    </td>
                    <td className="py-4">
                       <span className="text-xs font-mono font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                          {cron.schedule_type === 'daily' ? `Tous les jours à ${cron.schedule}` : cron.schedule_type === 'every_x_hours' ? `Toutes les ${cron.schedule}h` : cron.schedule_type === 'hourly' ? `Chaque heure` : cron.schedule}
                       </span>
                    </td>
                    <td className="py-4 text-xs font-semibold text-slate-500">
                       {cron.last_run ? new Date(cron.last_run).toLocaleString('fr-FR') : 'Jamais exécuté'}
                    </td>
                    <td className="py-4">
                       <button onClick={() => toggleMutation.mutate({ id: cron.id, is_active: !cron.is_active })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${cron.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                          <Power size={12} /> {cron.is_active ? 'Actif' : 'En pause'}
                       </button>
                    </td>
                    <td className="py-4 pr-6">
                       <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(cron)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Modifier">
                             <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteMutation.mutate(cron.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Supprimer">
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </PageContainer>
    </div>
  )
}
