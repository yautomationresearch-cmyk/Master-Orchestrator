/** Self-describing capability registry — the testable surface the app advertises. */

export interface CapabilityFlow {
  name: string;
  steps: string[];
}

export interface Capabilities {
  testids: string[];
  signals: string[];
  stores: string[];
  flows: CapabilityFlow[];
}

/** What the host app passes to reticle.describe; all fields optional. */
export interface CapabilitiesInput {
  testids?: string[];
  signals?: string[];
  stores?: string[];
  flows?: CapabilityFlow[];
}

// Persist on a global so the registry survives HMR module re-evaluation (matches __reticleAdapters).
const globalStore = globalThis as unknown as { __reticleCapabilities?: Capabilities };

function empty(): Capabilities {
  return { testids: [], signals: [], stores: [], flows: [] };
}

const capabilities: Capabilities = (globalStore.__reticleCapabilities ??= empty());

function mergeUnique(into: string[], add: readonly string[] | undefined): void {
  if (add === undefined) return;
  for (const v of add) if (!into.includes(v)) into.push(v);
}

/**
 * Notified whenever capabilities change, so the SDK can re-announce them to the bridge.
 *
 * `hasCapabilities` rides in the HELLO, which goes out at connect() — and registering deliberately
 * happens AFTER connect, because `registerStore` needs a live SDK to subscribe through. Without a
 * notification, an app that declared its whole testable surface still appeared to the agent as
 * having none, permanently. The hook lives HERE rather than on `reticle.describe` because the
 * documented entry point is this bare function; only wiring `describe` would have fixed the path
 * almost nobody uses.
 */
let onChanged: (() => void) | undefined;

/** Set by the SDK at connect. Idempotent; the last connect wins. */
export function setCapabilitiesListener(cb: (() => void) | undefined): void {
  onChanged = cb;
}

/** Called by the host app via reticle.describe. Merges (idempotent), never replaces wholesale. */
export function registerCapabilities(input: CapabilitiesInput): void {
  mergeUnique(capabilities.testids, input.testids);
  mergeUnique(capabilities.signals, input.signals);
  mergeUnique(capabilities.stores, input.stores);
  if (input.flows !== undefined) {
    for (const flow of input.flows) {
      const existing = capabilities.flows.find((f) => f.name === flow.name);
      if (existing === undefined) {
        capabilities.flows.push({ name: flow.name, steps: [...flow.steps] });
      } else {
        existing.steps = [...flow.steps]; // last writer wins for a named flow
      }
    }
  }
  onChanged?.();
}

/** Snapshot copy of the registered capabilities (defensive — never hand out the live arrays). */
export function getCapabilities(): Capabilities {
  return {
    testids: [...capabilities.testids],
    signals: [...capabilities.signals],
    stores: [...capabilities.stores],
    flows: capabilities.flows.map((f) => ({ name: f.name, steps: [...f.steps] })),
  };
}

/** Whether the app has advertised any capabilities (used in the HELLO flag). */
export function hasCapabilities(): boolean {
  return (
    capabilities.testids.length > 0 ||
    capabilities.signals.length > 0 ||
    capabilities.stores.length > 0 ||
    capabilities.flows.length > 0
  );
}
