'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Server, Play, List, Save, Loader2, CheckCircle2, XCircle, ChevronRight, Database, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PostgresSettings() {
  const queryClient = useQueryClient()
  const { data: params = {}, isLoading } = useQuery({
    queryKey: ['parametres'],
    queryFn: async () => {
      const res = await fetch('/api/parametres')
      if (!res.ok) throw new Error('Erreur de chargement')
      const json = await res.json()
      return Object.fromEntries(json.map((p: any) => [p.cle, p.valeur]))
    }
  })

  const [form, setForm] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; details?: any } | null>(null)
  const [tables, setTables] = useState<string[] | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const fields = [
    { label: 'Hôte (IP ou Nom)', key: 'PG_HOST', placeholder: '10.103.130.106' },
    { label: 'Port', key: 'PG_PORT', placeholder: '5432' },
    { label: 'Base de données', key: 'PG_DATABASE', placeholder: 'nom_de_la_base' },
    { label: 'Utilisateur', key: 'PG_USER', placeholder: 'postgres' },
    { label: 'Mot de passe', key: 'PG_PASSWORD', type: 'password', placeholder: '••••••••' },
    { label: 'Schéma', key: 'PG_SCHEMA', placeholder: 'public' },
  ]

  const getValue = (key: string) => form[key] !== undefined ? form[key] : (params[key] ?? '')

  const saveAll = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(form)) {
        await fetch('/api/parametres', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        })
      }
    },
    onSuccess: () => {
      setForm({})
      queryClient.invalidateQueries({ queryKey: ['parametres'] })
    }
  })

  const runAction = async (action: 'connect' | 'tables') => {
    setLoading(prev => ({ ...prev, [action]: true }))
    setTestResult(null)
    if (action === 'connect') setTables(null)
    
    try {
      const res = await fetch('/api/parametres/postgres/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      setTestResult(data)
      if (action === 'tables' && data.ok) {
        setTables(data.tables)
      }
    } catch (e: any) {
      setTestResult({ ok: false, message: 'Erreur réseau : ' + e.message })
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }))
    }
  }

  if (isLoading) return <div className="p-8 text-slate-400 flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Chargement de la configuration...</div>

  const isDirty = Object.keys(form).length > 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
              <Database size={18} className="text-indigo-500" />
              Base de données PostgreSQL externe
            </h3>
            <p className="text-xs text-slate-500 mt-1">Configurez ici le lien vers votre base de production PostgreSQL.</p>
          </div>
          {isDirty && (
            <button 
              onClick={() => saveAll.mutate()}
              disabled={saveAll.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm"
            >
              {saveAll.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Enregistrer les modifications
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {fields.map(f => (
              <div key={f.key} className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within:text-indigo-500 transition-colors">
                  {f.label}
                </label>
                <input
                  type={f.type || 'text'}
                  value={getValue(f.key)}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col h-full">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Play size={14} /> Actions & Diagnostic
            </h4>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => runAction('connect')}
                disabled={loading.connect || isDirty}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all",
                  isDirty ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm"
                )}
                title={isDirty ? "Enregistrez d'abord vos modifications" : "Tester la connexion"}
              >
                {loading.connect ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
                Test Lien
              </button>
              <button
                onClick={() => runAction('tables')}
                disabled={loading.tables || isDirty}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all",
                  isDirty ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm"
                )}
                title={isDirty ? "Enregistrez d'abord vos modifications" : "Lister les tables"}
              >
                {loading.tables ? <Loader2 size={16} className="animate-spin" /> : <List size={16} />}
                Tables
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {testResult && (
                <div className={cn(
                  "p-4 rounded-xl border animate-in slide-in-from-top-2 duration-300",
                  testResult.ok ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
                )}>
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    {testResult.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {testResult.ok ? 'Connexion Réussie' : 'Échec de la connexion'}
                  </div>
                  <p className="text-xs opacity-90">{testResult.message}</p>
                  {testResult.details && (
                    <div className="mt-2 text-[10px] font-mono bg-white/50 p-2 rounded border border-emerald-200/50">
                      DB: {testResult.details.db_name} | User: {testResult.details.db_user}
                    </div>
                  )}
                </div>
              )}

              {tables && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
                  <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Schéma : {getValue('PG_SCHEMA') || 'public'} ({tables.length} tables)
                  </div>
                  <div className="overflow-y-auto max-h-[180px] p-2 space-y-1">
                    {tables.map(t => (
                      <div key={t} className="flex items-center gap-2 text-xs text-slate-600 py-1 px-2 hover:bg-slate-50 rounded transition-colors group">
                        <ChevronRight size={10} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        <span className="font-mono">{t}</span>
                      </div>
                    ))}
                    {tables.length === 0 && <div className="text-xs text-slate-400 italic p-2 text-center">Aucune table trouvée</div>}
                  </div>
                </div>
              )}
            </div>
            
            {isDirty && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-700 flex items-start gap-2">
                <Shield size={14} className="mt-0.5 shrink-0" />
                <span>Modifications en attente. Vous devez enregistrer pour que les tests utilisent les nouvelles valeurs.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Wifi({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 13a10 10 0 0 1 14 0" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
      <path d="M2 8a15 15 0 0 1 20 0" />
      <line x1="12" x2="12.01" y1="20" y2="20" />
    </svg>
  )
}
