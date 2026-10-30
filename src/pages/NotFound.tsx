import { t } from '../lib/i18n'
import { SiteNav } from '../components/SiteNav'
import { LinkButton } from '../components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen grad-bg text-white">
      <SiteNav dark />
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-6xl font-black">404</div>
        <p className="mt-3 text-white/70">{t("That page was a bet that didn't hit.")}</p>
        <LinkButton to="/" variant="light" className="mt-8">{t("Back home")}</LinkButton>
      </main>
    </div>
  )
}
