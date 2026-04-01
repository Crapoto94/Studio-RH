import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Agent, NiveauHierarchie } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Couleur par niveau hiérarchique (avatars + UI)
export const HIERARCHY_COLORS: Record<NiveauHierarchie, string> = {
  dg:        'bg-purple-600 border-purple-400',
  direction: 'bg-blue-600 border-blue-400',
  service:   'bg-teal-600 border-teal-400',
  secteur:   'bg-amber-600 border-amber-400',
  agent:     'bg-indigo-600 border-indigo-400',
}

export const HIERARCHY_HEX: Record<NiveauHierarchie, string> = {
  dg:        '#9333ea',
  direction: '#2563eb',
  service:   '#0d9488',
  secteur:   '#d97706',
  agent:     '#4f46e5',
}

// Parseur de date robuste (Supporte ISO et FR DD/MM/YYYY)
export function parseDate(date: any): Date | null {
  if (!date) return null
  if (date instanceof Date) return date
  
  const dateStr = String(date).trim()
  
  // Priorité absolue au format français (JJ/MM/AAAA) car JS inverse souvent J/M
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    const res = new Date(year, month, day)
    if (!isNaN(res.getTime())) return res
  }

  // Fallback ISO (AAAA-MM-JJ)
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) return d

  return null
}

// Statut d'un agent
export function getAgentStatut(agent: Agent): 'actif' | 'inactif' | 'parti' | 'futur' {
  const now = new Date()
  const arrivee = parseDate(agent.date_arrivee)
  const depart = parseDate(agent.date_depart)

  if (arrivee && arrivee > now) return 'futur'
  if (depart && depart < now) return 'parti'
  
  // Règle de sécurité : si l'agent n'est plus actif dans le référentiel
  if (agent.actif === false) return 'inactif'
  
  return 'actif'
}

export function isNouveauAgent(agent: Agent): boolean {
  const arrivee = parseDate(agent.date_arrivee)
  if (!arrivee) return false
  const diff = Date.now() - arrivee.getTime()
  return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000
}

export function isProchainAgent(agent: Agent): boolean {
  const arrivee = parseDate(agent.date_arrivee)
  return !!(arrivee && arrivee > new Date())
}

export function getInitiales(nom: string, prenom: string): string {
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase()
}

export function formatDate(date: string | Date | null | undefined): string {
  const d = parseDate(date)
  if (!d) return '—'
  
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export const LICENCE_COLORS: Record<string, string> = {
  E3: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  E1: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  F3: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  F1: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  E5: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

export const SYNCHRO_COLORS: Record<string, string> = {
  brut:  'text-blue-400',
  rh:    'text-teal-400',
  ad:    'text-amber-400',
  azure: 'text-purple-400',
}
