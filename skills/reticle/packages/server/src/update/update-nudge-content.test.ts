import { describe, expect, it } from 'vitest';
import { buildNudge } from './update-nudge.js';

/**
 * The update nudge must say what the update CONTAINS, and warn when it breaks something.
 *
 * `packages/server/package.json` carries `reticle.changelog` and `reticle.breakingChanges`, and
 * `update-checker` faithfully parses both into the manifest — where they stopped. `buildNudge` only
 * ever named two version numbers, so both fields were written, shipped, parsed and then discarded.
 * Latent metadata nobody printed.
 *
 * That is survivable while releases are additive and actively harmful for one that is not: this
 * release retires an environment variable, makes six parameters reject values they used to accept,
 * and changes what `isError` is set on. An agent told only "2.4.1 → 2.5.0" will run `reticle update`
 * mid-task and discover the rest by breaking.
 */
describe('the update nudge carries the release, not just its number', () => {
  it('still names both versions and the exact command', () => {
    const nudge = buildNudge('2.5.0', '2.4.1');
    expect(nudge.action).toContain('2.4.1');
    expect(nudge.action).toContain('2.5.0');
    expect(nudge.command).toBe('reticle update');
  });

  it('includes the changelog line when the manifest has one', () => {
    const nudge = buildNudge('2.5.0', '2.4.1', {
      changelog: 'Tools refuse instead of answering wrongly.',
    });
    expect(nudge.action).toContain('Tools refuse instead of answering wrongly.');
  });

  it('WARNS when the release has breaking changes, and lists them', () => {
    const nudge = buildNudge('2.5.0', '2.4.1', {
      breakingChanges: ['RETICLE_TOOL_PROFILE is retired', 'select refuses an unmatched option'],
    });
    expect(nudge.action).toMatch(/breaking/i);
    expect(nudge.action).toContain('RETICLE_TOOL_PROFILE is retired');
    expect(nudge.action).toContain('select refuses an unmatched option');
  });

  it('says nothing about breaking changes when there are none', () => {
    // A warning that fires on every release is a warning nobody reads.
    expect(buildNudge('2.5.0', '2.4.1', { breakingChanges: [] }).action).not.toMatch(/breaking/i);
    expect(buildNudge('2.5.0', '2.4.1').action).not.toMatch(/breaking/i);
  });

  it('stays bounded — this rides on a tool result, every turn until delivered', () => {
    const nudge = buildNudge('2.5.0', '2.4.1', {
      changelog: 'x'.repeat(5_000),
      breakingChanges: Array.from({ length: 50 }, (_, i) => `breaking change number ${String(i)}`),
    });
    expect(nudge.action.length).toBeLessThan(1_200);
  });
});
