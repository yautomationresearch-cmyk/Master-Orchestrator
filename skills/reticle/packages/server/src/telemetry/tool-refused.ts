/**
 * Reporting the calls Reticle could not serve.
 *
 * The refusal path is the largest thing this product does and the least measured one. It computes a
 * precise diagnosis — which of three no-session situations this is, that a ref went stale, that a
 * predicate did not parse — hands it to the agent as prose, and throws it away. So a user who
 * attaches an agent, hits a wall on the first call and never comes back emits nothing at all, and
 * the whole cohort is visible only as the gap between two other numbers. See issue #172.
 *
 * Emitted from `runTool`, which is the one place both dispatch paths cross, so a tool added later is
 * covered without anybody remembering to cover it.
 */
import { TelemetryActor, TelemetryEventKind, type RefusalReason } from '@reticlehq/core';
import { getTelemetry } from './telemetry.js';

/**
 * Refusal events one daemon run will send.
 *
 * Volume is part of this taxonomy's design — the per-tool-call event was removed for exactly this
 * reason — and a stuck agent retrying one failing call is the shape most likely to produce hundreds.
 * The cap means the bill cannot scale with the pathology while the SHAPE of it still arrives: the
 * first fifty carry the tool, the cause and the retry flag, and `consecutiveRepeats` on the session
 * summary already reports how long the loop ran.
 */
const MAX_REFUSALS_PER_SESSION = 50;

let sent = 0;
/**
 * The tool whose call refused immediately before this one, if the last call refused at all.
 *
 * This is what `retried` is computed from, and it is why the event is sent at the moment of the
 * refusal rather than held back until the next call reveals whether one came. Holding it back would
 * lose the event entirely for an agent that gives up — which is precisely the agent this exists to
 * describe — so the flag lands on the RETRY instead of on the first refusal.
 */
let lastRefusedTool: string | undefined;

/** A call that was served. Breaks the retry chain: what follows it is not a retry of anything. */
export function noteToolServed(): void {
  lastRefusedTool = undefined;
}

/** One refused call, reported with its cause and whether it was itself a retry. */
export function reportToolRefused(tool: string, reason: RefusalReason): void {
  const retried = lastRefusedTool === tool;
  lastRefusedTool = tool;
  if (sent >= MAX_REFUSALS_PER_SESSION) return;
  sent += 1;
  void getTelemetry().emit(TelemetryEventKind.TOOL_REFUSED, {
    actor: TelemetryActor.AGENT,
    refusal: { tool, reason, retried },
  });
}

/** Tests only — the counters are process-lifetime, so each case has to start from zero. */
export function resetToolRefusals(): void {
  sent = 0;
  lastRefusedTool = undefined;
}
