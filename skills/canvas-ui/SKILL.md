---
name: canvas-ui
description: Creative WebGL and Canvas UI components using HTML-in-Canvas textures (Liquid, Glass, Frost, Flame, ASCII, Particle Reveal, Force Field, Peel, VHS, Shatter, Ripple, Dither). Use when asked for interactive liquid water ripple shaders, glass refraction, interactive WebGL DOM distortions, or creative shader wrappers via Shadcn registry.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Canvas UI (`@canvas-ui`) Creative WebGL Suite

Canvas UI is a 100% free and open-source library of creative WebGL and Canvas components that apply GPU shader distortions directly over live, interactive, accessible HTML.

## 📦 Component Installation (Shadcn Compatible)

Install individual components directly using the Shadcn CLI:

```bash
# Liquid WebGL Ripple Effect
npx shadcn@latest add @canvas-ui/liquid-react

# Glass / Frosted Refraction
npx shadcn@latest add @canvas-ui/glass-react
npx shadcn@latest add @canvas-ui/frost-react

# Particle & Text Effects
npx shadcn@latest add @canvas-ui/particle-reveal-react
npx shadcn@latest add @canvas-ui/decrypt-reveal-react

# Cyberpunk / Retro Shaders
npx shadcn@latest add @canvas-ui/glitch-react
npx shadcn@latest add @canvas-ui/vhs-react
npx shadcn@latest add @canvas-ui/laser-react
npx shadcn@latest add @canvas-ui/ascii-react

# Physics & Destruction
npx shadcn@latest add @canvas-ui/shatter-react
npx shadcn@latest add @canvas-ui/peel-react
npx shadcn@latest add @canvas-ui/ripple-react
npx shadcn@latest add @canvas-ui/force-field-react
```

---

## 🌊 1. Liquid React (`@canvas-ui/liquid-react`)

Wraps live HTML in dynamic, cursor-reactive liquid wave ripples.

```tsx
import React from 'react';
import { Liquid } from '@/components/canvasui/Liquid';

export function LiquidHero() {
  return (
    <Liquid
      intensity={0.6}
      speed={1.0}
      viscosity={0.8}
      color="#00ffcc"
      className="w-full h-full min-h-[400px] flex items-center justify-center"
    >
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Fluid WebGL Experience
        </h1>
        <p className="text-slate-400 mt-4 max-w-md">
          Live HTML treated as a WebGL texture with 100% clickability and text selection.
        </p>
      </div>
    </Liquid>
  );
}
```

---

## 🧊 2. Glass & Frost Refraction

```tsx
import { Glass } from '@/components/canvasui/Glass';
import { Frost } from '@/components/canvasui/Frost';

export function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <Glass
      ior={1.45}
      dispersion={0.05}
      blur={0.2}
      className="rounded-3xl border border-white/10 p-6 backdrop-blur-md"
    >
      {children}
    </Glass>
  );
}
```

---

## ⚡ 3. Cross-Skill Synergy Matrix

- **`canvas-ui` + `master-orchestrator`**: Triggered when a hero section or landing page requests fluid liquid water shaders, glass refraction, or creative WebGL textures.
- **`canvas-ui` + `shadcn`**: Seamlessly installed via `npx shadcn@latest add @canvas-ui/<component>`.
- **`canvas-ui` + `playwright`**: Verified with headless snapshots for GPU shader stability.
- **`canvas-ui` + `apple-design`**: Harmonized with Apple dark obsidian tokens.
