import { t } from '../lib/i18n'
import type { ReactNode } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useData, startFresh } from '../lib/store'
import { Button, Logo } from './ui'
import { cx } from '../lib/format'
import { LangToggle } from './LangToggle'

const NAV = [
  { to: '/app', label: 'Dashboard', end: true, icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { to: '/app/bets', label: 'Bet Ledger', icon: 'M4 6h16M4 12h16M4 18h10' },
  { to: '/app/constitution', label: 'Constitution', icon: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z' },
  { to: '/app/record', label: 'Track record', icon: 'M4 19V5m0 14h16M8 15l3-4 3 2 4-6' },
  { to: '/app/settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-2-1.2L14.5 3h-5l-.4 2.6a7.6 7.6 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 002 1.2l.4 2.6h5l.4-2.6a7.6 7.6 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z' },
]

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}

export default function AppShell() {
  const data = useData()
  return (
    <div className="min-h-screen bg-slate-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">{t("Skip to content")}</a>
      <aside aria-label={t("Sidebar")} className="fixed inset-y-0 start-0 z-30 hidden w-60 flex-col border-e border-slate-200 bg-white px-3 py-4 lg:flex">
        <Link to="/" className="focus-ring mb-6 rounded-lg px-2"><Logo /></Link>
        <nav className="flex flex-1 flex-col gap-1" aria-label={t("App")}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx('focus-ring flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition', isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
              <Icon d={n.icon} />
              {t(n.label)}
            </NavLink>
          ))}
        </nav>
        <LangToggle className="mb-2 self-start" />
        <Link to="/test" className="focus-ring mt-4 rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-500 p-4 text-white shadow-lg shadow-brand-600/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/80">{t("Free · 3 min")}</div>
          <div className="mt-1 text-sm font-bold">{t("What's your PM Judgment Score?")}</div>
          <div className="mt-2 text-xs text-white/80">{t("Take the test →")}</div>
        </Link>
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="focus-ring rounded-lg"><Logo /></Link>
          <div className="flex items-center gap-1"><LangToggle /><Link to="/test" className="text-sm font-semibold text-brand-700">{t("Free test")}</Link></div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2" aria-label={t("App")}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium', isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600')}>
              {t(n.label)}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="lg:ps-60">
        {data.isDemo && (
          <section aria-label={t("Demo notice")} className="no-print border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
              <span><strong>{t("Demo workspace.")}</strong> {t("You're looking at sample bets for a fictional company. Explore freely: everything is stored only in your browser.")}</span>
              <Button size="sm" variant="secondary" onClick={() => confirm(t('Clear the demo data and start with an empty ledger?')) && startFresh()}>{t("Start my own ledger")}</Button>
            </div>
          </section>
        )}
        <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
