import { describe, it, expect } from 'vitest';
import { classifyCrossOriginFrames, countCrossOriginFrames } from './blind-spots.js';

describe('classifyCrossOriginFrames', () => {
  it('counts only cross-origin frames that have a src', () => {
    expect(
      classifyCrossOriginFrames([
        { sameOrigin: false, hasSrc: true }, // counted
        { sameOrigin: true, hasSrc: true }, // same-origin → visible
        { sameOrigin: false, hasSrc: false }, // srcless (about:blank) → not a real gap
      ]),
    ).toBe(1);
  });

  it('is zero when every frame is same-origin', () => {
    expect(classifyCrossOriginFrames([{ sameOrigin: true, hasSrc: true }])).toBe(0);
  });
});

describe('countCrossOriginFrames (jsdom)', () => {
  it('counts zero on a page with no iframes', () => {
    document.body.innerHTML = '<div>hi</div>';
    expect(countCrossOriginFrames()).toBe(0);
  });

  it('does not count a same-origin (srcless) iframe as a blind spot', () => {
    document.body.innerHTML = '<iframe></iframe>';
    expect(countCrossOriginFrames()).toBe(0);
  });
});
