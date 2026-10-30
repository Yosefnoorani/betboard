import type { Bucket } from '../lib/scoring'
import type { Overload } from '../lib/constitution'
import { cx } from './ui'

/** Calibration curve: x = stated probability, y = observed frequency. */
export function CalibrationChart({
  buckets,
  domain = [0, 1],
  height = 260,
  dark,
  title = 'Calibration curve',
}: {
  buckets: Bucket[]
  domain?: [number, number]
  height?: number
  dark?: boolean
  title?: string
}) {
  const W = 400
  const H = 300
  const pad = { l: 44, r: 14, t: 14, b: 38 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const [d0, d1] = domain
  const x = (v: number) => pad.l + ((v - d0) / (d1 - d0)) * iw
  const y = (v: number) => pad.t + (1 - v) * ih
  const ticksX = Array.from({ length: 6 }, (_, i) => d0 + ((d1 - d0) * i) / 5)
  const ticksY = [0, 0.25, 0.5, 0.75, 1]
  const maxN = Math.max(1, ...buckets.map((b) => b.n))
  const axis = dark ? 'rgba(255,255,255,.45)' : '#94a3b8'
  const grid = dark ? 'rgba(255,255,255,.08)' : '#eef2f7'
  const path = buckets.map((b, i) => `${i ? 'L' : 'M'}${x(b.meanP)},${y(b.observed)}`).join(' ')
  const summary = buckets.map((b) => `${Math.round(b.meanP * 100)}% stated → ${Math.round(b.observed * 100)}% happened (n=${b.n})`).join('; ')
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} role="img" aria-label={`${title}. ${summary || 'No resolved forecasts yet.'}`}>
        {ticksY.map((t) => (
          <g key={`y${t}`}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={grid} />
            <text x={pad.l - 8} y={y(t) + 4} fontSize="11" textAnchor="end" fill={axis}>{Math.round(t * 100)}%</text>
          </g>
        ))}
        {ticksX.map((t) => (
          <text key={`x${t}`} x={x(t)} y={H - pad.b + 18} fontSize="11" textAnchor="middle" fill={axis}>{Math.round(t * 100)}%</text>
        ))}
        <text x={pad.l + iw / 2} y={H - 4} fontSize="11" textAnchor="middle" fill={axis}>Your stated probability</text>
        <text x={12} y={pad.t + ih / 2} fontSize="11" textAnchor="middle" fill={axis} transform={`rotate(-90 12 ${pad.t + ih / 2})`}>Actually happened</text>
        {/* perfect calibration */}
        <line x1={x(d0)} y1={y(d0)} x2={x(d1)} y2={y(d1)} stroke={dark ? 'rgba(255,255,255,.35)' : '#cbd5e1'} strokeDasharray="5 5" strokeWidth="1.5" />
        <text x={x(d1) - 4} y={y(d1) + 14} fontSize="10" textAnchor="end" fill={axis}>perfect calibration</text>
        {buckets.length > 1 && <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinejoin="round" />}
        {buckets.map((b) => (
          <g key={b.lo}>
            <line x1={x(b.meanP)} x2={x(b.meanP)} y1={y(b.meanP)} y2={y(b.observed)} stroke={b.observed < b.meanP ? '#f43f5e' : '#10b981'} strokeOpacity=".5" strokeWidth="2" />
            <circle cx={x(b.meanP)} cy={y(b.observed)} r={6 + (8 * b.n) / maxN} fill="#8b5cf6" fillOpacity=".9" stroke={dark ? '#0b0b1a' : 'white'} strokeWidth="2">
              <title>{`Stated ~${Math.round(b.meanP * 100)}%, happened ${Math.round(b.observed * 100)}% (${b.n})`}</title>
            </circle>
          </g>
        ))}
        {buckets.length === 0 && (
          <text x={pad.l + iw / 2} y={pad.t + ih / 2} fontSize="13" textAnchor="middle" fill={axis}>Resolve a few bets to see your curve</text>
        )}
      </svg>
      <figcaption className={cx('mt-1 text-xs', dark ? 'text-white/60' : 'text-slate-500')}>
        Dots below the dashed line mean you were overconfident at that probability. Dots above it mean underconfident. Bigger dots contain more forecasts.
      </figcaption>
    </figure>
  )
}

export function OverloadMeter({ o }: { o: Overload }) {
  const pctLoad = Math.min(1.5, o.load)
  const color = o.level === 'overloaded' ? 'bg-rose-500' : o.level === 'stretched' ? 'bg-amber-400' : 'bg-emerald-500'
  const label = { healthy: 'Healthy focus', stretched: 'Stretched thin', overloaded: 'Feature overload' }[o.level]
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs tabular-nums text-slate-500">{Math.round(o.load * 100)}% of capacity</div>
      </div>
      <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-slate-100" role="meter" aria-valuemin={0} aria-valuemax={150} aria-valuenow={Math.round(pctLoad * 100)} aria-label="Capacity load">
        <div className={cx('h-full rounded-full transition-all', color)} style={{ width: `${(pctLoad / 1.5) * 100}%` }} />
        <div className="absolute inset-y-0 w-0.5 bg-slate-700/60" style={{ left: `${(1 / 1.5) * 100}%` }} title="Capacity limit" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div><span className="font-semibold tabular-nums text-slate-900">{o.open}</span> / {o.capacity} open bets</div>
        <div className="text-right"><span className="font-semibold tabular-nums text-slate-900">{o.openWeeks}</span> / {o.capacityWeeks} person-weeks</div>
      </div>
    </div>
  )
}

export function FitPill({ score }: { score: number }) {
  const tone = score >= 70 ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : score >= 45 ? 'bg-amber-50 text-amber-800 ring-amber-600/20' : 'bg-rose-50 text-rose-700 ring-rose-600/20'
  return (
    <span className={cx('inline-flex min-w-[3.5rem] items-center justify-center rounded-lg px-2 py-1 text-xs font-bold tabular-nums ring-1 ring-inset', tone)} title="Constitution fit score (0–100)">
      Fit {score}
    </span>
  )
}
