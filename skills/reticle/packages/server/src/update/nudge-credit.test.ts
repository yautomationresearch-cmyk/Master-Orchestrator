/**
 * Did the update banner actually cause the upgrade?
 *
 * `version_changed` says a version moved. It has never said WHY, so the one thing worth knowing
 * about the nudge — whether telling agents about a release makes releases get installed — was
 * unanswerable. That mattered concretely: 2.4.0 shipped a fix for a connect defect affecting every
 * Vite app and reached zero users, and nothing in the data could say whether the nudge was the
 * problem or the fix.
 *
 * The nudge is delivered by a DAEMON and `reticle update` runs in a different process, so the two
 * cannot see each other in memory. A tiny marker file is the join. It records only the version that
 * was offered and when — no identity, nothing about the machine.
 */

import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { creditNudge, wasNudged } from './nudge-credit.js';

const withDir = (fn: (dir: string) => void): void => {
  const dir = mkdtempSync(join(tmpdir(), 'nudge-'));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

describe('crediting the update nudge', () => {
  it('an update to the version that was offered is credited to the nudge', () => {
    withDir((dir) => {
      creditNudge('2.5.0', dir);
      expect(wasNudged('2.5.0', dir)).toBe(true);
    });
  });

  it('an update to a DIFFERENT version is not — that was the human deciding on their own', () => {
    withDir((dir) => {
      creditNudge('2.5.0', dir);
      expect(wasNudged('2.9.9', dir)).toBe(false);
    });
  });

  it('no nudge, no credit', () => {
    withDir((dir) => {
      expect(wasNudged('2.5.0', dir)).toBe(false);
    });
  });

  it('a corrupt or unreadable marker is simply "not nudged", never a throw', () => {
    // This runs inside `reticle update`, which must finish whatever the telemetry thinks.
    withDir((dir) => {
      writeFileSync(join(dir, 'update-nudge.json'), '{ not json', 'utf8');
      expect(() => wasNudged('2.5.0', dir)).not.toThrow();
      expect(wasNudged('2.5.0', dir)).toBe(false);
    });
  });
});
