'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, User, Loader2, Crown, ArrowUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function NPlus1Finder() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (search.length < 2) { setResults([]); return }
      setLoading(true)
      try {
        const res = await fetch(`/api/agents/search?q=${encodeURIComponent(search)}`)
        const json = await res.json()
        setResults(json.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  const { data, isLoading: resolving } = useQuery({
    queryKey: ['n-plus-1', selected?.id],
    queryFn: async () => {
      const res = await fetch(`/api/hierarchy/n-plus-1?agentId=${selected.id}`)
      if (!res.ok) throw new Error('Erreur résolution N+1')
      return res.json()
    },
    enabled: !!selected
  })

  return (
    <div className="max-w-xl">
      {!selected ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher un agent (nom, prénom, matricule)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-9 py-2.5 text-sm text-slate-800 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowResults(true) }}
            onFocus={() => setShowResults(true)}
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16} />}

          {showResults && results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
              {results.map((r: any) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setSelected(r); setShowResults(false); setSearch('') }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                >
                  <div className="text-sm font-semibold text-slate-800">{r.prenom} {r.nom}</div>
                  <div className="text-xs text-slate-400">
                    {r.fonction || '—'}{r.direction ? ` · ${r.direction}` : ''}{r.service ? ` / ${r.service}` : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-xs font-semibold text-indigo-500 hover:text-indigo-700"
          >
            ← Nouvelle recherche
          </button>

          <Card className="border-slate-200 rounded-2xl overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  {selected.prenom?.[0]}{selected.nom?.[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-800">{selected.prenom} {selected.nom}</div>
                  <div className="text-xs text-slate-400">
                    {selected.fonction || '—'}{selected.direction ? ` · ${selected.direction}` : ''}
                  </div>
                </div>
              </div>

              <div className="flex justify-center py-1">
                <ArrowUp size={16} className="text-slate-300" />
              </div>

              {resolving ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-4 justify-center">
                  <Loader2 size={16} className="animate-spin" /> Résolution du N+1...
                </div>
              ) : data?.nPlus1 ? (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <Crown className="text-amber-500 shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-amber-900 truncate">{data.nPlus1.prenom} {data.nPlus1.nom}</div>
                    <div className="text-xs text-amber-700 truncate">{data.nPlus1.poste_l || '—'}</div>
                    <div className="text-[10px] text-amber-500 mt-0.5">
                      Identifié au niveau « {data.nPlus1.resolvedAt.levelName} »
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-sm text-slate-400 p-3 bg-slate-50 rounded-xl">
                  <User size={16} className="shrink-0 mt-0.5" />
                  <span>
                    Aucun N+1 trouvé. Vérifie qu'une règle « Responsable (SQL) » est configurée pour au
                    moins un niveau (onglet Configuration) et qu'elle identifie bien un agent distinct.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
