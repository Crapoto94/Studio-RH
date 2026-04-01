'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, List, GripVertical, ChevronRight, LayoutGrid } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ListEditorTableProps {
  value: string
  onChange: (value: string) => void
}

export function ListEditorTable({ value, onChange }: ListEditorTableProps) {
  const [lists, setLists] = useState<Record<string, string[]>>({})
  const [selectedList, setSelectedList] = useState<string | null>(null)

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '{}')
      setLists(parsed)
      if (!selectedList && Object.keys(parsed).length > 0) {
        setSelectedList(Object.keys(parsed)[0])
      }
    } catch (e) {
      console.error('Invalid JSON for lists', e)
    }
  }, [value])

  const updateAndNotify = (newLists: Record<string, string[]>) => {
    setLists(newLists)
    onChange(JSON.stringify(newLists, null, 2))
  }

  const addList = () => {
    const listName = prompt('Nom de la nouvelle liste (ex: LIST_TYPE_MATERIEL)')
    if (listName && !lists[listName]) {
      const newLists = { ...lists, [listName]: [] }
      updateAndNotify(newLists)
      setSelectedList(listName)
    }
  }

  const deleteList = (name: string) => {
    if (confirm(`Supprimer la liste "${name}" ?`)) {
       const newLists = { ...lists }
       delete newLists[name]
       updateAndNotify(newLists)
       if (selectedList === name) setSelectedList(Object.keys(newLists)[0] || null)
    }
  }

  const addItem = () => {
    if (!selectedList) return
    const newItem = prompt('Valeur de l\'option')
    if (newItem) {
      const newItems = [...(lists[selectedList] || []), newItem]
      updateAndNotify({ ...lists, [selectedList]: newItems })
    }
  }

  const removeItem = (index: number) => {
    if (!selectedList) return
    const newItems = [...lists[selectedList]]
    newItems.splice(index, 1)
    updateAndNotify({ ...lists, [selectedList]: newItems })
  }

  const listKeys = Object.keys(lists)

  return (
    <div className="flex h-[500px] border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Sidebar des Listes */}
      <div className="w-[300px] border-r border-slate-100 bg-slate-50/50 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Mes Listes Déroulantes</h4>
           <Button variant="ghost" size="icon-sm" onClick={addList} className="h-7 w-7 text-indigo-600 hover:bg-indigo-50">
              <Plus size={16} />
           </Button>
        </div>
        <ScrollArea className="flex-1">
           <div className="p-2 space-y-1">
              {listKeys.map(key => (
                <button 
                  key={key}
                  onClick={() => setSelectedList(key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${selectedList === key ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-white hover:border-slate-200 border border-transparent'}`}
                >
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedList === key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>
                         <List size={14} />
                      </div>
                      <span className={`text-xs font-bold ${selectedList === key ? 'text-indigo-900' : 'text-slate-600'}`}>{key}</span>
                   </div>
                   <span className="text-[9px] font-black opacity-30 uppercase">{lists[key].length} Items</span>
                </button>
              ))}
              {listKeys.length === 0 && (
                <div className="py-10 text-center text-slate-300">
                   <p className="text-[10px] font-bold uppercase italic">Aucune liste définie</p>
                </div>
              )}
           </div>
        </ScrollArea>
      </div>

      {/* Détail d'Édition */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedList ? (
          <>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
               <div className="flex items-center gap-4">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">{selectedList}</h3>
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-bold h-5 uppercase text-[9px]">{lists[selectedList].length} Options</Badge>
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => deleteList(selectedList)} className="text-rose-600 hover:bg-rose-50 border-rose-100 h-8 gap-2 uppercase text-[10px] font-black">
                     <Trash2 size={12} /> Supprimer liste
                  </Button>
                  <Button onClick={addItem} size="sm" className="bg-slate-900 h-8 gap-2 uppercase text-[10px] font-black shadow-lg">
                     <Plus size={12} /> Ajouter Option
                  </Button>
               </div>
            </div>
            <ScrollArea className="flex-1">
               <div className="p-4">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="border-none">
                         <TableHead className="w-12"></TableHead>
                         <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valeur affichée / ID</TableHead>
                         <TableHead className="w-20 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lists[selectedList].map((item, idx) => (
                        <TableRow key={`${item}-${idx}`} className="group hover:bg-slate-50/50 border-slate-50">
                           <TableCell className="py-3 pl-4">
                              <GripVertical size={14} className="text-slate-200" />
                           </TableCell>
                           <TableCell className="py-3">
                              <Input 
                                value={item}
                                onChange={(e) => {
                                  const newItems = [...lists[selectedList]]
                                  newItems[idx] = e.target.value
                                  updateAndNotify({ ...lists, [selectedList]: newItems })
                                }}
                                className="h-8 border-none bg-transparent font-bold text-slate-700 shadow-none focus-visible:ring-0 focus-visible:bg-white focus-visible:border focus-visible:border-indigo-100 transition-all p-0"
                              />
                           </TableCell>
                           <TableCell className="py-3 text-right">
                              <Button variant="ghost" size="icon-sm" onClick={() => removeItem(idx)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                                 <Trash2 size={14} />
                              </Button>
                           </TableCell>
                        </TableRow>
                      ))}
                      {lists[selectedList].length === 0 && (
                        <TableRow>
                           <TableCell colSpan={3} className="py-20 text-center text-slate-300 bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-100">
                              <p className="text-xs font-black uppercase tracking-widest italic opacity-40">Définissez vos options de liste</p>
                           </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
               </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
             <LayoutGrid size={48} className="opacity-10 mb-4" />
             <p className="text-xs font-black uppercase tracking-widest italic opacity-40">Sélectionnez ou créez une liste pour l'éditer</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { ScrollArea } from '@/components/ui/scroll-area'
