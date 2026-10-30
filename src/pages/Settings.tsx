import { t } from '../lib/i18n'
import { useRef, useState } from 'react'
import { PageHeader } from '../components/AppShell'
import { Button } from '../components/ui'
import { download, exportJSON, importJSON, resetToDemo, setData, startFresh, useData } from '../lib/store'
import { llmAssist } from '../lib/assist'
import type { Settings as S } from '../lib/types'

export default function Settings() {
  const data = useData()
  const s = data.settings
  const set = (patch: Partial<S>) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [testMsg, setTestMsg] = useState('')
  const [showKey, setShowKey] = useState(false)

  const onImport = async (f: File) => {
    try {
      importJSON(await f.text())
      setMsg(t('Imported ✓'))
    } catch (e) {
      setMsg(t('Import failed: {e}', { e: (e as Error).message }))
    }
  }
  const testKey = async () => {
    setTestMsg(t('Testing…'))
    try {
      const d = await llmAssist('Add onboarding checklist to improve activation by 5% in 2 sprints', s)
      setTestMsg(t('Works ✓ (got "{x}")', { x: d.title }))
    } catch (e) {
      setTestMsg(t('Failed: {e}', { e: (e as Error).message }))
    }
  }

  return (
    <>
      <PageHeader title={t("Settings")} subtitle={t("Everything is stored in this browser only (localStorage). Nothing is sent to any BetBoard server, because there isn't one.")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-3 p-5">
          <h2 className="font-bold">{t("You")}</h2>
          <div>
            <label className="label" htmlFor="s-name">{t("Display name (shown on your track record)")}</label>
            <input id="s-name" className="input" value={s.displayName} onChange={(e) => set({ displayName: e.target.value })} placeholder={t("Dana Cohen")} />
          </div>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <div>
              <label className="label" htmlFor="s-cost">{t("Fully loaded cost per person-week")}</label>
              <input id="s-cost" type="number" min={0} className="input" value={s.weeklyCost} onChange={(e) => set({ weeklyCost: Math.max(0, +e.target.value) })} />
            </div>
            <div>
              <label className="label" htmlFor="s-cur">{t("Currency")}</label>
              <select id="s-cur" className="input" value={s.currency} onChange={(e) => set({ currency: e.target.value })}>
                {['USD', 'EUR', 'GBP', 'ILS', 'INR', 'CAD', 'AUD', 'JPY'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-bold">{t("AI assist (bring your own key)")}</h2>
          <p className="text-xs text-slate-500">{t("Works with any OpenAI-compatible")} <code>{t("/chat/completions")}</code> {t("endpoint (OpenAI, OpenRouter, Groq, Together, a local LM Studio or Ollama server…). The key is kept in this browser and requests go directly from your browser to that endpoint. With no key, a built-in offline structurer is used.")}</p>
          <div>
            <label className="label" htmlFor="s-key">{t("API key")}</label>
            <div className="flex gap-2">
              <input id="s-key" type={showKey ? 'text' : 'password'} autoComplete="off" className="input font-mono" value={s.apiKey} onChange={(e) => set({ apiKey: e.target.value })} placeholder={t("sk-…")} />
              <Button variant="secondary" size="sm" onClick={() => setShowKey(!showKey)}>{showKey ? t('Hide') : t('Show')}</Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-url">{t("Base URL")}</label>
              <input id="s-url" className="input font-mono text-sm" value={s.baseUrl} onChange={(e) => set({ baseUrl: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="s-model">{t("Model")}</label>
              <input id="s-model" className="input font-mono text-sm" value={s.model} onChange={(e) => set({ model: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" disabled={!s.apiKey} onClick={testKey}>{t("Test connection")}</Button>
            <span className="text-xs text-slate-600" role="status">{testMsg}</span>
          </div>
        </section>

        <section className="card space-y-3 p-5 lg:col-span-2">
          <h2 className="font-bold">{t("Data")}</h2>
          <p className="text-sm text-slate-600">{t('{b} bets · {c} constitution items · {q} test results', { b: data.bets.length, c: data.constitution.principles.length, q: data.quizHistory.length })}{data.isDemo && t(' · currently demo data')}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => download(`betboard-${new Date().toISOString().slice(0, 10)}.json`, exportJSON())}>{t("Export JSON")}</Button>
            <Button variant="secondary" onClick={() => file.current?.click()}>{t("Import JSON")}</Button>
            <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
            <Button variant="secondary" onClick={() => confirm(t('Replace everything with the demo data?')) && resetToDemo()}>{t("Load demo data")}</Button>
            <Button variant="danger" onClick={() => confirm(t('Erase all bets and constitution and start empty? Export first if you need a backup.')) && startFresh()}>{t("Start fresh")}</Button>
          </div>
          {msg && <p className="text-sm" role="status">{msg}</p>}
        </section>
      </div>
    </>
  )
}
