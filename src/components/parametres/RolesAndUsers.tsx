'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Save, Trash2, Shield, Users as UsersIcon, Edit2, X, Search, UserPlus, CheckCircle2, Lock, XCircle } from 'lucide-react'

const AVAILABLE_MENUS = [
  { path: '/', label: 'Dashboard' },
  { path: '/agents', label: 'Agents' },
  { path: '/synchro', label: 'Synchro' },
  { path: '/hierarchie', label: 'Hiérarchie' },
  { path: '/alignements', label: 'Alignements' },
  { path: '/onboarding', label: 'Onboarding' },
  { path: '/parametres', label: 'Paramètres' },
  { path: '/sql', label: 'Explorateur SQL' },
]

export function RolesAndUsers() {
  return (
    <div className="space-y-12">
      <RolesManager />
      <div className="border-t border-slate-200"></div>
      <UsersManager />
    </div>
  )
}

// ── ROLES MANAGER ────────────────────────────────────────────────────────────

function RolesManager() {
  const queryClient = useQueryClient()
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await fetch('/api/roles')
      if (!res.ok) return []
      const json = await res.json()
      return Array.isArray(json) ? json : []
    },
  })

  // Mutations
  const createRole = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/roles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, permissions: [] }),
      })
      if (!res.ok) throw new Error('Erreur création')
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); setNewRoleName('') },
  })
  
  const updateRole = useMutation({
    mutationFn: async ({ id, name, permissions }: { id: number; name: string; permissions: string[] }) => {
      const res = await fetch('/api/roles', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, permissions }),
      })
      if (!res.ok) throw new Error('Erreur maj')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })

  const deleteRole = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/roles?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })

  const [newRoleName, setNewRoleName] = useState('')

  if (isLoading) return <div className="text-slate-400">Chargement des rôles...</div>

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <h3 className="font-display font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
        <Shield size={18} className="text-indigo-500" />
        Gestion des Rôles
      </h3>
      <p className="text-sm text-slate-500 mb-6">Définissez les rôles et cochez les menus auxquels ils ont accès.</p>

      <div className="space-y-4">
        {roles.map((r: any) => (
          <RoleItem key={r.id} role={r} onUpdate={(p) => updateRole.mutate(p)} onDelete={(id) => deleteRole.mutate(id)} />
        ))}

        <div className="flex items-center gap-2 pt-4 mt-6 border-t border-slate-100">
          <input
            type="text"
            placeholder="Nouveau rôle..."
            value={newRoleName}
            onChange={e => setNewRoleName(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={() => createRole.mutate(newRoleName)}
            disabled={!newRoleName || createRole.isPending}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {createRole.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
            Créer rôle
          </button>
        </div>
      </div>
    </div>
  )
}

function RoleItem({ role, onUpdate, onDelete }: { role: any, onUpdate: (p: any) => void, onDelete: (id: number) => void }) {
  let perms: string[] = []
  try { perms = JSON.parse(role.permissions || '[]') } catch(e){}

  const togglePerm = (path: string) => {
    let newPerms = [...perms]
    if (newPerms.includes(path)) newPerms = newPerms.filter(p => p !== path)
    else newPerms.push(path)
    onUpdate({ id: role.id, name: role.name, permissions: newPerms })
  }

  const isAdmin = role.name === 'admin'

  return (
    <div className="border border-slate-200 rounded-xl p-4 transition-all">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
          {role.name} {isAdmin && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] uppercase font-black tracking-wider">SuperAdmin</span>}
        </span>
        {!isAdmin && (
          <button onClick={() => { if(confirm('Sûr de vouloir supprimer ce rôle ?')) onDelete(role.id) }} className="text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {!isAdmin ? (
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_MENUS.map(menu => {
            const hasAccess = perms.includes(menu.path)
            return (
              <label key={menu.path} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                hasAccess ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}>
                <input type="checkbox" checked={hasAccess} onChange={() => togglePerm(menu.path)} className="hidden" />
                <div className={`w-3 h-3 rounded-full border ${hasAccess ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'}`}></div>
                {menu.label}
              </label>
            )
          })}
        </div>
      ) : (
         <div className="text-xs text-slate-500 italic px-2">Le rôle admin a par défaut accès à l'intégralité du système.</div>
      )}
    </div>
  )
}

