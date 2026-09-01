/**
 * The published tarball must stay small enough to publish.
 *
 * `prepack` copies the whole of `docs/` into the package so an agent can read the guides straight
 * out of `node_modules`. `docs/images/` then grew three benchmark screenshots of about three
 * megabytes each, and the tarball crossed the local registry's body limit. The install gate could
 * not even reach its first scaffold: it died in setup with a 413 while publishing, which reads as
 * "the gate is broken" rather than "the package got too big", so the failure pointed away from its
 * own cause.
 *
 * The images were dead weight in there regardless. Every reference in the docs is an absolute site
 * path (`/images/...`), which resolves on docs.reticle.sh and resolves nowhere at all inside
 * `node_modules` — so shipping them bought no reader anything and cost every install the download.
 *
 * This guard is on the SOURCE rather than on a built tarball, deliberately: building one takes a
 * minute and this has to fail in the fast gate, which is the only gate that always runs. It asks
 * the two questions that actually broke: is prepack still pruning the asset directories, and has
 * anything large appeared in the part of `docs/` that does get shipped.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const DOCS = join(REPO, 'docs');

/** Directories `prepack` deletes after copying `docs/`. Assets the site serves and npm need not. */
const PRUNED = ['images', 'logo', 'favicon', 'matrix'] as const;

/**
 * Generous on purpose. This is not a size budget, it is a tripwire for the class of thing that
 * broke: a multi-megabyte binary landing somewhere the tarball picks up.
 */
const MAX_SHIPPED_FILE_BYTES = 512 * 1024;

const prepack = (): string => {
  const pkg: unknown = JSON.parse(readFileSync(join(REPO, 'packages/server/package.json'), 'utf8'));
  const scripts = (pkg as { scripts?: Record<string, string> }).scripts ?? {};
  return scripts.prepack ?? '';
};

/** Everything under `docs/` that survives the prune, i.e. everything the tarball carries. */
const shippedDocs = (dir = DOCS, prefix = ''): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = `${prefix}${entry.name}`;
    if (entry.isDirectory()) {
      if (!PRUNED.includes(entry.name as (typeof PRUNED)[number])) {
        out.push(...shippedDocs(join(dir, entry.name), `${rel}/`));
      }
      continue;
    }
    out.push(rel);
  }
  return out;
};

describe('the published package does not carry the docs site assets', () => {
  it('prepack prunes every asset directory after copying docs', () => {
    const script = prepack();
    expect(script, 'prepack no longer copies docs at all; this guard needs rewriting').toContain(
      'cp -R ../../docs .',
    );
    const kept = PRUNED.filter((d) => !script.includes(`docs/${d}`));
    expect(
      kept,
      `prepack copies docs/ but does not prune ${kept.join(', ')}. Those are site assets: every ` +
        `image reference in the docs is an absolute site path, so they resolve on docs.reticle.sh ` +
        `and nowhere inside node_modules. Shipping them only makes the tarball too large to publish.`,
    ).toEqual([]);
  });

  it('nothing large has appeared in the part of docs/ that ships', () => {
    const heavy = shippedDocs()
      .map((rel) => ({ rel, bytes: statSync(join(DOCS, rel)).size }))
      .filter((f) => f.bytes > MAX_SHIPPED_FILE_BYTES);

    expect(
      heavy.map((f) => `${f.rel} (${Math.round(f.bytes / 1024)}KB)`),
      `These files ship inside @reticlehq/server and are large. Either move them under an asset ` +
        `directory prepack prunes, or reference them from the docs site instead of committing them ` +
        `where the tarball picks them up.`,
    ).toEqual([]);
  });
});
