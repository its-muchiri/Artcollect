"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type Lenis from "lenis";
import { useLenis } from "@/hooks/useLenis";
import { heroState } from "@/lib/hero-state";

/**
 * The collage diorama hero scene (docs/11 Phase 2).
 *
 * This extends the retired global `SceneCanvas` pattern — camera, lights,
 * Lenis-instance-as-prop, a shared mutable state bus read in `useFrame` —
 * into a hero-SCOPED layered diorama: photo/cutout planes at different Z
 * depths that (a) fly in from off-screen, driven by the same scrub
 * progress `CollageHero`'s ScrollTrigger timeline publishes, and (b)
 * parallax continuously against pointer movement and page scroll. It is
 * never a global fixed background: it mounts inside the hero section,
 * dynamically (`ssr: false`), only on tablet-and-up, only after the DOM
 * poster has painted, and never at all under reduced motion — in every
 * fallback case the DOM collage IS the poster.
 */

/** The assembled (final) layout of the diorama planes. */
interface PlaneSpec {
  src: string;
  alt: string;
  /** Assembled position; scattered start is derived from `scatter`. */
  position: [number, number, number];
  size: [number, number];
  /** Assembled z-rotation in radians. */
  rotation: number;
  /** Off-screen scatter offset at progress 0 (x, y in world units). */
  scatter: [number, number];
  /** Parallax weight — larger moves more (foreground). */
  depth: number;
  /** Palette fill used until (or instead of) the photo texture. */
  fallbackColor: string;
}

const SPECS: PlaneSpec[] = [
  {
    src: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=70",
    alt: "",
    position: [2.6, 0.9, -2.2],
    size: [2.4, 3.0],
    rotation: 0.08,
    scatter: [-14, 6],
    depth: 0.55,
    fallbackColor: "#e8442e",
  },
  {
    src: "https://images.unsplash.com/photo-1549289524-06cf8837ace5?auto=format&fit=crop&w=800&q=70",
    alt: "",
    position: [-3.0, -0.6, -1.6],
    size: [2.6, 1.9],
    rotation: -0.1,
    scatter: [13, -7],
    depth: 0.7,
    fallbackColor: "#1f4fd8",
  },
  {
    src: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=70",
    alt: "",
    position: [3.1, -1.5, -0.8],
    size: [1.7, 2.2],
    rotation: -0.07,
    scatter: [15, 8],
    depth: 0.9,
    fallbackColor: "#a4c639",
  },
  {
    src: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=800&q=70",
    alt: "",
    position: [-2.4, 1.6, -3.0],
    size: [2.0, 1.4],
    rotation: 0.12,
    scatter: [-12, -9],
    depth: 0.4,
    fallbackColor: "#e93a8f",
  },
];

/** Front-of-diorama flat palette shapes (vector-lane accents, depth-frozen). */
function AccentShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const { pointerX, pointerY, assembleProgress } = heroState;
    const drift = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    group.position.x = pointerX * 0.5 + drift;
    group.position.y = pointerY * 0.35 + assembleProgress * 0.4;
    group.rotation.z = assembleProgress * 0.25;
  });

  return (
    <group ref={groupRef}>
      {/* Coral disc */}
      <mesh position={[3.6, -1.9, 0.6]}>
        <circleGeometry args={[0.55, 48]} />
        <meshBasicMaterial color="#e8442e" />
      </mesh>
      {/* Cobalt ring */}
      <mesh position={[-3.7, 1.9, 0.4]}>
        <ringGeometry args={[0.28, 0.44, 48]} />
        <meshBasicMaterial color="#1f4fd8" side={THREE.DoubleSide} />
      </mesh>
      {/* Lime pixel-ish square */}
      <mesh position={[-3.3, -1.8, 0.8]} rotation={[0, 0, 0.6]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial color="#a4c639" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PhotoPlane({ spec }: { spec: PlaneSpec }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Imperative texture load (no suspense): the plane renders as a flat
  // palette-colored cutout until (or if) the photo arrives, so the scene
  // is never blank while assets load.
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      spec.src,
      (loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = THREE.SRGBColorSpace;
        setTexture(loaded);
      },
      undefined,
      () => {
        /* load failure keeps the flat fallback color — by design */
      },
    );
    return () => {
      cancelled = true;
    };
  }, [spec.src]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  // Scattered start = assembled position + scatter offset + extra spin.
  const scatteredX = spec.position[0] + spec.scatter[0];
  const scatteredY = spec.position[1] + spec.scatter[1];

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const p = heroState.assembleProgress;
    const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic, matches the DOM scrub's feel

    // Fly in from the scatter point to the assembled position.
    mesh.position.x = THREE.MathUtils.lerp(scatteredX, spec.position[0], eased);
    mesh.position.y = THREE.MathUtils.lerp(scatteredY, spec.position[1], eased);
    mesh.position.z = spec.position[2];
    mesh.rotation.z = THREE.MathUtils.lerp(spec.rotation + (spec.scatter[0] > 0 ? 0.9 : -0.9), spec.rotation, eased);

    // Continuous pointer parallax, weighted by depth (foreground moves more).
    mesh.position.x += heroState.pointerX * spec.depth * 0.45;
    mesh.position.y += heroState.pointerY * spec.depth * 0.3;
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, spec.rotation]}>
      <planeGeometry args={[spec.size[0], spec.size[1]]} />
      <meshStandardMaterial
        map={texture ?? undefined}
        color={texture ? "#ffffff" : spec.fallbackColor}
        roughness={0.92}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#fff6e8" />
      <directionalLight position={[-4, -2, 2]} intensity={0.3} color="#e8e2d4" />
    </>
  );
}

/** Drifts the whole diorama against scroll; reads Lenis imperatively. */
function ScrollDrift({ lenis }: { lenis: Lenis | null }) {
  useFrame((state) => {
    // A gentle whole-scene counter-drift as the page scrolls, layered on
    // top of the per-plane assembly so the diorama never feels glued to
    // the viewport. Read fresh off the Lenis instance each frame (the
    // same pattern the old SceneCanvas used) — no React state involved.
    const progress = lenis?.progress ?? 0;
    state.camera.position.y = Math.sin(progress * Math.PI) * 0.25;
    state.camera.rotation.z = heroState.pointerX * 0.012;
    state.camera.position.x = heroState.pointerX * 0.18;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function CollageHeroCanvas() {
  const lenis = useLenis();

  const dpr = useMemo<[number, number]>(() => [1, 1.75], []);

  return (
    <Canvas
      className="pointer-events-none absolute inset-0 z-0"
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      dpr={dpr}
    >
      <SceneLights />
      <ScrollDrift lenis={lenis} />
      {SPECS.map((spec) => (
        <PhotoPlane key={spec.src} spec={spec} />
      ))}
      <AccentShapes />
    </Canvas>
  );
}
