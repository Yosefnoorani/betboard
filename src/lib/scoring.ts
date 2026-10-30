/** Core scoring math for BetBoard. Pure functions, fully unit-tested. */

export interface Forecast {
  /** Stated probability that the outcome is true / the bet hits, 0..1 */
  p: number
  /** Realised outcome: 1 = hit, 0 = miss, 0.5 = partial */
  outcome: number
}

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/** Mean Brier score: mean((p - o)^2). 0 is perfect, 0.25 = always saying 50%, 1 is worst. */
export function brier(forecasts: Forecast[]): number {
  if (forecasts.length === 0) return NaN
  const sum = forecasts.reduce((acc, f) => acc + (clamp(f.p, 0, 1) - f.outcome) ** 2, 0)
  return sum / forecasts.length
}

/**
 * Judgment Score 0..100 from a Brier score.
 * 100 = perfect, 50 = coin-flip (always 50%), 0 = Brier 0.5 or worse.
 */
export function judgmentScore(b: number): number {
  if (Number.isNaN(b)) return 0
  return Math.round(clamp(100 * (1 - 2 * b), 0, 100))
}

export interface Bucket {
  lo: number
  hi: number
  /** Mean forecast probability inside the bucket */
  meanP: number
  /** Observed frequency (mean outcome) */
  observed: number
  n: number
}

/**
 * Group forecasts into probability buckets for a calibration curve.
 * `edges` are bucket boundaries in 0..1 (inclusive lower, exclusive upper; the
 * last bucket includes its upper bound). Empty buckets are omitted.
 */
export function calibrationBuckets(forecasts: Forecast[], edges: number[] = [0, 0.2, 0.4, 0.6, 0.8, 1]): Bucket[] {
  const out: Bucket[] = []
  for (let i = 0; i < edges.length - 1; i++) {
    const lo = edges[i]
    const hi = edges[i + 1]
    const last = i === edges.length - 2
    const inB = forecasts.filter((f) => f.p >= lo && (last ? f.p <= hi : f.p < hi))
    if (inB.length === 0) continue
    out.push({
      lo,
      hi,
      n: inB.length,
      meanP: inB.reduce((a, f) => a + f.p, 0) / inB.length,
      observed: inB.reduce((a, f) => a + f.outcome, 0) / inB.length,
    })
  }
  return out
}

/** Mean confidence minus accuracy, in percentage points. >0 overconfident, <0 underconfident. */
export function overconfidence(forecasts: Forecast[]): number {
  if (forecasts.length === 0) return 0
  const meanP = forecasts.reduce((a, f) => a + f.p, 0) / forecasts.length
  const acc = forecasts.reduce((a, f) => a + f.outcome, 0) / forecasts.length
  return Math.round((meanP - acc) * 1000) / 10
}

export type Bias = 'overconfident' | 'underconfident' | 'calibrated'
export function biasOf(gapPts: number, tolerance = 7): Bias {
  if (gapPts > tolerance) return 'overconfident'
  if (gapPts < -tolerance) return 'underconfident'
  return 'calibrated'
}

// ---------- Quiz specifics ----------

export interface QuizAnswer {
  questionId: string
  /** true if the chosen option was correct */
  correct: boolean
  /** confidence in the chosen option, 0.5..1 */
  confidence: number
}

/** Convert a quiz answer into a forecast on "my chosen answer is right". */
export const answerToForecast = (a: QuizAnswer): Forecast => ({
  p: clamp(a.confidence, 0.5, 1),
  outcome: a.correct ? 1 : 0,
})

export interface Archetype {
  key: string
  name: string
  emoji: string
  tagline: string
  description: string
}

export const ARCHETYPES: Record<string, Archetype> = {
  oracle: {
    key: 'oracle',
    name: 'The Oracle',
    emoji: '🔮',
    tagline: 'Knows a lot and knows exactly how much.',
    description: 'You are accurate and well calibrated. When you say 80%, you are right about 80% of the time. Stakeholders can treat your forecasts as real probabilities.',
  },
  navigator: {
    key: 'navigator',
    name: 'The Honest Navigator',
    emoji: '🧭',
    tagline: 'Not always right, but honest about it.',
    description: 'Your confidence matches your hit rate. That is rarer and more valuable than raw knowledge, because it means your roadmap bets carry honest risk estimates.',
  },
  hotshot: {
    key: 'hotshot',
    name: 'The Hotshot',
    emoji: '🚀',
    tagline: 'Sharp instincts, a little too sure.',
    description: 'You know your stuff, but your confidence runs ahead of your accuracy. You probably push some bets harder than the evidence supports. Add kill criteria before you commit.',
  },
  visionary: {
    key: 'visionary',
    name: 'The Bold Visionary',
    emoji: '⚡',
    tagline: 'All conviction, needs more evidence.',
    description: 'You commit hard, but many of your high-confidence calls missed. Conviction rallies teams, but uncalibrated conviction fills roadmaps with features nobody needed.',
  },
  hidden: {
    key: 'hidden',
    name: 'The Hidden Expert',
    emoji: '🦉',
    tagline: 'Knows more than they claim.',
    description: 'You were right more often than you expected. Underconfidence makes you hedge on calls you should defend, and weaker ideas fill the gap. Speak up sooner.',
  },
  skeptic: {
    key: 'skeptic',
    name: 'The Careful Skeptic',
    emoji: '🧪',
    tagline: 'Doubts everything, including the right answers.',
    description: 'You hedge a lot, which keeps you safe from big mistakes but can also stop you from committing. Test small and often to turn doubt into evidence.',
  },
}

export function archetypeFor(accuracy: number, gapPts: number, score: number): Archetype {
  const bias = biasOf(gapPts)
  if (bias === 'calibrated') return score >= 75 && accuracy >= 0.8 ? ARCHETYPES.oracle : ARCHETYPES.navigator
  if (bias === 'overconfident') return accuracy >= 0.7 ? ARCHETYPES.hotshot : ARCHETYPES.visionary
  return accuracy >= 0.7 ? ARCHETYPES.hidden : ARCHETYPES.skeptic
}

export interface QuizResult {
  score: number
  brier: number
  accuracy: number
  meanConfidence: number
  gap: number
  bias: Bias
  archetype: Archetype
  total: number
  correct: number
  /** Brier-based percentile-free label */
  label: string
}

export function scoreLabel(score: number): string {
  if (score >= 85) return 'Superforecaster territory'
  if (score >= 72) return 'Sharp'
  if (score >= 60) return 'Solid'
  if (score >= 50) return 'Coin-flip zone'
  return 'Overconfidence tax'
}

export function scoreQuiz(answers: QuizAnswer[]): QuizResult {
  const fc = answers.map(answerToForecast)
  const b = brier(fc)
  const score = judgmentScore(b)
  const correct = answers.filter((a) => a.correct).length
  const accuracy = answers.length ? correct / answers.length : 0
  const meanConfidence = answers.length ? fc.reduce((a, f) => a + f.p, 0) / fc.length : 0
  const gap = overconfidence(fc)
  return {
    score,
    brier: b,
    accuracy,
    meanConfidence,
    gap,
    bias: biasOf(gap),
    archetype: archetypeFor(accuracy, gap, score),
    total: answers.length,
    correct,
    label: scoreLabel(score),
  }
}
