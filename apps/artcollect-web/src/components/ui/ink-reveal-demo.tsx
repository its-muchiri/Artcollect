"use client";

import React from "react";
import InkReveal from "@/components/ui/ink-reveal";
import { Sparkles, Eye, ArrowUpRight } from "lucide-react";

export default function InkRevealDemo() {
  return (
    <div className="relative w-full max-w-5xl h-[550px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-zinc-950/80 backdrop-blur-xl group">
      {/* Background High-Res Editorial Artwork */}
      <img
        src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80"
        alt="Fine Editorial Artwork"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Editorial Watermark Overlay behind Canvas */}
      <div className="absolute inset-0 z-[0] flex items-center justify-center pointer-events-none select-none">
        <h1 className="text-[12vw] font-serif font-black tracking-tighter text-white/20 uppercase">
          ARTCOLLECT
        </h1>
      </div>

      {/* Interactive Ink Reveal Canvas Mask */}
      <InkReveal
        maskColor={[18, 18, 20]}
        brushSize={140}
        lifetime={800}
        rStart={12}
        className="transition-opacity duration-300"
      />

      {/* Glassmorphic UI Card Floating Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-xl bg-zinc-900/40 border border-white/10 backdrop-blur-md shadow-lg pointer-events-auto">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-3 h-3" /> Digital Exhibition Pass
          </div>
          <h3 className="text-xl font-serif font-semibold text-white">
            Monochrome Horizon #04
          </h3>
          <p className="text-sm text-zinc-400">
            Hover or drag across the frame to reveal hidden brush layers.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Eye className="w-4 h-4 text-zinc-300" /> Preview
          </button>
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-950 bg-white hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Collect <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
