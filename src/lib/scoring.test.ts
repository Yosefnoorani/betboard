import { describe, expect, it } from 'vitest'
import { archetypeFor, biasOf, brier, calibrationBuckets, judgmentScore, overconfidence, scoreQuiz } from './scoring'

describe('brier', () => {
  it('is 0 for perfect forecasts', () => {
    expect(brier([{ p: 1, outcome: 1 }, { p: 0, outcome: 0 }])).toBe(0)
  })
  it('is 0.25 for always-50%', () => {
    expect(brier([{ p: 0.5, outcome: 1 }, { p: 0.5, outcome: 0 }])).toBeCloseTo(0.25)
  })
  it('is 1 for confidently wrong', () => {
    expect(brier([{ p: 1, outcome: 0 }])).toBe(1)
  })
  it('handles partial outcomes', () => {
    expect(brier([{ p: 0.7, outcome: 0.5 }])).toBeCloseTo(0.04)
  })
  it('clamps p outside 0..1', () => {
    expect(brier([{ p: 1.4, outcome: 1 }])).toBe(0)
  })
  it('is NaN for no data', () => {
    expect(brier([])).toBeNaN()
  })
})

describe('judgmentScore', () => {
  it('maps brier to 0..100', () => {
    expect(judgmentScore(0)).toBe(100)
    expect(judgmentScore(0.25)).toBe(50)
    expect(judgmentScore(0.5)).toBe(0)
    expect(judgmentScore(1)).toBe(0)
    expect(judgmentScore(0.1)).toBe(80)
    expect(judgmentScore(NaN)).toBe(0)
  })
})

describe('calibrationBuckets', () => {
  const fc = [
    { p: 0.1, outcome: 0 },
    { p: 0.15, outcome: 1 },
    { p: 0.9, outcome: 1 },
    { p: 1, outcome: 1 },
    { p: 0.85, outcome: 0 },
  ]
  it('groups and omits empty buckets', () => {
    const b = calibrationBuckets(fc)
    expect(b).toHaveLength(2)
    expect(b[0]).toMatchObject({ lo: 0, hi: 0.2, n: 2, observed: 0.5 })
    expect(b[0].meanP).toBeCloseTo(0.125)
    expect(b[1]).toMatchObject({ lo: 0.8, hi: 1, n: 3 })
    expect(b[1].observed).toBeCloseTo(2 / 3)
  })
  it('includes the top edge in the last bucket and lower edge inclusive', () => {
    const b = calibrationBuckets([{ p: 0.6, outcome: 1 }, { p: 1, outcome: 0 }], [0.5, 0.6, 0.7, 1])
    expect(b.map((x) => [x.lo, x.n])).toEqual([[0.6, 1], [0.7, 1]])
  })
})

describe('overconfidence & bias', () => {
  it('computes gap in points', () => {
    expect(overconfidence([{ p: 0.9, outcome: 0 }, { p: 0.9, outcome: 1 }])).toBe(40)
    expect(overconfidence([{ p: 0.5, outcome: 1 }])).toBe(-50)
    expect(overconfidence([])).toBe(0)
  })
  it('classifies bias with tolerance', () => {
    expect(biasOf(10)).toBe('overconfident')
    expect(biasOf(-10)).toBe('underconfident')
    expect(biasOf(5)).toBe('calibrated')
  })
})

describe('archetypes & quiz', () => {
  it('picks archetypes', () => {
    expect(archetypeFor(0.9, 2, 85).key).toBe('oracle')
    expect(archetypeFor(0.6, 2, 60).key).toBe('navigator')
    expect(archetypeFor(0.8, 15, 60).key).toBe('hotshot')
    expect(archetypeFor(0.5, 30, 30).key).toBe('visionary')
    expect(archetypeFor(0.9, -20, 70).key).toBe('hidden')
    expect(archetypeFor(0.5, -10, 50).key).toBe('skeptic')
  })
  it('scores a full quiz', () => {
    const r = scoreQuiz([
      { questionId: 'a', correct: true, confidence: 0.9 },
      { questionId: 'b', correct: false, confidence: 0.6 },
    ])
    // brier = (0.01 + 0.36)/2 = 0.185 -> score 63
    expect(r.brier).toBeCloseTo(0.185)
    expect(r.score).toBe(63)
    expect(r.correct).toBe(1)
    expect(r.accuracy).toBe(0.5)
    expect(r.gap).toBe(25)
    expect(r.bias).toBe('overconfident')
  })
})
