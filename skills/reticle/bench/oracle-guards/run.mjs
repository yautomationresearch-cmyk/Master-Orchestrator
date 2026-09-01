// — ORACLE GUARDS: the suite that tests Reticle's own judgment.
//
// These are not app bugs. Each guard is a permanent regression guard for a historical false-green or for
// the honesty machinery, and the assertion target is *Reticle's verdict*, not the app. They live in their
// own runner (rather than only as unit tests) so "is our verifier still honest?" is one command with one
// exit code — the standing gate.
//
//   node bench/oracle-guards/run.mjs      # deterministic, no app/agent/API needed; exit 1 on any breach
//
// Requires the server built: pnpm --filter @reticlehq/server build

import { EventType, BlindSpotKind, PerfMetric } from '@reticlehq/core';
import { evalSettled, evalConsole } from '../../packages/server/dist/events/predicate-eval.js';
import { isAmbient, ambientKeyOf } from '../../packages/server/dist/journal/ambient.js';
import { RingBuffer } from '../../packages/server/dist/events/ring-buffer.js';
import { causalSummary } from '../../packages/server/dist/capsule/causal-summary.js';
import {
  blindSpotsFromEvents,
  buildCoverageStatement,
} from '../../packages/server/dist/honesty/blind-spots.js';
import { buildHonestyBlock, meetsHonestyBar } from '../../packages/server/dist/honesty/honesty.js';

let seq = 0;
const ev = (type, data = {}, t = ++seq, extra = {}) => ({
  t,
  seq,
  type,
  sessionId: 'guard',
  data,
  ...extra,
});

const guards = [];
const guard = (name, why, fn) => guards.push({ name, why, fn });

// ── Historical false-greens: each of these once shipped as a PASS and must never pass again ──────────

guard(
  'settled-vs-inflight',
  'a request in flight must not read as settled, however quiet the DOM is',
  () => {
    const pending = [ev(EventType.NET_PENDING, { id: 'r1' }, 10)];
    const notSettled = evalSettled(pending, { kind: 'settled', quietMs: 100 }, 1000);
    const done = [...pending, ev(EventType.NET_REQUEST, { id: 'r1', status: 200 }, 20)];
    const settled = evalSettled(done, { kind: 'settled', quietMs: 100 }, 1000);
    return !notSettled.pass && settled.pass;
  },
);

guard('console-info-not-error', 'info/debug chatter must not be counted as errors', () => {
  const window = [
    ev(EventType.CONSOLE_INFO, { message: 'fyi' }),
    ev(EventType.CONSOLE_DEBUG, { message: 'dbg' }),
  ];
  // console-clean must hold, and the summary's error count must be 0.
  const clean = evalConsole(window, { kind: 'console', level: 'error', absent: true });
  return clean.pass && causalSummary(window).consoleErrors === 0;
});

guard(
  'stale-signal-behind-cursor',
  'a signal from BEFORE the action must not satisfy the assertion',
  () => {
    // The since-floor guard: the same buffer, read with and without a floor, must disagree.
    const stale = [ev(EventType.SIGNAL, { name: 'order:placed' }, 10)];
    const noFloor = stale.filter((e) => e.t >= 0).length === 1;
    const withFloor = stale.filter((e) => e.t >= 50).length === 0;
    return noFloor && withFloor;
  },
);

// ── Honesty machinery: a green may never look stronger than its evidence ─────────────────────────────

guard(
  'blindspot-forces-partial-coverage',
  'an unobservable region must degrade coverage, never stay silent',
  () => {
    const window = [
      ev(EventType.BLIND_SPOT, { kind: BlindSpotKind.CROSS_ORIGIN_IFRAME, count: 1 }),
    ];
    const coverage = buildCoverageStatement(blindSpotsFromEvents(window));
    const honesty = buildHonestyBlock({
      grade: 'signal',
      coveragePartial: coverage.coverage === 'partial',
      blindSpots: coverage.note === undefined ? [] : [coverage.note],
    });
    return coverage.coverage === 'partial' && honesty.coverage.partial && !honesty.integrity.clean;
  },
);

