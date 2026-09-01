import { fontById } from "./fonts";
import { paletteById, type PalettePreset } from "./palettes";
import type { ThemeId } from "./themes";

export type ThemeCustomizeState = {
  headlineFontId: string;
  bodyFontId: string;
  paletteId: string;
};

export const DEFAULT_CUSTOMIZE: ThemeCustomizeState = {
  headlineFontId: "theme-default",
  bodyFontId: "theme-default",
  paletteId: "theme-default",
};

const STORAGE_KEY = "content-system.theme-customize.v2";

export function loadCustomize(): ThemeCustomizeState {
  if (typeof window === "undefined") return DEFAULT_CUSTOMIZE;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CUSTOMIZE;
    const parsed = JSON.parse(raw) as Partial<ThemeCustomizeState>;
    return {
      headlineFontId: parsed.headlineFontId || DEFAULT_CUSTOMIZE.headlineFontId,
      bodyFontId: parsed.bodyFontId || DEFAULT_CUSTOMIZE.bodyFontId,
      paletteId: parsed.paletteId || DEFAULT_CUSTOMIZE.paletteId,
    };
  } catch {
    return DEFAULT_CUSTOMIZE;
  }
}

export function saveCustomize(state: ThemeCustomizeState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function customizeQuery(state: ThemeCustomizeState): string {
  const params = new URLSearchParams();
  if (state.headlineFontId !== DEFAULT_CUSTOMIZE.headlineFontId) {
    params.set("hf", state.headlineFontId);
  }
  if (state.bodyFontId !== DEFAULT_CUSTOMIZE.bodyFontId) {
    params.set("bf", state.bodyFontId);
  }
  if (state.paletteId !== DEFAULT_CUSTOMIZE.paletteId) {
    params.set("pal", state.paletteId);
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function parseCustomizeQuery(search: string): Partial<ThemeCustomizeState> {
  const params = new URLSearchParams(search);
  const out: Partial<ThemeCustomizeState> = {};
  const hf = params.get("hf");
  const bf = params.get("bf");
  const pal = params.get("pal");
  if (hf && fontById(hf)) out.headlineFontId = hf;
  if (bf && fontById(bf)) out.bodyFontId = bf;
  if (pal && paletteById(pal)) out.paletteId = pal;
  return out;
}

/** Map customize state → CSS custom properties on a theme root */
export function customizeCssVars(
  state: ThemeCustomizeState,
  themeId: ThemeId,
): Record<string, string> {
  const headline = fontById(state.headlineFontId);
  const body = fontById(state.bodyFontId);
  const palette = paletteById(state.paletteId);
  const vars: Record<string, string> = {};

  if (headline && state.headlineFontId !== "theme-default") {
    vars["--serif"] = headline.family;
  }
  if (body && state.bodyFontId !== "theme-default") {
    vars["--sans"] = body.family;
  }

  if (!palette || palette.id === "theme-default" || !palette.accent) {
    return vars;
  }

  const lightThemes: ThemeId[] = ["paper-violet", "coastal"];
  const isLight = lightThemes.includes(themeId);
  const accent = isLight && palette.accentOnLight ? palette.accentOnLight : palette.accent;
  const secondary = palette.secondary;
  const soft = palette.soft;

  // Universal aliases
  vars["--accent"] = accent;
  vars["--accent-2"] = secondary;
  vars["--accent-soft"] = soft;

  // Theme-specific tokens (overwrite defaults live)
  vars["--green"] = accent;
  vars["--violet"] = accent;
  vars["--cyan"] = secondary;
  vars["--blue"] = secondary;
  vars["--rose"] = secondary;
  vars["--gold"] = secondary;
  vars["--violet-soft"] = soft;
  vars["--amber"] = accent;
  vars["--amber-hot"] = secondary;
  vars["--sky"] = accent;
  vars["--sky-soft"] = soft;
  vars["--orange"] = accent;
  vars["--chart-1"] = accent;
  vars["--chart-2"] = secondary;

  // Background washes — only when palette is chosen (defaults keep original theme art)
  // Skip ink-mono: canvas has no accent wash
  if (themeId !== "ink-mono") {
    if (themeId === "work-map" || themeId === "amber-signal") {
      vars["--bg-glow-1"] = `color-mix(in srgb, ${accent} 22%, transparent)`;
      vars["--bg-glow-2"] =
        themeId === "amber-signal"
          ? `color-mix(in srgb, ${secondary} 12%, transparent)`
          : `color-mix(in srgb, ${accent} 12%, transparent)`;
      vars["--bg-mid"] = `color-mix(in srgb, ${accent} 8%, ${themeId === "amber-signal" ? "#16110c" : "#111712"})`;
      vars["--bg-panel-soft"] = `color-mix(in srgb, ${accent} 12%, transparent)`;
    } else if (themeId === "neuroscience") {
      vars["--bg-glow-1"] = `color-mix(in srgb, ${accent} 22%, transparent)`;
      vars["--bg-glow-2"] = `color-mix(in srgb, ${secondary} 14%, transparent)`;
      vars["--bg-mid"] = `color-mix(in srgb, ${accent} 10%, #090d20)`;
      vars["--bg-spark"] = `color-mix(in srgb, ${secondary} 8%, transparent)`;
    } else if (themeId === "paper-violet" || themeId === "coastal") {
      vars["--bg-glow-1"] = `color-mix(in srgb, ${accent} 10%, transparent)`;
      vars["--bg-mid"] = `color-mix(in srgb, ${accent} 5%, ${themeId === "coastal" ? "#eef4fa" : "#f3effc"})`;
      vars["--bg-paper"] = `color-mix(in srgb, ${accent} 3%, ${themeId === "coastal" ? "#f3f7fb" : "#f7f4ff"})`;
    } else if (themeId === "orbit-data" || themeId === "metric-board") {
      vars["--bg-glow-1"] = `color-mix(in srgb, ${accent} 18%, transparent)`;
      vars["--bg-glow-2"] = `color-mix(in srgb, ${secondary} 14%, transparent)`;
      vars["--bg-mid"] =
        themeId === "orbit-data"
          ? `color-mix(in srgb, ${accent} 6%, #0b1018)`
          : `color-mix(in srgb, ${accent} 5%, #0d1524)`;
      vars["--bg-paper"] = `color-mix(in srgb, ${accent} 3%, #f7f8fa)`;
    }
  }

  // Ink mono: allow a restrained accent for emphasis only
  if (themeId === "ink-mono") {
    vars["--accent"] = accent;
    vars["--paper"] = "#f2f2f0";
  }

  return vars;
}

export function describeCustomize(state: ThemeCustomizeState): {
  headline: string;
  body: string;
  palette: string;
  theory: string;
  tokens: string;
} {
  const headline = fontById(state.headlineFontId);
  const body = fontById(state.bodyFontId);
  const palette = paletteById(state.paletteId) as PalettePreset | undefined;

  const tokens =
    !palette || palette.id === "theme-default"
      ? "theme defaults"
      : `accent ${palette.accent} · secondary ${palette.secondary}`;

  return {
    headline:
      state.headlineFontId === "theme-default"
        ? "Theme default (preview keeps its built-in type)"
        : headline
          ? `${headline.name} (${headline.category})`
          : state.headlineFontId,
    body:
      state.bodyFontId === "theme-default"
        ? "Theme default (preview keeps its built-in type)"
        : body
          ? `${body.name} (${body.category})`
          : state.bodyFontId,
    palette: palette?.name ?? state.paletteId,
    theory: palette?.theory ?? "",
    tokens,
  };
}
