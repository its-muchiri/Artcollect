"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export interface ShareLinkButtonProps {
  /** The short-link code (server-provided via ensureShortLink). */
  code: string;
  title: string;
  label?: string;
  className?: string;
}

/**
 * Share button backed by short links: uses the Web Share API when the
 * device supports it (phones get the native sheet), otherwise copies the
 * short URL to the clipboard. The short link is click-counted, so shares
 * are measurable.
 */
export function ShareLinkButton({ code, title, label = "Share", className }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share(): Promise<void> {
    const url = `${window.location.origin}/s/${code}`;
    const payload = { title, url };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // user dismissed the sheet — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (very old browser) — select-nothing, stay quiet
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={`${label} — short link /s/${code}`}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper active:scale-95"
      }
    >
      {copied ? <Check size={15} aria-hidden /> : <Share2 size={15} aria-hidden />}
      {copied ? "Link copied" : label}
    </button>
  );
}
