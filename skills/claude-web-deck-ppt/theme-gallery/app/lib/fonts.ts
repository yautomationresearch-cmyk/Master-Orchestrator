export type FontCategory = "serif" | "sans" | "display" | "script";

export type FontOption = {
  id: string;
  name: string;
  category: FontCategory;
  /** CSS font-family stack */
  family: string;
  /** Google Fonts family query, or null for system stack */
  google?: string | null;
  sample: string;
  weights?: string;
};

export const FONT_CATEGORIES: { id: FontCategory; label: string; blurb: string }[] = [
  { id: "serif", label: "Serif", blurb: "Editorial authority — headlines & emphasis" },
  { id: "sans", label: "Sans", blurb: "Clean UI and body reading" },
  { id: "display", label: "Display", blurb: "Bold statement headlines" },
  { id: "script", label: "Script", blurb: "Expressive italic accent lines" },
];

/** Curated world-class fonts for presentation decks */
export const FONTS: FontOption[] = [
  {
    id: "theme-default",
    name: "Theme default",
    category: "sans",
    family: "var(--font-geist-sans), Arial, sans-serif",
    google: null,
    sample: "Aa — Keep each theme’s built-in type",
  },
  // Serif
  {
    id: "iowan",
    name: "Iowan / Georgia",
    category: "serif",
    family: '"Iowan Old Style", Baskerville, Georgia, "Times New Roman", serif',
    google: null,
    sample: "Aa — Editorial serif",
  },
  {
    id: "playfair",
    name: "Playfair Display",
    category: "serif",
    family: '"Playfair Display", Georgia, serif',
    google: "Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600",
    sample: "Aa — High-contrast classic",
  },
  {
    id: "libre-baskerville",
    name: "Libre Baskerville",
    category: "serif",
    family: '"Libre Baskerville", Baskerville, Georgia, serif',
    google: "Libre+Baskerville:ital,wght@0,400;0,700;1,400",
    sample: "Aa — Bookish & calm",
  },
  {
    id: "lora",
    name: "Lora",
    category: "serif",
    family: '"Lora", Georgia, serif',
    google: "Lora:ital,wght@0,400;0,600;0,700;1,400;1,600",
    sample: "Aa — Soft contemporary",
  },
  {
    id: "source-serif",
    name: "Source Serif 4",
    category: "serif",
    family: '"Source Serif 4", "Times New Roman", serif',
    google: "Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400",
    sample: "Aa — Readable long-form",
  },
  {
    id: "cormorant",
    name: "Cormorant Garamond",
    category: "serif",
    family: '"Cormorant Garamond", Garamond, Georgia, serif',
    google: "Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600",
    sample: "Aa — Tall elegant",
  },
  // Sans
  {
    id: "geist",
    name: "Geist",
    category: "sans",
    family: 'var(--font-geist-sans), Arial, sans-serif',
    google: null,
    sample: "Aa — Product-clear default",
  },
  {
    id: "inter",
    name: "Inter",
    category: "sans",
    family: '"Inter", system-ui, sans-serif',
    google: "Inter:wght@400;500;600;700",
    sample: "Aa — Neutral UI workhorse",
  },
  {
    id: "poppins",
    name: "Poppins",
    category: "sans",
    family: '"Poppins", Arial, sans-serif',
    google: "Poppins:wght@400;500;600;700",
    sample: "Aa — Geometric friendly",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    category: "sans",
    family: '"DM Sans", Arial, sans-serif',
    google: "DM+Sans:ital,wght@0,400;0,500;0,700;1,400",
    sample: "Aa — Soft geometric",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    category: "sans",
    family: '"Space Grotesk", Arial, sans-serif',
    google: "Space+Grotesk:wght@400;500;600;700",
    sample: "Aa — Tech editorial",
  },
  {
    id: "manrope",
    name: "Manrope",
    category: "sans",
    family: '"Manrope", Arial, sans-serif',
    google: "Manrope:wght@400;500;600;700;800",
    sample: "Aa — Modern rounded",
  },
  {
    id: "ibm-plex",
    name: "IBM Plex Sans",
    category: "sans",
    family: '"IBM Plex Sans", Arial, sans-serif',
    google: "IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400",
    sample: "Aa — Institutional clean",
  },
  // Display
  {
    id: "bebas",
    name: "Bebas Neue",
    category: "display",
    family: '"Bebas Neue", Impact, sans-serif',
    google: "Bebas+Neue",
    sample: "AA — Tall poster impact",
  },
  {
    id: "archivo-black",
    name: "Archivo Black",
    category: "display",
    family: '"Archivo Black", Impact, sans-serif',
    google: "Archivo+Black",
    sample: "Aa — Heavy poster",
  },
  {
    id: "syne",
    name: "Syne",
    category: "display",
    family: '"Syne", Arial, sans-serif',
    google: "Syne:wght@500;600;700;800",
    sample: "Aa — Art-direction bold",
  },
  {
    id: "oswald",
    name: "Oswald",
    category: "display",
    family: '"Oswald", Impact, sans-serif',
    google: "Oswald:wght@400;500;600;700",
    sample: "Aa — Condensed power",
  },
  {
    id: "instrument-serif",
    name: "Instrument Serif",
    category: "display",
    family: '"Instrument Serif", Georgia, serif',
    google: "Instrument+Serif:ital@0;1",
    sample: "Aa — Sharp display serif",
  },
  // Script
  {
    id: "caveat",
    name: "Caveat",
    category: "script",
    family: '"Caveat", "Segoe Script", cursive',
    google: "Caveat:wght@400;600;700",
    sample: "Aa — Hand-drawn note",
  },
  {
    id: "great-vibes",
    name: "Great Vibes",
    category: "script",
    family: '"Great Vibes", "Brush Script MT", cursive',
    google: "Great+Vibes",
    sample: "Aa — Formal script",
  },
  {
    id: "pacifico",
    name: "Pacifico",
    category: "script",
    family: '"Pacifico", "Brush Script MT", cursive',
    google: "Pacifico",
    sample: "Aa — Friendly brush",
  },
  {
    id: "dancing",
    name: "Dancing Script",
    category: "script",
    family: '"Dancing Script", "Segoe Script", cursive',
    google: "Dancing+Script:wght@400;600;700",
    sample: "Aa — Soft italic script",
  },
];

export function fontById(id: string | null | undefined): FontOption | undefined {
  return FONTS.find((f) => f.id === id);
}

export function fontsInCategory(category: FontCategory): FontOption[] {
  return FONTS.filter((f) => f.category === category);
}

export function googleFontsHref(ids: (string | null | undefined)[]): string | null {
  const families = ids
    .map((id) => fontById(id)?.google)
    .filter((g): g is string => Boolean(g));
  const unique = [...new Set(families)];
  if (!unique.length) return null;
  return `https://fonts.googleapis.com/css2?${unique.map((f) => `family=${f}`).join("&")}&display=swap`;
}
