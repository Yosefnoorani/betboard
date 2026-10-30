import { useSyncExternalStore } from 'react'
import type { QuizHe } from '../i18n/quiz.he'

export type Lang = 'en' | 'he'
const KEY = 'betboard:lang'

function initial(): Lang {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'he' || v === 'en') return v
  } catch {
    /* no storage */
  }
  return 'en'
}

let lang: Lang = typeof window === 'undefined' ? 'en' : initial()
const subs = new Set<() => void>()

function apply() {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
}
apply()

// Hebrew dictionaries are code-split so English visitors never download them.
let dict: Record<string, string> | null = null
let quizDict: Record<string, QuizHe> | null = null
async function loadHe() {
  if (dict) return
  const [ui, quiz] = await Promise.all([import('../i18n/he'), import('../i18n/quiz.he')])
  dict = ui.HE
  quizDict = quiz.QUIZ_HE
}
/** Call before the first render so a saved Hebrew preference renders without an English flash. */
export async function initLang() {
  if (lang !== 'he') return
  try {
    await loadHe()
  } catch (e) {
    console.error('BetBoard: could not load Hebrew', e)
    lang = 'en'
    apply()
  }
}
export const quizHe = () => (lang === 'he' ? quizDict : null)

export const getLang = () => lang
export async function setLang(l: Lang) {
  if (l === 'he') await loadHe()
  lang = l
  try {
    localStorage.setItem(KEY, l)
  } catch {
    /* ignore */
  }
  apply()
  subs.forEach((f) => f())
}
export function useLang(): Lang {
  return useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    () => lang,
    () => 'en',
  )
}

/**
 * Translate an English UI string. The English text is the key, so English is
 * always the fallback. `{name}` placeholders are filled from `vars`.
 */
export function t(en: string, vars?: Record<string, string | number>): string {
  const s = lang === 'he' ? (dict?.[en] ?? en) : en
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s
}

/** Locale for Intl formatting. */
export const locale = () => (lang === 'he' ? 'he-IL' : 'en-US')
