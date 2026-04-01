# Architecture Relationnelle - RH Studio

## Introduction
Ce document présente l'architecture logicielle du projet RH Studio (Next.js 15), décomposée par strates fonctionnelles. L'objectif est de clarifier le rôle de chaque composant, ses dépendances et ses impacts sur l'écosystème technique.

---

## 🏗️ 1. Cœur du Système (CORE)

### `src/app/layout.tsx` (Root Layout)
- **Type** : CORE (Layout global)
- **Dépendances** : `src/globals.css`, `Providers` (TanStack Query, NextAuth)
- **Dépendants** : Toutes les pages (`src/app/**/page.tsx`)
- **Relation froide** : *Dépend de* configurations globales et du cache client.

### `src/components/layout/AdminGuard.tsx`
- **Type** : CORE (Sécurité)
- **Dépendances** : `next-auth/react` (useSession), Routes Next.js
- **Dépendants** : Pages sensibles (ex: `src/app/sql/page.tsx`, `src/app/parametres/page.tsx`)
- **Relation froide** : *Protège* l'accès aux routes en vérifiant le rôle admin.

### `src/lib/db.ts`
- **Type** : CORE (Accès aux données)
- **Dépendances** : `@prisma/client`
- **Dépendants** : 100% des routes d'API (`src/app/api/**`)
- **Relation froide** : *Persiste dans* SQLite (`dev.db`). Client singleton.

---

## 🚀 2. Fonctionnalités Principales (FEATURE)

### `src/app/onboarding/page.tsx` (Dashboard Kubernetes-like)
- **Type** : FEATURE (Page)
- **Dépendances** : 
  - API internes (`fetch('/api/onboarding')`)
  - Sous-composants (`KanbanColumn`, `AddOnboardingDialog`, `OnboardingDetailDialog`)
  - Composant layout (`Sidebar`, `PageHeader`)
- **Dépendants** : Utilisateurs RH / DSI
- **Relation froide** : *Déclenche* des re-rendus via TanStack Query ; *dépend de* données distantes synchronisées en temps réel.

### `src/app/sql/page.tsx` (Explorateur SQL)
- **Type** : FEATURE (Page d'administration)
- **Dépendances** : `/api/sql`, `/api/sql/tables`, Modale Édition custom, Lucide Icons
- **Dépendants** : Équipes techniques / DSI
- **Relation froide** : *Mute* directement la base de données (UPDATE, DELETE via raw queries).

---

## 🧩 3. Sous-composants Métiers (SUB)

### `src/components/onboarding/OnboardingDetailDialog.tsx`
- **Type** : SUB (Modale dynamique)
- **Dépendances** : Zustand/React state, `/api/onboarding/tasks/[id]`, `/api/onboarding/tasks/[id]/resend`
- **Dépendants** : `src/app/onboarding/page.tsx`
- **Relation froide** : *Déclenche* des appels PATCH pour mettre à jour les statuts des tâches et stocker des observations (commentaires).

### `src/components/onboarding/AddOnboardingDialog.tsx`
- **Type** : SUB (Formulaire de création)
- **Dépendances** : API POST `/api/onboarding`
- **Dépendants** : `src/app/onboarding/page.tsx`
- **Relation froide** : *Déclenche* la création de dossier Onboarding (Draft/a_faire) et *notifie* automatiquement le manager.

---

## ⚙️ 4. Logique Réutilisable (HOOK)

### `Hooks TanStack Query (Inline)`
*(Note: Actuellement couplés dans les pages comme `page.tsx`, pourraient être extraits dans `src/hooks/useOnboardings.ts`)*
- **Type** : HOOK
- **Dépendances** : Endpoints API `fetch()`
- **Dépendants** : `KanbanColumn`, `SQL Explorer`
- **Relation froide** : *Persiste dans* le cache mémoire local (QueryCache), invalide automatiquement à chaque mutation (CRUD).

---

## 🛠️ 5. Services et Utilitaires (UTILITY)

### `src/lib/api-ville.ts` (Moteur d'Email)
- **Type** : UTILITY (Service Externe)
- **Dépendances** : Configuration en BC (Table `Parametres`), Client HTTP `fetch`
- **Dépendants** : `src/app/api/onboarding/route.ts`, `src/app/api/onboarding/[id]/resend/route.ts`
- **Relation froide** : 
  - *Déclenche* l'API Ivory `/v1/mail/send`.
  - *Persiste dans* `EmailLog` (pour audit & debug).

### `src/app/api/onboarding/public/route.ts` (Génération des Tâches Logistiques)
- **Type** : UTILITY (Orchestrateur Backend)
- **Dépendances** : Modele Prisma (`Onboarding`, `RefAgent`, `Parametre`)
- **Dépendants** : Soumission du formulaire par le manager.
- **Relation froide** : *Déclenche* le workflow complexe -> Génère les tâches DSI/RH/Vehicule -> *Déclenche* l'envoi des mails d'information.

---

## 📊 6. Synoptique des Relations de Données (Prisma / SQLite)

1. `REF_AGENTS` : *Dépend de* l'Oracle API et de l'AD (Import brut).
2. `ONBOARDING` : *Dépend de* `REF_AGENTS` (pour prenom_temp, nom_temp et manager_id). *Persiste dans* `ONBOARDING_TASKS`.
3. `PARAMETRES` : *Utilisé par* 80% des services (URL API, délais futurs, templates mails). Configuration chaude.
