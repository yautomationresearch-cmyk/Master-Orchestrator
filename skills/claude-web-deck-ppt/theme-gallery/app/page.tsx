"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useThemeCustomize } from "./components/ThemeCustomize";
import { describeCustomize } from "./lib/customize";
import { paletteById } from "./lib/palettes";
import {
  THEMES,
  buildDeckInstruction,
  type AnimationLevel,
  type DensityMode,
  type ThemeId,
} from "./lib/themes";

const SWATCH_TITLE: Record<ThemeId, ReactNode> = {
  "work-map": (
    <>
      Codex for
      <br />
      <em>Everyone.</em>
    </>
  ),
  neuroscience: (
    <>
      Inside the
      <br />
      <em>human brain.</em>
    </>
  ),
  "ink-mono": (
    <>
      Deep work in
      <br />
      <em>a noisy world.</em>
    </>
  ),
  "paper-violet": (
    <>
      Memory is a
      <br />
      <em>practice loop.</em>
    </>
  ),
  "amber-signal": (
    <>
      Warm signal.
      <br />
      <em>Clear action.</em>
    </>
  ),
  coastal: (
    <>
      Calm rooms
      <br />
      <em>learn faster.</em>
    </>
  ),
  "orbit-data": (
    <>
      Charts that
      <br />
      <em>move decision.</em>
    </>
  ),
  "metric-board": (
    <>
      Light and dark.
      <br />
      <em>Same evidence.</em>
    </>
  ),
};

const SWATCH_META: Record<ThemeId, string> = {
  "work-map": "DARK GREEN · FULL GRID",
  neuroscience: "IMAGE-LED · ONE-BY-ONE",
  "ink-mono": "BLACK & WHITE · SHARP",
  "paper-violet": "LIGHT · VIOLET · GRID",
  "amber-signal": "CHARCOAL · AMBER",
  coastal: "LIGHT · SKY · HORIZON",
  "orbit-data": "DARK · ORANGE/BLUE · RECHARTS",
  "metric-board": "LIGHT/DARK · BOARDROOM DATA",
};

