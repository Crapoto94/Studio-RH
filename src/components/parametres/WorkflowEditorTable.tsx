'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Clock, ShieldCheck, Mail, Users, ArrowRight, Save, GripVertical, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type RecipientType = 'email' | 'dsihub'

interface WorkflowTask {
  task: string
  recipientType: RecipientType
  // recipientType === 'email' : envoie un mail avec lien d'acquittement public.
  email?: string
  // recipientType === 'dsihub' : pousse une tâche dans DSI Hub, affectée à ce
  // groupe technicien (dsihubGroupName mis en cache pour affichage sans
  // dépendre d'un re-fetch de la liste des groupes).
  dsihubGroupId?: number
  dsihubGroupName?: string
  delay: number
}

interface DsihubGroup {
  id: number
  name: string
  description?: string
  members?: string[]
}

interface WorkflowEditorTableProps {
  value: string
  onChange: (value: string) => void
}

export function WorkflowEditorTable({ value, onChange }: WorkflowEditorTableProps) {
  const [tasks, setTasks] = useState<WorkflowTask[]>([])
  const [dsihubGroups, setDsihubGroups] = useState<DsihubGroup[]>([])
  const [dsihubError, setDsihubError] = useState('')

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '[]')
      // Compat ascendante : les anciennes entrées {task, owner, delay} (sans
      // recipientType, jamais reliées à un email fonctionnel) deviennent des
      // tâches email vides à compléter.
      const normalized: WorkflowTask[] = (Array.isArray(parsed) ? parsed : []).map((t: any) => ({
        task: t.task || t.label || t.titre || '',
        recipientType: (t.recipientType === 'dsihub' ? 'dsihub' : 'email') as RecipientType,
        email: t.email || '',
        dsihubGroupId: t.dsihubGroupId,
        dsihubGroupName: t.dsihubGroupName,
        delay: t.delay ?? 0,
      }))
      setTasks(normalized)
    } catch (e) {
      console.error('Invalid JSON for workflow', e)
    }
  }, [value])

  useEffect(() => {
    fetch('/api/dsihub/groups')
      .then((res) => res.json())
      .then((json) => {
        if (json.error) { setDsihubError(json.message || json.error); return }
        setDsihubGroups(json.data || [])
      })
      .catch(() => setDsihubError('Impossible de contacter DSI Hub'))
  }, [])

  const updateAndNotify = (newTasks: WorkflowTask[]) => {
    setTasks(newTasks)
    onChange(JSON.stringify(newTasks, null, 2))
  }

  const addTask = () => {
    const newTasks = [...tasks, { task: 'Nouvelle tâche', recipientType: 'email' as RecipientType, email: '', delay: 0 }]
    updateAndNotify(newTasks)
  }

  const removeTask = (index: number) => {
    const newTasks = [...tasks]
    newTasks.splice(index, 1)
    updateAndNotify(newTasks)
  }

  const updateTask = (index: number, patch: Partial<WorkflowTask>) => {
    const newTasks = [...tasks]
    newTasks[index] = { ...newTasks[index], ...patch }
    updateAndNotify(newTasks)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg">
               <ShieldCheck size={16} />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">Actions Automatiques</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow par défaut généré à la validation du formulaire manager</p>
            </div>
         </div>
         <Button onClick={addTask} size="sm" className="bg-slate-900 h-9 gap-2 uppercase text-[10px] font-black shadow-lg">
            <Plus size={14} /> Ajouter une action
         </Button>
      </div>

      {dsihubError && (
        <div className="px-6 py-2 text-[11px] font-bold text-amber-700 bg-amber-50 border-b border-amber-100">
          ⚠️ Groupes DSI Hub indisponibles : {dsihubError} — vérifiez la clé API DSIHub dans Paramètres.
        </div>
      )}

      <ScrollArea className="flex-1">
         <div className="p-6">
            <Table>
               <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                  <TableRow className="border-none">
                     <TableHead className="w-12"></TableHead>
                     <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Libellé de l'action / Tâche</TableHead>
                     <TableHead className="w-[130px] text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</TableHead>
                     <TableHead className="w-[220px] text-[10px] font-black uppercase text-slate-400 tracking-widest">Destinataire</TableHead>
                     <TableHead className="w-[130px] text-[10px] font-black uppercase text-slate-400 tracking-widest">Délai (jours)</TableHead>
                     <TableHead className="w-12"></TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {tasks.map((task, idx) => (
                    <TableRow key={idx} className="group border-slate-50 hover:bg-slate-50/50 transition-all align-top">
                       <TableCell className="py-4">
                          <GripVertical size={14} className="text-slate-200" />
                       </TableCell>
                       <TableCell className="py-4">
                          <Input
                            value={task.task}
                            onChange={(e) => updateTask(idx, { task: e.target.value })}
                            className="h-9 border-none bg-transparent font-bold text-slate-700 shadow-none focus-visible:ring-0 focus-visible:bg-white focus-visible:border focus-visible:border-indigo-100 p-0 text-sm"
                            placeholder="ex: Préparation PC Portable"
                          />
                       </TableCell>
                       <TableCell className="py-4">
                          <Select value={task.recipientType} onValueChange={(val) => updateTask(idx, { recipientType: val as RecipientType })}>
                             <SelectTrigger className="h-8 border-slate-200 bg-white shadow-none text-xs font-bold uppercase tracking-widest">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="email" className="text-xs font-bold uppercase tracking-widest py-2">
                                   <span className="flex items-center gap-2"><Mail size={12} /> Email autonome</span>
                                </SelectItem>
                                <SelectItem value="dsihub" className="text-xs font-bold uppercase tracking-widest py-2">
                                   <span className="flex items-center gap-2"><Users size={12} /> Tâche DSI Hub</span>
                                </SelectItem>
                             </SelectContent>
                          </Select>
                       </TableCell>
                       <TableCell className="py-4">
                          {task.recipientType === 'email' ? (
                             <Input
                                type="email"
                                value={task.email || ''}
                                onChange={(e) => updateTask(idx, { email: e.target.value })}
                                placeholder="responsable@ivry94.fr"
                                className="h-8 border-slate-200 bg-white text-xs shadow-none"
                             />
                          ) : (
                             <Select
                                value={task.dsihubGroupId ? String(task.dsihubGroupId) : ''}
                                onValueChange={(val) => {
                                   const g = dsihubGroups.find((g) => String(g.id) === val)
                                   updateTask(idx, { dsihubGroupId: g?.id, dsihubGroupName: g?.name })
                                }}
                             >
                                <SelectTrigger className="h-8 border-slate-200 bg-white shadow-none text-xs font-bold">
                                   <SelectValue placeholder="Choisir un groupe…" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                   {dsihubGroups.map((g) => (
                                      <SelectItem key={g.id} value={String(g.id)} className="text-xs font-bold py-2">
                                         {g.name}
                                      </SelectItem>
                                   ))}
                                   {dsihubGroups.length === 0 && (
                                      <div className="px-3 py-2 text-xs text-slate-400">Aucun groupe disponible</div>
                                   )}
                                </SelectContent>
                             </Select>
                          )}
                       </TableCell>
                       <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                             <Input
                                type="number"
                                value={task.delay}
                                onChange={(e) => updateTask(idx, { delay: parseInt(e.target.value) || 0 })}
                                className="h-8 w-16 border-slate-200 bg-white text-center font-bold text-xs shadow-none"
                             />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">J{task.delay >= 0 ? '+' : ''}{task.delay}</span>
                          </div>
                       </TableCell>
                       <TableCell className="py-4 text-right">
                          <Button variant="ghost" size="icon-sm" onClick={() => removeTask(idx)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                             <Trash2 size={16} />
                          </Button>
                       </TableCell>
                    </TableRow>
                  ))}
                  {tasks.length === 0 && (
                    <TableRow>
                       <TableCell colSpan={6} className="py-24 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/20">
                          <Clock size={48} className="mx-auto mb-4 opacity-10" />
                          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Aucune action configurée</p>
                       </TableCell>
                    </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>
      </ScrollArea>

      <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center shrink-0">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
            <Info size={12} /> "Email autonome" envoie un lien d'acquittement public. "Tâche DSI Hub" crée une tâche affectée au groupe choisi, acquittée automatiquement depuis DSI Hub.
         </p>
         <Badge className="bg-indigo-600 text-white font-black uppercase text-[9px] tracking-[0.1em] px-3 py-1 border-none shadow-lg shadow-indigo-500/20">Studio RH Engine</Badge>
      </div>
    </div>
  )
}
