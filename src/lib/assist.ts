import type { Bet, Settings } from './types'
import { addDays } from './text'

export type BetDraft = Pick<
  Bet,
  'title' | 'hypothesis' | 'metric' | 'baseline' | 'target' | 'probability' | 'killCriteria' | 'reviewDate' | 'cost' | 'tags'
> & { assumptions: string[]; source: 'heuristic' | 'llm' }

const METRICS: [RegExp, string][] = [
  [/\b(conversion|convert)/i, 'Conversion rate'],
  [/\b(retention|retain|churn)/i, 'Retention (churn rate)'],
  [/\bactivat/i, 'Activation rate'],
  [/\b(revenue|arr|mrr|arpu|monetiz|upsell|pricing)/i, 'Revenue / ARPU'],
  [/\b(nps|satisfaction|csat)/i, 'NPS / CSAT'],
  [/\b(dau|mau|wau|engagement|active users)/i, 'Weekly active users'],
  [/\b(sign ?ups?|registrations?|acquisition)/i, 'Sign-ups'],
  [/\b(support tickets?|tickets?|contact rate)/i, 'Support ticket volume'],
  [/\b(time to value|onboarding|time-to-value)/i, 'Time to first value'],
  [/\b(latency|performance|load time|speed)/i, 'p95 load time'],
  [/\b(adoption|usage|use the feature)/i, 'Feature adoption'],
]

const TAGS: [RegExp, string][] = [
  [/\bonboard/i, 'onboarding'],
  [/\b(ai|llm|gpt|agent|copilot)\b/i, 'ai'],
  [/\b(pricing|price|plan|tier|monetiz)/i, 'monetization'],
  [/\b(mobile|ios|android)\b/i, 'mobile'],
  [/\b(enterprise|sso|admin|audit)/i, 'enterprise'],
  [/\b(growth|viral|referral|invite)/i, 'growth'],
  [/\b(retention|churn)/i, 'retention'],
  [/\b(integration|api|webhook)/i, 'platform'],
]

