"use client";

import { DeckChrome, useDeckNavigation } from "../../components/DeckChrome";
import { useThemeCustomize } from "../../components/ThemeCustomize";
import "./theme.css";

const slides = [
  { no: "00", label: "START" },
  { no: "01", label: "THE PROBLEM" },
  { no: "02", label: "FOUR PILLARS" },
  { no: "03", label: "RULES" },
  { no: "04", label: "CLOSE" },
];

const pillars = [
  { no: "01", title: "Protect time", copy: "Block deep hours before meetings eat the day." },
  { no: "02", title: "Cut inputs", copy: "Fewer tabs, fewer pings, clearer priorities." },
  { no: "03", title: "One outcome", copy: "Each block ends with a shippable artifact." },
  { no: "04", title: "Review weekly", copy: "Keep what worked. Drop what only felt busy." },
];

const rules = [
  ["01", "Start cold", "Open the hard file first—not email."],
  ["02", "Ship ugly", "A rough draft beats a perfect outline."],
  ["03", "Batch noise", "Messages twice a day, not twice an hour."],
  ["04", "End clean", "Write tomorrow’s first step before you leave."],
];

export default function InkMonoPreview() {
  const { active, setActive, next, previous, reset } = useDeckNavigation({ length: slides.length });
  const { cssVarsFor } = useThemeCustomize();

  return (
    <>
      <main className="im-root" style={cssVarsFor("ink-mono")} aria-label="Ink Mono theme preview">
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
            <span /> INK MONO · THEME
          </button>
          <p>
            {slides[active].no} · {slides[active].label}
          </p>
        </header>

        <section className="slide-shell" aria-live="polite">
          {active === 0 && (
            <article className="slide title-slide" key="title">
              <p className="eyebrow">A FIELD GUIDE TO ATTENTION</p>
              <h1>
                Deep work in
                <br />
                <em>a noisy world.</em>
              </h1>
              <p className="subtitle">Black and white only—hierarchy from type, rules, and space.</p>
              <div className="title-note">
                <span />
                <p>
                  No accent color.
                  <br />
                  <b>Contrast does the work.</b>
                </p>
              </div>
              <p className="nav-hint">→ ARROWS TO MOVE · NO PAGE SCROLL</p>
            </article>
          )}

          {active === 1 && (
            <article className="slide shift-slide" key="shift">
              <p className="eyebrow">THE PROBLEM</p>
              <h2>
                Busyness is not
                <br />
                <em>progress.</em>
              </h2>
              <div className="context-layout">
                <div className="inputs">
                  <span>WHAT FILLS THE DAY</span>
                  <strong>Slack</strong>
                  <strong>Meetings</strong>
                  <strong>Tabs</strong>
                  <strong>Guilt</strong>
                </div>
                <div className="context-arrow" aria-hidden="true">
                  <i />
                  <b>→</b>
                </div>
                <div className="result">
                  <span>WHAT YOU ACTUALLY NEED</span>
                  <strong>
                    Unbroken
                    <br />
                    <em>hours.</em>
                  </strong>
                  <p>Focus compounds. Context-switching taxes every unfinished thought.</p>
                </div>
              </div>
              <p className="caption">If everything is urgent, nothing important survives.</p>
            </article>
          )}

          {active === 2 && (
            <article className="slide map-slide" key="map">
              <p className="eyebrow">FOUR PILLARS</p>
              <h2>
                A simple system
                <br />
                <em>you can keep.</em>
              </h2>
              <div className="pillar-grid">
                {pillars.map((item) => (
                  <div className="pillar" key={item.no}>
                    <span>{item.no}</span>
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </div>
                ))}
              </div>
              <p className="caption">Shown together—like Work Map—so you see the whole system.</p>
            </article>
          )}

          {active === 3 && (
            <article className="slide rules-slide" key="rules">
              <p className="eyebrow">DAILY RULES</p>
              <h2>
                Four habits that
                <br />
                <em>defend the block.</em>
              </h2>
              <div className="rule-list">
                {rules.map(([no, title, copy]) => (
                  <div key={no}>
                    <b>{no}</b>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
              <p className="caption">Rules beat motivation when the calendar fights back.</p>
            </article>
          )}

          {active === 4 && (
            <article className="slide close-slide" key="close">
              <p className="eyebrow">KEEP THIS</p>
              <h2>
                Protect the hours.
                <br />
                <em>Ship the work.</em>
              </h2>
              <p className="caption">
                Ink Mono proves a deck can feel premium with zero color—only structure, type, and
                contrast.
              </p>
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
          <p>BLACK & WHITE</p>
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
        themeId="ink-mono"
      />
    </>
  );
}
