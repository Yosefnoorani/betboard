import { t } from './i18n'
import { useSyncExternalStore } from 'react'
import type { AppData } from './types'
import { DEFAULT_SETTINGS, EMPTY_CONSTITUTION, demoData } from './demo'

const KEY = 'betboard:v1'
let state: AppData = load()
const listeners = new Set<() => void>()

function load(): AppData {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null
    if (raw) return normalize(JSON.parse(raw))
  } catch {
    /* corrupted storage falls through to demo */
  }
  return demoData()
}

export function normalize(d: Partial<AppData>): AppData {
  return {
    version: 1,
    bets: Array.isArray(d.bets) ? d.bets : [],
    constitution: { ...EMPTY_CONSTITUTION, ...(d.constitution || {}) },
    settings: { ...DEFAULT_SETTINGS, ...(d.settings || {}) },
    quizHistory: Array.isArray(d.quizHistory) ? d.quizHistory : [],
    waitlist: Array.isArray(d.waitlist) ? d.waitlist : [],
    isDemo: Boolean(d.isDemo),
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or unavailable: keep in memory */
  }
}

export function setData(updater: (d: AppData) => AppData) {
  state = updater(state)
  persist()
  listeners.forEach((l) => l())
}

export const getData = () => state

export function useData(): AppData {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

export function resetToDemo() {
  const keep = state
  setData(() => ({ ...demoData(), waitlist: keep.waitlist, quizHistory: keep.quizHistory }))
}

export function startFresh() {
  setData((d) => ({ ...d, bets: [], constitution: { ...EMPTY_CONSTITUTION }, isDemo: false, settings: { ...d.settings, displayName: d.settings.displayName === 'Demo PM' ? '' : d.settings.displayName } }))
}

export function exportJSON(): string {
  return JSON.stringify(state, null, 2)
}

export function importJSON(text: string) {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.bets)) throw new Error(t('Not a BetBoard export file'))
  setData(() => normalize({ ...parsed, isDemo: false }))
}

export function download(filename: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
