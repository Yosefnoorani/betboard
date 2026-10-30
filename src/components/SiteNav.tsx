import { Link } from 'react-router-dom'
import { LinkButton, Logo, cx } from './ui'

export function SiteNav({ dark }: { dark?: boolean }) {
  return (
    <header className={cx('relative z-20', dark ? 'text-white' : 'text-slate-900')}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6" aria-label="Main">
        <Link to="/" className="focus-ring rounded-lg" aria-label="BetBoard home">
          <Logo light={dark} />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/pricing" className={cx('focus-ring hidden rounded-lg px-3 py-2 text-sm font-medium sm:inline-block', dark ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-900')}>Pricing</Link>
          <Link to="/app" className={cx('focus-ring rounded-lg px-3 py-2 text-sm font-medium', dark ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-900')}>Open app</Link>
          <LinkButton to="/test" variant={dark ? 'light' : 'primary'} size="sm">Take the free test</LinkButton>
        </div>
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span>Judgment is the new bottleneck.</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link className="hover:text-slate-900" to="/test">PM Judgment Score</Link>
          <Link className="hover:text-slate-900" to="/app">Bet Ledger</Link>
          <Link className="hover:text-slate-900" to="/app/constitution">Constitution</Link>
          <Link className="hover:text-slate-900" to="/pricing">Pricing</Link>
        </div>
        <div className="text-xs">Your data stays in your browser. No account required.</div>
      </div>
    </footer>
  )
}
