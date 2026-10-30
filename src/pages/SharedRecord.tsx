import { t } from '../lib/i18n'
import { useParams } from 'react-router-dom'
import { SiteNav } from '../components/SiteNav'
import { RecordView } from '../components/RecordView'
import type { RecordPayload } from '../lib/record'
import { LinkButton } from '../components/ui'
import { decodeShare } from '../lib/share'

export default function SharedRecord() {
  const { data = '' } = useParams()
  const p = decodeShare<RecordPayload>(data)
  const ok = p && typeof p.s === 'number' && Array.isArray(p.bk) && Array.isArray(p.it)
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grad-bg"><SiteNav dark /></div>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {ok ? <RecordView p={p} /> : <p className="card p-10 text-center">{t("This track-record link is invalid or truncated.")}</p>}
        <div className="mt-8 text-center">
          <p className="text-slate-600">{t("Build a provable product track record of your own. Free, private, no signup.")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <LinkButton to="/app">{t("Open BetBoard")}</LinkButton>
            <LinkButton to="/test" variant="secondary">{t("Take the 3-min judgment test")}</LinkButton>
          </div>
        </div>
      </main>
    </div>
  )
}
