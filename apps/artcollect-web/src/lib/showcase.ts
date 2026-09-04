import type { TicketAvailabilityBucket } from "@artcollect/contracts";

/**
 * Homepage "Main Wall" showcase items (docs/11-style continuation): the
 * three main things — art collection, ticketed events, donation causes —
 * interleaved into one ordered strip that feeds both the 3D ring carousel
 * and its poster fallback. Pure and unit-tested; the server page maps its
 * domain objects into `ShowcaseSeed`s, then `interleaveShowcaseSeeds`
 * round-robins them art → event → cause so no one kind crowds the ring.
 */

export type ShowcaseItemKind = "art" | "event" | "cause";

export interface ShowcaseSeed {
  /** Stable key (react key + 3D card identity). */
  key: string;
  kind: ShowcaseItemKind;
  title: string;
  subtitle: string;
  image: string | null;
  imageAlt: string;
  href: string;
}

const KIND_LABEL: Record<ShowcaseItemKind, string> = {
  art: "ART",
  event: "EVENT",
  cause: "CAUSE",
};

export function showcaseKindLabel(kind: ShowcaseItemKind): string {
  return KIND_LABEL[kind];
}

export const AVAILABILITY_LABEL: Record<TicketAvailabilityBucket, string> = {
  available: "Tickets available",
  low: "Selling fast",
  sold_out: "Sold out",
  closed: "Sales closed",
};

export function interleaveShowcaseSeeds(
  groups: { art: ShowcaseSeed[]; events: ShowcaseSeed[]; causes: ShowcaseSeed[] },
  max = 10,
): ShowcaseSeed[] {
  const queues = [groups.art, groups.events, groups.causes].map((q) => [...q]);
  const out: ShowcaseSeed[] = [];

  while (out.length < max && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && out.length < max) {
        out.push(next);
      }
    }
  }

  return out;
}
