import { ARCHETYPES } from '../lib/scoring'
import type { QuizRecord } from '../lib/types'
import { cx } from '../lib/format'

const ORDER = ['oracle', 'navigator', 'hotshot', 'hidden', 'visionary', 'skeptic']

/**
 * "Which one are you?" hook. Uses only real data: your own local history and,
 * if you came from a challenge, your friend's archetype. No population stats.
 */
export function ArchetypeMap({ mine, friend, history = [], dark = true }: { mine?: string; friend?: { k: string; n?: string }; history?: QuizRecord[]; dark?: boolean }) {
  const seen = new Map<string, number>()
  history.forEach((h) => seen.set(h.archetype, (seen.get(h.archetype) ?? 0) + 1))
  const best = history.length ? Math.max(...history.map((h) => h.score)) : null
  const collected = ORDER.filter((k) => seen.has(k)).length
  return (
    <section className={cx('rounded-2xl border p-5', dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white')} aria-labelledby="arch-h">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="arch-h" className="font-bold">The six PM archetypes</h2>
        {history.length > 0 && (
          <div className={cx('text-xs', dark ? 'text-white/60' : 'text-slate-500')}>
            Your best: <strong className={dark ? 'text-white' : 'text-ink'}>{best}</strong> · tests taken: {history.length} · collected {collected}/6
          </div>
        )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ORDER.map((k) => {
          const a = ARCHETYPES[k]
          const isMine = mine === k
          const isFriend = friend?.k === k
          return (
            <li
              key={k}
              className={cx(
                'relative rounded-xl border p-3 transition',
                isMine ? 'border-brand-400 bg-brand-500/20 ring-2 ring-brand-400' : dark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50',
                !isMine && !isFriend && !seen.has(k) && 'opacity-60',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>{a.emoji}</span>
                <span className="text-sm font-bold leading-tight">{a.name}</span>
              </div>
              <p className={cx('mt-1 text-xs leading-snug', dark ? 'text-white/60' : 'text-slate-500')}>{a.tagline}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {isMine && <span className="rounded-md bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">You</span>}
                {isFriend && <span className="rounded-md bg-cyan-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">{friend?.n || 'Challenger'}</span>}
                {seen.has(k) && !isMine && <span className={cx('rounded-md px-1.5 py-0.5 text-[10px] font-semibold', dark ? 'bg-white/10 text-white/70' : 'bg-slate-200 text-slate-600')}>Seen ×{seen.get(k)}</span>}
              </div>
            </li>
          )
        })}
      </ul>
      <p className={cx('mt-3 text-xs', dark ? 'text-white/45' : 'text-slate-400')}>Your archetype comes from accuracy × confidence gap. Retake a different pack, or challenge a colleague and compare.</p>
    </section>
  )
}
