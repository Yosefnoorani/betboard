import { describe, expect, it } from 'vitest'
import { fitScore, overload } from './constitution'
import type { Bet, Constitution } from './types'

const c: Constitution = {
  company: 'Acme',
  northStar: 'Weekly active teams',
  capacity: 3,
  capacityWeeks: 20,
  principles: [
    { id: '1', kind: 'goal', text: 'Grow team activation', keywords: 'activation, onboarding', weight: 5 },
    { id: '2', kind: 'principle', text: 'Self-serve first', keywords: 'self-serve', weight: 2 },
    { id: '3', kind: 'nongoal', text: 'No custom enterprise one-offs', keywords: 'custom integration, one-off', weight: 4 },
  ],
}

const good: Partial<Bet> = {
  title: 'Guided onboarding checklist',
  hypothesis: 'A checklist will lift activation for new self-serve teams',
  metric: 'Team activation rate',
  target: '+5pp',
  probability: 0.4,
  killCriteria: 'Kill if lift < 1pp after 4 weeks',
  reviewDate: '2026-12-01',
}

describe('fitScore', () => {
  it('scores a well-formed aligned bet highly', () => {
    const r = fitScore(good, c)
    // alignment: 5*12 + 2*12 = 84 -> capped 60; quality 40
    expect(r.alignment).toBe(60)
    expect(r.quality).toBe(40)
    expect(r.score).toBe(100)
    expect(r.flags[0].level).toBe('ok')
  })
  it('penalises non-goal violations', () => {
    const r = fitScore({ ...good, hypothesis: 'Build a custom integration for one customer to drive activation' }, c)
    expect(r.violations).toHaveLength(1)
    expect(r.penalty).toBe(32)
    expect(r.score).toBe(68)
    expect(r.flags[0].text).toMatch(/Violates non-goal/)
  })
  it('flags missing metric, target and kill criteria', () => {
    const r = fitScore({ title: 'Dark mode', probability: 0.99 }, c)
    const texts = r.flags.map((f) => f.text).join('|')
    expect(texts).toMatch(/metric/)
    expect(texts).toMatch(/numeric target/)
    expect(texts).toMatch(/kill criteria/)
    expect(texts).toMatch(/extreme/)
    expect(texts).toMatch(/any goal/)
    expect(r.score).toBe(0)
  })
  it('uses derived keywords when none given', () => {
    const c2: Constitution = { ...c, principles: [{ id: 'x', kind: 'goal', text: 'Reduce churn among mid-market accounts', keywords: '', weight: 3 }] }
    const r = fitScore({ ...good, hypothesis: 'Health score alerts reduce churn for mid-market accounts' }, c2)
    expect(r.matched).toHaveLength(1)
    expect(r.alignment).toBe(36)
  })
})

describe('overload', () => {
  const mk = (status: Bet['status'], cost: number) => ({ status, cost }) as Bet
  it('computes load from count and weeks', () => {
    const o = overload([mk('open', 5), mk('open', 5), mk('resolved', 50)], c)
    expect(o.open).toBe(2)
    expect(o.openWeeks).toBe(10)
    expect(o.load).toBeCloseTo(2 / 3)
    expect(o.level).toBe('healthy')
  })
  it('detects overload on weeks', () => {
    const o = overload([mk('open', 25)], c)
    expect(o.level).toBe('overloaded')
  })
})
