"use client";

import { useMemo } from "react";
import { DeckChrome, useDeckNavigation } from "../../components/DeckChrome";
import { useThemeCustomize } from "../../components/ThemeCustomize";
import "./theme.css";

const IMG = "/images/neuroscience";

const jobs = [
  { no: "01", title: "Sense", copy: "Build a usable model from the body and the world.", color: "cyan" },
  { no: "02", title: "Select", copy: "Prioritize what matters now; suppress what does not.", color: "blue" },
  { no: "03", title: "Learn", copy: "Change connections and retrieve what experience taught.", color: "violet" },
  { no: "04", title: "Decide", copy: "Compare goals, consequences, value, and uncertainty.", color: "rose" },
  { no: "05", title: "Act", copy: "Coordinate speech, movement, physiology, and adaptation.", color: "gold" },
] as const;

const chemicals = [
  ["GLUTAMATE", "excitation"],
  ["GABA", "inhibition"],
  ["DOPAMINE", "movement + learning"],
  ["SEROTONIN", "broad modulation"],
  ["ACETYLCHOLINE", "attention + memory"],
  ["NOREPINEPHRINE", "arousal + attention"],
] as const;

type Scene =
  | "title"
  | "scale"
  | "map"
  | "neuron"
  | "atlas"
  | "classroom"
  | "close"
  | "sources";

/** Flat nav: one-by-one map reveals, then image-led teaching beats. */
const states: Array<{ no: string; label: string; scene: Scene; reveal?: number }> = [
  { no: "00", label: "TITLE", scene: "title" },
  { no: "01", label: "TISSUE", scene: "scale" },
  { no: "02", label: "JOBS · 1/5 SENSE", scene: "map", reveal: 1 },
  { no: "02", label: "JOBS · 2/5 SELECT", scene: "map", reveal: 2 },
  { no: "02", label: "JOBS · 3/5 LEARN", scene: "map", reveal: 3 },
  { no: "02", label: "JOBS · 4/5 DECIDE", scene: "map", reveal: 4 },
  { no: "02", label: "JOBS · 5/5 ACT", scene: "map", reveal: 5 },
  { no: "03", label: "NEURON", scene: "neuron" },
  { no: "04", label: "ATLAS", scene: "atlas" },
  { no: "05", label: "NETWORK", scene: "classroom" },
  { no: "06", label: "TAKEAWAY", scene: "close" },
  { no: "07", label: "SOURCES", scene: "sources" },
];

function SceneImage({
  src,
  className = "",
  position = "center",
}: {
  src: string;
  className?: string;
  position?: string;
}) {
  // Gallery ships static WebP — skip Next image optimization.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      className={`scene-image ${className}`}
      src={src}
      alt=""
      aria-hidden="true"
      decoding="async"
      style={{ objectPosition: position }}
    />
  );
}

