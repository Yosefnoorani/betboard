import type { Bet } from './types'
import { addDays, todayISO, uid } from './text'

export function blankBet(): Bet {
  return {
    id: uid(),
    title: '',
    hypothesis: '',
    metric: '',
    baseline: '',
    target: '',
    probability: 0.4,
    killCriteria: '',
    reviewDate: addDays(new Date(), 42),
    cost: 4,
    owner: '',
    tags: [],
    status: 'open',
    learnings: '',
    createdAt: todayISO(),
  }
}
