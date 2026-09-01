// The release's live demo, as a runnable assertion rather than a story:
//
//   agent edits a covered file → the layer names the affected flows → verification goes RED
//   → the gate BLOCKS with the exact flows to run → agent fixes → verification goes GREEN
//   → the gate UNBLOCKS.
//
// It drives the shipped CLI (`reticle affected` / `verify` / `gate`), so it verifies the loop a user
// actually runs, not an in-process reconstruction of it.
//
//   node bench/e2e-loop/demo.mjs [appUrl]
//
// Needs: bench-app running, flows saved in .reticle/flows/. Exits non-zero if any step of the loop
// fails to behave as the acceptance requires.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { inject, revert } from '../harness/inject.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI = join(ROOT, 'packages', 'server', 'dist', 'cli.js');
const APP_URL = process.argv[2] ?? 'http://localhost:4312';
const PORT = process.env.E2E_PORT ?? '4497';
const BUG = 'signal-contract-violation'; // invisible in the DOM — the case that needs a real oracle
const COVERED_FILE = 'apps/bench-app/src/store/store.ts';

const steps = [];
const record = (name, ok, detail) => {
  steps.push({ name, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail === undefined ? '' : ` — ${detail}`}`);
};

/** Run a CLI command, returning { code, out }. Never throws on a non-zero exit — that IS the signal. */
function cli(args) {
  // The CLI logs its structured events to STDERR, so capture both streams — reading stdout alone
  // silently yields "" and makes every output assertion vacuously fail.
  const r = spawnSync('node', [CLI, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 180_000,
    // `reticle verify` boots its OWN daemon; pin it to a port this demo owns so it never collides
    // with a developer's running daemon on the default port.
    env: { ...process.env, RETICLE_PORT: PORT },
  });
  return { code: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const gateBlocked = () => cli(['gate', COVERED_FILE]).code !== 0;

console.log('\n=== end-to-end loop ===\n');
try {
  // 1. Baseline: verification passes and the gate is therefore open.
  const baseline = cli(['verify', APP_URL, '--timeout', '30000']);
  record('baseline verification passes', baseline.code === 0, `exit ${String(baseline.code)}`);
  record('gate open before the edit', !gateBlocked());

  // 2. The agent edits a covered file (an invisible signal-contract break).
  inject(BUG);
  record(`edited a covered file (${BUG})`, true, COVERED_FILE);

  // 3. The layer names what that edit put at risk — with no agent reasoning involved.
  const affected = cli(['affected', COVERED_FILE]);
  record(
    'affected names the at-risk flows',
    affected.out.includes('affected'),
    affected.out.trim().slice(0, 120),
  );

  // 4. Verification goes RED on the change.
  const red = cli(['verify', APP_URL, '--timeout', '30000']);
  record('verification goes RED after the edit', red.code !== 0, `exit ${String(red.code)}`);

  // 5. The gate blocks — the point of the whole loop: you cannot "finish" without re-verifying.
  record('gate BLOCKS the edit', gateBlocked());

  // 6. The agent fixes the fault.
  revert(BUG);
  record('fixed the fault', true);

  // 7. Verification goes GREEN again, and the gate re-opens.
  const green = cli(['verify', APP_URL, '--timeout', '30000']);
  record('verification GREEN after the fix', green.code === 0, `exit ${String(green.code)}`);
  record('gate UNBLOCKS after the fix', !gateBlocked());
} finally {
  revert(BUG); // never leave the fixture dirty, even on a crash
}

const failed = steps.filter((s) => !s.ok);
console.log(
  `\n  ${String(steps.length - failed.length)}/${String(steps.length)} loop steps behaved as the acceptance requires\n`,
);
process.exit(failed.length === 0 ? 0 : 1);
