'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Mail, Save, Loader2, Info, ChevronRight, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/common/RichTextEditor'
import { ScrollArea } from '@/components/ui/scroll-area'

const DEFAULTS: Record<string, { label: string, vars: string[], default: string }> = {
  'MAIL_MSG_MANAGER': { 
    label: 'Invitation au formulaire (Manager)', 
    vars: ['{{MANAGER_NOM}}', '{{AGENT_NOM}}', '{{FORM_URL}}'],
    default: '<p>Bonjour {{MANAGER_NOM}},</p><p>Un nouvel agent arrive : <strong>{{AGENT_NOM}}</strong>.</p><p>Merci de cliquer ici pour compléter le formulaire : <a href="{{FORM_URL}}">Accéder au formulaire</a></p>'
  },
  'MAIL_MSG_WORKFLOW': { 
    label: 'Notification de tâche (Intervenant)', 
    vars: ['{{AGENT_NOM}}', '{{TASK_NAME}}', '{{VAL_URL}}'],
    default: '<p>Bonjour,</p><p>Une tâche logistique vous attend pour <strong>{{AGENT_NOM}}</strong> : <strong>{{TASK_NAME}}</strong>.</p><p><a href="{{VAL_URL}}">Valider la tâche ici</a></p>'
  },
  'MAIL_MSG_MANAGER_SUBMISSION': { 
    label: 'Confirmation de réception (Manager)', 
    vars: ['{{MANAGER_NOM}}', '{{AGENT_NOM}}', '{{DASH_URL}}'],
    default: '<p>Bonjour {{MANAGER_NOM}},</p><p>Le formulaire pour <strong>{{AGENT_NOM}}</strong> a été bien reçu. Vous pouvez suivre l\'avancement de la préparation logistique ici : <a href="{{DASH_URL}}">Mon Tableau de Bord</a></p>'
  },
  'MAIL_MSG_MANAGER_COMPLETE': { 
    label: 'Clôture Onboarding (Manager)', 
    vars: ['{{MANAGER_NOM}}', '{{AGENT_NOM}}', '{{DASH_URL}}'],
    default: '<p>Bonjour {{MANAGER_NOM}},</p><p>L\'onboarding de <strong>{{AGENT_NOM}}</strong> est maintenant **TERMINÉ**. Toutes les tâches logistiques ont été validées.</p>'
  }
}

export function MailTemplatesSettings() {
  const [params, setParams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState<string | null>(Object.keys(DEFAULTS)[0])
  const [localVal, setLocalVal] = useState<string>('')
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const fetchParams = async () => {
    try {
      const res = await fetch('/api/parametres')
      if (res.ok) {
        const data = await res.json()
        setParams(data)
        
        // Auto-check for missing defaults and create them
        for (const [key, info] of Object.entries(DEFAULTS)) {
          if (!data.find((p: any) => p.cle === key)) {
             console.log(`[MAIL-CONFIG] Creating default for ${key}`);
             await fetch('/api/parametres', {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ key, value: info.default })
             })
          }
        }
        // Refetch if we created something
        if (data.length < Object.keys(DEFAULTS).length) {
            const res2 = await fetch('/api/parametres')
            if (res2.ok) setParams(await res2.json())
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchParams() }, [])

  // Sync editor with selected template
  useEffect(() => {
    if (selectedKey) {
      const found = params.find(p => p.cle === selectedKey)
      setLocalVal(found?.valeur || DEFAULTS[selectedKey]?.default || '')
    }
  }, [selectedKey, params])

  const filteredKeys = Object.keys(DEFAULTS).filter(k => 
    k.toLowerCase().includes(search.toLowerCase()) || 
    DEFAULTS[k].label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    if (!selectedKey) return
    setIsSaving(true)
    try {
      await fetch('/api/parametres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selectedKey, value: localVal })
      })
      await fetchParams()
    } finally {
      setIsSaving(null as any)
      setIsSaving(false)
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 font-black tracking-widest uppercase">Initialisation du gestionnaire de mails...</div>

  const info = selectedKey ? DEFAULTS[selectedKey] : null
  const originalVal = params.find(p => p.cle === selectedKey)?.valeur || ''
  const hasChanged = localVal !== originalVal

  return (
    <div className="flex h-[700px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
      {/* Sidebar - Liste des templates */}
      <div className="w-[320px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Modèles d'emails</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="Rechercher un modèle..." 
              className="pl-9 h-9 text-xs border-slate-200 rounded-xl bg-slate-50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {filteredKeys.map(key => {
              const active = selectedKey === key
              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`w-full group text-left px-4 py-3 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                    active 
                      ? 'bg-white border-indigo-200 shadow-md shadow-indigo-500/5' 
                      : 'border-transparent hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 overflow-hidden">
                    <div className={`text-[11px] font-black leading-tight truncate ${active ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {DEFAULTS[key].label}
                    </div>
                    <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider truncate">
                      {key}
                    </div>
                  </div>
                  {active && <ChevronRight size={14} className="text-indigo-400 shrink-0" />}
                </button>
              )
            })}
            
            {filteredKeys.length === 0 && (
               <div className="p-8 text-center space-y-2 opacity-40">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2">
                     <Search size={16} className="text-slate-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-500">Aucun résultat</p>
               </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content - Éditeur */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedKey ? (
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div className="space-y-1">
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-black text-[9px] uppercase py-0.5 px-2 mb-1">Type de message</Badge>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{info?.label}</h2>
              </div>
              <Button 
                onClick={handleSave}
                disabled={!hasChanged || isSaving}
                className="bg-slate-900 h-11 px-6 rounded-2xl gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Enregistrer les modifications
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-8 space-y-8 max-w-5xl">
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl flex gap-4">
                   <Info className="text-amber-500 shrink-0" size={18} />
                   <p className="text-[11px] font-medium text-amber-900 leading-relaxed italic">
                      Ce message sera injecté dans le gabarit global configuré dans l'onglet principal. 
                      Assurez-vous de conserver les balises <strong>{"{{VARIABLE}}"}</strong> pour les données dynamiques.
                   </p>
                </div>

                <RichTextEditor 
                  label="Contenu du message"
                  value={localVal}
                  onChange={setLocalVal}
                />

                <div className="space-y-3">
                   <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      Variables disponibles pour ce modèle
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {info?.vars.map(v => (
                        <button
                          key={v}
                          onClick={() => setLocalVal(prev => prev + ' ' + v)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-lg text-[10px] font-mono font-bold text-slate-600 hover:text-indigo-600 transition-all flex items-center gap-2 group"
                        >
                          {v}
                          <ChevronRight size={10} className="text-slate-300 group-hover:text-indigo-300" />
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200 bg-slate-50/30">
             <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6">
                <Mail size={40} className="text-slate-100" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] italic opacity-40">Sélectionnez un modèle à gauche</p>
          </div>
        )}
      </div>
    </div>
  )
}
