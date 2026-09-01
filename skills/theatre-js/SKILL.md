---
name: theatre-js
description: Visual keyframe motion design and timeline choreography for Three.js and React Three Fiber (@theatre/core, @theatre/studio, @theatre/r3f). Use when orchestrating cinematic 3D camera flythroughs, multi-stage product assembly reveals, and syncing 3D motion with GSAP or scroll position.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Theatre.js Cinematic Motion Suite (`@theatre/core`)

Theatre.js provides a professional timeline animation system for WebGL and DOM, enabling complex multi-track keyframing like After Effects directly inside the browser.

## 📦 Installation

```bash
npm install @theatre/core @theatre/r3f
npm install -D @theatre/studio
```

---

## 🎬 1. Basic Theatre.js R3F Project Setup

```tsx
import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { getProject, types } from '@theatre/core';
import studio from '@theatre/studio';
import { editable as e, SheetProvider, PerspectiveCamera } from '@theatre/r3f';

// Initialize visual studio only in development
if (process.env.NODE_ENV === 'development') {
  studio.initialize();
}

const demoSheet = getProject('ProductShowcase').getSheet('MainScene');

export function Cinematic3DScene() {
  useEffect(() => {
    // Play the sequence on mount or sync with scroll
    demoSheet.project.ready.then(() => {
      demoSheet.sequence.play({ iterationCount: Infinity, range: [0, 5] });
    });
  }, []);

  return (
    <div className="w-full h-screen bg-black">
      <Canvas>
        <SheetProvider sheet={demoSheet}>
          <PerspectiveCamera
            theatreKey="Camera"
            makeDefault
            position={[0, 0, 5]}
            fov={60}
          />
          <ambientLight intensity={0.5} />
          <e.pointLight theatreKey="KeyLight" position={[10, 10, 10]} />
          
          <e.mesh theatreKey="Product">
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </e.mesh>
        </SheetProvider>
      </Canvas>
    </div>
  );
}
```

---

## 📜 2. Syncing Theatre.js Timelines to Scroll (GSAP / Lenis)

```tsx
import { useEffect } from 'react';
import { getProject } from '@theatre/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useTheatreScrollSync(sheetName: string, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const project = getProject('ProductShowcase');
    const sheet = project.getSheet(sheetName);

    project.ready.then(() => {
      const sequenceLength = sheet.sequence.length;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          // Map scroll progress (0-1) to Theatre sequence position
          sheet.sequence.position = self.progress * sequenceLength;
        },
      });
    });
  }, [sheetName, containerRef]);
}
```
