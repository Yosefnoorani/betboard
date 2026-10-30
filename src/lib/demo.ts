import type { AppData, Bet, Constitution, Settings } from './types'
import { addDays } from './text'

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  weeklyCost: 4000,
  currency: 'USD',
  displayName: '',
}

export const EMPTY_CONSTITUTION: Constitution = {
  company: '',
  northStar: '',
  principles: [],
  capacity: 5,
  capacityWeeks: 30,
}

export function demoConstitution(): Constitution {
  return {
    company: 'Northwind Analytics (demo)',
    northStar: 'Weekly active teams that share at least one dashboard',
    capacity: 6,
    capacityWeeks: 36,
    principles: [
      { id: 'g1', kind: 'goal', text: 'Increase new-team activation in the first 7 days', keywords: 'activation, onboarding, first week, time to value', weight: 5 },
      { id: 'g2', kind: 'goal', text: 'Reduce mid-market churn', keywords: 'churn, retention, renewal', weight: 4 },
      { id: 'g3', kind: 'goal', text: 'Grow expansion revenue through collaboration', keywords: 'sharing, invite, collaboration, seats, expansion', weight: 3 },
      { id: 'p1', kind: 'principle', text: 'Self-serve before sales-assisted', keywords: 'self-serve, in-product', weight: 2 },
      { id: 'p2', kind: 'principle', text: 'AI features must save measurable user time', keywords: 'ai, assistant, copilot', weight: 2 },
      { id: 'n1', kind: 'nongoal', text: 'No custom one-off work for single enterprise customers', keywords: 'custom, one-off, bespoke, single customer', weight: 4 },
      { id: 'n2', kind: 'nongoal', text: 'Not building a general BI / SQL editor', keywords: 'sql editor, bi tool, query builder', weight: 3 },
    ],
  }
}

