import { t } from '../lib/i18n'
import { forwardRef } from 'react'
import { ARCHETYPES, biasOf, scoreLabel } from '../lib/scoring'
import { seedLabel } from '../lib/pack'
import type { SharePayload } from '../lib/share'

export type { SharePayload } from '../lib/share'

const siteHost = () => (typeof window === 'undefined' ? 'betboard' : (window.location.host + window.location.pathname).replace(/\/(index\.html)?$/, ''))

const CAT_LABEL: Record<string, string> = { pivots: 'Pivots pack', launches: 'Launches pack', metrics: 'Deals & metrics pack', ai: 'AI-era pack' }

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-white/60">
        <span>{label}</span>
        <span className="tabular-nums text-white">{v}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10" dir="ltr">
        <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />
      </div>
    </div>
  )
}

export const ResultCard = forwardRef<HTMLDivElement, { r: SharePayload; vs?: { n?: string; s: number } }>(function ResultCard({ r, vs }, ref) {
  const arch = ARCHETYPES[r.k] ?? ARCHETYPES.navigator
  const bias = biasOf(r.g)
  const g = Math.round(r.g)
  const biasText = bias === 'calibrated' ? t('Calibrated · gap {g} pts', { g: `${g > 0 ? '+' : ''}${g}` }) : bias === 'overconfident' ? t('Overconfident by {g} pts', { g }) : t('Underconfident by {g} pts', { g: Math.abs(g) })
  const wk = r.sd ? seedLabel(r.sd) : null
  const pack = r.cat ? t(CAT_LABEL[r.cat]) : wk ? t('Week {w} pack', { w: wk.week }) : t('Mixed pack')
  return (
    <div
      ref={ref}
      className="relative w-full max-w-[560px] overflow-hidden rounded-3xl p-7 text-white shadow-2xl sm:p-8"
      style={{ background: 'radial-gradient(520px 320px at 0% 0%, rgba(124,58,237,.75), transparent 62%), radial-gradient(460px 300px at 100% 100%, rgba(6,182,212,.55), transparent 62%), #0b0b1a' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-extrabold">
          <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden><rect width="64" height="64" rx="16" fill="#fff" fillOpacity=".15" /><path d="M14 46 L26 34 L34 40 L50 20" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {t("BetBoard")}
        </div>
        <div className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">{pack}</div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[.2em] text-white/60">{r.n ? t("{name}'s PM Judgment Score", { name: r.n }) : t('PM Judgment Score')}</div>
          <div className="mt-1 flex items-baseline gap-2" dir="ltr">
            <span className="text-[88px] font-black leading-none tracking-tight tabular-nums">{r.s}</span>
            <span className="text-2xl font-bold text-white/50">/100</span>
          </div>
          <div className="mt-1 text-sm font-semibold text-cyan-200">{t(scoreLabel(r.s))}</div>
        </div>
        <div className="shrink-0 text-end">
          <div className="text-6xl leading-none" aria-hidden>{arch.emoji}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white/10 p-4">
        <div className="text-xl font-extrabold leading-tight">{t(arch.name)}</div>
        <div className="mt-0.5 text-sm text-white/75">{t(arch.tagline)}</div>
        <div className="mt-4 grid gap-2.5">
          <Meter label={t("Confidence")} value={r.a + r.g} color="linear-gradient(90deg,#a78bfa,#7c3aed)" />
          <Meter label={t('Accuracy · {c}/{n}', { c: r.c, n: r.t })} value={r.a} color="linear-gradient(90deg,#67e8f9,#06b6d4)" />
        </div>
        <div className="mt-2 text-xs text-white/60">{biasText}</div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        {vs ? (
          <span className="font-bold">{r.s > vs.s ? t('🏆 Beat {who} ({s})', { who: vs.n || t('the challenger'), s: vs.s }) : r.s === vs.s ? t('🤝 Tied {who} ({s})', { who: vs.n || t('the challenger'), s: vs.s }) : t('{who} leads: {s}', { who: vs.n || t('Challenger'), s: vs.s })}</span>
        ) : (
          <span className="font-bold">{t('Can you beat {s}?', { s: r.s })}</span>
        )}
        <span className="text-xs text-white/55">{t('3-min test · {host}', { host: siteHost() })}</span>
      </div>
    </div>
  )
})
