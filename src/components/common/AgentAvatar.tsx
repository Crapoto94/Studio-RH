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

  // Mapping des bordures selon le statut demandé
  const borderStyles: Record<string, string> = {
    actif: 'border-solid border-2',
    inactif: 'border-dashed border-2 opacity-70',
    parti: 'border-solid border-2 opacity-50 grayscale',
    futur: 'border-dotted border-2 opacity-90',
  }

  return (
    <div className="relative flex-shrink-0 group">
      <div
        className={cn(
          'rounded-lg flex items-center justify-center font-display font-bold select-none transition-all duration-200 group-hover:scale-105',
          sizeClasses[size],
          borderStyles[statut],
          className
        )}
        style={{
          backgroundColor: `${color}22`, // Fond léger de la couleur
          color: color,                  // Texte de la couleur
          borderColor: color,            // Bordure de la couleur
        }}
        title={`${agent.prenom} ${agent.nom} (${niveau})`}
      >
        <span className="drop-shadow-sm">{initiales}</span>
        
        {statut === 'parti' && (
          <div
            className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 45%, ${color} 45%, ${color} 55%, transparent 55%)`
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
