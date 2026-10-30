/**
 * Verifies every quiz question's supporting quote against the cited Wikipedia
 * article (plain-text extract). Run: node scripts/verify-quiz.ts
 * Fetches from the Wikipedia API; caches in /tmp/betboard-facts.
 */
import { QUESTIONS } from '../src/data/quiz.ts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const CACHE = '/tmp/betboard-facts'
mkdirSync(CACHE, { recursive: true })
const norm = (s: string) =>
  s.toLowerCase().replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim()

async function extract(title: string): Promise<string> {
  const f = `${CACHE}/${encodeURIComponent(title)}.txt`
  if (existsSync(f)) return readFileSync(f, 'utf8')
  const local = `${process.env.FACTS_DIR ?? '/workspace/facts'}/${title}.txt`
  if (existsSync(local)) return readFileSync(local, 'utf8')
  await new Promise((r) => setTimeout(r, 1500))
  const u = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${encodeURIComponent(title)}`
  const r = await fetch(u, { headers: { 'User-Agent': 'BetBoardFactCheck/1.0' } })
  const j = (await r.json()) as { query: { pages: Record<string, { extract?: string }> } }
  const t = Object.values(j.query.pages)[0]?.extract ?? ''
  writeFileSync(f, t)
  return t
}

let bad = 0
for (const q of QUESTIONS) {
  const m = q.source.url.match(/^https:\/\/en\.wikipedia\.org\/wiki\/(.+)$/)
  if (!m) { console.log(`?? ${q.id}: non-Wikipedia source, verify manually: ${q.source.url}`); continue }
  const text = norm(await extract(decodeURIComponent(m[1])))
  const frags = q.source.quote.split(/…|\.\.\./).map((s) => norm(s).replace(/^[\s.,;:]+|[\s.,;:]+$/g, '')).filter((s) => s.length > 3)
  const missing = frags.filter((f) => !text.includes(f))
  if (missing.length) { bad++; console.log(`FAIL ${q.id}:`, missing) }
}
console.log(`${QUESTIONS.length} questions, ${bad} failed`)
process.exit(bad ? 1 : 0)
