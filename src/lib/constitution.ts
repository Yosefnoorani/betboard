import type { Bet, Constitution, Principle } from './types'
import { keywordsOf, mentions } from './text'

export type FlagLevel = 'error' | 'warn' | 'ok'
export interface Flag {
  level: FlagLevel
  text: string
}

export interface FitResult {
  score: number
  alignment: number
  quality: number
  penalty: number
  matched: { principle: Principle; hits: string[] }[]
  violations: { principle: Principle; hits: string[] }[]
  flags: Flag[]
}

export const betText = (b: Partial<Bet>) =>
  [b.title, b.hypothesis, b.metric, b.target, (b.tags || []).join(' ')].filter(Boolean).join(' \n ')

const hasNumber = (s = '') => /\d/.test(s)

/**
 * Fit score 0..100.
 *  - Alignment (max 60): sum over matched goals/principles of weight*12, capped.
 *  - Quality (max 40): measurable metric 12, numeric target 10, kill criteria 10,
 *    review date 4, non-extreme probability 4.
 *  - Penalty: each violated non-goal subtracts weight*8 (max 40 per non-goal).
 */
export function fitScore(bet: Partial<Bet>, c: Constitution): FitResult {
  const text = betText(bet)
  const flags: Flag[] = []
  const matched: FitResult['matched'] = []
  const violations: FitResult['violations'] = []

  for (const p of c.principles) {
    const kws = keywordsOf(p.text, p.keywords)
    const hits = kws.filter((k) => mentions(text, k))
    // auto-derived keywords are noisy: need 1 hit for explicit, 2 for derived (or 1 if few keywords)
    const need = p.keywords.trim() ? 1 : kws.length <= 3 ? 1 : 2
    if (hits.length >= need) {
      if (p.kind === 'nongoal') violations.push({ principle: p, hits })
      else matched.push({ principle: p, hits })
    }
  }

  const alignment = Math.min(60, matched.reduce((a, m) => a + m.principle.weight * 12, 0))
  let quality = 0
  const metric = (bet.metric || '').trim()
  if (metric.length >= 3) quality += 12
  else flags.push({ level: 'error', text: 'No measurable success metric' })
  if (hasNumber(bet.target)) quality += 10
  else flags.push({ level: 'error', text: 'No numeric target: success is undefined' })
  if ((bet.killCriteria || '').trim().length >= 8) quality += 10
  else flags.push({ level: 'error', text: 'No kill criteria: this bet can never die' })
  if (bet.reviewDate) quality += 4
  else flags.push({ level: 'warn', text: 'No review date' })
  const p = bet.probability ?? 0.5
  if (p > 0.05 && p < 0.95) quality += 4
  else flags.push({ level: 'warn', text: `Probability of ${Math.round(p * 100)}% is extreme. Is this really a bet?` })

  const penalty = violations.reduce((a, v) => a + Math.min(40, v.principle.weight * 8), 0)
  for (const v of violations) flags.unshift({ level: 'error', text: `Violates non-goal: “${v.principle.text}”` })
  if (matched.length === 0 && c.principles.some((x) => x.kind !== 'nongoal'))
    flags.unshift({ level: 'warn', text: 'Does not connect to any goal or principle' })
  if (flags.length === 0) flags.push({ level: 'ok', text: 'Well-formed bet, aligned with strategy' })

  const score = Math.max(0, Math.min(100, Math.round(alignment + quality - penalty)))
  return { score, alignment, quality, penalty, matched, violations, flags }
}

export interface Overload {
  open: number
  capacity: number
  openWeeks: number
  capacityWeeks: number
  /** 0..1+ ratio of the worse of the two dimensions */
  load: number
  level: 'healthy' | 'stretched' | 'overloaded'
}

export function overload(bets: Bet[], c: Constitution): Overload {
  const openBets = bets.filter((b) => b.status === 'open')
  const openWeeks = openBets.reduce((a, b) => a + (b.cost || 0), 0)
  const load = Math.max(openBets.length / Math.max(1, c.capacity), openWeeks / Math.max(1, c.capacityWeeks))
  return {
    open: openBets.length,
    capacity: c.capacity,
    openWeeks,
    capacityWeeks: c.capacityWeeks,
    load,
    level: load > 1 ? 'overloaded' : load > 0.8 ? 'stretched' : 'healthy',
  }
}