export default function ThemeGalleryHome() {
  const { state: customize } = useThemeCustomize();
  const [selected, setSelected] = useState<ThemeId | null>(null);
  const [animation, setAnimation] = useState<AnimationLevel>("cinematic");
  const [density, setDensity] = useState<DensityMode>("speaker-led");
  const [notes, setNotes] = useState(true);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [scenes, setScenes] = useState(12);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("select") as ThemeId | null;
    if (id && THEMES.some((t) => t.id === id)) {
      setSelected(id);
      window.history.replaceState({}, "", "/");
      window.requestAnimationFrame(() => {
        document.getElementById("brief-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  const selectedTheme = THEMES.find((t) => t.id === selected) ?? null;
  const customSummary = describeCustomize(customize);

  const instruction = useMemo(() => {
    if (!selected) return "";
    return buildDeckInstruction({
      themeId: selected,
      animation,
      density,
      notes,
      topic,
      audience,
      scenes,
      customize,
    });
  }, [selected, animation, density, notes, topic, audience, scenes, customize]);

  async function copyInstruction() {
    if (!instruction) return;
    await navigator.clipboard.writeText(instruction);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function selectTheme(id: ThemeId) {
    setSelected(id);
    window.requestAnimationFrame(() => {
      document.getElementById("brief-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const step = !selected ? 1 : copied ? 4 : 3;
  const palette = paletteById(customize.paletteId);

  return (
    <main className="hub">
      <header className="hub-header">
        <p className="hub-eyebrow">CONTENT SYSTEM · THEME GALLERY</p>
        <h1>Pick a theme. Customize fonts & color. Then brief the deck.</h1>
        <p className="hub-lead">
          Open a live preview, use the palette to lock headline/body fonts and a color-theory
          accent, then select → brief → copy instruction into chat.
        </p>

        <ol className="hub-steps" aria-label="How to use this gallery">
          <li className={step >= 1 ? "is-current" : ""}>
            <span>1</span>
            Preview + customize
          </li>
          <li className={selected ? "is-current" : ""}>
            <span>2</span>
            Select
          </li>
          <li className={selected ? "is-current" : ""}>
            <span>3</span>
            Brief
          </li>
          <li className={copied ? "is-current" : ""}>
            <span>4</span>
            Copy → chat
          </li>
        </ol>
      </header>

      {selectedTheme && (
        <section id="brief-panel" className="brief-panel" aria-label="Brief your deck">
          <div className="brief-top">
            <div>
              <p className="brief-kicker">SELECTED THEME</p>
              <h2>{selectedTheme.name}</h2>
              <p className="brief-feel">{selectedTheme.feel}</p>
              <p className="brief-pattern">{selectedTheme.pattern}</p>
              <div className="brief-customize">
                <p>
                  <strong>Headline:</strong> {customSummary.headline}
                </p>
                <p>
                  <strong>Body:</strong> {customSummary.body}
                </p>
                <p>
                  <strong>Palette:</strong> {customSummary.palette}
                  {palette && palette.id !== "theme-default" && (
                    <span className="brief-swatches" aria-hidden="true">
                      <i style={{ background: palette.accent }} />
                      <i style={{ background: palette.secondary }} />
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="brief-actions">
              <Link href={selectedTheme.href} className="btn-primary">
                Open live preview
              </Link>
              <button type="button" className="btn-ghost" onClick={() => setSelected(null)}>
                Change theme
              </button>
            </div>
          </div>

          <div className="brief-fields">
            <label>
              Topic
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How sleep rebuilds memory"
              />
            </label>
            <label>
              Audience
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. curious beginners"
              />
            </label>
            <label>
              Scenes
              <input
                type="number"
                min={8}
                max={24}
                value={scenes}
                onChange={(e) => setScenes(Number(e.target.value) || 12)}
              />
            </label>
            <label>
              Animation
              <select value={animation} onChange={(e) => setAnimation(e.target.value as AnimationLevel)}>
                <option value="subtle">Subtle</option>
                <option value="cinematic">Cinematic</option>
              </select>
            </label>
            <label>
              Density
              <select value={density} onChange={(e) => setDensity(e.target.value as DensityMode)}>
                <option value="speaker-led">Speaker-led</option>
                <option value="reading-first">Reading-first</option>
              </select>
            </label>
            <label className="check">
              <input type="checkbox" checked={notes} onChange={(e) => setNotes(e.target.checked)} />
              Presenter notes (press N in deck)
            </label>
          </div>

          <div className="brief-copy">
            <p className="brief-copy-label">Instruction for Cursor chat (includes your font + color picks)</p>
            <textarea className="instruction-box" readOnly value={instruction} />
            <div className="copy-row">
              <button type="button" className="btn-primary" onClick={copyInstruction}>
                Copy instruction
              </button>
              {copied && <span className="status">Copied — paste into chat to build the deck</span>}
            </div>
          </div>
        </section>
      )}

      <section className="hub-grid-wrap" aria-label="Theme previews">
        <div className="theme-grid">
          {THEMES.map((theme) => (
            <article
              key={theme.id}
              className={`theme-card${selected === theme.id ? " is-selected" : ""}`}
            >
              <Link href={theme.href} className={`theme-swatch ${theme.id}`} aria-label={`Preview ${theme.name}`}>
                <p className="swatch-title">{SWATCH_TITLE[theme.id]}</p>
                <p className="swatch-meta">{SWATCH_META[theme.id]}</p>
                <span className="swatch-play">Play preview →</span>
              </Link>
              <div className="theme-body">
                <h2>{theme.name}</h2>
                <p className="theme-feel">{theme.feel}</p>
                <p className="theme-pattern">{theme.pattern}</p>
                <p className="theme-best">Best for: {theme.bestFor}</p>
                <div className="theme-actions">
                  <Link href={theme.href} className="btn-primary">
                    Preview
                  </Link>
                  <button
                    type="button"
                    className={selected === theme.id ? "btn-selected" : "btn-ghost"}
                    onClick={() => selectTheme(theme.id)}
                  >
                    {selected === theme.id ? "Selected" : "Use this theme"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="hub-foot">
        In any preview, open <strong>Customize</strong> (palette, left of Use this theme) to change
        fonts and accents live. Those picks ride with the copied instruction.
      </p>
    </main>
  );
}
