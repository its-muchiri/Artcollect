import { EnquireIllustration, TicketIllustration, WallIllustration } from "@/components/art/illustrations";
import { FrameCorners, HeartStraight, Ticket } from "@/components/icons";

/**
 * "How it works" explainer (docs/11 Phase 3): the vector lane's flat-fill
 * illustration work — palette-capped, no secondary style. Copy stays in
 * Inter; headings in Anton.
 */
const STEPS = [
  {
    Icon: FrameCorners,
    Illustration: WallIllustration,
    title: "Discover the wall",
    body: "Browse every published work — collage, editions, photography — with live availability and the artist's own story attached to each piece.",
  },
  {
    Icon: HeartStraight,
    Illustration: EnquireIllustration,
    title: "Ask, or just collect",
    body: "Originals go through a short enquiry with the artist; editions and prints check out directly. Either way, the artist is one message away.",
  },
  {
    Icon: Ticket,
    Illustration: TicketIllustration,
    title: "Meet at the opening",
    body: "When a piece is part of a show, grab opening-night tickets through TikoYetu — clear pricing, instant QR, no ambiguity at the door.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-10 border-y-2 border-ink bg-paper-deep">
      <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-20">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
            How ArtCollect works
          </p>
          <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
            THREE MOVES, NO MYSTERY
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {STEPS.map(({ Icon, Illustration, title, body }, i) => (
            <div key={title} className="flex flex-col gap-5">
              <div className="border-2 border-ink bg-paper shadow-[4px_4px_0_rgba(22,19,17,1)]">
                <Illustration />
              </div>
              <div>
                <div className="flex items-center gap-2 text-cobalt">
                  <Icon size={20} weight="bold" aria-hidden />
                  <span className="font-display text-sm tracking-wide text-ink">
                    STEP {i + 1}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
