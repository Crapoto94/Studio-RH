import { BadgeCheck, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AgentAvatar } from '@/components/common/AgentAvatar'
import { formatPrenom } from '@/lib/utils'

interface GhostTabProps {
  ghostAccounts: any[]
  openAgentDetails: (agent: any) => void
}

export function GhostTab({ ghostAccounts, openAgentDetails }: GhostTabProps) {
  return (
    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/10 rounded-3xl overflow-hidden border-t-rose-500 border-t-4">
      <CardHeader className="border-b border-slate-50 bg-white p-8">
        <div className="space-y-1">
          <CardTitle className="text-xl font-black text-rose-600 uppercase tracking-tight flex items-center gap-3">
            Comptes Fantômes
            <div className="px-2 py-0.5 bg-rose-50 rounded text-xs font-black animate-pulse">Critique</div>
          </CardTitle>
          <CardDescription>Agents marqués comme INACTIFS en RH mais dont le compte AD est toujours ACTIF. Risque de sécurité.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-rose-500">Agent RH (Inactif)</th>
                <th className="px-6 py-4">Compte AD (Actif)</th>
                <th className="px-6 py-4">Dernière modification RH</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ghostAccounts.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-rose-50/20 transition-colors group cursor-pointer" onClick={() => openAgentDetails(item.agent)}>
                  <td className="px-8 py-4">
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
                    {new Date(item.agent.updated_at).toLocaleDateString()}
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
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
