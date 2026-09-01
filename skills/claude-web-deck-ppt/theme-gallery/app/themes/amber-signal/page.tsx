"use client";

import { DeckChrome, useDeckNavigation } from "../../components/DeckChrome";
import { useThemeCustomize } from "../../components/ThemeCustomize";
import "./theme.css";

const slides = [
  { no: "00", label: "START" },
  { no: "01", label: "THE SIGNAL" },
  { no: "02", label: "FIVE MOVES" },
  { no: "03", label: "THE BRIEF" },
  { no: "04", label: "CLOSE" },
];

const moves = [
  { no: "01", title: "Spot", copy: "Name the real constraint—not the loudest complaint." },
  { no: "02", title: "Cut", copy: "Remove options until one path is obvious." },
  { no: "03", title: "Commit", copy: "Pick a date, owner, and definition of done." },
  { no: "04", title: "Ship", copy: "Release a thin slice before the perfect version." },
  { no: "05", title: "Learn", copy: "Capture what changed so the next cycle is sharper." },
];

const brief = [
  ["C", "Constraint", "What must stay true no matter what?"],
  ["O", "Outcome", "What does success look like in one sentence?"],
  ["D", "Deadline", "When does the first shippable version land?"],
  ["E", "Evidence", "How will we know it worked?"],
  ["X", "eXit", "What do we stop doing once this ships?"],
] as const;

export default function AmberSignalPreview() {
  const { active, setActive, next, previous, reset } = useDeckNavigation({ length: slides.length });
  const { cssVarsFor } = useThemeCustomize();

  return (
    <>
      <main className="as-root" style={cssVarsFor("amber-signal")} aria-label="Amber Signal theme preview">
        <div className="top-progress">
          <i style={{ width: `${((active + 1) / slides.length) * 100}%` }} />
        </div>
        <div className="grid" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <i className="corner corner-tl" aria-hidden="true" />
        <i className="corner corner-tr" aria-hidden="true" />
        <i className="corner corner-bl" aria-hidden="true" />
        <i className="corner corner-br" aria-hidden="true" />

        <header className="deck-header">
          <button className="brand" type="button" onClick={reset}>
            <span /> AMBER SIGNAL · THEME
          </button>
          <p>
            {slides[active].no} · {slides[active].label}
          </p>
        </header>

        <section className="slide-shell" aria-live="polite">
          {active === 0 && (
            <article className="slide title-slide" key="title">
              <p className="eyebrow">A FIELD GUIDE TO MOMENTUM</p>
              <h1>
                Warm signal.
                <br />
                <em>Clear action.</em>
              </h1>
              <p className="subtitle">Charcoal + amber—urgency with editorial restraint.</p>
              <div className="title-note">
                <span />
                <p>
                  Same spine as Work Map.
                  <br />
                  <b>Different heat.</b>
                </p>
              </div>
              <p className="nav-hint">CUSTOMIZE FONTS & COLOR FROM THE PALETTE</p>
            </article>
          )}

          {active === 1 && (
            <article className="slide shift-slide" key="shift">
              <p className="eyebrow">THE SIGNAL</p>
              <h2>
                Noise is free.
                <br />
                <em>Signal costs focus.</em>
              </h2>
              <div className="context-layout">
                <div className="inputs">
                  <span>WHAT CLOUDS IT</span>
                  <strong>Slack storms</strong>
                  <strong>Status theater</strong>
                  <strong>Fake urgency</strong>
                  <strong>Scope creep</strong>
                </div>
                <div className="context-arrow" aria-hidden="true">
                  <i />
                  <b>→</b>
                </div>
                <div className="result">
                  <span>WHAT CUTS THROUGH</span>
                  <strong>
                    One amber
                    <br />
                    <em>priority.</em>
                  </strong>
                  <p>If everything is highlighted, nothing is a signal.</p>
                </div>
              </div>
              <p className="caption">Protect the one move that compounds.</p>
            </article>
          )}

          {active === 2 && (
            <article className="slide map-slide" key="map">
              <p className="eyebrow">FIVE MOVES</p>
              <h2>
                A loop that
                <br />
                <em>creates momentum.</em>
              </h2>
              <div className="outcome-grid">
                {moves.map((item) => (
                  <div className="outcome" key={item.no}>
                    <span>{item.no}</span>
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </div>
                ))}
              </div>
              <p className="caption">Shown together—like Work Map—so the system is visible.</p>
            </article>
          )}

          {active === 3 && (
            <article className="slide framework-slide" key="brief">
              <div className="framework-heading">
                <div>
                  <p className="eyebrow">THE BRIEF</p>
                  <h2>
                    Write the job
                    <br />
                    <em>before the work.</em>
                  </h2>
                </div>
                <p>Five lines. No fluff. Enough for anyone to execute.</p>
              </div>
              <div className="framework-list">
                {brief.map(([letter, title, copy]) => (
                  <div key={letter}>
                    <b>{letter}</b>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
              <p className="caption">Ambiguity is expensive. Clarity ships.</p>
            </article>
          )}

          {active === 4 && (
            <article className="slide title-slide" key="close">
              <p className="eyebrow">KEEP THIS</p>
              <h1>
                Pick the signal.
                <br />
                <em>Ignore the rest.</em>
              </h1>
              <p className="subtitle">Amber Signal is Work Map’s warm twin—same architecture, different fire.</p>
            </article>
          )}
        </section>

        <footer className="deck-footer">
          <div className="slide-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.no}
                type="button"
                className={active === index ? "is-active" : ""}
                onClick={() => setActive(index)}
                aria-label={slide.label}
              />
            ))}
          </div>
          <p>CHARCOAL · AMBER</p>
          <p>
            {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </p>
        </footer>
      </main>

      <DeckChrome
        active={active}
        length={slides.length}
        onPrev={previous}
        onNext={next}
        onReset={reset}
        themeId="amber-signal"
      />
    </>
  );
}