function firstSentence(text: string): string {
  const line = text.trim().split(/\n/).find((l) => l.trim().length > 0) || ''
  const s = line.replace(/^[#*\-\s]+/, '').split(/(?<=[.!?])\s/)[0]
  return s.length > 80 ? s.slice(0, 77).trimEnd() + '…' : s
}

function parseCostWeeks(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(person[- ]?weeks?|weeks?|wks?|sprints?|months?|days?)/i)
  if (!m) return null
  const n = parseFloat(m[1])
  const u = m[2].toLowerCase()
  if (u.startsWith('sprint')) return n * 2
  if (u.startsWith('month')) return n * 4
  if (u.startsWith('day')) return Math.max(0.5, Math.round((n / 5) * 2) / 2)
  return n
}

/** Deterministic, offline structuring of a raw idea into a bet. */
export function heuristicAssist(raw: string, today = new Date()): BetDraft {
  const text = raw.trim()
  const title = firstSentence(text) || 'Untitled bet'
  const metric = METRICS.find(([re]) => re.test(text))?.[1] ?? 'Primary outcome metric (define me)'
  const pct = text.match(/([+-]?\d+(?:\.\d+)?)\s?(%|pp|percent|x)(?![a-z])/i)
  const dir = /\b(reduce|decrease|cut|lower|fewer|less)\b/i.test(text) || /churn|tickets|latency|load time/i.test(metric)
    ? 'decrease'
    : 'increase'
  const target = pct ? `${dir === 'decrease' ? '-' : '+'}${pct[1].replace(/^[+-]/, '')}${pct[2] === 'percent' ? '%' : pct[2]}` : dir === 'decrease' ? '-10%' : '+10%'
  const audience = text.match(/\bfor ((?:new |existing |our |free |paid |enterprise |mobile |power )?[a-z-]+(?: [a-z-]+)?)/i)?.[1]
  const cost = parseCostWeeks(text) ?? 4

  let p = 0.35
  const evidence = /(customers? (asked|requested|told)|interview|survey|data shows|experiment|a\/b|prototype tested|we saw|users? (asked|requested))/i
  const bigScope = /(rewrite|re-platform|replatform|redesign everything|from scratch|new platform|v2 of)/i
  if (evidence.test(text)) p += 0.1
  if (bigScope.test(text)) p -= 0.1
  if (cost > 12) p -= 0.05
  p = Math.round(Math.min(0.8, Math.max(0.15, p)) * 100) / 100

  const weeks = Math.max(2, Math.min(8, Math.ceil(cost) + 2))
  const reviewDate = addDays(today, weeks * 7)
  const lowerBar = pct ? `${Math.max(1, Math.round(parseFloat(pct[1].replace(/^[+-]/, '')) / 3))}${pct[2] === 'percent' ? '%' : pct[2]}` : '3%'

  const assumptions = text
    .split(/(?<=[.!?])\s+|\n/)
    .map((s) => s.trim())
    .filter((s) => /\b(assum|believe|think|should|will|expect|probably|likely|because)\b/i.test(s))
    .slice(0, 4)
  if (assumptions.length === 0) assumptions.push(`${audience ? audience[0].toUpperCase() + audience.slice(1) : 'Users'} have this problem often enough to change behaviour`)

  return {
    title,
    hypothesis: `We believe that “${title.replace(/[.…]$/, '')}”${audience ? ` for ${audience}` : ''} will ${dir} ${metric.toLowerCase()}. We will know we are right when ${metric.toLowerCase()} moves ${target} by ${reviewDate}.`,
    metric,
    baseline: '',
    target,
    probability: p,
    killCriteria: `Kill if ${metric.toLowerCase()} moves less than ${lowerBar} within ${Math.max(2, weeks - 2)} weeks of launch, or if cost exceeds ${Math.round(cost * 1.5 * 10) / 10} person-weeks.`,
    reviewDate,
    cost,
    tags: Array.from(new Set(TAGS.filter(([re]) => re.test(text)).map(([, t]) => t))),
    assumptions,
    source: 'heuristic',
  }
}

const SYSTEM = `You are a rigorous product strategist. Convert the user's raw idea or PRD into ONE falsifiable product bet.
Return ONLY JSON with keys: title (<=80 chars), hypothesis (We believe that ... will ... We will know we are right when ...), metric, baseline (string, may be ""), target (numeric, e.g. "+8%"), probability (0..1, be honest: most product bets fail; default 0.3-0.4 without evidence), killCriteria (concrete, measurable, time-bound), reviewDate (YYYY-MM-DD), cost (person-weeks number), tags (array of short lowercase strings), assumptions (array of up to 4 riskiest assumptions).`

/** Calls an OpenAI-compatible chat completions endpoint directly from the browser. */
export async function llmAssist(raw: string, s: Settings, today = new Date()): Promise<BetDraft> {
  const url = s.baseUrl.replace(/\/+$/, '') + '/chat/completions'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.apiKey}` },
    body: JSON.stringify({
      model: s.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM + `\nToday is ${today.toISOString().slice(0, 10)}.` },
        { role: 'user', content: raw.slice(0, 12000) },
      ],
    }),
  })
  if (!res.ok) throw new Error(`LLM request failed (${res.status})`)
  const data = await res.json()
  const content: string = data?.choices?.[0]?.message?.content ?? ''
  const json = JSON.parse(content.replace(/^```(json)?|```$/g, '').trim())
  const fb = heuristicAssist(raw, today)
  const num = (v: unknown, d: number) => (typeof v === 'number' && isFinite(v) ? v : parseFloat(String(v)) || d)
  return {
    title: String(json.title || fb.title).slice(0, 120),
    hypothesis: String(json.hypothesis || fb.hypothesis),
    metric: String(json.metric || fb.metric),
    baseline: String(json.baseline || ''),
    target: String(json.target || fb.target),
    probability: Math.min(0.99, Math.max(0.01, num(json.probability, fb.probability))),
    killCriteria: String(json.killCriteria || fb.killCriteria),
    reviewDate: /^\d{4}-\d{2}-\d{2}$/.test(String(json.reviewDate)) ? String(json.reviewDate) : fb.reviewDate,
    cost: num(json.cost, fb.cost),
    tags: Array.isArray(json.tags) ? json.tags.map(String).slice(0, 6) : fb.tags,
    assumptions: Array.isArray(json.assumptions) ? json.assumptions.map(String).slice(0, 4) : fb.assumptions,
    source: 'llm',
  }
}
