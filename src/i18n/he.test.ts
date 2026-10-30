import { describe, expect, it } from 'vitest'
import { QUESTIONS } from '../data/quiz'
import { ARCHETYPES } from '../lib/scoring'
import { HE } from './he'
import { QUIZ_HE } from './quiz.he'

const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',')

const SOURCES = import.meta.glob(['../**/*.ts', '../**/*.tsx', '!../**/*.test.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>

/** Every string literal passed directly as the first argument of t(...). */
function literalKeys(): string[] {
  const out = new Set<string>()
  const re = /\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1/g
  for (const src of Object.values(SOURCES)) {
    for (const m of src.matchAll(re)) out.add(m[2].replace(/\\(['"\\])/g, '$1'))
  }
  return [...out]
}

describe('Hebrew translations', () => {
  it('covers every literal t() key', () => {
    const keys = literalKeys()
    expect(keys.length).toBeGreaterThan(300)
    expect(keys.filter((k) => !(k in HE))).toEqual([])
  })
  it('covers archetype text', () => {
    const missing = Object.values(ARCHETYPES).flatMap((a) => [a.name, a.tagline, a.description].filter((s) => s && !(s in HE)))
    expect(missing).toEqual([])
  })
  it('covers dynamic status and outcome labels', () => {
    expect(['all', 'open', 'resolved', 'killed', 'hit', 'miss', 'partial'].filter((k) => !(k in HE))).toEqual([])
  })
  it('keeps placeholders intact', () => {
    expect(Object.entries(HE).filter(([en, he]) => ph(en) !== ph(he))).toEqual([])
  })
  it('translates every quiz question', () => {
    expect(QUESTIONS.filter((q) => !QUIZ_HE[q.id]).map((q) => q.id)).toEqual([])
    for (const q of QUESTIONS) expect(QUIZ_HE[q.id].options).toHaveLength(2)
  })
})