export default function NeuroscienceThemePreview() {
  const { active, setActive, next, previous, reset } = useDeckNavigation({ length: states.length });
  const { cssVarsFor } = useThemeCustomize();
  const state = states[active];
  const isBleed = state.scene === "title" || state.scene === "neuron" || state.scene === "atlas" || state.scene === "classroom";

  const dots = useMemo(
    () =>
      states.map((item, index) => ({
        index,
        label: item.label,
        active: index === active,
        fragment: item.scene === "map",
      })),
    [active],
  );

  return (
    <>
      <main
        className={`ns-root${isBleed ? " is-bleed" : ""}`}
        style={cssVarsFor("neuroscience")}
        aria-label="Neuroscience theme preview"
      >
        <div className="progress-track">
          <i style={{ width: `${((active + 1) / states.length) * 100}%` }} />
        </div>
        {!isBleed && (
          <>
            <div className="ambient ambient-a" aria-hidden="true" />
            <div className="ambient ambient-b" aria-hidden="true" />
            <div className="perspective-grid" aria-hidden="true" />
          </>
        )}
        <i className="corner corner-tl" aria-hidden="true" />
        <i className="corner corner-tr" aria-hidden="true" />
        <i className="corner corner-bl" aria-hidden="true" />
        <i className="corner corner-br" aria-hidden="true" />

        <header className="deck-header">
          <button className="brand" type="button" onClick={reset} aria-label="Return to title">
            <span className="brand-orbit">
              <i />
            </span>
            NEURAL · FIELD NOTES
          </button>
          <p>
            {state.no} · {state.label}
          </p>
        </header>

        <section className="slide-shell" aria-live="polite">
          {state.scene === "title" && (
            <article className="slide title-slide" key="title">
              <SceneImage src={`${IMG}/hero-brain.webp`} className="title-visual" position="62% center" />
              <div className="visual-scrim" />
              <div className="title-copy">
                <p className="eyebrow">A MODERN INTRODUCTION TO NEUROSCIENCE</p>
                <h1>
                  Inside the
                  <br />
                  <em>human brain.</em>
                </h1>
                <p className="subtitle">
                  The living system behind everything we feel, remember, decide, and do.
                </p>
                <div className="title-rule">
                  <span />
                  <p>ANATOMY · CELLS · CIRCUITS · EXPERIENCE</p>
                </div>
              </div>
              <p className="nav-hint">ARROWS OR SPACE · ONE IDEA AT A TIME</p>
            </article>
          )}

          {state.scene === "scale" && (
            <article className="slide scale-slide" key="scale">
              <SceneImage src={`${IMG}/grey-white-matter.webp`} className="scale-visual" position="72% center" />
              <div className="scale-scrim" />
              <p className="eyebrow">THE TISSUE</p>
              <h2>
                Gray and white
                <br />
                <em>are interwoven.</em>
              </h2>
              <div className="scale-stack">
                <div>
                  <b>01</b>
                  <strong>Gray matter</strong>
                  <span>cell bodies · dendrites · synapses · glia</span>
                </div>
                <div>
                  <b>02</b>
                  <strong>White matter</strong>
                  <span>myelinated axons · long-range pathways · glia</span>
                </div>
              </div>
              <p className="caption">A tissue distinction—not “thinking matter” versus “wiring.”</p>
            </article>
          )}

          {state.scene === "map" && (
            <article className="slide map-slide" key={`map-${state.reveal}`}>
              <div className="map-head">
                <p className="eyebrow">THE FIVE JOBS</p>
                <p className="reveal-meter" aria-hidden="true">
                  {state.reveal}/5
                </p>
              </div>
              <h2>
                The brain makes a world,
                <br />
                <em>then helps us live inside it.</em>
              </h2>
              <p className="map-intro">Five jobs. Happening together. Revealed one at a time.</p>
              <div className="job-grid">
                {jobs.map((job, index) => {
                  const reveal = state.reveal ?? 0;
                  const isVisible = index < reveal;
                  const isNew = index === reveal - 1;
                  return (
                    <div
                      className={`job-card ${job.color} ${isVisible ? "is-visible" : ""} ${isNew ? "is-new" : ""}`}
                      key={job.no}
                    >
                      <span>{job.no}</span>
                      <strong>{job.title}</strong>
                      <p>{job.copy}</p>
                    </div>
                  );
                })}
              </div>
              <p className="caption">Rarely “which single part?” — more often “which network, in which context?”</p>
            </article>
          )}

          {state.scene === "neuron" && (
            <article className="slide image-slide neuron-slide" key="neuron">
              <SceneImage src={`${IMG}/neuron-synapse.webp`} position="58% center" />
              <div className="image-copy left-copy">
                <p className="eyebrow">THE LIVING RELAY</p>
                <h2>
                  A thought begins
                  <br />
                  <em>as electrochemistry.</em>
                </h2>
                <p className="lead">
                  Electrical along the axon.
                  <br />
                  Chemical across the synapse.
                </p>
                <div className="tag-row">
                  <span>DENDRITES</span>
                  <span>CELL BODY</span>
                  <span>AXON</span>
                  <span>TERMINAL</span>
                </div>
                <p className="small-copy">
                  Glia regulate the environment, form myelin, defend tissue, and help signaling work.
                </p>
              </div>
              <p className="source">NINDS · NCBI SYNAPSE</p>
            </article>
          )}

          {state.scene === "atlas" && (
            <article className="slide image-slide atlas-slide" key="atlas">
              <SceneImage src={`${IMG}/brain-map.webp`} position="70% center" />
              <div className="image-copy left-copy compact-copy">
                <p className="eyebrow">THE ATLAS</p>
                <h2>
                  The cortex is a map—
                  <br />
                  <em>not a set of boxes.</em>
                </h2>
                <div className="atlas-list">
                  <div className="coral">
                    <b>FRONTAL</b>
                    <span>planning · speech · voluntary action</span>
                  </div>
                  <div className="violet">
                    <b>PARIETAL</b>
                    <span>body signals · spatial integration</span>
                  </div>
                  <div className="cyan">
                    <b>TEMPORAL</b>
                    <span>auditory processing · memory</span>
                  </div>
                  <div className="blue">
                    <b>OCCIPITAL</b>
                    <span>visual processing</span>
                  </div>
                </div>
                <p className="small-copy">
                  Deep systems: thalamus · hypothalamus · basal ganglia · brainstem · cerebellum
                </p>
              </div>
              <p className="source">BRAINFACTS / SOCIETY FOR NEUROSCIENCE</p>
            </article>
          )}

          {state.scene === "classroom" && (
            <article className="slide image-slide classroom-slide" key="classroom">
              <SceneImage src={`${IMG}/classroom-network.webp`} position="64% center" />
              <div className="image-copy left-copy">
                <p className="eyebrow">THE WHOLE NETWORK</p>
                <h2>
                  A ten-second moment
                  <br />
                  <em>recruits the whole brain.</em>
                </h2>
                <div className="sequence">
                  <span>SEE</span>
                  <i />
                  <span>SELECT</span>
                  <i />
                  <span>HOLD</span>
                  <i />
                  <span>RETRIEVE</span>
                  <i />
                  <span>SPEAK</span>
                </div>
                <p className="lead">One behavior. Many levels of explanation.</p>
                <div className="chemical-chip-row" aria-hidden="true">
                  {chemicals.slice(0, 4).map(([name]) => (
                    <span key={name}>{name}</span>
                  ))}
                </div>
              </div>
              <p className="source">NINDS · BRAINFACTS · PFC REVIEW</p>
            </article>
          )}

          {state.scene === "close" && (
            <article className="slide close-slide" key="close">
              <SceneImage src={`${IMG}/hero-brain.webp`} className="close-visual" position="74% center" />
              <div className="close-scrim" />
              <p className="eyebrow">THE TAKEAWAY</p>
              <h2>
                The brain is not one answer.
                <br />
                <em>It is a system of answers.</em>
              </h2>
              <div className="question-grid">
                <div>
                  <b>WHERE?</b>
                  <span>region · cell · pathway</span>
                </div>
                <div>
                  <b>HOW?</b>
                  <span>signal · receptor · connection</span>
                </div>
                <div>
                  <b>WITH WHOM?</b>
                  <span>network · body · context</span>
                </div>
                <div>
                  <b>HOW SURE?</b>
                  <span>measured · inferred · debated</span>
                </div>
              </div>
              <p className="caption">If you can move between levels, you are already thinking like a neuroscientist.</p>
            </article>
          )}

          {state.scene === "sources" && (
            <article className="slide sources-slide" key="sources">
              <p className="eyebrow">RESEARCH TRAIL</p>
              <h2>
                Sources behind
                <br />
                <em>the story.</em>
              </h2>
              <div className="source-list">
                <div>
                  <b>01</b>
                  <strong>NINDS</strong>
                  <span>Brain Basics: The Life and Death of a Neuron</span>
                  <i>ninds.nih.gov</i>
                </div>
                <div>
                  <b>02</b>
                  <strong>BrainFacts / SfN</strong>
                  <span>Identifying Major Brain Landmarks</span>
                  <i>brainfacts.org</i>
                </div>
                <div>
                  <b>03</b>
                  <strong>NCBI Bookshelf</strong>
                  <span>Synapse · Neurotransmitters · Gray Matter</span>
                  <i>ncbi.nlm.nih.gov</i>
                </div>
                <div>
                  <b>04</b>
                  <strong>PMC review</strong>
                  <span>Prefrontal cortex in cognitive control</span>
                  <i>PMC8617292</i>
                </div>
                <div>
                  <b>05</b>
                  <strong>Dehaene et al.</strong>
                  <span>Toward a computational theory of conscious processing</span>
                  <i>PMC5635963</i>
                </div>
              </div>
              <p className="caption">Artwork is AI-generated. Scientific claims remain source-led.</p>
            </article>
          )}
        </section>

        <footer className="deck-footer">
          <div className="slide-dots">
            {dots.map((dot) => (
              <button
                key={dot.index}
                type="button"
                className={`${dot.active ? "is-active" : ""} ${dot.fragment ? "is-fragment" : ""}`}
                onClick={() => setActive(dot.index)}
                aria-label={`Go to ${dot.label}`}
              />
            ))}
          </div>
          <p className="footer-hint">← → · SPACE</p>
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
        themeId="neuroscience"
      />
    </>
  );
}
