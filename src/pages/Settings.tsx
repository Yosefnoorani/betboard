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
      setMsg('Imported ✓')
    } catch (e) {
      setMsg(`Import failed: ${(e as Error).message}`)
    }
  }
  const testKey = async () => {
    setTestMsg('Testing…')
    try {
      const d = await llmAssist('Add onboarding checklist to improve activation by 5% in 2 sprints', s)
      setTestMsg(`Works ✓ (got "${d.title}")`)
    } catch (e) {
      setTestMsg(`Failed: ${(e as Error).message}`)
    }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Everything is stored in this browser only (localStorage). Nothing is sent to any BetBoard server, because there isn't one." />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-3 p-5">
          <h2 className="font-bold">You</h2>
          <div>
            <label className="label" htmlFor="s-name">Display name (shown on your track record)</label>
            <input id="s-name" className="input" value={s.displayName} onChange={(e) => set({ displayName: e.target.value })} placeholder="Dana Cohen" />
          </div>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <div>
              <label className="label" htmlFor="s-cost">Fully loaded cost per person-week</label>
              <input id="s-cost" type="number" min={0} className="input" value={s.weeklyCost} onChange={(e) => set({ weeklyCost: Math.max(0, +e.target.value) })} />
            </div>
            <div>
              <label className="label" htmlFor="s-cur">Currency</label>
              <select id="s-cur" className="input" value={s.currency} onChange={(e) => set({ currency: e.target.value })}>
                {['USD', 'EUR', 'GBP', 'ILS', 'INR', 'CAD', 'AUD', 'JPY'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="font-bold">AI assist (bring your own key)</h2>
          <p className="text-xs text-slate-500">Works with any OpenAI-compatible <code>/chat/completions</code> endpoint (OpenAI, OpenRouter, Groq, Together, a local LM Studio or Ollama server…). The key is kept in this browser and requests go directly from your browser to that endpoint. With no key, a built-in offline structurer is used.</p>
          <div>
            <label className="label" htmlFor="s-key">API key</label>
            <div className="flex gap-2">
              <input id="s-key" type={showKey ? 'text' : 'password'} autoComplete="off" className="input font-mono" value={s.apiKey} onChange={(e) => set({ apiKey: e.target.value })} placeholder="sk-…" />
              <Button variant="secondary" size="sm" onClick={() => setShowKey(!showKey)}>{showKey ? 'Hide' : 'Show'}</Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-url">Base URL</label>
              <input id="s-url" className="input font-mono text-sm" value={s.baseUrl} onChange={(e) => set({ baseUrl: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="s-model">Model</label>
              <input id="s-model" className="input font-mono text-sm" value={s.model} onChange={(e) => set({ model: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" disabled={!s.apiKey} onClick={testKey}>Test connection</Button>
            <span className="text-xs text-slate-600" role="status">{testMsg}</span>
          </div>
        </section>

        <section className="card space-y-3 p-5 lg:col-span-2">
          <h2 className="font-bold">Data</h2>
          <p className="text-sm text-slate-600">{data.bets.length} bets · {data.constitution.principles.length} constitution items · {data.quizHistory.length} test results{data.isDemo && ' · currently demo data'}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => download(`betboard-${new Date().toISOString().slice(0, 10)}.json`, exportJSON())}>Export JSON</Button>
            <Button variant="secondary" onClick={() => file.current?.click()}>Import JSON</Button>
            <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
            <Button variant="secondary" onClick={() => confirm('Replace everything with the demo data?') && resetToDemo()}>Load demo data</Button>
            <Button variant="danger" onClick={() => confirm('Erase all bets and constitution and start empty? Export first if you need a backup.') && startFresh()}>Start fresh</Button>
          </div>
          {msg && <p className="text-sm" role="status">{msg}</p>}
        </section>
      </div>
    </>
  )
}
