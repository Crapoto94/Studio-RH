'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Key, Plus, Trash2, Copy, CheckCircle2, XCircle, Loader2, Save, Eye, EyeOff, Calendar, Power, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type ApiKey = {
  id: number
  name: string
  key_prefix: string
  permissions: string
  expires_at: string | null
  is_active: boolean
  created_at: string
  created_by: string
}

export function ApiKeysSettings() {
  const queryClient = useQueryClient()
  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/api-keys')
      if (!res.ok) return []
      const json = await res.json()
      return Array.isArray(json) ? json : []
    },
  })

  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPerms, setNewKeyPerms] = useState<'read' | 'read_write'>('read')
  const [newKeyExpiry, setNewKeyExpiry] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const createKey = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPerms,
          expires_at: newKeyExpiry || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur création')
      }
      return res.json()
    },
    onSuccess: (data) => {
      setCreatedKey(data.key)
      setNewKeyName('')
      setNewKeyPerms('read')
      setNewKeyExpiry('')
      setShowCreate(false)
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
    onError: (err: Error) => alert(err.message),
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const res = await fetch('/api/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active }),
      })
      if (!res.ok) throw new Error('Erreur mise à jour')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  })

  const deleteKey = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/api-keys?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isExpired = (expires_at: string | null) => {
    if (!expires_at) return false
    return new Date(expires_at) < new Date()
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
              <Key size={18} className="text-indigo-600" />
              Clés API
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Gérez les clés d&apos;accès sécurisées pour les intégrations tierces.
              Les clés en lecture seule peuvent lire les données, les clés en lecture/écriture peuvent aussi les modifier.
            </p>
          </div>
          <Link
            href="/api/swagger"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all shadow-sm"
          >
            <ExternalLink size={14} /> Documentation Swagger
          </Link>
        </div>

        <div className="mt-4 p-4 bg-white/70 rounded-xl border border-indigo-100 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">🔑 Utilisation des clés API :</p>
          <code className="block text-indigo-600 bg-indigo-50 px-2 py-1 rounded mt-1">
            En-tête HTTP : x-api-key: votre_clé_api
          </code>
          <code className="block text-indigo-600 bg-indigo-50 px-2 py-1 rounded mt-1 whitespace-nowrap overflow-x-auto">
            fetch(&apos;/api/agents&apos;, {'{'} headers: {'{'} &apos;x-api-key&apos;: &apos;rh_...&apos; {'}'} {'}'})
          </code>
        </div>
      </div>

      {/* Bouton créer */}
      <div className="flex justify-end">
        <button
          onClick={() => { setShowCreate(!showCreate); setCreatedKey(null) }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus size={16} /> Nouvelle clé API
        </button>
      </div>

      {/* Formulaire de création */}
      {showCreate && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="font-bold text-sm text-slate-700 mb-4">Créer une nouvelle clé API</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom</label>
              <input
                type="text"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="ex: Intégration PowerBI"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Permissions</label>
              <select
                value={newKeyPerms}
                onChange={e => setNewKeyPerms(e.target.value as 'read' | 'read_write')}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              >
                <option value="read">Lecture seule</option>
                <option value="read_write">Lecture / Écriture</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date d&apos;expiration (optionnelle)</label>
              <input
                type="date"
                value={newKeyExpiry}
                onChange={e => setNewKeyExpiry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <button
            onClick={() => createKey.mutate()}
            disabled={!newKeyName.trim() || createKey.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {createKey.isPending ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
            Générer la clé
          </button>
        </div>
      )}

      {/* Affichage de la clé créée */}
      {createdKey && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-emerald-800">Clé API créée avec succès !</h4>
              <p className="text-xs text-emerald-600 mt-1">
                Copiez cette clé maintenant. Elle ne sera plus jamais affichée.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 bg-white border border-emerald-200 rounded-lg px-4 py-3 text-sm font-mono text-emerald-900 break-all select-all">
                  {createdKey}
                </code>
                <button
                  onClick={() => copyToClipboard(createdKey)}
                  className="p-3 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  title="Copier"
                >
                  {copied ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Copy size={18} className="text-emerald-600" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des clés */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400"><Loader2 size={24} className="animate-spin inline-block" /></div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Key size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune clé API</p>
          <p className="text-xs mt-1">Créez votre première clé pour intégrer des services externes.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Clé (préfixe)</th>
                <th className="px-4 py-3 font-medium">Permissions</th>
                <th className="px-4 py-3 font-medium">Expire le</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Créée par</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map((key: ApiKey) => {
                const expired = isExpired(key.expires_at)
                return (
                  <tr key={key.id} className={`hover:bg-slate-50 transition-colors ${!key.is_active || expired ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 font-bold text-slate-700">{key.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">{key.key_prefix}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        key.permissions === 'read_write'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {key.permissions === 'read_write' ? 'Lecture/Écriture' : 'Lecture seule'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {key.expires_at ? (
                        <span className={`flex items-center gap-1 ${expired ? 'text-red-500' : ''}`}>
                          <Calendar size={12} />
                          {new Date(key.expires_at).toLocaleDateString('fr-FR')}
                          {expired && <XCircle size={12} className="text-red-400" />}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive.mutate({ id: key.id, is_active: !key.is_active })}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          key.is_active && !expired
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <Power size={12} />
                        {key.is_active && !expired ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{key.created_by}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { if (confirm('Supprimer cette clé API ? Les intégrations qui l\'utilisent cesseront de fonctionner.')) deleteKey.mutate(key.id) }}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Lien vers Swagger */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <ExternalLink size={16} className="text-indigo-500" />
              Documentation complète de l'API
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Consultez la liste de toutes les routes disponibles et testez-les avec Swagger.
            </p>
          </div>
          <Link
            href="/api/swagger"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm"
          >
            <ExternalLink size={14} /> Voir Swagger
          </Link>
        </div>
      </div>
    </div>
  )
}
