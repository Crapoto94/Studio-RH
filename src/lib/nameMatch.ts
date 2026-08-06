/**
 * Recherche d'agent tolérante à la casse, aux accents, aux tirets, à l'ordre nom/prénom
 * et aux petites variantes orthographiques (ex: "Mary" ~ "Marie").
 */

export function normalizeText(s: string | null | undefined): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenize(s: string | null | undefined): string[] {
  return normalizeText(s).split(' ').filter(Boolean)
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const dp: number[] = new Array(n + 1)
  for (let j = 0; j <= n; j++) dp[j] = j

  for (let i = 1; i <= m; i++) {
    let prevDiag = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]
      dp[j] = a[i - 1] === b[j - 1]
        ? prevDiag
        : 1 + Math.min(prevDiag, dp[j], dp[j - 1])
      prevDiag = tmp
    }
  }
  return dp[n]
}

/** Similarité [0,1] entre deux tokens déjà normalisés. */
function tokenSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1
  if (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))) return 0.9

  const dist = levenshtein(a, b)
  const maxLen = Math.max(a.length, b.length)
  const ratio = 1 - dist / maxLen
  return ratio >= 0.55 ? ratio * 0.85 : 0
}

export interface NameMatchResult {
  matchedCount: number
  coverage: number   // part des tokens de la requête ayant trouvé une correspondance
  avgScore: number    // similarité moyenne des tokens appariés
  finalScore: number  // coverage * avgScore, utilisé pour classer/filtrer
  isExactSet: boolean // les deux ensembles de tokens sont rigoureusement identiques
}

/**
 * Compare les tokens d'une requête libre (nom + prénom, ordre indifférent) aux tokens
 * d'un agent (nom + prénom éclatés). Appariement glouton token-à-token.
 */
export function matchNameTokens(queryTokens: string[], candidateTokens: string[]): NameMatchResult {
  if (queryTokens.length === 0 || candidateTokens.length === 0) {
    return { matchedCount: 0, coverage: 0, avgScore: 0, finalScore: 0, isExactSet: false }
  }

  const used = new Set<number>()
  let totalScore = 0
  let matchedCount = 0

  for (const qt of queryTokens) {
    let best = 0
    let bestIdx = -1
    candidateTokens.forEach((ct, idx) => {
      if (used.has(idx)) return
      const sim = tokenSimilarity(qt, ct)
      if (sim > best) {
        best = sim
        bestIdx = idx
      }
    })
    if (bestIdx >= 0 && best > 0) {
      used.add(bestIdx)
      totalScore += best
      matchedCount++
    }
  }

  const coverage = matchedCount / queryTokens.length
  const avgScore = matchedCount > 0 ? totalScore / matchedCount : 0
  const finalScore = coverage * avgScore

  const sortedQuery = [...queryTokens].sort()
  const sortedCandidate = [...candidateTokens].sort()
  const isExactSet = sortedQuery.length === sortedCandidate.length &&
    sortedQuery.every((t, i) => t === sortedCandidate[i])

  return { matchedCount, coverage, avgScore, finalScore, isExactSet }
}

export const NAME_MATCH_THRESHOLD = 0.35
