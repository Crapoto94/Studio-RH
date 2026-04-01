import { AgentAvatar } from './AgentAvatar'
import { isNouveauAgent, isProchainAgent } from '@/lib/utils'
import type { Agent } from '@/types'

interface AgentViewProps {
  agent: Agent
  onClick?: () => void
}

export function AgentView({ agent, onClick }: AgentViewProps) {
  const isNouv = isNouveauAgent(agent)
  const isProch = isProchainAgent(agent)

  return (
    <div
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer hover:bg-white/5 p-1 -m-1 rounded-lg transition-colors' : ''}`}
      onClick={onClick}
    >
      <AgentAvatar agent={agent} />
      <div className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 truncate">
            {agent.nom} {agent.prenom}
          </span>
          {/* Fallback badges if not using the ones inside AgentAvatar or if we want external ones too */}
        </div>
        <span className="text-xs text-slate-500 truncate">
          {agent.poste_l || ''}
        </span>
      </div>
    </div>
  )
}

