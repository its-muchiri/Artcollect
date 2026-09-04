"use client";

import * as React from "react";
import { Dithering, ImageDithering, type DitheringProps, type ImageDitheringProps } from "@paper-design/shaders-react";
import { usePrefersReducedMotion } from "@artcollect/ui";

/**
 * A tactile, dithered-shader ticket card — GPU shader texture (via
 * @paper-design/shaders-react) clipped into a torn-stub ticket shape, with
 * an optional pointer-tilt/glare interaction and a shutter sound.
 *
 * Reskinned to ArtCollect/TikoYetu's own palette (packages/ui/tokens.css)
 * rather than the generic orange defaults it arrived with.
 */

const REF = 741;

export interface TicketGeometry {
  aspect: number;
  cornerRadius: number;
  notchRadius: number;
  perforation: number;
}

export const TICKET_GEOMETRY: TicketGeometry = {
  aspect: 741 / 425,
  cornerRadius: 25 / REF,
  notchRadius: 21 / REF,
  perforation: 562 / REF,
};

export interface TicketLayout {
  padding: number;
  labelTop: number;
  labelSize: number;
  labelLead: number;
  labelTracking: number;
  nameTop: number;
  nameSize: number;
  nameLead: number;
  nameTracking: number;
  footerTop: number;
  footerSize: number;
  footerTracking: number;
  stubSize: number;
  stubTracking: number;
  stubOpacity: number;
  watermarkSize: number;
  watermarkOpacity: number;
  watermarkColor: string;
  inkColor: string;
}

export const TICKET_LAYOUT: TicketLayout = {
  padding: 57 / REF,
  labelTop: 58 / REF,
  labelSize: 19.72 / REF,
  labelLead: 28 / REF,
  labelTracking: 0.016,
  nameTop: 185 / REF,
  nameSize: 64.79 / REF,
  nameLead: 65 / REF,
  nameTracking: -0.01,
  footerTop: 348 / REF,
  footerSize: 19.72 / REF,
  footerTracking: 0.016,
  stubSize: 67.61 / REF,
  stubTracking: 0,
  stubOpacity: 0.88,
  watermarkSize: 144 / REF,
  watermarkOpacity: 0.55,
  // Brand tokens (packages/ui/tokens.css): paper on ink.
  watermarkColor: "#f5f1e8",
  inkColor: "#161311",
};

export type TicketTextureEngine = "generative" | "image";

export interface TicketTexture {
  engine: TicketTextureEngine;
  colorBack: string;
  colorFront: string;
  colorHighlight: string;
  shape: DitheringProps["shape"];
  type: DitheringProps["type"];
  size: number;
  colorSteps: number;
  originalColors: boolean;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  speed: number;
}

// Coral-on-paper, the "collage" lane's own accent pairing.
export const TICKET_TEXTURE: TicketTexture = {
  engine: "generative",
  colorBack: "#e8442e", // --ac-coral
  colorFront: "#f5f1e8", // --ac-paper
  colorHighlight: "#1f4fd8", // --ac-cobalt
  shape: "warp",
  type: "random",
  size: 0.5,
  colorSteps: 4,
  originalColors: true,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  speed: 0.4,
};

export interface TicketGradient {
  centreX: number;
  centreY: number;
  radius: number;
  midStop: number;
  colorLight: string;
  colorMid: string;
  colorDark: string;
}

export const TICKET_GRADIENT: TicketGradient = {
  centreX: 0.62,
  centreY: 0.3,
  radius: 0.58,
  midStop: 0.45,
  colorLight: "#f5f1e8", // --ac-paper
  colorMid: "#e8442e", // --ac-coral
  colorDark: "#161311", // --ac-ink
};

export interface TicketStyle {
  texture: TicketTexture;
  gradient: TicketGradient;
}

export const TICKET_STYLE: TicketStyle = { texture: TICKET_TEXTURE, gradient: TICKET_GRADIENT };

const SHAPES: NonNullable<DitheringProps["shape"]>[] = ["simplex", "warp", "dots", "wave", "ripple", "swirl", "sphere"];
const TYPES: NonNullable<DitheringProps["type"]>[] = ["random", "2x2", "4x4", "8x8"];

