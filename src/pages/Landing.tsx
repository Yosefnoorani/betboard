import { t } from '../lib/i18n'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter, SiteNav } from '../components/SiteNav'
import { Button, LinkButton, ScoreRing } from '../components/ui'
import { cx } from '../lib/format'
import { setData, useData } from '../lib/store'

const PAINS = [
  { t: 'Building got cheap. Deciding didn’t.', b: 'AI agents ship code in hours. Picking the right thing to build still takes weeks of meetings, opinions and politics.' },
  { t: 'Roadmaps overflow', b: 'When every idea can be prototyped, everything gets built. Focus collapses, review queues grow and products bloat.' },
  { t: 'Nobody measures judgment', b: 'PMs are judged on output (docs, tickets, launches) instead of whether their calls were right. Good judgment goes unseen.' },
]

const STEPS = [
  { n: '01', t: 'Write it as a bet', b: 'Paste a raw idea or PRD. BetBoard turns it into a falsifiable bet with a hypothesis, success metric, target, probability, kill criteria, review date and cost.' },
  { n: '02', t: 'Filter it through your constitution', b: 'Your strategy becomes explicit goals, principles and non-goals with weights. Every bet gets a fit score and red flags before anyone writes code.' },
  { n: '03', t: 'Resolve it and get calibrated', b: 'Mark each bet hit, miss or partial at review. Your calibration curve and Brier score show how good your judgment really is, and the weeks you saved by killing bets early count too.' },
]

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    per: 'forever',
    blurb: 'Everything that works today',
    features: ['PM Judgment Score test, share card and challenge links', 'Bet Ledger stored in this browser', 'Product Constitution & fit scores', 'Calibration dashboard & public track-record link', 'Bring your own AI key'],
    cta: 'Start free',
    to: '/start',
  },
  {
    name: 'Pro',
    price: '$12',
    per: 'per month',
    blurb: 'For PMs building a provable track record',
    features: ['Everything in Free', 'Unlimited bets, synced across devices', 'Built-in AI assist (no key needed)', 'Team constitution your whole team can bet against', 'Calibration history: your score quarter by quarter', 'Monthly calibration coaching report'],
    cta: 'Join the Pro waitlist',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$29',
    per: 'per seat / month',
    blurb: 'For product orgs that want to decide faster',
    features: ['Everything in Pro', 'Portfolio view across every PM', 'Capacity planning & overload alerts', 'Agent/PR gate: check AI-built work against strategy', 'Analytics auto-resolve (Amplitude, Mixpanel, GA4)', 'SSO, admin & audit log'],
    cta: 'Join the Team waitlist',
  },
]

const WHY_PRO = [
  { icon: '♾️', title: 'Unlimited bets, everywhere', pain: 'Today your ledger lives in one browser. Clear your cache and your track record is gone.', fix: 'Pro keeps every bet you ever made, synced across laptop and phone.' },
  { icon: '✨', title: 'AI assist built in', pain: 'Turning a messy idea into a metric, target and kill criteria takes a blank-page half hour.', fix: 'Paste the idea and Pro drafts the whole bet. No API key, no setup.' },
  { icon: '🧭', title: 'A team constitution', pain: 'Your strategy doc says one thing and the roadmap does another, and nobody notices until review.', fix: 'One shared constitution that every bet on the team is fit-scored against.' },
  { icon: '📈', title: 'Calibration history', pain: 'One score is a snapshot. A promotion case needs a trend.', fix: 'See your judgment quarter by quarter, and how far you have come since your first bet.' },
]

const FAQ = [
  { q: 'What is calibration?', a: 'You are calibrated when your stated confidence matches reality: of all the things you call 70% likely, about 70% happen. It is one of the best-studied measures of forecasting skill, and it is exactly what a PM is paid for.' },
  { q: 'How is the Judgment Score calculated?', a: 'We use the Brier score, the mean squared error between your stated probability and what actually happened. We rescale it so that 100 is perfect and 50 is the same as answering 50% every time. Overconfident wrong answers cost the most.' },
  { q: 'Are the quiz facts real?', a: 'Yes. Every question is about a public product or tech-business fact, and every answer links to its source. You see them all when you review your results.' },
  { q: 'Where is my data stored?', a: 'In your browser (localStorage). No account, no server. You can export and import JSON at any time. If you add an AI key, requests go directly from your browser to the endpoint you choose.' },
  { q: 'Is Pro available yet?', a: 'Not yet. Pro and Team are planned. Join the waitlist and you will be first in line. Everything you see today is free.' },
]

