'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { AdminGuard } from '@/components/layout/AdminGuard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Save, Server, Shield, FileText, Blocks, Users, Wifi, Search, CheckCircle2, XCircle, Loader2, Mail, MessageSquare, History, Database } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { OnboardingSettings } from '@/components/parametres/OnboardingSettings'
import { MailTemplatesSettings } from '@/components/parametres/MailTemplatesSettings'
import { RolesAndUsers } from '@/components/parametres/RolesAndUsers'
import { ImportDepartedAgents } from '@/components/parametres/ImportDepartedAgents'
import { PostgresSettings } from '@/components/parametres/PostgresSettings'
import { MagAppApp } from '@/types'
import { RichTextEditor } from '@/components/common/RichTextEditor'

// Import de l'éditeur riche dynamiquement (côté client uniquement)
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-40 w-full bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
})
import 'react-quill-new/dist/quill.snow.css'

// ─ Types ──────────────────────────────────────────────────────────────────────
type TestStatus = 'idle' | 'loading' | 'ok' | 'error'

// ─ Hook : fetch all parametres at once ────────────────────────────────────────
function useParametres() {
  return useQuery({
    queryKey: ['parametres'],
    queryFn: async () => {
      const res = await fetch('/api/parametres')
      if (!res.ok) throw new Error('Erreur de chargement des paramètres')
      const json = await res.json()
      if (!Array.isArray(json)) return {}
      return Object.fromEntries(json.map((p: any) => [p.cle, p.valeur]))
    }
  })
}

// ─ Mini test utility ──────────────────────────────────────────────────────────
function TestResult({ status, message }: { status: TestStatus, message?: string }) {
  if (status === 'idle') return null
  if (status === 'loading') return <span className="flex items-center gap-1 text-xs text-blue-400"><Loader2 size={12} className="animate-spin" /> Test en cours…</span>
  if (status === 'ok') return <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle2 size={12} /> {message || 'Connexion OK'}</span>
  return <span className="flex items-center gap-1 text-xs text-red-400"><XCircle size={12} /> {message || 'Échec de connexion'}</span>
}


