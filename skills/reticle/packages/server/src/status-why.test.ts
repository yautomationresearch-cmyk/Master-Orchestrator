/**
 * `reticle status` is where humans land at the exact point the funnel dies.
 *
 * It is the most-run command in the field, and `init`'s closing line sends people to it. With no app
 * connected it answered `sessionCount: 0` and stopped — the same dead end `reticle_sessions` used to
 * be for agents, at the same moment: the daemon is up, the MCP server is registered, and the app has
 * never arrived. Agents got the diagnosis in 2.7.0. A human running the command we tell them to run
 * deserves the same sentence.
 *
 * The daemon already computes it. This only stops it being thrown away between the bridge and the
 * printed line — which is the same defect shape as the telemetry block that reached the wire through
 * none of its four lists: computed correctly, declared nowhere, silently dropped.
 */

import { describe, expect, it } from 'vitest';
import { statusPayload } from './status-payload.js';
import { summarizeStatus } from './cli/cli-launch.js';

const session = {
  sessionId: 's1',
  url: 'http://localhost:5173/',
  adapters: [],
  hasCapabilities: true,
  lastSeenMs: 12,
  throttled: false,
  focused: true,
  hidden: false,
} as never;

describe('the status payload', () => {
  it('carries the diagnosis when nothing is connected', () => {
    const out = statusPayload(0, [], 'run `reticle init` in the app directory');
    expect(out.why).toBe('run `reticle init` in the app directory');
  });

  it('omits it when a session IS connected — it would contradict the session', () => {
    expect(statusPayload(1, [session], 'no app is running').why).toBeUndefined();
  });

  it('omits it when the daemon has nothing to say', () => {
    expect(statusPayload(0, [], undefined).why).toBeUndefined();
  });
});

describe('the CLI summary', () => {
  it('carries `why` through to what gets printed', () => {
    // The whole point: computed daemon-side, and previously dropped on the way to the terminal.
    const summary = summarizeStatus({
      sessionCount: 0,
      sessions: [],
      why: 'the app carries no SDK',
    });
    expect(summary.why).toBe('the app carries no SDK');
    expect(summary.sessionCount).toBe(0);
  });

  it('does not invent one when the daemon did not send it', () => {
    expect(summarizeStatus({ sessionCount: 0, sessions: [] }).why).toBeUndefined();
  });

  it('survives a payload that is not an object at all', () => {
    expect(summarizeStatus(null).sessionCount).toBe(0);
    expect(summarizeStatus('nonsense').why).toBeUndefined();
  });
});
