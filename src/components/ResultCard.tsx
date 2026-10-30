import { forwardRef } from 'react'
import { ARCHETYPES, biasOf, scoreLabel } from '../lib/scoring'
import { ScoreRing } from './ui'

export interface SharePayload {
  s: number // score
  a: number // accuracy %
  g: number // gap pts
  k: string // archetype key
  c: number // correct
  t: number // total
  n?: string // name
}

export const ResultCard = forwardRef<HTMLDivElement, { r: SharePayload }>(function ResultCard({ r }, ref) {
  const arch = ARCHETYPES[r.k] ?? ARCHETYPES.navigator
  const bias = biasOf(r.g)
  const biasText =
    bias === 'calibrated' ? `Calibrated (within ${Math.abs(Math.round(r.g))} pts)` : bias === 'overconfident' ? `Overconfident by ${Math.round(r.g)} pts` : `Underconfident by ${Math.abs(Math.round(r.g))} pts`
  return (
    <div
      ref={ref}
      className="relative w-full max-w-[560px] overflow-hidden rounded-3xl p-7 text-white sm:p-8"
      style={{ background: 'radial-gradient(600px 300px at 0% 0%, rgba(124,58,237,.65), transparent 60%), radial-gradient(500px 300px at 100% 100%, rgba(6,182,212,.45), transparent 60%), #0b0b1a' }}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-[.2em] text-white/70">PM Judgment Score</div>
        <div className="flex items-center gap-1.5 text-sm font-extrabold">
          <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden><rect width="64" height="64" rx="16" fill="#fff" fillOpacity=".15" /><path d="M14 46 L26 34 L34 40 L50 20" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          BetBoard
        </div>
      </div>
      {r.n && <div className="mt-4 text-sm font-medium text-white/70">{r.n}</div>}
      <div className="mt-5 flex items-center gap-6">
        <ScoreRing value={r.s} size={132} stroke={11} dark label="/ 100" />
        <div className="min-w-0">
          <div className="text-4xl" aria-hidden>{arch.emoji}</div>
          <div className="mt-1 text-2xl font-extrabold leading-tight">{arch.name}</div>
          <div className="mt-1 text-sm text-white/70">{arch.tagline}</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-white/10 px-2 py-3">
          <div className="text-lg font-extrabold tabular-nums">{r.c}/{r.t}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">correct</div>
        </div>
        <div className="rounded-2xl bg-white/10 px-2 py-3">
          <div className="text-lg font-extrabold tabular-nums">{r.g > 0 ? '+' : ''}{Math.round(r.g)}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">confidence gap</div>
        </div>
        <div className="rounded-2xl bg-white/10 px-2 py-3">
          <div className="truncate text-lg font-extrabold">{scoreLabel(r.s).split(' ')[0]}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">level</div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between text-xs text-white/60">
        <span>{biasText}</span>
        <span>Take the 3-min test · betboard</span>
      </div>
    </div>
  )
})
