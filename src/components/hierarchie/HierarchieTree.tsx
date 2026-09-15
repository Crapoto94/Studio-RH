'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ChevronDown, Building, Users, FolderTree, Layers, Pencil, Crown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// Correspond à l'ordre des niveaux dans TreeLevel (0=dg, 1=direction, 2=service, 3=secteur, 4=affect)
const ACRONYME_TYPES = ['dg', 'direction', 'service', 'secteur', 'affect']

interface TreeProps {
  items: any[]
  acronymes?: any[]
  onEditAcronyme?: (entityType: string, code: string, nom: string, acronyme: string) => void
}

export function HierarchieTree({ items, acronymes = [], onEditAcronyme }: TreeProps) {
  if (items.length === 0) {
    return <div className="text-slate-400 italic text-sm p-4">Arborescence vide. Lancez la reconstruction.</div>
  }

  // On identifie les "racines" : les items qui ont le plus haut niveau de hiérarchie rempli.
  // Ordre de priorité pour la racine : DG -> Direction -> Service -> Secteur -> Affectation

  const getRoots = () => {
    const dgs = Array.from(new Set(items.map(i => i.code_dg_cab).filter(c => c && c !== ''))).sort()
    if (dgs.length > 0) return { level: 0, codes: dgs }

    const dirs = Array.from(new Set(items.map(i => i.code_direction).filter(c => c && c !== ''))).sort()
    if (dirs.length > 0) return { level: 1, codes: dirs }

    const svcs = Array.from(new Set(items.map(i => i.code_service).filter(c => c && c !== ''))).sort()
    if (svcs.length > 0) return { level: 2, codes: svcs }

    return { level: 4, codes: ['ROOT'] } // Fallback
  }

  const { level: startLevel, codes: rootCodes } = getRoots()

  return (
    <div className="space-y-1">
      {rootCodes.map(code => {
        const rootItems = items.filter(i => {
          if (startLevel === 0) return i.code_dg_cab === code
          if (startLevel === 1) return i.code_direction === code
          if (startLevel === 2) return i.code_service === code
          return true
        })
        const label = startLevel === 0 ? rootItems[0].nom_dg_cab_l :
                      startLevel === 1 ? rootItems[0].nom_direction_l :
                      rootItems[0].nom_service_l

        return (
          <TreeLevel
            key={code}
            code={code}
            label={label || code}
            level={startLevel}
            items={items}
            currentItems={rootItems}
            acronymes={acronymes}
            onEditAcronyme={onEditAcronyme}
          />
        )
      })}
    </div>
  )
}

