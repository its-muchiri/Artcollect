"use client";

/**
 * Client boundary for Phosphor icons (docs/11 Phase 3).
 *
 * `@phosphor-icons/react` touches `createContext` at module scope, so its
 * components cannot be evaluated inside React Server Components. This
 * module marks the boundary once: server sections import icons from here
 * (they arrive as client refs), client components may import either from
 * here or from the package directly.
 *
 * Re-export only the icons the app actually uses — the package
 * tree-shakes, and this keeps the icon set auditable.
 */
export {
  ArrowRight,
  CalendarBlank,
  Camera,
  FrameCorners,
  HeartStraight,
  MapPin,
  PaintBrush,
  Printer,
  Scissors,
  Sparkle,
  SquaresFour,
  Ticket,
} from "@phosphor-icons/react";
export type { Icon } from "@phosphor-icons/react";
