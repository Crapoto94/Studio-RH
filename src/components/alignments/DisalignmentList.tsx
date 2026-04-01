'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Download, AlertTriangle, Loader2, GitMerge, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AgentAvatar } from '@/components/common/AgentAvatar'
import { parseDate } from '@/lib/utils'

export function DisalignmentList() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState<any[]>([])
  const [selectedRuleIds, setSelectedRuleIds] = useState<number[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isCaseSensitive, setIsCaseSensitive] = useState(false)
  const [filterField, setFilterField] = useState<string>('all')
  const [rhFilterField, setRhFilterField] = useState<string>('direction')
  const [rhFilterValue, setRhFilterValue] = useState<string>('')

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/alignments')
      const d = await res.json()
      setRules(d || [])
    } catch (e) { console.error(e) }
  }

  const fetchChecks = async () => {
    setLoading(true)
    try {
      const rulesParam = selectedRuleIds.length > 0 ? `&rules=${selectedRuleIds.join(',')}` : ''
      const res = await fetch(`/api/alignments/check?caseSensitive=${isCaseSensitive}${rulesParam}`)
      const resData = await res.json()
      setData(resData.agents || [])
      setSelectedIds(new Set())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length && filteredData.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredData.map(a => a.id)))
    }
  }

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleAlign = async () => {
    if (selectedIds.size === 0) return
    // On ne garde que les agents COCHÉS ET VISIBLES (filtrés)
    const selectedAgents = filteredData.filter(a => selectedIds.has(a.id))
    
    if (selectedAgents.length === 0) return

    const res = await fetch('/api/alignments/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agents: selectedAgents })
    })
    
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'alignement_ad.ps1'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const filteredData = data.filter(agent => {
    const matchField = filterField === 'all' || agent.diffs.some((d: any) => d.fieldRh === filterField)
    if (!matchField) return false

    if (rhFilterValue.trim() !== '') {
      const val = String(agent[rhFilterField] || '').toLowerCase()
      if (!val.includes(rhFilterValue.toLowerCase())) return false
    }

    return true
  })

  // Get unique RH fields present in current data for the field filter
  const usedFields = Array.from(new Set(data.flatMap(a => a.diffs.map((d: any) => d.fieldRh)))) as string[]

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-8 space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
            1. Sélectionnez les règles à vérifier
          </Label>
          <div className="flex flex-wrap gap-2">
            {rules.map(rule => {
              const isSelected = selectedRuleIds.includes(rule.id)
              return (
                <button
                  key={rule.id}
                  onClick={() => {
                    setSelectedRuleIds(prev => 
                      isSelected ? prev.filter(id => id !== rule.id) : [...prev, rule.id]
                    )
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {rule.name}
                </button>
              )
            })}
            {rules.length === 0 && <span className="text-sm text-slate-400 italic">Aucune règle configurée.</span>}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Checkbox id="check-case" checked={isCaseSensitive} onCheckedChange={val => setIsCaseSensitive(!!val)} />
              <label htmlFor="check-case" className="cursor-pointer font-medium">Sensible à la casse</label>
            </div>
            
            <Button 
                onClick={fetchChecks} 
                disabled={loading} 
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Lancer la détection
            </Button>
          </div>

          <div className="flex items-center gap-4">
             {filteredData.filter(a => selectedIds.has(a.id)).length > 0 && (
              <Button onClick={handleAlign} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                <GitMerge className="w-4 h-4" />
                Générer script PowerShell ({filteredData.filter(a => selectedIds.has(a.id)).length})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="space-y-2 flex-1 max-w-sm">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filtrer par champ en erreur</Label>
            <select 
              className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={filterField}
              onChange={e => setFilterField(e.target.value)}
            >
              <option value="all">Tous les types d'erreurs</option>
              {usedFields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="space-y-2 flex-1">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recherche dans les agents ({rhFilterField})</Label>
            <div className="flex gap-2">
              <select 
                className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={rhFilterField}
                onChange={e => setRhFilterField(e.target.value)}
              >
                <option value="direction">Direction</option>
                <option value="service">Service</option>
                <option value="affectation">Affectation</option>
                <option value="nom">Nom</option>
                <option value="statut">Statut</option>
              </select>
              <Input 
                placeholder="Ex: ELUS, DSI..." 
                className="bg-white shadow-sm flex-1" 
                value={rhFilterValue}
                onChange={e => setRhFilterValue(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex flex-col justify-center">
            <div className="text-[10px] uppercase font-bold text-blue-600">Résultats filtrés</div>
            <div className="text-lg font-black text-blue-800 leading-none">{filteredData.length}</div>
          </div>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Recherche désalignements</h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p>Analyse des annuaires en cours...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aucun résultat correspondant aux filtres</p>
          <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou lancez une nouvelle analyse.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={selectedIds.size === filteredData.length} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead className="font-bold text-slate-700 w-[25%] text-sm uppercase tracking-wider py-4">Agent</TableHead>
                <TableHead className="font-bold text-slate-700 w-[70%] text-sm uppercase tracking-wider py-4">Détails des écarts entre AD et RH</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map(agent => {
                const depart = parseDate(agent.date_depart)
                const isParti = depart && depart < new Date()

                return (
                  <TableRow key={agent.id} className="hover:bg-slate-50/50 transition-colors group border-b">
                    <TableCell className="align-top pt-4">
                      <Checkbox checked={selectedIds.has(agent.id)} onCheckedChange={() => toggleSelect(agent.id)} />
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className="flex gap-3">
                        <AgentAvatar agent={agent} size="lg" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                             <span className={`font-bold text-slate-900 text-base leading-tight truncate ${isParti ? 'line-through text-slate-400' : ''}`}>
                               {agent.nom} {agent.prenom}
                             </span>
                          </div>
                      
                          <div className="flex flex-wrap gap-1 mt-1 mb-2">
                             <Badge variant="outline" className="text-[10px] border-blue-100 bg-blue-50/30 text-blue-600/70 font-medium">{agent.direction || 'Sans direction'}</Badge>
                             <Badge variant="outline" className="text-[10px] border-slate-100 bg-slate-50 text-slate-500">{agent.statut}</Badge>
                          </div>
                          <div className="text-[9px] uppercase font-bold text-slate-300 tracking-tight">Login AD: {agent.ad_id}</div>
                          <div className="text-[9px] text-slate-300">Matricule: {agent.matricule}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="grid grid-cols-1 gap-2">
                        {agent.diffs.map((diff: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50/20 group-hover:bg-white transition-all shadow-sm">
                            <Badge className="bg-[#0f172a] text-white w-fit h-fit text-[10px] font-bold uppercase shrink-0 py-0.5">
                              {diff.ruleName}
                            </Badge>
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                              {/* ... (Détails identiques) ... */}
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-red-600 font-bold text-[9px] uppercase tracking-tighter w-14 shrink-0 px-1 bg-red-50 rounded">AD actuel</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-slate-500 line-through text-xs truncate cursor-default">
                                      {diff.valAd || '(vide)'}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[400px] break-all">{diff.valAd || '(vide)'}</TooltipContent>
                                </Tooltip>
                              </div>
                              
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-green-700 font-bold text-[9px] uppercase tracking-tighter w-14 shrink-0 px-1 bg-green-50 rounded">Cible RH</span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-slate-900 font-bold bg-green-100/50 px-2 py-1 rounded border border-green-200 text-xs truncate cursor-default">
                                      {diff.valRh || '(vide)'}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[400px] break-all">{diff.valRh || '(vide)'}</TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
