# Image pipeline

Treat image generation and optimization as part of layout engineering. Choose the visual role and crop before generating the asset.

## Image brief

Every generated image prompt should specify:

- subject and teaching purpose
- visual medium and realism level
- aspect ratio, normally 16:9
- subject placement and copy-safe negative space
- palette that supports the deck without defining semantic meaning
- crop and focal point
- “no typography, no UI, no watermark” unless explicitly requested

For example:

```text
16:9 scientific editorial illustration of a neuron and synapse,
subject weighted to the right third, quiet deep-navy negative space on
the left for editable HTML copy, luminous but restrained cyan and violet,
high-detail biological structure, no labels, no typography, no interface.
```

## File rules

- Keep source PNG/JPEG files outside `public/` or in a clearly excluded source folder.
- Ship optimized WebP files from `public/images/`.
- Use WebP quality around 80–84 for large artwork and 88–92 for fine-detail or text-bearing assets.
- Use a separate quality profile for social preview images.
- Do not ship duplicate PNG/JPEG and WebP versions.
- Record `src`, dimensions, bytes, role, and `objectPosition` in an asset manifest.

## Responsive loading

- Preload or eagerly load the opening artwork.
- Preload the next likely scene only when assets are large enough to justify it.
- Use `loading="lazy"` for later offscreen assets where the scene architecture allows it.
- Use `decoding="async"` and explicit dimensions or aspect-ratio boxes to reduce layout shifts.
- Set `object-fit` and `object-position` per asset; do not use `center` blindly.

## Budgets

Use a practical default of 750 KB per scene artwork and about 4 MB for the complete image set. Exceed a budget only with a written reason, such as a high-resolution zoomable diagram. The current neuroscience artwork is a good baseline: 16:9 WebP files in the roughly 92–296 KB range.
