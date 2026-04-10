import { Settings2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface TechnicalTabProps {
  technicalAccounts: any[]
  refetch: () => void
}

export function TechnicalTab({ technicalAccounts, refetch }: TechnicalTabProps) {
  return (
    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/10 rounded-2xl overflow-hidden border-t-slate-500 border-t-4">
      <CardHeader className="border-b border-slate-50 bg-white p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Settings2 size={20} className="text-slate-400" />
              Comptes Techniques / Exclus
            </CardTitle>
            <CardDescription>Comptes manuellement exclus de l'analyse (ex: comptes de service, comptes d'équipe).</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4">Compte AD</th>
                <th className="px-6 py-4">Raison</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {technicalAccounts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-400 italic text-sm">Aucun compte technique répertorié.</td>
                </tr>
              ) : technicalAccounts.map((ad: any) => (
                <tr key={ad.sam_account} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="font-bold text-slate-800 text-sm">{ad.display_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">{ad.sam_account}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      {ad.exclusionReason}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={async () => {
                        if (confirm(`Voulez-vous réintégrer ${ad.sam_account} ?`)) {
                          await fetch('/api/ad/actions', {
                            method: 'POST',
                            body: JSON.stringify({ action: 'remove-ignore', samAccount: ad.sam_account })
                          })
                          refetch()
                        }
                      }}
                      className="text-xs font-black text-indigo-600 uppercase hover:underline"
                    >
                      Réintégrer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
