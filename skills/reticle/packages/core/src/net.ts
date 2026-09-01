/**
 * Network-call vocabulary shared by the browser SDK and the server. Split out of constants.ts to
 * keep that file under the size cap.
 */

/**
 * What issued a network-shaped call. Desktop apps (Electron, Tauri) reach their backend over IPC
 * rather than HTTP, so an IPC call is recorded as a request with `initiator: 'ipc'` — that keeps
 * `reticle_network`, settle-waiting and `assert { net }` working on desktop with no new wire shape.
 */
export const NetInitiator = {
  FETCH: 'fetch',
  XHR: 'xhr',
  BEACON: 'beacon',
  IPC: 'ipc',
} as const;
export type NetInitiator = (typeof NetInitiator)[keyof typeof NetInitiator];

/**
 * Synthetic URL scheme for an IPC call, so a channel/command name occupies the `url` field the way a
 * real endpoint does: `ipc://get_user`. Agents filter and assert on it with the ordinary net tools.
 */
export const IPC_URL_SCHEME = 'ipc://';

/**
 * IPC has no status code, but every existing filter and assertion in Reticle keys on one
 * (`reticle_network { status: 500 }`, "did POST /x return 200?"). Mapping a settled IPC call onto
 * these two synthetic codes is what makes a FAILED main-process handler or Rust command visible to
 * the tools an agent already uses — without it, an IPC failure is unqueryable and the desktop story
 * is a false green by construction. `ok` is still emitted alongside and is the authoritative field.
 */
export const IpcStatus = {
  OK: 200,
  ERROR: 500,
} as const;

/**
 * `202 Accepted` — the server took the request and has NOT finished processing it.
 *
 * The only status in HTTP whose meaning is "no outcome yet". Folding it into the 2xx success band is
 * how an asynchronous workflow gets verified at exactly the moment nothing has been decided:
 * measured on a logistics console, a dispatch answered 202, the UI rendered success, the page
 * settled, and the server reverted the shipment 1.2s later.
 */
export const HTTP_ACCEPTED = 202;

/**
 * Traffic the DEV TOOLCHAIN makes about itself — never the app under test.
 *
 * A CLOSED list, deliberately. Reported from a real drive: a correct Next.js navigation graded
 * `verified: "no"` because the dev overlay was fetching a source map for an unrelated React key
 * warning (`POST /__nextjs_original-stack-frames`), and that in-flight request counted as "the UI
 * advanced over a request that never settled". Every app that logs one dev warning got a false
 * negative on every action — the worst defect class after a false green.
 *
 * The rule for adding an entry: it must be a channel the FRAMEWORK owns, that no application route
 * can occupy, and that fires as a consequence of running in dev rather than of anything the user
 * did. Widening one of these until it can swallow an app endpoint converts this false negative into
 * a false GREEN, so each pattern is anchored to a reserved prefix or a build-tool file suffix:
 *
 *  - `/__nextjs` — every Next dev-overlay endpoint shares this reserved prefix (`_original-stack-frames`,
 *    `_original-stack-frame`, `_launch-editor`, `_source-map`, `_error_feedback`, `_server_status`,
 *    `_devtools_config`, `_font`, …). Verified against next@15 and next@16 `dist`.
 *  - `/_next/webpack-hmr` + `/_next/static/webpack/` — Next's HMR channel and the `.hot-update.*`
 *    chunks it fetches. `/_next/static/chunks/` and `/_next/image` are NOT here: those are the app.
 *  - `.hot-update.` — the webpack HMR file suffix, for any webpack app (CRA, Rspack, plain webpack).
 *  - `/@vite/` (`client`, `env`), `/@react-refresh`, `/__vite_ping` — the Vite dev client, which is
 *    what SvelteKit, Astro, Remix and plain Vite all run. Verified present in vite@7/vite@8 and in
 *    astro@7's dist. Vite's `/@id/` and `/@fs/` are NOT here: those load the app's own modules.
 */
export const DevToolingChannel = {
  NEXT_DEV_OVERLAY: '/__nextjs',
  NEXT_HMR: '/_next/webpack-hmr',
  NEXT_HMR_CHUNKS: '/_next/static/webpack/',
  WEBPACK_HOT_UPDATE: '.hot-update.',
  VITE_CLIENT: '/@vite/',
  VITE_REACT_REFRESH: '/@react-refresh',
  VITE_PING: '/__vite_ping',
} as const;
export type DevToolingChannel = (typeof DevToolingChannel)[keyof typeof DevToolingChannel];

const DEV_TOOLING_PATTERNS: readonly string[] = Object.values(DevToolingChannel);

/**
 * Is this URL dev tooling rather than the app? Used to keep such calls out of the settle decision and
 * out of contradiction hunting. Never used to HIDE the call: the event stays in the timeline and the
 * exclusion is disclosed alongside the verdict.
 */
export function isDevToolingUrl(url: string | undefined): boolean {
  if (url === undefined) return false;
  return DEV_TOOLING_PATTERNS.some((pattern) => url.includes(pattern));
}
