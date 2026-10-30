import { t } from './i18n'
/** Compact, URL-safe encoding of small JSON payloads for share links (no backend). */
export function encodeShare(obj: unknown): string {
  const json = JSON.stringify(obj)
  const bytes = new TextEncoder().encode(json)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeShare<T>(s: string): T | null {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as T
  } catch {
    return null
  }
}

export function appUrl(hashPath: string): string {
  if (typeof window === 'undefined') return hashPath
  const { origin, pathname } = window.location
  return `${origin}${pathname}#${hashPath}`
}

export const xShareUrl = (text: string, url: string) =>
  `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

export const linkedInShareUrl = (text: string, url: string) =>
  `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${text} ${url}`)}`

/** Quiz result in a share link. `sd`/`cat` let a friend replay the exact same questions. */
export interface SharePayload {
  s: number // score
  a: number // accuracy %
  g: number // gap pts
  k: string // archetype key
  c: number // correct
  t: number // total
  n?: string // name
  sd?: number // round seed
  cat?: string // category filter
}

/** A challenge: beat this score on the same questions. */
export interface ChallengePayload {
  s: number
  k: string
  sd: number
  n?: string
  cat?: string
  t?: number
}

export const toChallenge = (p: SharePayload): ChallengePayload | null =>
  typeof p.sd === 'number' ? { s: p.s, k: p.k, sd: p.sd, t: p.t, ...(p.n ? { n: p.n } : {}), ...(p.cat ? { cat: p.cat } : {}) } : null

export function decodeChallenge(s: string | null | undefined): ChallengePayload | null {
  if (!s) return null
  const c = decodeShare<ChallengePayload>(s)
  return c && typeof c.s === 'number' && typeof c.sd === 'number' && typeof c.k === 'string' ? c : null
}

/** Short, memorable share copy. */
export function shareText(p: { s: number; emoji: string; name: string }, vs?: { n?: string; s: number }): string {
  if (vs) {
    const who = vs.n || t('my colleague')
    return p.s > vs.s
      ? t('Beat {who} on the PM Judgment Score: {s} vs {v} {e}. Your turn:', { who, s: p.s, v: vs.s, e: p.emoji })
      : p.s === vs.s
        ? t('Tied {who} on the PM Judgment Score at {s} {e}. Break the tie:', { who, s: p.s, e: p.emoji })
        : t('{who} beat me on the PM Judgment Score ({v} vs {s}). Can you?', { who, s: p.s, v: vs.s })
  }
  return t('My PM Judgment Score: {s}/100 {e} {name}. Beat me in 3 minutes:', { s: p.s, e: p.emoji, name: p.name })
}
