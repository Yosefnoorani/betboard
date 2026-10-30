import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SiteNav } from '../components/SiteNav'
import { Button, LinkButton } from '../components/ui'
import { cx } from '../lib/format'
import { ResultCard } from '../components/ResultCard'
import { ArchetypeMap } from '../components/ArchetypeMap'
import { ShareActions } from '../components/ShareActions'
import { CalibrationChart } from '../components/charts'
import { QUESTIONS, QUIZ_LENGTH, type QuizCategory } from '../data/quiz'
import { buildRound, CATEGORIES, isoWeek, randomSeed, weekSeed, type RoundItem, type RoundSpec } from '../lib/pack'
import { ARCHETYPES, answerToForecast, calibrationBuckets, scoreQuiz, type QuizAnswer, type QuizResult } from '../lib/scoring'
import { setData, useData } from '../lib/store'
import { appUrl, decodeChallenge, encodeShare, shareText, toChallenge, type ChallengePayload, type SharePayload } from '../lib/share'

type Shown = RoundItem

const CAT_NAMES: Record<QuizCategory, string> = { pivots: 'Pivots', launches: 'Launches', metrics: 'Deals & metrics', ai: 'AI era' }

const makeRound = (spec: RoundSpec): Shown[] => buildRound(QUESTIONS, spec, QUIZ_LENGTH)

const CONF_STEPS = [50, 60, 70, 80, 90, 100]

export default function Quiz() {
  const [params] = useSearchParams()
  const challenge = useMemo(() => decodeChallenge(params.get('c')), [params])
  const [spec, setSpec] = useState<RoundSpec>(() =>
    challenge ? { seed: challenge.sd, ...(challenge.cat && (CATEGORIES as string[]).includes(challenge.cat) ? { cat: challenge.cat as QuizCategory } : {}) } : { seed: weekSeed() },
  )
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [round, setRound] = useState<Shown[]>(() => makeRound(spec))
  const [i, setI] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [conf, setConf] = useState(70)
  const [answers, setAnswers] = useState<(QuizAnswer & { chosen: number })[]>([])
  const [name, setName] = useState('')

  const start = (next: RoundSpec = spec) => {
    setSpec(next)
    setRound(makeRound(next))
    setI(0)
    setAnswers([])
    setChoice(null)
    setConf(70)
    setPhase('play')
  }

  const next = useCallback(() => {
    if (choice === null) return
    const cur = round[i]
    const chosenOpt = cur.order[choice]
    const a = { questionId: cur.q.id, correct: chosenOpt === 0, confidence: conf / 100, chosen: chosenOpt }
    const all = [...answers, a]
    setAnswers(all)
    setChoice(null)
    setConf(70)
    if (i + 1 >= round.length) {
      const r = scoreQuiz(all)
      setData((d) => ({ ...d, quizHistory: [...d.quizHistory, { at: new Date().toISOString(), score: r.score, accuracy: r.accuracy, gap: r.gap, archetype: r.archetype.key }].slice(-50) }))
      setPhase('done')
    } else setI(i + 1)
  }, [choice, conf, answers, i, round])

  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' && (e.target as HTMLInputElement).type !== 'range') return
      if (e.key === '1' || e.key.toLowerCase() === 'a') setChoice(0)
      else if (e.key === '2' || e.key.toLowerCase() === 'b') setChoice(1)
      else if (e.key === 'Enter') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, next])

  return (
    <div className="min-h-screen grad-bg text-white">
      <SiteNav dark />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-4 sm:px-6">
        {phase === 'intro' && <Intro onStart={start} name={name} setName={setName} spec={spec} setSpec={setSpec} challenge={challenge} />}
        {phase === 'play' && (
          <Question
            key={i}
            shown={round[i]}
            index={i}
            total={round.length}
            choice={choice}
            setChoice={setChoice}
            conf={conf}
            setConf={setConf}
            onNext={next}
          />
        )}
        {phase === 'done' && <Results answers={answers} round={round} name={name} spec={spec} challenge={challenge} onRetake={() => start({ seed: randomSeed(), ...(spec.cat ? { cat: spec.cat } : {}) })} />}
      </main>
    </div>
  )
}

