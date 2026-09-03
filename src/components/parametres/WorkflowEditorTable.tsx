'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Clock, ShieldCheck, Mail, Users, ArrowRight, Save, GripVertical, Info, GitBranch, Settings2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

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
  // Tâche générée seulement si ce champ du formulaire manager contient l'une
  // de ces valeurs (ex. la case "Téléphone portable / Carte SIM" cochée) —
  // même forme et mêmes sémantiques que FormEditorTable.conditionalOn.
  conditionalOn?: {
    field: string
    values: string[]
  }
}

interface DsihubGroup {
  id: number
  name: string
  description?: string
  members?: string[]
}

interface FormField {
  id: string
  label: string
  type: string
  options?: string
  [key: string]: any
}

interface WorkflowEditorTableProps {
  value: string
  onChange: (value: string) => void
  // Champs du formulaire manager (ONBOARDING_FORM_CONFIG) et leurs listes de
  // valeurs (ONBOARDING_LISTS_CONFIG), pour proposer le même sélecteur de
  // condition que sur les champs du formulaire eux-mêmes.
  formFields?: FormField[]
  listsConfig?: string
}

export function WorkflowEditorTable({ value, onChange, formFields = [], listsConfig }: WorkflowEditorTableProps) {
  const [tasks, setTasks] = useState<WorkflowTask[]>([])
  const [dsihubGroups, setDsihubGroups] = useState<DsihubGroup[]>([])
  const [dsihubError, setDsihubError] = useState('')
  const [condEdit, setCondEdit] = useState<{ index: number, targetField: string, values: string[] } | null>(null)

  const lists = (() => {
    try { return JSON.parse(listsConfig || '{}') } catch (e) { return {} }
  })()

  const getFieldOptions = (fieldId: string) => {
    const field = formFields.find((f) => f.id === fieldId)
    if (!field) return []
    if (field.type === 'boolean') return ['Oui', 'Non']
    if ((field.type === 'select' || field.type === 'multiselect') && field.options) {
      return lists[field.options] || []
    }
    return []
  }

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
        conditionalOn: t.conditionalOn || undefined,
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

  const saveCondition = (index: number, cond: WorkflowTask['conditionalOn'] | null) => {
    const newTasks = [...tasks]
    if (cond) newTasks[index] = { ...newTasks[index], conditionalOn: cond }
    else {
      const { conditionalOn, ...rest } = newTasks[index]
      newTasks[index] = rest
    }
    updateAndNotify(newTasks)
    setCondEdit(null)
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
                     <TableHead className="w-[70px] text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Cond.</TableHead>
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
                       <TableCell className="py-4 text-center">
                          <Button
                             variant="ghost"
                             size="icon-sm"
                             className={task.conditionalOn ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300'}
                             onClick={() => setCondEdit({ index: idx, targetField: task.conditionalOn?.field || '', values: task.conditionalOn?.values || [] })}
                             title={task.conditionalOn ? `Condition : ${formFields.find((f) => f.id === task.conditionalOn?.field)?.label || task.conditionalOn.field}` : 'Ajouter une condition'}
                          >
                             <GitBranch size={14} />
                          </Button>
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
                       <TableCell colSpan={7} className="py-24 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/20">
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

      {condEdit && (
        <Dialog open={!!condEdit} onOpenChange={() => setCondEdit(null)}>
          <DialogContent className="max-w-xl bg-white p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-3 text-indigo-700 font-black uppercase tracking-tight text-lg">
                <div className="p-2 bg-indigo-50 rounded-xl">
                   <GitBranch size={20} />
                </div>
                Tâche Conditionnelle
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ne générer cette tâche que si le champ du formulaire :</Label>
                <Select
                  value={condEdit.targetField}
                  onValueChange={(val) => setCondEdit({ ...condEdit, targetField: val, values: [] })}
                >
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-100 rounded-xl text-xs font-bold text-slate-700">
                    <SelectValue placeholder="Choisir un champ..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-xl border-slate-100">
                    <ScrollArea className="h-60">
                      {formFields.map((f) => (
                        <SelectItem key={f.id} value={f.id} className="text-xs font-medium py-2 px-3">
                           <span className="font-black text-indigo-600 mr-2 opacity-50">[{f.id}]</span> {f.label}
                        </SelectItem>
                      ))}
                      {formFields.length === 0 && (
                        <div className="px-3 py-2 text-xs text-slate-400 italic">Aucun champ défini dans l'onglet "Description Formulaire"</div>
                      )}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Contient {condEdit.targetField ? "l'une de ces valeurs :" : "..."}
                </Label>

                {condEdit.targetField ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <ScrollArea className="h-[200px] pr-4">
                      {(() => {
                        const options = getFieldOptions(condEdit.targetField)
                        if (options.length === 0) {
                          return (
                            <div className="space-y-4">
                               <p className="text-[10px] text-slate-400 italic">Valeurs libres (séparées par virgule) :</p>
                               <Input
                                 className="bg-white h-10 text-xs"
                                 placeholder="Valeur 1, Valeur 2..."
                                 value={condEdit.values.join(', ')}
                                 onChange={(e) => setCondEdit({ ...condEdit, values: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                               />
                            </div>
                          )
                        }
                        return (
                          <div className="grid grid-cols-1 gap-2">
                            {options.map((opt: string) => (
                              <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${condEdit.values.includes(opt) ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white border-slate-100 hover:border-indigo-200'}`}>
                                <Checkbox
                                  checked={condEdit.values.includes(opt)}
                                  onCheckedChange={(checked) => {
                                    if (checked) setCondEdit({ ...condEdit, values: [...condEdit.values, opt] })
                                    else setCondEdit({ ...condEdit, values: condEdit.values.filter((v: string) => v !== opt) })
                                  }}
                                  className={condEdit.values.includes(opt) ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-600' : ''}
                                />
                                <span className={`text-[11px] font-bold ${condEdit.values.includes(opt) ? 'text-white' : 'text-slate-600'}`}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )
                      })()}
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-slate-300 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                     <Settings2 size={24} className="opacity-10 mb-2" />
                     <p className="text-[10px] font-bold uppercase italic opacity-40">Sélectionnez d'abord un champ</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveCondition(condEdit.index, null)}
                className="text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 px-4 h-10 gap-2"
              >
                <X size={14} /> Supprimer la condition
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 h-10 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 disabled:opacity-30 transition-all hover:bg-indigo-700"
                disabled={!condEdit.targetField || condEdit.values.length === 0}
                onClick={() => saveCondition(condEdit.index, { field: condEdit.targetField, values: condEdit.values })}
              >
                Appliquer la condition
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
