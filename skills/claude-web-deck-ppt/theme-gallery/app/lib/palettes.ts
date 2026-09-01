/**
 * Color-theory-backed accent pairs for deck themes.
 * Roles: accent (primary highlight) + secondary (supporting glow/rule).
 * Pairs favor complementary / analogous harmony with readable contrast on dark or light bases.
 */

export type PalettePreset = {
  id: string;
  name: string;
  theory: string;
  accent: string;
  secondary: string;
  soft: string;
  /** For light themes: slightly deeper accent for text */
  accentOnLight?: string;
};

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: "theme-default",
    name: "Theme default",
    theory: "Keep the theme’s original accents",
    accent: "",
    secondary: "",
    soft: "",
  },
  {
    id: "amber",
    name: "Amber signal",
    theory: "Warm analogous — energy without neon",
    accent: "#ffb020",
    secondary: "#ff7a3d",
    soft: "rgba(255, 176, 32, 0.14)",
    accentOnLight: "#c47a00",
  },
  {
    id: "orange",
    name: "Orange punch",
    theory: "Complementary dark + warm focus",
    accent: "#ff6a3d",
    secondary: "#ffb347",
    soft: "rgba(255, 106, 61, 0.14)",
    accentOnLight: "#d44a1a",
  },
  {
    id: "violet",
    name: "Violet focus",
    theory: "Analogous cool — editorial depth",
    accent: "#8b6cff",
    secondary: "#c4a8ff",
    soft: "rgba(139, 108, 255, 0.14)",
    accentOnLight: "#5b3fd4",
  },
  {
    id: "teal",
    name: "Teal clarity",
    theory: "Split-complementary cool calm",
    accent: "#2dd4bf",
    secondary: "#67e8f9",
    soft: "rgba(45, 212, 191, 0.14)",
    accentOnLight: "#0f766e",
  },
  {
    id: "cyan",
    name: "Cyan beam",
    theory: "Analogous cool — science / tech",
    accent: "#38d6ff",
    secondary: "#7c9bff",
    soft: "rgba(56, 214, 255, 0.14)",
    accentOnLight: "#0284c7",
  },
  {
    id: "rose",
    name: "Rose heat",
    theory: "Complementary warmth on cool grounds",
    accent: "#ff6b9d",
    secondary: "#ffb4c8",
    soft: "rgba(255, 107, 157, 0.14)",
    accentOnLight: "#db2777",
  },
  {
    id: "gold",
    name: "Gold authority",
    theory: "Metallic analogous — premium restraint",
    accent: "#e8c547",
    secondary: "#f5e6a3",
    soft: "rgba(232, 197, 71, 0.14)",
    accentOnLight: "#a16207",
  },
  {
    id: "lime",
    name: "Lime operator",
    theory: "High-key analogous — field-guide energy",
    accent: "#8cf7bb",
    secondary: "#c8ff9e",
    soft: "rgba(140, 247, 187, 0.14)",
    accentOnLight: "#15803d",
  },
  {
    id: "blue",
    name: "Atlas blue",
    theory: "Monochromatic cool hierarchy",
    accent: "#5b8cff",
    secondary: "#93c5fd",
    soft: "rgba(91, 140, 255, 0.14)",
    accentOnLight: "#1d4ed8",
  },
  {
    id: "coral",
    name: "Coral dusk",
    theory: "Analogous warm sunset",
    accent: "#ff7e6b",
    secondary: "#ffc2a8",
    soft: "rgba(255, 126, 107, 0.14)",
    accentOnLight: "#c2410c",
  },
  {
    id: "mint",
    name: "Mint paper",
    theory: "Soft analogous for light grounds",
    accent: "#34d399",
    secondary: "#a7f3d0",
    soft: "rgba(52, 211, 153, 0.16)",
    accentOnLight: "#047857",
  },
];

/** Curated random pool — excludes theme-default; all pairs pass contrast intent on dark/light decks */
const RANDOM_POOL = PALETTE_PRESETS.filter((p) => p.id !== "theme-default");

export function paletteById(id: string | null | undefined): PalettePreset | undefined {
  return PALETTE_PRESETS.find((p) => p.id === id);
}

export function pickRandomPalette(excludeId?: string | null): PalettePreset {
  const pool = RANDOM_POOL.filter((p) => p.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)] ?? RANDOM_POOL[0];
}
