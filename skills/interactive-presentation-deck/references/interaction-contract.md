# Interaction contract

Implement navigation as a pure state transition layer. Rendering should consume the active state; it should not contain separate navigation logic for each scene.

## Required behavior

```text
ArrowRight / Space / PageDown → next reveal or scene
ArrowLeft / PageUp            → previous reveal or scene
Home                          → first state
End                           → final state
F                             → enter/exit fullscreen
N                             → open/close presenter notes
Escape                        → close notes, then exit fullscreen
```

Click/tap may advance from the presentation surface. Touch swipe should use a deliberate threshold and should not trigger a second navigation after the gesture is handled.

## Guardrails

- Clamp navigation at the first and final state.
- Prevent default browser behavior for handled keys.
- Ignore global shortcuts while focus is inside `button`, `input`, `textarea`, `select`, or `[contenteditable="true"]`.
- Stop pointer propagation from headers, footers, notes, menus, and controls.
- Keep focus indicators visible.
- Reflect the active state with `aria-current` or an equivalent accessible status.
- Make `prefers-reduced-motion` disable blur, scale, and long transitions.
- Catch rejected fullscreen requests; do not leave the UI in a false fullscreen state.
- Close a notes panel without advancing the scene.

## State model

Use a derived state list or explicit reducer. For cumulative reveals, `next` should advance the reveal index before moving to the next scene. `previous` should reverse that order. Persisting state in the URL hash is optional but useful for deep links and testing.

## Progressive disclosure

Each reveal must add one meaningful teaching unit. Do not animate five unrelated UI cards simultaneously and call it interactivity. Keep the heading and major geometry stable across reveals unless the user explicitly wants a transformation.
