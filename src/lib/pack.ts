import type { QuizCategory, QuizQuestion } from '../data/quiz'

/** ISO-8601 week number and week-year (weeks start Monday; week 1 contains Jan 4). */
export function isoWeek(date: Date = new Date()): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { year: d.getUTCFullYear(), week }
}

/** Seed for "this week's pack": same questions for everyone in the same ISO week. */
export const weekSeed = (date: Date = new Date()) => {
  const { year, week } = isoWeek(date)
  return year * 100 + week
}

export const seedLabel = (seed: number) => (seed > 200000 && seed < 300000 ? { year: Math.floor(seed / 100), week: seed % 100 } : null)

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededShuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface RoundSpec {
  seed: number
  cat?: QuizCategory
}

export interface RoundItem {
  q: QuizQuestion
  /** display order: indices into q.options */
  order: [number, number]
}

export const CATEGORIES: QuizCategory[] = ['pivots', 'launches', 'metrics', 'ai']

/**
 * Deterministic round from a seed. With no category, questions are drawn
 * round-robin across categories so every pack is a balanced mix.
 */
export function buildRound(questions: readonly QuizQuestion[], spec: RoundSpec, n: number): RoundItem[] {
  const rand = rng(spec.seed)
  let picked: QuizQuestion[]
  if (spec.cat) {
    picked = seededShuffle(questions.filter((q) => q.category === spec.cat), rand).slice(0, n)
  } else {
    const lists = CATEGORIES.map((c) => seededShuffle(questions.filter((q) => q.category === c), rand))
    const start = Math.floor(rand() * lists.length)
    picked = []
    for (let k = 0; picked.length < n && k < questions.length * 2; k++) {
      const l = lists[(start + k) % lists.length]
      const q = l.shift()
      if (q) picked.push(q)
      if (lists.every((x) => x.length === 0)) break
    }
    picked = seededShuffle(picked, rand)
  }
  return picked.map((q) => ({ q, order: rand() < 0.5 ? [0, 1] : [1, 0] }))
}

export const randomSeed = () => Math.floor(Math.random() * 1_000_000_000) + 1_000_000
