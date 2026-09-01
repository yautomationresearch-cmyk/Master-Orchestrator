# Oracle guards — verifying the verifier

```bash
node bench/oracle-guards/run.mjs   # deterministic; no app, agent, or API. exit 1 on any breach
```

These are **not app bugs**. Each guard is a permanent regression guard for a historical false-green or for the honesty machinery, and the assertion target is **Reticle's own verdict**, not the app. They live in their own runner — rather than only as scattered unit tests — so _"is our verifier still honest?"_ is one command with one exit code.

Requires the server built (`pnpm --filter @reticlehq/server build`); the runner imports the REAL shipped functions, so it grades what ships.

## The guards (9/9 holding, 2026-07-21)

**Historical false-greens** — each of these once shipped as a PASS and must never pass again:

| guard                        | must hold                                                      |
| ---------------------------- | -------------------------------------------------------------- |
| `settled-vs-inflight`        | a request in flight is NOT settled, however quiet the DOM went |
| `console-info-not-error`     | info/debug chatter never counts as errors                      |
| `stale-signal-behind-cursor` | a signal from _before_ the action cannot satisfy the assertion |

**Honesty machinery** — a green may never look stronger than its evidence:

| guard | must hold |
| --- | --- |
| `blindspot-forces-partial-coverage` | an unobservable region degrades coverage instead of staying silent |
| `truncation-dirties-integrity` | dropped evidence marks the verdict rather than being absorbed |
| `presence-only-cannot-clear-a-net-bar` | a presence-graded green cannot satisfy a consequence bar |

**Hostile-page survival** — the substrate must not lie at scale:

| guard | must hold |
| --- | --- |
| `churn-cannot-evict-scarce-evidence` | a DOM flood cannot push the one failed request out of the window |
| `learned-ambient-region-still-settles` | a churning feed stops blocking settle once learned ambient |

**The standing gate:**

| guard                       | must hold                                      |
| --------------------------- | ---------------------------------------------- |
| `clean-build-zero-findings` | a clean window raises nothing — no crying wolf |

## Why these are not vacuous

Every guard asserts **both directions**, so it cannot pass by simply never firing: `settled-vs-inflight` requires FALSE while pending _and_ TRUE once resolved; `learned-ambient-region-still-settles` requires the unlearned feed to block settle _and_ the learned one to allow it; `presence-only-…` requires the weak grade to fail the bar _and_ the strong grade to clear it. A guard that only checked the failing half would still pass if the oracle were hard-wired to "no".

## Standing rule (from the plan)

> Zero false positives on the clean build is a hard gate — a new bug that trips clean is **reverted, not tuned.**

`clean-build-zero-findings` encodes that rule. If it ever breaches, the change that made the layer noisier is wrong, not the guard.

## Not yet covered

The plan also lists heal-refuses-wrong-element, heal-accepts-right-element, drift-decision-legibility and effect-honesty. Those need a live app (they assert on heal/drift behaviour against real DOM), so they belong with the injected-registry expansion rather than in this browser-free runner.