guard(
  'truncation-dirties-integrity',
  'dropped evidence must mark the verdict, not be silently absorbed',
  () => {
    const honesty = buildHonestyBlock({ grade: 'net', truncated: true });
    return !honesty.integrity.clean && honesty.integrity.issues.some((i) => i.includes('truncat'));
  },
);

guard(
  'presence-only-cannot-clear-a-net-bar',
  'a presence-graded green must not satisfy a consequence bar',
  () => {
    const weak = buildHonestyBlock({ grade: 'presence' });
    const strong = buildHonestyBlock({ grade: 'signal' });
    const bar = { minGrade: 'net', requireIntegrityClean: true };
    return !meetsHonestyBar(weak, bar).ok && meetsHonestyBar(strong, bar).ok;
  },
);

// ── Hostile-page survival: the substrate must not lie at scale ───────────────────────────────────────

guard(
  'churn-cannot-evict-scarce-evidence',
  'a DOM flood must not push the one failed request out of the window',
  () => {
    const buf = new RingBuffer({ maxEvents: 50 });
    buf.push(ev(EventType.NET_REQUEST, { url: '/api/save', status: 500, ok: false }, 1), 1);
    for (let i = 0; i < 400; i++)
      buf.push(ev(EventType.DOM_TEXT, { text: String(i) }, 2 + i), 2 + i);
    return buf.since(0).some((e) => e.type === EventType.NET_REQUEST);
  },
);

guard(
  'learned-ambient-region-still-settles',
  'a churning feed must not block settle once learned ambient',
  () => {
    // A feed appends a NEW element each tick and removals carry no ref — so the key must be the region.
    const churn = [];
    for (let i = 0; i < 4; i++) {
      churn.push(
        ev(EventType.DOM_ADDED, { region: 'feed' }, 990 + i, { ref: `e${String(800 + i)}` }),
      );
      churn.push(ev(EventType.DOM_REMOVED, { region: 'feed' }, 991 + i));
    }
    const counts = { feed: 40 };
    const kept = churn.filter((e) => !isAmbient(counts, ambientKeyOf(e)));
    const settled = evalSettled(kept, { kind: 'settled', quietMs: 200 }, 1000);
    const unlearned = evalSettled(churn, { kind: 'settled', quietMs: 200 }, 1000);
    return settled.pass && !unlearned.pass;
  },
);

// ── The standing gate: clean input must produce ZERO findings ────────────────────────────────────────

guard('clean-build-zero-findings', 'a clean window must raise nothing — no crying wolf', () => {
  const clean = [
    ev(EventType.NET_REQUEST, { method: 'GET', url: '/api/ok', status: 200, ok: true }),
    ev(EventType.SIGNAL, { name: 'nav:changed' }),
    ev(EventType.PERF, { metric: PerfMetric.CLS, value: 0.001, at: 1 }),
  ];
  const summary = causalSummary(clean);
  const coverage = buildCoverageStatement(blindSpotsFromEvents(clean));
  const honesty = buildHonestyBlock({
    grade: 'signal',
    coveragePartial: coverage.coverage === 'partial',
  });
  return (
    summary.net.errors === 0 &&
    summary.consoleErrors === 0 &&
    coverage.coverage === 'full' &&
    honesty.integrity.clean
  );
});

console.log('\n=== oracle guards — is Reticle’s own judgment still honest? ===\n');
const failures = [];
for (const g of guards) {
  let ok = false;
  let err;
  try {
    ok = g.fn() === true;
  } catch (e) {
    err = e instanceof Error ? e.message : String(e);
  }
  if (!ok) failures.push(g.name);
  console.log(
    `  ${ok ? '✓' : '✗'} ${g.name.padEnd(36)} ${g.why}${err === undefined ? '' : ` [threw: ${err}]`}`,
  );
}
console.log(
  `\n  ${String(guards.length - failures.length)}/${String(guards.length)} guards hold` +
    (failures.length > 0 ? ` — BREACHED: ${failures.join(', ')}` : ' — verifier honesty intact') +
    '\n',
);
process.exit(failures.length === 0 ? 0 : 1);
