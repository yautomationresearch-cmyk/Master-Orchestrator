/**
 * Remove source maps from a package's `dist` before it is packed.
 *
 * The maps we were shipping could not work. They reference `../src/*.ts`, and the published package
 * contains only `dist`, `README.md` and `NOTICE` — no sources — and tsc emits no `sourcesContent`
 * because `inlineSources` is off. So a consumer's debugger followed the map, looked for a file that
 * is not in the tarball, and gave up. Measured on `@reticlehq/browser`: 340KB of the 947KB package,
 * 36% of what users download, for nothing. It is also what pushed the SDK past its 900KB budget.
 *
 * The two honest options were "ship the sources so the maps resolve" (+479KB, taking the package to
 * 1.44MB — 60% over budget for a dev-only SDK) or "stop shipping maps" (621KB, back under budget
 * with the headroom the budget was written for). This is the second.
 *
 * Maps are still EMITTED — `tsc -b` is untouched, so they exist in `dist` for local debugging and
 * for anything in this repo that runs against built output. Only the tarball loses them.
 *
 * The `sourceMappingURL` comments go too. Leaving them would trade dead bytes for a worse problem:
 * DevTools fetches the missing `.map` and logs a failure in the console of every app embedding a
 * tool whose entire job is to be trustworthy about what it observes.
 */
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MAP_COMMENT = /\n?\/\/# sourceMappingURL=.*\.map\s*$/;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const target = process.argv[2] ?? 'dist';
let removed = 0;
let stripped = 0;

for (const file of walk(target)) {
  if (file.endsWith('.map')) {
    rmSync(file);
    removed += 1;
    continue;
  }
  if (!file.endsWith('.js') && !file.endsWith('.d.ts') && !file.endsWith('.cjs')) continue;
  const before = readFileSync(file, 'utf8');
  const after = before.replace(MAP_COMMENT, '\n');
  if (after !== before) {
    writeFileSync(file, after);
    stripped += 1;
  }
}

// stderr, NOT stdout. `npm pack --json` writes its report to stdout and the size gate parses it —
// one console.log here makes that JSON unparseable and takes the gate down with a syntax error
// rather than a size failure. Verified: it did exactly that the first time.
console.error(
  `strip-maps: removed ${String(removed)} maps, stripped ${String(stripped)} references`,
);
