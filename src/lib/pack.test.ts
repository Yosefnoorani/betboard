import { describe, expect, it } from 'vitest'
import { QUESTIONS, QUIZ_LENGTH } from '../data/quiz'
import { buildRound, CATEGORIES, isoWeek, weekSeed } from './pack'

describe('quiz bank', () => {
  it('has 50+ questions with unique ids, valid categories and sources', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(50)
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length)
    for (const q of QUESTIONS) {
      expect(CATEGORIES).toContain(q.category)
      expect(q.options[0]).not.toBe(q.options[1])
      expect(q.source.url).toMatch(/^https:\/\//)
      expect(q.source.quote.length).toBeGreaterThan(20)
    }
  })
  it('has enough questions per category for a full pack', () => {
    for (const c of CATEGORIES) expect(QUESTIONS.filter((q) => q.category === c).length).toBeGreaterThanOrEqual(QUIZ_LENGTH)
  })
})

describe('weekly pack', () => {
  it('computes ISO weeks', () => {
    expect(isoWeek(new Date(2026, 9, 30))).toEqual({ year: 2026, week: 44 })
    expect(isoWeek(new Date(2021, 0, 1))).toEqual({ year: 2020, week: 53 })
    expect(isoWeek(new Date(2024, 11, 30))).toEqual({ year: 2025, week: 1 })
  })
  it('is deterministic within a week and differs across weeks', () => {
    const a = buildRound(QUESTIONS, { seed: weekSeed(new Date(2026, 9, 26)) }, QUIZ_LENGTH)
    const b = buildRound(QUESTIONS, { seed: weekSeed(new Date(2026, 10, 1)) }, QUIZ_LENGTH)
    const c = buildRound(QUESTIONS, { seed: weekSeed(new Date(2026, 10, 2)) }, QUIZ_LENGTH)
    expect(a.map((x) => x.q.id)).toEqual(b.map((x) => x.q.id))
    expect(a.map((x) => x.q.id)).not.toEqual(c.map((x) => x.q.id))
    expect(a).toHaveLength(QUIZ_LENGTH)
    expect(new Set(a.map((x) => x.q.id)).size).toBe(QUIZ_LENGTH)
  })
  it('mixes categories in the default pack and filters by category', () => {
    const a = buildRound(QUESTIONS, { seed: 202644 }, QUIZ_LENGTH)
    expect(new Set(a.map((x) => x.q.category)).size).toBe(4)
    const ai = buildRound(QUESTIONS, { seed: 7, cat: 'ai' }, QUIZ_LENGTH)
    expect(ai.every((x) => x.q.category === 'ai')).toBe(true)
  })
})
