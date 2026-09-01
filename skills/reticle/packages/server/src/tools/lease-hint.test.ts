/**
 * What a leased tab that did not connect should say.
 *
 * `reticle_lease` is the highest-value path in the whole product and nobody knows it. Measured over
 * a day: the 5 sessions that used it had a MEDIAN of 30 tool calls and produced 46% of all bugs
 * found, while the 20 active sessions that did not had a median of 1 call. Not one single-call
 * bounce used a lease. It works because it does not wait for the human's tab to dial in — Reticle
 * opens its own.
 *
 * And the plan file listed it as UNVERIFIED, "one acquire returned ready:false", possibly broken.
 * Driven for real it is not broken at all: against a daemon on the port the app was built to dial,
 * `acquire` returns ready:true and the session is immediately driveable. The failing case was a
 * PORT MISMATCH — the leased tab loads the app, and the app's SDK dials whatever port it was built
 * with, which is not necessarily the daemon that issued the lease. (Proof: the tab from the failed
 * cross-port acquire later showed up as a live session on the OTHER daemon.)
 *
 * The hint claimed the opposite: "is <url> running with @reticlehq/core enabled?" — when the app was
 * running, was instrumented, and had already connected somewhere else. Same defect as the old
 * no-session message: it names the one thing that is definitely true and sends the reader away from
 * the cause.
 */

import { describe, expect, it } from 'vitest';
import { leaseNotConnectedHint } from './lease-hint.js';

describe('leaseNotConnectedHint', () => {
  const hint = leaseNotConnectedHint('http://localhost:5173/', 4400);

  it('names the port THIS daemon is on — the other half of the mismatch', () => {
    expect(hint).toContain('4400');
  });

  it('names the url that was opened', () => {
    expect(hint).toContain('http://localhost:5173/');
  });

  it('leads with the mismatch, not with "is your app running"', () => {
    expect(hint).toMatch(/port|different daemon/i);
    // The tab demonstrably loaded — Playwright navigated it — so this question is always answered.
    expect(hint).not.toMatch(/is .* running with/i);
  });

  it('still allows for the app simply not being instrumented, as the SECOND possibility', () => {
    expect(hint).toMatch(/reticle init|SDK/i);
  });

  it('gives the agent something to do', () => {
    expect(hint).toMatch(/check|run |restart|match/i);
  });
});
