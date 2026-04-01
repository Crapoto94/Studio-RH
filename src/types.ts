// ── Agent ─────────────────────────────────────────────────────────────────────
export type NiveauHierarchie = 'dg' | 'direction' | 'service' | 'secteur' | 'agent'

export interface Agent {
  id: number
  matricule?: string | null
  nom: string
  prenom: string
  position_l?: string | null
  code_affect?: string | null
  nom_affect_l?: string | null
  code_service?: string | null
  nom_service?: string | null
  code_direction?: string | null
  nom_direction?: string | null
  code_dg_cab?: string | null
  nom_dg_cab_l?: string | null
  fonction_l?: string | null
  poste_l?: string | null
  date_arrivee?: string | null
  date_depart?: string | null
  plus_vu?: string | Date | null
  ad_id?: string | null
  azure_id?: string | null
  actif?: boolean
  niveau_hierarchie?: NiveauHierarchie | null
  licence?: string | null
  created_at?: Date
  updated_at?: Date
}

// ── Hiérarchie ────────────────────────────────────────────────────────────────
export interface HierarchieNode {
  id: number
  code_affect?: string | null
  nom_affect_l?: string | null
  code_secteur?: string | null
  nom_secteur_l?: string | null
  code_service?: string | null
  nom_service_l?: string | null
  code_direction?: string | null
  nom_direction_l?: string | null
  code_dg_cab?: string | null
  nom_dg_cab_l?: string | null
  couleur?: string | null
  icone?: string | null
  responsable_sql?: string | null
  plus_vu?: Date | null
  agents?: Agent[]
}

// ── Alignement ────────────────────────────────────────────────────────────────
export interface Alignement {
  id: number
  nom: string
  champ_rh: string
  champ_ad: string
  sensible_casse: boolean
}

export interface Desalignement {
  agent: Agent
  champ_rh: string
  champ_ad: string
  valeur_rh: string | null
  valeur_ad: string | null
}

// ── Onboarding ────────────────────────────────────────────────────────────────
export type OnboardingStatut = 'a_faire' | 'en_cours_demande' | 'en_cours_realisation' | 'termine'

export interface OnboardingTask {
  id: number
  onboarding_id: number
  titre: string
  done: boolean
}

export interface OnboardingRecord {
  id: number
  agent_id?: number | null
  nom_temp?: string | null
  prenom_temp?: string | null
  manager_id?: number | null
  statut: OnboardingStatut
  formulaire?: string | null
  created_at: Date
  updated_at: Date
  tasks?: OnboardingTask[]
  agent?: Agent | null
  manager?: Agent | null
}

// ── Synchro ───────────────────────────────────────────────────────────────────
export type SynchroType = 'brut' | 'rh' | 'ad' | 'azure'

export interface SynchroLog {
  id: number
  type: SynchroType
  statut: 'success' | 'warning' | 'error' | 'info' | 'en_cours' | 'partial'
  message?: string | null
  details?: string | null
  progress?: number | null
  created_at: Date
}

// ── Paramètres ────────────────────────────────────────────────────────────────
export interface Parametre {
  id: number
  cle: string
  valeur: string
}

export interface Software {
  id: string
  nom: string
  description: string
  techno: 'Web' | 'Saas' | 'monoposte' | 'client serveur'
  email_createur: string
}

// ── Utilisateurs ──────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'admin'

export interface AppUser {
  id: number
  login: string
  nom: string
  prenom: string
  role: UserRole
  actif: boolean
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  count?: number
  error?: string
  timestamp?: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  totalPages: number
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalAgents: number
  agentsActifs: number
  comptesAD: number
  comptesAzure: number
  licences: Record<string, number>
  recenteLogs: SynchroLog[]
  recentOnboarding: OnboardingRecord[]
}
