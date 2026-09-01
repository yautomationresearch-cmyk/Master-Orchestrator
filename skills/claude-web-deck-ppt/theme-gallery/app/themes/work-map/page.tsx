"use client";

import { DeckChrome, useDeckNavigation } from "../../components/DeckChrome";
import { useThemeCustomize } from "../../components/ThemeCustomize";
import "./theme.css";

const slides = [
  { no: "00", label: "START HERE" },
  { no: "01", label: "THE SHIFT" },
  { no: "02", label: "THE BIG MAP" },
  { no: "03", label: "THE HANDOFF" },
  { no: "04", label: "THE CODEX FRAMEWORK" },
];

const outcomes = [
  { no: "01", title: "Make sense", copy: "Organize files, summarize documents, compare information." },
  { no: "02", title: "Make decisions", copy: "Research, analyze, prioritize, and make a plan." },
  { no: "03", title: "Make deliverables", copy: "Create reports, decks, trackers, and websites." },
  { no: "04", title: "Make changes", copy: "Edit files, build tools, fix problems, and ship." },
  { no: "05", title: "Make it repeat", copy: "Turn good work into templates, Skills, and automations." },
];

const framework = [
  ["C", "Context", "What does Codex need to see?"],
  ["O", "Outcome", "What should it produce or change?"],
  ["D", "Definition of done", "What quality bar, boundaries, and proof matter?"],
  ["E", "Execute in stages", "Inspect first. Plan next. Then do the work."],
  ["X", "eXamine", "Validate, review, improve—then scale it."],
] as const;

export default function WorkMapThemePreview() {
  const { active, setActive, next, previous, reset } = useDeckNavigation({ length: slides.length });
  const { cssVarsFor } = useThemeCustomize();

  return (
    <>
      <main className="wm-root" style={cssVarsFor("work-map")} aria-label="Work Map theme preview">
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
          <button className="brand" type="button" onClick={reset} aria-label="Return to title">
            <span /> WORK MAP · THEME
          </button>
          <p>
            {slides[active].no} · {slides[active].label}
          </p>
        </header>

        <section className="slide-shell" aria-live="polite">
          {active === 0 && (
            <article className="slide title-slide" key="title">
              <p className="eyebrow">THEME PREVIEW · CODEX WORK MAP</p>
              <h1>
                Codex for
                <br />
                <em>Everyone.</em>
              </h1>
              <p className="subtitle">Editorial green-on-ink. Typography, grids, hairline rules.</p>
              <div className="title-note">
                <span />
                <p>
                  Extracted from
                  <br />
                  <b>codex-work-map-slides</b>
                </p>
              </div>
              <p className="nav-hint">ARROWS OR CONTROL PILL · NO CLICK ADVANCE</p>
            </article>
          )}

          {active === 1 && (
            <article className="slide shift-slide" key="shift">
              <p className="eyebrow">THE SHIFT</p>
              <h2>
                Useful when it sees
                <br />
                <em>real context.</em>
              </h2>
              <div className="context-layout">
                <div className="inputs">
                  <span>WHAT YOU BRING</span>
                  <strong>Files</strong>
                  <strong>Data</strong>
                  <strong>Notes</strong>
                  <strong>Goals</strong>
                </div>
                <div className="context-arrow" aria-hidden="true">
                  <i />
                  <b>→</b>
                </div>
                <div className="result">
                  <span>WHAT YOU GET BACK</span>
                  <strong>
                    A review-ready
                    <br />
                    <em>outcome.</em>
                  </strong>
                  <p>Not just an answer—a piece of work you can inspect and use.</p>
                </div>
              </div>
              <p className="caption">Output quality starts with context quality.</p>
            </article>
          )}

          {active === 2 && (
            <article className="slide map-slide" key="map">
              <p className="eyebrow">THE BIG MAP</p>
              <h2>
                Five ways to get
                <br />
                <em>real work done.</em>
              </h2>
              <div className="outcome-grid">
                {outcomes.map((item) => (
                  <div className="outcome" key={item.no}>
                    <span>{item.no}</span>
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </div>
                ))}
              </div>
              <p className="caption">Choose the outcome you need.</p>
            </article>
          )}

          {active === 3 && (
            <article className="slide handoff-slide" key="handoff">
              <p className="eyebrow">THE HANDOFF</p>
              <h2>
                A task is a handoff,
                <br />
                <em>not just a prompt.</em>
              </h2>
              <div className="handoff-grid">
                <div>
                  <span>01</span>
                  <strong>Context</strong>
                  <p>Materials, background, and examples that shape the answer.</p>
                </div>
                <div>
                  <span>02</span>
                  <strong>Outcome</strong>
                  <p>What you want to achieve—not merely what action to take.</p>
                </div>
                <div>
                  <span>03</span>
                  <strong>Review</strong>
                  <p>Evidence, quality, changes, and anything still unknown.</p>
                </div>
              </div>
              <div className="handoff-rule">
                <span>CONTEXT</span>
                <i />
                <span>OUTCOME</span>
                <i />
                <span>REVIEW</span>
              </div>
            </article>
          )}

          {active === 4 && (
            <article className="slide framework-slide" key="framework">
              <div className="framework-heading">
                <div>
                  <p className="eyebrow">THE CODEX FRAMEWORK</p>
                  <h2>
                    Give it
                    <br />
                    <em>the whole job.</em>
                  </h2>
                </div>
                <p>Use this brief whenever the work matters enough to get right.</p>
              </div>
              <div className="framework-list">
                {framework.map(([letter, title, copy]) => (
                  <div key={letter}>
                    <b>{letter}</b>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
              <p className="caption">The prompt is the brief for the work.</p>
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
                aria-label={`Go to ${slide.label}`}
              />
            ))}
          </div>
          <p>THEME GALLERY</p>
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
        themeId="work-map"
      />
    </>
  );
}
