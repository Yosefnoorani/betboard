import { t } from '../lib/i18n'
import { useState, type RefObject } from 'react'
import { linkedInShareUrl, xShareUrl } from '../lib/share'
import { Button } from './ui'

export function ShareActions({ cardRef, url, text, filename }: { cardRef: RefObject<HTMLDivElement | null>; url: string; text: string; filename: string }) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const downloadPng = async () => {
    if (!cardRef.current) return
    setBusy(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = filename
      a.click()
    } finally {
      setBusy(false)
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt(t('Copy this link'), url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={downloadPng} disabled={busy}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" /></svg>
        {busy ? t('Rendering…') : t('Download PNG')}
      </Button>
      <a className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[#0a66c2] px-4 py-2 text-sm font-semibold text-white hover:opacity-90" href={linkedInShareUrl(text, url)} target="_blank" rel="noopener noreferrer">
        {t("Share on LinkedIn")}
      </a>
      <a className="focus-ring inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90" href={xShareUrl(text, url)} target="_blank" rel="noopener noreferrer">
        {t("Post on X")}
      </a>
      <Button variant="secondary" onClick={copy} aria-live="polite">{copied ? t('Link copied ✓') : t('Copy link')}</Button>
    </div>
  )
}
