# Data / board decks

Use this reference when building **Orbit Data**, **Metric Board**, or any chart-led executive board pack in `decks/theme-gallery` (or a production deck cloned from those themes).

## How anyone uses this (preview → pick → build)

**Mandatory:** agents launch Theme Gallery before building. See [theme-gallery-gate.md](theme-gallery-gate.md).

1. Run the gallery (complete coded previews — not mockups):

```bash
# Public skill repo
cd theme-gallery && npm install && npm run dev

# Content System
cd decks/theme-gallery && npm install && npm run dev
```

2. Open the home page and click into themes (same card UI as local Content System).

3. User either:
   - **Selects in UI** — Customize → **Use this theme →** → brief → **Copy instruction**, or
   - **Names a theme** in chat, or
   - Says **“you choose / AI pick”** (only then may the agent select)

4. Agent implements by copying structure from `theme-gallery/app/themes/<id>/` + chart shared modules.

Do not skip the picker for vague “make a deck” requests.

Canonical data previews:

| Theme | Path | Mode |
|-------|------|------|
| **Orbit Data** | `decks/theme-gallery/app/themes/orbit-data/` | **Dark only** |
| **Metric Board** | `decks/theme-gallery/app/themes/metric-board/` | **Light only** |

Do **not** alternate light/dark inside Metric Board. Orbit is the dark twin; Metric Board is the light twin. Mixing modes in one sample deck reads as unfinished.

Shared chart system:

- Tokens + sample series: `decks/theme-gallery/app/lib/chartTokens.ts`
- Recharts components: `decks/theme-gallery/app/components/charts/ThemeCharts.tsx`
- Theme registration: `decks/theme-gallery/app/lib/themes.ts` (`isDataTheme`)

---

## When to use this profile

Pick **Data / board** (or Executive briefing + this chart contract) when the audience is a board, CFO, CRO, or ops leadership and the deck must:

1. Lead with a recommendation
2. Show measurable evidence (charts + KPI context)
3. End money slides with an explicit decision

Do not use sparse “big number + lonely chart” posters unless the user explicitly wants a keynote-style teaser.

---

## Narrative spine (Meridian Ops pattern)

Default 12-slide board pack (adapt labels/numbers to the real brief):

| # | Label | Job |
|---|-------|-----|
| 00 | OPEN | Decision required + agenda + audience |
| 01 | ASK | Recommendation + investment / payback / guardrail |
| 02 | SCORECARD | Four dials + “what moved” + trend from 0 |
| 03 | GROWTH | Insight + proof stack + area chart |
| 04 | MARKET | Insight + legend + pie (animated draw-in) |
| 05 | PRODUCT | Capabilities + shipped / open |
| 06 | ROADMAP | Phases with status + dependencies |
| 07 | FINANCE | Insight + mini KPIs + bar/line combo |
| 08 | IMPACT | Proof + donut (animated) + spark |
| 09 | GTM | Expand / hold / prune with budget language |
| 10 | RISKS | Risk · signal · brake table |
| 11 | DECISION | Options A/B/C + recommended path |

Story order: **answer → proof the machine works → where value sits → how we spend → ask with brakes**.

---

## Anti-slop density rules

Empty lower thirds and “label + one metric” slides fail board QA. Every slide must fill the canvas with purposeful content.

### Insight headlines

- Headline = conclusion, not a section label
- Pair orange emphasis (`em`) with metrics inside the sentence
- Keep section eyebrows small; never make them the story

### Fill patterns (required on evidence slides)

Use layout classes already in theme CSS (copy from Metric Board / Orbit):

- `evidence-split` — copy column + chart column, full height
- `evidence-copy.stretch` — pin insight top and so-what bottom
- `score-shell` — head → KPI grid → bottom band → source
- `fill-col` — column flex; push footer blocks with margin-top auto
- `dual-band` / `band-card` — two purposeful callouts
- `legend-list` — color swatches keyed to `--chart-*` for pies
- `annotate` — one so-what; no CSS token names in audience copy
- `decision-bar` — explicit decision on money slides

### Scorecard

Must include all of: rich KPI tiles (plan/prior/owner) + drivers list + trend with Y from 0 + annotate + source. Never four flat cards alone in the top third.

Prefer **high** density on evidence slides; **balanced** on open/ask/close.

---

## Chart contract (Recharts only)

```bash
npm i recharts
```

One chart library per deck.

| Token | Role |
|-------|------|
| `--chart-1` | Primary series / emphasis |
| `--chart-2` | Secondary / target line |
| `--chart-3` | Tertiary bars / SMB slice |
| `--chart-4` | Quaternary / muted |
| `--chart-grid` | Gridlines |
| `--chart-axis` | Tick labels |
| `--chart-track` | Donut residual track |

Read via `getComputedStyle` on the theme root. Never hardcode brand hex in JSX.

- Absolute scales (NPS 0–100): `domain={[0, 100]}` — no floating mid-air line
- Tall panels must not cap spark frames at 70px
- Remount charts on slide entry with `key={slide}`
- Pies: mount empty → fill after ~40ms; ~1.4s ease-out; honor reduced motion
- Every chart needs KPI/legend + aria-label

---

## Visual / chrome contracts

- Nav: arrows / Space / control pill only — no click-on-slide advance
- Fancy fonts inside PPT canvas only; gallery chrome readable
- Gallery cards = original theme colors
- Quality bar matches Work Map / Neuroscience depth

---

## Implementation checklist

- [ ] Mode locked: Metric Board light-only or Orbit dark-only
- [ ] Recommendation-first spine
- [ ] No vast empty lower half
- [ ] Scorecard: drivers + trend from 0 + annotate
- [ ] Recharts only; `--chart-*` tokens
- [ ] Charts remount; pies draw in
- [ ] Decision language on ask / finance / close
- [ ] Browser QA scorecard, market pie, finance

## Reference implementations

- `decks/theme-gallery/app/themes/metric-board/page.tsx` + `theme.css`
- `decks/theme-gallery/app/themes/orbit-data/page.tsx` + `theme.css`
- `decks/theme-gallery/app/components/charts/ThemeCharts.tsx`
- `decks/theme-gallery/app/lib/chartTokens.ts` (`CHART_INSTRUCTION_BLOCK`)
