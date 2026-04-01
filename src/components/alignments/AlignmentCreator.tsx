'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Loader2 } from 'lucide-react'
import { Agent } from '@/types'

const RH_FIELDS = [
  'MATRICULE', 'NOM', 'PRENOM', 'STATUT', 'STATUT_L', 'DIRECTION', 'DIRECTION_L', 'SERVICE', 'SERVICE_L', 
  'PST_AFFECT', 'PST_AFFECT_L', 'AFFECT', 'AFFECT_L', 'POSTE', 'POSTE_L', 'FONCTION', 'FONCTION_L', 
  'AFFECTGEO', 'AFFECTGEO_L', 'AGT_GRADE', 'AGT_GRADE_L', 'PST_CADREMP', 'PST_CADREMP_L', 'PST_CAT', 
  'DATE_ARRIVEE', 'MOTIF_ARRIVEE', 'DATE_DEPART', 'MOTIF_DEPART', 'DATE_MODIF_DOSS', 'DATE_EXTRACT_DOSS', 
  'DATE_MAJ', 'COLLECTIVITE', 'COLLECTIVITE_L', 'POSITION', 'POSITION_L', 'FIN_PREV_POS', 'CIVILITE', 
  'EMAIL_PERSO', 'EMAIL_PRO', 'TELEPHONE_PRO', 'MOBILE_PRO', 'TEMPS_PARTIEL', 'TEMPS_PARTIEL_L', 
  'ID_AGENT', 'ID_AGENT_ABS', 'DG_CAB', 'DG_CAB_L'
]
const AD_FIELDS = [
  'sam_account', 'distinguished_name', 'display_name', 'given_name', 'surname', 'mail', 'enabled', 
  'last_logon', 'member_of', 'employee_id', 'title', 'department', 'company', 'manager', 'office', 
  'telephone', 'mobile', 'matricule_ad', 'when_created', 'ext_attr1', 'ext_attr2', 'ext_attr3'
]

interface Props {
  onClose: () => void
  onSaved: () => void
  editingRule?: any
}

export function AlignmentCreator({ onClose, onSaved, editingRule }: Props) {
  const [name, setName] = useState(editingRule?.name || '')
  const [fieldRh, setFieldRh] = useState(editingRule?.field_rh || RH_FIELDS[0])
  const [fieldAd, setFieldAd] = useState(editingRule?.field_ad || AD_FIELDS[0])
  const [isCaseSensitive, setIsCaseSensitive] = useState(editingRule?.is_case_sensitive || false)
  const [loading, setLoading] = useState(false)

  // Agent preview logic
  const [search, setSearch] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [brutRh, setBrutRh] = useState<any>(null)
  const [brutAd, setBrutAd] = useState<any>(null)
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!search) return
    setSearching(true)
    try {
      const res = await fetch(`/api/agents?search=${search}&limit=1`)
      const data = await res.json()
      if (data.data && data.data.length > 0) {
        const agent = data.data[0]
        setSelectedAgent(agent)
        // Fetch his brut data
        if (agent.id) {
          const resBrut = await fetch(`/api/agents/${agent.id}/brut`)
          const brut = await resBrut.json()
          setBrutRh(brut.brutRh)
          setBrutAd(brut.brutAd)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const url = editingRule ? `/api/alignments/${editingRule.id}` : '/api/alignments'
    const method = editingRule ? 'PATCH' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, field_rh: fieldRh, field_ad: fieldAd, is_case_sensitive: isCaseSensitive })
    })
    onSaved()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle>{editingRule ? 'Modifier la règle' : 'Nouvelle règle d\'alignement'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nom de la règle</Label>
            <Input placeholder="Ex: Email professionnel, Nom de famille..." value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <Label className="mb-2 block text-xs font-bold text-slate-500 uppercase">Aperçu dynamique (Optionnel)</Label>
            <div className="flex gap-2 mb-3">
              <Input placeholder="Rechercher un agent pour voir ses valeurs..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <Button size="icon" onClick={handleSearch} disabled={searching} className="bg-[#0f172a] hover:bg-[#1e293b] text-white border-0 shrink-0">
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            {selectedAgent && (
              <div className="text-xs text-blue-600 font-medium">Agent sélectionné: {selectedAgent.nom} {selectedAgent.prenom}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source RH</Label>
              <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={fieldRh} onChange={e => setFieldRh(e.target.value)}>
                {RH_FIELDS.map(f => (
                  <option key={f} value={f}>
                    {f} {brutRh ? `(${brutRh[f] || '-'})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Cible AD</Label>
              <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={fieldAd} onChange={e => setFieldAd(e.target.value)}>
                {AD_FIELDS.map(f => (
                  <option key={f} value={f}>
                    {f} {brutAd ? `(${brutAd[f] || '-'})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="case" checked={isCaseSensitive} onCheckedChange={(val) => setIsCaseSensitive(!!val)} />
            <Label htmlFor="case" className="text-sm font-medium leading-none cursor-pointer">Sensible à la casse</Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="default" onClick={onClose} disabled={loading} className="bg-[#0f172a] hover:bg-[#1e293b] text-white border-0">Annuler</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-[#6366f1] hover:bg-[#4f46e5] text-white border-0">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