function TreeLevel({ code, label, level, items, currentItems, acronymes, onEditAcronyme }: {
  code: string, label: string, level: number, items: any[], currentItems: any[],
  acronymes: any[], onEditAcronyme?: (entityType: string, code: string, nom: string, acronyme: string) => void
}) {
  const [expanded, setExpanded] = useState(level < 1)
  const [agentsOpen, setAgentsOpen] = useState(false)

  // Déterminer les enfants selon le niveau actuel
  let children: { code: string, label: string, childItems: any[] }[] = []

  if (level === 0) {
    // DG (Lvl 0 dans l'UI, mais correspond à Lvl 4 dans la logique métier) -> Directions
    const dirCodes = Array.from(new Set(currentItems.map(i => i.code_direction).filter(c => c && c !== ''))).sort()
    children = dirCodes.map(dc => ({
      code: dc,
      label: currentItems.find(i => i.code_direction === dc)?.nom_direction_l || dc,
      childItems: currentItems.filter(i => i.code_direction === dc)
    }))
  } else if (level === 1) {
    // Direction -> Services
    const svcCodes = Array.from(new Set(currentItems.map(i => i.code_service).filter(c => c && c !== ''))).sort()
    children = svcCodes.map(sc => ({
      code: sc,
      label: currentItems.find(i => i.code_service === sc)?.nom_service_l || sc,
      childItems: currentItems.filter(i => i.code_service === sc)
    }))
  } else if (level === 2) {
    // Service -> Secteurs
    const secCodes = Array.from(new Set(currentItems.map(i => i.code_secteur).filter(c => c && c !== ''))).sort()
    children = secCodes.map(sc => ({
      code: sc,
      label: currentItems.find(i => i.code_secteur === sc)?.nom_secteur_l || sc,
      childItems: currentItems.filter(i => i.code_secteur === sc)
    }))
  } else if (level === 3) {
    // Secteur -> Affectations
    const affCodes = Array.from(new Set(currentItems.map(i => i.code_affect).filter(c => c && c !== ''))).sort()
    children = affCodes.map(ac => ({
      code: ac,
      label: currentItems.find(i => i.code_affect === ac)?.nom_affect_l || ac,
      childItems: []
    }))
  }

  // Certaines lignes sources terminent la chaîne en répétant le même code/libellé
  // au niveau suivant (ex: un secteur sans affectation propre) — on l'ignore pour
  // éviter d'afficher deux fois la même entité l'une sous l'autre.
  children = children.filter(child => !(child.code === code && child.label === label))

  const hasChildren = children.length > 0
  const iconByLevel = [Building, FolderTree, Users, Layers, Users]
  const colorByLevel = [
    'bg-purple-100 text-purple-600',
    'bg-blue-100 text-blue-600',
    'bg-teal-100 text-teal-600',
    'bg-amber-100 text-amber-600',
    'bg-slate-100 text-slate-500',
  ]

  const Icon = iconByLevel[level] || Users

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 group cursor-pointer transition-colors',
          level === 0 ? 'font-bold text-slate-800' : 'text-slate-600 text-sm'
        )}
        style={{ paddingLeft: `${0.5 + level * 1.2}rem` }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasChildren && (
            expanded
              ? <ChevronDown size={14} className="text-slate-400" />
              : <ChevronRight size={14} className="text-slate-400" />
          )}
        </span>

        <span className={cn('shrink-0 p-1.5 rounded-md', colorByLevel[level])}>
          <Icon size={14} />
        </span>

        <span className="truncate flex-1">{label}</span>

        <span className="font-mono text-[10px] text-slate-400 shrink-0">{code}</span>

        <AcronymeBadge
          entityType={ACRONYME_TYPES[level]}
          code={code}
          nom={label}
          acronymes={acronymes}
          onEditAcronyme={onEditAcronyme}
        />

        {hasChildren && (
          <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400 font-normal">
            {children.length}
          </Badge>
        )}

        <button
          type="button"
          title="Voir les agents"
          onClick={(e) => { e.stopPropagation(); setAgentsOpen(o => !o) }}
          className={cn(
            'shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] border transition-colors',
            agentsOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-transparent text-slate-400 hover:bg-slate-100'
          )}
        >
          <Users size={11} />
        </button>
      </div>

      {agentsOpen && (
        <AgentsList entityType={ACRONYME_TYPES[level]} code={code} indent={0.5 + (level + 1) * 1.2} />
      )}

      {expanded && hasChildren && (
        <div className="space-y-0.5">
          {children.map(child => (
            <TreeLevel
              key={child.code}
              code={child.code}
              label={child.label}
              level={level + 1}
              items={items}
              currentItems={child.childItems}
              acronymes={acronymes}
              onEditAcronyme={onEditAcronyme}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Liste des agents rattachés à un nœud de l'arbre (et à ses descendants pour un
// nœud non-terminal), avec mise en évidence du/des responsable(s) identifié(s)
// via la règle SQL configurée sur ce niveau (onglet Configuration).
function AgentsList({ entityType, code, indent }: { entityType: string, code: string, indent: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hierarchy-agents', entityType, code],
    queryFn: async () => {
      const res = await fetch(`/api/hierarchy/agents?type=${entityType}&code=${encodeURIComponent(code)}`)
      if (!res.ok) throw new Error('Erreur récupération agents')
      return res.json()
    }
  })

  return (
    <div style={{ paddingLeft: `${indent}rem` }} className="pb-1">
      {isLoading ? (
        <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1.5 px-2">
          <Loader2 size={12} className="animate-spin" /> Chargement des agents...
        </div>
      ) : error ? (
        <div className="text-[11px] text-red-400 py-1.5 px-2">Erreur de chargement.</div>
      ) : data.agents.length === 0 ? (
        <div className="text-[11px] text-slate-400 italic py-1.5 px-2">Aucun agent.</div>
      ) : (
        <div className="space-y-0.5">
          {data.agents.map((a: any) => (
            <div
              key={a.id}
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded-md text-[11px]',
                a.est_responsable ? 'bg-amber-50 text-amber-800' : 'text-slate-500'
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center shrink-0">
                {a.est_responsable
                  ? <Crown size={11} className="text-amber-500" />
                  : <Users size={11} className="text-slate-300" />}
              </span>
              <span className={cn('truncate flex-1', a.est_responsable && 'font-semibold')}>
                {a.prenom} {a.nom}
              </span>
              <span className="truncate text-slate-400 max-w-[40%]">{a.poste_l || a.fonction_l || ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AcronymeBadge({ entityType, code, nom, acronymes, onEditAcronyme }: {
  entityType: string, code: string, nom: string, acronymes: any[],
  onEditAcronyme?: (entityType: string, code: string, nom: string, acronyme: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const record = acronymes.find(a => a.type === entityType && a.code === code)

  if (!onEditAcronyme) {
    return record?.acronyme
      ? <Badge variant="outline" className="text-[10px] border-indigo-200 text-indigo-500 font-semibold shrink-0">{record.acronyme}</Badge>
      : null
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        onBlur={() => {
          setEditing(false)
          if (value && value !== record?.acronyme) onEditAcronyme(entityType, code, nom, value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-16 h-5 px-1 text-[10px] font-semibold text-center border border-indigo-300 rounded outline-none focus:ring-1 focus:ring-indigo-400"
      />
    )
  }

  return (
    <button
      type="button"
      title="Modifier l'acronyme"
      onClick={(e) => {
        e.stopPropagation()
        setValue(record?.acronyme || '')
        setEditing(true)
      }}
      className="shrink-0"
    >
      {record?.acronyme ? (
        <Badge variant="outline" className="text-[10px] border-indigo-200 text-indigo-500 font-semibold hover:bg-indigo-50 flex items-center gap-1">
          {record.acronyme}
          <Pencil size={9} className="opacity-0 group-hover:opacity-60" />
        </Badge>
      ) : (
        <Badge variant="outline" className="text-[10px] border-dashed border-slate-300 text-slate-300 hover:text-slate-400 hover:border-slate-400 font-normal">
          + acronyme
        </Badge>
      )}
    </button>
  )
}
