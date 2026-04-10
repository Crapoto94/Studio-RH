import { Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AgentAvatar } from '@/components/common/AgentAvatar'
import { formatPrenom } from '@/lib/utils'

interface WasteTabProps {
  licenseWaste: any[]
  openAgentDetails: (agent: any) => void
}

export function WasteTab({ licenseWaste, openAgentDetails }: WasteTabProps) {
  return (
    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/10 rounded-3xl overflow-hidden border-t-amber-500 border-t-4">
      <CardHeader className="border-b border-slate-50 bg-white p-8">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black text-amber-600 uppercase tracking-tight flex items-center gap-3">
            Licences Inutiles
            <Badge variant="outline" className="border-amber-200 text-amber-600 ml-2">Économie Potentielle</Badge>
          </CardTitle>
          <CardDescription>Comptes AD désactivés mais possédant encore des licences Azure (M365/O365) actives.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4">Compte (AD Désactivé)</th>
                <th className="px-6 py-4">Email / UPN</th>
                <th className="px-6 py-4">Licences Azure</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {licenseWaste.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-amber-50/20 transition-colors group cursor-pointer" onClick={() => openAgentDetails(item.agent || { nom: item.ad.display_name, prenom: '' })}>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <AgentAvatar agent={item.agent || { nom: item.ad.display_name, prenom: '' }} size="md" />
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
                      onClick={(e) => { e.stopPropagation(); openAgentDetails(item.agent || { nom: item.ad.display_name, prenom: '' }); }}
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                    >
                      <Eye size={18} />
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
