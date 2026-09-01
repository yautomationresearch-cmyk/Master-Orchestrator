---
name: pretext
description: Pretext multiline text measurement and layout without DOM reflow (@chenglou/pretext). Use when implementing text measurement, canvas text layout, virtualization height calculations, masonry layouts, custom inline flows, or avoiding DOM layout thrashing (getBoundingClientRect / offsetHeight).
user-invocable: true
---

# Pretext Text Measurement & Layout Skill

[Pretext](https://github.com/chenglou/pretext) (`@chenglou/pretext`) is a pure JS/TS library created by Cheng Lou for multiline text measurement and layout without touching the DOM. It side-steps `getBoundingClientRect` and `offsetHeight` layout reflows (500x–600x faster).

## Installation

```bash
npm install @chenglou/pretext
```

---

## Key Lifecycle Rules

1. **Two-Phase Lifecycle (`prepare` vs `layout`)**:
   - `prepare(text, font, options)`: One-time heavy setup (segmentation, canvas width measurement, caching). Returns an opaque handle.
   - `layout(prepared, width, lineHeight)`: Pure arithmetic hot path. Runs on window resize, scroll, or dynamic width changes.

2. **Crucial Rule**: **DO NOT** rerun `prepare()` on every resize or render loop! Rerun only `layout()` when container dimensions change.

---

## Usage Patterns

### Pattern 1: Measure Paragraph Height (No DOM Reflow)

```ts
import { prepare, layout } from '@chenglou/pretext'

// 1. Prepare handle once (when text or font changes)
const prepared = prepare('AGI is coming. Hello world! 🚀', '16px Inter')

// 2. Fast layout arithmetic on resize/width change
const { height, lineCount } = layout(prepared, 320, 20) // 320px width, 20px line height
```

**For Textarea / Pre-wrapped text**:
```ts
const prepared = prepare(textareaValue, '16px Inter', { whiteSpace: 'pre-wrap' })
const { height } = layout(prepared, textareaWidth, 20)
```

### Pattern 2: Manual Line Layout & Canvas Rendering

```ts
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const prepared = prepareWithSegments('Multiline canvas text layout...', '18px "Helvetica Neue"')
const { lines } = layoutWithLines(prepared, 320, 26) // 320px max width, 26px line height

lines.forEach((line, i) => {
  ctx.fillText(line.text, 0, i * 26)
})
```

### Pattern 3: Virtualization & Shrink Wrap

```ts
import { measureLineStats, walkLineRanges } from '@chenglou/pretext'

const { lineCount, maxLineWidth } = measureLineStats(prepared, 320)

let maxW = 0
walkLineRanges(prepared, 320, line => {
  if (line.width > maxW) maxW = line.width
})
// maxW is the exact shrink-wrapped width needed for container
```

---

## When to Recommend Pretext

- Virtualized lists with dynamic text row heights.
- Canvas / WebGL / SVG text rendering.
- Layouts around floated/custom-shaped objects.
- High-frequency resize handlers where `getBoundingClientRect` causes lag.
