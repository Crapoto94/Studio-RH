'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Download, Upload, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Software } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SoftwareEditorTableProps {
  value: string // JSON string of Software[]
  onChange: (value: string) => void
}

const TECHNOS = ['Web', 'Saas', 'monoposte', 'client serveur'] as const

export function SoftwareEditorTable({ value, onChange }: SoftwareEditorTableProps) {
  const softwares: Software[] = (() => {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddField = () => {
    const newSoftware: Software = {
      id: Math.random().toString(36).substr(2, 9),
      nom: '',
      description: '',
      techno: 'Web',
      email_createur: ''
    }
    onChange(JSON.stringify([...softwares, newSoftware], null, 2))
  }

  const handleUpdateField = (id: string, field: keyof Software, val: any) => {
    const next = softwares.map(s => s.id === id ? { ...s, [field]: val } : s)
    onChange(JSON.stringify(next, null, 2))
  }

  const handleRemoveField = (id: string) => {
    const next = softwares.filter(s => s.id !== id)
    onChange(JSON.stringify(next, null, 2))
  }

  const exportExcel = () => {
    const dataToExport = softwares.map(({ id, ...rest }) => ({
      'Nom': rest.nom,
      'Description': rest.description,
      'Technologie': rest.techno,
      'Email Créateur': rest.email_createur
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logiciels')
    XLSX.writeFile(workbook, 'referentiel_logiciels_dsi.xlsx')
  }

  const importExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data = XLSX.utils.sheet_to_json(ws) as any[]
      
      const newSoftwares = data.map((item: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        nom: item.Nom || item.nom || item.name || '',
        description: item.Description || item.description || '',
        techno: TECHNOS.includes(item.Technologie || item.techno || item.Techno) 
          ? (item.Technologie || item.techno || item.Techno) 
          : 'Web',
        email_createur: item['Email Créateur'] || item.email_createur || item.email || ''
      }))

      onChange(JSON.stringify(newSoftwares, null, 2))
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4">
           <Button 
            onClick={handleAddField}
            variant="outline"
            className="bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-black uppercase text-[10px] tracking-widest gap-2 h-10 px-5 shadow-sm"
           >
             <Plus size={14} /> Ajouter un logiciel
           </Button>
           
           <div className="h-4 w-px bg-slate-200 mx-2" />
           
           <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            className="text-slate-500 hover:text-indigo-600 font-bold uppercase text-[10px] tracking-widest gap-2"
           >
             <Upload size={14} /> Importer Excel
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls, .csv" 
                onChange={importExcel}
              />
           </Button>

           <Button 
            onClick={exportExcel}
            variant="ghost"
            className="text-slate-500 hover:text-emerald-600 font-bold uppercase text-[10px] tracking-widest gap-2"
           >
             <Download size={14} /> Exporter Excel
           </Button>
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            {softwares.length} logiciel(s)
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {softwares.map((s) => (
          <Card key={s.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group bg-white">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Nom du logiciel</label>
                    <Input 
                      value={s.nom}
                      onChange={(e) => handleUpdateField(s.id, 'nom', e.target.value)}
                      className="bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-400 font-bold text-sm h-9"
                      placeholder="Ex: SEDIT RH, Outlook..."
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Technologie</label>
                    <Select 
                      value={s.techno} 
                      onValueChange={(val) => handleUpdateField(s.id, 'techno', val)}
                    >
                      <SelectTrigger className="bg-slate-50 border-none focus:ring-1 focus:ring-indigo-400 font-bold text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TECHNOS.map(t => (
                          <SelectItem key={t} value={t} className="text-xs font-bold">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Créateur</label>
                    <Input 
                      value={s.email_createur}
                      onChange={(e) => handleUpdateField(s.id, 'email_createur', e.target.value)}
                      className="bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-400 font-medium text-xs font-mono h-9"
                      placeholder="dsi@ivry.local"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Description / Usage</label>
                    <Input 
                      value={s.description}
                      onChange={(e) => handleUpdateField(s.id, 'description', e.target.value)}
                      className="bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-400 text-xs h-9"
                      placeholder="Logiciel de paie..."
                    />
                 </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleRemoveField(s.id)}
                className="text-slate-200 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}

        {softwares.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm border border-slate-50">
                <AlertCircle size={32} />
             </div>
             <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Référentiel vide</p>
             <p className="text-[10px] text-slate-400 mt-2 font-medium">Commencez par importer votre liste Excel ou ajoutez un logiciel manuellement.</p>
          </div>
        )}
      </div>
    </div>
  )
}
