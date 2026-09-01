---
name: interactive-presentation-deck
description: >-
  Build browser-native presentation decks with a mandatory Theme Gallery picker
  (launch local UI so the user selects a theme before any slides are built),
  keyboard navigation, reveals, presenter notes, Recharts data/board themes
  (Orbit Data / Metric Board), and strict QA. Use when creating or improving an
  interactive slide deck, executive board pack, lecture, documentary explainer,
  or presentation microsite; also use when the user mentions theme gallery,
  select theme, Orbit Data, Metric Board, or “make a PPT/deck”. Do not use for
  native PPTX unless paired with a PowerPoint skill.
---

# Interactive Presentation Deck

Build a presentation as a controlled sequence of visual states, not as a collection of unrelated pages. Keep the story model, scene layout, interaction contract, asset manifest, and QA evidence explicit so the same system can be reused for neuroscience, documentary, business, education, and other topics.

This skill is local-first. Preserve the existing framework, package manager, lockfile, and project structure. Do not publish or invoke hosting workflows unless the user explicitly requests deployment.

## Workflow

### 0. Theme Gallery gate (MANDATORY — do this first)

**Read and follow [theme-gallery-gate.md](references/theme-gallery-gate.md) immediately.**

For any new deck / “make a PPT” / board pack request:

1. Locate `theme-gallery/` (workspace root, or `decks/theme-gallery/`, or clone this skill’s GitHub repo).
2. Run `npm install` (if needed) and `npm run dev`.
3. Open the gallery URL for the user (same card grid + live previews as Content System).
4. **Stop.** Wait until they select a theme via **Use this theme →** / paste Copy instruction / name a theme — **or** explicitly say “you choose the theme.”

Do **not** invent a theme, skip the picker, or start building slides before that selection. AI auto-pick is allowed only when the user opts in.

**Do not** open an `AskQuestion` form first with topic options guessed from open files (e.g. “data-board-decks notes”, “Neuroscience web deck”). That is a skill failure. Gallery launch replaces that quiz.

### 1. Route the request

Treat these as separate targets:

- **Interactive web deck**: use this skill. It supports stateful navigation, browser fullscreen, notes, touch, and responsive layouts.
- **Native PPTX**: use the Presentations skill. Share the story and asset brief when useful, but do not force browser-only controls into PowerPoint.
- **Hybrid deliverable**: define one canonical content model, then implement separate web and PPTX renderers.

After the theme is locked, ask only the missing questions from [brief-intake.md](references/brief-intake.md). Default to a local interactive web deck, 16:9, keyboard navigation, editable HTML text, presenter notes, selective imagery, and no visible hosting step.

Select a scenario profile from [scenario-profiles.md](references/scenario-profiles.md). If the request spans profiles, choose one primary profile and borrow only the needed patterns from the others.

**Data / board / chart-led decks** (Orbit Data, Metric Board): also load [data-board-decks.md](references/data-board-decks.md). Lock Metric Board to light-only and Orbit Data to dark-only.

### 2. Inspect before editing

For an existing project, inspect `package.json`, the main page component, global styles, layout metadata, tests, image assets, and any hosting metadata. Preserve working architecture and existing assets unless the user asks for a migration.

Clone implementation patterns from the selected theme under `theme-gallery/app/themes/<id>/` (or `decks/theme-gallery/...`). Shared chart system: `app/lib/chartTokens.ts`, `app/components/charts/ThemeCharts.tsx`.

For an existing deck, document the current scene/state inventory before changing it. Do not silently remove keyboard shortcuts, reveals, notes, or touch behavior.

### 3. Create the brief and story model

Collect audience, purpose, duration, approximate state count, visual direction, image intensity, interaction level, source/citation needs, and responsive requirements. Translate the brief into a canonical `Deck` model with scenes and reveal states. Use stable scene IDs; never use array position as the only identity.

Use [content-patterns.md](references/content-patterns.md) to convert the subject into a narrative spine before choosing visual scenes. Do not let visual style decide the story order.

For board packs, default spine is in [data-board-decks.md](references/data-board-decks.md): ask → scorecard → growth → market → product → roadmap → finance → impact → GTM → risks → decision.

Prefer a scene model like:

```ts
type SceneKind = "hero" | "split" | "map" | "comparison" | "process" | "image" | "takeaway" | "sources" | "scorecard" | "evidence-chart" | "decision";

type Scene = {
  id: string;
  label: string;
  kind: SceneKind;
  title: string;
  subtitle?: string;
  reveals?: Array<{ id: string; title?: string; body?: string }>;
  image?: { src: string; alt: string; objectPosition?: string; role: "hero" | "support" | "diagram" };
  speakerNote?: string;
};
```

