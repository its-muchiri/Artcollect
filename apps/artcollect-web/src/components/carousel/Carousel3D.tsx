"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import type { ShowcaseSeed } from "@/lib/showcase";
import { showcaseKindLabel } from "@/lib/showcase";

/**
 * The Main Wall's 3D ring carousel (docs/11-style continuation).
 *
 * One cylinder of canvas-textured card planes — art, events, causes —
 * that the visitor can drag to spin (with inertia) and click to enter.
 * Auto-rotates slowly while visible. Performance discipline per docs/11:
 * this canvas only mounts when the wrapper decides WebGL is allowed, runs
 * a DEMAND frameloop that is invalidated only while the section is
 * actually on screen (`active` prop flips it to "never" when scrolled
 * away), textures are disposed on unmount, and every card's meaning is
 * mirrored in the wrapper's screen-reader link list.
 */

const CARD_W = 2.35;
const CARD_H = 1.72;
const TEX_W = 640;
const TEX_H = 480;

const INK = "#161311";
const PAPER = "#F5F1E8";
const KIND_COLORS: Record<string, { fill: string; text: string }> = {
  art: { fill: "#E8442E", text: INK },
  event: { fill: "#1F4FD8", text: PAPER },
  cause: { fill: "#A4C639", text: INK },
};

/** Non-indexed fallback so `noUncheckedIndexedAccess` keeps `kind` defined. */
const FALLBACK_KIND = { fill: "#E8442E", text: INK } as const;

const FONT_FALLBACK = "Impact, 'Arial Narrow', sans-serif";

