'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { AdminGuard } from '@/components/layout/AdminGuard'
import {
  Play, Table as TableIcon, Trash2,
  RefreshCw, Terminal, Edit2, Save, AlertCircle, AlertTriangle
} from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
type DbSource = 'postgres' | 'sqlite'

const SOURCES = [
  { value: 'postgres' as DbSource, label: 'PostgreSQL',     icon: '🐘', queryLabel: 'PostgreSQL', color: 'blue',    example: 'SELECT * FROM "REF_AGENTS" LIMIT 10;' },
  { value: 'sqlite'   as DbSource, label: 'SQLite (local)', icon: '📦', queryLabel: 'SQLite',     color: 'emerald', example: 'SELECT * FROM "Parametre" LIMIT 10;'  },
]

const BADGE: Record<DbSource, string> = {
  postgres: 'bg-blue-100 text-blue-700',
  sqlite:   'bg-emerald-100 text-emerald-700',
}
const ACTIVE_TAB: Record<DbSource, string> = {
  postgres: 'bg-blue-600 text-white shadow-lg shadow-blue-100',
  sqlite:   'bg-emerald-600 text-white shadow-lg shadow-emerald-100',
}
const ACTIVE_TABLE: Record<DbSource, string> = {
  postgres: 'bg-blue-600 text-white',
  sqlite:   'bg-emerald-600 text-white',
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function SqlExplorerPage() {
  const [dbSource, setDbSource]       = useState<DbSource>('postgres')
  const [query, setQuery]             = useState(SOURCES[0].example)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editedData, setEditedData]   = useState<any>({})

  const src = SOURCES.find(s => s.value === dbSource)!

  // ── Tables ─────────────────────────────────────────────────────────────────
  const { data: tablesResp, isLoading: isLoadingTables, refetch: refetchTables } = useQuery({
    queryKey: ['sql-tables', dbSource],
    queryFn: async () => {
      const res = await fetch(`/api/sql/tables?source=${dbSource}`)
      return res.json()
    }
  })
  const tables: string[]        = tablesResp?.data || []
  const tableNote: string | undefined = tablesResp?.note

  // ── Requête SQL ────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (sql: string) => {
      const apiSource = dbSource === 'sqlite' ? 'local' : 'main'
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql, source: apiSource })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur SQL')
      return res.json()
    }
  })

  // ── Sélection de table ──────────────────────────────────────────────────────
  const handleSelectTable = (table: string) => {
    const sql = `SELECT * FROM "${table}" LIMIT 50;`
    setQuery(sql)
    mutation.mutate(sql)
  }

  // ── Changement de source ───────────────────────────────────────────────────
  const handleSourceChange = (s: DbSource) => {
    setDbSource(s)
    setQuery(SOURCES.find(x => x.value === s)!.example)
    mutation.reset()
  }

  // ── Helpers CRUD ───────────────────────────────────────────────────────────
  const detectTable = (sql: string) => sql.match(/FROM\s+"?(\w+)"?/i)?.[1] ?? null

  const handleDelete = (record: any) => {
    const table = detectTable(query)
    if (!table) return alert('Table non détectée')
    const idCol = ['id', 'ID', 'matricule', 'cle'].find(c => c in record) ?? null
    if (!idCol) return alert('Pas de colonne ID unique (id, matricule ou cle)')
    const idVal = typeof record[idCol] === 'string' ? `'${record[idCol]}'` : record[idCol]
    if (confirm(`❌ Supprimer cet enregistrement de "${table}" (${idCol}: ${record[idCol]}) ?`)) {
      const apiSrc = dbSource === 'sqlite' ? 'local' : 'main'
      fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `DELETE FROM "${table}" WHERE "${idCol}" = ${idVal};`, source: apiSrc })
      }).then(() => mutation.mutate(query))
    }
  }

  const handleSaveEdit = () => {
    const table = detectTable(query)
    if (!table || !editingRecord) return
    const idCol = ['id', 'ID', 'matricule', 'cle'].find(c => c in editingRecord) ?? null
    if (!idCol) return alert('ID non trouvé')
    const idVal = typeof editingRecord[idCol] === 'string' ? `'${editingRecord[idCol]}'` : editingRecord[idCol]
    const updates = Object.entries(editedData)
      .filter(([k]) => k !== idCol)
      .map(([k, v]) => {
        const esc = typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : (v === null ? 'NULL' : v)
        return `"${k}" = ${esc}`
      }).join(', ')
    const apiSrc = dbSource === 'sqlite' ? 'local' : 'main'
    fetch('/api/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `UPDATE "${table}" SET ${updates} WHERE "${idCol}" = ${idVal};`, source: apiSrc })
    }).then(() => { setEditingRecord(null); mutation.mutate(query) })
  }

  const rows: any[] = mutation.data?.data && Array.isArray(mutation.data.data) ? mutation.data.data : []
  const cols: string[] = rows.length > 0 ? Object.keys(rows[0]) : []

  return (
    <AdminGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <Sidebar />

        <div className="flex-1 flex flex-row overflow-hidden">
          {/* ── Sidebar : sélecteur source + tables ── */}
          <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
            {/* Sélecteur de base */}
            <div className="p-4 border-b border-slate-100 bg-white/60 space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Base de données</p>
              {SOURCES.map(opt => (
                <button key={opt.value}
                  onClick={() => handleSourceChange(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                    dbSource === opt.value ? ACTIVE_TAB[opt.value] : 'text-slate-500 hover:bg-white hover:shadow-sm'
                  )}
                >
                  <span className="text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Liste des tables */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tables</p>
              <button onClick={() => refetchTables()} className="p-1 hover:bg-white rounded transition-all">
                <RefreshCw size={11} className={cn('text-slate-400', isLoadingTables && 'animate-spin')} />
              </button>
            </div>

            {tableNote && (
              <div className="mx-4 mb-2 px-2 py-1.5 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-1.5">
                <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-700 leading-tight">{tableNote}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
              {isLoadingTables ? (
                <div className="flex items-center gap-2 py-4 text-slate-400">
                  <RefreshCw size={12} className="animate-spin" />
                  <span className="text-[10px]">Chargement…</span>
                </div>
              ) : tables.length === 0 ? (
                <p className="text-[10px] text-slate-400 py-4 text-center italic">Aucune table trouvée</p>
              ) : tables.map((table: string) => (
                <div key={table} className="group flex items-center gap-1">
                  <button
                    onClick={() => handleSelectTable(table)}
                    className={cn(
                      'flex-1 text-left px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all truncate',
                      query.toLowerCase().includes(`"${table.toLowerCase()}"`)
                        ? ACTIVE_TABLE[dbSource]
                        : 'text-slate-500 hover:bg-white hover:shadow-sm'
                    )}
                  >
                    {table}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`⚠️ DROP TABLE "${table}" ?`)) {
                        const apiSrc = dbSource === 'sqlite' ? 'local' : 'main'
                        fetch('/api/sql', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ query: `DROP TABLE "${table}";`, source: apiSrc })
                        }).then(() => refetchTables())
                      }
                    }}
                    className="p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all rounded-lg shrink-0"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Zone principale ── */}
          <main className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-slate-100 flex items-center justify-between px-8 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                  <Terminal size={18} />
                </div>
                <div>
                  <h1 className="text-base font-black text-slate-800 tracking-tight uppercase">Explorateur SQL</h1>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em]">
                    DSI Internal •{' '}
                    <span className={cn('px-1.5 py-0.5 rounded font-bold', BADGE[dbSource])}>
                      {src.icon} {src.queryLabel}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => mutation.mutate(query)}
                disabled={mutation.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
              >
                {mutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                Exécuter
                <span className="text-slate-500 font-normal normal-case tracking-normal text-[9px]">Ctrl+Enter</span>
              </button>
            </header>

            <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
              {/* Console SQL */}
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 shrink-0">
                <div className="px-5 py-2 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Query Console</span>
                  <span className={cn('text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-widest', BADGE[dbSource])}>
                    {src.icon} {src.queryLabel}
                  </span>
                </div>
                <textarea
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full h-24 p-5 font-mono text-sm text-indigo-200 bg-transparent focus:outline-none resize-none leading-relaxed"
                  spellCheck={false}
                  onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); mutation.mutate(query) } }}
                />
              </div>

              {/* Résultats */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                  {/* Chargement */}
                  {mutation.isPending && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                      <RefreshCw size={28} className="animate-spin text-indigo-500" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exécution en cours…</p>
                    </div>
                  )}

                  {/* Erreur */}
                  {mutation.isError && (
                    <div className="m-6 p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4">
                      <AlertCircle className="text-rose-500 shrink-0" size={18} />
                      <div>
                        <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-1">Erreur SQL</p>
                        <p className="text-xs text-rose-600 font-mono">{mutation.error?.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Table de résultats */}
                  {mutation.isSuccess && rows.length > 0 && (
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
                        <tr>
                          <th className="px-4 py-3 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-slate-50/80 w-24 text-center">
                            Actions
                          </th>
                          {cols.map(key => (
                            <th key={key} className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/80 whitespace-nowrap">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {rows.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-indigo-50/20 transition-colors group">
                            <td className="px-4 py-2 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-indigo-50/20 z-[1]">
                              <div className="flex items-center justify-center gap-1 opacity-30 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingRecord(row); setEditedData({ ...row }) }}
                                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                  <Edit2 size={10} />
                                </button>
                                <button onClick={() => handleDelete(row)}
                                  className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </td>
                            {Object.values(row).map((val: any, j: number) => (
                              <td key={j} className="px-5 py-2.5 text-[11px] font-medium text-slate-600 font-mono whitespace-nowrap">
                                {val === null ? <span className="text-slate-300 italic">null</span> : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Aucun résultat */}
                  {mutation.isSuccess && rows.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                      <TableIcon size={48} className="text-slate-300" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun résultat</p>
                    </div>
                  )}

                  {/* État initial */}
                  {!mutation.isPending && !mutation.isError && !mutation.data && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30">
                      <div className="p-8 bg-slate-100 rounded-full">
                        <TableIcon size={56} className="text-slate-400" />
                      </div>
                      <div className="text-center space-y-1">
                        <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Prêt</h4>
                        <p className="text-[10px] text-slate-400">Choisissez une table ou écrivez une requête</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer stats */}
                {mutation.isSuccess && (
                  <div className="px-6 py-2 border-t border-slate-100 flex items-center justify-between shrink-0">
                    <span className="text-[9px] text-slate-400 font-mono">{rows.length} ligne(s)</span>
                    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded', BADGE[dbSource])}>
                      {src.icon} {src.queryLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal édition */}
      <Dialog open={!!editingRecord} onOpenChange={open => !open && setEditingRecord(null)}>
        <DialogContent className="max-w-4xl p-0 bg-white border-none rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[80vh] gap-0">
          <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg"><Edit2 size={16} /></div>
              Modifier l'enregistrement
              <span className="ml-auto text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-[0.2em]">
                {detectTable(query)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {editingRecord && Object.entries(editingRecord).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">{key}</label>
                  <input
                    type="text"
                    value={editedData[key] === null ? '' : editedData[key]}
                    onChange={e => setEditedData({ ...editedData, [key]: e.target.value })}
                    placeholder={value === null ? 'null' : ''}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button onClick={() => setEditingRecord(null)}
              className="px-5 py-2 bg-white border border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
              Annuler
            </button>
            <button onClick={handleSaveEdit}
              className="px-7 py-2 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
              <Save size={12} /> Enregistrer
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  )
}
