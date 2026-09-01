# Theme Gallery

Preview → **Customize** (fonts + color) → **Use this theme** → brief → **Copy instruction**.

## Run

```bash
cd decks/theme-gallery
npm run dev
```

## Themes

| Theme | Feel | Reveal style |
|-------|------|--------------|
| **Work Map** | Dark green editorial | Full grids together |
| **Neuroscience** | Cinematic violet/cyan | One job at a time |
| **Ink Mono** | Pure black & white | Whole-slide compositions |
| **Paper Violet** | Light off-white + purple grid | Progressive list rows |
| **Amber Signal** | Charcoal + amber | Full-system (Work Map spine) |
| **Coastal** | Light fog-blue + sky | Progressive chapters |
| **Orbit Data** | Dark-only orange/blue operator (Recharts) | Dense board pack + chart panels |
| **Metric Board** | Light-only boardroom (Recharts) | Same Meridian Ops spine as Orbit |

## Data themes (charts)

Agent rules: `.cursor/skills/interactive-presentation-deck/references/data-board-decks.md`

- Library: **Recharts** (`npm i recharts`) — one lib only
- Bind series to `--chart-1` (primary), `--chart-2` (secondary), `--chart-3`, `--chart-4`, plus `--chart-grid` / `--chart-axis` / `--chart-track`
- Customize palette remaps `--chart-1` / `--chart-2` — never hardcode orange/blue hex in JSX
- Pair every chart with textual KPI / legend
- Insight headlines + filled canvas (no empty lower thirds)
- Metric Board = light only; Orbit = dark only (do not alternate)
- Remount charts on slide entry; pies draw in from empty; absolute spark/area scales start at Y = 0
- Shared code: `app/lib/chartTokens.ts`, `app/components/charts/ThemeCharts.tsx`

## Customize (live)

In any theme preview, the **palette / Customize** control sits left of **Use this theme**.

- **Headline font** — Serif / Sans / Display / Script → applies via `--serif`
- **Body font** — Sans / Serif / Display → applies via `--sans`
- **Color palette** — curated color-theory pairs (amber, violet, teal, rose…) overwrite accents
- **Random** — picks another theory-backed pair from the curated pool

Choices persist in session storage and are written into the **Copy instruction** block.

## Controls (fixed)

- Mono chrome only (`SF Mono` / ui-monospace) — never theme serif
- SVG chevrons + Reset `R`
- **Idle-hide after 1.8s** (mousemove / key brings back)
- No click-to-advance on the slide canvas
- Esc closes the customize sidebar
