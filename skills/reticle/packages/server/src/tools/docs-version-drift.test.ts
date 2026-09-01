/**
 * The docs must not claim a version the packages do not have.
 *
 * Every release bumps ten packages in lockstep, and every release leaves the version behind in the
 * places that are not `package.json`: a "Version X" line on each package page, a "ten packages ship
 * together at X" claim, a pinned `npm i -D @reticlehq/react@X` in the install pages, and a CDN import
 * pinned to X in the SKILL file. That last one is the expensive one, because a reader who copies it
 * pins their page SDK to a version the daemon has moved past, which is the `version_skew` failure
 * arriving by way of a stale doc.
 *
 * Caught the release it was written for: the bump landed and eleven files still said the previous
 * version, including the CDN pin. Nothing failed, because nothing was looking.
 *
 * Deliberately NOT a blanket ban on the old version string. `CHANGELOG.md` is a history and must
 * keep every version it ever shipped, and a doc may legitimately name an older release when it is
 * describing when something changed. The rule is narrower: where a doc states THE CURRENT version,
 * it has to be the current version.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERVER_VERSION } from '../version/server-version.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const DOCS = join(REPO, 'docs');

/** Files that state the current version, and are read by someone about to install. */
const VERSION_BEARING = [
  join(REPO, 'SKILL.md'),
  join(REPO, 'README.md'),
  join(REPO, 'skills', 'reticle', 'SKILL.md'),
  join(DOCS, 'packages.mdx'),
  join(DOCS, 'install-agentic.mdx'),
  join(DOCS, 'docs.json'),
];

const packagePages = (): string[] => {
  const dir = join(DOCS, 'packages');
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
};

/**
 * Claims of a CURRENT version, as opposed to a mention of some version.
 *
 * Each pattern is a shape that means "this is what you get today": a package page's version line,
 * the lockstep claim, a pinned install, the CDN import, and the docs site's own version field.
 */
const CURRENT_VERSION_CLAIMS: readonly RegExp[] = [
  /\*\*Version (\d+\.\d+\.\d+)\./g,
  /ship together at the same version, all at \*\*(\d+\.\d+\.\d+)\*\*/g,
  /@reticlehq\/[a-z-]+@(\d+\.\d+\.\d+)/g,
  /"version":\s*"(\d+\.\d+\.\d+)"/g,
];

describe('the docs do not advertise a version the packages do not have', () => {
  it('finds files to check', () => {
    expect(packagePages().length).toBeGreaterThan(5);
  });

  it('every current-version claim matches the shipped version', () => {
    const wrong: string[] = [];
    for (const file of [...VERSION_BEARING, ...packagePages()]) {
      let text: string;
      try {
        text = readFileSync(file, 'utf8');
      } catch {
        continue; // a file that does not exist cannot be stale
      }
      for (const pattern of CURRENT_VERSION_CLAIMS) {
        for (const match of text.matchAll(pattern)) {
          const claimed = match[1];
          if (claimed !== undefined && claimed !== SERVER_VERSION) {
            wrong.push(`${file.replace(REPO, '.')}: claims ${claimed}`);
          }
        }
      }
    }

    expect(
      [...new Set(wrong)],
      `These state a current version that is not the shipped one (${SERVER_VERSION}). A release ` +
        `bumps package.json and leaves these behind, and the CDN pin in the SKILL file is the ` +
        `expensive one: a reader who copies it pins their page SDK to a version the daemon has ` +
        `moved past.`,
    ).toEqual([]);
  });
});
