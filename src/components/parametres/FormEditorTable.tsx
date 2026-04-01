'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowUp, ArrowDown, Trash2, Plus, GitBranch, Settings2, X } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FormField {
  id: string
  label: string
  type: string
  options?: string
  required?: boolean
  half?: boolean
  conditionalOn?: {
    field: string
    values: string[]
  }
  [key: string]: any
}

interface FormEditorTableProps {
  fields: FormField[]
  onChange: (newFields: FormField[]) => void
  listsConfig?: string
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texte' },
  { value: 'select', label: 'Sélection' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Oui/Non' },
  { value: 'agent', label: 'Recherche Agent' },
  { value: 'textarea', label: 'Zone de texte' },
  { value: 'multiselect', label: 'Sélections multiples' },
  { value: 'section', label: 'Section (Nouv. Page)' },
  { value: 'title', label: 'Titre (Même Page/Contour)' },
]

export function FormEditorTable({ fields = [], onChange, listsConfig }: FormEditorTableProps) {
  const [condEdit, setCondEdit] = useState<{ 
    index: number, 
    targetField: string, 
    values: string[] 
  } | null>(null)

  const lists = (() => {
    try { return JSON.parse(listsConfig || '{}') } catch(e) { return {} }
  })()

  const getFieldOptions = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return []
    if (field.type === 'boolean') return ['Oui', 'Non']
    if ((field.type === 'select' || field.type === 'multiselect') && field.options) {
        return lists[field.options] || []
    }
    return []
  }

  const move = (index: number, direction: 'up' | 'down') => {
    if (!Array.isArray(fields)) return
    const newFields = [...fields]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= newFields.length) return
    ;[newFields[index], newFields[target]] = [newFields[target], newFields[index]]
    onChange(newFields)
  }

  const update = (index: number, partial: Partial<FormField>) => {
    if (!Array.isArray(fields)) return
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...partial }
    onChange(newFields)
  }

  const saveCondition = (index: number, cond: FormField['conditionalOn'] | null) => {
    if (!Array.isArray(fields)) return
    const newFields = [...fields]
    if (cond) newFields[index] = { ...newFields[index], conditionalOn: cond }
    else {
        const { conditionalOn, ...rest } = newFields[index]
        newFields[index] = rest
    }
    onChange(newFields)
    setCondEdit(null)
  }

  const handleDelete = (index: number) => {
    if (!Array.isArray(fields)) return
    onChange(fields.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="w-[80px] px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Ordre</TableHead>
            <TableHead className="w-[180px] px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Identifiant (ID)</TableHead>
            <TableHead className="px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Libellé</TableHead>
            <TableHead className="w-[160px] px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</TableHead>
            <TableHead className="w-[140px] px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Options</TableHead>
            <TableHead className="text-center w-[60px] px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Req.</TableHead>
            <TableHead className="text-center w-[60px] px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Demi</TableHead>
            <TableHead className="text-center w-[60px] px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Cond.</TableHead>
            <TableHead className="text-right w-10 px-2"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(fields) && fields.map((field, index) => (
            <TableRow key={`${field.id}-${index}`} className={`group hover:bg-slate-50/50 transition-colors ${field.type === 'section' ? 'bg-indigo-50/30' : field.type === 'title' ? 'bg-slate-50/30' : ''}`}>
              <TableCell className="px-2">
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => move(index, 'up')} disabled={index === 0}>
                    <ArrowUp size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => move(index, 'down')} disabled={index === fields.length - 1}>
                    <ArrowDown size={12} />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="px-2">
                <Input value={field.id} onChange={(e) => update(index, { id: e.target.value })} className="h-7 text-[10px] font-mono px-2" />
              </TableCell>
              <TableCell className="px-2">
                <Input value={field.label} onChange={(e) => update(index, { label: e.target.value })} className={`h-7 text-[10px] px-2 ${field.type === 'section' ? 'font-black uppercase text-indigo-700' : field.type === 'title' ? 'font-bold text-slate-700' : ''}`} />
              </TableCell>
              <TableCell className="px-2">
                <Select value={field.type} onValueChange={(val) => update(index, { type: val })}>
                  <SelectTrigger className="h-7 text-[10px] px-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="px-2">
                {(field.type === 'select' || field.type === 'multiselect') && (
                  <Input 
                    value={field.options || ''} 
                    onChange={(e) => update(index, { options: e.target.value })} 
                    className="h-7 text-[9px] font-bold px-2 placeholder:italic"
                    placeholder="LIST_..."
                  />
                )}
              </TableCell>
              <TableCell className="text-center px-1">
                {(field.type !== 'title' && field.type !== 'section') && <Checkbox checked={!!field.required} onCheckedChange={(val) => update(index, { required: !!val })} />}
              </TableCell>
              <TableCell className="text-center px-1">
                {(field.type !== 'title' && field.type !== 'section') && <Checkbox checked={!!field.half} onCheckedChange={(val) => update(index, { half: !!val })} />}
              </TableCell>
              <TableCell className="text-center px-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ${field.conditionalOn ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300'}`}
                  onClick={() => setCondEdit({ 
                    index, 
                    targetField: field.conditionalOn?.field || '', 
                    values: field.conditionalOn?.values || [] 
                  })}
                >
                  <GitBranch size={12} />
                </Button>
              </TableCell>
              <TableCell className="text-right px-2">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-400 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(index)}>
                  <Trash2 size={12} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!Array.isArray(fields) || fields.length === 0) && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-slate-300 italic text-xs">
                Aucun champ défini. Ajoutez un champ pour commencer.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <Button variant="outline" className="w-full border-dashed border-2 py-4 h-auto text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-50" onClick={() => onChange([...(Array.isArray(fields) ? fields : []), { id: 'nouveau', label: 'Nouveau', type: 'text' }])}>
        <Plus size={14} className="mr-2" /> Ajouter un champ au formulaire
      </Button>

      {condEdit && (
        <Dialog open={!!condEdit} onOpenChange={() => setCondEdit(null)}>
          <DialogContent className="max-w-md bg-white p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-3 text-indigo-700 font-black uppercase tracking-tight text-lg">
                <div className="p-2 bg-indigo-50 rounded-xl">
                   <GitBranch size={20} />
                </div>
                Affichage Conditionnel
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Si le champ suivant :</Label>
                <Select 
                  value={condEdit.targetField} 
                  onValueChange={(val) => setCondEdit({ ...condEdit, targetField: val, values: [] })}
                >
                  <SelectTrigger className="h-11 bg-slate-50 border-slate-100 rounded-xl text-xs font-bold text-slate-700">
                    <SelectValue placeholder="Choisir un champ..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-xl border-slate-100">
                    <ScrollArea className="h-60">
                      {fields.filter((_, i) => i !== condEdit.index).map(f => (
                        <SelectItem key={f.id} value={f.id} className="text-xs font-medium py-2 px-3">
                           <span className="font-black text-indigo-600 mr-2 opacity-50">[{f.id}]</span> {f.label}
                        </SelectItem>
                      ))}
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
                                 onChange={(e) => setCondEdit({ ...condEdit, values: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
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
