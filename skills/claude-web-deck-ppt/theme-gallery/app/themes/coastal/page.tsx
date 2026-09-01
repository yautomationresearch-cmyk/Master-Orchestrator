"use client";

import { useMemo } from "react";
import { DeckChrome, useDeckNavigation } from "../../components/DeckChrome";
import { useThemeCustomize } from "../../components/ThemeCustomize";
import "./theme.css";

const chapters = [
  { no: "01", title: "Arrive", copy: "Set the room—what people already know and what they fear." },
  { no: "02", title: "Frame", copy: "Name the one question this session will answer." },
  { no: "03", title: "Practice", copy: "Do a small rep together before the big leap." },
  { no: "04", title: "Reflect", copy: "Ask what changed in their head, not just on the slide." },
  { no: "05", title: "Carry", copy: "Leave with one action they can finish this week." },
] as const;

const states = [
  { no: "00", label: "TITLE", scene: "title" as const },
  { no: "01", label: "WHY CALM", scene: "why" as const },
  { no: "02", label: "CHAPTER · 1", scene: "loop" as const, reveal: 1 },
  { no: "02", label: "CHAPTER · 2", scene: "loop" as const, reveal: 2 },
  { no: "02", label: "CHAPTER · 3", scene: "loop" as const, reveal: 3 },
  { no: "02", label: "CHAPTER · 4", scene: "loop" as const, reveal: 4 },
  { no: "02", label: "CHAPTER · 5", scene: "loop" as const, reveal: 5 },
  { no: "03", label: "ROOM RULES", scene: "practice" as const },
  { no: "04", label: "CLOSE", scene: "close" as const },
];

export default function CoastalPreview() {
  const { active, setActive, next, previous, reset } = useDeckNavigation({ length: states.length });
  const { cssVarsFor } = useThemeCustomize();
  const state = states[active];

  const dots = useMemo(
    () => states.map((item, index) => ({ index, label: item.label, active: index === active })),
    [active],
  );

  return (
    <>
      <main className="co-root" style={cssVarsFor("coastal")} aria-label="Coastal theme preview">
        <div className="top-progress">
          <i style={{ width: `${((active + 1) / states.length) * 100}%` }} />
        </div>
        <div className="grid" aria-hidden="true" />
        <i className="corner corner-tl" aria-hidden="true" />
        <i className="corner corner-tr" aria-hidden="true" />
        <i className="corner corner-bl" aria-hidden="true" />
        <i className="corner corner-br" aria-hidden="true" />

        <header className="deck-header">
          <button className="brand" type="button" onClick={reset}>
            <span /> COASTAL · THEME
          </button>
          <p>
            {state.no} · {state.label}
          </p>
        </header>

        <section className="slide-shell" aria-live="polite">
          {state.scene === "title" && (
            <article className="slide title-slide" key="title">
              <p className="eyebrow">HOW TO TEACH WITHOUT RUSHING</p>
              <h1>
                Calm rooms
                <br />
                <em>learn faster.</em>
              </h1>
              <p className="subtitle">Fog-blue paper, horizon rules, sky accent—workshop daylight.</p>
              <div className="title-rule">
                <span />
                <p>ARRIVE · FRAME · PRACTICE · REFLECT · CARRY</p>
              </div>
              <p className="nav-hint">→ CHAPTERS REVEAL ONE AT A TIME</p>
            </article>
          )}

          {state.scene === "why" && (
            <article className="slide panel-slide" key="why">
              <p className="eyebrow">WHY CALM</p>
              <h2>
                Speed without
                <br />
                <em>clarity is just noise.</em>
              </h2>
              <div className="pair-grid">
                <div>
                  <b>RUSHED</b>
                  <span>People nod. They don’t change behavior.</span>
                </div>
                <div>
                  <b>PACED</b>
                  <span>One idea lands. They can teach it back.</span>
                </div>
              </div>
            </article>
          )}

          {state.scene === "loop" && (
            <article className="slide map-slide" key={`loop-${state.reveal}`}>
              <p className="eyebrow">THE SESSION ARC</p>
              <h2>
                Five chapters that
                <br />
                <em>hold a room.</em>
              </h2>
              <p className="caption">Same progressive style as Neuroscience—one chapter per advance.</p>
              <div className="step-list">
                {chapters.map((step, index) => {
                  const reveal = state.reveal ?? 0;
                  const isVisible = index < reveal;
                  const isNew = index === reveal - 1;
                  return (
                    <div
                      key={step.no}
                      className={`${isVisible ? "is-visible" : ""} ${isNew ? "is-new" : ""}`}
                    >
                      <b>{step.no}</b>
                      <strong>{step.title}</strong>
                      <p>{step.copy}</p>
                    </div>
                  );
                })}
              </div>
            </article>
          )}

          {state.scene === "practice" && (
            <article className="slide" key="practice">
              <p className="eyebrow">ROOM RULES</p>
              <h2>
                Three habits
                <br />
                <em>that keep trust.</em>
              </h2>
              <div className="card-row">
                <article>
                  <span>01 · ASK</span>
                  <strong>Before tell</strong>
                  <p>Invite what they already believe—then build.</p>
                </article>
                <article>
                  <span>02 · SHOW</span>
                  <strong>Then do</strong>
                  <p>Demo once. Let them try while it’s fresh.</p>
                </article>
                <article>
                  <span>03 · LEAVE</span>
                  <strong>With one</strong>
                  <p>One carry action beats a packed slide dump.</p>
                </article>
              </div>
            </article>
          )}

          {state.scene === "close" && (
            <article className="slide close-slide" key="close">
              <p className="eyebrow">KEEP THIS</p>
              <h2>
                Teach like the tide—
                <br />
                <em>steady, not loud.</em>
              </h2>
              <p className="caption">
                Coastal is Paper Violet’s calm twin: light grid, sky accent, progressive reveals.
              </p>
            </article>
          )}
        </section>

        <footer className="deck-footer">
          <div className="slide-dots">
            {dots.map((dot) => (
              <button
                key={dot.index}
                type="button"
                className={dot.active ? "is-active" : ""}
                onClick={() => setActive(dot.index)}
                aria-label={dot.label}
              />
            ))}
          </div>
          <p>LIGHT · SKY · HORIZON</p>
          <p>
            {String(active + 1).padStart(2, "0")} / {String(states.length).padStart(2, "0")}
          </p>
        </footer>
      </main>

      <DeckChrome
        active={active}
        length={states.length}
        onPrev={previous}
        onNext={next}
        onReset={reset}
        themeId="coastal"
      />
    </>
  );
}
