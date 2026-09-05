import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

/**
 * Twenty open art causes across East Africa, denominated in KES or USD,
 * each publishing what a donation buys (paint litres, screen meshes,
 * stipend weeks,…) and a live ledger. Idempotent — re-runs only fill in
 * causes and demo donations that are missing, never double-counting.
 *
 * Minor units: KES and USD both use cents (×100), matching the schema.
 */

const COVERS = [
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1549289524-06cf8837ace5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1574182245530-967d9b3831af?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551913902-c92207136625?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80",
];

interface CauseSpec {
  slug: string;
  title: string;
  summary: string;
  story: string;
  country: string;
  organiserName: string;
  currency: "KES" | "USD";
  goalMinor: bigint;
  raisedMinor: bigint;
}

const CAUSES: CauseSpec[] = [
  // ---------------- KES-denominated (10) ----------------
  {
    slug: "kibera-walls-fund",
    title: "Kibera Walls Fund",
    summary: "Paint, lifts, and stipends for the community mural program turning Kibera's corridor walls into a public gallery.",
    story: `The Kibera Walls Walk ends where the work begins: twenty-six walls painted by fourteen young artists since 2024, every one funded in amounts smaller than a Saturday night out.\n\nThis fund covers the unglamorous middle of that pipeline — exterior paint that survives the rains, the generator for evening painting sessions, and a stipend week for the painters between commissions.\n\n## What a donation buys\n\n- 3,500 KES — one wall, sealed against the rains\n- 8,000 KES — a painter's stipend week\n- 30,000 KES — a full weekend workshop, materials in\n\nReceipts are published monthly as a paint-litre and stipend-week ledger. The wall list is public; the till is public.`,
    country: "Kenya",
    organiserName: "Blue Room Collective",
    currency: "KES",
    goalMinor: 50000000n,
    raisedMinor: 3040000n,
  },
  {
    slug: "girls-who-print-mombasa",
    title: "Girls Who Print — Mombasa",
    summary: "A screen-printing workshop fund for teenage girls at the Coast: meshes, inks, and a press that stays after the residency ends.",
    story: `Screen printing is the cheapest way to turn a drawing into an income: one screen, one squeegee, ink by the litre. The equipment is the hard part.\n\nThis fund buys the boring, durable things — two aluminium screens, a bench press, registration hinges, and a year of ink — for a Mombasa workshop cohort of twelve girls, most of whom have never held a print bigger than a school exam.\n\n## What a donation buys\n\n- 5,000 KES — one screen, hinge-set and degreased\n- 12,000 KES — a term of Thursday ink\n- 45,000 KES — the bench press that stays when the residency doesn't\n\nThe cohort's first open-print day is planned as a public event.`,
    country: "Kenya",
    organiserName: "Mombasa Arts Trust",
    currency: "KES",
    goalMinor: 30000000n,
    raisedMinor: 485000n,
  },
  {
    slug: "kisumu-youth-mural-lab",
    title: "Kisumu Youth Mural Lab",
    summary: "Spray kits, scaffolding weeks, and mentorship stipends for the lakeside mural crew painting Kisumu's public walls.",
    story: `Kisumu's lakefront walls are the city's biggest blank canvas — and the young crew painting them are self-taught, working with borrowed ladders and partial cans.\n\nThis lab funds the gear that turns a crew into a regiment: shared spray kits with reclaim masks, fortnightly scaffolding hire so they stop climbing on each other, and a senior muralist stipend that keeps a mentor on site.\n\n## What a donation buys\n\n- 4,200 KES — a shared spray kit, masks and filters included\n- 9,500 KES — one scaffolding week for a six-wall block\n- 22,000 KES — a mentor's month on site\n\nWall-by-wall photographs and a materials ledger are published per block finished.`,
    country: "Kenya",
    organiserName: "Dunga Beach Arts",
    currency: "KES",
    goalMinor: 28000000n,
    raisedMinor: 710000n,
  },
  {
    slug: "nakuru-printmakers-collective",
    title: "Nakuru Printmakers Collective",
    summary: "Etching press restoration and copper-plate supplies for the Rift Valley's only open-access printmaking studio.",
    story: `The Nakuru Printmakers studio has a working etching press from 1987, a stock of copper plates donated by a retired Nairobi printer, and a waiting list of artists who can't afford commercial rates.\n\nThis fund restores the press to reliable tension, replaces the plate-stock as editions run through it, and keeps the studio open on Saturdays for artists who can only come after their weekday work.\n\n## What a donation buys\n\n- 6,000 KES — copper plate stock for a 30-print edition\n- 14,000 KES — press restoration parts and a technician day\n- 35,000 KES — a quarter's Saturday open-studio hours\n\nEach edition's proceeds and a materials-cost ledger are published per release.`,
    country: "Kenya",
    organiserName: "Rift Valley Printmakers",
    currency: "KES",
    goalMinor: 24000000n,
    raisedMinor: 560000n,
  },
  {
    slug: "thika-reuse-sculpture-yard",
    title: "Thika Reuse Sculpture Yard",
    summary: "Welding gas, angle-iron stock, and safety gear for the public sculpture yard building work from Thika's scrap stream.",
    story: `Thika's metal-fabrication corridor throws out usable steel daily. The Reuse Sculpture Yard pulls angle iron, sheet offcuts, and broken machinery out of that stream and turns it into public sculpture — but the gas, the grinding discs, and the safety gear come from donations.\n\n## What a donation buys\n\n- 3,800 KES — a refill of welding gas and a box of grinding discs\n- 11,000 KES — a month of angle-iron stock from the scrap merchants\n- 28,000 KES — a full set of yard safety gear (aprons, gloves, shields)\n\nA scrap-in, sculpture-out weight ledger is published monthly.`,
    country: "Kenya",
    organiserName: "Thika Makers Trust",
    currency: "KES",
    goalMinor: 20000000n,
    raisedMinor: 420000n,
  },
  {
    slug: "naivasha-arts-scholarship",
    title: "Naivasha Arts Access Scholarship",
    summary: "Term stipends and materials bursaries for young artists from Naivasha's flower-farm communities to attend studio programmes.",
    story: `Naivasha's economy runs on floriculture, and its young artists grow up between greenhouses. A handful make it onto studio programmes every year — most drop out when the term stipend runs out.\n\nThis scholarship funds the gap: a term's living stipend, a materials bursary, and transport to Nairobi galleries for the cohort's annual showing.\n\n## What a donation buys\n\n- 7,500 KES — a term materials bursary (canvas, paint, mediums)\n- 15,000 KES — one student's term stipend\n- 40,000 KES — the annual cohort trip to Nairobi galleries\n\nBursary recipients and a spending ledger are published each term.`,
    country: "Kenya",
    organiserName: "Naivasha Creative Futures",
    currency: "KES",
    goalMinor: 32000000n,
    raisedMinor: 890000n,
  },
  {
    slug: "machakos-ceramics-cooperative",
    title: "Machakos Ceramics Cooperative",
    summary: "Kiln fuel, glaze chemicals, and wheels for the cooperative selling stoneware from Machakos clay to the Nairobi market.",
    story: `The Machakos ceramics co-op digs its own clay, throws on a shared wheel bank, and fires in a communal kiln — but fuel and glaze chemicals are the line items that break every production cycle.\n\n## What a donation buys\n\n- 4,500 KES — a kiln firing's fuel (charcoal and electricity top-up)\n- 9,000 KES — a production run of glaze chemicals\n- 26,000 KES — a new wheel for the shared bank\n\nA firing-count and sales ledger is published per market cycle.`,
    country: "Kenya",
    organiserName: "Machakos Clay Workers",
    currency: "KES",
    goalMinor: 18000000n,
    raisedMinor: 310000n,
  },
  {
    slug: "eldoret-runners-mural-project",
    title: "Eldoret Runners' Mural Project",
    summary: "Athlete-artist collaborations painting Eldoret's training-route walls: paints, brushes, and artist stipends.",
    story: `Eldoret's hills are a global running corridor, and the walls along its training routes are blank concrete. The Runners' Mural Project pairs athlete stories with local artists to paint them — a long-running collaboration between the town's two kinds of endurance.\n\n## What a donation buys\n\n- 3,200 KES — exterior paint for one athlete-portrait wall\n- 8,500 KES — an artist's stipend week on the route\n- 20,000 KES — a full collaborative mural, materials and stipend in\n\nEach finished wall is logged with the athlete's name and the artist's statement.`,
    country: "Kenya",
    organiserName: "Highlands Arts Eldoret",
    currency: "KES",
    goalMinor: 22000000n,
    raisedMinor: 640000n,
  },
  {
    slug: "nanyuki-conservation-art-fund",
    title: "Nanyuki Conservation Art Fund",
    summary: "Eco-art installations on the Mount Kenya trailheads: recycled materials, artist residencies, and community guide stipends.",
    story: `The trails into Mount Kenya pass through conservancies that double as gallery walls. This fund commissions eco-art installations built from trail-cleared waste — and pays the community guides who maintain them and lead the public walks.\n\n## What a donation buys\n\n- 5,000 KES — recycled-materials kit for one trailhead installation\n- 12,000 KES — a resident artist's fortnight on the trail\n- 24,000 KES — a guide quarter's maintenance stipend\n\nInstallation locations and a materials ledger are published per residency.`,
    country: "Kenya",
    organiserName: "Mount Kenya Trail Arts",
    currency: "KES",
    goalMinor: 26000000n,
    raisedMinor: 530000n,
  },
  {
    slug: "meru-coffee-canvas-programme",
    title: "Meru Coffee & Canvas Programme",
    summary: "Free weekend art workshops for Meru's coffee-zone children: paper, paints, and visiting-artist honoraria.",
    story: `Meru's coffee-growing communities fund a free Saturday workshop programme — children who would otherwise never hold a brush get paper, paints, and a visiting artist who knows the local schools.\n\n## What a donation buys\n\n- 2,800 KES — a term's paper and paint for thirty children\n- 7,000 KES — a visiting artist's honorarium for a workshop day\n- 18,000 KES — a term's worth of Saturday sessions\n\nAttendance numbers and a materials ledger are published each school term.`,
    country: "Kenya",
    organiserName: "Meru Cultural Trust",
    currency: "KES",
    goalMinor: 16000000n,
    raisedMinor: 275000n,
  },

  // ---------------- USD-denominated (10) ----------------
  {
    slug: "east-african-women-printmakers",
    title: "East African Women Printmakers",
    summary: "A regional screen-printing fund spanning Nairobi, Dar es Salaam, and Kampala: shared equipment, mesh, and ink.",
    story: `Women-run print studios in Nairobi, Dar es Salaam, and Kampala share equipment the way the old workshop movements did — but shipping a bench press across a border is a different problem from buying one.\n\nThis USD fund handles the cross-border kit: shared screens, hinge-set and degreased; ink by the litre shipped regionally; and a rolling residency slot so a Kampala printer can work a month in Nairobi.\n\n## What a donation buys\n\n- 35 USD — a hinge-set screen, shipped regionally\n- 90 USD — a litre-ink shipment across one border\n- 320 USD — one artist's month-long residency slot\n\nA cross-border equipment log and residency roster are published quarterly.`,
    country: "East Africa",
    organiserName: "Regional Printmakers Network",
    currency: "USD",
    goalMinor: 3000000n, // $30,000
    raisedMinor: 480000n,
  },
  {
    slug: "dar-es-salaam-street-art-fund",
    title: "Dar es Salaam Street Art Fund",
    summary: "Spray kits, wall-sealing primer, and artist fees for the Mwembe Tayari mural corridor on the Tanzanian coast.",
    story: `Dar's Mwembe Tayari corridor is a kilometre-long invitation — a continuous wall facing the old port, currently half-painted by a rotating crew of Tanzanian muralists.\n\n## What a donation buys\n\n- 28 USD — a shared spray kit with reclaim masks\n- 65 USD — wall-sealing primer for a ten-metre block\n- 250 USD — one artist's fee for a full mural panel\n\nPanel photographs and a materials ledger are published per block finished.`,
    country: "Tanzania",
    organiserName: "Dar Muralists Collective",
    currency: "USD",
    goalMinor: 2000000n,
    raisedMinor: 360000n,
  },
  {
    slug: "kampala-youth-photography-lab",
    title: "Kampala Youth Photography Lab",
    summary: "Film, printing paper, and darkroom chemicals for the Kampala youth photography programme exhibiting on the lake.",
    story: `A Kampala youth photography programme shoots on film, prints in a borrowed darkroom, and exhibits the work on the lakeside. The film and chemicals are imported and expensive — and the programme runs on exactly that.\n\n## What a donation buys\n\n- 22 USD — ten rolls of film and a printing-paper pack\n- 55 USD — a month's darkroom chemicals\n- 180 USD — one exhibitor's printing-and-framing costs\n\nExhibition dates and a materials-cost ledger are published per lakeside show.`,
    country: "Uganda",
    organiserName: "Lake Victoria Photo Lab",
    currency: "USD",
    goalMinor: 1500000n,
    raisedMinor: 240000n,
  },
  {
    slug: "kigali-arts-incubator",
    title: "Kigali Arts Incubator",
    summary: "Studio rent subsidies and materials grants for early-career Rwandan artists in the Kigali Innovation City studios.",
    story: `Kigali's studio rents are climbing with the city. The Arts Incubator keeps a block of studios affordable for early-career Rwandan artists through rent subsidies and a materials grant paid at the start of each resident's term.\n\n## What a donation buys\n\n- 40 USD — one artist's monthly studio rent subsidy\n- 80 USD — a term materials grant\n- 260 USD — a full quarter's subsidy and materials for one resident\n\nResident artists and a grant ledger are published each term.`,
    country: "Rwanda",
    organiserName: "Kigali Creative Hub",
    currency: "USD",
    goalMinor: 1800000n,
    raisedMinor: 290000n,
  },
  {
    slug: "addis-ababa-contemporary-fund",
    title: "Addis Ababa Contemporary Fund",
    summary: "Exhibition production and catalogue printing for independent Addis curators mounting shows outside the museum system.",
    story: `Addis Ababa's independent curators mount ambitious shows in pop-up spaces — but production and catalogue printing costs fall on the curators themselves. This fund covers exactly that: venue prep, lighting, and a printed catalogue per show.\n\n## What a donation buys\n\n- 30 USD — catalogue printing for one exhibition\n- 75 USD — venue lighting-and-prep day\n- 280 USD — full production support for one independent show\n\nA catalogue archive and a production-cost ledger are published per exhibition.`,
    country: "Ethiopia",
    organiserName: "Addis Independent Curators",
    currency: "USD",
    goalMinor: 2200000n,
    raisedMinor: 380000n,
  },
  {
    slug: "zanzibar-heritage-craft-fund",
    title: "Zanzibar Heritage Craft Fund",
    summary: "Tool kits and apprentice stipends keeping Zanzibar's door-carving and kanga-printing traditions in working practice.",
    story: `Zanzibar's stone-town carvers and kanga printers are ageing, and the apprenticeships that used to carry the craft forward have thinned. This fund supplies tool kits and a small apprentice stipend to workshops that take on a new learner.\n\n## What a donation buys\n\n- 25 USD — a starter carving-tool kit\n- 60 USD — one apprentice's monthly stipend\n- 200 USD — a workshop's quarter of tools and stipends\n\nWorkshops, apprentice names, and a materials ledger are published quarterly.`,
    country: "Tanzania",
    organiserName: "Zanzibar Craft Heritage Trust",
    currency: "USD",
    goalMinor: 1700000n,
    raisedMinor: 260000n,
  },
  {
    slug: "south-sudan-youth-arts-fund",
    title: "South Sudan Youth Arts Fund",
    summary: "Art supplies and workshop facilitation for Juba's youth arts programmes working across the city's displacement communities.",
    story: `Juba's youth arts programmes work across displacement communities with whatever materials reach the city — which is why a steady art-supply line matters more than a single big grant.\n\n## What a donation buys\n\n- 20 USD — a workshop pack (paper, paint, brushes) for twenty young people\n- 50 USD — a facilitator's month of workshop sessions\n- 170 USD — a quarter's supply line for one community programme\n\nWorkshop attendance and a supply ledger are published monthly.`,
    country: "South Sudan",
    organiserName: "Juba Youth Arts Initiative",
    currency: "USD",
    goalMinor: 1400000n,
    raisedMinor: 190000n,
  },
  {
    slug: "bujumbura-community-mural-fund",
    title: "Bujumbura Community Mural Fund",
    summary: "Exterior paints and artist coordination for the lakeside mural programme painting Bujumbura's public buildings.",
    story: `Bujumbura's lakeside public buildings are the backdrop for a growing community mural programme — neighbourhood artists painting the walls they walk past daily, coordinated by a small volunteer crew.\n\n## What a donation buys\n\n- 32 USD — exterior paint for a ten-metre wall\n- 70 USD — a coordination day for the volunteer crew\n- 230 USD — one full lakeside mural, paint and coordination in\n\nWall locations and a paint ledger are published per mural finished.`,
    country: "Burundi",
    organiserName: "Bujumbura Lakeside Arts",
    currency: "USD",
    goalMinor: 1600000n,
    raisedMinor: 225000n,
  },
  {
    slug: "lilongwe-arts-education-fund",
    title: "Lilongwe Arts Education Fund",
    summary: "School art-materials deliveries and teacher aides for Malawi's Lilongwe District schools without an art budget.",
    story: `Most Lilongwe District schools have no line item for art materials. This fund delivers a term pack to partner schools and funds a classroom aide who can run the session alongside the teacher.\n\n## What a donation buys\n\n- 18 USD — a term materials pack for one classroom\n- 48 USD — a classroom aide's month\n- 150 USD — a full term of packs and aides for one school\n\nSchool deliveries and a materials ledger are published each term.`,
    country: "Malawi",
    organiserName: "Lilongwe Arts Reach",
    currency: "USD",
    goalMinor: 1300000n,
    raisedMinor: 180000n,
  },
  {
    slug: "diaspora-artist-relief-fund",
    title: "East African Diaspora Artist Relief",
    summary: "Emergency materials and studio grants for East African artists abroad facing a sudden loss of workspace or materials.",
    story: `An East African artist abroad who loses a studio, a materials shipment, or a commission in the same month is one bad quarter out of the practice. This relief fund is the fast, small grant that bridges that quarter — no fifteen-page application, just a verified need and a quick payout.\n\n## What a donation buys\n\n- 100 USD — an emergency materials grant\n- 250 USD — a one-month studio-bridge grant\n- 500 USD — a full quarter's relief for one artist\n\nGrants paid and a spending ledger are published monthly (recipients anonymous by default).`,
    country: "East Africa",
    organiserName: "Diaspora Artist Support",
    currency: "USD",
    goalMinor: 4000000n,
    raisedMinor: 620000n,
  },
];

