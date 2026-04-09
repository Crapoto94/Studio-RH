'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, CheckCircle, Send, AlertCircle, FileText, ChevronRight, ChevronLeft, Search, User, XCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

function AgentSearchField({ token, value, onChange, placeholder }: any) {
    const [search, setSearch] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (search.length < 3) {
                setResults([])
                return
            }
            setLoading(true)
            try {
                const res = await fetch(`/api/onboarding/search-agents?token=${token}&search=${encodeURIComponent(search)}`)
                const json = await res.json()
                setResults(json.data || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }, 500)
        return () => clearTimeout(handler)
    }, [search, token])

    return (
        <div className="relative space-y-2">
            {!value ? (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder={placeholder || "Rechercher un agent..."}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none transition-all"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setShowResults(true)
                        }}
                        onFocus={() => setShowResults(true)}
                    />
                    {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" size={16} />}
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center gap-3 text-left">
                        <User className="text-indigo-500 shrink-0" size={20} />
                        <span className="text-sm font-bold text-indigo-700">{value}</span>
                    </div>
                    <button 
                        type="button"
                        onClick={() => {
                            onChange('')
                            setSearch('')
                        }}
                        className="text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest px-2"
                    >
                        Modifier
                    </button>
                </div>
            )}

            {showResults && !value && search.length >= 3 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {results.length === 0 && !loading && (
                        <div className="p-4 text-center text-xs text-slate-400 italic">Aucun agent trouvé</div>
                    )}
                    {results.map((a: any) => (
                        <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                                onChange(`${a.nom} ${a.prenom} (${a.nom_direction || 'Sans direction'})`)
                                setShowResults(false)
                            }}
                            className="w-full text-left p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none flex items-center justify-between group"
                        >
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-800 uppercase group-hover:text-indigo-600 transition-colors truncate">{a.nom} {a.prenom}</div>
                                <div className="text-[10px] text-slate-500 uppercase truncate">{a.nom_direction}</div>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 shrink-0" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function OnboardingFormContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['onboarding-form', token],
    queryFn: async () => {
      if (!token) throw new Error('Token manquant')
      const res = await fetch(`/api/onboarding/public?token=${token}`)
      if (!res.ok) throw new Error('Lien invalide ou expiré')
      return res.json()
    },
    enabled: !!token
  })


  
  // Reset service when direction changes
  useEffect(() => {
    if (formData.direction && formData.service) {
      const directionServices = data?.lists?.dictServices?.[formData.direction] || []
      if (!directionServices.includes(formData.service)) {
        setFormData(prev => ({ ...prev, service: '' }))
      }
    }
  }, [formData.direction, data?.lists?.dictServices])

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/onboarding/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingId: data.onboarding.id, responses: payload })
      })
      if (!res.ok) throw new Error('Erreur lors de l\'envoi')
      return res.json()
    },
    onSuccess: () => {
      setSubmitted(true)
    }
  })

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/onboarding/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingId: data.onboarding.id, action: 'cancel' })
      })
      if (!res.ok) throw new Error('Erreur lors de l\'annulation')
      return res.json()
    },
    onSuccess: () => {
      setIsCancelled(true)
      setSubmitted(true)
    }
  })

  // Group fields into steps
  const { steps, allFields } = useMemo(() => {
    if (!data?.config) return { steps: [], allFields: [] }
    const fields = JSON.parse(data.config)
    const result: any[] = []
    let currentStep: any = { title: 'Informations', fields: [] }

    fields.forEach((f: any) => {
      if (f.type === 'section') {
        if (currentStep.fields.length > 0) result.push(currentStep)
        currentStep = { title: f.label, fields: [], type: f.type }
      } else {
        currentStep.fields.push(f)
      }
    })
    if (currentStep.fields.length > 0 || result.length === 0) result.push(currentStep)
    
    result.push({ title: 'Validation Finale', fields: [], isSummary: true })
    
    const finalSteps = result.map(step => {
        if (step.isSummary) return step
        const groups: any[] = []
        let currentGroup: any = { title: null, fields: [], titleField: null }
        
        step.fields.forEach((f: any) => {
            if (f.type === 'title') {
                if (currentGroup.fields.length > 0 || currentGroup.titleField) groups.push(currentGroup)
                currentGroup = { title: f.label, fields: [], titleField: f }
            } else {
                f.parentId = currentGroup.titleField?.id
                currentGroup.fields.push(f)
            }
        })
        if (currentGroup.fields.length > 0 || currentGroup.titleField) groups.push(currentGroup)
        return { ...step, groups }
    })

    return { steps: finalSteps, allFields: fields }
  }, [data?.config])

  // Pre-fill agent name and default values
  useEffect(() => {
    if (data?.onboarding && allFields.length > 0) {
        const ob = data.onboarding
        setFormData(prev => {
            const next: Record<string, any> = {
                ...prev,
                prenom_agent: ob.agent?.prenom || ob.prenom_temp || '',
                nom_agent: ob.agent?.nom || ob.nom_temp || '',
                direction: ob.direction_temp || ob.agent?.nom_direction || '',
                service: ob.service_temp || ob.agent?.nom_service || '',
                intitule_poste: ob.poste_temp || ob.agent?.poste_l || '',
                site_travail: ob.agent?.affectgeo_l || '',
                date_arrivee: ob.date_arrivee_prevue ? new Date(ob.date_arrivee_prevue).toISOString().split('T')[0] : '',
            }
            allFields.forEach((f: any) => {
                if (f.type === 'boolean' && (next[f.id] === undefined || next[f.id] === null)) {
                    next[f.id] = false
                }
            })
            return next
        })
    }
  }, [data, allFields])

  // Reset service when direction changes
  useEffect(() => {
    if (formData.direction && formData.service) {
      const directionServices = data?.lists?.dictServices?.[formData.direction] || []
      if (!directionServices.includes(formData.service)) {
        setFormData(prev => ({ ...prev, service: '' }))
      }
    }
  }, [formData.direction, data?.lists?.dictServices])

  if (!token) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-bold"><AlertCircle size={24} className="mr-2" /> Token manquant</div>
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
  if (error || !data) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-bold"><AlertCircle size={24} className="mr-2" /> {error?.message || 'Erreur inconnue'}</div>
  
  if (submitted || data.onboarding.statut === 'en_cours_realisation' || data.onboarding.statut === 'termine' || data.onboarding.statut === 'annule') {
    const isActuallyCancelled = isCancelled || data.onboarding.statut === 'annule'
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl shadow-indigo-100 border-none rounded-3xl overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${isActuallyCancelled ? 'from-rose-500 via-red-500 to-rose-400' : 'from-indigo-500 via-purple-500 to-pink-500'}`}></div>
          <CardContent className="pt-10 pb-12 px-8">
            <div className="text-center space-y-4">
              {isActuallyCancelled ? (
                <>
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Onboarding annulé</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    L'agent ne sera pas onboardé. L'action a été enregistrée.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">C'est noté !</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Le dossier a bien été transmis aux différents services. Vous pourrez suivre l'avancement via votre tableau de bord.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { onboarding, lists } = data
  const agentName = onboarding.agent ? `${onboarding.agent.prenom} ${onboarding.agent.nom}` : `${onboarding.prenom_temp} ${onboarding.nom_temp}`
  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1

  const isFieldVisible = (f: any): boolean => {
    if (!f) return true
    
    // Heritage check
    if (f.parentId) {
        const parent = allFields.find((af: any) => af.id === f.parentId)
        if (parent && !isFieldVisible(parent)) return false
    }

    if (!f.conditionalOn) return true
    
    const targetFieldId = f.conditionalOn.field
    const targetField = allFields.find((af: any) => af.id === targetFieldId)
    
    if (targetField?.type === 'title') {
        const isTargetVisible = isFieldVisible(targetField)
        if (!isTargetVisible) return false
        // If conditional on a title, any value check is truthy if title is visible
        return true
    }

    const rawValue = formData[targetFieldId]
    if (rawValue === undefined || rawValue === null || rawValue === '') return false

    const targetValues = f.conditionalOn.values.map((v: any) => String(v).toLowerCase())
    
    const currentValues = (Array.isArray(rawValue) ? rawValue : [rawValue])
      .flatMap(v => {
        const s = String(v)
        if (v === true || s.toLowerCase() === 'true') return [s, 'Oui']
        if (v === false || s.toLowerCase() === 'false') return [s, 'Non']
        return [s]
      })
      .map(v => v.toLowerCase())

    return currentValues.some(v => targetValues.includes(v))
  }

  const isFieldMissing = (field: any) => {
    if (!field.required || field.type === 'boolean') return false
    const value = formData[field.id]
    if (value === undefined || value === null || value === '') return true
    if (Array.isArray(value) && value.length === 0) return true
    return false
  }

  const isGroupVisible = (group: any) => {
      if (!group) return false
      if (group.titleField && !isFieldVisible(group.titleField)) return false
      return (group.fields || []).some((f: any) => isFieldVisible(f))
  }

  const canGoNext = () => {
    if (currentStep.isSummary) return true
    return currentStep.fields.every((f: any) => {
      if (!isFieldVisible(f)) return true
      return !isFieldMissing(f)
    })
  }

  const handleNext = () => {
    if (canGoNext()) {
      setShowErrors(false)
      setCurrentStepIndex(prev => prev + 1)
      window.scrollTo(0, 0)
    } else {
      setShowErrors(true)
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.text-rose-600.animate-bounce')
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <div className="flex justify-center mx-auto mb-6">
            <img src="/DSI.png" alt="Logo DSI" className="h-32 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight">Onboarding Manager</h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide italic">
               Préparation de l'arrivée de <span className="text-indigo-600 font-bold">{agentName}</span>
            </p>
          </div>
        </header>

        <div className="flex items-center justify-center gap-1 overflow-x-auto pb-4 no-scrollbar">
          {steps.map((step, idx) => (
             <div key={idx} className="flex items-center shrink-0">
                <button
                  onClick={() => idx < currentStepIndex && setCurrentStepIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border-none ${
                    idx === currentStepIndex 
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100' 
                      : idx < currentStepIndex 
                        ? 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-100' 
                        : 'bg-white border border-slate-200 text-slate-300'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${idx <= currentStepIndex ? 'bg-white/20' : 'bg-slate-50'}`}>{idx + 1}</span>
                  <span className="text-[10px] uppercase font-black tracking-widest hidden md:inline">{step.title}</span>
                </button>
                {idx < steps.length - 1 && <ChevronRight size={14} className="mx-0.5 text-slate-200" />}
             </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
             <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{currentStep.title}</h2>
          </div>

          {currentStep.isSummary ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {steps.filter((s: any) => !s.isSummary && s.groups).map((step: any) => (
                 step.groups.filter(isGroupVisible).map((group: any, gIdx: number) => (
                    <div key={`${step.title}-${gIdx}`} className="p-6">
                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 border-l-2 border-indigo-100 pl-3">
                            {group.title || step.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {group.fields.filter(isFieldVisible).map((f: any) => (
                                <div key={f.id} className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.label}</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {Array.isArray(formData[f.id]) ? (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(formData[f.id] || []).map((v: string) => <span key={v} className="bg-slate-50 text-slate-600 text-[10px] px-2 py-0.5 rounded border border-slate-100">{v}</span>)}
                                            </div>
                                        ) : (formData[f.id] === true ? 'Oui' : (formData[f.id] === false ? 'Non' : (formData[f.id] || <span className="text-slate-300 font-medium italic">Non renseigné</span>)))}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
              ))}
              <div className="p-8 bg-indigo-50/30 text-center">
                  <p className="text-xs text-slate-500 font-medium italic">
                      En cliquant sur le bouton ci-dessous, vos réponses seront enregistrées et la DSI sera immédiatement notifiée pour préparer le matériel et les accès.
                  </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {currentStep.groups.filter(isGroupVisible).map((group: any, gIdx: number) => (
                <div key={gIdx} className="space-y-4">
                  {group.title && (
                    <div className="pt-4 pb-2">
                       <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b-2 border-indigo-100 pb-2 inline-block">
                          {group.title}
                       </h3>
                    </div>
                  )}
                  
                  <Card className="border-2 border-indigo-100 shadow-sm rounded-3xl overflow-hidden bg-white">
                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {group.fields.map((field: any) => {
                        const visible = isFieldVisible(field)
                        if (!visible) {
                            if (field.half) return <div key={`placeholder-${field.id}`} className="md:col-span-1" />
                            return null
                        }
                        return (
                          <div 
                            key={field.id} 
                            className={cn(
                              "space-y-3",
                              field.half ? "md:col-span-1" : "md:col-span-2"
                            )}
                          >
                            <div className="flex justify-between items-start">
                               <label className="text-xs font-black text-slate-700 uppercase tracking-widest">
                                 {field.label} {field.required && field.type !== 'boolean' && <span className="text-rose-500">*</span>}
                               </label>
                               {field.required && !isFieldMissing(field) && field.type !== 'boolean' && (
                                 <span className="text-[9px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded tracking-widest">
                                   Rempli
                                 </span>
                               )}
                               {isFieldMissing(field) && (
                                 <span className="text-[9px] font-black text-rose-500 uppercase bg-rose-50 px-2 py-1 rounded tracking-widest animate-pulse">
                                   Requis
                                 </span>
                               )}
                            </div>
                          
                          {showErrors && isFieldMissing(field) && (
                            <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 animate-bounce">
                              <AlertCircle size={12} /> Ce champ est obligatoire
                            </p>
                          )}
                          
                          {field.type === 'text' && (
                            <input
                              type="text"
                              placeholder="Tapez ici..."
                               className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none transition-all bg-slate-50 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white"
                              value={formData[field.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            />
                          )}

                          {field.type === 'agent' && (
                              <AgentSearchField 
                                  token={token} 
                                  placeholder={field.label}
                                  value={formData[field.id]} 
                                  onChange={(val: string) => setFormData({ ...formData, [field.id]: val })} 
                              />
                          )}

                          {field.type === 'date' && (
                            <input
                              type="date"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all focus:bg-white"
                              value={formData[field.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            />
                          )}

                          {field.type === 'textarea' && (
                            <textarea
                              placeholder="Détaillez ici..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none min-h-[100px] transition-all focus:bg-white"
                              value={formData[field.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                            />
                          )}

                          {field.type === 'select' && (
                            <div className="relative">
                              <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-10 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all appearance-none focus:bg-white"
                                value={formData[field.id] || ''}
                                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              >
                                <option value="">Sélectionnez une option</option>
                                {field.id === 'service' ? (
                                  (lists.dictServices?.[formData.direction] || []).map((opt: string) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))
                                ) : (
                                  lists[field.options]?.map((opt: string) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))
                                )}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronRight size={16} className="rotate-90" />
                              </div>
                            </div>
                          )}

                          {field.type === 'boolean' && (
                            <div className="flex gap-3 pt-1">
                              <button 
                                  type="button" 
                                  onClick={() => setFormData({...formData, [field.id]: true})}
                                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-[10px] uppercase transition-all ${formData[field.id] === true ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                              >
                                  Oui
                              </button>
                              <button 
                                  type="button" 
                                  onClick={() => setFormData({...formData, [field.id]: false})}
                                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-[10px] uppercase transition-all ${formData[field.id] === false ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                              >
                                  Non
                              </button>
                            </div>
                          )}

                          {field.type === 'multiselect' && (
                            <div className="space-y-4 pt-1">
                              {data.dsihubError && (
                                <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 animate-in fade-in slide-in-from-top-1 duration-300">
                                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                  <div className="text-[11px] font-bold leading-relaxed tracking-wide">
                                    <p className="uppercase mb-0.5">Erreur API DSIHub</p>
                                    <p className="font-medium opacity-80 normal-case">{data.dsihubError}</p>
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {lists[field.options]?.map((opt: any) => {
                                  const isObj = typeof opt === 'object' && opt !== null;
                                  const name = isObj ? opt.nom : opt;
                                  const description = isObj ? opt.description : null;
                                  const icon = isObj ? opt.icon : null;
                                  const isChecked = formData[field.id]?.includes(name);

                                  return (
                                    <label key={name} className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${isChecked ? 'bg-indigo-50 border-indigo-200 shadow-md ring-4 ring-indigo-500/5' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                      <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const current = formData[field.id] || []
                                          if (e.target.checked) setFormData({ ...formData, [field.id]: [...current, name] })
                                          else setFormData({ ...formData, [field.id]: current.filter((c: string) => c !== name) })
                                        }}
                                      />
                                      
                                      {icon && (
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                                          <img src={icon} alt={name} className="w-7 h-7 object-contain" />
                                        </div>
                                      )}

                                      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                                          <span className={`text-[11px] font-black uppercase tracking-tight truncate ${isChecked ? 'text-indigo-700' : 'text-slate-600'}`}>
                                              {name}
                                          </span>
                                          {description && (
                                              <Tooltip>
                                                  <TooltipTrigger asChild>
                                                      <HelpCircle size={14} className="text-slate-300 hover:text-indigo-400 cursor-help shrink-0" />
                                                  </TooltipTrigger>
                                                  <TooltipContent side="right" className="bg-slate-900 text-white text-[10px] font-medium border-none p-3 shadow-xl max-w-[200px]">
                                                      {description}
                                                  </TooltipContent>
                                              </Tooltip>
                                          )}
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                  </div>
                ))}
              </div>
          )}

          <div className="pt-6 flex gap-4">
            {currentStepIndex > 0 && (
                <button
                    type="button"
                    onClick={() => setCurrentStepIndex(prev => prev - 1)}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 uppercase tracking-tight text-xs px-6"
                >
                    <ChevronLeft size={16} />
                    Précédent
                </button>
            )}
            
            {!isLastStep ? (
                <button
                    type="button"
                    onClick={handleNext}
                    className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter text-xs px-6"
                >
                    Continuer
                    <ChevronRight size={16} />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => mutation.mutate(formData)}
                    disabled={mutation.isPending}
                    className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter text-xs px-6"
                >
                    {mutation.isPending ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                    Finaliser et Envoyer la demande
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  )
}

export default function OnboardingFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>}>
      <OnboardingFormContent />
    </Suspense>
  )
}
