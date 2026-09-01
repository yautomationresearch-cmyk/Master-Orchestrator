"use client";

import {
  FinanceComboChart,
  GrowthAreaChart,
  ImpactDonut,
  MarketPieChart,
  SegmentBars,
  SparkTrend,
} from "../../components/charts/ThemeCharts";
import { DeckChrome, useDeckNavigation } from "../../components/DeckChrome";
import { useThemeCustomize } from "../../components/ThemeCustomize";
import "./theme.css";

const ROOT = ".od-root";
const DARK = true;

const slides = [
  { no: "00", label: "OPEN" },
  { no: "01", label: "ASK" },
  { no: "02", label: "SCORECARD" },
  { no: "03", label: "GROWTH" },
  { no: "04", label: "MARKET" },
  { no: "05", label: "PRODUCT" },
  { no: "06", label: "ROADMAP" },
  { no: "07", label: "FINANCE" },
  { no: "08", label: "IMPACT" },
  { no: "09", label: "GTM" },
  { no: "10", label: "RISKS" },
  { no: "11", label: "DECISION" },
];

const scorecards = [
  {
    label: "Net revenue",
    value: "$2.4M",
    delta: "+35% vs plan",
    note: "On track",
    plan: "Plan $1.78M",
    prior: "Prior $1.9M",
    owner: "Finance",
  },
  {
    label: "Pipeline",
    value: "87%",
    delta: "+19 pts YoY",
    note: "Coverage 3.1×",
    plan: "Target 80%",
    prior: "Q2 68%",
    owner: "CRO",
  },
  {
    label: "Gross margin",
    value: "68%",
    delta: "+2.4 pts",
    note: "Above guardrail",
    plan: "Floor 66%",
    prior: "Q2 65.6%",
    owner: "COO",
  },
  {
    label: "Net retention",
    value: "118%",
    delta: "+6 pts",
    note: "Expansion-led",
    plan: "Gate 115%",
    prior: "Q2 112%",
    owner: "CS",
  },
];

const drivers = [
  ["Revenue beat", "Expansion seats + mid-market velocity; no one-off rescue deals."],
  ["Pipeline quality", "MEDDIC completion 91% on enterprise open opps (was 72%)."],
  ["Margin hold", "Partner SE utilization up; paid SMB CAC cut (−$180k run-rate)."],
  ["Retention", "Two at-risk logos recovered; TTV 4.2 wks → expansion window opens sooner."],
];

