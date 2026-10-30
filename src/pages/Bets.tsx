import { t, useLang } from '../lib/i18n'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/AppShell'
import { BetEditor } from '../components/BetEditor'
import { blankBet } from '../lib/bets'
import { FitPill, OverloadMeter } from '../components/charts'
import { Badge, Button, EmptyState, Modal } from '../components/ui'
import { cx, money } from '../lib/format'
import { fitScore, overload } from '../lib/constitution'
import { setData, useData } from '../lib/store'
import { todayISO } from '../lib/text'
import type { Bet, BetOutcome } from '../lib/types'

type Filter = 'all' | 'open' | 'resolved' | 'killed'

export default function Bets() {
  const data = useData()
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Bet | null>(() => (params.get('new') ? blankBet() : null))
  const [resolving, setResolving] = useState<Bet | null>(null)
  const [killing, setKilling] = useState<Bet | null>(null)
  const today = todayISO()

  useEffect(() => {
    if (params.get('new')) setParams({}, { replace: true })
  }, [params, setParams])

  const lang = useLang()
  const list = useMemo(() => {
    if (!lang) return []
    const order = { open: 0, resolved: 1, killed: 2 }
    return data.bets
      .filter((b) => filter === 'all' || b.status === filter)
      .filter((b) => !q.trim() || `${b.title} ${b.metric} ${b.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()))
      .map((b) => ({ b, fit: fitScore(b, data.constitution) }))
      .sort((x, y) => order[x.b.status] - order[y.b.status] || (x.b.reviewDate || '9').localeCompare(y.b.reviewDate || '9'))
  }, [data.bets, data.constitution, filter, q, lang])

  const ol = overload(data.bets, data.constitution)
  const counts = { all: data.bets.length, open: 0, resolved: 0, killed: 0 }
  data.bets.forEach((b) => counts[b.status]++)

  return (
    <>
      <PageHeader
        title={t("Bet Ledger")}
        subtitle={t("Every initiative is a bet: a probability, a metric, a deadline, and a way to die. Resolve each one honestly and your calibration builds itself.")}
        actions={<Button onClick={() => setEditing(blankBet())}>{t("+ New bet")}</Button>}
      />

      <div className="mb-5 grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="tablist" aria-label={t("Filter bets")}>
            {(['all', 'open', 'resolved', 'killed'] as Filter[]).map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cx('focus-ring whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold capitalize', filter === f ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800')}>
                {t(f)} <span className="ms-1 text-xs tabular-nums text-slate-400">{counts[f]}</span>
              </button>
            ))}
          </div>
          <label htmlFor="search" className="sr-only">{t("Search bets")}</label>
          <input id="search" className="input sm:ms-auto sm:max-w-xs" placeholder={t("Search title, metric, tag…")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="card p-4"><OverloadMeter o={ol} /></div>
      </div>

      {data.bets.length === 0 ? (
        <EmptyState title={t("No bets yet")} body={t("Paste a raw idea and let AI assist turn it into your first bet, with a metric, a probability and kill criteria.")} action={<Button onClick={() => setEditing(blankBet())}>{t("Place your first bet")}</Button>} />
      ) : list.length === 0 ? (
        <p className="card p-8 text-center text-sm text-slate-500">{t("No bets match.")}</p>
      ) : (
        <ul className="space-y-3">
          {list.map(({ b, fit }) => {
            const overdue = b.status === 'open' && b.reviewDate && b.reviewDate <= today
            const topFlag = fit.flags.find((f) => f.level !== 'ok')
            return (
              <li key={b.id} className="card p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex shrink-0 items-center gap-3 sm:w-24 sm:flex-col sm:items-start sm:gap-1">
                    <div className="text-2xl font-extrabold tabular-nums text-brand-700">{Math.round(b.probability * 100)}%</div>
                    <StatusBadge b={b} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{b.title}</h3>
                      {b.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                    </div>
                    {b.hypothesis && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{b.hypothesis}</p>}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span><strong className="text-slate-700">{t("Metric:")}</strong> {b.metric || '—'} {b.target && <>→ <strong className="text-slate-700">{b.target}</strong></>}</span>
                      <span><strong className="text-slate-700">{t("Cost:")}</strong> {b.cost} {t("pw")}</span>
                      <span className={cx(overdue && 'font-semibold text-rose-600')}><strong className="text-slate-700">{t("Review:")}</strong> {b.reviewDate || '—'}{overdue && t(' · due')}</span>
                      {b.status === 'killed' && b.savedWeeks ? <span className="text-emerald-700"><strong>{t("Saved:")}</strong> {t('{n} pw ≈ {m}', { n: b.savedWeeks, m: money(b.savedWeeks * data.settings.weeklyCost, data.settings.currency) })}</span> : null}
                    </div>
                    {b.status === 'open' && topFlag && <p className={cx('mt-2 text-xs font-medium', topFlag.level === 'error' ? 'text-rose-600' : 'text-amber-700')}>{topFlag.level === 'error' ? '🔴' : '🟡'} {topFlag.text}</p>}
                    {b.learnings && b.status !== 'open' && <p className="mt-2 text-xs italic text-slate-500">“{b.learnings}”</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <FitPill score={fit.score} />
                    <div className="flex gap-1">
                      {b.status === 'open' && (
                        <>
                          <Button size="sm" onClick={() => setResolving(b)}>{t("Resolve")}</Button>
                          <Button size="sm" variant="secondary" onClick={() => setKilling(b)}>{t("Kill")}</Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setEditing(b)} aria-label={t('Edit {x}', { x: b.title })}>{t("Edit")}</Button>
                      <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => confirm(t('Delete “{x}”?', { x: b.title })) && setData((d) => ({ ...d, bets: d.bets.filter((x) => x.id !== b.id) }))} aria-label={t('Delete {x}', { x: b.title })}>✕</Button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editing && <BetEditor key={editing.id} open onClose={() => setEditing(null)} initial={editing} />}
      {resolving && <ResolveModal bet={resolving} onClose={() => setResolving(null)} />}
      {killing && <KillModal bet={killing} onClose={() => setKilling(null)} />}
    </>
  )
}

export function StatusBadge({ b }: { b: Bet }) {
  if (b.status === 'open') return <Badge tone="brand">{t("Open")}</Badge>
  if (b.status === 'killed') return <Badge tone="amber">{t("Killed")}</Badge>
  if (b.outcome === 'hit') return <Badge tone="green">{t("Hit")}</Badge>
  if (b.outcome === 'partial') return <Badge tone="cyan">{t("Partial")}</Badge>
  return <Badge tone="red">{t("Miss")}</Badge>
}

function ResolveModal({ bet, onClose }: { bet: Bet; onClose: () => void }) {
  const [outcome, setOutcome] = useState<BetOutcome>('hit')
  const [learnings, setLearnings] = useState(bet.learnings)
  const save = () => {
    setData((d) => ({ ...d, bets: d.bets.map((b) => (b.id === bet.id ? { ...b, status: 'resolved', outcome, learnings, resolvedAt: todayISO() } : b)) }))
    onClose()
  }
  const opts: { v: BetOutcome; label: string; desc: string; cls: string }[] = [
    { v: 'hit', label: t('Hit'), desc: t('Reached {x}', { x: bet.target || t('the target') }), cls: 'peer-checked:border-emerald-500 peer-checked:bg-emerald-50' },
    { v: 'partial', label: t('Partial'), desc: t('Moved, but short of target'), cls: 'peer-checked:border-cyan-500 peer-checked:bg-cyan-50' },
    { v: 'miss', label: t('Miss'), desc: t('No meaningful movement'), cls: 'peer-checked:border-rose-500 peer-checked:bg-rose-50' },
  ]
  return (
    <Modal open onClose={onClose} title={t('Resolve: {x}', { x: bet.title })}>
      <p className="text-sm text-slate-600">{t('You said {p}% that {m} would reach {x}. What happened?', { p: Math.round(bet.probability * 100), m: bet.metric || t('the metric'), x: bet.target || t('target') })}</p>
      <fieldset className="mt-4 grid grid-cols-3 gap-2">
        <legend className="sr-only">{t("Outcome")}</legend>
        {opts.map((o) => (
          <label key={o.v} className="cursor-pointer">
            <input type="radio" name="outcome" className="peer sr-only" checked={outcome === o.v} onChange={() => setOutcome(o.v)} />
            <div className={cx('rounded-xl border-2 border-slate-200 p-3 text-center transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500', o.cls)}>
              <div className="font-bold">{o.label}</div>
              <div className="mt-0.5 text-xs text-slate-500">{o.desc}</div>
            </div>
          </label>
        ))}
      </fieldset>
      <label className="label mt-4" htmlFor="learn">{t("What did you learn?")}</label>
      <textarea id="learn" rows={3} className="input" value={learnings} onChange={(e) => setLearnings(e.target.value)} placeholder={t("Lift came almost entirely from…")} />
      <p className="mt-2 text-xs text-slate-500">{t("Scoring: hit = 1, partial = 0.5, miss = 0. Your Brier score updates right away.")}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>{t("Cancel")}</Button>
        <Button onClick={save}>{t("Resolve bet")}</Button>
      </div>
    </Modal>
  )
}

function KillModal({ bet, onClose }: { bet: Bet; onClose: () => void }) {
  const data = useData()
  const [saved, setSaved] = useState(Math.round(bet.cost * 0.6 * 2) / 2)
  const [learnings, setLearnings] = useState(bet.learnings)
  const save = () => {
    setData((d) => ({ ...d, bets: d.bets.map((b) => (b.id === bet.id ? { ...b, status: 'killed', savedWeeks: saved, learnings, resolvedAt: todayISO() } : b)) }))
    onClose()
  }
  return (
    <Modal open onClose={onClose} title={t('Kill: {x}', { x: bet.title })}>
      <p className="text-sm text-slate-600">{t('Killing a bet early is a win: it frees capacity for better bets.')} <strong>{t('Kill criteria:')}</strong> <em>{bet.killCriteria || t('none set')}</em></p>
      <label className="label mt-4" htmlFor="saved">{t("Person-weeks NOT spent thanks to killing it")}</label>
      <input id="saved" type="number" min={0} step={0.5} className="input" value={saved} onChange={(e) => setSaved(Math.max(0, +e.target.value))} />
      <p className="mt-1 text-xs text-slate-500">{t('≈ {a} at {b}/person-week (change this in Settings).', { a: money(saved * data.settings.weeklyCost, data.settings.currency), b: money(data.settings.weeklyCost, data.settings.currency) })}</p>
      <label className="label mt-4" htmlFor="klearn">{t("Why kill it?")}</label>
      <textarea id="klearn" rows={3} className="input" value={learnings} onChange={(e) => setLearnings(e.target.value)} placeholder={t("Prototype test failed 4/5…")} />
      <p className="mt-2 text-xs text-slate-500">{t("For calibration, a killed bet counts as a miss (it did not hit).")}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="danger" onClick={save}>{t("Kill bet")}</Button>
      </div>
    </Modal>
  )
}