/** Demo donors seeded once per cause so the progress bars read honestly. */
const DEMO_DONORS: { name: string; key: string; amountMinor: bigint; message: string | null }[] = [
  { name: "Amina H.", key: "amina", amountMinor: 50000n, message: "For the work on the ground." },
  { name: "Kariuki M.", key: "kariuki", amountMinor: 120000n, message: "Stipend week, with respect." },
  { name: "Anonymous", key: "anon", amountMinor: 200000n, message: null },
  { name: "Grace W.", key: "grace", amountMinor: 80000n, message: "Keep the walls painted." },
  { name: "D. Otieno", key: "otieno", amountMinor: 340000n, message: "My first print came from a workshop like this." },
];

async function main() {
  let created = 0;
  for (let i = 0; i < CAUSES.length; i++) {
    const spec = CAUSES[i];
    const cover = COVERS[i % COVERS.length];
    await prisma.donationCause.upsert({
      where: { slug: spec.slug },
      update: {},
      create: {
        slug: spec.slug,
        title: spec.title,
        summary: spec.summary,
        story: spec.story,
        country: spec.country,
        organiserName: spec.organiserName,
        goalMinor: spec.goalMinor,
        currency: spec.currency,
        coverImageKey: cover,
        status: "published",
      },
    });

    const cause = await prisma.donationCause.findUniqueOrThrow({ where: { slug: spec.slug } });
    const existing = await prisma.donation.count({ where: { causeId: cause.id } });
    if (existing > 0) continue; // never double-count demo donations

    let remaining = spec.raisedMinor;
    for (const donor of DEMO_DONORS) {
      if (remaining <= 0n) break;
      const amount = donor.amountMinor > remaining ? remaining : donor.amountMinor;
      remaining -= amount;
      await prisma.donation.create({
        data: {
          causeId: cause.id,
          donorEmail: `demo-${spec.slug}-${donor.key}@example.com`,
          donorName: donor.name === "Anonymous" ? null : donor.name,
          message: donor.message,
          anonymous: donor.name === "Anonymous",
          amountMinor: amount,
          currency: spec.currency,
          status: "succeeded",
          providerRef: `demo-${spec.slug}-${donor.key}`,
          webhookEventId: `demo-webhook-${spec.slug}-${donor.key}`,
        },
      });
    }
    created += 1;
  }
  const totalCauses = await prisma.donationCause.count();
  const totalDonations = await prisma.donation.count();
  console.log(`Causes seeded: ${created} new | total causes: ${totalCauses} | total donations: ${totalDonations}`);
  await prisma.$disconnect();
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
