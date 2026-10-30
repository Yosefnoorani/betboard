import type { QuizQuestion } from '../data/quiz'
import { quizHe } from './i18n'

/** Localised view of a quiz question. Sources and quotes stay in their original language. */
export function lq(q: QuizQuestion): QuizQuestion {
  const h = quizHe()?.[q.id]
  return h ? { ...q, prompt: h.prompt, options: h.options, explanation: h.explanation, lesson: h.lesson } : q
}
