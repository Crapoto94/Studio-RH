import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { LayoutDashboard, Users, UserCheck, RefreshCw, AlertCircle } from 'lucide-react'
import { prisma, prismaLocal } from '@/lib/db'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AgentAvatar } from '@/components/common/AgentAvatar'
import { formatPrenom } from '@/lib/utils'
import { PositionsPieChart } from '@/components/dashboard/PositionsPieChart'

export const dynamic = 'force-dynamic'

// SSR logic for Dashboard
async function getDashboardStats() {
  const totalAgents = await prisma.refAgent.count()
  
  // Dynamic calculation based on settings
  const params = await prismaLocal.parametre.findMany()
  const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))
  const activePositions = (config['RH_POSITIONS_ACTIVES'] || '').split(',').filter(Boolean)
  const now = new Date()
  let activeAgents = await prisma.refAgent.count({
    where: {
      plus_vu: null,
      actif: true,
      OR: [
        { date_depart: null },
        { date_depart: { gt: now } }
      ],
      ...(activePositions.length > 0 ? { position_l: { in: activePositions } } : {})
    }
  })

  // Custom logic to compute active count (in production, complex queries might be used)
  const allAgents = await prisma.refAgent.findMany({
    select: { ad_id: true, azure_id: true }
  })

  const comptesAD = allAgents.filter((a: any) => a.ad_id).length
  const comptesAzure = allAgents.filter((a: any) => a.azure_id).length

  // Position distribution for Pie Chart
  let posDistribution: any[] = []
  try {
    // 2. Répartition par position (Utilisation de groupBy pour plus de robustesse)
    const rawPosDistribution = await prisma.refAgent.groupBy({
      by: ['position_l'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          position_l: 'desc'
        }
      },
      take: 8
    })

    posDistribution = rawPosDistribution.map(p => ({
      name: p.position_l || 'Non spécifié',
      value: p._count._all
    }))
  } catch (e) {
    console.error("Dashboard SQL Error (posDistribution):", e)
  }

  // Recent logs
  const logs = await prisma.synchroLog.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
  })

  // Recent onboarding (sécurisé pour éviter les erreurs de colonnes manquantes)
  const onboardings = await (prisma.onboarding as any).findMany({
    include: {
      agent: {
        select: {
          nom: true,
          prenom: true,
          position_l: true
        }
      }
    },
    take: 6,
    orderBy: { created_at: 'desc' }
  }).catch((err: any) => {
    console.error("Dashboard Onboarding Load Error:", err)
    return []
  })

  return {
    totalAgents,
    activeAgents,
    activePositions,
    comptesAD,
    comptesAzure,
    posDistribution: posDistribution.map(p => ({
      name: p.name || 'Non spécifié',
      value: Number(p.value)
    })),
    logs,
    onboardings: onboardings || []
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="flex bg-[#f4f6fb] text-[#1a2340]">
      <Sidebar />
      <PageContainer title="Dashboard" subtitle="Vue d'ensemble RH Studio" className="pb-12">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Total Agents" value={stats.totalAgents} icon={Users} color="#6366f1" />
          <KpiCard title="Agents Actifs" value={stats.activeAgents} icon={UserCheck} color="#0d9488" />
          <KpiCard title="Comptes AD liés" value={stats.comptesAD} icon={RefreshCw} color="#d97706" />
          <KpiCard title="Comptes Azure liés" value={stats.comptesAzure} icon={LayoutDashboard} color="#9333ea" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Middle Section: Onboarding */}
          <div className="lg:col-span-3 glass-card p-6">
            <h3 className="font-display font-semibold text-lg mb-4 text-slate-800">Activité Onboarding Récente</h3>
            {stats.onboardings.length === 0 ? (
              <p className="text-slate-500 text-sm">Aucune activité d'onboarding récente.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.onboardings.map((ob: any) => {
                  const agentData = ob.agent || { nom: ob.nom_temp, prenom: ob.prenom_temp, position_l: 'Agent' }
                  return (
                    <div key={ob.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md hover:-translate-y-0.5 group">
                      <AgentAvatar agent={agentData} size="md" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {formatPrenom(agentData.prenom)} {agentData.nom?.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-50 text-slate-400 uppercase tracking-widest border border-slate-100">
                            {ob.statut.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Positions Pie Chart (Full width on its row now) */}
          <div className="lg:col-span-3 glass-card p-6 flex flex-col h-[400px]">
            <h3 className="font-display font-semibold text-lg mb-4 text-slate-800">Répartition des Positions</h3>
            <div className="flex-1 min-h-0">
              <PositionsPieChart data={stats.posDistribution} activePositions={stats.activePositions} />
            </div>
          </div>
        </div>

        {/* Bottom Section: Logs */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4 text-slate-800">Dernières Synchronisations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">Type</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody>
                {stats.logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 text-sm italic">Aucun log disponible</td>
                  </tr>
                ) : (
                  stats.logs.map((log: any) => (
                    <tr key={log.id} className="border-b border-slate-100 table-row-hover">
                      <td className="py-3 pl-2 text-sm font-medium">{log.type.toUpperCase()}</td>
                      <td className="py-3 text-sm text-slate-500">{new Date(log.created_at).toLocaleString('fr-FR')}</td>
                      <td className="py-3 text-sm">
                        <StatusBadge status={log.statut as any}>{log.statut}</StatusBadge>
                      </td>
                      <td className="py-3 text-sm text-slate-500 truncate max-w-sm">{log.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

function KpiCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: React.ElementType, color: string }) {
  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110" style={{ backgroundColor: color }} />
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color: color }}>
          <Icon size={24} />
        </div>
        <div>
          <h4 className="text-slate-500 text-sm font-medium mb-1">{title}</h4>
          <span className="text-3xl font-display font-bold text-slate-800">{value.toLocaleString('fr-FR')}</span>
        </div>
      </div>
    </div>
  )
}