export function demoBets(now = new Date()): Bet[] {
  const d = (days: number) => addDays(now, days)
  const mk = (b: Partial<Bet> & Pick<Bet, 'id' | 'title' | 'probability' | 'status'>): Bet => ({
    hypothesis: '',
    metric: '',
    baseline: '',
    target: '',
    killCriteria: '',
    reviewDate: d(30),
    cost: 4,
    owner: 'Demo PM',
    tags: [],
    learnings: '',
    createdAt: d(-120),
    ...b,
  })
  return [
    mk({ id: 'd1', title: 'Guided onboarding checklist', probability: 0.7, status: 'resolved', outcome: 'hit', metric: '7-day team activation', baseline: '31%', target: '+5pp', cost: 3, tags: ['onboarding'], hypothesis: 'A 5-step checklist will increase 7-day activation for new teams. We will know when activation rises 5pp.', killCriteria: 'Kill if lift < 1pp after 4 weeks', reviewDate: d(-60), resolvedAt: d(-58), createdAt: d(-110), learnings: 'Lift +6.2pp. Step 3 (invite a teammate) drove most of it.' }),
    mk({ id: 'd2', title: 'AI summary of weekly dashboard changes', probability: 0.6, status: 'resolved', outcome: 'partial', metric: 'Weekly active teams', target: '+4%', cost: 5, tags: ['ai'], hypothesis: 'An AI-written weekly digest will bring teams back weekly.', killCriteria: 'Kill if open rate < 20% after 3 sends', reviewDate: d(-45), resolvedAt: d(-44), learnings: 'Open rate great, WAT only +1.5%.' }),
    mk({ id: 'd3', title: 'Annual-plan discount banner', probability: 0.4, status: 'resolved', outcome: 'miss', metric: 'Annual plan mix', target: '+10%', cost: 1, tags: ['monetization'], hypothesis: 'A banner will shift monthly customers to annual.', killCriteria: 'Kill if < 2% shift in 3 weeks', reviewDate: d(-80), resolvedAt: d(-79), learnings: 'No movement; price wasn’t the blocker.' }),
    mk({ id: 'd4', title: 'Slack alerts for metric anomalies', probability: 0.75, status: 'resolved', outcome: 'hit', metric: '30-day retention', target: '+3pp', cost: 4, tags: ['retention'], hypothesis: 'Anomaly alerts in Slack reduce churn for mid-market teams.', killCriteria: 'Kill if < 15% of teams enable alerts', reviewDate: d(-30), resolvedAt: d(-28) }),
    mk({ id: 'd5', title: 'Custom PDF export for one enterprise logo', probability: 0.2, status: 'killed', savedWeeks: 5, metric: 'Deal closed', target: '1 deal', cost: 6, tags: ['enterprise'], hypothesis: 'A bespoke PDF format closes a single customer deal.', killCriteria: 'Kill if violates non-goal or deal stalls 2 weeks', reviewDate: d(-50), resolvedAt: d(-70), learnings: 'Killed after constitution check: one-off work.' }),
    mk({ id: 'd6', title: 'Team templates gallery', probability: 0.55, status: 'resolved', outcome: 'hit', metric: 'Dashboards shared per team', target: '+15%', cost: 4, tags: ['collaboration'], hypothesis: 'Templates make sharing a first-week habit.', killCriteria: 'Kill if < 10% of new teams use a template', reviewDate: d(-20), resolvedAt: d(-18) }),
    mk({ id: 'd7', title: 'Usage-based pricing pilot', probability: 0.3, status: 'resolved', outcome: 'miss', metric: 'Expansion revenue', target: '+8%', cost: 8, tags: ['monetization'], hypothesis: 'Usage pricing grows expansion revenue in mid-market.', killCriteria: 'Kill if NRR drops > 2pp', reviewDate: d(-15), resolvedAt: d(-12) }),
    mk({ id: 'd8', title: 'Mobile read-only dashboards', probability: 0.5, status: 'resolved', outcome: 'hit', metric: 'Weekly active teams', target: '+3%', cost: 6, tags: ['mobile'], reviewDate: d(-10), resolvedAt: d(-9), hypothesis: 'Execs on mobile keep teams engaged.', killCriteria: 'Kill if < 5% WAU on mobile after 6 weeks' }),
    mk({ id: 'd9', title: 'Drag-and-drop SQL query builder', probability: 0.35, status: 'killed', savedWeeks: 9, metric: 'Activation', target: '+4pp', cost: 12, tags: ['platform'], hypothesis: 'A query builder helps analysts activate faster.', killCriteria: 'Kill if prototype test < 3/5 success', reviewDate: d(-40), resolvedAt: d(-90), learnings: 'Killed: conflicts with “not a BI tool” non-goal.' }),
    mk({ id: 'd10', title: 'Invite teammates from empty state', probability: 0.65, status: 'open', metric: 'Invites per new team', baseline: '0.8', target: '+30%', cost: 2, tags: ['growth', 'onboarding'], hypothesis: 'Prompting invites in empty states increases collaboration and activation.', killCriteria: 'Kill if invites/team rise < 10% after 3 weeks', reviewDate: d(-2), createdAt: d(-25) }),
    mk({ id: 'd11', title: 'AI “explain this chart” assistant', probability: 0.45, status: 'open', metric: 'Time to first insight', target: '-20%', cost: 6, tags: ['ai'], hypothesis: 'An in-product AI assistant saves users time understanding charts.', killCriteria: 'Kill if < 10% weekly usage among activated teams by review', reviewDate: d(21), createdAt: d(-14) }),
    mk({ id: 'd12', title: 'Renewal health score for CSMs', probability: 0.5, status: 'open', metric: 'Mid-market churn', target: '-1.5pp', cost: 5, tags: ['retention'], hypothesis: 'A health score lets CSMs save at-risk renewals and reduce churn.', killCriteria: 'Kill if CSMs ignore > 70% of alerts after 4 weeks', reviewDate: d(35), createdAt: d(-7) }),
    mk({ id: 'd13', title: 'Dark mode', probability: 0.9, status: 'open', metric: '', target: '', cost: 3, tags: [], hypothesis: 'Users want dark mode.', killCriteria: '', reviewDate: '', createdAt: d(-3) }),
    mk({ id: 'd14', title: 'Bespoke SSO integration for one customer', probability: 0.6, status: 'open', metric: 'Deal closed', target: '1 deal', cost: 7, tags: ['enterprise'], hypothesis: 'A custom one-off SSO integration closes a single customer.', killCriteria: 'Kill if deal not signed in 6 weeks', reviewDate: d(42), createdAt: d(-1) }),
  ]
}

export function demoData(): AppData {
  return {
    version: 1,
    bets: demoBets(),
    constitution: demoConstitution(),
    settings: { ...DEFAULT_SETTINGS, displayName: 'Demo PM' },
    quizHistory: [],
    waitlist: [],
    isDemo: true,
  }
}
