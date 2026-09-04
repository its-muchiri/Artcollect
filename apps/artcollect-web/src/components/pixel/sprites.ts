import type { PixelGrid } from "@artcollect/ui";

/**
 * TikoYetu's code-generated pixel sprites (docs/11 Phase 5).
 *
 * Every sprite is pure data — a 2D color grid rendered by `<PixelSprite>`
 * — so badges, stamps, and spinners need no artist and no texture files.
 * Colors come from the v2 palette (pixel lane = lime; stamps use
 * marker-red; the spinner runs cobalt). Non-negotiable: pixel sprites
 * NEVER carry price/date/status meaning alone — they are always paired
 * with plain accessible text (see PixelAvailabilityMark / loading.tsx).
 */

/** 8×8 ticket badge (lime body, ink details) — "available" reinforcement. */
export const TICKET_BADGE: PixelGrid = {
  legend: { l: "#A4C639", i: "#161311" },
  rows: [
    "..llll..",
    ".lllll..",
    "llllllll",
    "llliilll",
    "llliilll",
    "llllllll",
    ".lllli..",
    "..llii..",
  ],
};

/** 9×9 starburst stamp (marker-red) — "sold out" reinforcement. */
export const SOLD_OUT_STAMP: PixelGrid = {
  legend: { r: "#B23A2E" },
  rows: [
    "....r....",
    "....r....",
    ".r..r..r.",
    "..r.r.r..",
    "rrrrrrrrr",
    "..r.r.r..",
    ".r..r..r.",
    "....r....",
    "....r....",
  ],
};

/** 9×9 lightning bolt (cobalt) — "last few" reinforcement. */
export const LAST_FEW_ZAP: PixelGrid = {
  legend: { c: "#1F4FD8" },
  rows: [
    ".....cccc",
    "....cccc.",
    "...cccc..",
    "..ccccc..",
    ".cccccc..",
    "...cccc..",
    "..cccc...",
    ".cccc....",
    "ccc......",
  ],
};

/**
 * 8×8 hourglass spinner (cobalt) — used only as a FUNCTIONAL status
 * indicator paired with plain text (route loading states), never on
 * checkout surfaces (docs/11 non-negotiables; enforced by the eslint
 * no-restricted-imports rule in eslint.config.mjs).
 */
export const SPINNER_GLASS: PixelGrid = {
  legend: { c: "#1F4FD8", i: "#161311" },
  rows: [
    "iiiiiiii",
    ".c....c.",
    "..c..c..",
    "...cc...",
    "...cc...",
    "..c..c..",
    ".c....c.",
    "iiiiiiii",
  ],
};
