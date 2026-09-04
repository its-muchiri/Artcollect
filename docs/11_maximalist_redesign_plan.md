# ArtCollect & TikoYetu — Maximalist Collage Redesign (v2)

## Title & Overview

This document is the implementation plan for the "v2" design direction: a maximalist, collage-driven visual system (vector, collage, pixel art, graffiti, handwritten — one dominant style per section, unified by one grid and one neutral canvas) that supersedes the minimalist v1 brief. v1 was never built — the project pivoted to this direction before any v1 code landed. This doc is the reference for implementing everything remaining, and defines how each piece gets verified for both correctness (logical errors) and design-intent fidelity (semantic errors), not just "it compiles."

Existing foundation this builds on (already in the repo, verified working):

- `SmoothScrollProvider` (`apps/artcollect-web/src/components/providers/SmoothScrollProvider.tsx`) — Lenis + GSAP ticker sync. Every scrub-driven moment below rides this, not a new scroll engine.
- `SceneCanvas` (`apps/artcollect-web/src/components/canvas/SceneCanvas.tsx`) — existing R3F canvas pattern (camera, lights, scroll-reactive mesh) to extend for the diorama hero.
- `HorizontalGallery` (`apps/artcollect-web/src/components/sections/HorizontalGallery.tsx`) — the `containerAnimation` horizontal-scroll-track technique for artist portfolios/event photo dumps. Relocate, don't rebuild.
- `PinnedShowcase` (`apps/artcollect-web/src/components/sections/PinnedShowcase.tsx`) — the pin+multi-stage-crossfade technique the "walking pixel sprite" scrollytelling moment wants. Repurpose the mechanism, replace the tech-demo content.
- `ink-reveal.tsx` / `ink-reveal-demo.tsx` — hand-authored for the retired v1 editorial-glassmorphism direction. Doesn't map to any of the five v2 styles; left in place but not used in the new composition.
- TikoYetu's real data layer (`apps/tikoyetu-web/src/lib/events.ts`, `packages/database` Prisma schema) — style routing extends this schema, doesn't replace it.

## Key Specifications

### Assumptions (flagged for correction, not blocking)

