import { useState } from 'react'
import { PageHeader } from '../components/AppShell'
import { RecordView } from '../components/RecordView'
import { toPayload } from '../lib/record'
import { Button } from '../components/ui'
import { ledgerStats } from '../lib/ledger'
import { appUrl, encodeShare, linkedInShareUrl, xShareUrl } from '../lib/share'
import { download, useData } from '../lib/store'

export default function Record() {
  const data = useData()
  const st = ledgerStats(data.bets)
  const p = toPayload(st, data.bets, data.settings.displayName, data.constitution.company)
  const url = appUrl('/r/' + encodeShare(p))
  const [copied, setCopied] = useState(false)
  const text = `My product-judgment track record: ${p.s}/100 across ${p.r + p.k} resolved bets (Brier ${p.b.toFixed(3)}). Every call is logged with a probability before the outcome. 📈`

  const md = () => {
    const lines = [
      `# Product judgment track record${p.n ? `: ${p.n}` : ''}`,
      '',
      `- Judgment score: **${p.s}/100**`,
      `- Brier score: ${p.b.toFixed(3)}`,
      `- Hit rate: ${Math.round(p.h * 100)}%`,
      `- Over/under-confidence gap: ${p.g > 0 ? '+' : ''}${p.g} pts`,
      `- Weeks saved by killing bets early: ${p.sw}`,
      '',
      '| Bet | Probability | Metric → Target | Outcome | Learnings |',
      '|---|---|---|---|---|',
      ...data.bets.filter((b) => b.status !== 'open').map((b) => `| ${b.title} | ${Math.round(b.probability * 100)}% | ${b.metric} → ${b.target} | ${b.status === 'killed' ? 'killed' : b.outcome} | ${(b.learnings || '').replace(/\|/g, '/').replace(/\n/g, ' ')} |`),
      '',
      `Generated with BetBoard · ${new Date().toISOString().slice(0, 10)}`,
    ]
    download('track-record.md', lines.join('\n'), 'text/markdown')
  }
  const csv = () => {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const head = ['title', 'status', 'outcome', 'probability', 'metric', 'baseline', 'target', 'killCriteria', 'reviewDate', 'cost', 'savedWeeks', 'owner', 'tags', 'createdAt', 'resolvedAt', 'learnings']
    const rows = data.bets.map((b) => [b.title, b.status, b.outcome, b.probability, b.metric, b.baseline, b.target, b.killCriteria, b.reviewDate, b.cost, b.savedWeeks, b.owner, b.tags.join(';'), b.createdAt, b.resolvedAt, b.learnings].map(esc).join(','))
    download('bets.csv', [head.join(','), ...rows].join('\n'), 'text/csv')
  }

  return (
    <>
      <PageHeader
        title="Track record"
        subtitle="Calibration you can prove, for performance reviews, promotion packets and interviews. Share a read-only snapshot. The data lives in the link, not on a server."
        actions={
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()}>Print / PDF</Button>
            <Button variant="secondary" size="sm" onClick={md}>Markdown</Button>
            <Button variant="secondary" size="sm" onClick={csv}>CSV</Button>
          </div>
        }
      />
      <RecordView p={p} />
      <section className="no-print card mt-4 p-5">
        <h2 className="font-bold">Share your record</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="rec-url" className="sr-only">Share link</label>
          <input id="rec-url" readOnly className="input font-mono text-xs" value={url} onFocus={(e) => e.currentTarget.select()} />
          <Button onClick={async () => { await navigator.clipboard?.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1800) }}>{copied ? 'Copied ✓' : 'Copy link'}</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a className="focus-ring rounded-xl bg-[#0a66c2] px-4 py-2 text-sm font-semibold text-white" href={linkedInShareUrl(text, url)} target="_blank" rel="noreferrer">Share on LinkedIn</a>
          <a className="focus-ring rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white" href={xShareUrl(text, url)} target="_blank" rel="noreferrer">Post on X</a>
        </div>
        <p className="mt-2 text-xs text-slate-500">The link contains only the summary and your last 12 bet titles, never your full ledger.</p>
      </section>
    </>
  )
}
