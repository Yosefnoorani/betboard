import { t } from '../lib/i18n'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteNav } from '../components/SiteNav'
import { Button, LinkButton } from '../components/ui'
import { cx } from '../lib/format'
import { heuristicAssist } from '../lib/assist'
import { blankBet } from '../lib/bets'
import { ARCHETYPES } from '../lib/scoring'
import { setData, startFresh, useData } from '../lib/store'
import { uid } from '../lib/text'

const STEPS = ['Calibrate', 'First bet', 'Constitution'] as const

export default function Onboarding() {
  const data = useData()
  const nav = useNavigate()
  const lastQuiz = data.quizHistory[data.quizHistory.length - 1]
  const ownBets = data.isDemo ? 0 : data.bets.length
  const [step, setStep] = useState<number>(() => (ownBets > 0 ? 2 : lastQuiz ? 1 : 0))

  const [idea, setIdea] = useState('')
  const [prob, setProb] = useState(40)
  const [company, setCompany] = useState(data.isDemo ? '' : data.constitution.company)
  const [northStar, setNorthStar] = useState(data.isDemo ? '' : data.constitution.northStar)
  const [goal, setGoal] = useState('')
  const [nongoal, setNongoal] = useState('')
  const [capacity, setCapacity] = useState(data.isDemo ? 5 : data.constitution.capacity)

  const createBet = () => {
    if (!idea.trim()) return
    if (data.isDemo) startFresh()
    const d = heuristicAssist(idea)
    const { assumptions: _a, source: _s, ...fields } = d
    void _a
    void _s
    const bet = { ...blankBet(), ...fields, probability: prob / 100, hypothesis: fields.hypothesis || idea.trim() }
    setData((x) => ({ ...x, bets: [bet, ...x.bets] }))
    setStep(2)
  }

  const finish = () => {
    setData((x) => ({
      ...x,
      isDemo: false,
      constitution: {
        ...x.constitution,
        company: company.trim() || x.constitution.company,
        northStar: northStar.trim() || x.constitution.northStar,
        capacity: capacity || x.constitution.capacity,
        principles: [
          ...x.constitution.principles,
          ...(goal.trim() ? [{ id: uid(), kind: 'goal' as const, text: goal.trim(), keywords: '', weight: 4 }] : []),
          ...(nongoal.trim() ? [{ id: uid(), kind: 'nongoal' as const, text: nongoal.trim(), keywords: '', weight: 4 }] : []),
        ],
      },
      settings: { ...x.settings, onboardedAt: new Date().toISOString() },
    }))
    nav('/app')
  }

  const input = 'w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40'

  return (
    <div className="min-h-screen grad-bg text-white">
      <SiteNav dark />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-6 sm:px-6">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">{t("60-second setup")}</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t("Set up your judgment ledger")}</h1>
        </div>
        <ol className="mt-8 grid grid-cols-3 gap-2" aria-label={t("Setup progress")}>
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? 'step' : undefined} className={cx('rounded-xl border px-3 py-2 text-center text-sm font-semibold', i === step ? 'border-white bg-white text-ink' : i < step ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-200' : 'border-white/10 bg-white/5 text-white/60')}>
              {i < step ? '✓ ' : `${i + 1}. `}
              {t(s)}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section className="rise mt-8 rounded-3xl border border-white/10 bg-white/5 p-6" aria-labelledby="s1">
            <h2 id="s1" className="text-xl font-bold">{t("Find your calibration baseline")}</h2>
            <p className="mt-2 text-white/70">{t("15 sourced product-history questions. You pick an answer and say how sure you are. That shows whether you tend to be over- or underconfident before you put numbers on real bets.")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton to="/test" variant="light" size="lg">{t("Take the 3-min test →")}</LinkButton>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setStep(1)}>{t("Skip for now")}</Button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="rise mt-8 rounded-3xl border border-white/10 bg-white/5 p-6" aria-labelledby="s2">
            {lastQuiz && (
              <div className="mb-4 rounded-xl bg-black/20 px-4 py-2 text-sm text-white/75">
                {t("Baseline:")} <strong className="text-white">{lastQuiz.score}/100</strong> · {(ARCHETYPES[lastQuiz.archetype] ?? ARCHETYPES.navigator).emoji} {t((ARCHETYPES[lastQuiz.archetype] ?? ARCHETYPES.navigator).name)}
              </div>
            )}
            <h2 id="s2" className="text-xl font-bold">{t("What's one thing your team is building next?")}</h2>
            <p className="mt-1 text-sm text-white/60">{t("Write it the way you'd say it in standup. We'll structure it into a bet with a metric, target, kill criteria and review date. You can edit everything later.")}</p>
            <label htmlFor="idea" className="sr-only">{t("Your idea")}</label>
            <textarea id="idea" rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} className={cx(input, 'mt-4')} placeholder={t("e.g. Add a guided checklist for new teams. Should lift week-1 activation by 5%. About 2 sprints.")} />
            <div className="mt-5">
              <div className="flex items-baseline justify-between">
                <label htmlFor="p" className="font-semibold">{t("How likely is it to hit its target?")}</label>
                <span className="text-2xl font-extrabold tabular-nums">{prob}%</span>
              </div>
              <input id="p" type="range" min={5} max={95} step={5} value={prob} onChange={(e) => setProb(+e.target.value)} className="conf mt-3 w-full" dir="ltr" style={{ ['--fill' as string]: `${((prob - 5) / 90) * 100}%` }} />
              <p className="mt-1 text-xs text-white/50">{t("Be honest: this is the number you get scored on when the bet resolves.")}</p>
            </div>
            {data.isDemo && <p className="mt-4 text-xs text-amber-200">{t("Creating your first bet clears the demo data (your quiz history stays).")}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" variant="light" onClick={createBet} disabled={!idea.trim()}>{t("Create my first bet →")}</Button>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setStep(2)}>{t("Skip")}</Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rise mt-8 rounded-3xl border border-white/10 bg-white/5 p-6" aria-labelledby="s3">
            <h2 id="s3" className="text-xl font-bold">{t("Write a 30-second product constitution")}</h2>
            <p className="mt-1 text-sm text-white/60">{t("Each bet gets checked against this: does it serve a goal, or break a non-goal? You can add principles and weights later.")}</p>
            <div className="mt-4 grid gap-3">
              <div>
                <label htmlFor="co" className="text-sm font-semibold">{t("Product or team")}</label>
                <input id="co" className={cx(input, 'mt-1')} value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t("e.g. Acme Billing")} />
              </div>
              <div>
                <label htmlFor="ns" className="text-sm font-semibold">{t("North-star metric")}</label>
                <input id="ns" className={cx(input, 'mt-1')} value={northStar} onChange={(e) => setNorthStar(e.target.value)} placeholder={t("e.g. Weekly active paying teams")} />
              </div>
              <div>
                <label htmlFor="g" className="text-sm font-semibold">{t("One goal for this quarter")}</label>
                <input id="g" className={cx(input, 'mt-1')} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={t("e.g. Improve new-team activation in week one")} />
              </div>
              <div>
                <label htmlFor="ng" className="text-sm font-semibold">{t("One thing you will NOT do")}</label>
                <input id="ng" className={cx(input, 'mt-1')} value={nongoal} onChange={(e) => setNongoal(e.target.value)} placeholder={t("e.g. No custom one-off work for a single customer")} />
              </div>
              <div>
                <label htmlFor="cap" className="text-sm font-semibold">{t("Max bets in flight at once")}</label>
                <input id="cap" type="number" min={1} max={30} className={cx(input, 'mt-1 w-28')} value={capacity} onChange={(e) => setCapacity(Math.max(1, Math.min(30, +e.target.value || 1)))} />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" variant="light" onClick={finish}>{t("Finish and open my dashboard →")}</Button>
            </div>
          </section>
        )}
        <p className="mt-6 text-center text-xs text-white/45">
          {t("Everything stays in your browser.")} <Link to="/app" className="underline hover:text-white">{t("Skip setup and look around")}</Link>
        </p>
      </main>
    </div>
  )
}
