/**
 * A monorepo whose apps are NOT under `apps/` was invisible, and init reported success anyway.
 *
 * Measured on a real repo: three Next apps at `web/`, `admin/`, `space/`, each with next.config.js
 * and app/layout.tsx, nothing at the root. `findWorkspaceApps` only ever looked in `apps/` and
 * `packages/`, so it found none, the redirect did not fire, and init ran against the ROOT — warning
 * about a `next.config.mjs` that exists nowhere and reporting ✓ for writing `app/reticle-dev.tsx`
 * into the repo root, which Next never compiles.
 *
 * A ⚠ tells a human to act. A ✓ tells them it is handled. This produced the second for a file that
 * does nothing.
 *
 * The fix is to stop guessing directory names. A workspace DECLARES its packages — `workspaces` in
 * package.json, `packages:` in pnpm-workspace.yaml — and that declaration is authoritative. Where
 * there is none, the top-level directories are a better guess than two hardcoded names.
 */

import { describe, expect, it } from 'vitest';
import { workspaceParents } from './workspace-apps.js';

describe('where a workspace keeps its packages', () => {
  it('reads pnpm-workspace.yaml, which is the authoritative answer', () => {
    const yaml = "packages:\n  - 'web'\n  - 'admin'\n  - 'tools/*'\n";
    expect(workspaceParents({ pnpmWorkspace: yaml })).toEqual(
      expect.arrayContaining(['web', 'admin', 'tools']),
    );
  });

  it('reads the package.json `workspaces` array', () => {
    expect(workspaceParents({ pkgWorkspaces: ['packages/*', 'web'] })).toEqual(
      expect.arrayContaining(['packages', 'web']),
    );
  });

  it('reads the yarn/npm object form too', () => {
    expect(workspaceParents({ pkgWorkspaces: { packages: ['apps/*'] } })).toContain('apps');
  });

  it('falls back to the top-level directories when nothing is declared', () => {
    // Three Next apps at the root with no workspace file is a real shape, and hardcoding
    // apps/packages misses every one of them.
    expect(
      workspaceParents({ topLevelDirs: ['web', 'admin', 'space', 'node_modules', '.git'] }),
    ).toEqual(expect.arrayContaining(['web', 'admin', 'space']));
  });

  it('never scans node_modules, dot-directories, or build output', () => {
    const parents = workspaceParents({
      topLevelDirs: ['node_modules', '.git', '.next', 'dist', 'build', 'coverage', 'web'],
    });
    expect(parents).toEqual(['web']);
  });

  it('survives a malformed workspace file rather than throwing', () => {
    expect(() => workspaceParents({ pnpmWorkspace: 'packages: [unclosed' })).not.toThrow();
    expect(() => workspaceParents({ pkgWorkspaces: 42 })).not.toThrow();
  });

  it('deduplicates, so a directory named in both places is scanned once', () => {
    const parents = workspaceParents({
      pkgWorkspaces: ['apps/*'],
      topLevelDirs: ['apps', 'web'],
    });
    expect(parents.filter((p) => 'apps' === p)).toHaveLength(1);
  });
});
