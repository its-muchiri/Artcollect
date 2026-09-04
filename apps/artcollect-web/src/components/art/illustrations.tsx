import type { ReactNode } from "react";

/**
 * Hand-authored flat-fill illustrations for the "how it works" explainer
 * (docs/11 Phase 3) — vector lane, every fill drawn from the 6-color
 * palette (paper/ink + accents), ink 2px strokes, zero gradients, zero
 * external assets. Purely decorative; always `aria-hidden` with the
 * meaning carried by the adjacent copy.
 */

function IllustrationFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 120" className="h-auto w-full" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Gallery wall with three hung works, one mid-hang (tape + tilt). */
export function WallIllustration() {
  return (
    <IllustrationFrame>
      {/* wall */}
      <rect x="0" y="0" width="160" height="120" fill="var(--ac-paper-deep)" />
      {/* floor line */}
      <rect x="0" y="104" width="160" height="4" fill="var(--ac-ink)" />
      {/* frame 1 — hung straight */}
      <rect x="14" y="22" width="34" height="44" fill="var(--ac-ink)" />
      <rect x="18" y="26" width="26" height="36" fill="var(--ac-coral)" />
      <rect x="18" y="44" width="26" height="18" fill="var(--ac-ink)" opacity="0.25" />
      {/* frame 2 — hung straight */}
      <rect x="62" y="16" width="40" height="52" fill="var(--ac-ink)" />
      <rect x="66" y="20" width="32" height="44" fill="var(--ac-cobalt)" />
      <circle cx="82" cy="42" r="10" fill="var(--ac-paper)" />
      {/* frame 3 — mid-hang, taped, tilted */}
      <g transform="rotate(-7 122 60)">
        <rect x="108" y="34" width="30" height="40" fill="var(--ac-ink)" />
        <rect x="112" y="38" width="22" height="32" fill="var(--ac-lime)" />
        <rect x="112" y="52" width="22" height="18" fill="var(--ac-ink)" opacity="0.25" />
        {/* tape over the top edge */}
        <rect x="114" y="30" width="18" height="7" fill="rgba(255,255,255,0.75)" transform="rotate(-3 123 33)" />
      </g>
      {/* caption scrap under frame 2 */}
      <rect x="66" y="72" width="32" height="10" fill="var(--ac-paper)" stroke="var(--ac-ink)" strokeWidth="1.5" transform="rotate(2 82 77)" />
    </IllustrationFrame>
  );
}

/** An enquiry card with a cobalt speech bubble and a heart, stapled. */
export function EnquireIllustration() {
  return (
    <IllustrationFrame>
      {/* backing card */}
      <rect x="24" y="16" width="112" height="88" fill="var(--ac-paper)" stroke="var(--ac-ink)" strokeWidth="2" />
      {/* staple */}
      <path d="M40 18 v6 M46 18 v6 M40 19 h6" stroke="var(--ac-ink)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* speech bubble */}
      <path
        d="M40 40 h56 a6 6 0 0 1 6 6 v18 a6 6 0 0 1 -6 6 h-34 l-10 10 v-10 h-12 a6 6 0 0 1 -6 -6 v-18 a6 6 0 0 1 6 -6 z"
        fill="var(--ac-cobalt)"
      />
      {/* heart inside bubble */}
      <path
        d="M68 62 c-6 -5 -12 -9 -12 -14 a5 5 0 0 1 9 -3 l3 3 3 -3 a5 5 0 0 1 9 3 c0 5 -6 9 -12 14 z"
        fill="var(--ac-paper)"
      />
      {/* price tag scrap */}
      <rect x="96" y="74" width="30" height="16" fill="var(--ac-lime)" stroke="var(--ac-ink)" strokeWidth="1.5" transform="rotate(6 111 82)" />
      <circle cx="102" cy="82" r="2" fill="var(--ac-ink)" />
    </IllustrationFrame>
  );
}

/** A ticket stub with perforation and a QR-ish code, handed over. */
export function TicketIllustration() {
  return (
    <IllustrationFrame>
      {/* backing card */}
      <rect x="24" y="16" width="112" height="88" fill="var(--ac-paper)" stroke="var(--ac-ink)" strokeWidth="2" />
      {/* ticket body */}
      <rect x="36" y="38" width="88" height="40" fill="var(--ac-hot-pink)" stroke="var(--ac-ink)" strokeWidth="2" />
      {/* perforation */}
      <path d="M96 38 v40" stroke="var(--ac-ink)" strokeWidth="2" strokeDasharray="3 4" />
      {/* stub text bars */}
      <rect x="42" y="46" width="40" height="5" fill="var(--ac-ink)" />
      <rect x="42" y="56" width="30" height="5" fill="var(--ac-ink)" opacity="0.5" />
      <rect x="42" y="66" width="36" height="5" fill="var(--ac-ink)" opacity="0.5" />
      {/* QR square on stub */}
      <rect x="102" y="46" width="16" height="16" fill="var(--ac-paper)" stroke="var(--ac-ink)" strokeWidth="1.5" />
      <rect x="105" y="49" width="4" height="4" fill="var(--ac-ink)" />
      <rect x="111" y="49" width="4" height="4" fill="var(--ac-ink)" />
      <rect x="105" y="55" width="4" height="4" fill="var(--ac-ink)" />
      <rect x="111" y="55" width="4" height="4" fill="var(--ac-ink)" opacity="0.5" />
      {/* hand-off arrow */}
      <path d="M60 92 h36 m0 0 l-6 -5 m6 5 l-6 5" stroke="var(--ac-ink)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </IllustrationFrame>
  );
}
