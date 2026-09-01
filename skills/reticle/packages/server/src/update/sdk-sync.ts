/**
 * The half of `reticle update` that was missing: bringing the APP's SDK to the same version as the
 * daemon being installed.
 *
 * `reticle update` swapped the CLI and stopped. The app kept whatever `@reticlehq/react` it had, so
 * the command whose job is to keep an install current was itself a way to create a version-skewed
 * pair — the failure the HELLO skew check, the nudge and the pin all exist to prevent. The skew
 * message even told people to run `reticle update` to fix an outdated SDK, which could not work.
 *
 * Pinned to an exact version for the same reason `init` pins: an unpinned `add` can resolve out of a
 * stale registry cache and reinstall the skew being fixed. Measured once as pnpm taking 2.2.1 while
 * npm took 2.3.0 in the next project over.
 */

import { installCommandParts, type PackageManager } from '../init/detect.js';

/** Everything we publish is scoped here. */
const RETICLE_SCOPE = '@reticlehq/';
/**
 * The CLI. Never an app dependency: it carries the Node MCP server and `ws`, and putting it in a
 * browser app's tree is what the retired `@reticlehq/core` umbrella got wrong. The other half of
 * `reticle update` owns this one.
 */
const SERVER_PACKAGE = '@reticlehq/server';

function namesIn(section: unknown): string[] {
  if ('object' !== typeof section || null === section) return [];
  return Object.keys(section);
}

/** The Reticle packages this project declares, from either dependency section. */
export function reticleDepsOf(pkgJson: unknown): string[] {
  if ('object' !== typeof pkgJson || null === pkgJson) return [];
  const manifest = pkgJson as Record<string, unknown>;
  const declared = [...namesIn(manifest['dependencies']), ...namesIn(manifest['devDependencies'])];
  return [...new Set(declared)].filter(
    (name) => name.startsWith(RETICLE_SCOPE) && name !== SERVER_PACKAGE,
  );
}

/** The install to run, or null when this project has nothing of ours to sync. */
export function sdkSyncCommand(
  pm: PackageManager,
  packages: readonly string[],
  version: string,
): { command: string; args: string[] } | null {
  if (0 === packages.length) return null;
  const { command, args } = installCommandParts(
    pm,
    packages.map((p) => `${p}@${version}`),
  );
  return { command, args: [...args] };
}
