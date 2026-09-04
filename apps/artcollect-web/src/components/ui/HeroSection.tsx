"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/**
 * Dark-mode landing hero. Entrance is a staggered Framer Motion sequence
 * (`initial`/`animate`, not scroll-linked) — it plays once on mount,
 * independent of Lenis/GSAP.
 */
export function HeroSection() {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        variants={itemVariants}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-400/10 px-4 py-1.5 text-sm text-zinc-200 backdrop-blur-md"
      >
        <Sparkles size={14} className="text-violet-300" />
        <span className="font-mono text-xs uppercase tracking-widest">
          Lenis · GSAP · React Three Fiber · Framer Motion
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="max-w-4xl bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text font-serif text-5xl font-semibold tracking-tight text-transparent sm:text-7xl"
      >
        A creative dev stack that stays in sync
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mt-6 max-w-2xl text-balance text-lg text-zinc-400"
      >
        One scroll engine, one WebGL layer, one motion system — wired
        together so DOM animation, 3D, and scroll never drift apart.
      </motion.p>

      <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group relative inline-flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset]"
        >
          <span
            aria-hidden
            className="absolute -inset-1 -z-10 rounded-full bg-violet-500 opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-70"
          />
          Explore the stack
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.08)" }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-200 backdrop-blur-md"
        >
          View source
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
