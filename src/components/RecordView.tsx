import { t } from '../lib/i18n'
import { CalibrationChart } from './charts'
import { Badge, ScoreRing } from './ui'
import { pct } from '../lib/format'
import { biasOf, scoreLabel, type Bucket } from '../lib/scoring'
import type { RecordPayload } from '../lib/record'


const TONE = { hit: 'green', partial: 'cyan', miss: 'red', killed: 'amber' } as const

export function RecordView({ p }: { p: RecordPayload }) {
  const buckets: Bucket[] = p.bk.map(([lo, hi, meanP, observed, n]) => ({ lo, hi, meanP, observed, n }))
  const bias = biasOf(p.g)
  const scored = p.r + p.k
  return (
    <article className="card overflow-hidden print:shadow-none">
      <header className="grad-bg flex flex-col items-center gap-5 p-6 text-white sm:flex-row sm:p-8">
        <ScoreRing value={p.s} size={130} dark label={t("Judgment")} />
        <div className="text-center sm:text-start">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/60">{t("Verified-by-ledger track record")}</div>
          <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">{p.n || t('Anonymous PM')}{p.co && <span className="font-medium text-white/70"> · {p.co}</span>}</h2>
          <p className="mt-1 text-white/80">{t(scoreLabel(p.s))} · {bias === 'calibrated' ? t('well calibrated') : t(bias === 'overconfident' ? 'overconfident by {g} pts' : 'underconfident by {g} pts', { g: Math.abs(p.g) })}</p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
        {[
          [t('Scored bets'), `${scored}`],
          [t('Brier'), p.b.toFixed(3)],
          [t('Hit rate'), pct(p.h)],
          [t('Weeks saved by killing'), `${p.sw}`],
        ].map(([l, v]) => (
          <div key={l} className="bg-white p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">{v}</div>
            <div className="text-xs text-slate-500">{t(l)}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 p-6 md:grid-cols-2">
        <div>
          <h3 className="font-bold">{t("Calibration")}</h3>
          {buckets.length ? <CalibrationChart buckets={buckets} height={240} /> : <p className="py-10 text-sm text-slate-500">{t("No resolved bets yet.")}</p>}
        </div>
        <div>
          <h3 className="font-bold">{t("Recent calls")}</h3>
          <ul className="mt-3 divide-y divide-slate-100">
            {p.it.map(([title, prob, o], i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate">{title}</span>
                <span className="flex shrink-0 items-center gap-2"><span className="tabular-nums text-slate-500">{prob}%</span><Badge tone={TONE[o as keyof typeof TONE] ?? 'slate'}>{t(o)}</Badge></span>
              </li>
            ))}
            {p.it.length === 0 && <li className="py-2 text-sm text-slate-500">{t("Nothing resolved yet.")}</li>}
          </ul>
        </div>
      </div>
    </article>
  )
}
