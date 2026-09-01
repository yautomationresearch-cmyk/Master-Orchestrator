/**
 * Data-deck chart system
 * -----------------------
 * Library (locked for production decks): Recharts
 *   npm i recharts
 *
 * Color contract — never hardcode brand hex in chart series:
 *   --chart-1  primary series / emphasis
 *   --chart-2  secondary series / balance
 *   --chart-3  tertiary slice / bar
 *   --chart-4  quaternary / muted highlight
 *   --chart-grid  axis gridlines
 *   --chart-axis  tick + label color
 *   --chart-track  donut residual track
 *
 * Customize palette maps accent → --chart-1 and secondary → --chart-2
 */

export type ChartColors = {
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  grid: string;
  axis: string;
  track: string;
};

export const ORBIT_CHART_DEFAULTS: ChartColors = {
  c1: "#ff7a00",
  c2: "#3b82f6",
  c3: "#94a3b8",
  c4: "#f8fafc",
  grid: "rgba(248, 250, 252, 0.1)",
  axis: "rgba(248, 250, 252, 0.55)",
  track: "rgba(248, 250, 252, 0.12)",
};

export const BOARD_CHART_DEFAULTS: ChartColors = {
  c1: "#ff7a00",
  c2: "#2563eb",
  c3: "#64748b",
  c4: "#94a3b8",
  grid: "rgba(15, 23, 42, 0.08)",
  axis: "rgba(15, 23, 42, 0.5)",
  track: "rgba(15, 23, 42, 0.1)",
};

export function readChartColors(
  el: Element | null,
  fallback: ChartColors = ORBIT_CHART_DEFAULTS,
): ChartColors {
  if (!el || typeof getComputedStyle === "undefined") return fallback;
  const cs = getComputedStyle(el);
  const get = (name: string, fb: string) => {
    const v = cs.getPropertyValue(name).trim();
    return v || fb;
  };
  return {
    c1: get("--chart-1", fallback.c1),
    c2: get("--chart-2", fallback.c2),
    c3: get("--chart-3", fallback.c3),
    c4: get("--chart-4", fallback.c4),
    grid: get("--chart-grid", fallback.grid),
    axis: get("--chart-axis", fallback.axis),
    track: get("--chart-track", fallback.track),
  };
}

export const growthSeries = [
  { m: "Jan", v: 32 },
  { m: "Feb", v: 38 },
  { m: "Mar", v: 44 },
  { m: "Apr", v: 51 },
  { m: "May", v: 58 },
  { m: "Jun", v: 67 },
  { m: "Jul", v: 74 },
  { m: "Aug", v: 87 },
];

export const marketSlices = [
  { name: "Enterprise", value: 48, key: "c1" as const },
  { name: "Mid-market", value: 32, key: "c2" as const },
  { name: "SMB", value: 20, key: "c3" as const },
];

export const financeBars = [
  { q: "Q1", revenue: 1.4, target: 1.2 },
  { q: "Q2", revenue: 1.7, target: 1.5 },
  { q: "Q3", revenue: 2.1, target: 1.8 },
  { q: "Q4", revenue: 2.4, target: 2.2 },
];

export const impactTrend = [
  { w: "W1", nps: 72 },
  { w: "W2", nps: 78 },
  { w: "W3", nps: 84 },
  { w: "W4", nps: 91 },
  { w: "W5", nps: 98 },
];

export const CHART_INSTRUCTION_BLOCK = `CHARTS + BOARD DENSITY (data themes — required)
- Library: Recharts (\`npm i recharts\`) — ResponsiveContainer + Line/Area/Bar/Pie/Composed only
- Do NOT invent a second chart lib in the same deck
- Color: bind series to CSS tokens on the theme root:
  --chart-1 (primary), --chart-2 (secondary), --chart-3, --chart-4,
  --chart-grid, --chart-axis, --chart-track
- Read tokens at runtime (getComputedStyle) so Customize palette retints charts
- Never hardcode #ff7a00 / #3b82f6 in JSX — always from tokens
- Mode: Metric Board = light-only; Orbit Data = dark-only (do not mix)
- Density: insight headline + proof/KPIs + chart + so-what; fill the canvas (no empty lower thirds)
- Scorecard: rich tiles (plan/prior/owner) + drivers + trend with Y domain from 0 + annotate
- Animation: remount charts on slide entry (key=slide); pies/donuts mount empty then fill (~1.4s ease-out)
- Axes: absolute indexes (0–100 NPS etc.) must use domain={[0, max]} — do not float mid-chart
- Tooltips: themed surfaces; prefers-reduced-motion: isAnimationActive={false}
- A11y: aria-label on each chart + textual KPI/legend beside every visual
- Skill ref: interactive-presentation-deck/references/data-board-decks.md
`;

export const DATA_THEME_IDS = ["orbit-data", "metric-board"] as const;
export type DataThemeId = (typeof DATA_THEME_IDS)[number];

export function isDataTheme(id: string): id is DataThemeId {
  return (DATA_THEME_IDS as readonly string[]).includes(id);
}
