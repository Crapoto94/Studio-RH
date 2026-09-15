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
  if (depart) {
    if (depart <= todayMidnight) return 'parti'
  } else if (plusVu) {
    return 'parti'
  }
  
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

// Génération d'acronymes pour la hiérarchie (ex: "Service Infrastructure Réseaux et Systèmes" -> "SIRS")
const ACRONYME_STOPWORDS = new Set([
  'et', 'de', 'des', 'du', 'la', 'le', 'les', 'l', 'd', 'a', 'à', 'aux',
  'en', 'un', 'une', 'au', 'dans', 'pour', 'sur', 'par', 'ou',
])

function stripAccents(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Cherche un acronyme déjà présent dans le nom, ex: "Direction des Systèmes d'Information (DSI)"
export function extractAcronyme(nom: string | null | undefined): string | null {
  if (!nom) return null
  const match = nom.match(/\(([A-ZÀ-ÖØ-Þ]{2,8})\)\s*$/)
  return match ? match[1] : null
}

// Génère un acronyme à partir des initiales des mots significatifs du nom
export function generateAcronyme(nom: string | null | undefined): string {
  if (!nom) return ''
  const words = nom.replace(/\([^)]*\)\s*$/, '').split(/[\s\-'’]+/).filter(Boolean)
  const letters = words
    .filter(w => !ACRONYME_STOPWORDS.has(stripAccents(w).toLowerCase()))
    .map(w => stripAccents(w).charAt(0).toUpperCase())
    .filter(l => /[A-Z]/.test(l))

  if (letters.length === 0) return stripAccents(nom).replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()
  return letters.join('').slice(0, 8)
}

// Acronyme "trouvé" dans le nom si présent, sinon généré à partir des initiales
export function resolveAcronyme(nom: string | null | undefined): string {
  return extractAcronyme(nom) || generateAcronyme(nom)
}
