import { t } from '../lib/i18n'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/AppShell'
import { CalibrationChart, FitPill, OverloadMeter } from '../components/charts'
import { Badge, LinkButton, ScoreRing, Stat } from '../components/ui'
import { money, pct } from '../lib/format'
import { fitScore, overload } from '../lib/constitution'
import { ledgerStats } from '../lib/ledger'
import { ARCHETYPES, biasOf, scoreLabel } from '../lib/scoring'
import { useData } from '../lib/store'

export default function Dashboard() {
  const data = useData()
  const st = ledgerStats(data.bets)
  const ol = overload(data.bets, data.constitution)
  const scored = st.resolved + st.killed
  const bias = biasOf(st.gap)
  const lastQuiz = data.quizHistory[data.quizHistory.length - 1]
  const weakest = data.bets
    .filter((b) => b.status === 'open')
    .map((b) => ({ b, fit: fitScore(b, data.constitution) }))
    .sort((a, z) => a.fit.score - z.fit.score)
    .slice(0, 3)

  return (
    <>
      <PageHeader
        title={data.settings.displayName ? t("{name}'s judgment", { name: data.settings.displayName }) : t('Your product judgment')}
        subtitle={t("Are your bets calibrated? Is your roadmap overloaded? Is anything off-strategy? All on one screen.")}
        actions={<LinkButton to="/app/bets?new=1">{t("+ New bet")}</LinkButton>}
      />

      {!data.settings.onboardedAt && <SetupChecklist />}

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <section className="card flex flex-col items-center justify-center p-6 text-center" aria-label={t("Judgment score")}>
          <ScoreRing value={scored ? st.score : 0} size={150} label={t("Judgment")} />
          <div className="mt-3 text-lg font-bold">{scored ? t(scoreLabel(st.score)) : t('No resolved bets yet')}</div>
          <p className="mt-1 text-sm text-slate-500">
            {scored < 5 ? t(scored === 1 ? 'Based on {n} scored bet. Resolve at least 5 for a stable signal.' : 'Based on {n} scored bets. Resolve at least 5 for a stable signal.', { n: scored }) : t('Based on {n} scored bets.', { n: scored })}
          </p>
          {scored > 0 && (
            <Badge tone={bias === 'calibrated' ? 'green' : bias === 'overconfident' ? 'red' : 'amber'} className="mt-3">
              {bias === 'calibrated' ? t('Well calibrated') : t(bias === 'overconfident' ? 'Overconfident by {g} pts' : 'Underconfident by {g} pts', { g: Math.abs(Math.round(st.gap)) })}
            </Badge>
          )}
        </section>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label={t("Brier score")} value={scored ? st.brier.toFixed(3) : '—'} hint={t("0 = perfect, 0.25 = coin flip")} />
          <Stat label={t("Hit rate")} value={scored ? pct(st.hitRate) : '—'} hint={t('{h} hit · {p} partial · {m} miss/killed', { h: st.hits, p: st.partials, m: st.misses + st.killed })} />
          <Stat label={t("Open bets")} value={`${st.open}`} hint={t('capacity {n}', { n: data.constitution.capacity })} tone={ol.level === 'overloaded' ? 'red' : undefined} />
          <Stat label={t("Saved by killing")} value={money(st.savedWeeks * data.settings.weeklyCost, data.settings.currency)} hint={t('{n} person-weeks freed', { n: st.savedWeeks })} tone="green" />
          <section className="card col-span-2 p-4 md:col-span-4">
            <OverloadMeter o={ol} />
          </section>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{t("Calibration curve")}</h2>
            <Link to="/app/record" className="text-sm font-semibold text-brand-700 hover:underline">{t("Track record →")}</Link>
          </div>
          <p className="mt-1 text-xs text-slate-500">{t("When you say 70%, does it happen 70% of the time? Points under the diagonal mean overconfidence.")}</p>
          {scored ? <CalibrationChart buckets={st.buckets} /> : <p className="py-16 text-center text-sm text-slate-500">{t("Resolve bets to see your curve.")}</p>}
        </section>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="font-bold">{t("Due for review")} <span className="text-slate-500">({st.dueForReview.length})</span></h2>
            {st.dueForReview.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{t("Nothing due. Nice.")}</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {st.dueForReview.slice(0, 5).map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0 truncate"><strong>{b.title}</strong> <span className="text-slate-500">· {Math.round(b.probability * 100)}% · {b.metric}</span></span>
                    <span className="shrink-0 text-xs font-semibold text-rose-600">{b.reviewDate}</span>
                  </li>
                ))}
              </ul>
            )}
            {st.dueForReview.length > 0 && <LinkButton to="/app/bets" size="sm" variant="secondary" className="mt-3">{t("Resolve now")}</LinkButton>}
          </section>

          <section className="card p-5">
            <h2 className="font-bold">{t("Weakest-fit open bets")}</h2>
            <p className="mt-1 text-xs text-slate-500">{t("Scored against your Product Constitution. Candidates to cut first.")}</p>
            <ul className="mt-3 space-y-2">
              {weakest.map(({ b, fit }) => (
                <li key={b.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{b.title}</div>
                    <div className="truncate text-xs text-slate-500">{fit.flags.find((f) => f.level !== 'ok')?.text ?? t('Looks solid')}</div>
                  </div>
                  <FitPill score={fit.score} />
                </li>
              ))}
              {weakest.length === 0 && <li className="text-sm text-slate-500">{t("No open bets.")}</li>}
            </ul>
          </section>

          <section className="grad-bg rounded-2xl p-5 text-white shadow-sm">
            <h2 className="font-bold">{t("PM Judgment Score test")}</h2>
            <p className="mt-1 text-sm text-white/75">
              {lastQuiz ? t('Your last score: {s}/100 ({a}). Can you beat it?', { s: lastQuiz.score, a: t(ARCHETYPES[lastQuiz.archetype]?.name ?? lastQuiz.archetype) }) : t('Benchmark your calibration in 3 minutes with 15 real product-history questions.')}
            </p>
            <LinkButton to="/test" variant="light" size="sm" className="mt-3">{lastQuiz ? t('Retake') : t('Take the test')}</LinkButton>
          </section>
        </div>
      </div>
    </>
  )
}

function SetupChecklist() {
  const data = useData()
  const items = [
    { done: data.quizHistory.length > 0, label: t('Find your calibration baseline'), to: '/test' },
    { done: !data.isDemo && data.bets.length > 0, label: t('Log your first real bet'), to: '/start' },
    { done: !data.isDemo && !!data.constitution.northStar, label: t('Write your product constitution'), to: '/start' },
  ]
  const n = items.filter((i) => i.done).length
  return (
    <section className="card mb-4 flex flex-col gap-4 border-brand-200 bg-brand-50/60 p-5 md:flex-row md:items-center" aria-label={t("Setup checklist")}>
      <div className="md:w-56">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-700">{t('Setup · {n}/3', { n })}</div>
        <div className="mt-1 font-bold">{data.isDemo ? t('You are looking at demo data') : t('Finish your setup')}</div>
      </div>
      <ul className="flex flex-1 flex-col gap-2 sm:flex-row">
        {items.map((i) => (
          <li key={i.label} className="flex-1">
            <Link to={i.to} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${i.done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white hover:border-brand-400'}`}>
              <span aria-hidden>{i.done ? '✓' : '○'}</span>
              <span>{t(i.label)}</span>
              <span className="sr-only">{i.done ? t('(done)') : t('(to do)')}</span>
            </Link>
          </li>
        ))}
      </ul>
      <LinkButton to="/start">{t("Start 60-second setup")}</LinkButton>
    </section>
  )
}
