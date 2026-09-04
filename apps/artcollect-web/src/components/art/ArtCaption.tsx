"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Quote, X } from "lucide-react";
import { quoteForWork } from "@/lib/african-quotes";

/**
 * Art captions in the handwritten lane: pressing an artwork opens a small
 * studio card — the piece up close beside an African proverb or quote
 * (docs: celebrate the culture the work comes from). The quote is picked
 * deterministically from the artwork's slug, so a piece always opens on
 * the same words.
 *
 * `ArtCaptionPress` renders the pressable image area (used inside
 * ArtworkTile so both the browse wall and every artist page get captions);
 * the overlay closes on backdrop click, the close button, or Escape.
 */

interface CaptionTarget {
  /** Stable seed for the deterministic quote pick — artwork slug. */
  slug: string;
  title: string;
  artistName: string;
  artistSlug: string;
  image: string | null;
  imageAlt: string | null;
  medium?: string | null;
  yearCreated?: number | null;
}

export function ArtCaptionPress({
  target,
  children,
  className,
}: {
  target: CaptionTarget;
  /** The tile's image area — badges, fills, the artwork itself. */
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const quote = useMemo(() => quoteForWork(target.slug), [target.slug]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${target.title} with its caption`}
        className={`group/caption relative block w-full cursor-zoom-in text-left ${className ?? ""}`}
      >
        {children}
        {/* Handwritten hint — tells you the piece opens to its words */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full border border-ink/20 bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink/70 opacity-0 shadow-[2px_2px_0_var(--ac-shadow-ink)] transition-opacity duration-200 group-hover/caption:opacity-100"
        >
          <Quote size={11} aria-hidden />
          Caption
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${target.title} — caption`}
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: "easeOut" }}
              className="relative grid w-full max-w-4xl grid-cols-1 border-2 border-paper bg-paper shadow-[8px_8px_0_var(--ac-shadow-ink)] md:grid-cols-[1.15fr_1fr]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close caption"
                className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink transition-transform hover:scale-110 hover:bg-coral active:scale-90"
              >
                <X size={16} aria-hidden />
              </button>

              {/* The piece, up close */}
              <div className="flex max-h-[42vh] items-center justify-center overflow-hidden border-b-2 border-ink bg-paper-deep md:max-h-[72vh] md:border-b-0 md:border-r-2">
                {target.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- unoptimized editorial imagery, same as tiles
                  <img
                    src={target.image}
                    alt={target.imageAlt ?? target.title}
                    className="max-h-[42vh] w-full object-contain md:max-h-[72vh]"
                  />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center">
                    <span className="font-display text-4xl text-ink/40">{target.title}</span>
                  </div>
                )}
              </div>

              {/* The words it opens with */}
              <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-highlighter px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink">
                    <Quote size={11} aria-hidden />
                    Caption
                  </span>
                  <blockquote className="mt-4">
                    <p className="font-hand text-2xl leading-snug text-ink sm:text-[1.7rem]">
                      “{quote.text}”
                    </p>
                    <footer className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/55">
                      {quote.source}
                    </footer>
                  </blockquote>
                </div>

                <div className="border-t-2 border-dashed border-ink/25 pt-4">
                  <p className="font-display text-xl text-ink">{target.title}</p>
                  <p className="mt-0.5 text-sm text-ink/60">
                    {target.artistName}
                    {(target.medium || target.yearCreated) &&
                      ` · ${[target.medium, target.yearCreated].filter(Boolean).join(", ")}`}
                  </p>
                  <Link
                    href={`/artists/${target.artistSlug}`}
                    onClick={close}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wide text-paper transition-transform hover:scale-105 active:scale-95"
                  >
                    Visit the studio
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
