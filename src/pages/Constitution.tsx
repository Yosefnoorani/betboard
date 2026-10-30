import { t, useLang } from '../lib/i18n'
import { useMemo, useState } from 'react'
import { PageHeader } from '../components/AppShell'
import { FitPill, OverloadMeter } from '../components/charts'
import { Badge, Button } from '../components/ui'
import { cx } from '../lib/format'
import { fitScore, overload } from '../lib/constitution'
import { setData, useData } from '../lib/store'
import { uid } from '../lib/text'
import type { Constitution as C, Principle, PrincipleKind } from '../lib/types'

const KINDS: { k: PrincipleKind; label: string; hint: string; tone: 'green' | 'brand' | 'red' }[] = [
  { k: 'goal', label: 'Goals', hint: 'Outcomes you are trying to move this period. Bets that serve them score higher.', tone: 'green' },
  { k: 'principle', label: 'Principles', hint: 'How you build. Tie-breakers when two bets look equally good.', tone: 'brand' },
  { k: 'nongoal', label: 'Non-goals', hint: 'What you explicitly will NOT do. Bets that touch these are flagged and penalised.', tone: 'red' },
]

export default function Constitution() {
  const data = useData()
  const c = data.constitution
  const [idea, setIdea] = useState('')
  const set = (patch: Partial<C>) => setData((d) => ({ ...d, constitution: { ...d.constitution, ...patch } }))
  const setP = (id: string, patch: Partial<Principle>) => set({ principles: c.principles.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  const add = (kind: PrincipleKind) => set({ principles: [...c.principles, { id: uid(), kind, text: '', keywords: '', weight: 3 }] })
  const remove = (id: string) => set({ principles: c.principles.filter((p) => p.id !== id) })
  const ol = overload(data.bets, c)
  const lang = useLang()
  const test = useMemo(() => (lang && idea.trim() ? fitScore({ title: idea, hypothesis: idea }, c) : null), [idea, c, lang])

  return (
    <>
      <PageHeader
        title={t("Product Constitution")}
        subtitle={t("Your strategy as executable rules. Every bet is scored against it automatically, so 'is this on-strategy?' gets answered before the roadmap review.")}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="card grid gap-3 p-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-company">{t("Product / team")}</label>
              <input id="c-company" className="input" value={c.company} onChange={(e) => set({ company: e.target.value })} placeholder={t("Acme Checkout")} />
            </div>
            <div>
              <label className="label" htmlFor="c-ns">{t("North-star metric")}</label>
              <input id="c-ns" className="input" value={c.northStar} onChange={(e) => set({ northStar: e.target.value })} placeholder={t("Weekly active teams")} />
            </div>
          </section>

          {KINDS.map(({ k, label, hint, tone }) => {
            const items = c.principles.filter((p) => p.kind === k)
            return (
              <section key={k} className="card p-5" aria-labelledby={`h-${k}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 id={`h-${k}`} className="flex items-center gap-2 font-bold">{t(label)} <Badge tone={tone}>{items.length}</Badge></h2>
                    <p className="mt-0.5 text-xs text-slate-500">{t(hint)}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => add(k)}>{t("+ Add")}</Button>
                </div>
                <ul className="mt-4 space-y-3">
                  {items.map((p, idx) => (
                    <li key={p.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex gap-2">
                        <label className="sr-only" htmlFor={`t-${p.id}`}>{t(label)} {idx + 1}</label>
                        <input id={`t-${p.id}`} className="input font-medium" value={p.text} onChange={(e) => setP(p.id, { text: e.target.value })} placeholder={t(k === 'nongoal' ? 'No bespoke enterprise features' : k === 'goal' ? 'Increase 7-day activation' : 'Self-serve before sales-assisted')} />
                        <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => remove(p.id)} aria-label={t('Remove {x}', { x: p.text || t('item') })}>✕</Button>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_180px]">
                        <div>
                          <label className="text-xs font-semibold text-slate-500" htmlFor={`k-${p.id}`}>{t("Keywords (comma separated, optional)")}</label>
                          <input id={`k-${p.id}`} className="input mt-1 text-sm" value={p.keywords} onChange={(e) => setP(p.id, { keywords: e.target.value })} placeholder={t("activation, onboarding, signup")} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500" htmlFor={`w-${p.id}`}>{t('Weight: {n}', { n: p.weight })}</label>
                          <input id={`w-${p.id}`} type="range" min={1} max={5} value={p.weight} onChange={(e) => setP(p.id, { weight: +e.target.value })} className="conf mt-3 w-full" dir="ltr" style={{ ['--fill' as string]: `${((p.weight - 1) / 4) * 100}%` }} />
                        </div>
                      </div>
                    </li>
                  ))}
                  {items.length === 0 && <li className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">{t("None yet.")}</li>}
                </ul>
              </section>
            )
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="card p-5">
            <h2 className="font-bold">{t("Test an idea")}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t("Type any feature idea and see how it scores against your constitution.")}</p>
            <label htmlFor="idea" className="sr-only">{t("Idea")}</label>
            <textarea id="idea" rows={3} className="input mt-3" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder={t("Custom SSO integration for one big prospect")} />
            {test && (
              <div className="mt-3" role="status">
                <div className="flex items-center justify-between text-sm"><span>{t("Strategic alignment")}</span><FitPill score={Math.max(0, Math.round((test.alignment / 60) * 100) - test.penalty)} /></div>
                <ul className="mt-2 space-y-1 text-xs">
                  {test.matched.map((m) => <li key={m.principle.id} className="text-emerald-700">✓ {m.principle.text}</li>)}
                  {test.violations.map((v) => <li key={v.principle.id} className="font-semibold text-rose-600">{t('✕ Violates non-goal: {x}', { x: v.principle.text })}</li>)}
                  {test.matched.length === 0 && test.violations.length === 0 && <li className="text-amber-700">{t("Doesn't touch any goal. Is it on-strategy?")}</li>}
                </ul>
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-bold">{t("Capacity")}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t("Feature overload starts here. Set honest limits for parallel bets.")}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="cap">{t("Max open bets")}</label>
                <input id="cap" type="number" min={1} className="input" value={c.capacity} onChange={(e) => set({ capacity: Math.max(1, +e.target.value) })} />
              </div>
              <div>
                <label className="label" htmlFor="capw">{t("Person-weeks")}</label>
                <input id="capw" type="number" min={1} className="input" value={c.capacityWeeks} onChange={(e) => set({ capacityWeeks: Math.max(1, +e.target.value) })} />
              </div>
            </div>
            <div className="mt-4"><OverloadMeter o={ol} /></div>
          </section>

          <section className={cx('card p-5 text-sm', 'bg-slate-50')}>
            <h2 className="font-bold">{t("How fit is scored")}</h2>
            <ul className="mt-2 list-disc space-y-1 ps-4 text-xs text-slate-600">
              <li><strong>{t("Alignment (0–60):")}</strong> {t("weight × 12 for each goal or principle the bet mentions.")}</li>
              <li><strong>{t("Bet quality (0–40):")}</strong> {t("metric, numeric target, kill criteria, review date, a non-extreme probability.")}</li>
              <li><strong>{t("Non-goal penalty:")}</strong> {t("weight × 8 for each non-goal touched (max 40).")}</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  )
}
