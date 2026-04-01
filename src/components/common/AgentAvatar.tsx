import { cn, HIERARCHY_HEX, getInitiales, getAgentStatut, isNouveauAgent, isProchainAgent } from '@/lib/utils'
import type { Agent, NiveauHierarchie } from '@/types'

interface AgentAvatarProps {
  agent: Agent
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs border-2',
  md: 'w-10 h-10 text-sm border-2',
  lg: 'w-14 h-14 text-base border-3',
}

export function AgentAvatar({ agent, size = 'md', className }: AgentAvatarProps) {
  const statut = getAgentStatut(agent)
  const niveau = (agent.niveau_hierarchie as NiveauHierarchie) ?? 'agent'
  const color = HIERARCHY_HEX[niveau]
  const initiales = getInitiales(agent.nom, agent.prenom)
  const isNouv = isNouveauAgent(agent)
  const isProch = isProchainAgent(agent)

  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          'rounded-lg flex items-center justify-center font-display font-bold text-white select-none',
          sizeClasses[size],
          statut === 'actif' && 'border-solid border-white ring-1 ring-slate-200',
          statut === 'inactif' && 'border-dashed border-slate-300 opacity-70',
          statut === 'parti' && 'border-solid border-white opacity-60',
          className
        )}
        style={{
          backgroundColor: color,
          borderColor: (statut === 'inactif' || statut === 'parti') ? '#cbd5e1' : color,
        }}
        title={`${agent.prenom} ${agent.nom}`}
      >
        {initiales}
        {statut === 'parti' && (
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, transparent 43%, ${color}66 43%, ${color}66 57%, transparent 57%)`
            }}
          />
        )}
      </div>

      {/* Badges */}
      {isNouv && (
        <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1 py-0.5 rounded-full bg-teal-500/90 text-white leading-none">
          Nouv
        </span>
      )}
      {isProch && !isNouv && (
        <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1 py-0.5 rounded-full bg-amber-500/90 text-white leading-none">
          Proch
        </span>
      )}
    </div>
  )
}
