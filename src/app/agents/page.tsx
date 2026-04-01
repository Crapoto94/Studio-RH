'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { AgentsTable } from '@/components/agents/AgentsTable'
import { useAgents } from '@/hooks/useAgents'
import { Users, Search, Filter, Download } from 'lucide-react'

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

  return (
    <div className="flex bg-[#f4f6fb] text-[#1a2340]">
      <Sidebar />
      <PageContainer 
        title="Liste des Agents" 
        subtitle={`${count} agents référencés au total`}
        className="pb-12"
      >
        <PageHeader 
          title="Annuaire Global"
          icon={Users}
          actions={
            <>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-white'
                }`}
              >
                <Filter size={16} /> Filtres
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                <Download size={16} /> Exporter
              </button>
              <button className="btn-primary flex items-center gap-2 text-sm">
                + Nouvel Onboarding
              </button>
            </>
          }
        />

        {/* Toolbar */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, matricule..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all shadow-sm"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            
            {showFilters && (
              <button 
                onClick={resetFilters}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Arrivée (Après le...)</label>
                <input 
                  type="date" 
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.dateArriveeMin}
                  onChange={(e) => setFilter('dateArriveeMin', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Arrivée (Avant le...)</label>
                <input 
                  type="date" 
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.dateArriveeMax}
                  onChange={(e) => setFilter('dateArriveeMax', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Départ (Après le...)</label>
                <input 
                  type="date" 
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.dateDepartMin}
                  onChange={(e) => setFilter('dateDepartMin', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Départ (Avant le...)</label>
                <input 
                  type="date" 
                  className="w-full text-xs border border-slate-200 rounded-md px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.dateDepartMax}
                  onChange={(e) => setFilter('dateDepartMax', e.target.value)}
                />
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
              className="px-3 py-1 bg-slate-50 border border-slate-300 rounded hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <div className="px-3 py-1 bg-slate-50 border border-slate-300 rounded">
              {page} / {totalPages || 1}
            </div>
            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-slate-50 border border-slate-300 rounded hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}


