import { useState } from 'react'
import { ShieldCheck, Link2, ShieldOff, Eye, Search, Square, CheckSquare, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OrphanTabProps {
  unlinkedAds: any[]
  openAgentDetails: (agent: any) => void
  setPendingAccount: (ad: any) => void
  setIsPickerModalOpen: (open: boolean) => void
  setIsIgnoreModalOpen: (open: boolean) => void
  refetch: () => void
}

export function OrphanTab({ 
  unlinkedAds, 
  openAgentDetails, 
  setPendingAccount, 
  setIsPickerModalOpen, 
  setIsIgnoreModalOpen,
  refetch
}: OrphanTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  const filteredAds = unlinkedAds.filter(ad => {
    const query = searchQuery.toLowerCase()
    return (
      ad.display_name?.toLowerCase().includes(query) ||
      ad.sam_account?.toLowerCase().includes(query) ||
      ad.mail?.toLowerCase().includes(query)
    )
  })

  const toggleSelectAll = () => {
    if (selectedAccounts.length === filteredAds.length) {
      setSelectedAccounts([])
    } else {
      setSelectedAccounts(filteredAds.map(ad => ad.sam_account))
    }
  }

  const toggleSelect = (samAccount: string) => {
    setSelectedAccounts(prev => 
      prev.includes(samAccount) 
        ? prev.filter(id => id !== samAccount) 
        : [...prev, samAccount]
    )
  }

  const handleBulkIgnore = async () => {
    if (selectedAccounts.length === 0) return
    if (!confirm(`Voulez-vous vraiment exclure ces ${selectedAccounts.length} comptes ?`)) return
    
    setIsBulkLoading(true)
    try {
      const res = await fetch('/api/ad/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ignore',
          samAccounts: selectedAccounts,
          reason: 'Exclusion groupée (Audit AD)'
        })
      })
      if (!res.ok) throw new Error('Erreur lors de l\'exclusion groupée')
      
      setSelectedAccounts([])
      refetch()
    } catch (err) {
      console.error(err)
      alert('Erreur lors de l\'action groupée')
    } finally {
      setIsBulkLoading(false)
    }
  }

  return (
    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/10 rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-50 bg-white p-6 pb-4">
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight">Comptes AD Orphelins</CardTitle>
            <CardDescription>Ces comptes existent dans l'Active Directory mais ne sont pas rattachés à un agent dans RH Studio.</CardDescription>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filtrer par nom ou login..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedAccounts.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300">
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
                onClick={handleBulkIgnore}
                disabled={isBulkLoading}
                className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-black uppercase tracking-tight shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                {isBulkLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />}
                Exclure la sélection
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
                    className="text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    {selectedAccounts.length === filteredAds.length && filteredAds.length > 0 ? (
                      <CheckSquare size={18} className="text-indigo-500" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4">Nom Affiché / Login</th>
                <th className="px-6 py-4">Direction / Service</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Créé le</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAds.length > 0 ? filteredAds.map((ad: any) => (
                <tr 
                  key={ad.id} 
                  className={`hover:bg-indigo-50/10 transition-colors group cursor-pointer ${selectedAccounts.includes(ad.sam_account) ? 'bg-indigo-50/30' : ''}`} 
                  onClick={() => toggleSelect(ad.sam_account)}
                >
                  <td className="pl-8 pr-4 py-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSelect(ad.sam_account); }}
                      className="text-slate-300 hover:text-indigo-500 transition-colors"
                    >
                      {selectedAccounts.includes(ad.sam_account) ? (
                        <CheckSquare size={18} className="text-indigo-500" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{ad.display_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">{ad.sam_account}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-slate-600 uppercase">{ad.department}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{ad.company}</div>
                  </td>
                  <td className="px-6 py-5">
                    {ad.enabled ? (
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase text-[9px]">Actif</Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-400 border-slate-100 font-bold uppercase text-[9px]">Désactivé</Badge>
                    )}
                  </td>
                  <td className="px-6 py-5 text-xs text-slate-500">
                    {ad.when_created || 'N/A'}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPendingAccount(ad); setIsPickerModalOpen(true); }}
                        className="p-2 text-indigo-500 hover:text-white hover:bg-indigo-600 bg-indigo-50 rounded-xl transition-all shadow-sm border border-indigo-100 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight"
                        title="Associer à un agent"
                      >
                        <Link2 size={16} />
                        <span>Lier</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPendingAccount(ad); setIsIgnoreModalOpen(true); }}
                        className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 bg-slate-50 rounded-xl transition-all shadow-sm border border-slate-100 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight"
                        title="Marquer comme technique / ignorer"
                      >
                        <ShieldOff size={16} />
                        <span>Exclure</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openAgentDetails({ nom: ad.display_name, prenom: '', is_orphan: true, ad_data: ad }); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Search size={24} className="opacity-20" />
                      <p className="text-sm italic">Aucun compte trouvé pour cette recherche.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
