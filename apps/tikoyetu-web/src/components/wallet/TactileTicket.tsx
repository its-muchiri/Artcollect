"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

export interface TactileTicketProps {
  title: string;
  tierName: string;
  /** Special editions get the procedural holographic-foil treatment. */
  foil: boolean;
}

const INK = "#161311";
const PAPER = "#F5F1E8";
const LIME = "#A4C639";
const MARKER = "#B23A2E";

/** Resolves the app's poster font (next/font var) for canvas typography. */
function posterFontFamily(weight: string, sizePx: number): string {
  const probe = document.createElement("span");
  probe.style.fontFamily = "var(--font-poster)";
  probe.style.display = "none";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || "Impact, sans-serif";
  probe.remove();
  return `${weight} ${sizePx}px ${family}`;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

/** Draws the ticket face — the exact same design as the static poster fallback. */
function makeTicketTexture(title: string, tierName: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 448;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, 1024, 448);

    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.strokeRect(22, 22, 980, 404);

    // Perforation between body and stub.
    ctx.setLineDash([4, 18]);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(780, 40);
    ctx.lineTo(780, 408);
    ctx.stroke();
    ctx.setLineDash([]);

    // Wordmark + title.
    ctx.fillStyle = INK;
    ctx.font = posterFontFamily("700", 34);
    ctx.fillText("TIKOYETU", 56, 104);

    ctx.font = posterFontFamily("400", 76);
    const lines = wrapText(ctx, title.toUpperCase(), 640);
    lines.forEach((line, i) => ctx.fillText(line, 56, 210 + i * 84));

    // Tier chip.
    ctx.fillStyle = LIME;
    ctx.fillRect(56, 330, Math.min(360, 60 + tierName.length * 22), 62);
    ctx.fillStyle = INK;
    ctx.font = posterFontFamily("400", 40);
    ctx.fillText(tierName.toUpperCase(), 76, 372);

    // QR-ish pixel block in the stub.
    ctx.fillStyle = INK;
    for (const [x, y] of [[820, 90], [852, 90], [884, 122], [820, 154], [868, 186]] as const) {
      ctx.fillRect(x, y, 32, 32);
    }
    ctx.fillRect(812, 82, 140, 140);
    ctx.fillStyle = PAPER;
    for (const [x, y] of [[852, 122], [884, 90], [820, 122]] as const) {
      ctx.fillRect(x, y, 32, 32);
    }
    ctx.fillStyle = MARKER;
    ctx.fillRect(852, 154, 32, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Procedural holographic foil — view-angle Fresnel rim, no HDRI needed. */
const FOIL_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FOIL_FRAGMENT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.0);
    vec3 lime = vec3(0.643, 0.776, 0.224);
    vec3 pink = vec3(0.914, 0.227, 0.561);
    vec3 cobalt = vec3(0.122, 0.310, 0.847);
    vec3 color = mix(lime, pink, smoothstep(0.05, 0.55, fresnel));
    color = mix(color, cobalt, smoothstep(0.55, 1.0, fresnel));
    gl_FragColor = vec4(color, fresnel * 0.85 + 0.04);
  }
`;

function TicketMesh({ title, tierName, foil }: TactileTicketProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: -0.12, y: 0.35 });
  const dragging = useRef(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const { invalidate } = useThree();

  const texture = useMemo(() => makeTicketTexture(title, tierName), [title, tierName]);
  const foilUniforms = useMemo(() => ({}), []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    // Spring-lerp toward the drag target; keep rendering one more frame
    // while settling so the demand-driven loop comes to rest exactly.
    const settleX = targetRotation.current.x - group.rotation.x;
    const settleY = targetRotation.current.y - group.rotation.y;
    if (Math.abs(settleX) > 0.0005 || Math.abs(settleY) > 0.0005) {
      group.rotation.x += settleX * 0.14;
      group.rotation.y += settleY * 0.14;
      invalidate();
    } else {
      group.rotation.x = targetRotation.current.x;
      group.rotation.y = targetRotation.current.y;
    }
  });

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      dragging.current = true;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      (event.target as Element)?.setPointerCapture?.(event.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!dragging.current || !lastPointer.current) return;
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      targetRotation.current.y = THREE.MathUtils.clamp(
        targetRotation.current.y + dx * 0.006,
        -0.9,
        0.9,
      );
      targetRotation.current.x = THREE.MathUtils.clamp(
        targetRotation.current.x - dy * 0.006,
        -0.6,
        0.6,
      );
      invalidate();
    },
    [invalidate],
  );

  const endDrag = useCallback(() => {
    dragging.current = false;
    lastPointer.current = null;
    // Ease back to the resting presentation tilt.
    targetRotation.current = { x: -0.12, y: 0.35 };
    invalidate();
  }, [invalidate]);

  return (
    <group ref={groupRef} rotation={[-0.12, 0.35, 0]}>
      {/* Ticket body */}
      <mesh
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <boxGeometry args={[3.6, 1.6, 0.07]} />
        <meshStandardMaterial map={texture} roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Holographic foil skin — only on special editions. */}
      {foil && (
        <mesh scale={[1.002, 1.002, 1.01]}>
          <boxGeometry args={[3.6, 1.6, 0.07]} />
          <shaderMaterial
            vertexShader={FOIL_VERTEX}
            fragmentShader={FOIL_FRAGMENT}
            uniforms={foilUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * The tactile 3D ticket (docs/11 Phase 6). One mesh, one optional foil
 * skin, a canvas-generated face texture, pointer-drag tilt, and a
 * demand-driven render loop (frames render only while settling or being
 * dragged — at rest it costs nothing). No HDRI, no postprocessing, no
 * troika text. The wallet stays fully functional without it: the static
 * poster (TicketShowcase) and the QR cards carry all information.
 */
export default function TactileTicket(props: TactileTicketProps) {
  return (
    <Canvas
      className="touch-none select-none"
      camera={{ position: [0, 0, 4.4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      frameloop="demand"
      style={{ cursor: "grab", touchAction: "none" }}
    >
      <ambientLight intensity={0.95} />
      <directionalLight position={[3, 4, 6]} intensity={1.2} color="#fff6e8" />
      <TicketMesh {...props} />
    </Canvas>
  );
}