function Waitlist({ plan }: { plan: string }) {
  const data = useData()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const count = data.waitlist.length
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr(t('Please enter a valid email.'))
    setData((d) => ({ ...d, waitlist: [...d.waitlist.filter((w) => w.email !== email), { email, plan, at: new Date().toISOString() }] }))
    setDone(true)
    setErr('')
  }
  const errEl = err ? <p className="mt-2 text-sm text-rose-600" role="alert">{err}</p> : null
  if (done)
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">
        {t("You're on the {plan} waitlist ✓. We'll email {email} when it opens.", { plan: t(plan), email })}
      </p>
    )
  return (
    <>
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row" aria-label={t('Join the {plan} waitlist', { plan: t(plan) })} noValidate>
      <label className="sr-only" htmlFor={`wl-${plan}`}>{t("Work email")}</label>
      <input id={`wl-${plan}`} type="email" className="input" placeholder={t("you@company.com")} value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button type="submit">{t("Join waitlist")}</Button>
    </form>
    {errEl}
    {count > 0 && <p className="mt-2 text-xs text-slate-500">{t(count === 1 ? '{n} signup saved in this browser' : '{n} signups saved in this browser', { n: count })}</p>}
    </>
  )
}

export default function Landing({ scrollTo }: { scrollTo?: string }) {
  const [plan, setPlan] = useState('Pro')
  useEffect(() => {
    if (scrollTo) setTimeout(() => document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [scrollTo])

  return (
    <div className="min-h-screen bg-white">
      <main>
      <section className="grad-bg relative overflow-hidden text-white">
        <SiteNav dark />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:pb-28 lg:pt-16">
          <div className="rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t("For product managers in the age of AI")}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {t("AI made building cheap.")}<br />
              <span className="grad-text">{t("Judgment is the new bottleneck.")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/75">
              {t("BetBoard turns every initiative into a calibrated bet, checks it against your strategy before anything gets built, and gives you proof of what you're actually paid for: making the right calls.")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/test" variant="light" size="lg">{t("Get your PM Judgment Score, free →")}</LinkButton>
              <LinkButton to="/start" size="lg" className="bg-white/10 hover:bg-white/20 shadow-none">{t("Set up in 60 seconds")}</LinkButton>
            </div>
            <p className="mt-4 text-sm text-white/55">{t("15 questions · 3 minutes · no signup ·")} <Link to="/app" className="underline hover:text-white">{t("or explore the demo ledger")}</Link></p>
          </div>

          <div className="rise relative mx-auto w-full max-w-sm" style={{ animationDelay: '.1s' }} aria-hidden>
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-600/40 to-cyan-500/30 blur-2xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/[.06] p-6 backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">{t("PM Judgment Score")}</div>
              <div className="mt-4 flex items-center gap-5">
                <ScoreRing value={78} size={112} dark label={t("score")} />
                <div>
                  <div className="text-2xl">🧭</div>
                  <div className="font-bold">{t("The Honest Navigator")}</div>
                  <div className="text-sm text-white/60">{t("Calibrated within 4 pts")}</div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {[
                  [t('Guided onboarding checklist'), '70%', t('HIT'), 'bg-emerald-400/20 text-emerald-300'],
                  [t('Usage-based pricing pilot'), '30%', t('MISS'), 'bg-rose-400/20 text-rose-300'],
                  [t('SQL query builder'), '35%', t('KILLED'), 'bg-amber-400/20 text-amber-200'],
                ].map(([ti, p, s, c]) => (
                  <div key={ti} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                    <span className="truncate text-white/85">{t(ti)}</span>
                    <span className="ms-2 flex shrink-0 items-center gap-2">
                      <span className="tabular-nums text-white/60">{p}</span>
                      <span className={cx('rounded-md px-1.5 py-0.5 text-[10px] font-bold', c)}>{t(s)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Your tools speed up artifacts. Nothing speeds up judgment.")}</h2>
        <p className="mt-3 max-w-2xl text-slate-600">{t("PRD generators, prototype builders and AI coding agents make output faster. The slow part is still deciding what's worth building, and nobody measures whether those decisions were good.")}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PAINS.map((p) => (
            <div key={p.t} className="card p-6">
              <h3 className="text-lg font-bold">{t(p.t)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(p.b)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("How BetBoard works")}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card relative overflow-hidden p-6">
                <div className="text-5xl font-black text-brand-600" aria-hidden="true">{s.n}</div>
                <h3 className="mt-2 text-lg font-bold">{t(s.t)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(s.b)}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="card p-6">
              <div className="text-sm font-semibold text-brand-700">{t("For you")}</div>
              <h3 className="mt-1 text-xl font-bold">{t("A track record you can bring to your review")}</h3>
              <p className="mt-2 text-sm text-slate-600">{t("\"I shipped 14 features\" says little. \"My 70% calls hit 71% of the time, and I killed 3 bets early, saving 14 person-weeks\" is proof of judgment. Share it with your manager in one link.")}</p>
            </div>
            <div className="card p-6">
              <div className="text-sm font-semibold text-cyan-700">{t("For your team")}</div>
              <h3 className="mt-1 text-xl font-bold">{t("A strategy that pushes back")}</h3>
              <p className="mt-2 text-sm text-slate-600">{t("Write your strategy as a constitution that can be checked. Bets that violate a non-goal, have no metric or can never be killed get flagged automatically, and the overload meter shows when you have taken on too much.")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Simple pricing")}</h2>
          <p className="mt-2 text-slate-600">{t("Free works today, with no signup. Pro and Team are")} <strong>{t("planned")}</strong>{t(": join the waitlist for early access. No payments are taken.")}</p>
        </div>
        <div className="mt-10">
          <h3 className="text-center text-sm font-bold uppercase tracking-wider text-brand-700">{t("Why pay for Pro?")} <span className="ms-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{t("planned")}</span></h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_PRO.map((w) => (
              <div key={w.title} className="card p-5">
                <div className="text-2xl" aria-hidden>{w.icon}</div>
                <h4 className="mt-2 font-bold">{t(w.title)}</h4>
                <p className="mt-2 text-sm text-slate-500">{t(w.pain)}</p>
                <p className="mt-2 text-sm font-medium text-slate-800">{t(w.fix)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div key={tier.name} className={cx('card flex flex-col p-6', tier.highlight && 'border-brand-500 ring-2 ring-brand-500')}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{t(tier.name)}</h3>
                {tier.name !== 'Free' ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{t("Planned")}</span> : <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{t("Available now")}</span>}
              </div>
              <p className="mt-1 text-sm text-slate-500">{t(tier.blurb)}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{tier.price}</span>
                <span className="text-sm text-slate-500">{t(tier.per)}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-brand-600" aria-hidden>✓</span>{t(f)}</li>
                ))}
              </ul>
              <div className="mt-6">
                {tier.to ? (
                  <LinkButton to={tier.to} variant="secondary" className="w-full">{t(tier.cta)}</LinkButton>
                ) : (
                  <Button variant={tier.highlight ? 'primary' : 'secondary'} className="w-full" onClick={() => { setPlan(tier.name); document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' }) }}>{t(tier.cta)}</Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div id="waitlist" className="card mx-auto mt-10 max-w-xl scroll-mt-10 p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-bold">{t('Join the {plan} waitlist', { plan: t(plan) })}</h3>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs" role="group" aria-label={t("Plan")}>
              {['Pro', 'Team'].map((p) => (
                <button key={p} onClick={() => setPlan(p)} aria-pressed={plan === p} className={cx('focus-ring rounded-md px-2 py-1 font-semibold', plan === p ? 'bg-white shadow-sm' : 'text-slate-600')}>{t(p)}</button>
              ))}
            </div>
          </div>
          <Waitlist key={plan} plan={plan} />
          <p className="mt-2 text-xs text-slate-500">{t("Demo build: your email is saved only in this browser.")}</p>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight">{t("Questions")}</h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {t(f.q)}
                  <span className="text-slate-400 transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="grad-bg py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("How good is your judgment, really?")}</h2>
          <p className="mt-3 text-white/70">{t("Find out in 3 minutes. Then compare scores with your team.")}</p>
          <LinkButton to="/test" variant="light" size="lg" className="mt-8">{t("Take the PM Judgment Score test →")}</LinkButton>
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  )
}
