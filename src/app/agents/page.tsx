'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { AgentsTable } from '@/components/agents/AgentsTable'
import { useAgents } from '@/hooks/useAgents'
import { Users, Search, Filter, Download, UserPlus, UserMinus, Calendar, Layers, CloudOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

export default function AgentsPage() {
  const {
    agents,
    count,
    loading,
    filters,
    handleSearchChange,
    handlePageChange,
    totalPages,
    page,
    setFilter,
    resetFilters
  } = useAgents()

  const [showFilters, setShowFilters] = useState(false)

  const { data: counts } = useQuery({
    queryKey: ['agent-counts', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.direction) params.append('direction', filters.direction)
      if (filters.service) params.append('service', filters.service)
      if (filters.position) params.append('position', filters.position)
      
      const res = await fetch(`/api/agents/counts?${params.toString()}`)
      return res.json()
    }
  })

  const { data: positions = [] } = useQuery({
    queryKey: ['agent-positions'],
    queryFn: async () => {
      const res = await fetch('/api/agents/positions')
      return res.json() as Promise<string[]>
    }
  })

  return (
    <div className="flex bg-[#f4f6fb] text-[#1a2340]">
      <Sidebar />
      <PageContainer 
        title="Annuaire des Agents" 
        subtitle={`${count} agents référencés au total`}
        className="pb-12"
      >
        <PageHeader 
          title="Annuaire Global"
          icon={Users}
          actions={
            <div className="flex gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-all ${
                  showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={16} /> Filtres
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Download size={16} /> Exporter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-tight shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                + Onboarding
              </button>
            </div>
          }
        />

        {/* Filter Presets */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            onClick={() => {
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              const today = new Date()
              setFilter('dateDepartMin', '')
              setFilter('dateDepartMax', '')
              setFilter('dateArriveeMin', thirtyDaysAgo.toISOString().split('T')[0])
              setFilter('dateArriveeMax', today.toISOString().split('T')[0])
            }}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
              filters.dateArriveeMin && filters.dateArriveeMax !== '2099-12-31'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100'
                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            <UserPlus size={18} className={filters.dateArriveeMin && filters.dateArriveeMax !== '2099-12-31' ? "text-white" : "text-indigo-500"} />
            Nouveaux
            <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${filters.dateArriveeMin && filters.dateArriveeMax !== '2099-12-31' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 font-bold'}`}>
              {counts?.newAgents || 0}
            </span>
          </button>
          
          <button
            onClick={() => {
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              const today = new Date()
              setFilter('dateArriveeMin', '')
              setFilter('dateArriveeMax', '')
              setFilter('dateDepartMin', thirtyDaysAgo.toISOString().split('T')[0])
              setFilter('dateDepartMax', today.toISOString().split('T')[0])
            }}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
              filters.dateDepartMin
                ? 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-100'
                : 'bg-white border-slate-100 text-slate-500 hover:border-rose-200 hover:text-rose-600'
            }`}
          >
            <UserMinus size={18} className={filters.dateDepartMin ? "text-white" : "text-rose-500"} />
            Partis (-30j)
            <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${filters.dateDepartMin ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600 font-bold'}`}>
              {counts?.recentlyLeft || 0}
            </span>
          </button>

          <button
            onClick={() => {
              const today = new Date()
              setFilter('dateArriveeMin', '')
              setFilter('dateArriveeMax', '')
              setFilter('dateDepartMin', '') // On vide le min pour avoir TOUT le passé
              setFilter('dateDepartMax', today.toISOString().split('T')[0])
            }}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
              !filters.dateDepartMin && filters.dateDepartMax
                ? 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-100'
                : 'bg-white border-slate-100 text-slate-500 hover:border-rose-200 hover:text-rose-600'
            }`}
          >
            <UserMinus size={18} className={!filters.dateDepartMin && filters.dateDepartMax ? "text-white" : "text-rose-500"} />
             Partis (Tous)
             <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${!filters.dateDepartMin && filters.dateDepartMax ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600 font-bold'}`}>
               {counts?.allTimeLeft || 0}
             </span>
           </button>

          <button
            onClick={() => {
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              setFilter('dateDepartMin', '')
              setFilter('dateDepartMax', '')
              setFilter('dateArriveeMin', tomorrow.toISOString().split('T')[0])
              setFilter('dateArriveeMax', '2099-12-31')
            }}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
              filters.dateArriveeMax === '2099-12-31'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100'
                : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600'
            }`}
          >
            <Calendar size={18} className={filters.dateArriveeMax === '2099-12-31' ? "text-white" : "text-emerald-500"} />
            Futurs agents
            <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${filters.dateArriveeMax === '2099-12-31' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 font-bold'}`}>
              {counts?.futureAgents || 0}
            </span>
          </button>

          <button
            onClick={() => {
              resetFilters()
              setFilter('multiAdOnly', 'true')
            }}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
              filters.multiAdOnly === 'true'
                ? 'bg-amber-600 border-amber-600 text-white shadow-xl shadow-amber-100'
                : 'bg-white border-slate-100 text-slate-500 hover:border-amber-200 hover:text-amber-600'
            }`}
          >
            <Layers size={18} className={filters.multiAdOnly === 'true' ? "text-white" : "text-amber-500"} />
            Multi-comptes
            <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${filters.multiAdOnly === 'true' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600 font-bold'}`}>
              {counts?.multiAdAgents || 0}
            </span>
          </button>

          <button
            onClick={() => {
              resetFilters()
              setFilter('noAzureOnly', 'true')
            }}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
              filters.noAzureOnly === 'true'
                ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100'
                : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600'
            }`}
          >
            <CloudOff size={18} className={filters.noAzureOnly === 'true' ? "text-white" : "text-blue-500"} />
            Sans Azure
            <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] ${filters.noAzureOnly === 'true' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 font-bold'}`}>
              {counts?.noAzureAgents || 0}
            </span>
          </button>

          {(filters.dateArriveeMin || filters.dateArriveeMax || filters.dateDepartMin || filters.search || filters.direction || filters.multiAdOnly || filters.noAzureOnly) && (
            <button 
              onClick={resetFilters}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-tighter text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              Effacer les filtres
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, matricule..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-white border border-slate-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Direction</label>
                <input 
                  type="text" 
                  placeholder="Ex: DSI..." 
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.direction}
                  onChange={(e) => setFilter('direction', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Service</label>
                <input 
                  type="text" 
                  placeholder="Ex: RH..." 
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.service}
                  onChange={(e) => setFilter('service', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Statut</label>
                <select 
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.statut}
                  onChange={(e) => setFilter('statut', e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="Activité">En activité</option>
                  <option value="Détachement">Détachement</option>
                  <option value="Congé">Congé</option>
                  <option value="Disponibilité">Disponibilité</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Position</label>
                <select 
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.position}
                  onChange={(e) => setFilter('position', e.target.value)}
                >
                  <option value="">Toutes les positions</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <AgentsTable agents={agents} loading={loading} />

        {/* Pagination Details */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <div>
            Affichage de {agents.length} sur {count} agents
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Précédent
            </button>
            <div className="px-4 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-lg">
              {page} / {totalPages || 1}
            </div>
            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Suivant
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