// ─ Page ───────────────────────────────────────────────────────────────────────
export default function ParametresPage() {
  return (
    <AdminGuard>
      <div className="flex bg-[#f4f6fb] text-[#1a2340] min-h-screen">
        <Sidebar />
        <PageContainer
          title="Paramètres Système"
          subtitle="Configuration globale de l'application RH Studio"
          className="pb-12"
        >
          <PageHeader title="Administration" icon={Settings} />
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[600px] w-full max-w-none">
            <Tabs defaultValue="ad_azure" className="w-full h-full flex flex-col">
              <TabsList className="bg-slate-50 border-b border-slate-200 p-2 w-full justify-start overflow-x-auto rounded-t-2xl h-auto shrink-0">
                <TabsTrigger value="ad_azure" className="gap-2"><Server size={14} /> AD &amp; Entra</TabsTrigger>
                <TabsTrigger value="postgres" className="gap-2"><Database size={14} /> Base PostgreSQL</TabsTrigger>
                <TabsTrigger value="api" className="gap-2"><Blocks size={14} /> API Ville Ivry</TabsTrigger>
                <TabsTrigger value="hierarchie" className="gap-2"><FileText size={14} /> Hiérarchies</TabsTrigger>
                <TabsTrigger value="rh" className="gap-2"><Shield size={14} /> Règles RH</TabsTrigger>
                <TabsTrigger value="onboarding" className="gap-2"><FileText size={14} /> Onboarding</TabsTrigger>
                <TabsTrigger value="mail" className="gap-2"><Mail size={14} /> Configuration Mails</TabsTrigger>
                <TabsTrigger value="users" className="gap-2"><Users size={14} /> Utilisateurs & Rôles</TabsTrigger>
              </TabsList>

              <div className="flex-1 w-full overflow-x-hidden">
                <TabsContent value="ad_azure" className="m-0 space-y-8 p-8 w-full max-w-none animate-in fade-in duration-500">
                  <AdSection />
                  <EntraSection />
                </TabsContent>
                
                <TabsContent value="postgres" className="m-0 p-8 w-full max-w-none animate-in fade-in duration-500">
                  <PostgresSettings />
                </TabsContent>

                <TabsContent value="api" className="m-0 space-y-6 p-8 w-full max-w-none animate-in fade-in duration-500">
                  <SettingSection title="API Ville Ivry">
                    <ApiTab />
                  </SettingSection>
                </TabsContent>

                <TabsContent value="hierarchie" className="m-0 space-y-6 p-8 w-full max-w-none animate-in fade-in duration-500">
                  <SettingSection title="Règles de génération hiérarchique">
                    <p className="text-sm text-slate-500 mb-4">Ces options définissent comment nettoyer et aplatir les niveaux de l'arbre Ciril.</p>
                    <SimpleCheckbox label="Ignorer structures vides" dbKey="HIER_IGNORE_EMPTY" />
                    <SimpleCheckbox label="Forcer Direction pour le Cabinet" dbKey="HIER_FORCE_DIR_CAB" />
                  </SettingSection>
                </TabsContent>

                <TabsContent value="rh" className="m-0 space-y-6 p-8 w-full max-w-none animate-in fade-in duration-500">
                  <SettingSection title="Mappage RH">
                    <SimpleInput label="Seuil Agent 'Nouveau' (en jours)" dbKey="RH_NOUV_DAYS" placeholder="15" />
                    <SimpleInput label="Seuil Agent 'Futur' (en jours)" dbKey="RH_FUTUR_DAYS" placeholder="30" />
                  </SettingSection>

                  <PositionsActivesSection />
                  
                  <ImportDepartedAgents />
                </TabsContent>
                
                <TabsContent value="onboarding" className="m-0 w-full p-8 animate-in fade-in duration-500">
                  <OnboardingSettings />
                </TabsContent>

                <TabsContent value="mail" className="m-0 space-y-6 p-8 w-full max-w-none animate-in fade-in duration-500">
                  <MailSection />
                </TabsContent>

                <TabsContent value="users" className="m-0 p-8 w-full max-w-none animate-in fade-in duration-500">
                  <RolesAndUsers />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </PageContainer>
      </div>
    </AdminGuard>
  )
}

