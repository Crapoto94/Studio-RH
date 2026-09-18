import { useState } from 'react'
import { BadgeCheck, Eye, Square, CheckSquare, UserX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AgentAvatar } from '@/components/common/AgentAvatar'
import { Pagination } from '@/components/common/Pagination'
import { SortableTh } from '@/components/common/SortableTh'
import { DisableMoveModal } from '@/components/common/DisableMoveModal'
import { usePagination } from '@/hooks/usePagination'
import { useSortable } from '@/hooks/useSortable'
import { formatDate, formatPrenom } from '@/lib/utils'

interface GhostTabProps {
  ghostAccounts: any[]
  openAgentDetails: (agent: any) => void
  refetch: () => void
}

export function GhostTab({ ghostAccounts, openAgentDetails, refetch }: GhostTabProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { sorted, sortKey, sortDir, toggleSort } = useSortable(ghostAccounts, {
    agent_nom: { get: (item: any) => item.agent?.nom, type: 'string' },
    ad_name: { get: (item: any) => item.ad?.display_name, type: 'string' },
    updated_at: { get: (item: any) => item.agent?.updated_at, type: 'date' },
  })

  const { page, setPage, pageSize, setPageSize, total, totalPages, paginatedItems } =
    usePagination(sorted)

  const handleSort = (key: string) => {
    toggleSort(key)
    setPage(1)
  }

  const toggleSelect = (samAccount: string) => {
    setSelectedAccounts(prev =>
      prev.includes(samAccount) ? prev.filter(s => s !== samAccount) : [...prev, samAccount]
    )
  }

  const toggleSelectAll = () => {
    if (selectedAccounts.length === sorted.length) {
      setSelectedAccounts([])
    } else {
      setSelectedAccounts(sorted.map((item: any) => item.ad.sam_account))
    }
  }

  const handleDisableMove = async (targetOu: string) => {
    if (selectedAccounts.length === 0) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/ad/disable-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samAccounts: selectedAccounts, targetOu }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erreur lors du traitement')

      if (data.failureCount > 0) {
        const failed = (data.results || [])
          .filter((r: any) => !r.success)
          .map((r: any) => `${r.samAccount} : ${r.message}`)
          .join('\n')
        alert(`${data.successCount} compte(s) traité(s), ${data.failureCount} échec(s) :\n${failed}`)
      }

      setSelectedAccounts([])
      setIsModalOpen(false)
      refetch()
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Erreur lors du traitement')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/10 rounded-3xl overflow-hidden border-t-rose-500 border-t-4">
        <CardHeader className="border-b border-slate-50 bg-white p-8 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black text-rose-600 uppercase tracking-tight flex items-center gap-3">
              Comptes Fantômes
              <div className="px-2 py-0.5 bg-rose-50 rounded text-xs font-black animate-pulse">Critique</div>
            </CardTitle>
            <CardDescription>Agents marqués comme INACTIFS en RH mais dont le compte AD est toujours ACTIF. Risque de sécurité.</CardDescription>
          </div>

          {/* Bulk Actions Bar */}
          {selectedAccounts.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-rose-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                  {selectedAccounts.length}
                </div>
                <span className="text-sm font-bold tracking-tight">Comptes sélectionnés</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAccounts([])}
                  className="px-3 py-1.5 text-xs font-bold hover:bg-white/10 rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-1.5 bg-white text-rose-600 rounded-lg text-xs font-black uppercase tracking-tight shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <UserX size={14} />
                  Désactiver & déplacer
                </button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pl-8 pr-4 py-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      {selectedAccounts.length === sorted.length && sorted.length > 0 ? (
                        <CheckSquare size={18} className="text-rose-500" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <SortableTh label="Agent RH (Inactif)" sortKey="agent_nom" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="px-4 py-4 text-left text-rose-500" />
                  <SortableTh label="Compte AD (Actif)" sortKey="ad_name" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="px-6 py-4 text-left" />
                  <SortableTh label="Dernière modification RH" sortKey="updated_at" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="px-6 py-4 text-left" />
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((item: any) => {
                  const sam = item.ad.sam_account
                  const selected = selectedAccounts.includes(sam)
                  return (
                    <tr
                      key={sam}
                      className={`hover:bg-rose-50/20 transition-colors group cursor-pointer ${selected ? 'bg-rose-50/40' : ''}`}
                      onClick={() => toggleSelect(sam)}
                    >
                      <td className="pl-8 pr-4 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSelect(sam) }}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          {selected ? (
                            <CheckSquare size={18} className="text-rose-500" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <AgentAvatar agent={item.agent} size="md" />
                          <div>
                            <div className="font-bold text-slate-800 text-sm tracking-tight">{item.agent.nom?.toUpperCase()} {formatPrenom(item.agent.prenom)}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-medium">{item.agent.nom_direction}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <BadgeCheck size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-700 text-xs">{item.ad.display_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono tracking-tight">{item.ad.sam_account}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs text-slate-500">
                        {formatDate(item.agent.updated_at)}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); openAgentDetails(item.agent); }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            label="comptes"
          />
        </CardContent>
      </Card>

      <DisableMoveModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        count={selectedAccounts.length}
        loading={isLoading}
        onConfirm={handleDisableMove}
      />
    </>
  )
}
