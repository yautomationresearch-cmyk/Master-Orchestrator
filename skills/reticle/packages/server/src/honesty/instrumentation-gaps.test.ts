import { describe, expect, it } from 'vitest';
import { InstrumentationGapKind } from '@reticlehq/core';
import { gapsForAction, type ActionInstrumentationFacts } from './instrumentation-gaps.js';

const clean: ActionInstrumentationFacts = {
  pass: true,
  source: 'src/Pay.tsx:42',
  stateAsked: false,
  stateUnwatched: false,
  domMutated: false,
  signalsFired: 1,
  routeChanged: false,
  routeSignalFired: false,
};

const kinds = (facts: Partial<ActionInstrumentationFacts>): string[] =>
  gapsForAction({ ...clean, ...facts }).map((g) => g.kind);

describe('gapsForAction', () => {
  it('reports nothing when the app told Reticle everything it needed', () => {
    expect(gapsForAction(clean)).toEqual([]);
  });

  /**
   * The gate itself lives in `isChangeUndeclared`, which is the only thing that may decide whether a
   * change went undeclared. Here the fact arrives already decided, and the only question is whether
   * the gap is emitted — and what it is allowed to say.
   */
  describe('a verdict drawn over a change nothing declared', () => {
    it('reports it when the caller says the change went undeclared', () => {
      expect(kinds({ changeUndeclared: true })).toEqual([InstrumentationGapKind.UNDECLARED_CHANGE]);
    });

    it('says nothing when it did not', () => {
      expect(kinds({ changeUndeclared: false })).toEqual([]);
    });

    /**
     * NEVER invent the intent. A guessed statement reads as the developer's own words and an agent
     * will act on it, which is strictly worse than honest absence — so the gap may not carry the
     * file, the line, or the ref it happened to be driving. The remedy asks; it does not answer.
     */
    it('names no file, line or ref, because nothing here knows what the change was for', () => {
      const [gap] = gapsForAction({
        ...clean,
        pass: false,
        source: 'src/Pay.tsx:42',
        ref: 'e12',
        changeUndeclared: true,
      }).filter((g) => InstrumentationGapKind.UNDECLARED_CHANGE === g.kind);
      expect(gap?.source).toBeUndefined();
      expect(gap?.ref).toBeUndefined();
      expect(gap?.fix).toContain('reticle_intent');
    });
  });

  /**
   * THE rule, and the one most likely to erode. A gap is a finding only when the verdict came back
   * weaker BECAUSE of it. A gap nobody hit is a backlog, and a backlog reported as a finding is how
   * an agent learns to stop reading findings.
   */
  describe('only fires when the absence changed the answer', () => {
    it('says nothing about a missing source mapping on a verdict that passed', () => {
      expect(kinds({ pass: true, source: undefined })).toEqual([]);
    });

    it('reports it on a verdict that did NOT pass, where the line is what the agent wants next', () => {
      expect(kinds({ pass: false, source: undefined })).toEqual([
        InstrumentationGapKind.NO_SOURCE_MAPPING,
      ]);
    });

    it('says nothing when the element HAS a source and the verdict failed', () => {
      expect(kinds({ pass: false })).toEqual([]);
    });

    it('says nothing about stores unless the caller actually asked about state', () => {
      expect(kinds({ stateUnwatched: true, stateAsked: false })).toEqual([]);
      expect(kinds({ stateUnwatched: true, stateAsked: true })).toEqual([
        InstrumentationGapKind.NO_STORE_REGISTERED,
      ]);
    });

    /**
     * A mutation with no signal only costs something when Reticle had to INFER the outcome. If the
     * app proved it another way, nothing was lost and there is nothing to ask for.
     */
    it('says nothing about a silent mutation when the verdict was proved anyway', () => {
      expect(kinds({ domMutated: true, signalsFired: 0, pass: true, proved: true })).toEqual([]);
    });

    it('reports a silent mutation when the verdict was not proved', () => {
      expect(kinds({ domMutated: true, signalsFired: 0, pass: false })).toEqual([
        InstrumentationGapKind.NO_SIGNAL_ON_MUTATION,
      ]);
    });

    it('says nothing when the DOM did not move at all', () => {
      expect(kinds({ domMutated: false, signalsFired: 0, pass: false })).toEqual([]);
    });

    it('reports a route change nothing signalled', () => {
      expect(kinds({ routeChanged: true, routeSignalFired: false, pass: false })).toEqual([
        InstrumentationGapKind.NO_ROUTE_SIGNAL,
      ]);
    });

    it('says nothing when the route change WAS signalled', () => {
      expect(kinds({ routeChanged: true, routeSignalFired: true, pass: false })).toEqual([]);
    });
  });

  it('carries the ref and the remedy, so the agent can act without another call', () => {
    const [gap] = gapsForAction({ ...clean, pass: false, source: undefined, ref: 'e12' });
    expect(gap?.ref).toBe('e12');
    expect(gap?.fix).toContain('plugin');
    expect(gap?.cost.length ?? 0).toBeGreaterThan(0);
  });

  it('reports several distinct gaps from one action', () => {
    expect(
      kinds({
        pass: false,
        source: undefined,
        domMutated: true,
        signalsFired: 0,
        routeChanged: true,
        routeSignalFired: false,
      }).sort(),
    ).toEqual(
      [
        InstrumentationGapKind.NO_ROUTE_SIGNAL,
        InstrumentationGapKind.NO_SIGNAL_ON_MUTATION,
        InstrumentationGapKind.NO_SOURCE_MAPPING,
      ].sort(),
    );
  });

  /**
   * The pointer the gap surface exists to hand over.
   *
   * A gap is read LATER — `reticle_verify { action: "coverage" }` is the "am I done?" call, by which
   * time the `ref` it carries is very likely dead. `source` is a fact about the CODE and stays true
   * while the ref rots, so a gap about a specific control has to carry it whenever it is known.
   */
  describe('points at the code, not only at a ref that will go stale', () => {
    it('names the driven element file:line on a mutation nothing signalled', () => {
      const [gap] = gapsForAction({
        ...clean,
        pass: false,
        domMutated: true,
        signalsFired: 0,
        ref: 'e7',
      });
      expect(gap?.kind).toBe(InstrumentationGapKind.NO_SIGNAL_ON_MUTATION);
      expect(gap?.source).toBe('src/Pay.tsx:42');
    });

    it('omits it rather than guessing when the element carries no source', () => {
      const gaps = gapsForAction({
        ...clean,
        pass: false,
        source: undefined,
        domMutated: true,
        signalsFired: 0,
        ref: 'e7',
      });
      const silent = gaps.find((g) => InstrumentationGapKind.NO_SIGNAL_ON_MUTATION === g.kind);
      expect(silent).toBeDefined();
      expect(silent?.source).toBeUndefined();
    });

    /**
     * The gaps that are NOT about the driven element must not borrow its line. A store is registered
     * once at app setup and a router adapter is wired app-wide; neither lives where the click does,
     * and a pointer that sends the agent to the wrong file costs it the trip AND leaves it further
     * from the fix than no pointer at all.
     */
    it('does not attach the acted line to gaps that are not about the acted element', () => {
      const [store] = gapsForAction({ ...clean, stateAsked: true, stateUnwatched: true });
      expect(store?.kind).toBe(InstrumentationGapKind.NO_STORE_REGISTERED);
      expect(store?.source).toBeUndefined();

      const [route] = gapsForAction({ ...clean, pass: false, routeChanged: true });
      expect(route?.kind).toBe(InstrumentationGapKind.NO_ROUTE_SIGNAL);
      expect(route?.source).toBeUndefined();
    });
  });
});
