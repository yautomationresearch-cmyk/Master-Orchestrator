import { describe, it, expect, afterEach } from 'vitest';
import { EventType } from '@reticlehq/core';
import { installScroll } from './scroll.js';
import type { Teardown } from './types.js';

interface Captured {
  type: EventType;
  data: Record<string, unknown>;
}

function setScrollY(y: number): void {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
}

describe('installScroll — trailing edge captures the resting position', () => {
  let teardown: Teardown | undefined;
  afterEach(() => {
    teardown?.();
    teardown = undefined;
    setScrollY(0);
  });

  it('emits the FINAL resting position after scrolling stops, not just the leading sample', async () => {
    const events: Captured[] = [];
    teardown = installScroll((type, data) => events.push({ type, data }));

    setScrollY(100);
    window.dispatchEvent(new Event('scroll')); // leading-edge emit at y=100
    setScrollY(500);
    window.dispatchEvent(new Event('scroll')); // within the throttle window → schedules a trailing emit

    const positions = (): Captured[] => events.filter((e) => e.type === EventType.SCROLL_POSITION);
    expect(positions().at(-1)?.data['y']).toBe(100); // only the leading sample so far

    await new Promise((r) => setTimeout(r, 160)); // let the trailing timer fire

    // The resting position (500) must be reported — a leading-only throttle dropped it entirely.
    expect(positions().at(-1)?.data['y']).toBe(500);
  });
});
