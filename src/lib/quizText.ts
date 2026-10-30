import type { QuizQuestion } from '../data/quiz'
import { QUIZ_HE } from '../i18n/quiz.he'
import { getLang } from './i18n'

/** Localised view of a quiz question. Sources and quotes stay in their original language. */
export function lq(q: QuizQuestion): QuizQuestion {
  if (getLang() !== 'he') return q
  const h = QUIZ_HE[q.id]
  return h ? { ...q, prompt: h.prompt, options: h.options, explanation: h.explanation, lesson: h.lesson } : q
}
