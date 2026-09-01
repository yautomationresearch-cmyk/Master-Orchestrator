import { ConsequenceKind, EventType, type ReticleEvent } from '@reticlehq/core';

/**
 * First-divergence — the brain of the divergence capsule (Tier 2). Given the chain the flow DECLARED
 * should happen (its mustHold, as ordered expected links) and what was OBSERVED, walk the declaration and
 * report the FIRST link where expected ≠ observed, values side by side. That single link is where the
 * fault lives — the agent fixes it without re-exploring. Pure; the acceptance bar is that for every
 * hidden-500 / hung-request fixture it names the correct link.
 */

/**
 * The links a capsule can walk. Exactly core's ConsequenceKind — a link is a thing the app provably
 * DID, which is the same set signal/net/state names everywhere else. Spelled through the shared
 * constant so the two can never drift apart.
 */
export type ExpectedLink =
  | { kind: typeof ConsequenceKind.SIGNAL; name: string }
  | { kind: typeof ConsequenceKind.NET; urlContains: string; status?: number }
  | { kind: typeof ConsequenceKind.STATE; name: string };

export interface Divergence {
  /** The declared link that did not hold. */
  expected: ExpectedLink;
  /** Human description of what was observed instead (the closest attempt, or "nothing"). */
  observed: string;
}

function net(events: readonly ReticleEvent[]): ReticleEvent[] {
  return events.filter((e) => e.type === EventType.NET_REQUEST);
}

function satisfies(link: ExpectedLink, events: readonly ReticleEvent[]): boolean {
  switch (link.kind) {
    case ConsequenceKind.SIGNAL:
      return events.some((e) => e.type === EventType.SIGNAL && e.data['name'] === link.name);
    case ConsequenceKind.STATE:
      // Matched against the store name OR the changed path, because the link carries whichever half
      // the predicate gave: `store` when it named one, and `path` otherwise (predicateToExpectedLinks).
      // The event carries both. Comparing only the store meant every assertion written by path
      // reported "never changed" however the app behaved — a false claim printed beside a `stateDiffs`
      // entry showing that exact path changing.
      return events.some(
        (e) =>
          e.type === EventType.STATE_CHANGE &&
          (e.data['name'] === link.name || e.data['path'] === link.name),
      );
    case ConsequenceKind.NET:
      return net(events).some(
        (e) =>
          'string' === typeof e.data['url'] &&
          e.data['url'].includes(link.urlContains) &&
          (link.status === undefined || e.data['status'] === link.status),
      );
  }
}

/** Describe what WAS observed for a link that failed — the closest attempt, for a side-by-side. */
function observedFor(link: ExpectedLink, events: readonly ReticleEvent[]): string {
  if (ConsequenceKind.NET === link.kind) {
    const match = net(events).find(
      (e) => 'string' === typeof e.data['url'] && e.data['url'].includes(link.urlContains),
    );
    if (match === undefined) return `no request to ${link.urlContains}`;
    return `${link.urlContains} responded ${String(match.data['status'])} (expected ${String(link.status)})`;
  }
  if (ConsequenceKind.SIGNAL === link.kind) return `signal "${link.name}" never fired`;
  return `state "${link.name}" never changed`;
}

/**
 * Walk the declared chain in order; return the first link not satisfied by the observed events (with a
 * side-by-side of what happened instead), or null when the whole chain held.
 */
export function firstDivergence(
  expected: readonly ExpectedLink[],
  observed: readonly ReticleEvent[],
): Divergence | null {
  for (const link of expected) {
    if (!satisfies(link, observed)) {
      return { expected: link, observed: observedFor(link, observed) };
    }
  }
  return null;
}
