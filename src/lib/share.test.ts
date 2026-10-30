import { describe, expect, it } from 'vitest'
import { decodeChallenge, encodeShare, linkedInShareUrl, shareText, toChallenge, xShareUrl, type SharePayload } from './share'

const base: SharePayload = { s: 72, a: 80, g: 6, k: 'calibrated', c: 12, t: 15, n: 'Dana', sd: 12345 }

describe('challenge links', () => {
  it('round-trips a challenge built from a result', () => {
    const c = toChallenge(base)!
    expect(c).toEqual({ s: 72, k: 'calibrated', sd: 12345, t: 15, n: 'Dana' })
    expect(decodeChallenge(encodeShare(c))).toEqual(c)
  })
  it('needs a seed so the friend gets the same questions', () => {
    expect(toChallenge({ ...base, sd: undefined })).toBeNull()
  })
  it('rejects junk and malformed payloads', () => {
    expect(decodeChallenge(null)).toBeNull()
    expect(decodeChallenge('%%%')).toBeNull()
    expect(decodeChallenge(encodeShare({ s: 'x', sd: 1, k: 'a' }))).toBeNull()
    expect(decodeChallenge(encodeShare({ s: 50, k: 'a' }))).toBeNull()
  })
  it('keeps non-ASCII names intact', () => {
    const c = toChallenge({ ...base, n: 'דנה 🚀' })!
    expect(decodeChallenge(encodeShare(c))?.n).toBe('דנה 🚀')
  })
})

describe('share text', () => {
  const me = { s: 72, emoji: '🎯', name: 'Calibrated Captain' }
  it('is short and includes the score', () => {
    const txt = shareText(me)
    expect(txt).toContain('72/100')
    expect(txt.length).toBeLessThan(120)
  })
  it('handles win, tie and loss against a challenger', () => {
    expect(shareText(me, { n: 'Avi', s: 60 })).toMatch(/^Beat Avi.*72 vs 60/)
    expect(shareText(me, { n: 'Avi', s: 72 })).toMatch(/^Tied Avi/)
    expect(shareText(me, { s: 90 })).toMatch(/^my colleague beat me.*90 vs 72/)
  })
  it('builds encoded social URLs', () => {
    expect(xShareUrl('a b', 'https://x.y/#/s/1')).toBe('https://x.com/intent/post?text=a%20b&url=https%3A%2F%2Fx.y%2F%23%2Fs%2F1')
    expect(linkedInShareUrl('hi', 'u')).toContain('text=hi%20u')
  })
})
