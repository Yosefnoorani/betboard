import { describe, expect, it } from 'vitest'
import { heuristicAssist } from './assist'
import { ledgerStats } from './ledger'
import { decodeShare, encodeShare } from './share'
import type { Bet } from './types'

describe('heuristicAssist', () => {
  const today = new Date('2026-10-30T10:00:00Z')
  it('structures a raw idea', () => {
    const d = heuristicAssist('Add an onboarding checklist for new admins. Customers asked for it in interviews. Should improve activation by 8%. About 3 weeks of work.', today)
    expect(d.title).toBe('Add an onboarding checklist for new admins.')
    expect(d.metric).toBe('Activation rate')
    expect(d.target).toBe('+8%')
    expect(d.cost).toBe(3)
    expect(d.probability).toBeCloseTo(0.45)
    expect(d.tags).toContain('onboarding')
    expect(d.killCriteria).toMatch(/Kill if/)
    expect(d.reviewDate).toBe('2026-12-04')
  })
  it('detects decrease direction and sprints', () => {
    const d = heuristicAssist('Rewrite the billing page to reduce churn by 2pp, 3 sprints', today)
    expect(d.target).toBe('-2pp')
    expect(d.cost).toBe(6)
    expect(d.probability).toBeCloseTo(0.25)
  })
  it('falls back gracefully', () => {
    const d = heuristicAssist('', today)
    expect(d.title).toBe('Untitled bet')
    expect(d.cost).toBe(4)
  })
})

describe('ledgerStats', () => {
  const base = { title: '', hypothesis: '', metric: '', baseline: '', target: '', killCriteria: '', reviewDate: '2026-01-01', cost: 2, owner: '', tags: [], learnings: '', createdAt: '' }
  const bets: Bet[] = [
    { ...base, id: '1', probability: 0.8, status: 'resolved', outcome: 'hit' },
    { ...base, id: '2', probability: 0.6, status: 'resolved', outcome: 'partial' },
    { ...base, id: '3', probability: 0.3, status: 'killed', savedWeeks: 4 },
    { ...base, id: '4', probability: 0.5, status: 'open' },
  ]
  it('computes stats', () => {
    const s = ledgerStats(bets, '2026-06-01')
    expect(s.resolved).toBe(2)
    expect(s.killed).toBe(1)
    expect(s.savedWeeks).toBe(4)
    expect(s.hitRate).toBeCloseTo(0.5)
    // brier = (0.04 + 0.01 + 0.09)/3
    expect(s.brier).toBeCloseTo(0.14 / 3)
    expect(s.dueForReview.map((b) => b.id)).toEqual(['4'])
  })
})

describe('share encoding', () => {
  it('round-trips unicode', () => {
    const o = { n: 'Yosef ✓', s: 77 }
    expect(decodeShare(encodeShare(o))).toEqual(o)
    expect(decodeShare('%%%')).toBeNull()
  })
})