// ── USERS MANAGER ────────────────────────────────────────────────────────────

function UsersManager() {
  const queryClient = useQueryClient()
  const { data: users = [], isLoading: loadUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      if (!res.ok) return []
      const json = await res.json()
      return Array.isArray(json) ? json : []
    },
  })
  const { data: roles = [], isLoading: loadRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await fetch('/api/roles')
      if (!res.ok) return []
      const json = await res.json()
      return Array.isArray(json) ? json : []
    },
  })

  const updateUser = useMutation({
    mutationFn: async ({ id, role, actif }: { id: number; role?: string; actif?: boolean }) => {
      const res = await fetch('/api/users', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role, actif }),
      })
      if (!res.ok) throw new Error('Erreur maj')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  // ── AD Search ──────────────────────────────────────────────────────
  const [adSearch, setAdSearch] = useState('')
  const [adResults, setAdResults] = useState<any[]>([])
  const [adSearching, setAdSearching] = useState(false)
  const [adMsg, setAdMsg] = useState('')
  const [importRole, setImportRole] = useState('user')
  const [importedLogins, setImportedLogins] = useState<string[]>([])
  const [passwordChangeUser, setPasswordChangeUser] = useState<any>(null)

  const existingLogins = new Set(users.map((u: any) => u.login?.toLowerCase()))

  const searchAD = async () => {
    if (!adSearch.trim()) return
    setAdSearching(true)
    setAdMsg('')
    setAdResults([])
    try {
      const res = await fetch('/api/test-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', searchTerm: adSearch }),
      })
      const data = await res.json()
      if (data.ok) {
        setAdResults(data.results || [])
        setAdMsg(data.message)
      } else {
        setAdMsg(data.message || 'Erreur recherche AD')
      }
    } catch (e: any) {
      setAdMsg('Erreur réseau : ' + e.message)
    } finally {
      setAdSearching(false)
    }
  }

  const importUser = async (adUser: any) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: adUser.login,
          nom: adUser.nom?.split(' ').slice(1).join(' ') || adUser.login,
          prenom: adUser.nom?.split(' ')[0] || '',
          role: importRole,
          is_ad: true,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setAdMsg(err.error || 'Erreur lors de l\'import')
        return
      }
      setImportedLogins(prev => [...prev, adUser.login.toLowerCase()])
      queryClient.invalidateQueries({ queryKey: ['users'] })
    } catch (e: any) {
      setAdMsg('Erreur réseau : ' + e.message)
    }
  }

  if (loadUsers || loadRoles) return <div className="text-slate-400">Chargement...</div>

  return (
    <div className="space-y-8">
      {/* ── Bloc recherche AD ──────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm p-6">
        <h3 className="font-display font-semibold text-slate-800 text-lg mb-1 flex items-center gap-2">
          <UserPlus size={18} className="text-blue-600" />
          Ajouter un utilisateur depuis l'Active Directory
        </h3>
        <p className="text-sm text-slate-500 mb-5">Recherche un nom ou un identifiant dans l'AD, puis importe-le avec le rôle sélectionné.</p>

        {/* Barre de recherche + rôle */}
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recherche AD</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom, prénom, login..."
                value={adSearch}
                onChange={e => setAdSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchAD()}
                className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all"
              />
              <button
                onClick={searchAD}
                disabled={adSearching || !adSearch.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {adSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Rechercher
              </button>
            </div>
          </div>
          <div className="min-w-[180px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rôle à attribuer</label>
            <select
              value={importRole}
              onChange={e => setImportRole(e.target.value)}
              className="w-full bg-white border border-blue-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
            >
              <option value="user">user (par défaut)</option>
              {roles.map((r: any) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {adMsg && <p className="text-xs text-slate-500 mb-3">{adMsg}</p>}

        {/* Résultats AD */}
        {adResults.length > 0 && (
          <div className="border border-blue-200 rounded-xl overflow-hidden bg-white text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <table className="w-full text-left">
              <thead className="bg-blue-50/50 text-xs text-slate-500 border-b border-blue-100">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Login</th>
                  <th className="px-4 py-2.5 font-medium">Nom</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Service</th>
                  <th className="px-4 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {adResults.map((r, i) => {
                  const alreadyExists = existingLogins.has(r.login?.toLowerCase())
                  const justImported = importedLogins.includes(r.login?.toLowerCase())
                  return (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{r.login}</td>
                      <td className="px-4 py-2.5 text-slate-600">{r.nom}</td>
                      <td className="px-4 py-2.5 text-slate-500">{r.mail}</td>
                      <td className="px-4 py-2.5 text-slate-400">{r.service}</td>
                      <td className="px-4 py-2.5 text-right">
                        {alreadyExists || justImported ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                            <CheckCircle2 size={12} /> {justImported ? 'Importé !' : 'Déjà existant'}
                          </span>
                        ) : (
                          <button
                            onClick={() => importUser(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                          >
                            <UserPlus size={13} /> Ajouter ({importRole})
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Tableau utilisateurs existants ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h3 className="font-display font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <UsersIcon size={18} className="text-indigo-500" />
          Utilisateurs existants
        </h3>
        <p className="text-sm text-slate-500 mb-6">Affectez des rôles aux utilisateurs de Studio RH.</p>

        <div className="border border-slate-200 rounded-xl overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Login</th>
                <th className="px-4 py-3 font-medium">Nom complet</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-700">{u.login}</td>
                  <td className="px-4 py-3 text-slate-600">{u.prenom} {u.nom}</td>
                  <td className="px-4 py-3">
                     {u.is_ad 
                       ? <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-wider">AD</span>
                       : <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-wider">Local</span>
                     }
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-8 h-4 rounded-full transition-colors relative ${u.actif ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                         <input type="checkbox" checked={u.actif} onChange={(e) => updateUser.mutate({ id: u.id, actif: e.target.checked })} className="hidden" />
                         <div className={`absolute top-0.5 bg-white w-3 h-3 rounded-full shadow-sm transition-all ${u.actif ? 'left-[18px]' : 'left-0.5'}`}></div>
                      </div>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    {u.login === 'admin' ? (
                       <span className="text-xs text-slate-400 italic">SuperAdmin inamovible</span>
                    ) : (
                      <select
                        value={u.role || 'user'}
                        onChange={(e) => updateUser.mutate({ id: u.id, role: e.target.value })}
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                      >
                        <option value="user">Aucun (user)</option>
                        {roles.map((r: any) => (
                         <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!u.is_ad && (
                       <button
                         onClick={() => setPasswordChangeUser(u)}
                         className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                         title="Changer le mot de passe"
                       >
                         <Lock size={16} />
                       </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {passwordChangeUser && (
        <ChangePasswordModal 
          user={passwordChangeUser} 
          onClose={() => setPasswordChangeUser(null)} 
          onSuccess={() => {
            setPasswordChangeUser(null)
            queryClient.invalidateQueries({ queryKey: ['users'] })
          }}
        />
      )}
    </div>
  )
}

function ChangePasswordModal({ user, onClose, onSuccess }: { user: any, onClose: () => void, onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!password) return setError('Le mot de passe ne peut pas être vide.')
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas.')

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, password })
      })
      if (!res.ok) throw new Error('Erreur lors du changement de mot de passe')
      onSuccess()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Modifier le mot de passe</h3>
              <p className="text-xs text-slate-500">Utilisateur : {user.login}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center gap-2">
              <XCircle size={14} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all font-display"
          >
            Annuler
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-3 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 font-display"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Appliquer le changement
          </button>
        </div>
      </div>
    </div>
  )
}

