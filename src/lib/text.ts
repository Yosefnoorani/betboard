const STOP = new Set(
  'the a an and or but for nor so yet to of in on at by with from into onto over under about as is are was were be been being this that these those it its we our us you your they their them i my me not no do does did have has had will would should could can may might must than then there here what which who whom whose when where why how all any each every more most less least very just also only own same such too out up down off again further once both few other some'.split(' '),
)

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

/** crude stemmer: good enough for keyword overlap */
export function stem(w: string): string {
  return w.replace(/(ingly|edly|ing|ed|es|s|ly|ment|ers|er|ion|ions)$/,'').slice(0, 8)
}

export function keywordsOf(text: string, explicit = ''): string[] {
  const exp = explicit
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean)
  if (exp.length) return exp
  return Array.from(new Set(tokenize(text).filter((w) => w.length > 3)))
}

/** does `haystack` mention keyword (phrase or stemmed word)? */
export function mentions(haystack: string, keyword: string): boolean {
  const h = haystack.toLowerCase()
  const k = keyword.toLowerCase().trim()
  if (!k) return false
  if (k.includes(' ')) return h.includes(k)
  const hs = new Set(tokenize(h).map(stem))
  return hs.has(stem(k))
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export function addDays(d: Date, days: number): string {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x.toISOString().slice(0, 10)
}

export const todayISO = () => new Date().toISOString().slice(0, 10)
