import { t } from '../lib/i18n'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../lib/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'light'
const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/30',
  secondary: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  light: 'bg-white text-ink hover:bg-brand-50 shadow-lg shadow-black/20',
}
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' }


export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes }) {
  return (
    <button
      {...rest}
      className={cx(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
    />
  )
}

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: {
  to: string
  variant?: Variant
  size?: keyof typeof sizes
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={cx('focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition', variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  )
}

export function Badge({ tone = 'slate', children, className }: { tone?: 'slate' | 'green' | 'red' | 'amber' | 'brand' | 'cyan'; children: ReactNode; className?: string }) {
  const t = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
    cyan: 'bg-cyan-50 text-cyan-800 ring-cyan-600/20',
  }[tone]
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-slate-500/10', t, className)}>{children}</span>
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'brand' | 'green' | 'red' }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={cx('mt-1 text-2xl font-bold tabular-nums sm:text-3xl', tone === 'brand' && 'text-brand-700', tone === 'green' && 'text-emerald-600', tone === 'red' && 'text-rose-600')}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    setTimeout(() => ref.current?.querySelector<HTMLElement>('input,textarea,button')?.focus(), 30)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={cx('rise max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl', wide ? 'sm:max-w-4xl' : 'sm:max-w-lg')}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-3 backdrop-blur">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} className="focus-ring rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label={t("Close")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Logo({ light }: { light?: boolean }) {
  const gid = 'lg' + useId().replace(/:/g, '')
  return (
    <span className="inline-flex items-center gap-2 font-extrabold tracking-tight">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill={`url(#${gid})`} />
        <path d="M14 46 L26 34 L34 40 L50 20" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="20" r="5" fill="#fff" />
      </svg>
      <span className={light ? 'text-white' : 'text-ink'}>{t("BetBoard")}</span>
    </span>
  )
}

export function ScoreRing({ value, size = 120, stroke = 10, label, dark }: { value: number; size?: number; stroke?: number; label?: string; dark?: boolean }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  const color = v >= 72 ? '#10b981' : v >= 55 ? '#8b5cf6' : '#f43f5e'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={dark ? 'rgba(255,255,255,.12)' : '#e2e8f0'} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ transition: 'stroke-dashoffset .8s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className={cx('font-extrabold tabular-nums', dark ? 'text-white' : 'text-ink')} style={{ fontSize: size * 0.3 }}>{Math.round(v)}</div>
        {label && <div className={cx('text-[10px] font-semibold uppercase tracking-wider', dark ? 'text-white/60' : 'text-slate-500')}>{label}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 text-4xl" aria-hidden>🎯</div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