function canvasFont(weight: string, sizePx: number): string {
  if (typeof document === "undefined") return `${weight} ${sizePx}px ${FONT_FALLBACK}`;
  const probe = document.createElement("span");
  probe.style.fontFamily = "var(--font-display)";
  probe.style.display = "none";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || FONT_FALLBACK;
  probe.remove();
  return `${weight} ${sizePx}px ${family}`;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = candidate;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  return lines;
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  item: ShowcaseSeed,
  image: HTMLImageElement | null,
): void {
  const kind = KIND_COLORS[item.kind] ?? FALLBACK_KIND;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, TEX_W - 16, TEX_H - 16);

  // Image region (cover-fit), fallback palette block while loading.
  const imgY = 26;
  const imgH = 268;
  if (image) {
    const scale = Math.max(TEX_W / image.width, imgH / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(26, imgY, TEX_W - 52, imgH);
    ctx.clip();
    ctx.drawImage(image, 26 + (TEX_W - 52 - w) / 2, imgY + (imgH - h) / 2, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = "#EAE2D0";
    ctx.fillRect(26, imgY, TEX_W - 52, imgH);
    ctx.fillStyle = kind.fill;
    ctx.fillRect(26, imgY + imgH - 10, TEX_W - 52, 10);
  }

  // Kind chip.
  const label = showcaseKindLabel(item.kind);
  ctx.font = canvasFont("700", 26);
  const chipW = 28 + ctx.measureText(label).width;
  ctx.fillStyle = kind.fill;
  ctx.fillRect(26, 318, chipW, 44);
  ctx.fillStyle = kind.text;
  ctx.fillText(label, 40, 348);

  // Title (up to two lines) + subtitle.
  ctx.fillStyle = INK;
  ctx.font = canvasFont("400", 44);
  const lines = wrapLines(ctx, item.title.toUpperCase(), TEX_W - 60, 2);
  lines.forEach((line, i) => ctx.fillText(line, 32, 416 + i * 46));
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(22,19,17,0.65)";
  const sub = wrapLines(ctx, item.subtitle, TEX_W - 60, 1)[0];
  if (sub) ctx.fillText(sub, 32, Math.min(TEX_H - 22, 418 + lines.length * 46));
}

function useCardTexture(item: ShowcaseSeed): THREE.CanvasTexture {
  // Stable per item — the canvas + texture live for the card's lifetime.
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = TEX_W;
    canvas.height = TEX_H;
    const ctx = canvas.getContext("2d");
    if (ctx) drawCard(ctx, item, null);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.userData.canvas = canvas;
    tex.userData.item = item;
    return tex;
    // item identity is stable (server-rendered list); rebuild only per item.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.key]);

  useEffect(() => {
    let cancelled = false;
    if (!item.image) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      const canvas = texture.userData.canvas as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");
      if (ctx) drawCard(ctx, item, image);
      texture.needsUpdate = true;
    };
    image.src = item.image;
    return () => {
      cancelled = true;
    };
  }, [item, texture]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return texture;
}

/** Ring geometry, shared by the camera rig and the cards. */
export function computeRing(count: number): { radius: number; step: number } {
  const n = Math.max(count, 1);
  return {
    radius: Math.max(3.4, (n * CARD_W) / (2 * Math.PI) + 1.15),
    step: (Math.PI * 2) / n,
  };
}

function Ring({
  items,
  radius,
  step,
}: {
  items: ShowcaseSeed[];
  radius: number;
  step: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const baseAngle = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const hovering = useRef(false);
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null);
  const travel = useRef(0);
  const { invalidate } = useThree();
  const router = useRouter();

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);

    if (!dragging.current) {
      // Inertia decay, then the slow idle spin (paused while hovering).
      if (Math.abs(velocity.current) > 0.02) {
        baseAngle.current += velocity.current * dt;
        velocity.current *= Math.pow(0.9, dt * 60);
      } else {
        velocity.current = 0;
        if (!hovering.current) baseAngle.current += 0.12 * dt;
      }
      group.rotation.y = baseAngle.current;
    }

    invalidate();
  });

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    dragging.current = true;
    travel.current = 0;
    lastPointer.current = { x: event.clientX, y: event.clientY, t: performance.now() };
    (event.target as Element | null)?.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || !lastPointer.current) return;
    const dx = event.clientX - lastPointer.current.x;
    travel.current += Math.abs(dx) + Math.abs(event.clientY - lastPointer.current.y);
    baseAngle.current += dx * 0.005;
    velocity.current = dx * 0.005 * 60 * 0.35; // per-second inertia seed
    if (groupRef.current) groupRef.current.rotation.y = baseAngle.current;
    lastPointer.current = { x: event.clientX, y: event.clientY, t: performance.now() };
    invalidate();
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    dragging.current = false;
    (event.target as Element | null)?.releasePointerCapture?.(event.pointerId);
    // A still hand = a click: step inside the card you were touching.
    if (travel.current < 6 && performance.now() - (lastPointer.current?.t ?? 0) < 600) {
      const index = event.object?.userData?.itemIndex as number | undefined;
      const item = index !== undefined ? items[index] : undefined;
      if (item) router.push(item.href);
    }
    lastPointer.current = null;
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerOver={() => {
        hovering.current = true;
        document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        hovering.current = false;
        document.body.style.cursor = "";
      }}
    >
      {items.map((item, i) => (
        <Card
          key={item.key}
          item={item}
          index={i}
          radius={radius}
          step={step}
          baseAngle={baseAngle}
        />
      ))}
      {/* Soft ink pool under the ring. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.16, 0]}>
        <circleGeometry args={[radius * 0.92, 48]} />
        <meshBasicMaterial color={INK} transparent opacity={0.08} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Card({
  item,
  index,
  radius,
  step,
  baseAngle,
}: {
  item: ShowcaseSeed;
  index: number;
  radius: number;
  step: number;
  /** The ring's shared rotation state (owned by `Ring`; children only read it). */
  baseAngle: React.MutableRefObject<number>;
}) {
  const texture = useCardTexture(item);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const facingBase = step * index;

  // Depth cue, per card: facing the camera = full-bright and lifted a touch.
  useFrame(() => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;
    const factor = Math.max(0, Math.cos(facingBase + baseAngle.current));
    material.color.setScalar(0.66 + 0.34 * factor);
    mesh.position.y = 0.07 * factor;
  });

  const angle = step * index;

  return (
    <mesh
      ref={meshRef}
      position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
      rotation={[0, angle, 0]}
      userData={{ itemIndex: index }}
    >
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial ref={materialRef} map={texture} toneMapped={false} side={THREE.FrontSide} />
    </mesh>
  );
}

/**
 * The ring itself. `active` (visible on screen) keeps the demand frameloop
 * ticking; scrolled away it flips to "never" and costs literally nothing.
 */
export default function Carousel3D({ items, active }: { items: ShowcaseSeed[]; active: boolean }) {
  const { radius } = computeRing(items.length);
  return (
    <Canvas
      className="touch-none select-none"
      camera={{ position: [0, 1.05, radius + 3.1], fov: 44 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
      frameloop={active ? "demand" : "never"}
      style={{ touchAction: "pan-y", cursor: "grab" }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0.05, 0);
      }}
    >
      <Ring items={items} radius={radius} step={computeRing(items.length).step} />
    </Canvas>
  );
}
