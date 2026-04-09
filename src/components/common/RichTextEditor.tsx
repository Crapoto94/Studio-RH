'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { FileText } from 'lucide-react'

// Import de l'éditeur riche dynamiquement (côté client uniquement)
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-40 w-full bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
})
import 'react-quill-new/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (v: string) => void
  label: string
}

export function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
  const [isCodeMode, setIsCodeMode] = useState(false)

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'clean'],
    ],
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center bg-slate-50 px-4 py-2 rounded-t-xl border-x border-t border-slate-200">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <button 
          type="button"
          onClick={() => setIsCodeMode(!isCodeMode)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
            isCodeMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
          }`}
        >
          <FileText size={12} />
          {isCodeMode ? 'Mode Visuel' : 'Mode Source (HTML)'}
        </button>
      </div>

      <div className="relative group">
        {isCodeMode ? (
          <textarea
            className="w-full h-[400px] p-4 bg-slate-900 text-indigo-300 font-mono text-xs rounded-b-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <div className="bg-white rounded-b-xl overflow-hidden border border-slate-200">
             <ReactQuill 
               theme="snow"
               value={value}
               onChange={onChange}
               modules={modules}
               className="h-[350px] mb-12"
             />
          </div>
        )}
      </div>
    </div>
  )
}
