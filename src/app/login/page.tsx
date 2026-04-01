'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signIn('credentials', { redirect: false, login, password })
      if (res?.error) {
        setError('Identifiants incorrects ou compte inactif.')
      } else {
        router.push('/')
      }
    } catch {
      setError('Erreur technique lors de la connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Soft background blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-300/20 blur-[120px] pointer-events-none rounded-b-full" />

      <div className="w-full max-w-sm z-10">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 flex items-center justify-center mb-5 shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-2xl tracking-tighter">RH</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight mb-1">Studio RH</h1>
          <p className="text-slate-500 text-sm">DSI Ivry-sur-Seine — Espace sécurisé</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Identifiant
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text" value={login}
                  onChange={e => setLogin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                  placeholder="admin" required autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                  placeholder="••••••••" required autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !login || !password}
              className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all text-sm"
            >
              {loading
                ? <Loader2 className="animate-spin" size={18} />
                : <><span>Se connecter</span><ArrowRight size={16} /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          DSI Ivry-sur-Seine © {new Date().getFullYear()} — Accès restreint
        </p>
      </div>
    </div>
  )
}
