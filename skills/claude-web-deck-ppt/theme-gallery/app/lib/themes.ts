import type { ThemeCustomizeState } from "./customize";
import { describeCustomize } from "./customize";
import { CHART_INSTRUCTION_BLOCK, isDataTheme } from "./chartTokens";

export type ThemeId =
  | "work-map"
  | "neuroscience"
  | "ink-mono"
  | "paper-violet"
  | "amber-signal"
  | "coastal"
  | "orbit-data"
  | "metric-board";

export type AnimationLevel = "subtle" | "cinematic";
export type DensityMode = "speaker-led" | "reading-first";

export type ThemeMeta = {
  id: ThemeId;
  name: string;
  href: string;
  source: string;
  feel: string;
  pattern: string;
  tokens: string;
  bestFor: string;
};

export const THEMES: ThemeMeta[] = [
  {
    id: "work-map",
    name: "Work Map",
    href: "/themes/work-map",
    source: "codex-work-map-slides",
    feel: "Dark green editorial. Big serif claims, hairline grids, full grids of ideas on one slide.",
    pattern: "Shows the whole map at once (five panels together).",
    tokens: "--ink #090b09 · --off #f4f0e8 · --green #8cf7bb · Iowan + Geist",
    bestFor: "Frameworks, field guides, operator decks",
  },
  {
    id: "neuroscience",
    name: "Neuroscience",
    href: "/themes/neuroscience",
    source: "neuroscience-web-deck → theme-gallery (image-led gold)",
    feel: "Cinematic violet/cyan. Full-bleed WebP scenes, copy-safe left panels, source trail.",
    pattern: "Image-led teaching beats + one-by-one job reveals (Sense → Select → Learn → Decide → Act).",
    tokens: "--ink #050713 · --cyan #65e9ff · --violet #ac7dff · Iowan + Geist · public/images/neuroscience",
    bestFor: "Explainers, science, documentary lectures, visual lessons",
  },
  {
    id: "ink-mono",
    name: "Ink Mono",
    href: "/themes/ink-mono",
    source: "Content System · new (Work Map architecture, pure B&W)",
    feel: "Black and white only. Sharp contrast, no accent color — hierarchy from type and rules.",
    pattern: "Whole-slide compositions like Work Map, but monochrome.",
    tokens: "--ink #080808 · --paper #f2f2f0 · --line rgba(242,242,240,.22) · Iowan + Geist",
    bestFor: "Serious talks, print-like decks, minimal brand",
  },
  {
    id: "paper-violet",
    name: "Paper Violet",
    href: "/themes/paper-violet",
    source: "Content System · new (light grid + purple)",
    feel: "Light off-white paper, soft grid, violet accent. Daylight editorial.",
    pattern: "Progressive list reveals on key slides (one row at a time).",
    tokens: "--paper #f7f4ff · --ink #1a1428 · --violet #6b4cff · Iowan + Geist",
    bestFor: "Teaching decks, product education, light-mode brand",
  },
  {
    id: "amber-signal",
    name: "Amber Signal",
    href: "/themes/amber-signal",
    source: "Content System · new (dark warm operator)",
    feel: "Charcoal + amber. Diagonal energy, signal bars, warm operator tone.",
    pattern: "Full-system slides like Work Map, with bold signal hierarchy.",
    tokens: "--ink #0c0a08 · --off #f6efe4 · --amber #ffb020 · Iowan + Geist",
    bestFor: "Launch decks, strategy, urgency without neon chaos",
  },
  {
    id: "coastal",
    name: "Coastal",
    href: "/themes/coastal",
    source: "Content System · new (light blue editorial)",
    feel: "Soft fog-blue paper, horizon rules, sky accent. Calm teaching light mode.",
    pattern: "Progressive chapter reveals (one beat at a time).",
    tokens: "--paper #f3f7fb · --ink #14202b · --sky #2f6fed · Iowan + Geist",
    bestFor: "Workshops, onboarding, calm product education",
  },
  {
    id: "orbit-data",
    name: "Orbit Data",
    href: "/themes/orbit-data",
    source: "Content System · data (Claude PPT inspired)",
    feel: "Dark charcoal operator. Orange action + blue balance. KPI-first with floating chart panels.",
    pattern: "12-scene data story: growth → market → capabilities → roadmap → finance → impact → GTM → team.",
    tokens:
      "--ink #07090d · --orange #ff7a00 · --blue #3b82f6 · --chart-1…4 · Geist sans · Recharts",
    bestFor: "Board metrics, fundraising, AI product updates, ops reviews",
  },
  {
    id: "metric-board",
    name: "Metric Board",
    href: "/themes/metric-board",
    source: "Content System · data (light/dark boardroom)",
    feel: "Alternating light and dark boardroom slides. Same orange/blue chart system, cleaner corporate read.",
    pattern: "Alternating is-light / is-dark surfaces with Recharts KPIs on each beat.",
    tokens:
      "--paper/#0b1220 · --orange #ff7a00 · --blue #2563eb · --chart-1…4 · Geist sans · Recharts",
    bestFor: "QBR decks, investor updates, GTM reviews, executive readout",
  },
];

