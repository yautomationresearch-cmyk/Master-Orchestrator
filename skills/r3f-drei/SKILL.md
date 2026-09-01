---
name: r3f-drei
description: Collection of 150+ productivity helpers for React Three Fiber (@react-three/drei). Use when implementing 3D camera controls (OrbitControls, PresentationControls), realistic lighting/environments (Environment, Stage, Sky, Stars, Sparkles), floating physics (Float), HTML inside 3D (Html), 3D typography (Text, Text3D), and high-end materials (MeshReflectorMaterial, MeshTransmissionMaterial).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# React Three Fiber Drei Helper Suite (`@react-three/drei`)

`@react-three/drei` is the essential toolkit for building declarative 3D scenes in React Three Fiber.

## 📦 Installation

```bash
npm install three @react-three/fiber @react-three/drei
```

---

## 💎 1. Floating Glass Card with Dynamic Environment & Sparkles

```tsx
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Float,
  Environment,
  Sparkles,
  MeshReflectorMaterial,
  PresentationControls,
  ContactShadows,
  Html
} from '@react-three/drei';

export function Modern3DShowcase() {
  return (
    <div className="w-full h-[600px] bg-neutral-950 rounded-3xl overflow-hidden relative">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        {/* Soft Ambient & Directional Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        {/* Constrained Interactive Orbit / Drag */}
        <PresentationControls
          global
          snap
          speed={1.5}
          zoom={0.8}
          polar={[-0.1, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          {/* Floating Kinetic Object */}
          <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[2, 2, 0.2]} />
              <meshStandardMaterial
                color="#00f0ff"
                metalness={0.8}
                roughness={0.1}
                envMapIntensity={1.2}
              />
              {/* HTML Pin inside 3D Object */}
              <Html position={[0, 0, 0.12]} transform occlude>
                <div className="bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white text-center w-40 select-none">
                  <h4 className="font-bold text-sm">Interactive 3D</h4>
                  <p className="text-xs text-neutral-400">R3F + Drei</p>
                </div>
              </Html>
            </mesh>
          </Float>
        </PresentationControls>

        {/* Ambient Sparkles */}
        <Sparkles count={50} scale={6} size={2} speed={0.4} color="#00f0ff" />

        {/* Ground Reflection & Soft Shadow */}
        <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mixBlur={1}
            mixStrength={40}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#101010"
            metalness={0.5}
            mirror={0}
          />
        </mesh>
        <ContactShadows position={[0, -1.19, 0]} opacity={0.6} scale={10} blur={2} />

        {/* Studio HDR Lighting Preset */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
```

---

## ⚡ 2. Common Drei Recipes
- **`<OrbitControls />`**: Free rotation, damping, zoom limit.
- **`<PresentationControls />`**: Elastic bounce-back rotation for product showcases.
- **`<Text />` & `<Text3D />`**: Troika-three-text GPU text rendering with outline & glow.
- **`<MeshTransmissionMaterial />`**: Apple-grade volumetric frosted glass refraction.
- **`<Stage />`**: 1-line studio lighting setup with automatic bounds center.
