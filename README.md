# BetBoard: prove your product judgment

> AI made building cheap. **Judgment is the new bottleneck.**

BetBoard is a free, private, no-signup web app for product managers. It treats every initiative as a calibrated **bet**, checks it against an executable **Product Constitution**, and measures the PM by what actually matters now: **calibration**, meaning how often you're right when you say you're 70% sure.

**Live:** https://yosefnoorani.github.io/betboard/

## What's inside

| Feature | What it does |
|---|---|
| **PM Judgment Score test** (`#/test`) | 15 questions drawn at random from a pool of 20 real, sourced product-history facts. Pick an answer and a confidence (50–100%). You get a Brier-based score, an over/underconfidence gap, one of 6 archetypes, a calibration chart and a shareable result card (PNG download, LinkedIn/X share, link). |
| **Bet Ledger** (`#/app/bets`) | Hypothesis, metric, baseline, target, probability, kill criteria, review date, cost. Resolve bets as hit, partial or miss, or kill them early and log the person-weeks saved. |
| **AI assist** | Paste a raw idea or PRD and get a structured, falsifiable bet with its riskiest assumptions. It uses **your own** OpenAI-compatible key (called directly from the browser). With no key it falls back to a deterministic offline structurer. |
| **Calibration dashboard** (`#/app`) | Judgment score, Brier, hit rate, calibration curve, overconfidence gap, $ saved by killing, due-for-review list, weakest-fit bets. |
| **Product Constitution** (`#/app/constitution`) | Weighted goals, principles and non-goals with keywords. Every bet gets a 0–100 fit score plus flags. A "test an idea" box, and a feature-overload meter against capacity (bets and person-weeks). |
| **Track record** (`#/app/record`) | A shareable, read-only snapshot (`#/r/…`; the data lives in the URL, so there's no server), plus Markdown, CSV and print/PDF export. |
| **Landing + pricing** | Free / Pro $12/mo / Team $29/seat/mo. Paid tiers are *planned*: waitlist only, stored locally, no payments. |

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
npm test          # vitest unit tests for the scoring math
npm run lint      # oxlint
npm run build     # static output in dist/
```

## Deploy
The build is fully static and path-agnostic (Vite `base: './'` + hash routing), so `dist/` works at any URL or sub-path.
- **GitHub Pages:** `.github/workflows/deploy.yml` builds and deploys on every push to `main` (Settings → Pages → Source: GitHub Actions).
- **Netlify / Cloudflare Pages / Vercel:** build command `npm run build`, output directory `dist`.
- **Anywhere else:** `npx serve dist` or `python3 -m http.server -d dist`.

## Quiz sources
Every question in `src/data/quiz.ts` carries the source URL and a supporting quote. All were checked against Wikipedia on 2026-10-30:
Slack (software) · YouTube (dating-site origin; $1.65B Google deal) · Instagram (Burbn; $1B Facebook deal) · Blockbuster LLC ($50M Netflix offer) · WhatsApp ($19B) · Groupon (The Point) · Flickr (Game Neverending) · Airbnb (cereal boxes) · Nintendo (1889) · Android (acquired 2005) · GitHub ($7.5B) · Threads (fastest to 100M users) · Twitter (280 chars in 2017; Odeo origins) · Figma (Adobe deal abandoned Dec 2023) · Shopify (snowboard shop) · Gmail (1 GB at launch) · Discord (Fates Forever).
The pages are listed at `https://en.wikipedia.org/wiki/<Title>` and the exact link is shown next to each answer in the in-app review.

## Privacy
There's no backend, analytics or cookies. AI-assist requests go only to the endpoint you configure.

## Structure
```
src/lib        scoring, ledger stats, constitution fit, AI assist, share links, store (+ tests)
src/data       sourced quiz questions
src/components UI kit, charts, result card, bet editor, record view
src/pages      Landing, Quiz, Dashboard, Bets, Constitution, Record, Settings, shared views
```
