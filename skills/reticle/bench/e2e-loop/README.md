# The end-to-end loop

The release's headline demo, written as a runnable assertion instead of a story:

> agent edits a covered file → the layer names the affected flows → verification goes RED → the gate BLOCKS with the exact flows to run → agent fixes → verification goes GREEN → the gate UNBLOCKS.

```bash
# bench-app running on the SAME port the CLI will use, with the pairing token:
#   cd apps/bench-app && RETICLE_PORT=4497 VITE_RETICLE_TOKEN="$(cat ~/.reticle/pairing-token)" pnpm dev
# and one flow saved in .reticle/flows/
E2E_PORT=4497 node bench/e2e-loop/demo.mjs http://localhost:4312
```

It drives the **shipped CLI** (`reticle affected` / `verify` / `gate`), so it verifies the loop a user actually runs rather than an in-process reconstruction of it. Exits non-zero if any step misbehaves, and always reverts the injected fault — even on a crash.

## Result (2026-07-21): 9/9 steps

The injected fault is `signal-contract-violation`: the UI stays perfectly correct and only the `nav:changed` domain signal stops firing. Nothing a screenshot or DOM diff could catch — the flow goes red purely because it asserts a **consequence**.

## What building this found

Writing the demo exposed three real breaks that unit tests could not:

1. **`verify` → `gate` was not connected at all.** Run artifacts were persisted only by the optional `serve --http` endpoint, while `reticle gate` decides from `RunStore.latest()`. So the documented CI path could pass verification and the gate would still block — the planned "agent fixes → gate unblocks" was impossible. `reticle verify` now persists its artifact (best-effort; a disk failure must not turn a passing verification into a failure).
2. **`reticle verify` ignored `RETICLE_PORT`** and always bound the default 4400, so it crashed with `EADDRINUSE` on any machine already running a daemon — i.e. every developer machine. It now honours the env port for both its own bridge and the injected connect URL.
3. **Flows that each sign in are order-dependent on one shared tab.** `verify` replays sequentially against a single session, so flow 1 authenticates and the rest then fail on a missing `login-submit`. The same contamination the parallel-suite bench found. The demo therefore uses one self-contained journey flow; multi-flow suites want `flow_verify { parallel }`, where each flow gets a clean context.

## Setup gotchas the run will tell you about

- **Port match**: for a loopback URL, `verify` does not inject connect, so the app must already dial the port `verify` uses.
- **Pairing token**: boot the app with `VITE_RETICLE_TOKEN` or the daemon rejects it (`authentication_failed`).
- **One session**: `verify` refuses when several tabs are connected — close stray browsers first.
