'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, ShieldCheck, UserX, AlertTriangle, CreditCard, Settings2, RefreshCw as RefreshIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useSession } from 'next-auth/react'

import { Sidebar } from '@/components/layout/Sidebar'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/common/PageHeader'
import { AgentModal } from '@/components/common/AgentModal'
import { IgnoreAccountModal } from '@/components/common/IgnoreAccountModal'
import { AgentPickerModal } from '@/components/common/AgentPickerModal'
import { StatCard } from '@/components/common/StatCard'

import { OrphanTab } from '@/components/gestion-ad/OrphanTab'
import { GhostTab } from '@/components/gestion-ad/GhostTab'
import { WasteTab } from '@/components/gestion-ad/WasteTab'
import { TechnicalTab } from '@/components/gestion-ad/TechnicalTab'

export default function GestionAdPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('orphans')
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isIgnoreModalOpen, setIsIgnoreModalOpen] = useState(false)
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false)
  const [pendingAccount, setPendingAccount] = useState<any>(null)

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ad-audit'],
    queryFn: async () => {
      const res = await fetch('/api/ad/audit')
      if (!res.ok) throw new Error('Erreur lors du chargement de l\'audit')
      return res.json()
    }
  })

  const openAgentDetails = (agent: any) => {
    setSelectedAgent(agent)
    setIsModalOpen(true)
  }

  if (!session) return null

  if (isLoading) {
    return (
      <div className="flex bg-[#f4f6fb] min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Analyse de la cohérence AD / RH / Azure...</p>
        </div>
      </div>
    )
  }

  const { 
    unlinkedAds = [], 
    ghostAccounts = [], 
    licenseWaste = [],
    technicalAccounts = [] 
  } = data || {}

  return (
    <div className="flex bg-[#f4f6fb] min-h-screen">
      <Sidebar />
      <PageContainer 
        title="Gestion & Gouvernance AD" 
        subtitle="Audit de cohérence entre l'Annuaire, les Ressources Humaines et les Licences Azure"
        className="pb-12"
      >
        <div className="animate-in fade-in duration-500 space-y-8">
          <PageHeader 
            title="Gouvernance AD"
            icon={ShieldCheck}
            actions={
              <div className="flex gap-3">
                <button 
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <RefreshIcon size={16} className={isRefetching ? 'animate-spin' : ''} />
                  Actualiser l'analyse
                </button>
              </div>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                title="AD Orphelins" 
                value={unlinkedAds.length} 
                subtitle="Non liés à un agent" 
                icon={UserX}
                color="indigo"
                onClick={() => setActiveTab('orphans')}
                active={activeTab === 'orphans'}
            />
            <StatCard 
                title="Comptes Fantômes" 
                value={ghostAccounts.length} 
                subtitle="Agent parti / AD actif" 
                icon={AlertTriangle}
                color="rose"
                onClick={() => setActiveTab('ghosts')}
                active={activeTab === 'ghosts'}
            />
            <StatCard 
                title="Licences Perdues" 
                value={licenseWaste.length} 
                subtitle="Azure lié / AD off" 
                icon={CreditCard}
                color="amber"
                onClick={() => setActiveTab('waste')}
                active={activeTab === 'waste'}
            />
            <StatCard 
                title="Comptes Techniques" 
                value={technicalAccounts.length} 
                subtitle="Comptes exclus/ignorer" 
                icon={Settings2}
                color="slate"
                onClick={() => setActiveTab('technical')}
                active={activeTab === 'technical'}
            />
          </div>

          <Tabs value={activeTab} className="space-y-8 pt-4">
            <TabsContent value="orphans" className="outline-none">
              <OrphanTab 
                unlinkedAds={unlinkedAds}
                openAgentDetails={openAgentDetails}
                setPendingAccount={setPendingAccount}
                setIsPickerModalOpen={setIsPickerModalOpen}
                setIsIgnoreModalOpen={setIsIgnoreModalOpen}
                refetch={refetch}
              />
            </TabsContent>

            <TabsContent value="ghosts" className="outline-none">
              <GhostTab 
                ghostAccounts={ghostAccounts}
                openAgentDetails={openAgentDetails}
              />
            </TabsContent>

            <TabsContent value="waste" className="outline-none">
              <WasteTab 
                licenseWaste={licenseWaste}
                openAgentDetails={openAgentDetails}
              />
            </TabsContent>

            <TabsContent value="technical" className="outline-none">
              <TechnicalTab 
                technicalAccounts={technicalAccounts}
                refetch={refetch}
              />
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>

      <AgentModal 
        agent={selectedAgent} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />

      <IgnoreAccountModal 
        open={isIgnoreModalOpen}
        onOpenChange={setIsIgnoreModalOpen}
        account={pendingAccount}
        onSuccess={() => { refetch(); setIsIgnoreModalOpen(false); }}
      />

      <AgentPickerModal 
        open={isPickerModalOpen}
        onOpenChange={setIsPickerModalOpen}
        account={pendingAccount}
        onSuccess={() => { refetch(); setIsPickerModalOpen(false); }}
      />
    </div>
  )
}
