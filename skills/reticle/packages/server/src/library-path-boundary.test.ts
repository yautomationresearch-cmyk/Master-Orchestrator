import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join, normalize, relative, sep } from 'node:path';

/**
 * The library entry point may never reach the install-time surface.
 *
 * `@reticlehq/server` has two doors: the root barrel (`index.ts`), which a consumer imports to LEASE
 * the engine — bridge, pool, tool surface, stores — and `cli.ts`, which is the `reticle` bin and owns
 * everything a human runs before their first session. `init/` belongs to the second door only.
 *
 * A consumer that embeds the engine never invokes the CLI, so `init/` costs it nothing — provided the
 * boundary actually holds. It did not: `mcp/mcp.ts` and `mcp/proxy-handshake.ts` each reached into
 * `init/mcp.js` for the MCP server NAME, a wire identity that had no business living behind the
 * installer. One misplaced constant is all it takes for the whole install-time subtree to become
 * load-bearing on the library path, and the cost of that is not measured in bytes: it is that a
 * consumer who wants none of `init` now has an opinion about it, and the only way to express that
 * opinion is a fork.
 *
 * This walks the real import graph rather than trusting a grep, because the reach that matters is the
 * transitive one — nobody adds `import '../init/run.js'` to `index.ts`, they add it four modules down.
 */

const SRC = join(__dirname);

/** Directories that belong to the CLI door and must stay unreachable from the library door. */
const CLI_ONLY_DIRS = ['init/'];

/**
 * The crossings that exist today, each with the reason it is allowed to stay.
 *
 * This does not ban crossings; it bans UNDECLARED ones. Adding a module here is the moment to ask
 * whether the thing being reached for actually belongs behind the installer — which is how the
 * `MCP_SERVER_NAME` crossing got resolved rather than listed.
 */
const DECLARED_CROSSINGS: Record<string, string> = {
  'telemetry/feedback-context.ts':
    'Reads `parseMajor` and `findWorkspaceApps` to say which build tool and which app a report came ' +
    'from. Both are general-purpose and squat in init/ for historical reasons, but `findWorkspaceApps` ' +
    'carries `workspaceParents` and the workspace manifest constants with it, so lifting them out ' +
    'means editing the install path — the one path in this repo with the worst track record for ' +
    'silent breakage. Left in place deliberately: a consumer embedding the engine takes this module ' +
    'verbatim and never calls the installer, so the crossing costs it nothing.',
};

/** Resolve a relative specifier (always written with a `.js` extension) to a repo-relative `.ts` path. */
function resolveImport(fromFile: string, specifier: string): string | undefined {
  if (!specifier.startsWith('.')) return undefined;
  const resolved = normalize(join(dirname(fromFile), specifier))
    .split(sep)
    .join('/');
  return resolved.replace(/\.js$/, '.ts');
}

/** Every relative import in a module, in source order. */
function importsOf(file: string): string[] {
  let text: string;
  try {
    text = readFileSync(join(SRC, file), 'utf8');
  } catch {
    return [];
  }
  const specifiers: string[] = [];
  // `from '...'` covers static imports, type imports and re-exports; `import('...')` the dynamic ones.
  for (const match of text.matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g)) {
    const specifier = match[1];
    if (specifier !== undefined) specifiers.push(specifier);
  }
  return specifiers;
}

/** Breadth-first reachability from an entry module, returning every module reached and how. */
function reachableFrom(entry: string): Map<string, string> {
  // value = the importer that first reached it, so a violation can name the edge rather than the file.
  const seen = new Map<string, string>([[entry, entry]]);
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.shift();
    if (file === undefined) continue;
    for (const specifier of importsOf(file)) {
      const target = resolveImport(file, specifier);
      if (target === undefined || seen.has(target)) continue;
      seen.set(target, file);
      queue.push(target);
    }
  }
  return seen;
}

describe('library path boundary', () => {
  it('the root barrel never reaches the install-time surface', () => {
    const reached = reachableFrom('index.ts');
    const violations = [...reached.entries()]
      // Only the EDGE into the subtree is a violation. Once a declared crossing has pulled `init/run.ts`
      // in, everything that module imports is reachable too, and reporting those would bury the one
      // line that matters under the forty that follow from it.
      .filter(([file, importer]) => {
        if (!CLI_ONLY_DIRS.some((dir) => file.startsWith(dir))) return false;
        if (CLI_ONLY_DIRS.some((dir) => importer.startsWith(dir))) return false;
        return DECLARED_CROSSINGS[importer] === undefined;
      })
      .map(([file, importer]) => `${importer} -> ${file}`);
    expect(violations).toEqual([]);
  });

  it('every declared crossing is still a real one', () => {
    // A declaration that has stopped being true is a stale exemption, and a stale exemption is a hole
    // nobody knows is open. If the reach is gone, the entry belongs deleted, not kept "just in case".
    const reached = reachableFrom('index.ts');
    const importers = new Set(
      [...reached.entries()]
        .filter(([file]) => CLI_ONLY_DIRS.some((dir) => file.startsWith(dir)))
        .map(([, importer]) => importer),
    );
    for (const declared of Object.keys(DECLARED_CROSSINGS)) {
      expect(importers, `${declared} is declared but no longer crosses`).toContain(declared);
    }
  });

  it('the CLI entry point still owns the install-time surface', () => {
    // The counterpart, so the first assertion can never be satisfied by DELETING init/ — which is the
    // one fix that would pass this file and break the free product.
    const reached = reachableFrom('cli.ts');
    const initModules = [...reached.keys()].filter((file) => file.startsWith('init/'));
    expect(initModules.length).toBeGreaterThan(0);
  });

  it('relative specifiers resolve the way the runtime resolves them', () => {
    expect(resolveImport('mcp/mcp.ts', '../init/mcp.js')).toBe('init/mcp.ts');
    expect(resolveImport('index.ts', './tools/tools.js')).toBe('tools/tools.ts');
    expect(resolveImport('index.ts', '@reticlehq/core')).toBeUndefined();
  });
});

// `relative` is imported for parity with the sibling graph guards; assert the shape it returns so a
// platform separator change cannot silently alter the POSIX comparisons above.
describe('path normalisation', () => {
  it('compares POSIX-separated paths on every platform', () => {
    expect(
      relative(SRC, join(SRC, 'init', 'mcp.ts'))
        .split(sep)
        .join('/'),
    ).toBe('init/mcp.ts');
  });
});