export default function OrbitDataThemePreview() {
  const { active, setActive, next, previous, reset } = useDeckNavigation({ length: slides.length });
  const { cssVarsFor } = useThemeCustomize();
  const chartKey = `od-${active}`;

  return (
    <>
      <main
        className="od-root"
        style={cssVarsFor("orbit-data")}
        aria-label="Orbit Data theme preview"
        data-mode="dark"
      >
        <div className="top-progress">
          <i style={{ width: `${((active + 1) / slides.length) * 100}%` }} />
        </div>
        <div className="grid" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <div className="rail rail-l" aria-hidden="true" />
        <div className="rail rail-r" aria-hidden="true" />
        <div className="corner corner-tl" aria-hidden="true" />
        <div className="corner corner-tr" aria-hidden="true" />
        <div className="corner corner-bl" aria-hidden="true" />
        <div className="corner corner-br" aria-hidden="true" />

        <header className="deck-header">
          <button className="brand" type="button" onClick={reset} aria-label="Return to title">
            <span /> ORBIT DATA · MERIDIAN OPS
          </button>
          <p>
            {slides[active].no} · {slides[active].label}
          </p>
        </header>
        <div className="mode-chip" aria-hidden="true">
          DARK OPERATOR · SAMPLE
        </div>

        <section className="slide-shell" aria-live="polite">
          {active === 0 && (
            <article className="slide deck-open" key="m0">
              <div className="open-copy">
                <p className="eyebrow">Q3 BOARD READOUT · MERIDIAN OPS</p>
                <h1>
                  Approve the $1.8M scale plan —
                  <em> evidence first, then the ask.</em>
                </h1>
                <p className="lede">
                  Dark-operator board pack: recommendation first, full operating evidence,
                  and a decision on every money slide. Designed to scan in under eight seconds without
                  empty canvas.
                </p>
                <ul className="open-points">
                  <li>
                    <b>01</b> Answer first — Pyramid / McKinsey order
                  </li>
                  <li>
                    <b>02</b> One insight + proof stack + visual + so-what
                  </li>
                  <li>
                    <b>03</b> Every money slide ends in an explicit decision
                  </li>
                </ul>
                <div className="open-foot">
                  <div>
                    <span>Prepared by</span>
                    <strong>RevOps + Finance</strong>
                  </div>
                  <div>
                    <span>As-of</span>
                    <strong>28 Jul · unaudited</strong>
                  </div>
                  <div>
                    <span>Agenda</span>
                    <strong>35 min + 10 Q&amp;A</strong>
                  </div>
                </div>
              </div>
              <aside className="open-aside">
                <p className="aside-kicker">DECISION REQUIRED</p>
                <p className="aside-body">
                  Fund enterprise expansion in N. America and DACH. Hold SMB paid ads. Keep gross
                  margin ≥ 66%.
                </p>
                <div className="aside-meta">
                  <span>Audience</span>
                  <strong>Board · CFO · CRO</strong>
                  <span>Cadence</span>
                  <strong>35 min + 10 Q&A</strong>
                  <span>Outcome</span>
                  <strong>Approve · Amend · Park</strong>
                </div>
                <ul className="aside-list">
                  <li>Scorecard first — prove the machine works</li>
                  <li>Then market mix — where quota should live</li>
                  <li>Close on hire money with brakes attached</li>
                </ul>
              </aside>
              <p className="nav-hint">ARROWS · SPACE · CONTROL PILL</p>
            </article>
          )}

          {active === 1 && (
            <article className="slide fill-col" key="m1">
              <p className="eyebrow">01 · THE ASK</p>
              <h2 className="insight wide">
                We recommend deploying <em>$1.8M</em> into enterprise GTM now — delayed hire cost
                exceeds the investment within two quarters.
              </h2>
              <div className="triad">
                <div className="triad-card">
                  <span>Investment</span>
                  <strong>$1.8M</strong>
                  <p>8 AEs + enablement + partner SE pod. Spend locked to NDR ≥ 115%.</p>
                  <em>Phased: 5 seats now · 3 after brake check</em>
                </div>
                <div className="triad-card">
                  <span>Payback</span>
                  <strong>11 mo</strong>
                  <p>Modeled on current enterprise win-rate (29%) and ACV ($84k).</p>
                  <em>Sensitivity: 24% win → 14 mo</em>
                </div>
                <div className="triad-card">
                  <span>Guardrail</span>
                  <strong>66% GM</strong>
                  <p>If blended margin dips below, freeze the final AE cohort.</p>
                  <em>Reviewed every ops meeting</em>
                </div>
              </div>
              <div className="dual-band">
                <div className="band-card">
                  <span>Why now</span>
                  <p>
                    Coverage is already 3.1× on enterprise. Waiting a quarter burns open capacity and
                    hands pipeline to competitors with trained benches.
                  </p>
                </div>
                <div className="band-card">
                  <span>What we will not do</span>
                  <p>
                    No SMB paid ramp. No hiring ahead of margin. No geography open without partner
                    certification in DACH.
                  </p>
                </div>
              </div>
              <div className="decision-bar">
                <span>Decision today</span>
                <p>Approve, amend (scope), or park until Q4 with a written trigger.</p>
              </div>
            </article>
          )}

          {active === 2 && (
            <article className="slide score-shell" key="m2">
              <div className="score-head">
                <p className="eyebrow">02 · OPERATING SCORECARD</p>
                <h2 className="insight wide">
                  Four dials are green — coverage is healthy, margin is holding, and expansion is
                  carrying retention.
                </h2>
              </div>
              <div className="score-grid">
                {scorecards.map((s) => (
                  <div className="score-tile rich" key={s.label}>
                    <div className="score-top">
                      <span>{s.label}</span>
                      <i className="rag up">{s.note}</i>
                    </div>
                    <strong>{s.value}</strong>
                    <em>{s.delta}</em>
                    <div className="score-meta">
                      <span>{s.plan}</span>
                      <span>{s.prior}</span>
                      <span>Owner · {s.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="score-bottom">
                <div className="driver-panel">
                  <p className="panel-kicker">What moved the dials</p>
                  <ul>
                    {drivers.map(([t, d]) => (
                      <li key={t}>
                        <b>{t}</b>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="score-viz">
                  <p className="panel-kicker">Trailing quality trend · NPS proxy</p>
                  <div className="spark-wrap tall">
                    <SparkTrend key={chartKey} rootSelector={ROOT} dark={DARK} />
                  </div>
                  <p className="annotate tight">
                    Read left → right: growth quality, not vanity top-line. Pipeline coverage stays
                    above 3.0× despite longer enterprise cycles. Watch: stage-age &gt; 48 days.
                  </p>
                </div>
              </div>
              <p className="source">Internal finance + CRM as of 28 Jul · Unaudited management view</p>
            </article>
          )}

          {active === 3 && (
            <article className="slide evidence-split" key="m3">
              <div className="evidence-copy stretch">
                <div>
                  <p className="eyebrow">03 · GROWTH</p>
                  <h2 className="insight">
                    Pipeline coverage hit <em>87%</em> of the annual plan with two months remaining —
                    quality is rising, not just volume.
                  </h2>
                  <ul className="proof-list">
                    <li>
                      <b>+19 pts</b>
                      <span>YoY pipeline quality score (MEDDIC completed)</span>
                    </li>
                    <li>
                      <b>3.1×</b>
                      <span>Coverage on enterprise band only</span>
                    </li>
                    <li>
                      <b>−14%</b>
                      <span>Unqualified SMB inbound vs Q2 (intentional)</span>
                    </li>
                    <li>
                      <b>41</b>
                      <span>Enterprise opps &gt; $50k in stage 3+</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="annotate">
                    So what: we can staff AEs without inventing pipeline from cold outbound.
                  </p>
                  <div className="mini-kpis">
                    <div>
                      <span>Avg ACV open</span>
                      <strong>$76k</strong>
                    </div>
                    <div>
                      <span>Win rate EE</span>
                      <strong className="up">29%</strong>
                    </div>
                    <div>
                      <span>Sales cycle</span>
                      <strong>74 d</strong>
                    </div>
                  </div>
                  <p className="source">CRM snapshot · weekly Monday cut</p>
                </div>
              </div>
              <div className="chart-stack">
                <div className="chart-panel tall">
                  <GrowthAreaChart key={chartKey} rootSelector={ROOT} dark={DARK} />
                </div>
                <p className="chart-caption">Monthly qualified pipeline index · Jan–Aug</p>
              </div>
            </article>
          )}

          {active === 4 && (
            <article className="slide evidence-split" key="m4">
              <div className="evidence-copy stretch">
                <div>
                  <p className="eyebrow">04 · MARKET MIX</p>
                  <h2 className="insight">
                    The $120B TAM is real — but <em>48%</em> of our reachable value sits in enterprise,
                    not the long SMB tail.
                  </h2>
                  <ul className="legend-list">
                    <li>
                      <i style={{ background: "var(--chart-1)" }} />
                      <div>
                        <b>Enterprise · 48%</b>
                        <span>$84k ACV · 29% win · SE-paired quota</span>
                      </div>
                    </li>
                    <li>
                      <i style={{ background: "var(--chart-2)" }} />
                      <div>
                        <b>Mid-market · 32%</b>
                        <span>$31k ACV · partner-led · co-sell motion</span>
                      </div>
                    </li>
                    <li>
                      <i style={{ background: "var(--chart-3)" }} />
                      <div>
                        <b>SMB · 20%</b>
                        <span>Keep PLG · cut paid acquisition</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="annotate">So what: concentrate quota and SE time where ACV compounds.</p>
                  <div className="dual-band compact">
                    <div className="band-card">
                      <span>Where we grow</span>
                      <p>NA + DACH enterprise. One SE twin per AE. Partner overlay only.</p>
                    </div>
                    <div className="band-card">
                      <span>Where we stop</span>
                      <p>SMB paid search paused. Freemium stays for product learning.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="chart-stack">
                <div className="chart-panel tall pie-panel">
                  <MarketPieChart key={chartKey} rootSelector={ROOT} dark={DARK} />
                </div>
                <p className="chart-caption">Addressable mix by segment · current ICP · $120B TAM framing</p>
              </div>
            </article>
          )}

          {active === 5 && (
            <article className="slide fill-col" key="m5">
              <p className="eyebrow">05 · PRODUCT SYSTEM</p>
              <h2 className="insight wide">
                Three capabilities close the loop from signal → decision → repeated execution.
              </h2>
              <div className="cap-rows">
                <div className="cap-row">
                  <b>01 Automation</b>
                  <p>Cut ticket re-entry and status theater. Teams spend cycles on judgment work.</p>
                  <span>−22% cycle time on OPS tickets</span>
                </div>
                <div className="cap-row">
                  <b>02 Analysis</b>
                  <p>Surface the decision, not another dashboard. Each view ends in an owner + date.</p>
                  <span>41 weekly exec decisions instrumented</span>
                </div>
                <div className="cap-row">
                  <b>03 Intelligence</b>
                  <p>Feed outcomes into next quarter planning so forecasts stop being folklore.</p>
                  <span>Forecast MAE −18% QoQ</span>
                </div>
              </div>
              <div className="dual-band">
                <div className="band-card">
                  <span>Shipped this quarter</span>
                  <p>Approval path v2 · CRM stage age alerts · CS tooling for TTV &lt; 5 weeks.</p>
                </div>
                <div className="band-card">
                  <span>Still open</span>
                  <p>Billing telemetry parity · partner SE capacity planner · MSA refresh with Legal.</p>
                </div>
              </div>
              <p className="source">Product analytics · last trailing 90 days</p>
            </article>
          )}

          {active === 6 && (
            <article className="slide fill-col" key="m6">
              <p className="eyebrow">06 · ROADMAP</p>
              <h2 className="insight wide">
                Hiring follows proof — we do not staff ahead of coverage or margin guardrails.
              </h2>
              <div className="road-grid">
                {[
                  ["Q1", "Instrument", "Close the telemetry gaps in CRM + billing.", "Done"],
                  ["Q2", "Automate", "Ship the approvals path that removes SWAT heroics.", "Done"],
                  ["Q3", "Scale seats", "Add the AE / SE cohort only if coverage ≥ 3.0×.", "In flight"],
                  ["Q4", "Compound", "Partner motion in DACH; recycle playbooks.", "Gated"],
                ].map(([q, t, d, st]) => (
                  <div className="road-card" key={q}>
                    <span>{q}</span>
                    <strong>{t}</strong>
                    <p>{d}</p>
                    <i className="road-status">{st}</i>
                  </div>
                ))}
              </div>
              <div className="decision-bar soft">
                <span>Dependencies</span>
                <p>Finance sign-off on margin guardrail · RevOps seat model · Legal MSA refresh</p>
              </div>
              <p className="annotate tight">
                Q3 hire trigger is met on coverage. Cohort #2 still waits on the 45-day brake review.
              </p>
            </article>
          )}

          {active === 7 && (
            <article className="slide evidence-split" key="m7">
              <div className="evidence-copy stretch">
                <div>
                  <p className="eyebrow">07 · FINANCE</p>
                  <h2 className="insight">
                    Revenue closed <em>$2.4M</em> in Q4 — <em>+35%</em> versus plan — while the target
                    line kept the team honest every quarter.
                  </h2>
                  <div className="mini-kpis">
                    <div>
                      <span>Q4 actual</span>
                      <strong>$2.4M</strong>
                    </div>
                    <div>
                      <span>vs plan</span>
                      <strong className="up">+35%</strong>
                    </div>
                    <div>
                      <span>Gross margin</span>
                      <strong>68%</strong>
                    </div>
                  </div>
                  <ul className="proof-list compact">
                    <li>
                      <b>Q1–Q4</b>
                      <span>Steady climb; no single deal &gt; 9% of the beat</span>
                    </li>
                    <li>
                      <b>Cash</b>
                      <span>Collections lag &lt; 12 days · DSO in band</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="annotate">
                    Bars = quarterly revenue. Blue line = board target. Beat comes from expansion and
                    faster mid-market close rates — not one-off deals.
                  </p>
                  <p className="source">Board pack P&amp;L · currency USD · constant FY rates</p>
                </div>
              </div>
              <div className="chart-stack">
                <div className="chart-panel tall">
                  <FinanceComboChart key={chartKey} rootSelector={ROOT} dark={DARK} />
                </div>
                <p className="chart-caption">Quarterly revenue vs target ($M)</p>
              </div>
            </article>
          )}

          {active === 8 && (
            <article className="slide evidence-split" key="m8">
              <div className="evidence-copy stretch">
                <div>
                  <p className="eyebrow">08 · CUSTOMER IMPACT</p>
                  <h2 className="insight">
                    Impact score sits at <em>98%</em> — NPS climbed every week as onboarding debt
                    cleared.
                  </h2>
                  <ul className="proof-list">
                    <li>
                      <b>118%</b>
                      <span>Net revenue retention · expansion &gt; churn</span>
                    </li>
                    <li>
                      <b>4.2 wks</b>
                      <span>Median time-to-value (was 6.1)</span>
                    </li>
                    <li>
                      <b>2</b>
                      <span>Logo churn events · both recovered to seats</span>
                    </li>
                    <li>
                      <b>NPS 72→98</b>
                      <span>Five-week climb after CS tooling drop</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className="spark-wrap">
                    <SparkTrend key={`${chartKey}-spark`} rootSelector={ROOT} dark={DARK} />
                  </div>
                  <p className="annotate tight">Composite index blends support load, CSAT, and expansion.</p>
                </div>
              </div>
              <div className="chart-stack">
                <div className="chart-panel tall pie-panel">
                  <ImpactDonut key={chartKey} rootSelector={ROOT} value={98} dark={DARK} />
                </div>
                <p className="chart-caption">Composite impact index · support + CSAT + expansion</p>
              </div>
            </article>
          )}

          {active === 9 && (
            <article className="slide fill-col" key="m9">
              <p className="eyebrow">09 · GO-TO-MARKET</p>
              <h2 className="insight wide">
                Spend follows the rings: expand where ACV compounds, hold where partners deliver, prune
                paid SMB noise.
              </h2>
              <div className="gtm-layout">
                <div className="ring" aria-hidden="true">
                  Expand
                  <br />
                  Hold
                  <br />
                  Prune
                </div>
                <div className="gtm-notes">
                  <div>
                    <b style={{ color: "var(--orange)" }}>Expand · 55% budget</b>
                    <p>Enterprise NA + DACH. Quota-carrying AEs with SE twin. Field marketing only.</p>
                  </div>
                  <div>
                    <b style={{ color: "var(--blue)" }}>Hold · 30% budget</b>
                    <p>Mid-market via certified partners. Co-sell, not dual-compete. Shared pipeline rules.</p>
                  </div>
                  <div>
                    <b>Prune · 15% budget</b>
                    <p>Pause SMB paid search. Keep PLG onboarding freemium intact for product signal.</p>
                  </div>
                </div>
              </div>
              <p className="annotate tight">
                Budget reallocates within 14 days of board approval — no soft landing for paid SMB.
              </p>
            </article>
          )}

          {active === 10 && (
            <article className="slide fill-col" key="m10">
              <p className="eyebrow">10 · RISKS & CONTROLS</p>
              <h2 className="insight wide">
                We only scale if the controls stay green — otherwise the plan auto-brakes.
              </h2>
              <div className="risk-table">
                <div className="risk-head">
                  <span>Risk</span>
                  <span>Signal</span>
                  <span>Brake</span>
                </div>
                {[
                  ["Enterprise cycle slip", "Avg stage age > 48d", "Freeze cohort #2 hires"],
                  ["Margin compression", "GM < 66% for 2 periods", "Cut partner SE spend 30%"],
                  ["Onboarding debt returns", "TTV > 5.5 wks", "Redirect 2 engineers to CS tooling"],
                  ["Pipeline quality dip", "MEDDIC < 80% open opps", "Pause new AE ramps 30 days"],
                ].map(([r, s, b]) => (
                  <div className="risk-row" key={r}>
                    <strong>{r}</strong>
                    <span>{s}</span>
                    <em>{b}</em>
                  </div>
                ))}
              </div>
              <p className="annotate">Controls are coded into the operating review — not slide theater.</p>
            </article>
          )}

          {active === 11 && (
            <article className="slide close-dense fill-col" key="m11">
              <p className="eyebrow">11 · DECISION</p>
              <h2 className="insight wide">
                Approve the $1.8M plan with the margin brake — or name the alternate path today.
              </h2>
              <div className="close-grid">
                <div className="close-card preferred">
                  <span>Option A · Recommended</span>
                  <strong>Approve scale plan</strong>
                  <p>Fund the AE/SE pod. Review brakes in 45 days. Geography: NA + DACH.</p>
                </div>
                <div className="close-card">
                  <span>Option B</span>
                  <strong>Approve · narrowed geography</strong>
                  <p>NA only; DACH waits for Q4 partner certification.</p>
                </div>
                <div className="close-card">
                  <span>Option C</span>
                  <strong>Park until Q4</strong>
                  <p>Require written trigger: coverage ≥ 3.2× for 6 weeks.</p>
                </div>
              </div>
              <div className="close-chart">
                <SegmentBars key={chartKey} rootSelector={ROOT} dark={DARK} />
              </div>
              <p className="nav-hint">USE THIS THEME → TO BRIEF YOUR REAL DECK</p>
            </article>
          )}
        </section>

        <nav className="sr-only" aria-label="Slide jumps">
          {slides.map((s, i) => (
            <button key={s.label} type="button" onClick={() => setActive(i)}>
              Go to {s.label}
            </button>
          ))}
        </nav>
      </main>

      <DeckChrome
        active={active}
        length={slides.length}
        onPrev={previous}
        onNext={next}
        onReset={reset}
        themeId="orbit-data"
      />
    </>
  );
}
