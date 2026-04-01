'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Building, Users, FolderTree, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface TreeProps {
  items: any[]
}

export function HierarchieTree({ items }: TreeProps) {
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
          />
        )
      })}
    </div>
  )
}

function TreeLevel({ code, label, level, items, currentItems }: {
  code: string, label: string, level: number, items: any[], currentItems: any[]
}) {
  const [expanded, setExpanded] = useState(level < 1)

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

        {hasChildren && (
          <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400 font-normal">
            {children.length}
          </Badge>
        )}
      </div>

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
            />
          ))}
        </div>
      )}
    </div>
  )
}
