import {
  InstrumentationGapKind,
  dedupeGaps,
  instrumentationGap,
  type InstrumentationGap,
} from '@reticlehq/core';

/**
 * The gaps ONE action revealed, derived from facts the act path already holds.
 *
 * Pure, and deliberately fed by primitives rather than by the action result: every fact below is
 * already computed for other reasons — `actedSource` for the red-verdict file:line, `stateUnwatched`
 * because an empty `stateDiffs` would otherwise read as "the app changed nothing", the signal count
 * and route movement for the causal summary. Nothing here costs a new observation. The gap surface
 * is a second reading of evidence Reticle was already collecting and then discarding.
 *
 * ## Each kind carries its OWN gate
 *
 * The rule is that a gap fires only when the verdict came back weaker because of it — and "weaker"
 * is different per kind, so a single global flag would be a lie in both directions:
 *
 *  - a missing source mapping costs nothing on a PASS. The act path already says so in as many
 *    words: on green nobody needs the file:line and it is noise. It costs a great deal on a red,
 *    where it is the first thing the agent wants;
 *  - a missing store costs nothing unless the caller ASKED about state;
 *  - a silent mutation costs nothing if the app proved the outcome some other way.
 *
 * Encoding the gates per kind is what keeps this from degenerating into a linter that fires on every
 * uninstrumented control on the page. That surface would be ignored within a day, and it would take
 * the true positives with it.
 */

export interface ActionInstrumentationFacts {
  /** Did the verdict pass? Several gates turn on this, in different directions. */
  pass: boolean;
  /** True when the outcome was positively PROVED rather than inferred. */
  proved?: boolean;
  /**
   * The `file:line` of the element this verdict is about, when the build plugin stamped one.
   *
   * Was a boolean, on the reasoning that the gap only needed to know WHETHER the agent could be
   * pointed at code. That was true while the only gap reading it was the one that fires when the
   * pointer is missing. It stopped being true the moment a gap wanted to CARRY the pointer: a gap is
   * read back later, out of the ledger, by which time its `ref` is very likely dead, and a boolean
   * cannot be turned back into a location. Both callers already hold this as a formatted string.
   */
  source?: string | undefined;
  /** The ref that was driven, for the report. */
  ref?: string | undefined;
  /** Did the caller's predicate ask about registered state? */
  stateAsked: boolean;
  /** True when the session has no store registered to read. */
  stateUnwatched: boolean;
  /** Did the DOM move in this action's window? */
  domMutated: boolean;
  /** How many app signals fired in the window. */
  signalsFired: number;
  /** Did the route change in this action's window? */
  routeChanged: boolean;
  /** Did anything signal that route change? */
  routeSignalFired: boolean;
  /**
   * Did a code change land since the last verdict with nothing declaring what it was for?
   *
   * Arrives already decided, because the decision needs the intent ledger and this stays pure. Its
   * gate — and the reasoning that keeps it from becoming a nag — lives in `isChangeUndeclared`, and
   * that is the only place allowed to answer it.
   */
  changeUndeclared?: boolean;
}

export function gapsForAction(facts: ActionInstrumentationFacts): InstrumentationGap[] {
  const gaps: InstrumentationGap[] = [];

  // A red verdict names the control and cannot name the line that renders it. That is the round trip
  // the agent is about to spend, and the one a build plugin removes permanently.
  if (!facts.pass && facts.source === undefined) {
    gaps.push(
      instrumentationGap(
        InstrumentationGapKind.NO_SOURCE_MAPPING,
        'the control that was driven carries no source mapping',
        'this verdict can name the control but not the file and line that render it, so finding the code is a separate search',
        { ...(facts.ref === undefined ? {} : { ref: facts.ref }) },
      ),
    );
  }

  // Asked about state, and there is no state channel to answer from. Deliberately UNLOCATED: a store
  // is registered once at app setup, nowhere near the control that was driven, and nothing in this
  // window knows where that setup lives. Borrowing the acted line would send the agent to a file
  // that cannot hold the fix — worse than no pointer, because it costs the trip as well.
  if (facts.stateAsked && facts.stateUnwatched) {
    gaps.push(
      instrumentationGap(
        InstrumentationGapKind.NO_STORE_REGISTERED,
        'no store is registered, and this assertion was about state',
        'the assertion could not be answered from the deterministic channel and had to fall back to what the DOM happens to show',
      ),
    );
  }

  // The app moved and said nothing, and Reticle could not prove the outcome another way.
  if (facts.domMutated && 0 === facts.signalsFired && true !== facts.proved) {
    gaps.push(
      instrumentationGap(
        InstrumentationGapKind.NO_SIGNAL_ON_MUTATION,
        'the DOM changed and no signal fired for it',
        'the outcome had to be inferred from the DOM instead of read from the app asserting its own success, which is the strongest evidence available',
        // The one gap here that can be LOCATED. It is about the element that was driven, and that
        // element is exactly what `source` describes — so the pointer is a fact, not a guess. It
        // also outlives the `ref` beside it, which is what makes this gap still actionable when
        // coverage reads it back long after the page has re-rendered.
        {
          ...(facts.ref === undefined ? {} : { ref: facts.ref }),
          ...(facts.source === undefined ? {} : { source: facts.source }),
        },
      ),
    );
  }

  // Also unlocated, for the same reason: the remedy is a router adapter wired app-wide, not a line
  // at the control that happened to trigger this navigation.
  if (facts.routeChanged && !facts.routeSignalFired) {
    gaps.push(
      instrumentationGap(
        InstrumentationGapKind.NO_ROUTE_SIGNAL,
        'the route changed and nothing signalled it',
        'route consequences cannot be asserted on this app, so a navigation can only be checked by what rendered afterwards',
      ),
    );
  }

  // The one gap here that is not about the app. Deliberately UNLOCATED and deliberately generic: the
  // only honest thing to report is that the intent is absent. Naming the file that changed, or the
  // control that was driven, would invite the reader to treat a guess as the declaration — and a
  // guessed intent reads as the developer's own words, which is strictly worse than honest absence.
  if (true === facts.changeUndeclared) {
    gaps.push(
      instrumentationGap(
        InstrumentationGapKind.UNDECLARED_CHANGE,
        'code changed since the last verdict and no intent says what the change was for',
        'this verdict can only check the app against itself, so a green here means "nothing visibly broke" rather than "the change did what it was meant to"',
      ),
    );
  }

  return dedupeGaps(gaps);
}