export function buildDeckInstruction(input: {
  themeId: ThemeId;
  animation: AnimationLevel;
  density: DensityMode;
  notes: boolean;
  topic: string;
  audience: string;
  scenes: number;
  customize?: ThemeCustomizeState;
}): string {
  const theme = THEMES.find((t) => t.id === input.themeId);
  if (!theme) return "";

  const slug =
    input.topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "new-deck";

  const custom = input.customize ? describeCustomize(input.customize) : null;
  const dataCharts = isDataTheme(input.themeId)
    ? `\n${CHART_INSTRUCTION_BLOCK}\n- Match scene rhythm of ${theme.href} (about ${input.scenes || 12} scenes)\n- Prefer Area/Line for trends, Pie for mix, Composed bar+line for plan vs actual, donut for scores\n`
    : "";

  return `Use the interactive-presentation-deck skill in Content System.

Create a production deck at:
decks/${slug}/

THEME (locked — match tokens and chrome from theme-gallery preview ${theme.href}):
- Name: ${theme.name}
- Source: ${theme.source}
- Feel: ${theme.feel}
- Reveal pattern: ${theme.pattern}
- Base tokens: ${theme.tokens}
${
  custom
    ? `
CUSTOMIZE (from live gallery — must apply):
- Headline / display font (PPT canvas only): ${custom.headline} → CSS --serif
- Body / caption font (PPT canvas only): ${custom.body} → CSS --sans
- Gallery / chrome UI stays readable Geist — do not apply PPT fonts outside the slide root
- Color palette: ${custom.palette} (${custom.theory})
- Accent tokens: ${custom.tokens}
- Retint accent-colored glows / washes in that theme’s PPT background when the theme uses accent in the canvas (skip Ink Mono — no accent wash)
- For data themes: map accent → --chart-1 / --orange, secondary → --chart-2 / --blue
- Load Google Fonts if needed; keep gallery/chrome on readable Geist only
`
    : ""
}
${dataCharts}
CONTENT
- Topic: ${input.topic || "[PASTE TOPIC]"}
- Audience: ${input.audience || "[PASTE AUDIENCE]"}
- Approx scenes: ${input.scenes}
- Density: ${input.density}
- Animation: ${input.animation} (respect prefers-reduced-motion)
- Presenter notes: ${input.notes ? "yes (N to toggle)" : "no"}

NAV / CONTROLS
- Advance only via arrows / Space / control pill — never click-on-slide
- Idle-hide controls after ~1.8s (mousemove brings back)
- Control / chrome fonts: readable Geist — never PPT display/serif

QUALITY
- Match the live preview quality of ${theme.name} in decks/theme-gallery
- PPT slide type uses theme/customize fonts (not hub UI type)
- Follow interactive-presentation-deck QA
- Use frontend-design only inside the locked theme + customize overrides
- design-auditor before done
${
  input.themeId === "neuroscience"
    ? `
IMAGERY (Neuroscience theme — required)
- Match image-led compositions from /themes/neuroscience (full-bleed WebP + copy-safe left scrim)
- Reference assets live at decks/theme-gallery/public/images/neuroscience/ (reuse or regenerate to match crop)
- Hybrid acquire: generate via image MCP/tool when available; otherwise ask the user which file for which scene ID
- Never ship broken image srcs — text-valid scenes without artwork if assets are pending
- Optimize to WebP; keep copy offline in HTML (no typography baked into images)
`
    : ""
}
Build it now.`;
}
