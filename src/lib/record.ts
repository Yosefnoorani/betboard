import type { Bet } from './types'
import type { LedgerStats } from './ledger'

/** Compact, URL-safe track record payload. */
export interface RecordPayload {
  n: string // name
  co: string // company
  s: number // score
  b: number // brier
  h: number // hit rate 0..1
  g: number // gap pts
  r: number // resolved
  k: number // killed
  sw: number // saved person-weeks
  bk: [number, number, number, number, number][] // lo, hi, meanP, observed, n
  it: [string, number, string][] // title, p%, outcome (hit|partial|miss|killed)
}

export function toPayload(st: LedgerStats, bets: Bet[], name: string, company: string): RecordPayload {
  const r3 = (x: number) => Math.round(x * 1000) / 1000
  return {
    n: name,
    co: company,
    s: st.score,
    b: r3(st.brier),
    h: r3(st.hitRate),
    g: Math.round(st.gap),
    r: st.resolved,
    k: st.killed,
    sw: st.savedWeeks,
    bk: st.buckets.map((x) => [x.lo, x.hi, r3(x.meanP), r3(x.observed), x.n]),
    it: bets
      .filter((b) => b.status !== 'open')
      .sort((a, z) => (z.resolvedAt ?? '').localeCompare(a.resolvedAt ?? ''))
      .slice(0, 12)
      .map((b) => [b.title.slice(0, 70), Math.round(b.probability * 100), b.status === 'killed' ? 'killed' : (b.outcome ?? 'miss')]),
  }
}
