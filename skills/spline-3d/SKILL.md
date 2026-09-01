---
name: spline-3d
description: Integrate interactive Spline 3D scenes (@splinetool/react-spline, @splinetool/runtime) into React/Next.js web applications. Use when building interactive 3D hero moments, mouse-following 3D characters/objects, glass/metallic floating elements, or triggering Spline events on scroll and click.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Spline 3D Integration Suite (`@splinetool/react-spline`)

Spline allows designers and developers to create lightweight, interactive 3D scenes in the browser and embed them into React/Next.js web apps with full event handling, mouse tracking, and responsive scaling.

## 📦 Installation

```bash
npm install @splinetool/react-spline @splinetool/runtime
```

---

## 🎨 1. Basic Interactive Spline Hero

```tsx
import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

export function SplineHero() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden rounded-3xl bg-neutral-950">
      <Suspense
        fallback={
          <div className="flex items-center justify-center text-neutral-500">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <Spline
          scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
          className="w-full h-full pointer-events-auto"
        />
      </Suspense>
    </div>
  );
}
```

---

## ⚡ 2. Controlling Spline Objects & Triggering Events via Ref

```tsx
import React, { useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';

export function InteractiveSplineWidget() {
  const splineRef = useRef<Application | null>(null);

  function onLoad(splineApp: Application) {
    splineRef.current = splineApp;
  }

  function triggerHoverAction() {
    if (splineRef.current) {
      // Find object by name and trigger state/variable
      const cube = splineRef.current.findObjectByName('Cube');
      if (cube) {
        splineRef.current.emitEvent('mouseHover', 'Cube');
      }
    }
  }

  return (
    <div onMouseEnter={triggerHoverAction} className="w-full h-96">
      <Spline
        scene="https://prod.spline.design/your-scene/scene.splinecode"
        onLoad={onLoad}
      />
    </div>
  );
}
```

---

## 🎯 Best Practices for Web Performance
- **Lazy Loading**: Always wrap `<Spline />` inside React `<Suspense />` or dynamic `next/dynamic` with `ssr: false` to avoid SSR hydration mismatches.
- **Pointer Events**: Use `pointer-events-none` on background layers and `pointer-events-auto` on interactive focal objects to prevent blocking scroll gestures.
- **Mobile Fallback**: Render a static WebP screenshot or video loop fallback on low-end mobile devices ($\le 2\text{GB}$ RAM).
