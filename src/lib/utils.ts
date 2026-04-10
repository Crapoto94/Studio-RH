import { Agent, NiveauHierarchie } from '@/types'

// Couleurs par défaut de la hiérarchie (peuvent être surchargées par la DB)
export const HIERARCHY_HEX: Record<NiveauHierarchie, string> = {
  dg:        '#9333ea', // Violet
  direction: '#2563eb', // Bleu
  service:   '#0d9488', // Teal
  secteur:   '#d97706', // Ambre
  agent:     '#4f46e5', // Indigo
}

// Parseur de date robuste (Supporte Date, ISO et FR DD/MM/YYYY)
export function parseDate(date: any): Date | null {
  if (!date) return null
  if (date instanceof Date) return date
  
  const dateStr = String(date).trim()
  if (!dateStr || dateStr === 'null' || dateStr === '—') return null
  
  // Format ISO
  if (dateStr.includes('T') || dateStr.includes('-')) {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) return d
  }

  // Format français (JJ/MM/AAAA)
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    const res = new Date(year, month, day)
    if (!isNaN(res.getTime())) return res
  }

  return null
}

// Statut d'un agent
export function getAgentStatut(agent: Agent): 'actif' | 'inactif' | 'parti' | 'futur' {
  const now = new Date()
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)

  const arrivee = parseDate(agent.date_arrivee)
  const depart = parseDate(agent.date_depart)
  const plusVu = parseDate(agent.plus_vu)

  if (arrivee && arrivee > now) return 'futur'
  if (plusVu) return 'parti'
  if (depart && depart <= todayMidnight) return 'parti'
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

// Formatte le prénom : Première lettre en majuscule pour chaque mot, le reste en minuscule.
export function formatPrenom(str: string | null | undefined): string {
  if (!str) return ''
  return str.toLowerCase().replace(/(^|[\s\-])\p{L}/gu, (match) => match.toUpperCase())
}

export function getInitiales(nom: string, prenom: string): string {
  const p = formatPrenom(prenom)
  const n = nom?.toUpperCase() || ''
  return `${p.charAt(0)}${n.charAt(0)}`
}

export function formatDate(date: string | Date | null | undefined): string {
  const d = parseDate(date)
  if (!d) return '—'
  
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