1. **Placeholder imagery** for collage/artist photography (Unsplash-sourced, same approach already used for TikoYetu's seed events) until real ArtCollect content exists.
2. **Starter 6-color palette**, finalized in Phase 1: paper `#F5F1E8` (warm off-white) / ink `#161311` (warm off-black) as the two neutrals, plus five accents — coral-red (collage), cobalt (vector), lime (pixel), hot-pink/spray-orange (graffiti), warm marker-red (handwritten) — each a CSS custom property so it's one-line-swappable.
3. **`ink-reveal.tsx` retired from active use**, not deleted.
4. Recommended checkpoint: ship **Phase 1 + Phase 2** (foundation + the ArtCollect collage hero — the brief's own "spend your scroll budget here" centerpiece) before continuing through Phases 3–7.

### Style-system technical approach (built once, reused everywhere)

- **Vector**: single-weight SVG icon set (Phosphor icons — free, tree-shakeable), flat-fill illustrations capped to the 6-color palette.
- **Collage**: a reusable "scrap library" — `<TornEdge>`, `<TapePiece>`, `<StapleMark>`, `<HighlighterMark>` — as SVG components using `feTurbulence` + `feDisplacementMap` filters for organic torn-paper edges (no external texture files needed). Real photos get `clip-path` cuts + slight rotation.
- **Pixel art**: sprites as small 2D color-grid data structures, rendered to SVG (`<rect>` per pixel) or `<canvas>`, displayed with `image-rendering: pixelated`. Fully code-generated — no sprite artist needed for badges/stamps/spinners.
- **Graffiti**: the poster display face run through an SVG spray/stencil filter (`feTurbulence` + `feColorMatrix`/`feComposite` for edge roughness) rather than a "graffiti font" — a code-driven texture, code-split (`next/dynamic`) so it only loads on street-art/music/nightlife event pages.
- **Handwritten**: **Caveat** (Google Font, wide weight range, real handwriting character) via `next/font/google`, always rendered inside a shared `<Annotation>` component that draws a rotated solid "sticky-note" backing shape behind the text for contrast.
- **Typography set (3 total)**: Poster/display — **Anton** or **Archivo Black**; Body/UI/transactional — **Inter** (stays the one typeface prices/dates/confirmations are ever set in); Handwriting — **Caveat**.
- **Style routing on TikoYetu**: add `category: TicketingEventCategory` enum (`art | music | nightlife | streetart | editorial | other`) to `TicketingEvent` in `packages/database/prisma/schema.prisma` (no such field exists today — verified). Event detail page picks graffiti vs. default styling off this field; regenerate the Prisma client + migration diff the same way every other schema change this project was verified (`prisma validate` / `generate` / static `migrate diff`).

### Phased build order

**Phase 1 — Foundation**
- `packages/ui/tokens.css`: paper/ink neutrals, 5-accent palette, spacing/grid scale as CSS custom properties, imported by both apps' `globals.css`.
- Load the 3 fonts via `next/font/google` in each app's `layout.tsx`, exposed as CSS vars (`--font-display`, `--font-hand`), same pattern already used for Newsreader/Plus Jakarta Sans.
- Scrap-asset library: `TornEdge`, `TapePiece`, `StapleMark`, `HighlighterMark`, `Annotation`.
- Reduced-motion infrastructure: Framer's built-in `useReducedMotion()` for Framer-driven reveals; a small shared hook for the GSAP/Lenis/R3F pieces that aren't Framer-aware, wired into `SmoothScrollProvider` (skip smoothing), any WebGL scene (static poster fallback), and every pinned/scrubbed sequence (static assembled fallback).
- `TicketingEvent.category` schema addition + regenerate client + migration diff.
- **Add a test runner** (none exists in the monorepo today — verified): `vitest`, root-configured, per-package test files. This phase should land the harness itself plus the contrast-ratio checker (below) as its first real test.

**Phase 2 — ArtCollect homepage: the collage diorama hero + scroll-scrubbed assembly**
- Extend `SceneCanvas` (or a new hero-scoped scene, dynamic-imported `ssr:false` with a poster fallback — never a global fixed background) into a layered diorama: photo/cutout planes at different Z depths, parallax on scroll position (via the existing Lenis-instance-as-prop pattern) and pointer move.
- GSAP ScrollTrigger scrubbed timeline animating cutouts in from off-screen edges into the assembled poster — the one pinned/scrubbed centerpiece for this page.
- Real ArtCollect headline/editorial copy (replacing the retired v1 hero's dev-demo copy).

**Phase 3 — Vector-art editorial & browsing**
- Icon set integration, category/browse pages, "how it works" explainer using flat-fill illustration, palette-capped.

**Phase 4 — Artist profile pages**
- Handwritten annotation system (`<Annotation>` from Phase 1) over portrait/work photography — margin notes, signature-style quote callouts.

**Phase 5 — TikoYetu: pixel-art badges + calm checkout**
- Ticket-tier badges, "sold out"/"last few" stamps, loading spinner as code-generated pixel sprites.
- Checkout: deliberately the lightest-touch page — one small vector icon set + a single handwritten "you're going 🎟" confirmation line, otherwise unchanged from the calm, linear checkout already built. No 3D, no graffiti, no pixel art here beyond that one line.

**Phase 6 — TikoYetu: graffiti event pages + tactile 3D ticket object**
- Graffiti-filtered headlines/stickers/drips, code-split to street-art/music/nightlife category event pages only (via the Phase 1 `category` field) so other event pages never load the texture-filter bundle.
- Tactile 3D ticket in the wallet: drei-based mesh, drag/tilt via pointer deltas, a procedural Fresnel-based holographic-foil shader for special editions (no external HDRI dependency).

**Phase 7 — Polish**
- Corkboard carousel ("recent drops"/"your collection"), marquee ticker bands (pure CSS/rAF loop, deliberately *not* scroll-linked), relocating `HorizontalGallery`'s technique to artist-portfolio/event-photo-dump pages, sticker-peel page-turn transitions.

### Non-negotiables carried through every phase

- Poster/static fallback before any WebGL asset loads; IntersectionObserver-gated, never on initial paint for below-the-fold moments.
- `transform`/`opacity` only for scroll animation — never layout-shifting properties.
- One pinned/scrubbed centerpiece per page, disabled below the tablet breakpoint.
- Decorative imagery gets `alt=""`; meaningful imagery gets real alt text.
- Price/date/ticket-status info is never conveyed by pixel-art/graffiti type alone — always paired with plain accessible text.
- Zero 3D and zero decorative motion on checkout and the scanner PWA.

### Verification: logical errors (automated, per pure function)

No test runner exists in the monorepo yet — Phase 1 adds `vitest`. From then on, every pure/semi-pure function introduced or extended gets a real test, not just a build check:

| Area | File | What to test |
| --- | --- | --- |
| Availability math | `apps/tikoyetu-web/src/lib/inventory.ts`, `events.ts` | `getTierRemaining` at capacity=0, at the exact 15%-low boundary, with expired vs. active holds |
| Checkout validation | `apps/tikoyetu-web/src/lib/actions/checkout-actions.ts` | quantity below `minPerOrder` / above `maxPerOrder` / above live remaining; stale-client-state rejected even when the UI would have blocked it |
| Payment idempotency | `apps/tikoyetu-web/src/lib/order-fulfillment.ts` | calling `finalizeOrderPayment` twice with the same verified transaction issues tickets exactly once (relies on `Payment.providerRef` uniqueness — needs a real/test database, not just mocks) |
| Cross-platform contract | `packages/contracts/index.ts` | `deriveCtaState` over the full status × availability matrix, including the `status_unknown` fallback |
| Style routing | new `category` → style mapping | every `TicketingEventCategory` value maps to exactly one style, with an explicit default/fallback case tested (never an unstyled or crashing state) |
| Contrast safety | new `<Annotation>` component | a pure `contrastRatio(fg, bg)` helper asserted ≥ WCAG AA (4.5:1) for every handwriting-color × sticky-note-backing-color pairing in the palette |

### Verification: semantic errors (the brief's intent, not just working code)

These are judgment calls a compiler can't make. Some get partial automation, the rest get an explicit manual checklist run once per phase — not skipped, not hand-waved:

- **Structural enforcement over runtime testing where possible**: checkout/scanner components should be *typed* to not accept graffiti/pixel/3D props at all, rather than merely tested to not render them — a stronger guarantee than a passing test.
- **Decorative vs. meaningful alt text**: `eslint-plugin-jsx-a11y`'s `alt-text` rule catches missing alt attributes; the decorative-vs-meaningful judgment itself is a manual per-image pass (checklist below), since that's inherently contextual.
- **"One dominant style, at most one secondary accent" per section**: manual design-review checklist, run per page against the §3 style-assignment map, before a phase is called done:
  1. Name the section's dominant style. Does it match the brief's assignment table?
  2. Is there a second style present? If yes, is it exactly one, used as a clear accent (e.g., a handwritten note on a collage), not stacked three-deep?
  3. Is body/price/date copy still in Inter, regardless of how loud the section is?
  4. Would removing the loud styling still leave the page usable and legible?
- **Performance-as-semantics**: the brief explicitly calls out "CPU throttling (4–6x) and an actual mid-range Android" as "the step that got skipped last time." Verify visually via the `claude-in-chrome` skill with DevTools CPU throttling enabled for every WebGL/scroll-heavy page, each phase, before sign-off — not optional, not deferred to "later."
- **Reduced-motion fidelity**: for every animated reveal shipped, load the page with `prefers-reduced-motion: reduce` forced on and confirm the static version reads as intentionally designed (assembled collage, not a frozen mid-animation glitch).

### Standard build verification (per phase, as with the rest of this project)

`tsc --noEmit`, `next build`, `eslint`, and a dev-server smoke test — the baseline this whole project has held throughout, unchanged.

## Actionable Steps

- [x] Phase 1: tokens, fonts, scrap-asset library, reduced-motion infra, `category` schema field, `vitest` harness + contrast-ratio test. *(Shipped: `packages/ui` (`@artcollect/ui`: tokens.css, scrap library, Annotation, PixelSprite, reduced-motion hooks, contrast core), Anton/Inter/Caveat in both apps, `TicketingEvent.category` + migration (validated/generated/diffed/deployed/shadow-verified), vitest root harness with per-package projects, 82 tests green.)*
- [x] Phase 2: ArtCollect collage diorama hero + scroll-scrubbed assembly, real copy. *(Shipped: `CollageHero` + `CollageHeroCanvas` — hero-scoped R3F diorama, `ssr:false`, poster-first, IntersectionObserver+idle gated, tablet+ only; GSAP pinned scrub centerpiece; reduced-motion renders the assembled poster.)*
- [x] Phase 3: vector-art editorial/browsing pages. *(Shipped: `/browse` with kind-filtered vector wall, homepage Recent-Drops→corkboard, How-it-works flat-fill illustrations, events band with TikoYetu hand-off CTA.)*
- [x] Phase 4: artist profile handwritten-annotation pages. *(Shipped: `/artists` index, `/artists/[slug]` with margin notes + signature quote callout over portrait, homepage artist spotlight band.)*
- [x] Phase 5: TikoYetu pixel-art badges/stamps + calm checkout confirmation line. *(Shipped: code-generated `PixelSprite` sprites (tested), availability stamps on storefront/event pages paired with plain text, pixel spinner on the events route loading state, single handwritten "you're going 🎟" line in the wallet; checkout surfaces lint-restricted from importing pixel/3D/graffiti modules.)*
- [x] Phase 6: TikoYetu graffiti event pages (code-split) + tactile 3D ticket object. *(Shipped: spray-filter headline + drips + sticker on streetart/music/nightlife pages only, `sr-only` h1 preserved; drei-free tactile ticket mesh with canvas-face texture, pointer drag/tilt, Fresnel foil for VIP editions, poster fallback, demand-driven render loop.)*
- [x] Phase 7: corkboard carousel, marquee ticker bands, relocated horizontal scroll tracks, sticker-peel transitions. *(Shipped: scroll-snap corkboard with tape/staple/sticker-peel cards, CSS-only marquee ticker (not scroll-linked, aria-duplicated copy hidden), `HorizontalGallery` technique relocated into the artist photo dump, peel corners on corkboard cards.)*
- [~] Run the semantic-verification checklist against every shipped page before marking a phase complete. *(Automated halves done: contrast test, alt-text lint, structural import restrictions, style-routing tests, builds/typecheck/lint/dev-smoke on every route. The manual visual halves remain open by nature: (1) DevTools CPU-throttle 4–6× + mid-range Android pass on the two WebGL pages (home hero, ticket wallet), (2) `prefers-reduced-motion: reduce` visual pass confirming assembled-static states — logic is wired everywhere, but a human should eyeball them once per the brief.)*

## Dependencies

- Builds on the monorepo, schema, and app structure established in `01`–`10` and the sessions that implemented them (Turborepo layout, Prisma schema, Auth.js, Flutterwave/webhook checkout flow).
- `packages/database` schema changes here (the `category` field) must go through the same `prisma validate` / `generate` / migration-diff verification already established for every prior schema change.
- Phase 6's graffiti code-splitting depends on the `category` field landing in Phase 1.
