/**
 * What `GET /status` answers — the daemon describing itself.
 *
 * Carries the daemon's OWN version, because a daemon outlives every agent attached to it: after an
 * upgrade the new CLI attaches to the old daemon and serves its code, and until this field existed
 * there was no surface anywhere — not /status, not `reticle status` — naming the version actually
 * answering requests. See describeDaemonSkew.
 */
import type { SessionInfo } from './session/session-info.js';
import { CONTRACT_FINGERPRINT } from '@reticlehq/core';
import { SERVER_VERSION } from './version/server-version.js';

interface StatusPayload {
  running: true;
  version: string;
  /** The wire contract this daemon speaks — what another process compares against, not the version. */
  contract: string;
  sessionCount: number;
  sessions: SessionInfo[];
  /**
   * Why nothing is connected — present ONLY when `sessionCount` is 0.
   *
   * `reticle status` is the most-run command in the field, and with no sessions it answered
   * `sessionCount: 0` and stopped. That is the same dead end `reticle_sessions` used to be for
   * agents, at the same point in the funnel — the daemon is up, the agent is attached, and the app
   * never arrived — and it is where most installs stop. Agents got the diagnosis in 2.7.0; a human
   * running the command we tell them to run in `init`'s closing line deserves the same sentence.
   */
  why?: string;
}

export function statusPayload(
  sessionCount: number,
  sessions: SessionInfo[],
  /** The no-session diagnosis, injected so this stays pure and the port probe stays off this path. */
  why?: string,
): StatusPayload {
  return {
    running: true,
    version: SERVER_VERSION,
    contract: CONTRACT_FINGERPRINT,
    sessionCount,
    sessions,
    // Only when there is nothing to explain away: a diagnosis printed beside a live session would
    // contradict it.
    ...(0 === sessionCount && why !== undefined ? { why } : {}),
  };
}
