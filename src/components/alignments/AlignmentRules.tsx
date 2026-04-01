'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react'
import { AlignmentCreator } from './AlignmentCreator'

export function AlignmentRules() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)

  const fetchRules = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alignments')
      const data = await res.json()
      setRules(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette règle ?')) return
    await fetch(`/api/alignments/${id}`, { method: 'DELETE' })
    fetchRules()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Règles actives</h2>
        <Button onClick={() => { setEditingRule(null); setShowCreator(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle règle
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucune règle définie par défaut.</p>
          <p className="text-xs text-slate-400 mt-1">Créez votre premier alignement pour commencer le rapprochement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-slate-900">{rule.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => { setEditingRule(rule); setShowCreator(true); }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(rule.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                  <span className="block text-[10px] font-bold text-blue-400 uppercase">RH Source</span>
                  <span className="font-mono text-blue-700">{rule.field_rh}</span>
                </div>
                <div className="bg-amber-50 p-2 rounded border border-amber-100">
                  <span className="block text-[10px] font-bold text-amber-400 uppercase">AD Cible</span>
                  <span className="font-mono text-amber-700">{rule.field_ad}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${rule.is_case_sensitive ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                <span className="text-xs text-slate-500">{rule.is_case_sensitive ? 'Sensible à la casse' : 'Insensible à la casse'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreator && (
        <AlignmentCreator 
          onClose={() => setShowCreator(false)} 
          onSaved={fetchRules}
          editingRule={editingRule}
        />
      )}
    </div>
  )
}
