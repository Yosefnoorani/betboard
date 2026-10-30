import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { SiteNav } from '../components/SiteNav'
import { ResultCard } from '../components/ResultCard'
import { ArchetypeMap } from '../components/ArchetypeMap'
import { LinkButton } from '../components/ui'
import { decodeChallenge, decodeShare, encodeShare, toChallenge, type SharePayload } from '../lib/share'
import { ARCHETYPES } from '../lib/scoring'
import { useData } from '../lib/store'

/** `/s/:data` shows a shared result card; `/c/:data` is a direct challenge. */
export default function SharedResult({ mode = 'result' }: { mode?: 'result' | 'challenge' }) {
  const { data = '' } = useParams()
  const ref = useRef<HTMLDivElement>(null)
  const history = useData().quizHistory
  const r = mode === 'result' ? decodeShare<SharePayload>(data) : null
  const ch = mode === 'challenge' ? decodeChallenge(data) : r && typeof r.s === 'number' ? toChallenge(r) : null
  const valid = mode === 'challenge' ? !!ch : !!(r && typeof r.s === 'number' && typeof r.t === 'number')
  const k = (mode === 'challenge' ? ch?.k : r?.k) ?? 'navigator'
  const arch = ARCHETYPES[k] ?? ARCHETYPES.navigator
  const who = (mode === 'challenge' ? ch?.n : r?.n) || ''
  const score = (mode === 'challenge' ? ch?.s : r?.s) ?? 0
  const testLink = ch ? `/test?c=${encodeShare(ch)}` : '/test'
  return (
    <div className="min-h-screen grad-bg text-white">
      <SiteNav dark />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-6 text-center sm:px-6">
        {valid ? (
          <>
            {mode === 'challenge' && <div className="text-sm font-bold uppercase tracking-[.2em] text-cyan-200">⚔️ You've been challenged</div>}
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {mode === 'challenge' ? `${who || 'A colleague'} scored ${score}. Can you beat it?` : who ? `${who} scored ${score}/100` : `Someone scored ${score}/100`}
            </h1>
            <p className="mt-2 text-white/70">
              {mode === 'challenge' ? 'Same 15 product-history questions. Pick an answer, say how sure you are. 3 minutes, no signup.' : 'on the PM Judgment Score, a 3-minute calibration test for product people.'}
            </p>
            {mode === 'result' && r && (
              <div className="mt-8 flex justify-center text-left">
                <ResultCard ref={ref} r={r} />
              </div>
            )}
            {mode === 'challenge' && (
              <div className="mx-auto mt-8 flex max-w-md items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-left">
                <span className="text-6xl" aria-hidden>{arch.emoji}</span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Score to beat</div>
                  <div className="text-5xl font-black tabular-nums">{score}</div>
                  <div className="font-bold">{arch.name}</div>
                </div>
              </div>
            )}
            <div className="mt-8">
              <LinkButton to={testLink} variant="light" size="lg">{ch ? `Beat ${score}: take the same test →` : 'Take the free test →'}</LinkButton>
            </div>
            <p className="mx-auto mt-6 max-w-lg text-white/75">{arch.description}</p>
            <div className="mt-8 text-left">
              <ArchetypeMap friend={{ k, n: who || undefined }} history={history} />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold">This link looks broken</h1>
            <div className="mt-8">
              <LinkButton to="/test" variant="light" size="lg">Take the free test →</LinkButton>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
