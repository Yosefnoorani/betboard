export type BetStatus = 'open' | 'resolved' | 'killed'
export type BetOutcome = 'hit' | 'miss' | 'partial'

export interface Bet {
  id: string
  title: string
  hypothesis: string
  metric: string
  baseline: string
  target: string
  /** probability of success 0..1 */
  probability: number
  killCriteria: string
  /** ISO yyyy-mm-dd */
  reviewDate: string
  /** estimated cost in person-weeks */
  cost: number
  owner: string
  tags: string[]
  status: BetStatus
  outcome?: BetOutcome
  resolvedAt?: string
  /** for killed bets: person-weeks not spent thanks to killing early */
  savedWeeks?: number
  learnings: string
  createdAt: string
}

export type PrincipleKind = 'goal' | 'principle' | 'nongoal'

export interface Principle {
  id: string
  kind: PrincipleKind
  text: string
  /** comma-separated keywords; if empty, keywords are derived from text */
  keywords: string
  /** 1..5 */
  weight: number
}

export interface Constitution {
  company: string
  northStar: string
  principles: Principle[]
  /** max number of concurrently open bets before "feature overload" */
  capacity: number
  /** max total person-weeks of open bets */
  capacityWeeks: number
}

export interface Settings {
  apiKey: string
  baseUrl: string
  model: string
  /** fully-loaded cost per person-week, used for "saved" estimates */
  weeklyCost: number
  currency: string
  displayName: string
}

export interface QuizRecord {
  at: string
  score: number
  accuracy: number
  gap: number
  archetype: string
}

export interface AppData {
  version: 1
  bets: Bet[]
  constitution: Constitution
  settings: Settings
  quizHistory: QuizRecord[]
  waitlist: { email: string; plan: string; at: string }[]
  isDemo: boolean
}
