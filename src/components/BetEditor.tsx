import { useMemo, useState } from 'react'
import type { Bet } from '../lib/types'
import { fitScore } from '../lib/constitution'
import { heuristicAssist, llmAssist, type BetDraft } from '../lib/assist'
import { setData, useData } from '../lib/store'
import { addDays, todayISO, uid } from '../lib/text'
import { Badge, Button, Modal, cx } from './ui'
import { FitPill } from './charts'

const SAMPLE = `Add an AI "explain this chart" button for new teams. Customers asked for it in 6 interviews; they get stuck reading dashboards in week one. Should improve activation by 5%. Roughly 2 sprints for one squad.`

export function blankBet(): Bet {
  return {
    id: uid(),
    title: '',
    hypothesis: '',
    metric: '',
    baseline: '',
    target: '',
    probability: 0.4,
    killCriteria: '',
    reviewDate: addDays(new Date(), 42),
    cost: 4,
    owner: '',
    tags: [],
    status: 'open',
    learnings: '',
    createdAt: todayISO(),
  }
}

export function BetEditor({ open, onClose, initial }: { open: boolean; onClose: () => void; initial: Bet }) {
  const data = useData()
  const [bet, setBet] = useState<Bet>(initial)
  const [raw, setRaw] = useState('')
  const [busy, setBusy] = useState(false)
  const [assist, setAssist] = useState<{ draft: BetDraft; note?: string } | null>(null)
  const isNew = !data.bets.some((b) => b.id === initial.id)
  const fit = useMemo(() => fitScore(bet, data.constitution), [bet, data.constitution])
  const hasKey = data.settings.apiKey.trim().length > 0

  const up = <K extends keyof Bet>(k: K, v: Bet[K]) => setBet((b) => ({ ...b, [k]: v }))

  const runAssist = async () => {
    if (!raw.trim()) return
    setBusy(true)
    let draft: BetDraft
    let note: string | undefined
    try {
      draft = hasKey ? await llmAssist(raw, data.settings) : heuristicAssist(raw)
    } catch (e) {
      draft = heuristicAssist(raw)
      note = `AI request failed (${(e as Error).message}). Used the offline structurer instead.`
    }
    setBusy(false)
    setAssist({ draft, note })
    setBet((b) => ({ ...b, ...draft, id: b.id, status: b.status, createdAt: b.createdAt, owner: b.owner || data.settings.displayName, learnings: b.learnings }))
  }

  const save = () => {
    if (!bet.title.trim()) return
    setData((d) => ({
      ...d,
      bets: isNew ? [bet, ...d.bets] : d.bets.map((b) => (b.id === bet.id ? bet : b)),
    }))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isNew ? 'New bet' : 'Edit bet'} wide>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">✨ AI assist</h3>
              <Badge tone={hasKey ? 'green' : 'slate'}>{hasKey ? `LLM: ${data.settings.model}` : 'Offline structurer'}</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-600">Paste a raw idea, Slack thread or PRD. It gets turned into a falsifiable bet. {hasKey ? 'Your text goes straight from your browser to your endpoint.' : 'Add your own API key in Settings for LLM-quality drafts.'}</p>
            <label htmlFor="raw" className="sr-only">Raw idea or PRD</label>
            <textarea id="raw" rows={7} className="input mt-3 bg-white" placeholder="e.g. We should add SSO because enterprise prospects keep asking…" value={raw} onChange={(e) => setRaw(e.target.value)} />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={runAssist} disabled={busy || !raw.trim()}>{busy ? 'Structuring…' : 'Structure into a bet'}</Button>
              <Button variant="ghost" size="sm" onClick={() => setRaw(SAMPLE)}>Try a sample</Button>
            </div>
            {assist && (
              <div className="mt-3 rounded-xl bg-white p-3 text-xs text-slate-600" role="status">
                {assist.note && <p className="mb-2 font-medium text-amber-700">{assist.note}</p>}
                <p className="font-semibold text-slate-800">Riskiest assumptions to test:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">{assist.draft.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
                <p className="mt-2">Form filled ({assist.draft.source === 'llm' ? 'LLM' : 'offline heuristic'}). Review it, especially the probability.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Constitution check</h3>
              <FitPill score={fit.score} />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-slate-50 p-2"><div className="font-bold tabular-nums">{fit.alignment}/60</div>alignment</div>
              <div className="rounded-lg bg-slate-50 p-2"><div className="font-bold tabular-nums">{fit.quality}/40</div>bet quality</div>
              <div className="rounded-lg bg-slate-50 p-2"><div className="font-bold tabular-nums text-rose-600">−{fit.penalty}</div>non-goals</div>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {fit.flags.map((f) => (
                <li key={f.text} className="flex gap-2">
                  <span aria-hidden>{f.level === 'error' ? '🔴' : f.level === 'warn' ? '🟡' : '🟢'}</span>
                  <span className={cx(f.level === 'error' && 'text-rose-700')}>{f.text}</span>
                </li>
              ))}
              {fit.matched.map((m) => (
                <li key={m.principle.id} className="flex gap-2 text-emerald-700"><span aria-hidden>✓</span>Supports: {m.principle.text}</li>
              ))}
            </ul>
            {data.constitution.principles.length === 0 && <p className="mt-2 text-xs text-slate-500">Tip: write your Constitution to get alignment scoring.</p>}
          </div>
        </div>

        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save() }}>
          <div>
            <label className="label" htmlFor="b-title">Bet title *</label>
            <input id="b-title" className="input" required value={bet.title} onChange={(e) => up('title', e.target.value)} placeholder="Guided onboarding checklist" />
          </div>
          <div>
            <label className="label" htmlFor="b-hyp">Hypothesis</label>
            <textarea id="b-hyp" rows={3} className="input" value={bet.hypothesis} onChange={(e) => up('hypothesis', e.target.value)} placeholder="We believe that … will … We'll know we're right when …" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="label" htmlFor="b-metric">Success metric</label>
              <input id="b-metric" className="input" value={bet.metric} onChange={(e) => up('metric', e.target.value)} placeholder="7-day activation" />
            </div>
            <div>
              <label className="label" htmlFor="b-base">Baseline</label>
              <input id="b-base" className="input" value={bet.baseline} onChange={(e) => up('baseline', e.target.value)} placeholder="31%" />
            </div>
            <div>
              <label className="label" htmlFor="b-target">Target</label>
              <input id="b-target" className="input" value={bet.target} onChange={(e) => up('target', e.target.value)} placeholder="+5pp" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <label className="label" htmlFor="b-prob">Probability it hits the target</label>
              <span className="text-lg font-extrabold tabular-nums text-brand-700">{Math.round(bet.probability * 100)}%</span>
            </div>
            <input id="b-prob" type="range" min={1} max={99} value={Math.round(bet.probability * 100)} onChange={(e) => up('probability', +e.target.value / 100)} className="conf w-full" style={{ ['--fill' as string]: `${bet.probability * 100}%` }} />
            <p className="mt-1 text-xs text-slate-500">Be honest. Most product bets miss their target, so if you're above 70% ask whether this is a bet or just a task.</p>
          </div>
          <div>
            <label className="label" htmlFor="b-kill">Kill criteria</label>
            <textarea id="b-kill" rows={2} className="input" value={bet.killCriteria} onChange={(e) => up('killCriteria', e.target.value)} placeholder="Kill if lift < 1pp after 4 weeks, or cost exceeds 6 person-weeks" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="b-date">Review date</label>
              <input id="b-date" type="date" className="input" value={bet.reviewDate} onChange={(e) => up('reviewDate', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="b-cost">Cost (person-weeks)</label>
              <input id="b-cost" type="number" min={0} step={0.5} className="input" value={bet.cost} onChange={(e) => up('cost', Math.max(0, +e.target.value))} />
            </div>
            <div>
              <label className="label" htmlFor="b-owner">Owner</label>
              <input id="b-owner" className="input" value={bet.owner} onChange={(e) => up('owner', e.target.value)} placeholder="You" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="b-tags">Tags (comma separated)</label>
            <input id="b-tags" className="input" value={bet.tags.join(', ')} onChange={(e) => up('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} placeholder="onboarding, ai" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!bet.title.trim()}>{isNew ? 'Place bet' : 'Save changes'}</Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
