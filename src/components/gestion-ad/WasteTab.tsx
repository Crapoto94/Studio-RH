import { useState } from 'react'
import { Eye, Square, CheckSquare, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AgentAvatar } from '@/components/common/AgentAvatar'
import { Pagination } from '@/components/common/Pagination'
import { SortableTh } from '@/components/common/SortableTh'
import { RemoveLicenseModal } from '@/components/common/RemoveLicenseModal'
import { usePagination } from '@/hooks/usePagination'
import { useSortable } from '@/hooks/useSortable'
import { formatPrenom } from '@/lib/utils'

interface WasteTabProps {
  licenseWaste: any[]
  openAgentDetails: (agent: any) => void
  refetch: () => void
}

const itemKey = (item: any) => item.azure?.azure_id || item.azure?.user_principal_name || ''

export function WasteTab({ licenseWaste, openAgentDetails, refetch }: WasteTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { sorted, sortKey, sortDir, toggleSort } = useSortable(licenseWaste, {
    account: { get: (item: any) => item.agent?.nom || item.ad?.display_name, type: 'string' },
    upn: { get: (item: any) => item.azure?.user_principal_name, type: 'string' },
  })

  const { page, setPage, pageSize, setPageSize, total, totalPages, paginatedItems } =
    usePagination(sorted)

  const handleSort = (key: string) => {
    toggleSort(key)
    setPage(1)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === sorted.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(sorted.map(itemKey))
    }
  }

  const selectedItems = sorted.filter((item: any) => selectedIds.includes(itemKey(item)))
  const selectedLicenses = Array.from(
    new Set(selectedItems.flatMap((item: any) => JSON.parse(item.azure.licenses || '[]')))
  ) as string[]

  const handleRemove = async () => {
    if (selectedItems.length === 0) return
    setIsLoading(true)
    try {
      const users = selectedItems.map((item: any) => ({
        azureId: item.azure.azure_id || undefined,
        upn: item.azure.user_principal_name || undefined,
      }))

      const res = await fetch('/api/azure/remove-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erreur lors du retrait des licences')

      if (data.failureCount > 0) {
        const failed = (data.results || [])
          .filter((r: any) => !r.success)
          .map((r: any) => `${r.upn} : ${r.message}`)
          .join('\n')
        alert(`${data.successCount} compte(s) traité(s), ${data.failureCount} échec(s) :\n${failed}`)
      }

      setSelectedIds([])
      setIsModalOpen(false)
      refetch()
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Erreur lors du retrait des licences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/10 rounded-3xl overflow-hidden border-t-amber-500 border-t-4">
        <CardHeader className="border-b border-slate-50 bg-white p-8 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black text-amber-600 uppercase tracking-tight flex items-center gap-3">
              Licences Inutiles
              <Badge variant="outline" className="border-amber-200 text-amber-600 ml-2">Économie Potentielle</Badge>
            </CardTitle>
            <CardDescription>Comptes AD désactivés mais possédant encore des licences Azure (M365/O365) actives.</CardDescription>
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-amber-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                  {selectedIds.length}
                </div>
                <span className="text-sm font-bold tracking-tight">Comptes sélectionnés</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 text-xs font-bold hover:bg-white/10 rounded-lg transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-1.5 bg-white text-amber-600 rounded-lg text-xs font-black uppercase tracking-tight shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <CreditCard size={14} />
                  Retirer les licences
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
                      className="text-slate-300 hover:text-amber-500 transition-colors"
                    >
                      {selectedIds.length === sorted.length && sorted.length > 0 ? (
                        <CheckSquare size={18} className="text-amber-500" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <SortableTh label="Compte (AD Désactivé)" sortKey="account" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="px-4 py-4 text-left" />
                  <SortableTh label="Email / UPN" sortKey="upn" activeKey={sortKey} dir={sortDir} onSort={handleSort} className="px-6 py-4 text-left" />
                  <th className="px-6 py-4">Licences Azure</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((item: any) => {
                  const id = itemKey(item)
                  const selected = selectedIds.includes(id)
                  const agent = item.agent || { nom: item.ad.display_name, prenom: '' }
                  return (
                    <tr
                      key={id}
                      className={`hover:bg-amber-50/20 transition-colors group cursor-pointer ${selected ? 'bg-amber-50/40' : ''}`}
                      onClick={() => toggleSelect(id)}
                    >
                      <td className="pl-8 pr-4 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSelect(id) }}
                          className="text-slate-300 hover:text-amber-500 transition-colors"
                        >
                          {selected ? (
                            <CheckSquare size={18} className="text-amber-500" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <AgentAvatar agent={agent} size="md" />
                          <div>
                            <div className="font-bold text-slate-800 text-sm">
                              {item.agent ? `${item.agent.nom?.toUpperCase()} ${formatPrenom(item.agent.prenom)}` : item.ad.display_name}
                            </div>
                            <div className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-0.5">AD Désactivé</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                        {item.azure.user_principal_name}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(item.azure.licenses || '[]').map((l: string) => (
                            <Badge key={l} className="bg-amber-50 text-amber-700 border-amber-100 text-[9px] font-bold uppercase">
                              {l}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); openAgentDetails(agent); }}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
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
            label="licences"
          />
        </CardContent>
      </Card>

      <RemoveLicenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        count={selectedItems.length}
        licenses={selectedLicenses}
        loading={isLoading}
        onConfirm={handleRemove}
      />
    </>
  )
}
