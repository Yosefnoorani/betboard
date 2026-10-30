import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { SiteNav } from '../components/SiteNav'
import { ResultCard, type SharePayload } from '../components/ResultCard'
import { LinkButton } from '../components/ui'
import { decodeShare } from '../lib/share'
import { ARCHETYPES } from '../lib/scoring'

export default function SharedResult() {
  const { data = '' } = useParams()
  const r = decodeShare<SharePayload>(data)
  const ref = useRef<HTMLDivElement>(null)
  const valid = r && typeof r.s === 'number' && typeof r.t === 'number'
  return (
    <div className="min-h-screen grad-bg text-white">
      <SiteNav dark />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-6 text-center sm:px-6">
        {valid ? (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{r.n ? `${r.n} scored ${r.s}/100` : `Someone scored ${r.s}/100`}</h1>
            <p className="mt-2 text-white/70">on the PM Judgment Score, a 3-minute calibration test for product people.</p>
            <div className="mt-8 flex justify-center text-left">
              <ResultCard ref={ref} r={r} />
            </div>
            <p className="mx-auto mt-6 max-w-lg text-white/75">{(ARCHETYPES[r.k] ?? ARCHETYPES.navigator).description}</p>
          </>
        ) : (
          <h1 className="text-3xl font-extrabold">This share link looks broken</h1>
        )}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-extrabold">Think you can beat it?</h2>
          <p className="mt-2 text-white/70">15 real product-history questions. Pick an answer and how sure you are. No signup.</p>
          <LinkButton to="/test" variant="light" size="lg" className="mt-6">Take the free test →</LinkButton>
        </div>
      </main>
    </div>
  )
}
