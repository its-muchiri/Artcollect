"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

const TAGS = {
  div: motion.div,
  article: motion.article,
  li: motion.li,
  section: motion.section,
} as const;

type Tag = keyof typeof TAGS;

export interface RevealOnScrollProps
  extends Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport"> {
  /** Stagger index — each step adds a small transition delay. 0 by default. */
  index?: number;
  /** Pixel distance to slide up from. 24 by default. */
  distance?: number;
  /** Which element to render — `div` by default; use `li` inside a `<ol>`/`<ul>`, etc. */
  as?: Tag;
}

/**
 * The (editorial) section's standard scroll-reveal: fade + slide up,
 * fires once when ~10% into the viewport, entrance only (never re-fires on
 * scroll back past the same element, per docs/11 §7's "stagger sparingly,
 * only on first reveal" rule).
 *
 * Wraps server-rendered children — this file is the only thing that needs
 * "use client"; a plain function component like `ArtworkTile` can be
 * passed straight through as `children` from a Server Component page.
 *
 * Reduced motion: skips the animation entirely rather than just speeding
 * it up — the content is simply present, no motion at all.
 */
export function RevealOnScroll({
  children,
  index = 0,
  distance = 24,
  as = "div",
  transition,
  className,
  ...rest
}: RevealOnScrollProps) {
  const reduced = useReducedMotion();
  // Each entry in TAGS types its own element-specific event handlers
  // (onCopy, etc.), which don't unify across tags — the public props are
  // typed against `div` for callers' convenience, so cast at the one spot
  // that actually renders the polymorphic tag.
  const MotionTag = TAGS[as] as typeof TAGS["div"];

  return (
    <MotionTag
      initial={reduced ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.06, ...transition }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
