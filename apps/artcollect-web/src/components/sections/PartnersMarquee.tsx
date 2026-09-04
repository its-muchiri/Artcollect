import Image from "next/image";
import { Handshake } from "lucide-react";

/**
 * County-partner logo marquee. Same compositor-only pattern as TickerBand:
 * the track is duplicated once and translated by exactly half its width so
 * the loop is seamless; the duplicate is aria-hidden; hover pauses; the
 * whole thing switches off under `prefers-reduced-motion`. No Lenis, no
 * ScrollTrigger, no rAF of our own.
 *
 * Seals sit on white "sticker" tiles so their mixed backgrounds read as one
 * collection on both the light paper and the dark canvas.
 */
const COUNTIES: { name: string; src: string }[] = [
  { name: "Baringo County", src: "/partners/counties/baringo.png" },
  { name: "Bomet County", src: "/partners/counties/bomet.png" },
  { name: "Busia County", src: "/partners/counties/busia.png" },
  { name: "Embu County", src: "/partners/counties/embu.png" },
  { name: "Homa Bay County", src: "/partners/counties/homa-bay.png" },
  { name: "Kajiado County", src: "/partners/counties/kajiado.png" },
  { name: "Kericho County", src: "/partners/counties/kericho.png" },
  { name: "Kilifi County", src: "/partners/counties/kilifi.png" },
  { name: "Kisumu County", src: "/partners/counties/kisumu.png" },
  { name: "Laikipia County", src: "/partners/counties/laikipia.png" },
  { name: "Mandera County", src: "/partners/counties/mandera.png" },
  { name: "Marsabit County", src: "/partners/counties/marsabit.png" },
  { name: "Meru County", src: "/partners/counties/meru.png" },
  { name: "Muranga County", src: "/partners/counties/muranga.png" },
  { name: "Nairobi City County", src: "/partners/counties/nairobi-city.png" },
  { name: "Nyandarua County", src: "/partners/counties/nyandarua.png" },
  { name: "Samburu County", src: "/partners/counties/samburu.png" },
  { name: "Siaya County", src: "/partners/counties/siaya.png" },
  { name: "Taita Taveta County", src: "/partners/counties/taita-taveta.png" },
  { name: "Tharaka-Nithi County", src: "/partners/counties/tharaka-nithi.png" },
  { name: "Trans-Nzoia County", src: "/partners/counties/trans-nzoia.png" },
  { name: "Vihiga County", src: "/partners/counties/vihiga.png" },
  { name: "Wajir County", src: "/partners/counties/wajir.png" },
  { name: "West Pokot County", src: "/partners/counties/west-pokot.png" },
];

function LogoTile({ county }: { county: { name: string; src: string } }) {
  return (
    <li
      className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-white p-2 shadow-[3px_3px_0_var(--ac-shadow-ink)]"
      title={`${county.name} government`}
    >
      <Image
        src={county.src}
        alt={`${county.name} government seal`}
        width={112}
        height={64}
        className="h-full w-full object-contain"
      />
    </li>
  );
}

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="group/row relative flex overflow-hidden">
      <div
        className="flex min-w-max animate-[partners-scroll_52s_linear_infinite] items-center group-hover/row:[animation-play-state:paused] motion-reduce:[animation:none]"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        {[false, true].map((isDuplicate) => (
          <ul
            key={isDuplicate ? "dup" : "row"}
            aria-hidden={isDuplicate || undefined}
            className="flex min-w-max items-center gap-4 pe-4"
          >
            {COUNTIES.map((county) => (
              <LogoTile key={`${isDuplicate ? "dup-" : ""}${county.name}`} county={county} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * `compact` renders the slim single-row band used on section pages;
 * the homepage uses the full two-row band with the heading block.
 */
export function PartnersMarquee({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section aria-label="ArtCollect works with county governments" className="relative z-10 border-t-2 border-ink bg-paper-deep py-5">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-[var(--ac-gutter)] pb-4">
          <Handshake size={16} className="shrink-0 text-ink/60" aria-hidden />
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            Working with county governments across Kenya
          </p>
        </div>
        <MarqueeRow />
        <style>{`@keyframes partners-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </section>
    );
  }

  return (
    <section aria-label="ArtCollect works with county governments" className="relative z-10 border-y-2 border-ink bg-paper-deep">
      <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] pb-2 pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            On the wall in county halls
          </h2>
          <p className="flex items-center gap-2 text-sm font-semibold text-ink/60">
            <Handshake size={16} aria-hidden />
            Working with county governments across Kenya
          </p>
        </div>
      </div>
      <div className="space-y-4 py-10">
        <MarqueeRow />
        <MarqueeRow reverse />
      </div>
      <style>{`@keyframes partners-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}
