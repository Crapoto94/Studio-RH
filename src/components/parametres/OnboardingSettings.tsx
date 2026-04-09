'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileEdit, ListTree, GitBranch, Save, LayoutIcon, Code, Info, ShieldCheck, List, LayoutGrid, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FormEditorTable } from './FormEditorTable'
import { ListEditorTable } from './ListEditorTable'
import { WorkflowEditorTable } from './WorkflowEditorTable'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Boxes } from 'lucide-react'

export function OnboardingSettings() {
  const queryClient = useQueryClient()
  const [expertMode, setExpertMode] = useState(false)
  
  const { data: params = {}, isLoading } = useQuery({
    queryKey: ['parametres'],
    queryFn: async () => {
      const res = await fetch('/api/parametres')
      if (!res.ok) throw new Error('Erreur API')
      const json = await res.json()
      if (!Array.isArray(json)) return {}
      return Object.fromEntries(json.map((p: any) => [p.cle, p.valeur]))
    }
  })

  const [formJson, setFormJson] = useState<string | null>(null)
  const [listsJson, setListsJson] = useState<string | null>(null)
  const [workflowJson, setWorkflowJson] = useState<string | null>(null)

  const saveParam = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      const res = await fetch('/api/parametres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametres'] })
    }
  })

  const currentForm = formJson ?? params['ONBOARDING_FORM_CONFIG'] ?? '[]'
  const currentLists = listsJson ?? params['ONBOARDING_LISTS_CONFIG'] ?? '{}'
  const currentWorkflow = workflowJson ?? params['ONBOARDING_WORKFLOW_CONFIG'] ?? '[]'

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest">Initialisation du Studio...</div>

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full flex flex-col h-full">
      
      {/* Header */}
      <div className="flex justify-between items-end bg-white p-6 border-b border-slate-100">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <LayoutGrid className="text-indigo-600" size={20} /> Configuration Onboarding
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">Pilotez votre engine de recrutement sans code</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-2 px-4 rounded-xl border border-slate-200">
           <div className="flex items-center gap-3">
              <Label htmlFor="expert-mode" className="text-[9px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">
                 Mode Expert (JSON)
              </Label>
              <Switch 
                id="expert-mode" 
                checked={expertMode} 
                onCheckedChange={setExpertMode}
                className="data-[state=checked]:bg-slate-900" 
              />
           </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col w-full max-w-none">
        <Tabs defaultValue="form" className="w-full flex-1 flex flex-col">
          <TabsList className="bg-transparent h-12 p-0 gap-8 justify-start border-b border-slate-100 rounded-none w-full mb-6 shrink-0">
            <TabsTrigger value="form" className="h-full rounded-none border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 px-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all gap-2">
              <FileEdit size={14} /> Description Formulaire
            </TabsTrigger>
            <TabsTrigger value="lists" className="h-full rounded-none border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 px-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all gap-2">
              <List size={14} /> Listes Déroulantes
            </TabsTrigger>
            <TabsTrigger value="workflow" className="h-full rounded-none border-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-600 data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 px-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all gap-2">
              <ShieldCheck size={14} /> Workflow Automatique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="m-0 focus-visible:outline-none w-full flex-1 animate-in fade-in duration-300">
            <div className="space-y-6 w-full max-w-none">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-100 font-black uppercase text-[9px] py-1 px-3 tracking-widest shadow-sm">
                       {expertMode ? "Mode JSON Manuel" : "Éditeur Visuel"}
                    </Badge>
                    {formJson !== null && (
                      <Badge className="bg-amber-100 text-amber-700 font-bold text-[8px] uppercase tracking-widest border-none">Modifications non enregistrées</Badge>
                    )}
                 </div>
                 <button 
                    onClick={() => saveParam.mutate({ key: 'ONBOARDING_FORM_CONFIG', value: currentForm })}
                    disabled={saveParam.isPending || formJson === null}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:bg-slate-800 disabled:opacity-30 active:scale-95"
                 >
                    {saveParam.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Enregistrer Formulaire
                 </button>
              </div>
              
              <div className="w-full max-w-none">
                {expertMode ? (
                  <textarea 
                    className="w-full h-[600px] font-mono text-sm p-6 border border-slate-200 rounded-xl focus:outline-none bg-slate-900 text-indigo-300 shadow-inner resize-none"
                    value={currentForm}
                    onChange={(e) => setFormJson(e.target.value)}
                  />
                ) : (
                  <FormEditorTable 
                    fields={(() => {
                      try { return JSON.parse(currentForm) } catch(e) { return [] }
                    })()} 
                    listsConfig={currentLists}
                    onChange={(newFields) => setFormJson(JSON.stringify(newFields, null, 2))}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lists" className="m-0 focus-visible:outline-none w-full flex-1 animate-in fade-in duration-300">
             <div className="space-y-6 w-full max-w-none">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-100 font-black uppercase text-[9px] py-1 px-3 tracking-widest shadow-sm">
                          {expertMode ? "Mode JSON Manuel" : "Éditeur Visuel"}
                      </Badge>
                      {listsJson !== null && (
                        <Badge className="bg-amber-100 text-amber-700 font-bold text-[8px] uppercase tracking-widest border-none">Modifications non enregistrées</Badge>
                      )}
                   </div>
                   <button 
                      onClick={() => saveParam.mutate({ key: 'ONBOARDING_LISTS_CONFIG', value: currentLists })}
                      disabled={saveParam.isPending || listsJson === null}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:bg-slate-800 disabled:opacity-30 active:scale-95"
                   >
                      {saveParam.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Enregistrer les listes
                   </button>
                </div>
                
                <div className="w-full max-w-none">
                  {expertMode ? (
                    <textarea 
                      className="w-full h-[600px] font-mono p-6 border border-slate-200 rounded-xl focus:outline-none bg-slate-900 text-indigo-300 shadow-inner resize-none"
                      value={currentLists}
                      onChange={(e) => setListsJson(e.target.value)}
                    />
                  ) : (
                    <ListEditorTable 
                      value={currentLists}
                      onChange={(val) => setListsJson(val)}
                    />
                  )}
                </div>
             </div>
          </TabsContent>

          <TabsContent value="workflow" className="m-0 focus-visible:outline-none w-full flex-1 animate-in fade-in duration-300">
             <div className="space-y-6 w-full max-w-none">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-100 font-black uppercase text-[9px] py-1 px-3 tracking-widest shadow-sm">
                          {expertMode ? "Mode JSON Manuel" : "Éditeur Visuel"}
                      </Badge>
                      {workflowJson !== null && (
                        <Badge className="bg-amber-100 text-amber-700 font-bold text-[8px] uppercase tracking-widest border-none">Modifications non enregistrées</Badge>
                      )}
                   </div>
                   <button 
                      onClick={() => saveParam.mutate({ key: 'ONBOARDING_WORKFLOW_CONFIG', value: currentWorkflow })}
                      disabled={saveParam.isPending || workflowJson === null}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:bg-slate-800 disabled:opacity-30 active:scale-95"
                   >
                      {saveParam.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Enregistrer Workflow
                   </button>
                </div>
                
                <div className="w-full max-w-none">
                  {expertMode ? (
                    <textarea 
                      className="w-full h-[600px] font-mono p-6 border border-slate-200 rounded-xl focus:outline-none bg-slate-900 text-indigo-300 shadow-inner resize-none"
                      value={currentWorkflow}
                      onChange={(e) => setWorkflowJson(e.target.value)}
                    />
                  ) : (
                    <WorkflowEditorTable 
                      value={currentWorkflow}
                      onChange={(val) => setWorkflowJson(val)}
                    />
                  )}
                </div>
              </div>
           </TabsContent>
        </Tabs>
        
        <div className="mt-8 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center gap-5">
           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0 border border-indigo-50">
              <Info size={20} />
           </div>
           <div className="flex-1 text-[10px] font-bold text-slate-500 uppercase opacity-70 leading-relaxed">
              Les modifications sont stockées dans la base de données principale et sont appliquées instantanément aux nouveaux dossiers d'arrivée.
           </div>
           <Badge className="bg-indigo-600 text-white font-black uppercase text-[8px] px-2.5 py-1 border-none shadow-lg shadow-indigo-600/20">v2.0 Visual</Badge>
        </div>
      </div>
    </div>
  )
}
