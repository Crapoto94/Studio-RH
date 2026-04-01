'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageHeader } from '@/components/common/PageHeader'
import { RefreshCw, Database, Cloud, Building2, Play, XCircle } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useSynchro } from '@/hooks/useSynchro'

export default function SynchroPage() {
  const { logs, isSyncing, syncingType, progress, startSync, cancelSync, isCancelling } = useSynchro()
  


  return (
    <div className="flex bg-[#f4f6fb] text-[#1a2340]">
      <Sidebar />
      <PageContainer 
        title="Synchronisation" 
        subtitle="Centre de commande des imports et croisements"
      >
        <PageHeader title="Opérations de Synchro" icon={RefreshCw} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <SyncCard 
            title="Imports Bruts"
            description="Récupère les données brutes depuis le SIRH, Active Directory et Azure Entra ID sans modifier la table de référence."
            icon={Database}
            color="#6063ee"
            loading={isSyncing && syncingType === 'brut'}
            onClick={() => startSync('brut')}
          />

          <SyncCard 
            title="Consolidation RH"
            description="Traite les données brutes RH pour mettre à jour la base de référence (REF_AGENTS et REF_HIERARCHIE). Gère les arrivées et mouvements."
            icon={Building2}
            color="#0d9488"
            loading={isSyncing && syncingType === 'rh'}
            onClick={() => startSync('rh')}
          />

          <SyncCard 
            title="Liaisons AD"
            description="Tente de faire correspondre les comptes Active Directory avec les références RH via des règles heuristiques (Nom+Prénom)."
            icon={RefreshCw}
            color="#d97706"
            loading={isSyncing && syncingType === 'ad'}
            onClick={() => startSync('ad')}
          />

          <SyncCard 
            title="Correspondances Azure"
            description="Lie les comptes Microsoft 365 / Azure Entra ID aux agents via l'UPN et récupère les licences (E1, F3, F1)."
            icon={Cloud}
            color="#9333ea"
            loading={isSyncing && syncingType === 'azure'}
            onClick={() => startSync('azure')}
          />
        </div>

        {/* Minimal Console UI for Logs */}
        <div className="glass-card mt-8 flex flex-col min-h-[400px]">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white/80 rounded-t-xl">
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-500">CONSOLE DE SYNCHRONISATION</span>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
          </div>
          <div className="p-4 flex-1 font-mono text-sm space-y-2 overflow-y-auto">
            {isSyncing && syncingType && (
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#6063ee]">
                  <div className="flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin" /> 
                    Traitement {syncingType.toUpperCase()} en cours...
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{progress}%</span>
                    <button 
                      onClick={() => { if(confirm('Annuler la synchronisation en cours ?')) cancelSync(); }}
                      disabled={isCancelling}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Annuler
                    </button>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-[#6063ee] transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            )}
            
            {logs.length === 0 ? (
              <p className="text-slate-400 italic text-xs">Aucun log récent...</p>
            ) : (
              logs.map(log => {
                let logType: 'info' | 'success' | 'warning' | 'error' = 'info'
                if (log.statut === 'success') logType = 'success'
                if (log.statut === 'error') logType = 'error'
                if (log.statut === 'warning' || (log.statut as string) === 'partial') logType = 'warning'

                return (
                  <LogLine 
                    key={log.id} 
                    type={logType} 
                    message={`[${log.type.toUpperCase()}] ${log.message}`} 
                    time={new Date(log.created_at).toLocaleTimeString('fr-FR')} 
                  />
                )
              })
            )}
          </div>
        </div>

      </PageContainer>
    </div>
  )
}

function SyncCard({ title, description, icon: Icon, color, loading, onClick }: { title: string, description: string, icon: React.ElementType, color: string, loading: boolean, onClick: () => void }) {
  return (
    <div className="glass-card p-6 flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.03] transition-transform group-hover:scale-110" style={{ backgroundColor: color }} />
      
      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
        <div className="flex-1 pt-1">
          <h3 className="font-display font-bold text-lg text-slate-800 mb-1">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed min-h-[60px]">{description}</p>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-200 relative z-10">
        <button 
          onClick={onClick}
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all",
            loading 
              ? "bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100" 
              : "border hover:opacity-90 active:scale-[0.98]"
          )}
          style={!loading ? { borderColor: `${color}50`, color: color, backgroundColor: `${color}10` } : {}}
        >
          {loading ? (
            <><RefreshCw className="animate-spin" size={16} /> En cours...</>
          ) : (
             <><Play size={16} /> Lancer</>
          )}
        </button>
      </div>
    </div>
  )
}

function LogLine({ type, message, time }: { type: 'info' | 'success' | 'warning' | 'error', message: string, time: string }) {
  const colors = {
    info: 'text-slate-500',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  }
  
  return (
    <div className="flex gap-3 font-mono text-xs">
      <span className="text-slate-400 shrink-0">[{time}]</span>
      <span className={colors[type]}>{message}</span>
    </div>
  )
}


