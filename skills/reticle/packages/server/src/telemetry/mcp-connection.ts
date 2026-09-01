/**
 * When an MCP client actually attaches.
 *
 * This is the signal that separates "Reticle is installed and the daemon is running" from "a person
 * is using it". A daemon can sit up for days with no agent ever attaching — which looks like healthy
 * adoption in `daemon_started` and is in fact an onboarding failure nobody would think to report.
 *
 * It also exposes reconnect CHURN. A client whose transport keeps dropping reattaches every few
 * minutes, and in every other metric that is indistinguishable from enthusiastic use: more sessions,
 * more connects, more activity. The `reconnect` flag is what tells those two stories apart.
 */
import { TelemetryEventKind } from '@reticlehq/core';
import { getTelemetry } from './telemetry.js';

let connectsSeen = 0;
/** Set when the daemon starts, so the FIRST connect can report how long Reticle sat unused. */
let daemonStartedAt: number | undefined;

export function markDaemonStart(now: number): void {
  daemonStartedAt = now;
  connectsSeen = 0;
}

/** Report one client attaching. Best-effort; a metric must never affect whether a client connects. */
export function reportMcpConnected(client?: string, now: () => number = () => Date.now()): void {
  try {
    const reconnect = connectsSeen > 0;
    connectsSeen += 1;
    void getTelemetry().emit(TelemetryEventKind.MCP_CLIENT_CONNECTED, {
      connection: {
        reconnect,
        // A large value on the FIRST connect is the interesting case: Reticle was started and then
        // sat there. On a reconnect it is just how long the daemon has been up.
        daemonAgeMs: daemonStartedAt === undefined ? 0 : Math.max(0, now() - daemonStartedAt),
        ...(client !== undefined ? { client } : {}),
      },
    });
  } catch {
    /* never let a metric interfere with a client attaching */
  }
}

/** Tests only. */
export function resetMcpConnections(): void {
  connectsSeen = 0;
  daemonStartedAt = undefined;
}
