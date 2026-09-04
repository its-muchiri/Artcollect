/**
 * Development seed data.
 *
 * Mirrors the placeholder catalogue TikoYetu's UI was originally built
 * against (apps/tikoyetu-web/src/lib/mock-events.ts) so that once this runs
 * against a real database, the storefront looks identical — but every
 * order, hold, and ticket created against it from that point on is real.
 *
 * Run with `npm run seed` (packages/database) once DATABASE_URL points at
 * an actual Postgres instance and `prisma migrate deploy` has been run.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

async function main() {
  const blueRoom = await prisma.organisation.upsert({
    where: { slug: "blue-room-collective" },
    update: {},
    create: {
      name: "Blue Room Collective",
      slug: "blue-room-collective",
      type: "organiser",
      verificationStatus: "verified",
    },
  });

  const artcollectEditions = await prisma.organisation.upsert({
    where: { slug: "artcollect-editions" },
    update: {},
    create: {
      name: "ArtCollect Editions",
      slug: "artcollect-editions",
      type: "gallery",
      verificationStatus: "verified",
    },
  });

  const mombasaArtsTrust = await prisma.organisation.upsert({
    where: { slug: "mombasa-arts-trust" },
    update: {},
    create: {
      name: "Mombasa Arts Trust",
      slug: "mombasa-arts-trust",
      type: "organiser",
      verificationStatus: "verified",
    },
  });

  await prisma.ticketingEvent.upsert({
    where: { slug: "nairobi-jazz-night" },
    update: {},
    create: {
      slug: "nairobi-jazz-night",
      title: "Nairobi Jazz Night",
      description:
        "An evening of live jazz from East Africa's rising ensembles, in the Alchemist's open-air courtyard.",
      venue: "The Alchemist",
      city: "Nairobi",
      timezone: "Africa/Nairobi",
      startsAt: new Date("2026-10-18T18:30:00+03:00"),
      coverImageKey:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
      currency: "KES",
      status: "on_sale",
      // music → graffiti-styled event page (docs/11 style routing)
      category: "music",
      organisationId: blueRoom.id,
      tiers: {
        create: [
          { name: "General", priceMinor: 150000n, currency: "KES", capacity: 300, minPerOrder: 1, maxPerOrder: 6 },
          {
            name: "VIP (front row + bar)",
            priceMinor: 350000n,
            currency: "KES",
            capacity: 60,
            minPerOrder: 1,
            maxPerOrder: 4,
          },
        ],
      },
    },
  });

  await prisma.ticketingEvent.upsert({
    where: { slug: "monochrome-horizon-opening" },
    update: {},
    create: {
      slug: "monochrome-horizon-opening",
      title: "Monochrome Horizon — Opening Night",
      description:
        "Opening reception for the Monochrome Horizon photography collection — meet the artists, first pick of limited prints.",
      venue: "Circle Art Gallery",
      city: "Nairobi",
      timezone: "Africa/Nairobi",
      startsAt: new Date("2026-09-26T18:00:00+03:00"),
      coverImageKey:
        "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=1200&q=80",
      currency: "KES",
      status: "on_sale",
      category: "art",
      organisationId: artcollectEditions.id,
      tiers: {
        create: [
          { name: "Entry", priceMinor: 100000n, currency: "KES", capacity: 150, minPerOrder: 1, maxPerOrder: 8 },
        ],
      },
    },
  });

  await prisma.ticketingEvent.upsert({
    where: { slug: "coast-sculpture-fair" },
    update: {},
    create: {
      slug: "coast-sculpture-fair",
      title: "Coast Sculpture Fair",
      description: "A day-long open-air fair of coastal and Swahili sculpture, with live carving demonstrations.",
      venue: "Fort Jesus Grounds",
      city: "Mombasa",
      timezone: "Africa/Nairobi",
      startsAt: new Date("2026-11-02T10:00:00+03:00"),
      coverImageKey:
        "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80",
      currency: "KES",
      status: "on_sale",
      category: "art",
      organisationId: mombasaArtsTrust.id,
      tiers: {
        create: [
          { name: "Day pass", priceMinor: 80000n, currency: "KES", capacity: 500, minPerOrder: 1, maxPerOrder: 10 },
        ],
      },
    },
  });

  await prisma.ticketingEvent.upsert({
    where: { slug: "kibera-walls-walk" },
    update: {},
    create: {
      slug: "kibera-walls-walk",
      title: "Kibera Walls Walk",
      description:
        "A guided walking tour of Nairobi's boldest street-art corridors, ending with paint and demo sessions with the artists behind the walls.",
      venue: "Kibera Drive gate",
      city: "Nairobi",
      timezone: "Africa/Nairobi",
      startsAt: new Date("2026-10-04T09:30:00+03:00"),
      coverImageKey:
        "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?auto=format&fit=crop&w=1200&q=80",
      currency: "KES",
      status: "on_sale",
      // streetart → graffiti-styled event page (docs/11 style routing)
      category: "streetart",
      organisationId: blueRoom.id,
      tiers: {
        create: [
          { name: "Walker", priceMinor: 50000n, currency: "KES", capacity: 6, minPerOrder: 1, maxPerOrder: 6 },
        ],
      },
    },
  });

  // --- Demo availability states (dev seed only) -------------------------
  // Active holds reduce live remaining (capacity − issued − active holds).
  // They make the storefront's "sold out" and "last few" pixel-stamp
  // states renderable against real data. Deleted alongside orders by the
  // normal hold lifecycle; harmless in a dev database.
  const kiberaEvent = await prisma.ticketingEvent.findUniqueOrThrow({
    where: { slug: "kibera-walls-walk" },
    include: { tiers: true },
  });
  const kiberaTier = kiberaEvent.tiers[0];
  if (kiberaTier) {
    await prisma.inventoryHold.createMany({
      data: Array.from({ length: kiberaTier.capacity }, () => ({
        tierId: kiberaTier.id,
        quantity: 1,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })),
    });
  }

  const jazzEvent = await prisma.ticketingEvent.findUniqueOrThrow({
    where: { slug: "nairobi-jazz-night" },
    include: { tiers: true },
  });
  const jazzVip = jazzEvent.tiers.find((tier) => tier.name.startsWith("VIP"));
  if (jazzVip) {
    // 60 capacity, 53 held → 7 remaining (11.7%) → "low" bucket.
    await prisma.inventoryHold.createMany({
      data: Array.from({ length: 53 }, () => ({
        tierId: jazzVip.id,
        quantity: 1,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      })),
    });
  }

  // Phase 4 (docs/11): a published artist profile so the handwritten
  // annotation pages render against real rows.
  const wanjikuUser = await prisma.user.upsert({
    where: { email: "wanjiku@example.com" },
    update: {},
    create: {
      email: "wanjiku@example.com",
      name: "Wanjiku Mwangi",
      roles: { create: { role: "artist" } },
    },
  });

  const wanjiku = await prisma.artistProfile.upsert({
    where: { slug: "wanjiku-mwangi" },
    update: {},
    create: {
      userId: wanjikuUser.id,
      slug: "wanjiku-mwangi",
      tagline: "Mixed-media collage artist rebuilding Nairobi's overlooked faces from the city's own paper.",
      bio: "Mixed-media collage artist in Nairobi. Wanjiku cuts, tears, and reassembles city ephemera — matatu stickers, market receipts, newspaper obituaries — into large-scale portraits of the people the city overlooks.",
      location: "Nairobi, Kenya",
      websiteUrl: "https://example.com/wanjiku",
      visibility: "published",
    },
  });

  // Wanjiku is a demonstration artist (stock portrait, invented bio) — her
  // timeline and collaborations below are consistent invented detail for
  // that same placeholder persona, not claims about a real person. Compare
  // Ben Mungai further down: real artist, real photos, so his equivalent
  // sections stay empty rather than inventing history for him.
  await prisma.artistDiscipline.deleteMany({ where: { artistId: wanjiku.id } });
  await prisma.artistDiscipline.createMany({
    data: [
      {
        artistId: wanjiku.id,
        name: "Paper Collage",
        emoji: "🎨",
        tier: "primary",
        description:
          "Builds every portrait from paper the city already discarded — matatu route receipts, market price lists, obituary pages — torn and layered rather than painted.",
        sortOrder: 0,
      },
      {
        artistId: wanjiku.id,
        name: "Archival Printmaking",
        emoji: "🖨️",
        tier: "primary",
        description:
          "Smaller studies from the same series reproduced as archival prints, extending each collage's life beyond the original board.",
        sortOrder: 1,
      },
      {
        artistId: wanjiku.id,
        name: "Street Photography",
        emoji: "📷",
        tier: "secondary",
        description:
          "Spends most working days walking her subjects' routes with a camera before a single piece of paper gets torn — the reference work behind every collage.",
        sortOrder: 2,
      },
      {
        artistId: wanjiku.id,
        name: "Community Workshops",
        emoji: "🧵",
        tier: "secondary",
        description:
          "Runs monthly paper-collage workshops for young people in her neighbourhood, teaching the same cut-and-layer technique her own portraits are built from.",
        sortOrder: 3,
      },
    ],
  });

  await prisma.artistTimelineEntry.deleteMany({ where: { artistId: wanjiku.id } });
  await prisma.artistTimelineEntry.createMany({
    data: [
      {
        artistId: wanjiku.id,
        year: 2026,
        title: "Obituaries series debuts",
        description:
          "Exhibited the eight-piece Obituaries print series alongside the original collage studies it was drawn from.",
        sortOrder: 0,
      },
      {
        artistId: wanjiku.id,
        year: 2025,
        title: "Matatu Portraits series completes",
        description:
          "Finished the twelfth and final piece portraying Nairobi's matatu conductors, each built entirely from that route's own paper.",
        sortOrder: 1,
      },
      {
        artistId: wanjiku.id,
        year: 2023,
        title: "First solo show, Paper City",
        description:
          "A single-artist exhibition of early collage work — the first time the matatu-sticker technique was shown publicly.",
        sortOrder: 2,
      },
      {
        artistId: wanjiku.id,
        year: 2021,
        title: "Began the Matatu Portraits series",
        description:
          "Started collecting route receipts and stickers from Nairobi's matatu network — the raw material for what became her signature series.",
        sortOrder: 3,
      },
    ],
  });

  await prisma.artistCollaboration.deleteMany({ where: { artistId: wanjiku.id } });
  await prisma.artistCollaboration.createMany({
    data: [
      {
        artistId: wanjiku.id,
        title: "ArtCollect Platform",
        description:
          "Featured artist on ArtCollect, with new collage work added to the platform as each series completes.",
        sortOrder: 0,
      },
      {
        artistId: wanjiku.id,
        title: "Neighbourhood Paper Workshops",
        description:
          "Monthly collage workshops for teenagers in her own neighbourhood, teaching the cut-and-layer technique from scratch with found paper.",
        sortOrder: 1,
      },
      {
        artistId: wanjiku.id,
        title: "Matatu Owners' Association Mural",
        description:
          "A collaborative mural with three matatu saccos, translating the portrait series onto the sides of two working vehicles.",
        sortOrder: 2,
      },
    ],
  });

  const artworks: { title: string; slug: string; medium: string; yearCreated: number; description: string; image: string; alt: string; priceMinor: bigint; edition: number }[] = [
    {
      title: "Conductor, Route 44",
      slug: "conductor-route-44",
      medium: "Paper collage on board",
      yearCreated: 2025,
      description:
        "A matatu conductor assembled from eleven months of route receipts, torn and reassembled on board.",
      image:
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=80",
      alt: "Torn-paper collage portrait in warm reds and blacks",
      priceMinor: 8500000n,
      edition: 1,
    },
    {
      title: "Market Day, Kawangware",
      slug: "market-day-kawangware",
      medium: "Paper collage on board",
      yearCreated: 2026,
      description:
        "The Saturday market rendered entirely from the market's own paper — price lists, invoice books, and carrier bags.",
      image:
        "https://images.unsplash.com/photo-1549289524-06cf8837ace5?auto=format&fit=crop&w=1200&q=80",
      alt: "Dense layered collage of market scenes in yellows and greens",
      priceMinor: 12000000n,
      edition: 1,
    },
    {
      title: "Obituaries (Study)",
      slug: "obituaries-study",
      medium: "Archival print, edition of 8",
      yearCreated: 2026,
      description:
        "A smaller study from the obituary series, printed archival on cotton rag.",
      image:
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80",
      alt: "Small monochrome collage study with red accents",
      priceMinor: 1800000n,
      edition: 8,
    },
  ];

  for (const art of artworks) {
    await prisma.artwork.upsert({
      where: { slug: art.slug },
      update: {},
      create: {
        artistId: wanjiku.id,
        title: art.title,
        slug: art.slug,
        medium: art.medium,
        yearCreated: art.yearCreated,
        description: art.description,
        status: "published",
        variants: {
          create: [
            {
              type: art.edition === 1 ? "original" : "limited_edition",
              priceMinor: art.priceMinor,
              currency: "KES",
              stockQuantity: art.edition,
              editionSize: art.edition === 1 ? null : art.edition,
            },
          ],
        },
        media: {
          create: [{ storageKey: art.image, altText: art.alt, sortOrder: 0 }],
        },
      },
    });
  }

  // Ben Mungai / Studio ArtDid.co — real artist, real photos (see
  // apps/artcollect-web/public/artists/ben-mungai/). Bio and artwork
  // descriptions are grounded in what's actually visible in the source
  // photos (palette, technique, composition) rather than invented
  // biographical facts (training history, exhibitions, years active) that
  // haven't been supplied — those stay blank until the artist provides
  // them, per the same "don't assume without verification" rule the
  // profile-writing brief itself asks for.
  const benUser = await prisma.user.upsert({
    where: { email: "ben.mungai@artdid.co" },
    update: {},
    create: {
      email: "ben.mungai@artdid.co",
      name: "Ben Mungai",
      roles: { create: { role: "artist" } },
    },
  });

  const ben = await prisma.artistProfile.upsert({
    where: { slug: "ben-mungai" },
    update: {},
    create: {
      userId: benUser.id,
      slug: "ben-mungai",
      tagline: "Acrylic painter blending pop-culture portraiture with quiet, conceptual still life, as Studio ArtDid.co.",
      bio: "Ben Mungai paints under the name Studio ArtDid.co. His acrylic and oil work moves between two registers: sharp pop-culture portraiture — Batman, a hollow-eyed antihero lifted from manga, a straw-hatted pirate crossing paths with a kung fu panda — and quieter, more conceptual pieces, like a handful of roses rooted in a hand grenade. A recurring figure, part soldier and part statesman, threads a red beret and a web of starlines across the continent behind him. Across both registers, Ben works in flat, confident color blocks and hard outlines — more comic panel than classical canvas — immediate up close and considered from across a room.",
      location: "Kenya",
      websiteUrl: "https://artdid.co",
      visibility: "published",
    },
  });

  // Real artist: disciplines below describe only what's directly visible
  // in his own work (technique, recurring subject matter) — no invented
  // timeline or collaborations. Unlike Wanjiku (a demonstration persona),
  // fabricating exhibition history or project credits for a real person
  // would be the exact "unsupported claims" the profile brief itself says
  // not to make. Those sections stay empty on his page until he supplies
  // real ones — see ArtistTimelineEntry/ArtistCollaboration, both left
  // unseeded for this artist deliberately.
  await prisma.artistDiscipline.deleteMany({ where: { artistId: ben.id } });
  await prisma.artistDiscipline.createMany({
    data: [
      {
        artistId: ben.id,
        name: "Acrylic Painting",
        emoji: "🎨",
        tier: "primary",
        description:
          "Works in flat, confident color blocks and hard outlines rather than blended tone — a style closer to comic-panel art than classical painting.",
        sortOrder: 0,
      },
      {
        artistId: ben.id,
        name: "Portraiture",
        emoji: "🖼️",
        tier: "primary",
        description:
          "Returns often to the single figure — a caped hero, a masked antihero, a soldier set against a map of the continent.",
        sortOrder: 1,
      },
      {
        artistId: ben.id,
        name: "Pop-Culture & Fan Art",
        emoji: "🎬",
        tier: "secondary",
        description:
          "Brings the same technique to characters pulled from manga, anime, and film, treating fan art with the same seriousness as his other portraits.",
        sortOrder: 2,
      },
    ],
  });

  const benArtworks: {
    title: string;
    slug: string;
    medium: string;
    description: string;
    image: string;
    alt: string;
    priceMinor: bigint;
  }[] = [
    {
      title: "Dark Knight Study",
      slug: "dark-knight-study",
      medium: "Acrylic on canvas",
      description:
        "A tight character study built from cool blues and near-black shadow, broken by a single warm gash of yellow. Painted in flat blocks rather than blended tone, leaning into its source material's graphic-novel roots rather than softening them.",
      image: "/artists/ben-mungai/dark-knight-study.jpeg",
      alt: "Acrylic painting of a caped, cowled figure in blue and black, in a graphic-novel style",
      priceMinor: 2500000n,
    },
    {
      title: "Transmission",
      slug: "transmission",
      medium: "Acrylic on canvas",
      description:
        "A figure crossed at the chest, drawing two glowing signals down from above like a pair of searchlights. The palette stays almost monochrome — charcoal, white, a flash of orange — so the two green lights read as the only thing in the room that's actually looking back.",
      image: "/artists/ben-mungai/transmission.jpeg",
      alt: "Surreal acrylic painting of a figure with two glowing green orbs overhead, in charcoal and white",
      priceMinor: 3200000n,
    },
    {
      title: "Market Day",
      slug: "market-day",
      medium: "Acrylic on board",
      description:
        "Two figures cross a market at sunset, rendered as flat silhouettes against a sky built entirely from warm orange and gold. A genre scene pared to its essentials — shape, gait, the weight of a basket — with the detail spent on light instead of faces.",
      image: "/artists/ben-mungai/market-day.jpeg",
      alt: "Silhouetted figures carrying baskets against an orange sunset sky, acrylic painting",
      priceMinor: 1800000n,
    },
    {
      title: "Static",
      slug: "static",
      medium: "Acrylic on canvas",
      description:
        "A figure in a suit and tie, head replaced by a plume of clashing color — pink, green, blue, gold — bleeding upward like static or smoke. The tension sits entirely in that swap: the clothing buttoned-up and literal, the head neither.",
      image: "/artists/ben-mungai/static.jpeg",
      alt: "Painting of a suited figure whose head is replaced by streaks of rainbow color",
      priceMinor: 3800000n,
    },
    {
      title: "Bloom",
      slug: "bloom",
      medium: "Acrylic on canvas",
      description:
        "Four red roses grow straight out of a hand grenade, in loose, spattered brushwork against a bare white ground. The quietest piece in the group — no text, no slogan, just the two objects doing the arguing themselves.",
      image: "/artists/ben-mungai/bloom.jpeg",
      alt: "Painting of red roses growing out of a hand grenade on a white background",
      priceMinor: 2200000n,
    },
    {
      title: "Dusk, Acacia",
      slug: "dusk-acacia",
      medium: "Acrylic on canvas",
      description:
        "A single acacia stands in silhouette against a burnt-orange sunset, birds crossing the sky in the distance. Straightforward East African landscape work, painted for the light rather than the tree.",
      image: "/artists/ben-mungai/dusk-acacia.jpeg",
      alt: "Silhouette of an acacia tree against an orange sunset with birds, acrylic painting",
      priceMinor: 1600000n,
    },
    {
      title: "Hollow",
      slug: "hollow",
      medium: "Acrylic on canvas",
      description:
        "A skull-like mask in stark black, white, and red gashes, built from the same hard-edged, high-contrast language as Ben's other character studies. Photographed the day it went up on the wall — nail still in hand.",
      image: "/artists/ben-mungai/hollow.jpeg",
      alt: "Ben Mungai holding a hammer beside a black, white, and red mask-like painting",
      priceMinor: 2900000n,
    },
    {
      title: "Crossover",
      slug: "crossover",
      medium: "Acrylic on canvas",
      description:
        "Three characters pulled from different corners of manga and anime fandom, staged together against a dusk skyline as if mid-panel. Fan art in subject, painted with the same confident color-blocking as the rest of the body of work.",
      image: "/artists/ben-mungai/crossover.jpeg",
      alt: "Painting of three anime and manga characters together against a dusk sky",
      priceMinor: 2400000n,
    },
    {
      title: "Continental",
      slug: "continental",
      medium: "Acrylic on canvas",
      description:
        "A portrait in red beret and fatigues, set against fine starlines and a faint outline of the African continent. The most technically demanding piece here — modeled shading on the face against flat pattern behind it.",
      image: "/artists/ben-mungai/continental.jpeg",
      alt: "Portrait painting of a figure in a red beret against a starline map of Africa",
      priceMinor: 4500000n,
    },
  ];

  for (const art of benArtworks) {
    await prisma.artwork.upsert({
      where: { slug: art.slug },
      update: {},
      create: {
        artistId: ben.id,
        title: art.title,
        slug: art.slug,
        medium: art.medium,
        description: art.description,
        status: "published",
        variants: {
          create: [
            {
              type: "original",
              priceMinor: art.priceMinor,
              currency: "KES",
              stockQuantity: 1,
              editionSize: null,
            },
          ],
        },
        media: {
          create: [{ storageKey: art.image, altText: art.alt, sortOrder: 0 }],
        },
      },
    });
  }

  // Art-sale auctions: launched on the 1st and 15th of each month, each
  // running 35 days — comfortably past the 7-day minimum, and long enough
  // relative to that ~14-day launch cadence that two consecutive launches
  // always overlap, so at least two auctions are active at any moment.
  // Computed relative to `now` (not hardcoded dates) so re-seeding keeps
  // the demo's "currently live" auctions actually current; there's no
  // scheduler in this app to keep creating new slots between reseeds; see
  // the `ArtworkAuction` schema comment.
  const AUCTION_DURATION_DAYS = 35;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

  function designatedLaunchDates(monthsBack: number, monthsForward: number, now = new Date()): Date[] {
    const dates: Date[] = [];
    for (let offset = -monthsBack; offset <= monthsForward; offset++) {
      const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1, 9, 0, 0));
      dates.push(base);
      dates.push(new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 15, 9, 0, 0)));
    }
    return dates.sort((a, b) => a.getTime() - b.getTime());
  }

  const auctionNow = new Date();
  const launchDates = designatedLaunchDates(3, 2, auctionNow);
  const endedLaunches = launchDates.filter((d) => addDays(d, AUCTION_DURATION_DAYS) <= auctionNow);
  // Every overlapping active launch, most recent last — there will always
  // be at least two by the schedule's design (see comment above).
  const activeLaunches = launchDates.filter(
    (d) => d <= auctionNow && addDays(d, AUCTION_DURATION_DAYS) > auctionNow,
  );
  const futureLaunches = launchDates.filter((d) => d > auctionNow);
  const [recentActiveLaunch, latestActiveLaunch] = activeLaunches.slice(-2);

  const auctionSeeds: { artworkSlug: string; launch: Date; startingPriceMinor: bigint }[] = [
    // Already ended — shows as "sold" on the timeline and artwork tiles.
    { artworkSlug: "dusk-acacia", launch: endedLaunches[endedLaunches.length - 1], startingPriceMinor: 1200000n },
    // The two currently overlapping active auctions.
    { artworkSlug: "conductor-route-44", launch: recentActiveLaunch, startingPriceMinor: 6500000n },
    { artworkSlug: "hollow", launch: latestActiveLaunch, startingPriceMinor: 2200000n },
    // Next designated launch — shows as "scheduled".
    { artworkSlug: "crossover", launch: futureLaunches[0], startingPriceMinor: 1800000n },
  ];

  for (const seed of auctionSeeds) {
    const artwork = await prisma.artwork.findUniqueOrThrow({ where: { slug: seed.artworkSlug } });
    const endsAt = addDays(seed.launch, AUCTION_DURATION_DAYS);
    await prisma.artworkAuction.upsert({
      where: { artworkId: artwork.id },
      update: { startsAt: seed.launch, endsAt, startingPriceMinor: seed.startingPriceMinor, currency: "KES" },
      create: {
        artworkId: artwork.id,
        startsAt: seed.launch,
        endsAt,
        startingPriceMinor: seed.startingPriceMinor,
        currency: "KES",
      },
    });
    // A piece under auction (at any stage) isn't sold at its fixed list
    // price through the normal checkout — pull its stock so the two
    // status badges never disagree.
    await prisma.artworkVariant.updateMany({ where: { artworkId: artwork.id }, data: { stockQuantity: 0 } });
  }

  // ArtCollect editorial event + the cross-platform link row (docs/08):
  // this is the one mapping table both codebases read. The CTA on
  // ArtCollect hands off to TikoYetu's own event page, which computes the
  // real availability state itself.
  const openingEvent = await prisma.event.upsert({
    where: { slug: "monochrome-horizon-opening" },
    update: {},
    create: {
      title: "Monochrome Horizon — Opening Night",
      slug: "monochrome-horizon-opening",
      venue: "Circle Art Gallery",
      startsAt: new Date("2026-09-26T18:00:00+03:00"),
      coverImageKey:
        "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=1200&q=80",
      status: "published",
      organisationId: artcollectEditions.id,
    },
  });

  await prisma.ticketingEventLink.upsert({
    where: { artcollectEventId: openingEvent.id },
    update: { checkoutUrl: "https://tikoyetu.co.ke/events/monochrome-horizon-opening" },
    create: {
      artcollectEventId: openingEvent.id,
      ticketingEventId: (await prisma.ticketingEvent.findUniqueOrThrow({
        where: { slug: "monochrome-horizon-opening" },
      })).id,
      checkoutUrl: "https://tikoyetu.co.ke/events/monochrome-horizon-opening",
      syncState: "synced",
    },
  });

  // Journal (ArtCollect editorial) — lightweight body conventions:
  // blank-line paragraphs, "## " headings, "> " blockquotes.
  const posts: { title: string; slug: string; excerpt: string; body: string; cover: string; author: string; tags: string[] }[] = [
    {
      title: "Why collage owns the Nairobi wall right now",
      slug: "why-collage-owns-the-nairobi-wall",
      excerpt:
        "Paper is cheap, city ephemera is everywhere, and the story of the street can't be painted in oil. A short defence of the torn edge.",
      cover:
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=80",
      author: "Njeri Wachira",
      tags: ["collage", "nairobi", "scene"],
      body: `Walk past any studio block in Industrial Area right now and you'll hear it before you see it: paper tearing.

Collage suits this city. The material is the message — matatu stickers, market receipts, obituary columns, clinic cards — all of it already carrying the city's handwriting. Nothing needs to be invented; it needs to be reassembled.

## The receipts are the palette

Wanjiku Mwangi builds portraits from eleven months of route receipts. The ink fades differently depending on which kiosk printed it, so the skin of a face carries its own weather. You can't buy that in a tube.

> The material already did the work. I just decide what it was working on.

## What to watch

Three shows before December, all collage-forward, all with openings you can actually attend. If the wall assembles itself the way our homepage promises, this scene is how.`,
    },
    {
      title: "Studio visit: Wanjiku Mwangi on cutting a city into a face",
      slug: "studio-visit-wanjiku-mwangi",
      excerpt:
        "Tea, torn newspaper, and a work-in-progress that started as a complaint about bus fare. We spent an afternoon in Kawangware.",
      cover:
        "https://images.unsplash.com/photo-1549289524-06cf8837ace5?auto=format&fit=crop&w=1200&q=80",
      author: "Njeri Wachira",
      tags: ["studio visit", "collage"],
      body: `The studio is a converted shopfront with a bead curtain and a wall of small paper drawers labelled by hand: FACES, HANDS, SKY, RECEIPTS (BLUE).

Wanjiku works standing. Each figure starts as a single torn silhouette — no pencil underdrawing, she says, because pencil is already a lie about where the edge will go.

## On the obituaries series

The newest piece uses obituary columns donated by families who wanted the names kept somewhere other than a drawer. The faces in the series are composites; the names inside them are not.

> Every name in that work was printed twice: once by the newspaper, once by the person who kept it.

She prints small editions of the studies so the series can travel to people who will never see the wall in person. That's what the edition money funds — paper, ink, and the courier to Mombasa.`,
    },
    {
      title: "Five community walls that raised themselves this year",
      slug: "five-community-walls-that-raised-themselves",
      excerpt:
        "Murals funded by twenty-bob donations, weekend print workshops, and the maths of why small amounts beat one big cheque.",
      cover:
        "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?auto=format&fit=crop&w=1200&q=80",
      author: "Otieno Odhiambo",
      tags: ["community", "causes", "murals"],
      body: `A can of exterior paint costs about 3,500 shillings. A weekend workshop, materials included, lands near 30,000. These are not gallery numbers — they are matatu-stage numbers, which is exactly why small donations work.

## The maths of many

One donor giving 50,000 paints one wall. Five hundred donors giving 100 paint eight walls and pay two young artists a month's stipend each. The second wall list is longer, and the stipend matters more than the paint.

## Where the money actually goes

Every cause listed here publishes its receipts: paint litres, brush counts, stipend weeks. If a cause can't show you the till slip, it doesn't get a page.`,
    },
    {
      title: "Where your donation actually goes: inside the Kibera Walls Fund",
      slug: "inside-the-kibera-walls-fund",
      excerpt:
        "A line-by-line look at what an art donation buys on ArtCollect — paint, generator fuel, and painter stipends — and why the receipts are public.",
      cover:
        "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?auto=format&fit=crop&w=1200&q=80",
      author: "Otieno Odhiambo",
      tags: ["donations", "causes", "murals", "transparency"],
      body: `"Where does the money actually go" is the first question anyone asks before donating to an art cause, and it's a fair one — most giving pages answer it with a stock photo and a big round number. The Kibera Walls Fund answers it with a shopping list.

## What a donation actually buys

Every cause page on ArtCollect breaks its goal into real line items instead of one abstract target. For the Walls Fund, that's exterior paint rated to survive the rains, a generator so painters can keep working after the light goes, and stipend weeks for the fourteen young artists doing the actual painting. Twenty bob (KES 20) genuinely moves the needle when it's added to five hundred other twenty-bob gifts — that's the arithmetic the fund is built on, not a slogan.

## The receipts are the point, not an afterthought

This isn't a registered charity making a tax claim — it's an organiser publishing a public ledger. Paint litres bought, brush counts, stipend weeks paid: all of it posted monthly against the goal, in the open, so a KES 100 donor can see exactly what their gift became. If a cause can't show its till slip, it doesn't get a page on this platform.

## How checkout actually works

Donating runs through the same payment rail as event tickets: pick an amount (or set your own), pay by M-Pesa or card, and get a receipt the moment payment clears — no separate account, no waiting. You can donate anonymously or have your name (and a short message, if you want one) show up on the cause's public supporter list.

> Every shilling is receipted — paint litres and stipend weeks, published.

That's not a tagline here. It's the actual mechanism a wall gets painted by.`,
    },
    {
      title: "Why donate to an art cause instead of just buying a piece",
      slug: "why-donate-to-an-art-cause",
      excerpt:
        "Buying art supports one artist directly. Donating to an art cause funds the workshops, materials, and stipends that make the next ten artists possible. Both matter.",
      cover:
        "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=1200&q=80",
      author: "Njeri Wachira",
      tags: ["donations", "causes", "community"],
      body: `Buying a piece and donating to a cause do different jobs, and it's worth being clear-eyed about which one you're actually doing, because a lot of well-meaning giving gets this backwards.

## Buying supports one artist; donating supports the pipeline

When you buy an original from ArtCollect, the money goes to the person who made it — that's the most direct support an artist can get, and it should usually come first. But most artists on this platform didn't start with a studio and a full set of materials. They started at a workshop that gave them their first screen-printing rig, or a residency stipend that covered a month of rent while they worked. Causes fund that earlier, less visible stage — the one that produces the artists whose work you'll eventually want to buy.

## Small, frequent gifts outperform one big one

The maths favours volume over size. A single KES 50,000 donation funds one mural. Five hundred people giving KES 100 each funds eight, plus a stipend week two painters actually get paid for. Causes on this platform are priced in matatu-fare amounts on purpose — a KES 20 or KES 100 gift is a real, complete unit of the goal, not a rounding error next to someone else's big cheque.

## What you get back

A public record, mostly. Your name (or "Anonymous," your call) on the cause's supporter list, a short message if you leave one, and a receipt the moment M-Pesa or your card clears. What this isn't: a tax deduction, a share of anything, or a promise about resale value. It's a wall that gets painted, or a workshop that gets equipped, because enough people decided twenty bob was worth it.

## Where to start

The current causes — a mural fund in Kibera, a screen-printing equipment fund for a Mombasa girls' cohort — both publish exactly what's been raised and what it bought, updated as it happens. Read the story, check the ledger, then decide if it's worth your KES 100.`,
    },
    {
      title: "How much is your artwork actually worth? A practical first read",
      slug: "how-much-is-your-artwork-worth",
      excerpt:
        "Before you pay for a formal appraisal, here's how art valuation actually works — provenance, condition, edition size, and the comparables that set a real price.",
      cover:
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80",
      author: "Otieno Odhiambo",
      tags: ["valuation", "collecting", "education"],
      body: `"What's it worth" is a harder question than it sounds, mostly because most people are actually asking three different questions at once: what did it cost, what could I sell it for, and what does a professional appraiser think. Here's how to start answering the second one yourself, before you pay anyone for the third.

## The four things that actually move a price

Provenance first — who owned it, and can that be proven. A piece with a clean paper trail back to the artist is worth more than an identical one with a shrug for a backstory. Condition second: foxing, fading, a repaired tear, all of it discounted, sometimes badly. Edition size third — a unique original and print 4 of 200 are not the same asset, even from the same hand. And market comparables last: what has this artist's other work actually sold for recently, not what a gallery wishlist says it should.

## Original vs. edition changes everything

A one-of-one original carries scarcity a limited edition print never will, even a small one. That's why ArtCollect marks every listing "original" or an edition size up front — it's the single biggest lever on value, and it should be the first thing you check, not the last.

## What a formal appraisal actually adds

A paid appraisal earns its fee for insurance, estate, or resale documentation — a written, defensible opinion of value from someone with no stake in the sale. It is not required to make a reasonable first estimate yourself, and no platform (this one included) should pretend a quick online tool replaces one when real money or an insurance claim is on the line.

## Where value actually gets made, not just measured

The most reliable way to see real prices is to watch what comparable work by comparable artists actually sells for — which is exactly what a browsable, price-visible market does. Every published piece on ArtCollect carries its price openly, in the open, so the next artist's work has a real comparable to be priced against — not a guess.`,
    },
    {
      title: "A practical guide to starting your first art collection",
      slug: "starting-your-first-art-collection",
      excerpt:
        "You don't need a gallery relationship or a five-figure budget to start collecting. A beginner's guide to buying your first piece — and your second.",
      cover:
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=80",
      author: "Njeri Wachira",
      tags: ["collecting", "beginners", "education"],
      body: `Nobody starts an art collection on purpose. It's usually one piece that wouldn't leave you alone, followed six months later by the realization you now own two, and the word "collection" suddenly applies whether you planned it or not. Here's how to make that first piece a good one.

## Buy the piece, not the plan

Skip the checklist of "movements you should own." Buy what you'd genuinely be glad to see on your wall in five years, from an artist whose other work you'd also want to see. A collection built on real reactions to real pieces ages better than one built on a strategy.

## Read the story attached to the work

Every published piece here carries the story of how it was made, kept attached — not a plaque, an actual paragraph from the artist. That story is half of what you're buying. A piece with no attached story, no visible artist, and no way to ask a question is a much riskier first purchase than one where you can read the medium, the year, and the reasoning, then just message the artist if something's unclear.

## Start with what's actually in your budget, honestly

An original from an emerging, still-building-a-name artist costs a fraction of an established one and can be just as good a piece. Small editions and prints cost less still, and they're a completely legitimate way to start — collecting isn't a status ladder you have to enter at the top.

## Keep the paperwork from day one

Save the listing, the price, the date, and any message exchange with the artist. That's your provenance, and it's worth ten times more in five years than it costs you in effort today — see our piece on how artwork is actually valued for why.

## The second piece is easier

The first purchase is the only genuinely hard one. After that you already know what you respond to, and the collection starts building its own logic — which is really the whole point.`,
    },
    {
      title: "What actually happens at an opening night, and how to get in",
      slug: "what-happens-at-an-opening-night",
      excerpt:
        "Art exhibition openings aren't as intimidating as they look from outside. What to expect, what to wear, and how tickets and QR entry actually work.",
      cover:
        "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=1200&q=80",
      author: "Njeri Wachira",
      tags: ["events", "openings", "guide"],
      body: `Opening night looks intimidating from the outside — a gallery full of people who seem to already know each other, standing near art they seem to already understand. It's less exclusive than it looks, and the mechanics of actually getting in are the easy part.

## What actually happens

An opening is the first public viewing of a show, usually two to three hours, usually with the artist actually in the room — which is the real reason to go. You look at the work, you can ask the artist a direct question about a piece if you want to, and mostly people just stand around talking. There's no test at the door.

## Getting in is a ticket, not an invitation

Openings tied to a show on ArtCollect hand off to TikoYetu for tickets — pick the event, pay by M-Pesa or card, and your ticket lands as a QR code the moment payment clears, in your inbox and in your ticket wallet on this site. At the door, someone scans the code. That's the entire process; there's no guest list to be on.

## What to actually wear and do

Whatever you'd wear to a nice coffee shop is over-thought enough. Arrive within the first hour if you want to actually talk to the artist before they're pulled into ten other conversations. You're allowed to just look, say nothing, and leave — nobody is grading your commentary.

## If you can't make it in person

Openings get folded into the site's timeline alongside every other event and art auction, so you can see what's coming and plan around it, and a piece from the show is usually still viewable and purchasable on the artist's profile page afterward even if you miss opening night itself.`,
    },
    {
      title: "Buying straight from the artist: what changes with no gallery markup",
      slug: "buying-direct-from-the-artist",
      excerpt:
        "Direct-from-artist purchases skip the gallery's cut, but they also skip the gallery's guardrails. What that trade actually means for buyers.",
      cover:
        "https://images.unsplash.com/photo-1549289524-06cf8837ace5?auto=format&fit=crop&w=1200&q=80",
      author: "Otieno Odhiambo",
      tags: ["buying", "artists", "market"],
      body: `A gallery typically takes a commission somewhere around half the sale price, in exchange for curation, promotion, and a physical space to view the work. Buying directly from the artist removes that cut — but it's worth understanding exactly what else it removes before you assume it's simply a discount.

## What you're not paying for

No gallery rent, no curator's fee, no framed white-cube experience — all of that is reflected in the price. On a platform like ArtCollect, the price on a listing is what the artist actually set for their own work, with no markup layered on top for anyone else's overhead.

## What doesn't change

The story still has to hold up. Every published piece carries its medium, year, and the artist's own description, and the artist is one message away if a detail's unclear — an inquiry goes straight to them, not to a gallery intermediary who'd have to relay your question. If anything, direct buying gets you a more informed answer, faster, because it's coming from the person who actually made the decision you're asking about.

## What you're trading away

A gallery's reputation is partly a filter — someone already decided this work was worth showing. Buying direct means doing more of that judgment yourself: does the artist have other work that holds up, is the story specific rather than generic, does the price make sense against comparable work by comparable artists. None of that is hard, it's just now your job instead of a curator's.

## Originals vs. editions, either way

Whether you're buying direct or through a gallery, the original-vs-edition distinction still does the heavy lifting on price and scarcity — that part of collecting doesn't change just because the transaction got shorter. What changes is how much of the artist's actual voice you hear before you decide.`,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        coverImageKey: post.cover,
        authorName: post.author,
        tags: post.tags,
        status: "published",
        publishedAt: new Date(),
      },
    });
  }

  // Donation causes (TikoYetu payment rail; ArtCollect editorial reads).
  const causeFixtures: {
    slug: string;
    title: string;
    summary: string;
    story: string;
    country: string;
    organiserName: string;
    goalMinor: bigint;
    cover: string;
    raisedMinor: bigint;
  }[] = [
    {
      slug: "kibera-walls-fund",
      title: "Kibera Walls Fund",
      summary:
        "Paint, lifts, and stipends for the community mural program turning Kibera's corridor walls into a public gallery.",
      story: `The Kibera Walls Walk ends where the work begins: twenty-six walls painted by fourteen young artists since 2024, every one funded in amounts smaller than a Saturday night out.

This fund covers the unglamorous middle of that pipeline — exterior paint that survives the rains, the generator for evening painting sessions, and a stipend week for the painters between commissions.

## What a donation buys

- 3,500 KES — one wall, sealed against the rains
- 8,000 KES — a painter's stipend week
- 30,000 KES — a full weekend workshop, materials in

Receipts are published monthly as a paint-litre and stipend-week ledger. The wall list is public; the till is public.`,
      country: "Kenya",
      organiserName: "Blue Room Collective",
      goalMinor: 50000000n, // KES 500,000
      cover:
        "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?auto=format&fit=crop&w=1200&q=80",
      // Dev-seed demo progress: ~KES 30,400 of 500,000 raised (~6%) once
      // the demo donors below are summed and capped.
      raisedMinor: 3040000n,
    },
    {
      slug: "girls-who-print-mombasa",
      title: "Girls Who Print — Mombasa",
      summary:
        "A screen-printing workshop fund for teenage girls at the Coast: meshes, inks, and a press that stays after the residency ends.",
      story: `Screen printing is the cheapest way to turn a drawing into an income: one screen, one squeegee, ink by the litre. The equipment is the hard part.

This fund buys the boring, durable things — two aluminium screens, a bench press, registration hinges, and a year of ink — for a Mombasa workshop cohort of twelve girls, most of whom have never held a print bigger than a school exam.

## What a donation buys

- 5,000 KES — one screen, hinge-set and degreased
- 12,000 KES — a term of Thursday ink
- 45,000 KES — the bench press that stays when the residency doesn't

The cohort's first open-print day is planned as a public event — tickets on this platform, naturally.`,
      country: "Kenya",
      organiserName: "Mombasa Arts Trust",
      goalMinor: 30000000n, // KES 300,000
      cover:
        "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=1200&q=80",
      raisedMinor: 485000n,
    },
  ];

  // Dev-seed demo donations: they make the progress bars honest-looking
  // until real donations flow through Flutterwave (which will use the
  // exact same model rows).
  const demoDonors = [
    { name: "Amina H.", amountMinor: 500000n, message: "For the wall on Mashimoni Road." },
    { name: "Kariuki M.", amountMinor: 120000n, message: "Stipend week, with respect." },
    { name: "Anonymous", amountMinor: 2000000n, message: null },
    { name: "Grace W.", amountMinor: 80000n, message: "Paint the whole corridor." },
    { name: "D. Otieno", amountMinor: 340000n, message: "My mother bought her first print at a workshop like this." },
  ];

  for (const causeFixture of causeFixtures) {
    await prisma.donationCause.upsert({
      where: { slug: causeFixture.slug },
      update: {},
      create: {
        slug: causeFixture.slug,
        title: causeFixture.title,
        summary: causeFixture.summary,
        story: causeFixture.story,
        country: causeFixture.country,
        organiserName: causeFixture.organiserName,
        goalMinor: causeFixture.goalMinor,
        currency: "KES",
        coverImageKey: causeFixture.cover,
        status: "published",
      },
    });

    const cause = await prisma.donationCause.findUniqueOrThrow({
      where: { slug: causeFixture.slug },
    });
    const existingDonations = await prisma.donation.count({
      where: { causeId: cause.id },
    });
    if (existingDonations > 0) continue;

    let remaining = causeFixture.raisedMinor;
    for (const donor of demoDonors) {
      if (remaining <= 0n) break;
      const amount = donor.amountMinor > remaining ? remaining : donor.amountMinor;
      remaining -= amount;
      const donorKey = donor.name.replace(/\W+/g, "").toLowerCase();
      await prisma.donation.create({
        data: {
          causeId: cause.id,
          donorEmail: `demo-${causeFixture.slug}-${donorKey}@example.com`,
          donorName: donor.name === "Anonymous" ? null : donor.name,
          message: donor.message,
          anonymous: donor.name === "Anonymous",
          amountMinor: amount,
          currency: "KES",
          status: "succeeded",
          providerRef: `demo-${causeFixture.slug}-${donorKey}`,
          webhookEventId: `demo-webhook-${causeFixture.slug}-${donorKey}`,
        },
      });
    }
  }

  // 404 Effect — Kutus entertainment company, real client (images in
  // apps/artcollect-web/public/events/404-effect/, originals in
  // img/404 effect/). Everything below is grounded in the two supplied
  // event posters plus the organiser's own account: GENESIS, Friday
  // 4th September at The Party Paris Lounge (Kutus–Kagio highway),
  // DJ Nadia on the decks, resident MC Hype Amoh hosting, tickets
  // KES 300, strictly 18+. The company's own track record (DJ Lyta,
  // Wakadinali, DJ Nadia past bookings; bonfires, camp nights, road
  // trips; residents MC Hype Amoh + DJ Selekta Skype) is stated in its
  // description — all supplied by the client, none invented.
  const effect404 = await prisma.organisation.upsert({
    where: { slug: "404-effect" },
    update: {},
    create: {
      name: "404 Effect",
      slug: "404-effect",
      type: "organiser",
      verificationStatus: "verified",
    },
  });

  await prisma.ticketingEvent.upsert({
    where: { slug: "genesis-404-effect-paris-lounge" },
    update: {},
    create: {
      slug: "genesis-404-effect-paris-lounge",
      title: "Genesis — 404 Effect Friday Night",
      description:
        "404 Effect's Friday night lands at The Party Paris Lounge, on the Kutus–Kagio highway. Tonight is GENESIS: DJ Nadia on the decks, resident MC Hype Amoh on the mic. 404 Effect are Kutus's party architects — the crew behind the bonfires, camp nights, and road trips, and the nights that have brought DJ Lyta, Wakadinali, and DJ Nadia to town. Residents: MC Hype Amoh · DJ Selekta Skype. Strictly 18+ — drink responsibly. M-Pesa paybill 222111, account 76999 (The Party Paris).",
      venue: "The Party Paris Lounge",
      city: "Kutus",
      timezone: "Africa/Nairobi",
      startsAt: new Date("2026-09-04T21:00:00+03:00"),
      endsAt: new Date("2026-09-05T03:00:00+03:00"),
      coverImageKey: "/events/404-effect/genesis-tickets.jpeg",
      currency: "KES",
      status: "on_sale",
      // nightlife → graffiti-styled event page (docs/11 style routing)
      category: "nightlife",
      organisationId: effect404.id,
      tiers: {
        create: [
          // The poster's own price: "BUY TICKETS 300/=".
          { name: "General", priceMinor: 30000n, currency: "KES", capacity: 300, minPerOrder: 1, maxPerOrder: 10 },
        ],
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
