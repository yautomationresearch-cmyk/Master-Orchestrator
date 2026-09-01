/**
 * Blind-spot detection, the detectable half). Cross-origin iframes are a real observation gap — the
 * SDK cannot see inside them (same-origin policy). We COUNT them so a result can say "coverage: partial —
 * 2 cross-origin frames unobserved" instead of implying it saw the whole page. Closed shadow roots are a
 * blind spot too, but undetectable by design (element.shadowRoot === null), so they are not counted here.
 */

/** Pure: how many frames are cross-origin, given each frame's same-origin flag + whether it has a src. */
export function classifyCrossOriginFrames(
  frames: ReadonlyArray<{ sameOrigin: boolean; hasSrc: boolean }>,
): number {
  return frames.filter((f) => f.hasSrc && !f.sameOrigin).length;
}

/** Probe the live document: count iframes whose document is unreachable (cross-origin). */
export function countCrossOriginFrames(): number {
  if ('undefined' === typeof document) return 0;
  const frames: Array<{ sameOrigin: boolean; hasSrc: boolean }> = [];
  for (const frame of document.querySelectorAll('iframe')) {
    const hasSrc = frame.getAttribute('src') !== null && frame.getAttribute('src') !== '';
    let sameOrigin: boolean;
    try {
      // Reaching contentDocument throws (or yields null) for a cross-origin frame.
      sameOrigin = frame.contentDocument !== null;
    } catch {
      sameOrigin = false;
    }
    frames.push({ sameOrigin, hasSrc });
  }
  return classifyCrossOriginFrames(frames);
}