export function ticketClipPath(width: number, height: number, geometry: TicketGeometry = TICKET_GEOMETRY): string {
  const r = geometry.cornerRadius * width;
  const n = geometry.notchRadius * width;
  const p = geometry.perforation * width;
  return [
    `M ${r} 0`,
    `L ${p - n} 0`,
    `A ${n} ${n} 0 0 0 ${p + n} 0`,
    `L ${width - r} 0`,
    `A ${r} ${r} 0 0 0 ${width} ${r}`,
    `L ${width} ${height - r}`,
    `A ${r} ${r} 0 0 0 ${width - r} ${height}`,
    `L ${p + n} ${height}`,
    `A ${n} ${n} 0 0 0 ${p - n} ${height}`,
    `L ${r} ${height}`,
    `A ${r} ${r} 0 0 0 0 ${height - r}`,
    `L 0 ${r}`,
    `A ${r} ${r} 0 0 0 ${r} 0`,
    "Z",
  ].join(" ");
}

function splitName(name: string, max = 3): string[] {
  const clean = name.trim().replace(/\s+/g, " ").toUpperCase();
  if (!clean) return [];
  const lines: string[] = [];
  for (const word of clean.split(" ")) {
    if (lines.length < max) lines.push(word);
    else lines[lines.length - 1] = `${lines[lines.length - 1]} ${word}`;
  }
  return lines;
}

function fitScale(
  lines: string[],
  opts: { availableWidth: number; availableHeight: number; fontSize: number; lineHeight: number; tracking: number },
): number {
  if (lines.length === 0) return 1;
  const { availableWidth, availableHeight, fontSize, lineHeight, tracking } = opts;
  if (fontSize <= 0 || availableWidth <= 0) return 1;
  const longest = Math.max(...lines.map((l) => l.length));
  const charWidth = (0.6 + tracking) * fontSize;
  const block = lines.length * lineHeight;
  return Math.max(
    0.05,
    Math.min(
      1,
      charWidth > 0 ? availableWidth / (longest * charWidth) : 1,
      block > 0 && availableHeight > 0 ? availableHeight / block : 1,
    ),
  );
}

function useDrift(speed: number): { x: number; y: number } {
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const reduced = usePrefersReducedMotion();
  const active = speed > 0 && !reduced;

  React.useEffect(() => {
    if (!active) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = ((now - start) / 1000) * speed;
      setOffset({ x: 0.06 * Math.sin(0.37 * t), y: 0.045 * Math.cos(0.23 * t) });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, speed]);

  return active ? offset : { x: 0, y: 0 };
}

function gradientDataUrl(g: TicketGradient, aspect: number): string {
  if (typeof document === "undefined") return "";
  const w = 512;
  const h = Math.max(1, Math.round(w / aspect));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = g.colorDark;
  ctx.fillRect(0, 0, w, h);
  const radial = ctx.createRadialGradient(w * g.centreX, h * g.centreY, 0, w * g.centreX, h * g.centreY, Math.max(1, w * g.radius));
  radial.addColorStop(0, g.colorLight);
  radial.addColorStop(Math.min(0.99, Math.max(0.01, g.midStop)), g.colorMid);
  radial.addColorStop(1, g.colorDark);
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, w, h);
  return canvas.toDataURL("image/png");
}

export interface TicketCardProps {
  name: string;
  presenter: string;
  event: string;
  venue: string;
  dates: string;
  stubText: string;
  watermark: string;
  width?: number;
  geometry?: TicketGeometry;
  layout?: TicketLayout;
  texture?: TicketTexture;
  gradient?: TicketGradient;
  className?: string;
}

