# QA checklist

Complete the relevant gates before delivery. A montage is useful for rhythm, but it cannot replace full-size scene inspection.

## Build and model

- build succeeds
- lint succeeds
- tests render the intended shell and scene text
- every scene ID is unique
- reveal counts are valid and monotonic
- every image reference exists

## Keyboard and interaction

- next/previous work on every scene and reveal
- first/last boundaries clamp correctly
- Home and End work
- fullscreen works or fails gracefully
- Escape closes notes and exits fullscreen predictably
- notes do not advance the deck
- buttons do not trigger global advancement
- click/tap and swipe do not double-advance
- reduced motion is respected

## Layout and overlap

Inspect at minimum 1440×900, 1280×720, 1024×768, and a narrow mobile viewport.

- no title, body, source, or control text clips or wraps unexpectedly
- content stays within header/footer safe zones
- no content/content overlap unless explicitly declared
- image scrims preserve readable contrast
- source labels remain legible and do not collide with controls
- notes panel does not cover essential controls without an intentional modal state
- footer remains usable on short viewports

For automated collision checks, capture a JSON snapshot after the scene is mounted:

```json
{
  "viewport": {"width": 1440, "height": 900},
  "elements": [
    {"id":"title","x":80,"y":120,"width":620,"height":180,"layer":"content","allowOverlapWith":[]},
    {"id":"background","x":0,"y":0,"width":1440,"height":900,"layer":"background","allowOverlapWith":["*"]}
  ]
}
```

Run `node scripts/audit-layout.mjs snapshot.json`. Background/scrim overlaps are allowed by layer; content/content, content/chrome, and content/footer collisions fail unless explicitly listed.

## Asset and performance

- all shipped raster images are optimized WebP
- source duplicates are not shipped
- asset manifest contains dimensions and byte sizes
- no asset exceeds the declared budget without justification
- opening scene does not wait on unnecessary later artwork
- no layout shift is introduced by images

## Accessibility

- semantic landmarks exist for header, main scene, notes, and footer
- controls have accessible names
- focus states are visible
- meaning is not conveyed by color alone
- text/background contrast is sufficient
- reduced-motion behavior is present

## Data / board decks (when profile applies)

Also complete [data-board-decks.md](data-board-decks.md) checklist:

- no empty lower-third on scorecard / evidence slides
- spark/area absolute scales use Y domain from 0
- pie/donut remounts and draws in on slide entry
- Metric Board light-only or Orbit dark-only as contracted
- every chart has adjacent textual KPI or legend
