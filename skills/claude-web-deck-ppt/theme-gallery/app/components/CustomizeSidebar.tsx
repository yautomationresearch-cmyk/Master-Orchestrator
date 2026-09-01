"use client";

import { useMemo, useState } from "react";
import { FONT_CATEGORIES, fontsInCategory, fontById, type FontCategory } from "../lib/fonts";
import { PALETTE_PRESETS } from "../lib/palettes";
import { useThemeCustomize } from "./ThemeCustomize";

export function CustomizeSidebar() {
  const {
    state,
    setHeadlineFont,
    setBodyFont,
    setPalette,
    randomPalette,
    resetCustomize,
    panelOpen,
    setPanelOpen,
  } = useThemeCustomize();

  const [headlineCat, setHeadlineCat] = useState<FontCategory>("sans");
  const [bodyCat, setBodyCat] = useState<FontCategory>("sans");

  const headlineFonts = useMemo(() => {
    const def = fontById("theme-default");
    const list = fontsInCategory(headlineCat).filter((f) => f.id !== "theme-default");
    return def ? [def, ...list] : list;
  }, [headlineCat]);
  const bodyFonts = useMemo(() => {
    const def = fontById("theme-default");
    const list = fontsInCategory(bodyCat).filter((f) => f.id !== "theme-default");
    return def ? [def, ...list] : list;
  }, [bodyCat]);
  const headline = fontById(state.headlineFontId);
  const body = fontById(state.bodyFontId);

  return (
    <>
      <button
        type="button"
        className={`customize-scrim${panelOpen ? " is-open" : ""}`}
        aria-label="Close customize panel"
        tabIndex={panelOpen ? 0 : -1}
        onClick={() => setPanelOpen(false)}
      />
      <aside
        id="theme-customize-panel"
        className={`customize-panel${panelOpen ? " is-open" : ""}`}
        aria-hidden={!panelOpen}
        aria-label="Customize theme fonts and colors"
      >
        <header className="customize-head">
          <div>
            <p className="customize-kicker">CUSTOMIZE</p>
            <h2>Fonts & color</h2>
          </div>
          <button type="button" className="customize-close" onClick={() => setPanelOpen(false)} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="customize-scroll">
          <section className="customize-section">
            <h3>Headline font</h3>
            <p className="customize-hint">Inside the PPT only — big titles via --serif. Gallery chrome stays readable.</p>
            <div className="font-cats">
              {FONT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={headlineCat === cat.id ? "is-active" : ""}
                  onClick={() => setHeadlineCat(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="font-list">
              {headlineFonts.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  className={`font-option${state.headlineFontId === font.id ? " is-active" : ""}`}
                  onClick={() => setHeadlineFont(font.id)}
                >
                  <span className="font-name">{font.name}</span>
                  <span className="font-sample" style={{ fontFamily: font.family }}>
                    {font.sample}
                  </span>
                </button>
              ))}
            </div>
            {headline && (
              <>
                <p className="live-preview-label">PPT sample</p>
                <p className="live-preview" style={{ fontFamily: headline.family }}>
                  The quick brown fox — {headline.name}
                </p>
              </>
            )}
          </section>

          <section className="customize-section">
            <h3>Body font</h3>
            <p className="customize-hint">Inside the PPT only — captions & slide body via --sans. Not gallery UI.</p>
            <div className="font-cats">
              {FONT_CATEGORIES.filter((c) => c.id !== "script").map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={bodyCat === cat.id ? "is-active" : ""}
                  onClick={() => setBodyCat(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="font-list">
              {bodyFonts.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  className={`font-option${state.bodyFontId === font.id ? " is-active" : ""}`}
                  onClick={() => setBodyFont(font.id)}
                >
                  <span className="font-name">{font.name}</span>
                  <span className="font-sample" style={{ fontFamily: font.family }}>
                    {font.sample}
                  </span>
                </button>
              ))}
            </div>
            {body && (
              <>
                <p className="live-preview-label">PPT sample</p>
                <p className="live-preview body" style={{ fontFamily: body.family }}>
                  Body reading sample — {body.name}
                </p>
              </>
            )}
          </section>

          <section className="customize-section">
            <div className="customize-section-row">
              <div>
                <h3>Color palette</h3>
            <p className="customize-hint">
              Retints accents and accent-tinted backgrounds inside this theme&apos;s PPT only
            </p>
              </div>
              <button type="button" className="btn-random" onClick={randomPalette}>
                Random
              </button>
            </div>
            <div className="palette-grid">
              {PALETTE_PRESETS.map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  className={`palette-option${state.paletteId === pal.id ? " is-active" : ""}`}
                  onClick={() => setPalette(pal.id)}
                >
                  <span className="palette-swatches" aria-hidden="true">
                    {pal.id === "theme-default" ? (
                      <i className="swatch default" />
                    ) : (
                      <>
                        <i className="swatch" style={{ background: pal.accent }} />
                        <i className="swatch" style={{ background: pal.secondary }} />
                      </>
                    )}
                  </span>
                  <span className="palette-meta">
                    <strong>{pal.name}</strong>
                    <em>{pal.theory}</em>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="customize-foot">
          <button type="button" className="btn-ghost" onClick={resetCustomize}>
            Reset defaults
          </button>
          <button type="button" className="btn-primary" onClick={() => setPanelOpen(false)}>
            Done — see preview
          </button>
        </footer>
      </aside>
    </>
  );
}
