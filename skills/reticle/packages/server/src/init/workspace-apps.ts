/**
 * Which directories to look in for the app, when `reticle init` runs at a monorepo root.
 *
 * This used to be the literal list `['apps', 'packages']`. Measured on a real repo with three Next
 * apps at `web/`, `admin/` and `space/`, it found none — so the redirect never fired, init ran
 * against the root, and it reported ✓ for writing `app/reticle-dev.tsx` into a directory Next never
 * compiles. A ⚠ tells a human to act; a ✓ tells them it is handled.
 *
 * A workspace DECLARES its packages, so that declaration is used first and directory names are not
 * guessed at all. Where nothing is declared, every top-level directory is a better candidate than two
 * hardcoded ones — filtered by the usual non-source suspects, and still subject to the `looksLikeApp`
 * check that follows, so a wrong guess here costs a `package.json` read.
 */

/** Directories that are never a workspace package, whatever the layout. */
const NEVER_A_PACKAGE = new Set(['node_modules', 'dist', 'build', 'out', 'coverage', 'target']);

interface WorkspaceSources {
  /** Raw contents of pnpm-workspace.yaml, when present. */
  pnpmWorkspace?: string;
  /** The `workspaces` field of package.json — array form or the yarn/npm object form. */
  pkgWorkspaces?: unknown;
  /** Directory names at the repo root, used when nothing is declared. */
  topLevelDirs?: readonly string[];
}

/** `packages/*` -> `packages`; `web` -> `web`. The base directory a glob searches. */
function globBase(pattern: string): string | undefined {
  const base = pattern
    .split('/')[0]
    ?.trim()
    .replace(/^['"]|['"]$/g, '');
  return base === undefined || '' === base || '.' === base || base.includes('*') ? undefined : base;
}

function fromPnpm(yaml: string): string[] {
  // A deliberately small reader rather than a YAML dependency: this file is a list of globs, and the
  // only shape that matters is `- 'pattern'` under `packages:`. A malformed file yields nothing,
  // which falls through to the top-level scan rather than failing the install.
  const out: string[] = [];
  let inPackages = false;
  for (const line of yaml.split('\n')) {
    if (/^packages\s*:/.test(line)) {
      inPackages = true;
      continue;
    }
    if (inPackages && /^\S/.test(line)) break;
    const item = /^\s*-\s*(.+)$/.exec(line);
    if (inPackages && item?.[1] !== undefined) {
      const base = globBase(item[1]);
      if (base !== undefined) out.push(base);
    }
  }
  return out;
}

function fromPkg(workspaces: unknown): string[] {
  const list = Array.isArray(workspaces)
    ? workspaces
    : 'object' === typeof workspaces && workspaces !== null
      ? (workspaces as { packages?: unknown }).packages
      : undefined;
  if (!Array.isArray(list)) return [];
  return list
    .filter((p): p is string => 'string' === typeof p)
    .map(globBase)
    .filter((p): p is string => p !== undefined);
}

export function workspaceParents(sources: WorkspaceSources): string[] {
  const declared = [
    ...(sources.pnpmWorkspace === undefined ? [] : fromPnpm(sources.pnpmWorkspace)),
    ...fromPkg(sources.pkgWorkspaces),
  ];
  const candidates =
    declared.length > 0
      ? declared
      : (sources.topLevelDirs ?? []).filter((d) => !d.startsWith('.') && !NEVER_A_PACKAGE.has(d));
  return [...new Set(candidates)];
}
