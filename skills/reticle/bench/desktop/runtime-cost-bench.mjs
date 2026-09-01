// What does one verification COST on each desktop runtime?
//
//   node bench/desktop/runtime-cost-bench.mjs            # both runtimes
//   node bench/desktop/runtime-cost-bench.mjs electron    # one of them
//
// Same task in both apps — "archive the first todo, then verify the archive actually worked" — on
// the same planted false green: the row disappears and the screen says "archived" while the IPC call
// rejects. The number measured is the OUTPUT BYTES the agent must read, because that is what a
// context window pays for. Two paths are measured per runtime:
//
//   full — query → act → observe        (read the timeline; what a general verification loop does)
//   lean — query → act → network{500}   (ask the ONE question that decides it)
//
// Unlike desktop-mcp-bench.mjs there is no Playwright column: Playwright MCP cannot attach to a
// WKWebView at all, so on Tauri there is nothing to compare against. This bench drives the tool
// handlers in-process through the shared desktop harness — the SAME boot the desktop e2e battery
// uses, and the only one that reliably survives on a machine where a detached daemon gets reaped.
import path from 'node:path';
import { existsSync } from 'node:fs';
import { ROOT, bootDesktopSession, spawn, sleep } from '../../apps/e2e/desktop-harness.mjs';

const TAURI_BINARY = path.join(ROOT, 'apps/tauri-smoke/src-tauri/target/release/tauri-smoke');

const RUNTIMES = {
  electron: async () => {
    const { createRequire } = await import('node:module');
    const require = createRequire(path.join(ROOT, 'apps', 'electron-smoke', 'package.json'));
    const bin = require('electron');
    // The packaged renderer (loadFile), so no vite server has to be alive for the measurement.
    return (env) =>
      spawn(bin, ['.'], {
        cwd: path.join(ROOT, 'apps/electron-smoke'),
        env: { ...env, RETICLE_DEMO_FILE: '1' },
      });
  },
  tauri: async () => {
    if (!existsSync(TAURI_BINARY)) {
      throw new Error(
        `no packaged Tauri binary at ${TAURI_BINARY} — build it first:\n` +
          '  pnpm --filter @reticlehq/tauri-smoke exec tauri build --no-bundle',
      );
    }
    return (env) =>
      spawn(TAURI_BINARY, [], {
        cwd: path.join(ROOT, 'apps/tauri-smoke/src-tauri'),
        env: { ...env, RETICLE_HEADLESS: '1' },
      });
  },
};

/** Output bytes of one tool result — what the agent's context window is billed for. */
const sizeOf = (result) => Buffer.byteLength(JSON.stringify(result), 'utf8');

/**
 * Drive one path and return its cost. `verify` decides the verdict from the last call, so the two
 * paths differ ONLY in their third call — which is the comparison this bench exists to make.
 */
async function drivePath(session, label, verify) {
  const { tool } = session;
  const steps = [];

  // Wait for the ARCHIVE button specifically, and time only the measured calls. The todo list
  // arrives over IPC ~120ms after first paint, so a query fired at first render finds the app's
  // other buttons and none of the rows — and clicking whatever came back first would measure a
  // different action entirely while still reporting three tidy calls.
  let q;
  for (let i = 0; i < 40; i += 1) {
    q = await tool('reticle_query', { by: 'role', value: 'button', name: 'Archive' });
    if (q.elements?.[0]?.ref !== undefined) break;
    await sleep(200);
  }
  const archiveRef = q.elements?.[0]?.ref;
  if (archiveRef === undefined) throw new Error(`${label}: no Archive button ever rendered`);

  const t0 = Date.now();
  steps.push(['reticle_query', sizeOf(q)]);

  const act = await tool('reticle_act', { ref: archiveRef, action: 'click' });
  steps.push(['reticle_act', sizeOf(act)]);
  await sleep(900);

  const { call, args, read } = verify(act);
  const last = await tool(call, args);
  steps.push([call, sizeOf(last)]);

  const bytes = steps.reduce((n, [, b]) => n + b, 0);
  return { label, calls: steps.length, bytes, ms: Date.now() - t0, verdict: read(last), steps };
}

const FULL = (act) => ({
  call: 'reticle_observe',
  args: { since: act.since },
  read: (r) => {
    const c = r.contradictions?.[0];
    return c ? `CAUGHT — ${c.kind}: ${c.detail}` : 'reported success (MISSED)';
  },
});

const LEAN = (act) => ({
  call: 'reticle_network',
  args: { status: 500, since: act.since },
  read: (r) =>
    (r.calls?.length ?? 0) > 0
      ? `CAUGHT — ${r.calls[0].url} → ${String(r.calls[0].status)}`
      : 'reported success (MISSED)',
});

const wanted = process.argv.slice(2).filter((a) => a in RUNTIMES);
const rows = [];
for (const name of wanted.length > 0 ? wanted : Object.keys(RUNTIMES)) {
  const spawnApp = await RUNTIMES[name]();
  // One app per PATH: the archive click mutates the list, so a second path against the same window
  // would find a different screen — the false green this benchmark exists to measure, in itself.
  for (const [label, verify] of [
    ['full', FULL],
    ['lean', LEAN],
  ]) {
    const session = await bootDesktopSession({ spawnApp });
    if (session.sessionId === undefined) {
      console.error(`${name}: the app never dialed the bridge\n${session.log.join('')}`);
      await session.shutdown();
      process.exit(1);
    }
    rows.push({ runtime: name, ...(await drivePath(session, label, verify)) });
    await session.shutdown();
  }
}

console.log('\n════ Archive a todo, then verify it worked ════');
console.log('runtime   path   calls    bytes  ~tokens     ms  verdict');
for (const r of rows) {
  console.log(
    `${r.runtime.padEnd(9)} ${r.label.padEnd(6)} ${String(r.calls).padStart(4)} ${String(r.bytes).padStart(8)} ${String(Math.round(r.bytes / 4)).padStart(8)} ${String(r.ms).padStart(6)}  ${r.verdict}`,
  );
}
console.log('\nper-step output bytes:');
for (const r of rows) {
  console.log(
    `  ${r.runtime}/${r.label}: ` + r.steps.map(([n, b]) => `${n}=${String(b)}`).join('  '),
  );
}
process.exit(rows.every((r) => r.verdict.startsWith('CAUGHT')) ? 0 : 1);
