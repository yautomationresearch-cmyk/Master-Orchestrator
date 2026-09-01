/**
 * Self-instrumentation — the most agent-native item. When capability gaps exist (a flow can only assert
 * presence because no signal fires, an unregistered store, a missing testid), the layer emits ready-to-
 * apply instrumentation proposals as concrete diffs, so the AGENT closes the gap and the app's
 * observability compounds run over run — instead of a human being a prerequisite. Deterministic mapping
 * from a located gap to the code to insert; pure and testable. Result-enrichment wiring is a later step.
 */

export const InstrumentationGapKind = {
  MISSING_SIGNAL: 'missing-signal',
  UNREGISTERED_STORE: 'unregistered-store',
  MISSING_TESTID: 'missing-testid',
} as const;
export type InstrumentationGapKind =
  (typeof InstrumentationGapKind)[keyof typeof InstrumentationGapKind];

export interface InstrumentationGap {
  kind: InstrumentationGapKind;
  file: string;
  line: number;
  /** The name to instrument with — a signal name, store name, or testid. */
  name: string;
  /** Why this gap matters (e.g. "checkout flow asserts presence only"). */
  context?: string;
}

interface InstrumentationProposal {
  file: string;
  line: number;
  /** The code to insert. */
  insert: string;
  rationale: string;
}

/** PascalCase a store name for a `useX.getState` hint (cart → Cart). */
function pascal(name: string): string {
  return 0 === name.length ? name : name[0]?.toUpperCase() + name.slice(1);
}

function insertFor(gap: InstrumentationGap): string {
  switch (gap.kind) {
    case InstrumentationGapKind.MISSING_SIGNAL:
      return `reticle.signal('${gap.name}');`;
    case InstrumentationGapKind.UNREGISTERED_STORE:
      return `registerStore('${gap.name}', () => use${pascal(gap.name)}.getState());`;
    case InstrumentationGapKind.MISSING_TESTID:
      return `data-testid="${gap.name}"`;
  }
}

function rationaleFor(gap: InstrumentationGap): string {
  const base =
    gap.kind === InstrumentationGapKind.MISSING_SIGNAL
      ? `emit a consequence signal so verification proves the outcome, not just presence`
      : gap.kind === InstrumentationGapKind.UNREGISTERED_STORE
        ? `register the store so state assertions can read the source of truth`
        : `add a stable testid so the anchor survives refactors`;
  return gap.context === undefined ? base : `${base} — ${gap.context}`;
}

/** Turn located capability gaps into ready-to-apply instrumentation proposals. Deterministic. */
export function proposeInstrumentation(
  gaps: readonly InstrumentationGap[],
): InstrumentationProposal[] {
  return gaps.map((gap) => ({
    file: gap.file,
    line: gap.line,
    insert: insertFor(gap),
    rationale: rationaleFor(gap),
  }));
}
