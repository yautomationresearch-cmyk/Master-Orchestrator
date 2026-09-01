/**
 * Why the bridge refused a HELLO — the specific reason when there is one.
 *
 * A daemon left running by one project answers the next project's app and rejects it on token, and
 * the SDK printed `bridge refused the connection: authentication failed`. That sends someone to
 * check a token which is perfectly correct — it is simply a DIFFERENT project's token. The two cases
 * need opposite fixes: "your token is wrong" versus "that daemon is not yours, stop it".
 *
 * The discriminator is EVIDENCE, not derivation. The daemon and the SDK derive project ids by
 * different schemes (the SDK from its Vite root, the daemon from its own cwd), so comparing those
 * would report "different project" on every auth failure — the same confidently-wrong diagnostic
 * this exists to replace. What the daemon knows for certain is which projects it has ALREADY
 * accepted a session from; if it has served X and a HELLO arrives for Y, it demonstrably belongs to
 * someone else.
 *
 * With no evidence — a fresh daemon, or a HELLO naming no project — nothing is inferred and the
 * plain reason stands.
 */

const PLAIN = 'authentication failed';
/** WebSocket close reasons are capped at 123 bytes; a longer one throws and closes with nothing. */
const MAX_REASON_BYTES = 123;

export function authFailureReason(
  servedProjects: ReadonlySet<string>,
  helloProject: string | undefined,
): string {
  if (helloProject === undefined || 0 === servedProjects.size) return PLAIN;
  if (servedProjects.has(helloProject)) return PLAIN;
  const reason = `this daemon serves a different project — run \`reticle stop\` and retry`;
  return Buffer.byteLength(reason, 'utf8') <= MAX_REASON_BYTES ? reason : PLAIN;
}
