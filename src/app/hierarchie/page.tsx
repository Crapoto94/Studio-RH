'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { GitBranch, Search, RefreshCw, Settings2, Palette, Database } from 'lucide-react'
import { useHierarchie } from '@/hooks/useHierarchie'
import { HierarchieTree } from '@/components/hierarchie/HierarchieTree'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function HierarchiePage() {
  const { items, levels, isLoading, error, refetch } = useHierarchie()
  const [search, setSearch] = useState('')
  const [reconstructing, setReconstructing] = useState(false)

  const filteredItems = search
    ? items.filter((i: any) =>
        [i.nom_dg_cab_l, i.nom_direction_l, i.nom_service_l, i.nom_secteur_l, i.nom_affect_l]
          .some(v => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : items

  const handleReconstruct = async () => {
    setReconstructing(true)
    try {
      const res = await fetch('/api/hierarchy/reconstruct', { method: 'POST' })
      const data = await res.json()
      alert(data.message || 'Reconstruction terminée')
      refetch()
    } catch { alert('Erreur') }
    finally { setReconstructing(false) }
  }

  const updateLevel = async (id: number, data: any) => {
    await fetch('/api/hierarchy', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'level', id, data })
    })
    refetch()
  }

  const levelSourceMap: Record<number, string> = {
    4: 'CODE_DG-CAB / NOM_DG-CAB_L',
    3: 'CODE_DIRECTION / NOM_DIRECTION_L',
    2: 'CODE_SERVICE / NOM_SERVICE_L',
    1: 'CODE_SECTEUR / NOM_SECTEUR_L',
    0: 'CODE_AFFECT / NOM_AFFECT_L',
  }

  return (
    <div className="flex bg-[#f4f6fb] text-[#1a2340]">
      <Sidebar />
      <Tabs defaultValue="structure" className="flex-1 flex flex-col min-h-screen">
        <PageContainer
          title="Organigramme & Hiérarchie"
          subtitle="Visualisation de la structure organisationnelle de la Ville"
          className="pb-12"
          actions={
            <div className="flex items-center gap-4">
              <TabsList className="bg-slate-100 p-1 rounded-xl h-10">
                <TabsTrigger value="structure" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs px-4">
                  <GitBranch className="mr-2 h-3.5 w-3.5" /> Structure
                </TabsTrigger>
                <TabsTrigger value="levels" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs px-4">
                  <Settings2 className="mr-2 h-3.5 w-3.5" /> Configuration
                </TabsTrigger>
              </TabsList>
              
              <div className="h-6 w-px bg-slate-200 mx-1" />

              <Button
                onClick={handleReconstruct}
                disabled={reconstructing}
                className="bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl shadow-sm"
              >
                {reconstructing
                  ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  : <RefreshCw className="mr-2 h-4 w-4" />}
                Reconstruire
              </Button>
            </div>
          }
        >
          {/* === ONGLET STRUCTURE === */}
          <TabsContent value="structure" className="mt-0 outline-none">
            <div className="glass-card flex flex-col min-h-[500px] border border-slate-200">
              <div className="p-4 border-b border-slate-200 flex gap-4 items-center bg-white/80">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Chercher une direction, service..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-800 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Badge variant="outline" className="text-slate-500 border-slate-300">
                  {items.length} chemins
                </Badge>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-slate-100 rounded w-1/3" />
                    <div className="h-6 bg-slate-100 rounded w-1/4 ml-8" />
                    <div className="h-6 bg-slate-100 rounded w-1/4 ml-8" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 p-4 bg-red-50 rounded-lg text-sm border border-red-200">
                    Impossible de charger la hiérarchie.
                  </div>
                ) : (
                  <HierarchieTree items={filteredItems} />
                )}
              </div>
            </div>
          </TabsContent>

          {/* === ONGLET CONFIGURATION DES NIVEAUX === */}
          <TabsContent value="levels" className="mt-0 outline-none">
            <div className="grid grid-cols-1 gap-4">
              {[...levels].sort((a: any, b: any) => b.level - a.level).map((lvl: any) => (
                <Card key={lvl.id} className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: lvl.color || '#1a2340' }}
                      >
                        {lvl.level}
                      </div>
                      <h3 className="font-bold text-slate-800">Niveau {lvl.level} — {lvl.name}</h3>
                    </div>
                    <Badge variant="outline" className="bg-white text-slate-400 border-slate-200 text-[10px] font-mono">
                      {levelSourceMap[lvl.level] || '...'}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Settings2 size={12} /> Nom personnalisé
                        </Label>
                        <Input
                          defaultValue={lvl.name}
                          onBlur={(e) => updateLevel(lvl.id, { ...lvl, name: e.target.value })}
                          className="h-9 border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Palette size={12} /> Couleur associée
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            defaultValue={lvl.color || '#6366f1'}
                            onChange={(e) => updateLevel(lvl.id, { ...lvl, color: e.target.value })}
                            className="w-12 h-9 p-1 border-slate-200 rounded-lg cursor-pointer"
                          />
                          <Input
                            defaultValue={lvl.color || '#6366f1'}
                            onBlur={(e) => updateLevel(lvl.id, { ...lvl, color: e.target.value })}
                            className="flex-1 h-9 border-slate-200 rounded-lg font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <Database size={12} /> Règle Responsable (SQL)
                        </Label>
                        <Input
                          placeholder="Ex: POSTE LIKE 'DIR%'"
                          defaultValue={lvl.responsable_sql || ''}
                          onBlur={(e) => updateLevel(lvl.id, { ...lvl, responsable_sql: e.target.value })}
                          className="h-9 border-slate-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </PageContainer>
      </Tabs>
    </div>
  )
}