export function TicketCard({
  name,
  presenter,
  event,
  venue,
  dates,
  stubText,
  watermark,
  width = REF,
  geometry = TICKET_GEOMETRY,
  layout = TICKET_LAYOUT,
  texture = TICKET_TEXTURE,
  gradient = TICKET_GRADIENT,
  className,
}: TicketCardProps) {
  const height = width / geometry.aspect;
  const perfX = geometry.perforation * width;
  const reduced = usePrefersReducedMotion();
  const drift = useDrift(texture.engine === "image" ? texture.speed : 0);
  const lines = splitName(name);
  const scale = fitScale(lines, {
    availableWidth: perfX - layout.padding * width - 0.03 * width,
    availableHeight: layout.footerTop * width - layout.nameTop * width - 0.02 * width,
    fontSize: layout.nameSize * width,
    lineHeight: layout.nameLead * width,
    tracking: layout.nameTracking,
  });
  const sourceImage = React.useMemo(
    () => (texture.engine === "image" ? gradientDataUrl(gradient, geometry.aspect) : ""),
    [texture.engine, gradient, geometry.aspect],
  );
  const shaderStyle: React.CSSProperties = { position: "absolute", inset: 0, width, height };

  const imageDitheringProps: ImageDitheringProps = {
    image: sourceImage,
    colorBack: texture.colorBack,
    colorFront: texture.colorFront,
    colorHighlight: texture.colorHighlight,
    type: texture.type,
    size: texture.size,
    colorSteps: texture.colorSteps,
    originalColors: texture.originalColors,
    scale: texture.scale,
    rotation: texture.rotation,
    offsetX: texture.offsetX + drift.x,
    offsetY: texture.offsetY + drift.y,
    fit: "cover",
    style: shaderStyle,
  };

  const ditheringProps: DitheringProps = {
    colorBack: texture.colorBack,
    colorFront: texture.colorFront,
    shape: texture.shape,
    type: texture.type,
    size: texture.size,
    scale: texture.scale,
    rotation: texture.rotation,
    offsetX: texture.offsetX,
    offsetY: texture.offsetY,
    speed: reduced ? 0 : texture.speed,
    style: shaderStyle,
  };

  return (
    <div
      className={`relative select-none ${className ?? ""}`}
      style={{ width, height, clipPath: `path('${ticketClipPath(width, height, geometry)}')` }}
    >
      <div className="absolute inset-0" style={{ background: texture.colorBack }} />
      {texture.engine === "image" && sourceImage ? (
        <ImageDithering {...imageDitheringProps} />
      ) : (
        <Dithering {...ditheringProps} />
      )}

      {/* Perforation between body and stub. */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: perfX,
          width: Math.max(1, 0.0022 * width),
          backgroundImage: `repeating-linear-gradient(to bottom, ${layout.inkColor}55 0 ${0.012 * width}px, transparent ${0.012 * width}px ${0.024 * width}px)`,
        }}
      />

      <div
        className="pointer-events-none absolute grid place-items-center font-bold tabular-nums"
        style={{ left: perfX, top: 0, width: width - perfX, height, color: layout.watermarkColor, opacity: layout.watermarkOpacity }}
      >
        <span style={{ writingMode: "vertical-rl", fontSize: layout.watermarkSize * width, lineHeight: 1, letterSpacing: "-0.04em" }}>
          {watermark}
        </span>
      </div>

      <div className="absolute inset-0" style={{ color: layout.inkColor }}>
        <div
          className="absolute whitespace-pre uppercase"
          style={{
            left: layout.padding * width,
            top: layout.labelTop * width,
            fontSize: layout.labelSize * width,
            lineHeight: `${layout.labelLead * width}px`,
            letterSpacing: `${layout.labelTracking}em`,
          }}
        >
          {presenter}
          {"\n"}
          {event}
        </div>

        <div
          className="absolute font-medium"
          style={{
            left: layout.padding * width,
            top: layout.nameTop * width,
            fontSize: layout.nameSize * width * scale,
            lineHeight: `${layout.nameLead * width * scale}px`,
            letterSpacing: `${layout.nameTracking}em`,
          }}
        >
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <div
          className="absolute whitespace-nowrap uppercase"
          style={{ left: layout.padding * width, top: layout.footerTop * width, fontSize: layout.footerSize * width, letterSpacing: `${layout.footerTracking}em` }}
        >
          {venue} · {dates}
        </div>

        <div
          className="absolute grid place-items-center font-medium whitespace-nowrap uppercase"
          style={{
            left: perfX,
            top: 0,
            width: width - perfX,
            height,
            fontSize: layout.stubSize * width,
            letterSpacing: `${layout.stubTracking}em`,
            opacity: layout.stubOpacity,
          }}
        >
          <span style={{ writingMode: "vertical-rl" }}>{stubText}</span>
        </div>
      </div>
    </div>
  );
}

export interface TiltCardProps {
  children: React.ReactNode;
  clipPath: string;
  maxTilt?: number;
  scale?: number;
  glare?: number;
  className?: string;
}

export function TiltCard({ children, clipPath, maxTilt = 9, scale = 1.02, glare = 0.16, className }: TiltCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const glareRef = React.useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = React.useState(false);

  const onMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1200px) rotateX(${-(dy * 2) * maxTilt}deg) rotateY(${dx * 2 * maxTilt}deg) scale(${scale})`;
      if (glareRef.current) {
        glareRef.current.style.background = `radial-gradient(38% 55% at ${(dx + 0.5) * 100}% ${(dy + 0.5) * 100}%, rgba(255,255,255,${glare}) 0%, rgba(255,255,255,0) 70%)`;
      }
    },
    [maxTilt, scale, glare],
  );

  const onLeave = React.useCallback(() => {
    setHovering(false);
    if (cardRef.current) cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
    if (glareRef.current) glareRef.current.style.background = "transparent";
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerEnter={() => setHovering(true)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative w-fit will-change-transform ${className ?? ""}`}
      style={{
        transition: hovering ? "none" : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
        transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {glare > 0 && (
        <div ref={glareRef} aria-hidden className="pointer-events-none absolute inset-0" style={{ clipPath, transition: hovering ? "none" : "background 420ms ease-out" }} />
      )}
    </div>
  );
}

