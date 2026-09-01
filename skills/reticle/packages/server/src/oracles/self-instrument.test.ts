import { describe, expect, it } from 'vitest';
import { InstrumentationGapKind, proposeInstrumentation } from './self-instrument.js';

describe('proposeInstrumentation', () => {
  it('proposes a signal call for a missing-signal gap, at the located file:line', () => {
    const [proposal] = proposeInstrumentation([
      {
        kind: InstrumentationGapKind.MISSING_SIGNAL,
        file: 'src/Checkout.tsx',
        line: 114,
        name: 'order:placed',
        context: 'checkout flow asserts presence only',
      },
    ]);
    expect(proposal).toMatchObject({
      file: 'src/Checkout.tsx',
      line: 114,
      insert: "reticle.signal('order:placed');",
    });
    expect(proposal?.rationale).toContain('checkout flow asserts presence only');
  });

  it('proposes a registerStore call (PascalCased hook) for an unregistered store', () => {
    const [proposal] = proposeInstrumentation([
      {
        kind: InstrumentationGapKind.UNREGISTERED_STORE,
        file: 'src/store.ts',
        line: 1,
        name: 'cart',
      },
    ]);
    expect(proposal?.insert).toBe("registerStore('cart', () => useCart.getState());");
  });

  it('proposes a testid attribute for a missing-testid gap', () => {
    const [proposal] = proposeInstrumentation([
      {
        kind: InstrumentationGapKind.MISSING_TESTID,
        file: 'src/Button.tsx',
        line: 20,
        name: 'submit-btn',
      },
    ]);
    expect(proposal?.insert).toBe('data-testid="submit-btn"');
  });

  it('returns nothing when there are no gaps', () => {
    expect(proposeInstrumentation([])).toEqual([]);
  });
});
