"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

const SCROLL_THRESHOLD = 480;

/**
 * Site-wide floating utility cluster: browser back, browser forward, and
 * scroll-to-top — mounted once in the true root layout so every page gets
 * it for free, including auth and the ticketing section (no restricted
 * imports here, so it's safe under eslint.config.mjs's checkout-calm
 * gate). Purely a navigation utility, not themed per-section like the
 * editorial/ticketing surfaces around it — one consistent, neutral
 * control regardless of which design language the page underneath uses.
 */
export function PageNavCluster() {
  const router = useRouter();
  const [showTop, setShowTop] = useState(false);
  // history.length is 1 on a fresh tab/direct link — nothing to go back to.
  // Lazy initializer (not an effect) so this never causes an extra render;
  // guarded for the server-rendered pass, where `window` doesn't exist yet.
  const [canGoBack] = useState(() => typeof window !== "undefined" && window.history.length > 1);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setShowTop(window.scrollY > SCROLL_THRESHOLD);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goForward = useCallback(() => {
    window.history.forward();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {showTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition-transform hover:scale-105 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <ArrowUp size={17} aria-hidden />
        </button>
      )}
      <div className="flex overflow-hidden rounded-full border border-zinc-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-900">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={!canGoBack}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ArrowLeft size={17} aria-hidden />
        </button>
        <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
        <button
          type="button"
          onClick={goForward}
          aria-label="Go forward"
          className="flex h-10 w-10 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-50 active:scale-95 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ArrowRight size={17} aria-hidden />
        </button>
      </div>
    </div>
  );
}