// ─ AD Section ─────────────────────────────────────────────────────────────────
function AdSection() {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Record<string, string>>({})

  const fields: { label: string; key: string; placeholder?: string; type?: string }[] = [
    { label: 'Serveur LDAP (URL)', key: 'AD_SERVER_URL', placeholder: 'ldap://dc1.ivry.local' },
    { label: 'Port', key: 'AD_PORT', placeholder: '389' },
    { label: 'Base DN', key: 'AD_BASE_DN', placeholder: 'DC=ivry,DC=local' },
    { label: 'Compte de service (UPN)', key: 'AD_SRV_ACCOUNT', placeholder: 'svc-rhstudio@ivry.local' },
    { label: 'Mot de passe', key: 'AD_SRV_PASSWORD', placeholder: '••••••••', type: 'password' },
    { label: 'Attribut Matricule AD', key: 'AD_ATTRIBUTE_MATRICULE', placeholder: 'employeeID (par défaut)' },
  ]

  const getValue = (key: string) => key in form ? form[key] : (params[key] ?? '')
  const isDirty = fields.some(f => f.key in form && form[f.key] !== (params[f.key] ?? ''))

  const saveAll = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(form)) {
        await fetch('/api/parametres', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        })
      }
    },
    onSuccess: () => {
      setForm({})
      queryClient.invalidateQueries({ queryKey: ['parametres'] })
    }
  })
  const [testConn, setTestConn] = useState<TestStatus>('idle')
  const [testSearch, setTestSearch] = useState<TestStatus>('idle')
  const [testMsg, setTestMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const runTest = async (action: 'connect' | 'search') => {
    if (action === 'connect') { setTestConn('loading'); setTestSearch('idle') }
    else { setTestSearch('loading'); setTestConn('idle') }
    setTestMsg('')
    setSearchResults([])
    try {
      const res = await fetch('/api/test-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, searchTerm }),
      })
      const data = await res.json()
      if (action === 'connect') { setTestConn(data.ok ? 'ok' : 'error') }
      else { setTestSearch(data.ok ? 'ok' : 'error') }
      setTestMsg(data.message)
      if (data.results) setSearchResults(data.results)
    } catch (e: any) {
      if (action === 'connect') setTestConn('error')
      else setTestSearch('error')
      setTestMsg('Erreur réseau : ' + e.message)
    }
  }

  return (
    <SettingSection title="Active Directory (LDAP)">
      <div className="space-y-3 max-w-2xl">
        {fields.map(f => (
          <FieldRow key={f.key} label={f.label} value={getValue(f.key)}
            onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))}
            placeholder={f.placeholder} type={f.type} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-200">
        <button onClick={() => saveAll.mutate()} disabled={!isDirty || saveAll.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 transition-colors">
          <Save size={15} /> {saveAll.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button onClick={() => runTest('connect')} disabled={testConn === 'loading'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
          {testConn === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={15} />} Tester la connexion
        </button>
        <div className="flex items-center gap-1">
          <input
            type="text" placeholder="Nom ou sam…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm w-40 focus:outline-none focus:border-indigo-400"
          />
          <button onClick={() => runTest('search')} disabled={testSearch === 'loading'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
            {testSearch === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Search size={15} />} Rechercher
          </button>
        </div>
        <TestResult status={testConn !== 'idle' ? testConn : testSearch} message={testMsg} />
      </div>
      {searchResults.length > 0 && (
        <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden text-sm">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr><th className="px-3 py-2 text-left">Login</th><th className="px-3 py-2 text-left">Nom</th><th className="px-3 py-2 text-left">Mail</th><th className="px-3 py-2 text-left">Service</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {searchResults.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">{r.login}</td>
                  <td className="px-3 py-2">{r.nom}</td>
                  <td className="px-3 py-2 text-slate-500">{r.mail}</td>
                  <td className="px-3 py-2 text-slate-400">{r.service}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SettingSection>
  )
}

// ─ Entra Section ──────────────────────────────────────────────────────────────
function EntraSection() {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Record<string, string>>({})
  const [testConn, setTestConn] = useState<TestStatus>('idle')
  const [testSearch, setTestSearch] = useState<TestStatus>('idle')
  const [testMsg, setTestMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  const fields: { label: string; key: string; placeholder?: string; type?: string }[] = [
    { label: 'Tenant ID', key: 'AZURE_TENANT', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
    { label: 'Client ID', key: 'AZURE_CLIENT', placeholder: 'Application (client) ID' },
    { label: 'Client Secret', key: 'AZURE_SECRET', placeholder: '••••••••', type: 'password' },
  ]

  const getValue = (key: string) => key in form ? form[key] : (params[key] ?? '')
  const isDirty = fields.some(f => f.key in form && form[f.key] !== (params[f.key] ?? ''))

  const saveAll = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(form)) {
        await fetch('/api/parametres', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        })
      }
    },
    onSuccess: () => {
      setForm({})
      queryClient.invalidateQueries({ queryKey: ['parametres'] })
    }
  })

  const runTest = async (action: 'connect' | 'search') => {
    if (action === 'connect') { setTestConn('loading'); setTestSearch('idle') }
    else { setTestSearch('loading'); setTestConn('idle') }
    setTestMsg('')
    setSearchResults([])
    try {
      const res = await fetch('/api/test-azure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, searchTerm }),
      })
      const data = await res.json()
      if (action === 'connect') { setTestConn(data.ok ? 'ok' : 'error') }
      else { setTestSearch(data.ok ? 'ok' : 'error') }
      setTestMsg(data.message)
      if (data.results) setSearchResults(data.results)
    } catch (e: any) {
      if (action === 'connect') setTestConn('error')
      else setTestSearch('error')
      setTestMsg('Erreur réseau : ' + e.message)
    }
  }

  return (
    <SettingSection title="Azure Entra ID (Microsoft Graph)">
      <div className="space-y-3 max-w-2xl">
        {fields.map(f => (
          <FieldRow key={f.key} label={f.label} value={getValue(f.key)}
            onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))}
            placeholder={f.placeholder} type={f.type} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-200">
        <button onClick={() => saveAll.mutate()} disabled={!isDirty || saveAll.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 transition-colors">
          <Save size={15} /> {saveAll.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button onClick={() => runTest('connect')} disabled={testConn === 'loading'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
          {testConn === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={15} />} Tester la connexion
        </button>
        <div className="flex items-center gap-1">
          <input type="text" placeholder="Nom ou UPN…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm w-40 focus:outline-none focus:border-indigo-400" />
          <button onClick={() => runTest('search')} disabled={testSearch === 'loading'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
            {testSearch === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Search size={15} />} Rechercher
          </button>
        </div>
        <TestResult status={testConn !== 'idle' ? testConn : testSearch} message={testMsg} />
      </div>
      {searchResults.length > 0 && (
        <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden text-sm">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr><th className="px-3 py-2 text-left">Nom</th><th className="px-3 py-2 text-left">Mail</th><th className="px-3 py-2 text-left">Actif</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {searchResults.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-3 py-2">{r.nom}</td>
                  <td className="px-3 py-2 text-slate-500">{r.mail}</td>
                  <td className="px-3 py-2">{r.actif ? <span className="text-green-600 text-xs font-medium">Actif</span> : <span className="text-slate-400 text-xs">Inactif</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SettingSection>
  )
}

// ─ API Tab ────────────────────────────────────────────────────────────────────
function ApiTab() {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Record<string, string>>({})
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [testMsg, setTestMsg] = useState('')

  const fields = [
    { label: 'URL API Ville', key: 'API_VILLE_URL', placeholder: 'https://api-dev.ivry.local/api' },
    { label: 'TOKEN API Ville', key: 'API_VILLE_TOKEN', type: 'password' },
    { label: 'URL Documentation API', key: 'API_SMS_URL', placeholder: 'https://api-dev.ivry.local/api-docs' },
  ]

  const getValue = (key: string) => key in form ? form[key] : (params[key] ?? '')
  const isDirty = fields.some(f => f.key in form && form[f.key] !== (params[f.key] ?? ''))

  const saveAll = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(form)) {
        await fetch('/api/parametres', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        })
      }
    },
    onSuccess: () => {
      setForm({})
      queryClient.invalidateQueries({ queryKey: ['parametres'] })
    }
  })

  const runTest = async () => {
    setTestStatus('loading')
    setTestMsg('')
    try {
      const res = await fetch('/api/test-astre', { method: 'POST' })
      const data = await res.json()
      setTestStatus(data.ok ? 'ok' : 'error')
      setTestMsg(data.message)
    } catch (e: any) {
      setTestStatus('error')
      setTestMsg('Erreur : ' + e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 max-w-2xl">
        {fields.map(f => (
          <FieldRow key={f.key} label={f.label} value={getValue(f.key)}
            onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))}
            placeholder={f.placeholder} type={f.type} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-200">
        <button onClick={() => saveAll.mutate()} disabled={!isDirty || saveAll.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-40 hover:bg-indigo-700 transition-colors">
          <Save size={15} /> {saveAll.isPending ? 'Enregistrement…' : 'Enregistrer les paramètres'}
        </button>
        <button onClick={runTest} disabled={testStatus === 'loading'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
          {testStatus === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={15} />} Tester l'API
        </button>
        <TestResult status={testStatus} message={testMsg} />
      </div>

      <SqlZone />

      <DsihubSection />

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <History size={16} className="text-indigo-500" /> Historique des communications
        </h4>
        <div className="flex gap-4">
          <Link href="/parametres/logs/emails" className="flex-1 flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Mail size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Emails envoyés</div>
                <div className="text-xs text-slate-500">Suivi des notifications par courriel</div>
              </div>
            </div>
            <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
              <History size={16} />
            </div>
          </Link>

          <Link href="/parametres/logs/sms" className="flex-1 flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">SMS envoyés</div>
                <div className="text-xs text-slate-500">Suivi des notifications mobiles</div>
              </div>
            </div>
            <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
              <History size={16} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function SqlZone() {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [views, setViews] = useState<string[]>([])
  const [currentType, setCurrentType] = useState<'rh' | 'hierarchie' | null>(null)

  const fetchViews = async (type: 'rh' | 'hierarchie') => {
    setLoading(type)
    setCurrentType(type)
    try {
      const res = await fetch(`/api/sql/views?type=${type}`)
      const json = await res.json()
      setViews(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const saveView = async (valeur: string) => {
    if (!currentType) return
    const key = currentType === 'rh' ? 'SQL_VIEW_RH' : 'SQL_VIEW_HIER'
    await fetch('/api/parametres', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: valeur })
    })
    queryClient.invalidateQueries({ queryKey: ['parametres'] })
    setViews([])
    setCurrentType(null)
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <Blocks size={16} className="text-indigo-500" /> Configuration des Vues SQL (Imports Brut)
      </h4>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[300px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">Vue pour l'import RH</label>
          <div className="flex gap-2">
            <div className="flex-1 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 truncate">
               {params['SQL_VIEW_RH'] || 'Aucune vue définie'}
            </div>
            <button onClick={() => fetchViews('rh')} disabled={loading === 'rh'}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {loading === 'rh' ? <Loader2 size={12} className="animate-spin" /> : 'Vue RH'}
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-[300px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">Vue pour l'import Hiérarchie</label>
          <div className="flex gap-2">
            <div className="flex-1 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 truncate">
               {params['SQL_VIEW_HIER'] || 'Aucune vue définie'}
            </div>
            <button onClick={() => fetchViews('hierarchie')} disabled={loading === 'hierarchie'}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {loading === 'hierarchie' ? <Loader2 size={12} className="animate-spin" /> : 'Vue Hiérarchie'}
            </button>
          </div>
        </div>
      </div>

      {views.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center mb-3">
             <span className="text-xs font-semibold text-indigo-700 uppercase">Choisir une vue ({currentType}) :</span>
             <button onClick={() => setViews([])} className="text-xs text-indigo-400 hover:text-indigo-600">Fermer</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {views.map(v => (
              <button key={v} onClick={() => saveView(v)}
                className="text-left px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm hover:border-indigo-500 hover:bg-indigo-100 transition-all truncate font-mono">
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─ Shared primitives ──────────────────────────────────────────────────────────
function PositionsActivesSection() {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const { data: positions = [], isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await fetch('/api/sql/positions')
      return res.json() as Promise<string[]>
    }
  })

  const rawActive = params['RH_POSITIONS_ACTIVES'] || ''
  const activePositions = rawActive ? rawActive.split(',') : []

  const togglePosition = async (pos: string) => {
    let newActive = [...activePositions]
    if (newActive.includes(pos)) {
      newActive = newActive.filter(p => p !== pos)
    } else {
      newActive.push(pos)
    }
    const newValue = newActive.join(',')
    
    await fetch('/api/parametres', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'RH_POSITIONS_ACTIVES', value: newValue })
    })
    queryClient.invalidateQueries({ queryKey: ['parametres'] })
  }

  if (isLoading) return <div className="p-4 text-slate-400 text-sm">Chargement des positions…</div>

  return (
    <SettingSection title="Positions Actives">
      <p className="text-sm text-slate-500 mb-4">
        Sélectionnez les positions considérées comme "actives". Les agents ayant ces positions seront marqués comme actifs dans le Dashboard et les exports.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-1">
        {positions.map(pos => (
          <label key={pos} className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
            activePositions.includes(pos) 
              ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}>
            <input
              type="checkbox"
              checked={activePositions.includes(pos)}
              onChange={() => togglePosition(pos)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className={`text-sm ${activePositions.includes(pos) ? 'text-indigo-900 font-medium' : 'text-slate-600'}`}>{pos}</span>
          </label>
        ))}
      </div>
    </SettingSection>
  )
}

function SettingSection({ title, children, noPadding = false }: { title: string, children: React.ReactNode, noPadding?: boolean }) {
  return (
    <div className={cn("bg-slate-50 rounded-xl border border-slate-200 overflow-hidden", !noPadding && "p-5")}>
      <h3 className="font-display font-semibold text-slate-800 text-lg border-b border-slate-200 pb-2 mb-4 px-5 pt-5">{title}</h3>
      <div className={cn(noPadding ? "p-0" : "px-0")}>
        {children}
      </div>
    </div>
  )
}

function FieldRow({ label, value, onChange, placeholder, type = 'text' }: {
  label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <label className="sm:w-56 text-sm font-medium text-slate-600 shrink-0">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition-colors"
      />
    </div>
  )
}

function SimpleInput({ label, dbKey, placeholder, type = 'text' }: {
  label: string, dbKey: string, placeholder?: string, type?: string
}) {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [val, setVal] = useState('')

  const serverVal = params[dbKey] ?? ''
  const effective = val || serverVal

  const save = useMutation({
    mutationFn: async () => {
      await fetch('/api/parametres', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: dbKey, value: val })
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parametres'] })
  })

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <label className="sm:w-56 text-sm font-medium text-slate-600 shrink-0">{label}</label>
      <div className="flex-1 flex gap-2">
        <input type={type} value={effective} onChange={e => setVal(e.target.value)} placeholder={placeholder}
          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition-colors" />
        <button onClick={() => save.mutate()} disabled={!val || save.isPending}
          className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-indigo-600 disabled:opacity-30 transition-all">
          <Save size={16} />
        </button>
      </div>
    </div>
  )
}

function SimpleCheckbox({ label, dbKey }: { label: string, dbKey: string }) {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [val, setVal] = useState<boolean | null>(null)
  const serverVal = params[dbKey] === 'true'
  const effective = val !== null ? val : serverVal

  const save = useMutation({
    mutationFn: async (v: boolean) => {
      await fetch('/api/parametres', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: dbKey, value: String(v) })
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parametres'] })
  })

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input type="checkbox" checked={effective} onChange={e => { setVal(e.target.checked); save.mutate(e.target.checked) }}
        className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
    </div>
  )
}
function SimpleRichText({ label, dbKey }: { label: string, dbKey: string }) {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [val, setVal] = useState<string | null>(null)
  
  const serverVal = params[dbKey] || ''
  const effective = val !== null ? val : serverVal

  const save = useMutation({
    mutationFn: async (v: string) => {
      await fetch('/api/parametres', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: dbKey, value: v })
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parametres'] })
  })

  // Debounced auto-save or Manual save? Let's stick to a Save button or auto-save on change.
  // Given it's a rich editor, maybe a manual save button in the header of the editor is better.
  
  return (
    <div className="space-y-2">
      <RichTextEditor 
        label={label}
        value={effective} 
        onChange={(v) => {
          setVal(v)
          // On pourrait auto-sauvegarder ici avec un debounce
        }} 
      />
      <div className="flex justify-end">
        <button 
          onClick={() => save.mutate(effective)}
          disabled={save.isPending || val === null || val === serverVal}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 disabled:opacity-50 transition-all shadow-sm"
        >
          {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Enregistrer {label}
        </button>
      </div>
    </div>
  )
}

function MailSection() {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [testAddr, setTestAddr] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const [testOk, setTestOk] = useState<boolean | null>(null)

  const sendTest = async () => {
    if (!testAddr) return
    setSendingTest(true)
    setTestMsg('')
    try {
      const res = await fetch('/api/test-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testAddr })
      })
      const data = await res.json()
      setTestOk(res.ok)
      setTestMsg(res.ok ? 'Email envoyé' : data.error)
    } catch (e: any) {
      setTestOk(false)
      setTestMsg(e.message)
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="space-y-10">
      <SettingSection title="Expéditeur & Gabarit Global (HTPL)">
        <p className="text-sm text-slate-500 mb-4">
          Configurez l'identité de l'expéditeur et la structure HTML globale qui enveloppe vos messages (utilisez <code>{"{{CONTENT}}"}</code>).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SimpleInput 
            label="Nom de l'expéditeur" 
            dbKey="MAIL_SENDER_NAME" 
            placeholder="API Proxy Manager - Ville d'Ivry-sur-Seine" 
          />
          <SimpleInput 
            label="Email de l'expéditeur" 
            dbKey="MAIL_SENDER_EMAIL" 
            placeholder="dsihub@fbc.fr" 
          />
          <SimpleInput 
            label="URL de base (Public)" 
            dbKey="APP_BASE_URL" 
            placeholder="http://localhost:3000" 
          />
        </div>
        <SimpleRichText 
          label="Template HTML Global" 
          dbKey="MAIL_TEMPLATE_HTML" 
        />
      </SettingSection>

      <SettingSection title="Messages Contextuels">
        <MailTemplatesSettings />
      </SettingSection>

      <SettingSection title="Test d'envoi">
        <div className="flex gap-4 items-end bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Adresse email de test</label>
            <input 
              type="email" 
              value={testAddr} 
              onChange={e => setTestAddr(e.target.value)}
              placeholder="votre-email@ivry.local"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button 
            onClick={sendTest}
            disabled={!testAddr || sendingTest}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {sendingTest ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            Tester l'envoi
          </button>
        </div>
        {testMsg && (
          <p className={`mt-2 text-xs font-medium ${testOk ? 'text-green-600' : 'text-red-600'}`}>{testMsg}</p>
        )}
      </SettingSection>
    </div>
  )
}

function SimpleTextarea({ label, dbKey, placeholder, rows = 3 }: {
  label: string, dbKey: string, placeholder?: string, rows?: number
}) {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [val, setVal] = useState('')

  const serverVal = params[dbKey] ?? ''
  const effective = val !== null && val !== "" ? val : serverVal

  const save = useMutation({
    mutationFn: async () => {
      await fetch('/api/parametres', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: dbKey, value: val || serverVal })
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parametres'] })
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        <button onClick={() => save.mutate()} disabled={(!val) || save.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 text-xs font-bold disabled:opacity-30 transition-all">
          <Save size={12} /> {save.isPending ? 'Enregistrement…' : 'Sauvegarder'}
        </button>
      </div>
      <textarea 
        rows={rows} 
        value={effective} 
        onChange={e => setVal(e.target.value)} 
        placeholder={placeholder}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 font-mono transition-colors" 
      />
    </div>
  )
}

// ─ DSIHub Section ─────────────────────────────────────────────────────────────
function DsihubSection() {
  const { data: params = {} } = useParametres()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [apps, setApps] = useState<MagAppApp[]>([])
  const [error, setError] = useState('')

  const fetchApps = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/dsihub/apps')
      const json = await res.json()
      if (json.error) throw new Error(json.message || json.error)
      setApps(json.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <Wifi size={16} className="text-indigo-500" /> API DSIHub & MagApp
      </h4>

      <div className="space-y-4">
        <div className="max-w-2xl">
          <SimpleInput 
            label="URL API DSIHub" 
            dbKey="DSIHUB_API_URL" 
            placeholder="http://10.103.130.106:3001/api" 
          />
          <p className="text-[10px] text-slate-400 mt-1 ml-0 sm:ml-60">
            L'URL du backend AppDSI pour lister les applications MagApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchApps} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Lister les applications (MagApp)
          </button>
          
          {error && <span className="text-xs text-red-500 flex items-center gap-1 font-medium"><XCircle size={14} /> {error}</span>}
          {apps.length > 0 && <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium"><CheckCircle2 size={14} /> {apps.length} applications trouvées</span>}
        </div>

        {apps.length > 0 && (
          <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">URL</th>
                  <th className="px-4 py-3 text-center">MagApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {apps.map((app: MagAppApp) => (
                  <tr key={app.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-700">{app.name}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[300px] truncate" title={app.description}>{app.description}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-indigo-600 truncate max-w-[200px]">{app.url}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.present_magapp === 'oui' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {app.present_magapp === 'oui' ? 'OUI' : 'NON'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
