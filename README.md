# BetBoard: prove your product judgment

> AI made building cheap. **Judgment is the new bottleneck.**

BetBoard is a free, private, no-signup web app for product managers. It treats every initiative as a calibrated **bet**, checks it against an executable **Product Constitution**, and measures the PM by what actually matters now: **calibration**, meaning how often you're right when you say you're 70% sure.

**Live:** https://yosefnoorani.github.io/betboard/

## What's inside

| Feature | What it does |
|---|---|
| **PM Judgment Score test** (`#/test`) | 15 questions from a pool of **71** real, sourced product-history facts, tagged **pivots / launches / metrics / AI era**. Pick an answer and a confidence (50–100%). You get a Brier-based score, an over/underconfidence gap, one of 6 archetypes, a calibration chart and a shareable result card (PNG download, LinkedIn/X share, link). |
| **Weekly pack** | By default everyone gets the same balanced pack for the current ISO week (seeded by year+week), so scores are comparable; a new pack every Monday. You can also play a single category or a random round. |
| **Challenge a colleague** (`#/c/…`, `#/test?c=…`) | A link that carries your score and round seed (no server). Your friend sees the score to beat, plays the exact same questions, and gets a head-to-head result plus win/tie/loss share text. |
| **Archetype map** | A 2D accuracy × confidence-gap map of the 6 archetypes with your position marked. It's computed client-side only, and there are no fake user counts or leaderboards. |
| **Social preview** | Open Graph + Twitter card meta with a static 1200×630 `public/og-image.png`. |
| **Hebrew / RTL** | An EN/עב toggle (English default, saved in `localStorage` as `betboard:lang`) flips the whole UI to Hebrew with `dir="rtl"`, quiz questions included. The Hebrew dictionaries are code-split, so English visitors never download them. Quiz source quotes, demo data, AI-assist output and exports stay in English. |
| **60-second onboarding** (`#/start`) | Guided first run: quiz baseline → first bet → 30-second constitution. |
| **Bet Ledger** (`#/app/bets`) | Hypothesis, metric, baseline, target, probability, kill criteria, review date, cost. Resolve bets as hit, partial or miss, or kill them early and log the person-weeks saved. |
| **AI assist** | Paste a raw idea or PRD and get a structured, falsifiable bet with its riskiest assumptions. It uses **your own** OpenAI-compatible key (called directly from the browser). With no key it falls back to a deterministic offline structurer. |
| **Calibration dashboard** (`#/app`) | Judgment score, Brier, hit rate, calibration curve, overconfidence gap, $ saved by killing, due-for-review list, weakest-fit bets. |
| **Product Constitution** (`#/app/constitution`) | Weighted goals, principles and non-goals with keywords. Every bet gets a 0–100 fit score plus flags. A "test an idea" box, and a feature-overload meter against capacity (bets and person-weeks). |
| **Track record** (`#/app/record`) | A shareable, read-only snapshot (`#/r/…`; the data lives in the URL, so there's no server), plus Markdown, CSV and print/PDF export. |
| **Landing + pricing** | Free / Pro $12/mo / Team $29/seat/mo, with a "why pay" section (Pro: unlimited bets, AI assist, team constitution, calibration history). Paid tiers are *planned*: waitlist only, stored locally, no payments. |

All data is kept in `localStorage` (`betboard:v1`), with JSON export/import in Settings. A first visit loads a clearly labelled demo workspace.

## Scoring math (`src/lib/scoring.ts`)
- **Brier** = mean((p − outcome)²). 0 is perfect; 0.25 is always saying 50%.
- **Judgment Score** = clamp(100 × (1 − 2·Brier), 0, 100). 50 = coin flip, 100 = perfect.
- **Gap** = mean confidence − hit rate, in points. Beyond ±7 pts you're labelled over- or underconfident.
- Ledger outcomes: hit = 1, partial = 0.5, miss = 0, killed = 0.
- **Fit score** (`src/lib/constitution.ts`): alignment up to 60 (weight × 12 for each matched goal or principle) + bet quality up to 40 (metric 12, numeric target 10, kill criteria 10, review date 4, non-extreme probability 4) − non-goal penalty (weight × 8 each, max 40).

## Run locally
```bash
npm ci
npm run dev       # http://localhost:5173
npm test          # vitest: scoring, packs, constitution, share/challenge links, i18n completeness
npm run lint      # oxlint
npm run build     # static output in dist/
```

## Deploy
The build is fully static and path-agnostic (Vite `base: './'` + hash routing), so `dist/` works at any URL or sub-path.
- **GitHub Pages:** `.github/workflows/deploy.yml` builds and deploys on every push to `main` (Settings → Pages → Source: GitHub Actions).
- **Netlify / Cloudflare Pages / Vercel:** build command `npm run build`, output directory `dist`.
- **Anywhere else:** `npx serve dist` or `python3 -m http.server -d dist`.

## Quiz sources
Every one of the 71 questions in `src/data/quiz.ts` carries a source URL and a supporting quote, and all were checked against English Wikipedia on 2026-10-30. Anything that couldn't be verified was dropped. The exact link and quote are shown next to each answer in the in-app review. Hebrew translations (`src/i18n/quiz.he.ts`) keep the same answers and sources.

## Quality checks
- `npm test`: 43 unit tests. They include a check that every `t('…')` string, archetype and quiz question has a Hebrew translation with matching placeholders.
- `npm run lint`: oxlint, 0 warnings.
- Lighthouse (headless Chrome, local build): Performance 100, Best Practices 100, SEO 100, Accessibility 100 on landing and quiz. axe-core shows 0 WCAG 2 A/AA violations across all routes, in English and Hebrew.

## Privacy
There's no backend, analytics or cookies. AI-assist requests go only to the endpoint you configure.

## Structure
```
src/lib        scoring, ledger stats, constitution fit, AI assist, share/challenge links, weekly packs, i18n, store (+ tests)
src/data       sourced quiz questions
src/i18n       Hebrew UI + quiz dictionaries (lazy-loaded)
src/components UI kit, charts, result card, bet editor, record view
src/pages      Landing, Quiz, Onboarding, Dashboard, Bets, Constitution, Record, Settings, shared views
```
