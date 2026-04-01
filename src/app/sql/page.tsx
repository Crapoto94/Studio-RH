'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageContainer } from '@/components/layout/PageContainer'
import { AdminGuard } from '@/components/layout/AdminGuard'
import { 
  Database, Play, AlertTriangle, Table as TableIcon, Trash2, 
  RefreshCw, Terminal, Edit2, Save, History, 
  HelpCircle, AlertCircle, CheckSquare, Search,
  X, Filter, MoreVertical, ChevronRight
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'

export default function SqlExplorerPage() {
  const [query, setQuery] = useState('SELECT * FROM "REF_AGENTS" LIMIT 10;')
  
  // États pour l'édition d'enregistrement
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editedData, setEditedData] = useState<any>({})

  const { data: tables = [], isLoading: isLoadingTables, refetch: refetchTables } = useQuery({
    queryKey: ['sql-tables'],
    queryFn: async () => {
      const res = await fetch('/api/sql/tables')
      return res.json()
    }
  })

  const mutation = useMutation({
    mutationFn: async (sql: string) => {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur SQL')
      }
      return res.json()
    }
  })

  // Détecter le nom de la table pour les opérations CRUD
  const detectTable = (sql: string) => {
    const match = sql.match(/FROM\s+"?(\w+)"?/i)
    return match ? match[1] : null
  }

  const handleDelete = (record: any) => {
    const table = detectTable(query)
    if (!table) return alert("Impossible de détecter la table")
    
    // On cherche un ID (priorité: id, ID, matricule, cle)
    const idColumn = record.hasOwnProperty('id') ? 'id' : (record.hasOwnProperty('ID') ? 'ID' : (record.hasOwnProperty('matricule') ? 'matricule' : (record.hasOwnProperty('cle') ? 'cle' : null)))
    if (!idColumn) return alert("Pas de colonne ID unique détectée (id, matricule ou cle nécessaire)")

    const idValue = typeof record[idColumn] === 'string' ? `'${record[idColumn]}'` : record[idColumn]

    if (confirm(`❌ Supprimer cet enregistrement de "${table}" (${idColumn}: ${record[idColumn]}) ? Cette action est irréversible.`)) {
        mutation.mutate(`DELETE FROM "${table}" WHERE "${idColumn}" = ${idValue};`, {
            onSuccess: () => mutation.mutate(query)
        })
    }
  }

  const handleEditOpen = (record: any) => {
    setEditingRecord(record)
    setEditedData({ ...record })
  }

  const handleSaveEdit = () => {
    const table = detectTable(query)
    if (!table) return alert("Table non détectée")

    const idColumn = editingRecord.hasOwnProperty('id') ? 'id' : (editingRecord.hasOwnProperty('ID') ? 'ID' : (editingRecord.hasOwnProperty('matricule') ? 'matricule' : (editingRecord.hasOwnProperty('cle') ? 'cle' : null)))
    if (!idColumn) return alert("ID non trouvé")

    const idValue = typeof editingRecord[idColumn] === 'string' ? `'${editingRecord[idColumn]}'` : editingRecord[idColumn]

    const updates = Object.entries(editedData)
      .filter(([key]) => key !== idColumn)
      .map(([key, val]) => {
        const escapedVal = typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : (val === null ? 'NULL' : val)
        return `"${key}" = ${escapedVal}`
      })
      .join(', ')

    mutation.mutate(`UPDATE "${table}" SET ${updates} WHERE "${idColumn}" = ${idValue};`, {
        onSuccess: () => {
            setEditingRecord(null)
            mutation.mutate(query)
        }
    })
  }

  return (
    <AdminGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {/* Global Navigation Sidebar */}
        <Sidebar />

        <div className="flex-1 flex flex-row overflow-hidden">
          {/* Table Selector (Secondary Sidebar) */}
          <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de données</h2>
               <button onClick={() => refetchTables()} className="p-1 hover:bg-white rounded transition-all">
                  <RefreshCw size={12} className={`text-slate-400 ${isLoadingTables ? 'animate-spin' : ''}`} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {tables.map((table: string) => (
                  <div key={table} className="group flex justify-between items-center pr-1">
                    <button
                      onClick={() => {
                        setQuery(`SELECT * FROM "${table}" LIMIT 50;`)
                        mutation.mutate(`SELECT * FROM "${table}" LIMIT 50;`)
                      }}
                      className={`flex-1 text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all truncate ${
                        query.includes(`FROM "${table}"`) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      {table}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`⚠️ DROP TABLE "${table}" ?`)) {
                            mutation.mutate(`DROP TABLE "${table}";`, {
                                onSuccess: () => refetchTables()
                            })
                        }
                      }}
                      className="p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all rounded-lg"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
               ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
            {/* Page Header */}
            <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                   <Terminal size={20} />
                 </div>
                 <div>
                    <h1 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                      Explorateur SQL
                    </h1>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">DSI INTERNAL • read/write ACCESS</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => mutation.mutate(query)}
                    disabled={mutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                  >
                    {mutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                    Exécuter
                  </button>
              </div>
            </header>

            <div className="flex-1 p-8 overflow-hidden flex flex-col gap-6">
              {/* Console Container */}
              <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-800 shrink-0">
                 <div className="px-6 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Query Console</span>
                    <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">dev.db (SQLite)</span>
                 </div>
                 <textarea
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   className="w-full h-24 p-6 font-mono text-sm text-indigo-200 bg-transparent focus:outline-none resize-none leading-relaxed"
                   spellCheck="false"
                   onKeyDown={(e) => {
                      if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
                          e.preventDefault()
                          mutation.mutate(query)
                      }
                   }}
                 />
              </div>

              {/* Data Table */}
              <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                   {mutation.isPending && (
                     <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                        <RefreshCw size={32} className="animate-spin text-indigo-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recherche en cours...</p>
                     </div>
                   )}

                   {mutation.isError && (
                      <div className="m-8 p-8 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4">
                        <AlertCircle className="text-rose-500 shrink-0" size={20} />
                        <div>
                          <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-1">SQL Syntax Error</p>
                          <p className="text-xs text-rose-600 font-mono italic">{mutation.error.message}</p>
                        </div>
                      </div>
                   )}

                   {mutation.data && Array.isArray(mutation.data.data) && (
                     <table className="w-full border-collapse">
                       <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
                          <tr>
                            <th className="px-6 py-3 text-center text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-slate-50/50 w-32 shrink-0">Actions</th>
                            {mutation.data.data.length > 0 && Object.keys(mutation.data.data[0]).map(key => (
                              <th key={key} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 whitespace-nowrap">
                                {key}
                              </th>
                            ))}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {mutation.data.data.map((row: any, i: number) => (
                             <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                                <td className="px-6 py-2 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-indigo-50/30 transition-colors z-[1]">
                                   <div className="flex items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleEditOpen(row)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                                      >
                                        <Edit2 size={10} />
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(row)}
                                        className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                   </div>
                                </td>
                                {Object.values(row).map((val: any, j: number) => (
                                  <td key={j} className="px-6 py-2.5 text-[11px] font-medium text-slate-600 font-mono whitespace-nowrap">
                                    {val === null ? <span className="text-slate-300 italic">null</span> : String(val)}
                                  </td>
                                ))}
                             </tr>
                          ))}
                       </tbody>
                     </table>
                   )}

                   {mutation.data && !Array.isArray(mutation.data.data) && !mutation.isError && (
                      <div className="flex flex-col items-center justify-center h-full opacity-30 gap-6">
                         <div className="p-8 bg-slate-100 rounded-full">
                           <TableIcon size={64} className="text-slate-400" />
                         </div>
                         <div className="text-center space-y-1">
                            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Prêt pour l'exécution</h4>
                            <p className="text-[10px] text-slate-400 font-medium tracking-tight">Choisissez une table ou tapez une requête libre</p>
                         </div>
                      </div>
                   )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* MODAL EDITION RECORD */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
          <DialogContent className="max-w-2xl p-0 bg-white border-none rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100 shrink-0">
                  <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg">
                        <Edit2 size={18} />
                      </div>
                      Modifier l'enregistrement
                  </DialogTitle>
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-[0.2em] mt-2 w-fit">
                    Table: {detectTable(query)}
                  </span>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    {editingRecord && Object.entries(editingRecord).map(([key, value]) => (
                        <div key={key} className="space-y-1.5 focus-within:z-10 relative">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                                {key}
                            </label>
                            <input 
                                type="text"
                                value={editedData[key] === null ? '' : editedData[key]}
                                onChange={(e) => setEditedData({ ...editedData, [key]: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                placeholder={value === null ? 'null' : ''}
                            />
                        </div>
                    ))}
                  </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0 justify-end">
                  <button 
                      onClick={() => setEditingRecord(null)}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100"
                  >
                      Annuler
                  </button>
                  <button 
                      onClick={handleSaveEdit}
                      disabled={mutation.isPending}
                      className="px-8 py-2.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 shadow-xl transition-all flex items-center gap-3"
                  >
                      {mutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Save size={14} />}
                      Enregistrer
                  </button>
              </div>
          </DialogContent>
      </Dialog>
    </AdminGuard>
  )
}
