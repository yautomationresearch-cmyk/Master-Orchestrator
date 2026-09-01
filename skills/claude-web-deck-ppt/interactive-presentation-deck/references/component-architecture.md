# Component architecture

Keep the presentation decomposed into reusable components. Prefer a small stable shell and scene-specific content over one giant component full of unrelated absolute coordinates.

## Recommended boundaries

```text
DeckApp
├── PresentationShell
│   ├── ProgressTrack
│   ├── DeckHeader
│   ├── SceneViewport
│   ├── PresenterNotes
│   └── DeckFooter
├── SceneRenderer
│   ├── HeroScene
│   ├── SplitScene
│   ├── MapRevealScene
│   ├── ComparisonScene
│   ├── ProcessScene
│   ├── ImageScene
│   ├── TakeawayScene
│   └── SourcesScene
└── shared
    ├── BackgroundImage
    ├── Eyebrow
    ├── SourceLabel
    ├── RevealItem
    └── KeyboardHelp
```

## Responsibilities

- `DeckApp`: owns the canonical deck model, active state, and global event wiring.
- `PresentationShell`: owns safe zones, chrome, pointer behavior, and accessibility landmarks.
- `SceneRenderer`: selects a scene component by `kind`; it should not contain slide-specific copy.
- Scene components: own content layout and intentional overlap declarations.
- `BackgroundImage`: owns `src`, `alt`, `objectPosition`, loading behavior, and image role.
- `PresenterNotes`: owns notes visibility and focus behavior; it must not advance the deck when clicked.

## State separation

Keep these separate:

```ts
type NavigationState = { sceneIndex: number; revealIndex: number };
type UiState = { notesOpen: boolean; helpOpen: boolean; fullscreen: boolean };
```

Do not use UI state to determine the story state. Do not duplicate slide content in keyboard handlers.

## CSS rules

- Use named layout classes such as `.scene--hero`, `.scene--split`, and `.scene--map`.
- Use CSS variables for spacing, typography, color, and safe zones.
- Use Grid/Flexbox for content relationships.
- Use `position: absolute` only for backgrounds, scrims, fixed chrome, or documented overlays.
- Keep z-index values in a small documented scale: background, scrim, content, chrome, modal.
- Give every interactive control an accessible label and visible focus state.
