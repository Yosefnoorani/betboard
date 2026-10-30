import type { Bet } from './types'
import { brier, calibrationBuckets, judgmentScore, overconfidence, type Forecast } from './scoring'

export const outcomeValue = (b: Bet): number | null => {
  if (b.status === 'killed') return 0
  if (b.status !== 'resolved' || !b.outcome) return null
  return b.outcome === 'hit' ? 1 : b.outcome === 'partial' ? 0.5 : 0
}

export function betForecasts(bets: Bet[]): Forecast[] {
  return bets.flatMap((b) => {
    const o = outcomeValue(b)
    return o === null ? [] : [{ p: b.probability, outcome: o }]
  })
}

export interface LedgerStats {
  total: number
  open: number
  resolved: number
  killed: number
  hits: number
  partials: number
  misses: number
  hitRate: number
  brier: number
  score: number
  gap: number
  savedWeeks: number
  buckets: ReturnType<typeof calibrationBuckets>
  dueForReview: Bet[]
}

export function ledgerStats(bets: Bet[], today = new Date().toISOString().slice(0, 10)): LedgerStats {
  const fc = betForecasts(bets)
  const resolved = bets.filter((b) => b.status === 'resolved')
  const hits = resolved.filter((b) => b.outcome === 'hit').length
  const partials = resolved.filter((b) => b.outcome === 'partial').length
  const killed = bets.filter((b) => b.status === 'killed')
  const b = brier(fc)
  return {
    total: bets.length,
    open: bets.filter((x) => x.status === 'open').length,
    resolved: resolved.length,
    killed: killed.length,
    hits,
    partials,
    misses: resolved.length - hits - partials,
    hitRate: fc.length ? fc.reduce((a, f) => a + f.outcome, 0) / fc.length : 0,
    brier: b,
    score: judgmentScore(b),
    gap: overconfidence(fc),
    savedWeeks: killed.reduce((a, k) => a + (k.savedWeeks ?? 0), 0),
    buckets: calibrationBuckets(fc),
    dueForReview: bets
      .filter((x) => x.status === 'open' && x.reviewDate && x.reviewDate <= today)
      .sort((a, z) => a.reviewDate.localeCompare(z.reviewDate)),
  }
}
