'use client'

import { useState, useRef } from 'react'
import { Upload, File, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ImportDepartedAgents() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ message: string, count?: number, error?: boolean } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/agents/import-departed', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ message: data.message, count: data.count })
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        setResult({ message: data.error || 'Erreur lors de l\'import', error: true })
      }
    } catch (err: any) {
      setResult({ message: err.message, error: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-slate-800 text-lg flex items-center gap-2">
            <Upload className="text-indigo-500" size={20} />
            Import d'Agents Partis (CSV)
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Importez un fichier CSV contenant la liste des agents partis pour mettre à jour ou créer leurs fiches dans la base (position inactif, mise à jour date départ / date plus vu).
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className="cursor-pointer flex-1 w-full flex items-center justify-center sm:justify-start gap-2 px-4 py-3 border-2 border-dashed border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 text-indigo-700 text-sm font-medium transition-all bg-slate-50"
        >
          <File size={18} className="shrink-0" />
          <span className="truncate max-w-[250px]">{file ? file.name : 'Sélectionner un fichier CSV'}</span>
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={cn(
            "flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all shrink-0",
            !file || loading
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
          )}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Lancer l'import
        </button>
      </div>

      {result && (
        <div className={cn(
          "mt-5 p-4 rounded-xl border flex items-start gap-3 text-sm animate-in fade-in duration-300",
          result.error ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
        )}>
          {result.error ? <AlertTriangle size={20} className="mt-0.5 shrink-0" /> : <CheckCircle size={20} className="mt-0.5 shrink-0" />}
          <div>
            <div className="font-bold text-base mb-1">{result.message}</div>
            {result.count !== undefined && <div className="opacity-90">Total des agents traités localement : <strong>{result.count}</strong></div>}
          </div>
        </div>
      )}
    </div>
  )
}