export interface AdmitOneTicketProps extends TicketCardProps {
  /** Pointer tilt/glare on hover — pass `false` to disable entirely (e.g. on touch-primary layouts). */
  tilt?: { maxTilt?: number; scale?: number; glare?: number } | false;
}

export function AdmitOneTicket({ tilt, ...props }: AdmitOneTicketProps) {
  const width = props.width ?? REF;
  const geometry = props.geometry ?? TICKET_GEOMETRY;
  if (tilt === false) return <TicketCard {...props} />;
  return (
    <TiltCard clipPath={`path('${ticketClipPath(width, width / geometry.aspect, geometry)}')`} {...tilt}>
      <TicketCard {...props} />
    </TiltCard>
  );
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const lig = l / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const v = lig - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * Math.max(0, Math.min(1, v))).toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

function pick<T>(list: T[], rnd: () => number): T {
  return list[Math.floor(rnd() * list.length) % list.length]!;
}
function between(min: number, max: number, rnd: () => number): number {
  return min + rnd() * (max - min);
}

/** Randomizes texture params within tasteful ranges — same brand hue family, different mood each call. */
export function remixTexture(prev: TicketTexture, rnd: () => number = Math.random): TicketTexture {
  const hue = between(8, 44, rnd);
  const dark = hslToHex(hue, 88, between(45, 56, rnd));
  const light = hslToHex(hue + between(-6, 10, rnd), 92, between(74, 88, rnd));
  const swap = rnd() < 0.5;
  return {
    ...prev,
    colorBack: swap ? light : dark,
    colorFront: swap ? dark : light,
    colorHighlight: hslToHex(hue + between(-4, 6, rnd), 90, between(60, 72, rnd)),
    shape: pick(SHAPES, rnd),
    type: pick(TYPES, rnd),
    size: between(0.4, 3.2, rnd),
    colorSteps: Math.round(between(2, 6, rnd)),
    rotation: between(0, 360, rnd),
    scale: between(1.45, 2.1, rnd),
    offsetX: between(-0.3, 0.3, rnd),
    offsetY: between(-0.3, 0.3, rnd),
    speed: between(0.15, 0.7, rnd),
  };
}

export function remixGradient(prev: TicketGradient, rnd: () => number = Math.random): TicketGradient {
  const hue = between(8, 44, rnd);
  return {
    ...prev,
    centreX: between(0.25, 0.8, rnd),
    centreY: between(0.15, 0.7, rnd),
    radius: between(0.35, 0.85, rnd),
    midStop: between(0.3, 0.6, rnd),
    colorLight: hslToHex(hue + between(-4, 8, rnd), 95, between(78, 90, rnd)),
    colorMid: hslToHex(hue, 96, between(58, 68, rnd)),
    colorDark: hslToHex(hue - between(0, 6, rnd), 92, between(44, 54, rnd)),
  };
}

export function remixTicketStyle(prev: TicketStyle): TicketStyle {
  return { texture: remixTexture(prev.texture), gradient: remixGradient(prev.gradient) };
}

let audioCtx: AudioContext | null = null;

function burst(ctx: AudioContext, at: number, opts: { frequency: number; q: number; gain: number; decay: number }) {
  const length = Math.ceil(0.05 * ctx.sampleRate);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = opts.frequency;
  filter.Q.value = opts.q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(opts.gain, at + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + opts.decay);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(at);
  source.stop(at + opts.decay + 0.02);
}

/** A soft two-part "click-clack" — call on a user gesture (ticket reveal, tilt-card tap). */
export function playShutterSound({ volume = 0.35, gap = 0.045 }: { volume?: number; gap?: number } = {}): void {
  const Ctor = typeof window !== "undefined" ? window.AudioContext : undefined;
  if (!Ctor) return;
  audioCtx ??= new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  const now = audioCtx.currentTime;
  burst(audioCtx, now, { gain: volume, decay: 0.035, frequency: 3200, q: 1.1 });
  burst(audioCtx, now + gap, { gain: volume * 0.75, decay: 0.055, frequency: 1800, q: 0.9 });
}

export default AdmitOneTicket;