Represent cumulative reveals as `{ sceneId, revealIndex }` presentation states. Keep the scene heading and layout stable while revealing only the newly intended content.

### 4. Choose a composition, not a template

Use the scene library in [scene-library.md](references/scene-library.md). Prefer patterns from the **locked gallery theme** over inventing a new visual system.

For data/board decks, prefer insight + proof + chart + so-what compositions from [data-board-decks.md](references/data-board-decks.md). Fill the canvas; do not leave empty lower thirds.

Use the component boundaries in [component-architecture.md](references/component-architecture.md) and the visual rules in [visual-system.md](references/visual-system.md). Keep text in HTML/React for crispness and accessibility; keep generated artwork free of typography unless explicitly requested.

For sensitive or evidence-led subjects, apply [evidence-rules.md](references/evidence-rules.md) before writing visible claims.

### 5. Implement the interaction contract

Implement and test the contract in [interaction-contract.md](references/interaction-contract.md). At minimum support ArrowRight, Space, PageDown, ArrowLeft, PageUp, Home, End, `F` for fullscreen, and `N` for notes when those features are requested. Guard global key handlers when focus is inside a button, input, textarea, select, or editable element. Stop propagation from controls so a button click cannot also advance the deck.

**Theme gallery nav contract:** arrows / Space / control pill only — **no click-on-slide advance**.

Use a small, unobtrusive navigation shell: progress line, chapter label, compact state indicator, and optional hidden help/notes controls. Do not spend a large portion of the canvas on a persistent control bar.

### 6. Apply the image pipeline

Read [image-pipeline.md](references/image-pipeline.md) before adding generated or sourced images. Keep source artwork outside the public deployment directory, convert final raster assets to WebP, record dimensions and byte sizes in a manifest, and verify every reference. Use the bundled scripts when they fit the project:

```bash
./scripts/optimize-images.sh --project /absolute/path/to/project --quality 82
node ./scripts/generate-asset-manifest.mjs --dir /absolute/path/to/project/public/images --out /absolute/path/to/project/tmp/asset-manifest.json
```

For chart-led board decks, prefer Recharts evidence over decorative generated imagery unless the brief asks for both.

### 7. Prevent accidental overlap

Follow this strict layout rule: primary content uses CSS Grid/Flexbox; absolute positioning is reserved for backgrounds, scrims, fixed chrome, and explicitly intentional overlays. Define safe zones for header, content, footer, and notes. Every intentional overlap must be documented in the scene/component contract.

Use the layout audit approach in [qa-checklist.md](references/qa-checklist.md). If a composition cannot satisfy constraints, use [failure-handling.md](references/failure-handling.md).

### 8. Validate and hand off

Run the project build, lint, and tests. Then perform browser QA for keyboard boundaries, reveals, fullscreen, notes, click/touch behavior, reduced motion, and representative desktop/mobile viewports. Verify all scene states individually. Do not deploy unless explicitly requested.

For data/board decks, also verify: scorecard has no empty lower band; spark/area Y-axis starts at 0 when scale is absolute; pie/donut draw-in on slide entry; charts remount when the slide changes; light/dark matches the theme contract.

## Resources

Load only the reference that matches the current task:

- [theme-gallery-gate.md](references/theme-gallery-gate.md): **mandatory** launch + user theme selection before building.
- [brief-intake.md](references/brief-intake.md): user questions and safe defaults (after theme lock).
- [scenario-profiles.md](references/scenario-profiles.md): profile selection.
- [content-patterns.md](references/content-patterns.md): narrative spines.
- [data-board-decks.md](references/data-board-decks.md): Orbit / Metric Board / Recharts density rules.
- [component-architecture.md](references/component-architecture.md)
- [scene-library.md](references/scene-library.md)
- [visual-system.md](references/visual-system.md)
- [interaction-contract.md](references/interaction-contract.md)
- [image-pipeline.md](references/image-pipeline.md)
- [evidence-rules.md](references/evidence-rules.md)
- [qa-checklist.md](references/qa-checklist.md)
- [failure-handling.md](references/failure-handling.md)
- [examples.md](references/examples.md)

Bundled scripts: `scripts/optimize-images.sh`, `scripts/generate-asset-manifest.mjs`, `scripts/validate-assets.mjs`, `scripts/audit-layout.mjs`, `scripts/validate-deck-model.mjs`.

Public install repo (skill + gallery): https://github.com/vivekmishraishere/claude-web-deck-ppt
