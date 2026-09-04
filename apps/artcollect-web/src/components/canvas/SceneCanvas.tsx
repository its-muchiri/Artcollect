"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type Lenis from "lenis";
import { useLenis } from "@/hooks/useLenis";
import { scrollState } from "@/lib/scroll-state";

interface ScrollDrivenMeshProps {
  /**
   * The live Lenis instance, passed down as a prop rather than read via
   * `useLenis()` from inside `<Canvas>`. R3F mounts `<Canvas>`'s children
   * on a *separate* reconciler root (its own custom Three.js renderer, not
   * ReactDOM), so a React Context provided above `<Canvas>` does not
   * automatically cross that boundary. Reading the instance once here, in
   * `SceneCanvas` (a normal DOM-tree component, above/outside the canvas
   * boundary), and passing it down as a plain prop sidesteps that
   * limitation entirely — the Lenis instance itself is a stable, mutable
   * object, so reading `lenis.progress` fresh inside `useFrame` every frame
   * is always up to date regardless of React re-renders.
   */
  lenis: Lenis | null;
}

/** Central interactive mesh: a torus knot whose motion/material react to scroll depth. */
function ScrollDrivenMesh({ lenis }: ScrollDrivenMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    // Global page scroll progress (0-1), read straight off the Lenis
    // instance every frame — no React state, no context lookup inside the
    // canvas.
    const pageProgress = lenis?.progress ?? 0;

    // Local progress through the pinned showcase section, written by
    // PinnedShowcase's ScrollTrigger `onUpdate`. See `scroll-state.ts`.
    const showcaseProgress = scrollState.showcaseProgress;

    // Idle rotation (time-based) layered with scroll-driven rotation, so
    // the object never looks fully static even while scroll is idle.
    mesh.rotation.x += delta * 0.08;
    mesh.rotation.y = pageProgress * Math.PI * 4 + state.clock.elapsedTime * 0.05;

    // Gentle vertical float.
    mesh.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;

    // Push the object back in depth as the user scrolls, and pull it
    // forward again while the pinned showcase is active for emphasis.
    const targetZ = THREE.MathUtils.lerp(0, -2.5, pageProgress);
    const showcasePunch = scrollState.showcaseActive ? showcaseProgress * 1.2 : 0;
    mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, targetZ + showcasePunch, 0.08);

    // Cross from a solid material into wireframe as the pinned showcase
    // progresses — a synchronized DOM-pin -> WebGL-material change.
    material.wireframe = showcaseProgress > 0.5;

    // Color drifts from violet to cyan across total page progress.
    const from = new THREE.Color("#8b5cf6");
    const to = new THREE.Color("#22d3ee");
    material.color.copy(from).lerp(to, pageProgress);
    material.emissive.copy(material.color).multiplyScalar(0.25);
  });

  return (
    <mesh ref={meshRef} scale={1.4}>
      <torusKnotGeometry args={[1, 0.32, 200, 24]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#8b5cf6"
        roughness={0.25}
        metalness={0.6}
        emissive="#8b5cf6"
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

/** Lighting rig — kept separate so `SceneCanvas` stays declarative. */
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 5]} intensity={1.4} color="#c4b5fd" />
      <pointLight position={[-5, -3, -4]} intensity={0.8} color="#22d3ee" />
    </>
  );
}

/**
 * Full-bleed background WebGL canvas.
 *
 * Positioned via an explicit `style` object rather than the `fixed inset-0`
 * Tailwind classes alone: R3F's `<Canvas>` sets `position: 'relative'` (and
 * `width`/`height: 100%`) as an *inline* style by default, and inline
 * styles win over class-based utilities regardless of source order. The
 * `className` below only carries utilities that don't collide with that
 * default inline style (`pointer-events-none`, `z-0`); positioning is set
 * explicitly to guarantee it actually takes effect.
 */
export function SceneCanvas() {
  const lenis = useLenis();

  return (
    <Canvas
      className="pointer-events-none z-0"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <SceneLights />
      <ScrollDrivenMesh lenis={lenis} />
      <Sparkles count={200} scale={12} size={2} speed={0.3} color="#a78bfa" opacity={0.6} />
    </Canvas>
  );
}
