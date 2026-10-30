import { setLang, useLang } from '../lib/i18n'
import { cx } from '../lib/format'

/** English / Hebrew switch. English is the default; Hebrew flips the layout to RTL. */
export function LangToggle({ dark, className }: { dark?: boolean; className?: string }) {
  const lang = useLang()
  const next = lang === 'he' ? 'en' : 'he'
  return (
    <button
      type="button"
      onClick={() => void setLang(next)}
      lang={next}
      aria-label={next === 'he' ? 'עברית (Switch to Hebrew)' : 'English (Switch to English)'}
      className={cx(
        'focus-ring rounded-lg px-2.5 py-1.5 text-sm font-semibold',
        dark ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        className,
      )}
    >
      {next === 'he' ? 'עברית' : 'English'}
    </button>
  )
}
