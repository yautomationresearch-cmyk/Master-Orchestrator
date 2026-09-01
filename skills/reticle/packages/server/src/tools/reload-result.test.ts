/**
 * `navigate { reload: true }` answered a bare `{ ok: true }`.
 *
 * The URL branch of the same tool returns `confirmed: false` plus a note — because `ok` means the
 * browser accepted the instruction, NOT that the page arrived. The reload branch returned neither,
 * so the one caveat that matters most was missing from the path most likely to need it: the SDK is
 * torn down by the reload and a caller that acts immediately hits the window before it comes back.
 *
 * The permanent session loss reported alongside this is separately fixed (session-continuity.ts
 * remembers the id in sessionStorage so a reload rejoins the same session). What is left is the
 * asymmetry: identical semantics, one branch disclosing them and one not.
 */

import { describe, expect, it } from 'vitest';
import { reloadResult } from './reload-result.js';

describe('what a reload reports', () => {
  it('is not confirmed — ok means dispatched, and the page has not come back yet', () => {
    const out = reloadResult();
    expect(out.ok).toBe(true);
    expect(out.confirmed).toBe(false);
  });

  it('says what to do about it, in the same terms the URL branch uses', () => {
    // An agent that reads `ok: true` and acts immediately is the failure this prevents.
    expect(String(reloadResult().note)).toContain('reticle_sessions');
  });

  it('confirms the reload once the page has re-announced itself', () => {
    // The tool now WAITS for the reconnect (see session-reconnect), so the common case is a
    // confirmed one — and the agent must not be sent to re-select a session that is already live.
    const out = reloadResult(true);
    expect(out.confirmed).toBe(true);
    expect(String(out.note)).not.toContain('reticle_sessions');
  });
});
