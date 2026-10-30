import { useSyncExternalStore } from 'react'
import { HE } from '../i18n/he'

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

export const getLang = () => lang
export function setLang(l: Lang) {
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
  const s = lang === 'he' ? (HE[en] ?? en) : en
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s
}

/** Locale for Intl formatting. */
export const locale = () => (lang === 'he' ? 'he-IL' : 'en-US')
