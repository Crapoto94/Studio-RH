'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Clock, ShieldCheck, Mail, Users, ArrowRight, Save, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WorkflowTask {
  task: string
  owner: string
  delay: number
}

interface WorkflowEditorTableProps {
  value: string
  onChange: (value: string) => void
}

export function WorkflowEditorTable({ value, onChange }: WorkflowEditorTableProps) {
  const [tasks, setTasks] = useState<WorkflowTask[]>([])

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '[]')
      setTasks(parsed)
    } catch (e) {
      console.error('Invalid JSON for workflow', e)
    }
  }, [value])

  const updateAndNotify = (newTasks: WorkflowTask[]) => {
    setTasks(newTasks)
    onChange(JSON.stringify(newTasks, null, 2))
  }

  const addTask = () => {
    const newTasks = [...tasks, { task: 'Nouvelle tâche', owner: 'DSI', delay: 0 }]
    updateAndNotify(newTasks)
  }

  const removeTask = (index: number) => {
    const newTasks = [...tasks]
    newTasks.splice(index, 1)
    updateAndNotify(newTasks)
  }

  const updateTask = (index: number, field: keyof WorkflowTask, val: any) => {
    const newTasks = [...tasks]
    newTasks[index] = { ...newTasks[index], [field]: val }
    updateAndNotify(newTasks)
  }

  const owners = ['DSI', 'RH', 'LOGISTIQUE', 'ACCUEIL', 'SÉCURITÉ', 'MANAGER']

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg">
               <ShieldCheck size={16} />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">Actions Automatiques</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow par défaut généré à la création d'un dossier</p>
            </div>
         </div>
         <Button onClick={addTask} size="sm" className="bg-slate-900 h-9 gap-2 uppercase text-[10px] font-black shadow-lg">
            <Plus size={14} /> Ajouter une action
         </Button>
      </div>

      <ScrollArea className="flex-1">
         <div className="p-6">
            <Table>
               <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                  <TableRow className="border-none">
                     <TableHead className="w-12"></TableHead>
                     <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Libellé de l'action / Tâche</TableHead>
                     <TableHead className="w-[180px] text-[10px] font-black uppercase text-slate-400 tracking-widest">Responsable</TableHead>
                     <TableHead className="w-[150px] text-[10px] font-black uppercase text-slate-400 tracking-widest">Délai (jours)</TableHead>
                     <TableHead className="w-12"></TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {tasks.map((task, idx) => (
                    <TableRow key={`${task.task}-${idx}`} className="group border-slate-50 hover:bg-slate-50/50 transition-all">
                       <TableCell className="py-4">
                          <GripVertical size={14} className="text-slate-200" />
                       </TableCell>
                       <TableCell className="py-4">
                          <Input 
                            value={task.task}
                            onChange={(e) => updateTask(idx, 'task', e.target.value)}
                            className="h-9 border-none bg-transparent font-bold text-slate-700 shadow-none focus-visible:ring-0 focus-visible:bg-white focus-visible:border focus-visible:border-indigo-100 p-0 text-sm"
                            placeholder="ex: Préparation PC Portable"
                          />
                       </TableCell>
                       <TableCell className="py-4">
                          <Select value={task.owner} onValueChange={(val) => updateTask(idx, 'owner', val)}>
                             <SelectTrigger className="h-8 border-slate-200 bg-white shadow-none text-xs font-bold uppercase tracking-widest">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {owners.map(o => (
                                   <SelectItem key={o} value={o} className="text-xs font-bold uppercase tracking-widest py-2">
                                      {o}
                                   </SelectItem>
                                ))}
                             </SelectContent>
                          </Select>
                       </TableCell>
                       <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                             <Input 
                                type="number" 
                                value={task.delay}
                                onChange={(e) => updateTask(idx, 'delay', parseInt(e.target.value) || 0)}
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
                       <TableCell colSpan={5} className="py-24 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/20">
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
            <Info size={12} /> J correspond à la date d'arrivée prévue de l'agent.
         </p>
         <Badge className="bg-indigo-600 text-white font-black uppercase text-[9px] tracking-[0.1em] px-3 py-1 border-none shadow-lg shadow-indigo-500/20">Studio RH Engine</Badge>
      </div>
    </div>
  )
}

import { Info } from 'lucide-react'
