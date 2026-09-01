# Visual system

Design for projector readability, visual hierarchy, and color independence. The deck should remain understandable if color is removed or viewed by someone with color-vision deficiency.

## Color-independent tokens

Define semantic roles, not topic-specific color names:

```css
:root {
  --color-bg: #070912;
  --color-surface: #11172a;
  --color-text: #f5f3ee;
  --color-muted: #aeb7cc;
  --color-line: rgba(245, 243, 238, .2);
  --color-accent: #78e6d0;
  --color-accent-strong: #b9ffed;
  --color-emphasis: #d8a7ff;
  --color-warning: #f3c879;
  --font-display: Georgia, serif;
  --font-body: Arial, sans-serif;
  --font-label: monospace;
  --space-unit: 8px;
  --safe-top: 96px;
  --safe-bottom: 78px;
}
```

Projects may replace the values completely. Components must use semantic variables such as `--color-accent`, never hard-code “cyan means Sense” as the only signal.

## Meaning without color

Use at least two independent cues for categories or states:

- label or number
- position or grouping
- shape or border treatment
- icon or pattern
- text label
- color as a secondary cue

Do not communicate a process only through colored lines. Do not rely on subtle hue differences for adjacent categories.

## Typography

- Use a display face for short claims and a sans/mono face for labels and metadata.
- Keep titles short before reducing type size.
- Use `text-wrap: balance` where supported, but still constrain copy deliberately.
- Never allow a one-line label to wrap unexpectedly.
- Maintain projector-safe contrast and minimum readable sizes.

## Chrome

Use a slim progress line, compact section label, small state count, and optional help/notes affordance. Keep fullscreen as a keyboard action; a visible control may be hidden behind a minimal help affordance rather than occupying the footer.
