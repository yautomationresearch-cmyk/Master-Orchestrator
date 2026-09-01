"use client";

import { useMemo } from "react";
import { DeckChrome, useDeckNavigation } from "../../components/DeckChrome";
import { useThemeCustomize } from "../../components/ThemeCustomize";
import "./theme.css";

const steps = [
  { no: "01", title: "Encode", copy: "Pay attention long enough for the brain to mark the moment." },
  { no: "02", title: "Consolidate", copy: "Sleep and spaced rest move fragile traces into longer storage." },
  { no: "03", title: "Retrieve", copy: "Pulling the idea out strengthens it more than re-reading." },
  { no: "04", title: "Connect", copy: "Link new ideas to what you already understand." },
  { no: "05", title: "Teach", copy: "Explain it simply—gaps show up when you try to teach." },
] as const;

const states = [
  { no: "00", label: "TITLE", scene: "title" as const },
  { no: "01", label: "WHY IT FADES", scene: "why" as const },
  { no: "02", label: "LOOP · 1", scene: "loop" as const, reveal: 1 },
  { no: "02", label: "LOOP · 2", scene: "loop" as const, reveal: 2 },
  { no: "02", label: "LOOP · 3", scene: "loop" as const, reveal: 3 },
  { no: "02", label: "LOOP · 4", scene: "loop" as const, reveal: 4 },
  { no: "02", label: "LOOP · 5", scene: "loop" as const, reveal: 5 },
  { no: "03", label: "IN PRACTICE", scene: "practice" as const },
  { no: "04", label: "CLOSE", scene: "close" as const },
];

export default function PaperVioletPreview() {
  const { active, setActive, next, previous, reset } = useDeckNavigation({ length: states.length });
  const { cssVarsFor } = useThemeCustomize();
  const state = states[active];

  const dots = useMemo(
    () => states.map((item, index) => ({ index, label: item.label, active: index === active })),
    [active],
  );

  return (
    <>
      <main className="pv-root" style={cssVarsFor("paper-violet")} aria-label="Paper Violet theme preview">
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
            <span /> PAPER VIOLET · THEME
          </button>
          <p>
            {state.no} · {state.label}
          </p>
        </header>

        <section className="slide-shell" aria-live="polite">
          {state.scene === "title" && (
            <article className="slide title-slide" key="title">
              <p className="eyebrow">HOW LEARNING ACTUALLY STICKS</p>
              <h1>
                Memory is a
                <br />
                <em>practice loop.</em>
              </h1>
              <p className="subtitle">
                Light paper, soft grid, violet accent—daylight editorial for teaching decks.
              </p>
              <div className="title-rule">
                <span />
                <p>ENCODE · SLEEP · RETRIEVE · CONNECT · TEACH</p>
              </div>
              <p className="nav-hint">→ STEPS REVEAL ONE ROW AT A TIME</p>
            </article>
          )}

          {state.scene === "why" && (
            <article className="slide panel-slide" key="why">
              <p className="eyebrow">WHY IT FADES</p>
              <h2>
                Re-reading feels like
                <br />
                <em>learning—until the test.</em>
              </h2>
              <div className="pair-grid">
                <div>
                  <b>RECOGNITION</b>
                  <span>“I’ve seen this before.” Familiar ≠ durable.</span>
                </div>
                <div>
                  <b>RECALL</b>
                  <span>“I can produce this myself.” That is what sticks.</span>
                </div>
              </div>
            </article>
          )}

          {state.scene === "loop" && (
            <article className="slide map-slide" key={`loop-${state.reveal}`}>
              <p className="eyebrow">THE LOOP</p>
              <h2>
                Five moves that
                <br />
                <em>make memory durable.</em>
              </h2>
              <p className="caption">Same progressive style as Neuroscience—one step per advance.</p>
              <div className="step-list">
                {steps.map((step, index) => {
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
              <p className="eyebrow">IN PRACTICE</p>
              <h2>
                A weekly rhythm
                <br />
                <em>you can keep.</em>
              </h2>
              <div className="card-row">
                <article>
                  <span>01 · LEARN</span>
                  <strong>Capture</strong>
                  <p>Short notes in your words the same day you study.</p>
                </article>
                <article>
                  <span>02 · SLEEP</span>
                  <strong>Protect</strong>
                  <p>Don’t cram past midnight—consolidation needs rest.</p>
                </article>
                <article>
                  <span>03 · TEST</span>
                  <strong>Retrieve</strong>
                  <p>Closed-book quiz before you re-open the notes.</p>
                </article>
              </div>
            </article>
          )}

          {state.scene === "close" && (
            <article className="slide close-slide" key="close">
              <p className="eyebrow">KEEP THIS</p>
              <h2>
                Familiarity is cheap.
                <br />
                <em>Recall is earned.</em>
              </h2>
              <p className="caption">
                Paper Violet is the light-mode companion to Work Map: clear grid, violet accent,
                real teaching content.
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
          <p>LIGHT · VIOLET · GRID</p>
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
        themeId="paper-violet"
      />
    </>
  );
}
