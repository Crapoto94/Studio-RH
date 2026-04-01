'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlignmentRules } from '@/components/alignments/AlignmentRules'
import { DisalignmentList } from '@/components/alignments/DisalignmentList'
import { Settings2, GitMerge } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageContainer } from '@/components/layout/PageContainer'

export default function AlignementsPage() {
  return (
    <div className="flex bg-[#f4f6fb] min-h-screen text-[#1a2340]">
      <Sidebar />
      <Tabs defaultValue="rules" className="flex-1 flex flex-col">
        <PageContainer 
          title="Alignements" 
          subtitle="Identifiez et gérez les écarts de données entre RH et AD"
          actions={
            <TabsList className="bg-slate-100/50 p-1 border border-slate-200 rounded-xl shadow-sm h-10">
              <TabsTrigger value="rules" className="flex items-center gap-2 text-[13px] font-bold px-4 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <Settings2 className="w-4 h-4" />
                Règles
              </TabsTrigger>
              <TabsTrigger value="checks" className="flex items-center gap-2 text-[13px] font-bold px-4 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg transition-all">
                <GitMerge className="w-4 h-4" />
                Désalignements
              </TabsTrigger>
            </TabsList>
          }
        >
          <div className="focus-visible:outline-none">
            <TabsContent value="rules" className="m-0 focus-visible:outline-none outline-none">
              <AlignmentRules />
            </TabsContent>
            <TabsContent value="checks" className="m-0 focus-visible:outline-none outline-none">
              <DisalignmentList />
            </TabsContent>
          </div>
        </PageContainer>
      </Tabs>
    </div>
  )
}
