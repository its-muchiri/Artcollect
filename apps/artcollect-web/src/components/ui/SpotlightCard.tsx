"use client";

import {
  useMotionTemplate,
  useMotionValue,
  motion,
  type MotionProps,
} from "framer-motion";
import { type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps extends Omit<MotionProps, "children"> {
  children: ReactNode;
  className?: string;
  /** CSS color used for the cursor-follow spotlight glow. */
  spotlightColor?: string;
}

/**
 * Mouse-tracking radial-gradient spotlight container — the shared
 * glassmorphic primitive used by `BentoGrid` and anywhere else a hoverable
 * editorial panel is needed.
 *
 * Concerns are kept separate from the scroll engine on purpose: everything
 * here — entrance (`initial`/`whileInView`), hover (`whileHover`), and the
 * spotlight (plain `useMotionValue`s updated from a mouse event) — is
 * driven entirely by Framer Motion and fires from React events/viewport
 * intersection, never from Lenis or GSAP ScrollTrigger.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(139, 92, 246, 0.35)",
  ...motionProps
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - bounds.left);
    mouseY.set(event.clientY - bounds.top);
  }

  const background = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 80%)`;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]",
        className,
      )}
      {...motionProps}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
