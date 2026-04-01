'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, Loader2, Send, MessageSquare } from 'lucide-react'

function AcknowledgeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [task, setTask] = useState<any>(null)
  const [commentaire, setCommentaire] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Lien invalide ou jeton manquant.')
      setLoading(false)
      return
    }

    fetch(`/api/onboarding/tasks/acknowledge?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setTask(data)
          if (data.done) setSuccess(true)
        }
      })
      .catch(() => setError('Erreur de connexion au serveur.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/onboarding/tasks/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, commentaire })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Erreur lors de la validation.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Chargement de la tâche...</p>
      </div>
    )
  }

  if (error && !task) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-rose-100 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Erreur</h1>
        <p className="text-slate-500 mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-emerald-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Tâche Confirmée</h1>
        <p className="text-slate-500 mb-8">
          La réalisation de la tâche <strong>{task?.titre}</strong> pour <strong>{task?.agent_prenom} {task?.agent_nom}</strong> a bien été enregistrée.
        </p>
        <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-400 italic">
          Vous pouvez fermer cette fenêtre.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          <Send size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Acquittement de tâche</h1>
          <p className="text-sm text-slate-500">Workflow d'onboarding RH</p>
        </div>
      </div>

      <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Agent Concerné</div>
        <div className="text-lg font-bold text-slate-700 mb-4">{task.agent_prenom} {task.agent_nom}</div>
        
        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Tâche à réaliser</div>
        <div className="text-md font-semibold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
          {task.titre}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 pl-1">
            <MessageSquare size={16} className="text-slate-400" />
            Commentaire (optionnel)
          </label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Précisez ici toute information utile (ex: numéro de poste, matériel spécifique remis...)"
            className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-600"
          />
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl border border-rose-100 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          {submitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>Acquitter la tâche</>
          )}
        </button>
      </form>
    </div>
  )
}

export default function AcknowledgePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 backdrop-blur-sm bg-grid-slate-100">
      <Suspense fallback={<div>Chargement...</div>}>
        <AcknowledgeContent />
      </Suspense>
    </div>
  )
}