function PackPicker({ spec, setSpec }: { spec: RoundSpec; setSpec: (s: RoundSpec) => void }) {
  const wk = isoWeek()
  const ws = weekSeed()
  const opts: { key: string; label: string; spec: RoundSpec }[] = [
    { key: 'week', label: `This week's pack · W${wk.week}`, spec: { seed: ws } },
    ...CATEGORIES.map((c) => ({ key: c, label: CAT_NAMES[c], spec: { seed: ws, cat: c } })),
  ]
  const active = spec.cat ?? (spec.seed === ws ? 'week' : '')
  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/50" id="pack-l">Choose a pack</div>
      <div className="mt-2 flex flex-wrap justify-center gap-2" role="radiogroup" aria-labelledby="pack-l">
        {opts.map((o) => (
          <button
            key={o.key}
            role="radio"
            aria-checked={active === o.key}
            onClick={() => setSpec(o.spec)}
            className={cx('focus-ring rounded-full border px-3 py-1.5 text-sm font-semibold transition', active === o.key ? 'border-white bg-white text-ink' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10')}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-white/45">Everyone gets the same weekly pack, so scores are comparable. New pack every Monday (ISO week).</p>
    </div>
  )
}

function Intro({ onStart, name, setName, spec, setSpec, challenge }: { onStart: (s?: RoundSpec) => void; name: string; setName: (s: string) => void; spec: RoundSpec; setSpec: (s: RoundSpec) => void; challenge: ChallengePayload | null }) {
  return (
    <section className="rise pt-8 text-center sm:pt-14">
      {challenge && (
        <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4 text-left" role="status">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-200">Challenge accepted?</div>
          <div className="mt-1 text-lg font-bold">
            {challenge.n || 'A colleague'} scored <span className="text-cyan-200">{challenge.s}/100</span> as {(ARCHETYPES[challenge.k] ?? ARCHETYPES.navigator).emoji} {(ARCHETYPES[challenge.k] ?? ARCHETYPES.navigator).name}.
          </div>
          <div className="text-sm text-white/70">You get the exact same questions. Score to beat: {challenge.s}.</div>
        </div>
      )}
      <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">Free · 15 questions · ~3 minutes · no signup</span>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
        What's your <span className="grad-text">PM Judgment Score?</span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
        Knowing the answer is half of it. The other half is knowing <em>how sure</em> you should be, and that is what product decisions run on.
      </p>
      <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
        {[
          ['1', 'Pick an answer', 'Real facts about famous pivots, launches and acquisitions.'],
          ['2', 'Set your confidence', '50% = pure guess, 100% = certain.'],
          ['3', 'Get calibrated', 'Brier-based score, your bias, your archetype.'],
        ].map(([n, t, b]) => (
          <div key={n} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-bold text-brand-300">Step {n}</div>
            <div className="mt-1 font-semibold">{t}</div>
            <div className="mt-1 text-sm text-white/60">{b}</div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
        <label htmlFor="nm" className="sr-only">Your name (optional, shown on your card)</label>
        <input id="nm" value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder="Your name (optional, for your card)" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40" />
        <Button size="lg" variant="light" onClick={() => onStart()} className="shrink-0">{challenge ? `Beat ${challenge.s} →` : 'Start the test →'}</Button>
      </div>
      {!challenge && <PackPicker spec={spec} setSpec={setSpec} />}
      <p className="mt-4 text-xs text-white/45">Every answer comes with its source. Nothing leaves your browser.</p>
    </section>
  )
}

function Question({
  shown,
  index,
  total,
  choice,
  setChoice,
  conf,
  setConf,
  onNext,
}: {
  shown: Shown
  index: number
  total: number
  choice: number | null
  setChoice: (n: number) => void
  conf: number
  setConf: (n: number) => void
  onNext: () => void
}) {
  const fill = ((conf - 50) / 50) * 100
  const confWord = conf <= 55 ? 'Pure guess' : conf <= 65 ? 'Leaning' : conf <= 75 ? 'Fairly sure' : conf <= 85 ? 'Confident' : conf <= 95 ? 'Very confident' : 'Certain'
  return (
    <section className="rise pt-6" aria-labelledby="qtext">
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>Question {index + 1} of {total}</span>
        <span className="hidden sm:inline">Keys: 1 / 2 to choose, Enter for next</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={index} aria-valuemin={0} aria-valuemax={total} aria-label="Progress">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all" style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <h2 id="qtext" className="mt-8 text-2xl font-bold leading-snug sm:text-3xl">{shown.q.prompt}</h2>
      <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Answer options">
        {shown.order.map((optIdx, k) => (
          <button
            key={optIdx}
            role="radio"
            aria-checked={choice === k}
            onClick={() => setChoice(k)}
            className={cx(
              'focus-ring flex items-center gap-4 rounded-2xl border px-5 py-4 text-left text-base font-semibold transition sm:text-lg',
              choice === k ? 'border-brand-400 bg-brand-500/25 ring-2 ring-brand-400' : 'border-white/15 bg-white/5 hover:bg-white/10',
            )}
          >
            <span className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold', choice === k ? 'bg-brand-500 text-white' : 'bg-white/10 text-white/70')}>{k === 0 ? 'A' : 'B'}</span>
            {shown.q.options[optIdx]}
          </button>
        ))}
      </div>

      <div className={cx('mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 transition', choice === null && 'opacity-50')}>
        <div className="flex items-baseline justify-between">
          <label htmlFor="conf" className="font-semibold">How sure are you?</label>
          <div className="text-right">
            <span className="text-3xl font-extrabold tabular-nums">{conf}%</span>
            <span className="ml-2 text-sm text-white/60">{confWord}</span>
          </div>
        </div>
        <input id="conf" type="range" min={50} max={100} step={5} value={conf} onChange={(e) => setConf(+e.target.value)} disabled={choice === null} className="conf mt-4 w-full" style={{ ['--fill' as string]: `${fill}%` }} aria-valuetext={`${conf}% – ${confWord}`} />
        <div className="mt-3 flex justify-between gap-1">
          {CONF_STEPS.map((c) => (
            <button key={c} disabled={choice === null} onClick={() => setConf(c)} className={cx('focus-ring rounded-lg px-2 py-1 text-xs font-semibold tabular-nums sm:px-3', conf === c ? 'bg-white text-ink' : 'bg-white/10 text-white/70 hover:bg-white/20')}>{c}%</button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="lg" variant="light" disabled={choice === null} onClick={onNext}>
          {index + 1 === total ? 'See my score' : 'Next'} →
        </Button>
      </div>
    </section>
  )
}

function biasCopy(r: QuizResult) {
  const g = Math.round(r.gap)
  if (r.bias === 'overconfident')
    return `On average you were ${Math.round(r.meanConfidence * 100)}% confident but right ${Math.round(r.accuracy * 100)}% of the time, ${g} points of overconfidence. On a roadmap, that turns into bets you defend longer than the evidence supports.`
  if (r.bias === 'underconfident')
    return `You were right ${Math.round(r.accuracy * 100)}% of the time but only ${Math.round(r.meanConfidence * 100)}% confident on average, ${Math.abs(g)} points of underconfidence. You're leaving good calls on the table.`
  return `Your average confidence (${Math.round(r.meanConfidence * 100)}%) is within ${Math.abs(g)} points of your accuracy (${Math.round(r.accuracy * 100)}%). Your "how sure am I" signal is trustworthy, and that's the hard part.`
}

function ChallengeBox({ payload }: { payload: SharePayload }) {
  const [copied, setCopied] = useState(false)
  const ch = toChallenge(payload)
  if (!ch) return null
  const url = appUrl(`/c/${encodeShare(ch)}`)
  const text = `I scored ${payload.s}/100 on the PM Judgment Score. Same 15 questions, can you beat me?`
  const copy = async () => {
    const full = `${text} ${url}`
    try {
      if (navigator.share) await navigator.share({ title: 'PM Judgment Score challenge', text, url })
      else await navigator.clipboard.writeText(full)
      setCopied(true)
    } catch {
      try {
        await navigator.clipboard.writeText(full)
        setCopied(true)
      } catch {
        window.prompt('Copy this challenge link', full)
      }
    }
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-5 sm:flex-row">
      <div>
        <div className="font-bold">⚔️ Challenge a colleague</div>
        <div className="text-sm text-white/70">They get your exact questions and see your score to beat: {payload.s}.</div>
      </div>
      <Button variant="light" onClick={copy} aria-live="polite" className="shrink-0">{copied ? 'Challenge link copied ✓' : 'Copy challenge link'}</Button>
    </div>
  )
}

function Results({ answers, round, name, spec, challenge, onRetake }: { answers: (QuizAnswer & { chosen: number })[]; round: Shown[]; name: string; spec: RoundSpec; challenge: ChallengePayload | null; onRetake: () => void }) {
  const r = useMemo(() => scoreQuiz(answers), [answers])
  const data = useData()
  const cardRef = useRef<HTMLDivElement>(null)
  const payload: SharePayload = { s: r.score, a: Math.round(r.accuracy * 100), g: r.gap, k: r.archetype.key, c: r.correct, t: r.total, sd: spec.seed, ...(spec.cat ? { cat: spec.cat } : {}), ...(name.trim() ? { n: name.trim() } : {}) }
  const vs = challenge ? { n: challenge.n, s: challenge.s } : undefined
  const url = appUrl(`/s/${encodeShare(payload)}`)
  const text = shareText({ s: r.score, emoji: r.archetype.emoji, name: r.archetype.name }, vs)
  const buckets = calibrationBuckets(answers.map(answerToForecast), [0.5, 0.6, 0.7, 0.8, 0.9, 1])

  return (
    <section className="rise pt-6">
      <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
        {vs ? (r.score > vs.s ? `You beat ${vs.n || 'your colleague'}! 🏆` : r.score === vs.s ? `Dead heat with ${vs.n || 'your colleague'} 🤝` : `${vs.n || 'Your colleague'} wins this round`) : 'Your PM Judgment Score'}
      </h1>
      <p className="mt-2 text-center text-white/60">{r.label}</p>
      <div className="mt-8 flex justify-center">
        <ResultCard ref={cardRef} r={payload} vs={vs} />
      </div>
      <div className="mt-6 flex justify-center">
        <ShareActions cardRef={cardRef} url={url} text={text} filename={`pm-judgment-score-${r.score}.png`} />
      </div>
      <ChallengeBox payload={payload} />
      <div className="mt-4">
        <ArchetypeMap mine={r.archetype.key} friend={challenge ? { k: challenge.k, n: challenge.n } : undefined} history={data.quizHistory} />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-bold">What your score means</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Your score is based on the <strong>Brier score</strong> ({r.brier.toFixed(3)}), the average squared gap between your confidence and reality. <strong>100</strong> is perfect. <strong>50</strong> is what you'd get by answering 50% every time. Being 100% sure and wrong costs the most.
          </p>
          <h3 className="mt-4 font-bold">{r.archetype.emoji} {r.archetype.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/70">{r.archetype.description}</p>
          <h3 className="mt-4 font-bold capitalize">{r.bias}</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/70">{biasCopy(r)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-bold">Your calibration</h2>
          <CalibrationChart buckets={buckets} domain={[0.5, 1]} dark height={240} title="Quiz calibration" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-600 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold">Trivia is the warm-up. Your roadmap is the real test.</h2>
        <p className="mt-2 max-w-2xl text-white/85">Put probabilities on your actual initiatives, add kill criteria, and build a judgment track record you can show your manager. Free, in your browser.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <LinkButton to={data.settings.onboardedAt ? '/app/bets?new=1' : '/start'} variant="light">{data.settings.onboardedAt ? 'Log a real bet →' : 'Next: create your first bet (60s) →'}</LinkButton>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onRetake}>Retake with a new mix</Button>
        </div>
      </div>

      <details className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5" open>
        <summary className="cursor-pointer font-bold">Review answers & sources</summary>
        <ol className="mt-4 space-y-4">
          {answers.map((a, idx) => {
            const q = round.find((x) => x.q.id === a.questionId)!.q
            return (
              <li key={a.questionId} className="rounded-xl bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold">{idx + 1}. {q.prompt}</div>
                  <span className={cx('shrink-0 rounded-md px-2 py-0.5 text-xs font-bold', a.correct ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300')}>
                    {a.correct ? '✓' : '✗'} {Math.round(a.confidence * 100)}%
                  </span>
                </div>
                <div className="mt-1 text-sm text-white/70">
                  Answer: <strong className="text-white">{q.options[0]}</strong>
                  {!a.correct && <> · you said “{q.options[a.chosen]}”</>}
                </div>
                <p className="mt-1 text-sm text-white/60">{q.explanation} <em className="text-brand-200">{q.lesson}</em></p>
                <a href={q.source.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-cyan-300 underline-offset-2 hover:underline">Source: {q.source.title} ↗</a>
              </li>
            )
          })}
        </ol>
      </details>
      <p className="mt-6 text-center text-xs text-white/40">
        <Link to="/" className="hover:text-white">BetBoard</Link> · Calibration training for product people
      </p>
    </section>
  )
}
