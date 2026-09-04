/**
 * Journal content seed — 200 SEO-mapped articles for the ArtCollect
 * journal (donations, events, art sales/valuation, education, local
 * coverage, artist spotlights, TikoYetu guides).
 *
 * Run with: npm run seed:journal   (from packages/database)
 *
 * These are first-draft SEO skeletons: correct in their facts about the
 * platform (artists, causes, events, ticketing flow) and structured for
 * search intent, but meant for editorial review before they carry the
 * brand's voice. Publishing is staggered per the content calendar: the
 * first entries are `published`, the rest land as `draft` with future
 * dates — flip `status` to "published" as each is reviewed.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");
const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

type Cluster =
  | "donations"
  | "events"
  | "sales"
  | "education"
  | "niche"
  | "community"
  | "causes"
  | "local"
  | "brand"
  | "glossary"
  | "market"
  | "firstyear"
  | "faq"
  | "tiko"
  | "scene"
  | "spotlight";

interface ArticleSpec {
  title: string;
  cluster: Cluster;
  focus: string;
  city?: string;
}

const AUTHORS = ["Njeri Wachira", "Otieno Odhiambo", "The ArtCollect Desk"];

/** Towns for local-SEO coverage — the 8 originals plus 12 regional centres. */
const CITIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Kutus", "Thika", "Nyeri",
  "Malindi", "Diani", "Naivasha", "Nanyuki", "Kericho", "Bungoma", "Voi",
  "Machakos", "Kitui", "Meru", "Kakamega", "Garissa",
];

/** How many scheduled posts land per calendar day (the user's pace dial). */
const DAILY_RATE = 100;

const COVERS = [
  "/events/404-effect/genesis-tickets.jpeg",
  "/artists/ben-mungai/market-day.jpeg",
  "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
  "/artists/ben-mungai/bloom.jpeg",
  "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=1200&q=80",
  "/artists/ben-mungai/transmission.jpeg",
  "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?auto=format&fit=crop&w=1200&q=80",
  "/artists/ben-mungai/dusk-acacia.jpeg",
  "https://images.unsplash.com/photo-1549289524-06cf8837ace5?auto=format&fit=crop&w=1200&q=80",
  "/artists/ben-mungai/hollow.jpeg",
  "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=1200&q=80",
  "/artists/ben-mungai/continental.jpeg",
];

const INTERNAL_LINKS: Record<string, [string, string][]> = {
  donations: [
    ["/donate/kibera-walls-fund", "the Kibera Walls Fund"],
    ["/donate/girls-who-print-mombasa", "Girls Who Print — Mombasa"],
    ["/causes", "our open causes"],
  ],
  causes: [
    ["/donate/kibera-walls-fund", "the Kibera Walls Fund"],
    ["/donate/girls-who-print-mombasa", "Girls Who Print — Mombasa"],
    ["/causes", "every open cause, with receipts"],
  ],
  events: [
    ["/events/genesis-404-effect-paris-lounge", "Genesis — 404 Effect's Friday night at The Party Paris Lounge, Kutus"],
    ["/events/nairobi-jazz-night", "Nairobi Jazz Night at The Alchemist"],
    ["/events", "the full events calendar"],
  ],
  sales: [
    ["/browse", "the browse wall"],
    ["/artists/ben-mungai", "Ben Mungai's studio page"],
    ["/artists/wanjiku-mwangi", "Wanjiku Mwangi's studio page"],
  ],
  education: [
    ["/browse", "every published work on the wall"],
    ["/artists/wanjiku-mwangi", "Wanjiku Mwangi's collage process"],
    ["/artists/ben-mungai", "Ben Mungai's acrylic practice"],
  ],
  niche: [
    ["/browse", "the wall, top to bottom"],
    ["/artists/ben-mungai", "Ben Mungai's pop-culture portraiture"],
    ["/artists/wanjiku-mwangi", "Wanjiku's receipt-built portraits"],
  ],
  community: [
    ["/causes", "the causes page"],
    ["/donate/kibera-walls-fund", "a cause you can fund this week"],
    ["/journal", "the journal"],
  ],
  local: [
    ["/events", "what's on the calendar right now"],
    ["/browse", "work by local artists"],
    ["/artists/wanjiku-mwangi", "Wanjiku Mwangi (Nairobi)"],
  ],
  brand: [
    ["/browse", "the collection"],
    ["/events", "openings and shows"],
    ["/causes", "the causes we fund"],
  ],
  glossary: [["/browse", "the collection"], ["/journal", "the journal"]],
  market: [
    ["/browse", "what's actually on the wall"],
    ["/artists/ben-mungai", "Ben Mungai's priced works"],
  ],
  firstyear: [["/browse", "the collection"], ["/causes", "a cause to follow"]],
  faq: [["/causes", "the causes page"], ["/donate/kibera-walls-fund", "a live cause"]],
  tiko: [
    ["/events", "today's on-sale events"],
    ["/events/genesis-404-effect-paris-lounge", "tonight's Genesis party in Kutus"],
  ],
  scene: [
    ["/events/genesis-404-effect-paris-lounge", "Genesis at The Party Paris Lounge"],
    ["/events", "the events calendar"],
  ],
  spotlight: [
    ["/artists/wanjiku-mwangi", "Wanjiku Mwangi's profile"],
    ["/artists/ben-mungai", "Ben Mungai's profile"],
  ],
};

// ---------------------------------------------------------------------------
// Article table — exactly 200 specs.
// ---------------------------------------------------------------------------
const T = (title: string, cluster: Cluster, focus: string, city?: string): ArticleSpec => ({
  title,
  cluster,
  focus,
  city,
});

const SPECS: ArticleSpec[] = [
  // --- Donations & fundraising (10) ---
  T("How Your Art Donation Supports Our Programs", "donations", "tax benefits angle"),
  T("The Impact of Art Charity: Where Your Donations Go", "donations", "transparency"),
  T("5 Reasons to Donate Art Instead of Money", "donations", "in-kind gifts"),
  T("Artist Spotlight: Donated Works Creating Change", "donations", "impact stories"),
  T("Corporate Art Donations: A Guide for Businesses", "donations", "corporate giving"),
  T("Donating Your Collection: A Legal & Tax Guide for Kenyan Collectors", "donations", "legal guide"),
  T("Tax-Deductible Art Donations: What You Can (and Can't) Claim", "donations", "tax deductible art donations"),
  T("Fund Art Education: Why Small Recurring Gifts Beat Big Cheques", "donations", "fund art education"),
  T("Donate to Art Events: Sponsoring an Opening Night", "donations", "donate to art events"),
  T("Charitable Giving Through Art: A Beginner's Map", "donations", "charitable giving art"),

  // --- Art events & curation (12) ---
  T("Behind the Scenes: How We Curate Our Exhibitions", "events", "curation process"),
  T("The Complete Guide to East Africa's Art Events Calendar", "events", "events calendar"),
  T("What to Expect at an Art Show Opening (Your First, or Your Fiftieth)", "events", "art show openings"),
  T("Artist Talks & Networking Events: The Monthly Roundup", "events", "artist networking events"),
  T("Virtual Gallery Tours: How to Explore Art From Home", "events", "virtual gallery tours"),
  T("Emerging Artist Showcase: This Month's Features", "events", "emerging artist showcase"),
  T("How to Get the Most From an Art Exhibition", "events", "exhibition tips"),
  T("Art Curation Services: What a Curator Actually Does", "events", "art curation services"),
  T("Gallery Events vs Art Fairs: Which Is Better for New Collectors?", "events", "gallery events"),
  T("Charity Art Auctions: How Bidding Works From Start to Hammer", "events", "charity art auction"),
  T("The Annual Art Gala: Why the Big Night Matters", "events", "annual art gala"),
  T("Artist Talks and Panels: Questions Worth Asking Out Loud", "events", "artist talks and panels"),

  // --- Art sales & valuation (17) ---
  T("How to Buy Original Art: The Beginner's Guide", "sales", "buy original art online"),
  T("Emerging Artists to Collect Now: The Kenya Edition", "sales", "emerging artists for sale"),
  T("Limited Edition Prints vs Original Paintings: What Collectors Should Know", "sales", "limited edition prints"),
  T("Contemporary Art Market Trends: An East African Reading", "sales", "art market trends"),
  T("How to Choose Art That Appreciates (Without a Crystal Ball)", "sales", "art that appreciates"),
  T("Direct-From-Artist Purchases: What You Need to Know", "sales", "direct from artist"),
  T("How to Value Your Artwork: A Complete Guide", "sales", "how to value artwork"),
  T("What Professional Art Appraisal Really Costs (and When You Need It)", "sales", "art appraisal"),
  T("Is Art a Good Investment? An Honest Market Analysis", "sales", "art investment"),
  T("Art Provenance Research: Why Your Artwork's History Matters", "sales", "art provenance research"),
  T("Common Mistakes That Destroy Artwork Value", "sales", "resale value artwork"),
  T("Art Insurance: Protecting a Collection You Love", "sales", "art collection insurance"),
  T("Art Investment Returns: What the Long Data Says", "sales", "art investment returns"),
  T("Buying Original Art Online: The Safety Checklist", "sales", "buy art online"),
  T("Where to Buy Contemporary Art in East Africa", "sales", "where to buy contemporary art"),
  T("Investment-Grade Art: What Collectors Actually Mean by It", "sales", "investment grade art"),
  T("Art Valuation Services: The Four Times You Need One", "sales", "art valuation services"),

  // --- Educational (17) ---
  T("The Beginner's Guide to Art Collecting", "education", "beginner's guide to art collecting"),
  T("How to Start an Art Collection on Any Budget", "education", "how to start an art collection"),
  T("Art Collection Tips for Beginners: Your First Ten Works", "education", "art collection tips for beginners"),
  T("Understanding Contemporary Art: A Plain-Language Guide", "education", "understanding contemporary art"),
  T("Art Movements Explained: A Timeline You Can Actually Use", "education", "art movements explained"),
  T("How to Authenticate Artwork: Red Flags and Real Checks", "education", "how to authenticate artwork"),
  T("Art Conservation 101: Preserving a Collection in East African Climates", "education", "art conservation tips"),
  T("How to Read an Artwork: A Critical Analysis Guide", "education", "how to read an artwork"),
  T("Art Terminology Explained: The Collector's Glossary", "education", "art terminology explained"),
  T("How Artworks Are Valued: The Factors That Move Prices", "education", "how artworks are valued"),
  T("The Artist Career Path: Making It in Contemporary Art", "education", "artist career path"),
  T("Color Theory in Contemporary Art: Why Palette Is Meaning", "education", "color theory"),
  T("The Role of Galleries in Today's Art Market", "education", "role of galleries"),
  T("From Studio to Collector: The Journey of an Artwork", "education", "journey of artwork"),
  T("What Is Contemporary Art? A Definition That Helps", "education", "what is contemporary art"),
  T("How to Understand Modern Art (Even If You Think You Can't)", "education", "understand modern art"),
  T("African Modernism to Now: A Short History of the Continent's Art Movements", "education", "art movements history"),

  // --- Niche art types (8) ---
  T("Abstract Art Collecting: Start Here", "niche", "abstract art collecting"),
  T("The Contemporary Art Market: An East African View", "niche", "contemporary art market"),
  T("Emerging Artist Investment: Risk, Reward, and How to Do It Sensibly", "niche", "emerging artist investment"),
  T("Digital Art Collecting: Where to Begin (and What to Avoid)", "niche", "digital art collecting"),
  T("Limited Edition Prints: A Collector's Guide to Editions", "niche", "limited edition prints guide"),
  T("Art Photography Collecting: What to Look For", "niche", "art photography collecting"),
  T("The Sculptural Art Market: An Introduction for New Collectors", "niche", "sculptural art market"),
  T("Figurative Art Trends: Why the Figure Keeps Coming Back", "niche", "figurative art trends"),

  // --- Community & engagement (6) ---
  T("Member Spotlight: Collectors and Artists in Our Community", "community", "member spotlight"),
  T("How to Host a Private Gallery Viewing: A How-To Guide", "community", "private gallery viewing"),
  T("Become an Art Patron: Getting Involved Beyond Buying", "community", "become an art patron"),
  T("Art Collector Networking: Building Your Circle in East Africa", "community", "art collector meetups"),
  T("Volunteer With Us: Supporting the Arts With Your Time", "community", "volunteer with us"),
  T("Artist Residency Opportunities Across East Africa", "community", "artist residency opportunities"),

  // --- Causes deep-dives (10) ---
  T("Kibera Walls Fund: Paint Litres, Stipend Weeks, and Public Receipts", "causes", "community art programs"),
  T("Girls Who Print: Inside the Mombasa Screen-Printing Workshop Fund", "causes", "fund art education"),
  T("Why Twenty Small Donations Beat One Big Cheque", "causes", "art charity donations"),
  T("Community Art Programs in Kenya: What Actually Works", "causes", "community art programs kenya"),
  T("A Donor's Field Guide to Funding Art Education", "causes", "fund art education guide"),
  T("Support Artists Programs: What Actually Helps an Artist", "causes", "support artists program"),
  T("From Donation to Wall: How We Track Your Gift", "causes", "donation tracking"),
  T("Art Charity Donations vs Buying Art Directly: Which Helps More?", "causes", "donate vs buy"),
  T("The Art Market's Price Tiers: What KES Buys in Nairobi Studios", "causes", "art market nairobi"),
  T("Matching Gifts: How Employers Can Double Art Donations", "causes", "matching gifts"),

  // --- Glossary A–Z (12) ---
  T("Art Terminology A–B: From Abstract to Brushwork", "glossary", "glossary A–B"),
  T("Art Terminology C–D: Composition, Provenance's Cousin, and More", "glossary", "glossary C–D"),
  T("Art Terminology E–F: Editions, Editions, Editions", "glossary", "glossary E–F"),
  T("Art Terminology G–H: Giclée and Gesso", "glossary", "glossary G–H"),
  T("Art Terminology I–J: Impasto to Juxtaposition", "glossary", "glossary I–J"),
  T("Art Terminology K–L: Kiln-Fired to Limited", "glossary", "glossary K–L"),
  T("Art Terminology M–N: Medium to Numbered", "glossary", "glossary M–N"),
  T("Art Terminology O–P: Original to Provenance", "glossary", "glossary O–P"),
  T("Art Terminology Q–R: Quiet Painting to Run of the Show", "glossary", "glossary Q–R"),
  T("Art Terminology S–T: Series to Triptych", "glossary", "glossary S–T"),
  T("Art Terminology U–V: Underpainting to Variant", "glossary", "glossary U–V"),
  T("Art Terminology W–Z: White Ground to Zinc White", "glossary", "glossary W–Z"),

  // --- Market analysis series (6) ---
  T("East African Art Market: Q1 2026 Review", "market", "market q1"),
  T("East African Art Market: Q2 2026 Review", "market", "market q2"),
  T("East African Art Market: Q3 2026 Review", "market", "market q3"),
  T("East African Art Market: Q4 2026 Preview", "market", "market q4"),
  T("Auction Results: What Small Houses Tell Us About the Region", "market", "auction results"),
  T("Price Tiers Explained: From KES 15,000 Prints to Studio Originals", "market", "price tiers"),

  // --- First-year collector series (10) ---
  T("Your First Year Collecting Art: Months 1–2", "firstyear", "first year 1"),
  T("Your First Year Collecting Art: Month 3", "firstyear", "first year 3"),
  T("Your First Year Collecting Art: Month 4", "firstyear", "first year 4"),
  T("Your First Year Collecting Art: Month 5", "firstyear", "first year 5"),
  T("Your First Year Collecting Art: Month 6", "firstyear", "first year 6"),
  T("Your First Year Collecting Art: Months 7–8", "firstyear", "first year 7"),
  T("Your First Year Collecting Art: Month 9", "firstyear", "first year 9"),
  T("Your First Year Collecting Art: Month 10", "firstyear", "first year 10"),
  T("Your First Year Collecting Art: Month 11", "firstyear", "first year 11"),
  T("Your First Year Collecting Art: Month 12 — The Look Back", "firstyear", "first year 12"),

  // --- Donation FAQ series (8) ---
  T("Is My Art Donation Tax Deductible in Kenya?", "faq", "tax deductible kenya"),
  T("Donating Artwork vs Donating Money: The Honest FAQ", "faq", "donating artwork faq"),
  T("How Donation Funds Actually Reach Artists", "faq", "funds reach artists"),
  T("How Is My Donated Artwork Valued for a Receipt?", "faq", "donation valuation"),
  T("In-Kind Art Gifts: Materials, Studio Space, and Skills", "faq", "in-kind gifts"),
  T("Recurring Giving for the Arts: How Monthly Gifts Compound", "faq", "recurring giving"),
  T("Leaving Art to a Cause: A Short Guide to Bequests", "faq", "bequests"),
  T("Can I Donate Art From Another Country? Cross-Border Questions", "faq", "cross-border donations"),

  // --- TikoYetu ticketing guides (8) ---
  T("How TikoYetu QR Tickets Work: From Payment to the Door", "tiko", "qr tickets"),
  T("M-Pesa Checkout on TikoYetu: A Step-by-Step Guide", "tiko", "mpesa checkout"),
  T("What \"Selling Fast\" Actually Means on an Event Page", "tiko", "selling fast"),
  T("Sold-Out Events: What Happens Next on TikoYetu", "tiko", "sold out policy"),
  T("Running Events on TikoYetu: An Organiser's Onboarding Guide", "tiko", "organiser onboarding"),
  T("Door Checks Made Simple: Validating TikoYetu Tickets at the Gate", "tiko", "ticket validation"),
  T("Group Bookings: Buying Tickets for the Whole Crew", "tiko", "group bookings"),
  T("Gala Tickets, Dinner Tickets, After-Party Tickets: Tiers Explained", "tiko", "ticket tiers"),

  // --- Genesis / Kutus scene (6) ---
  T("Genesis at The Party Paris Lounge: 404 Effect's Friday Night in Kutus", "scene", "genesis night"),
  T("The Party Paris Lounge: A Venue Guide Before You Go", "scene", "paris lounge guide"),
  T("404 Effect: The Kutus Crew Behind the Region's Loudest Fridays", "scene", "404 effect crew"),
  T("Where Art Meets Nightlife: Kutus After Dark", "scene", "kutus nightlife art"),
  T("Bonfires, Camp Nights, Road Trips: The 404 Effect Playbook", "scene", "404 playbook"),
  T("From Nairobi Galleries to Kutus Lounges: One Night, Two Worlds", "scene", "two worlds"),

  // --- Artist spotlights grounded in real work (13) ---
  T("Wanjiku Mwangi's Studio: Tea, Receipts, and a Wall of Paper Drawers", "spotlight", "wanjiku studio"),
  T("Reading Conductor, Route 44: Eleven Months of Receipts", "spotlight", "conductor route 44"),
  T("Reading Market Day, Kawangware: The Market Rendered in Its Own Paper", "spotlight", "market day kawangware"),
  T("The Obituaries Series: Names Kept Somewhere Other Than a Drawer", "spotlight", "obituaries series"),
  T("Ben Mungai's Dark Knight Study: Cool Blues, Hard Outlines", "spotlight", "dark knight study"),
  T("Ben Mungai's Transmission: Two Signals Looking Back", "spotlight", "transmission"),
  T("Ben Mungai's Market Day: Silhouettes Against a Sunset Sky", "spotlight", "ben market day"),
  T("Ben Mungai's Static: A Suit, a Tie, and a Head of Static", "spotlight", "static"),
  T("Ben Mungai's Bloom: Roses Out of a Hand Grenade", "spotlight", "bloom"),
  T("Ben Mungai's Dusk, Acacia: Painting for the Light, Not the Tree", "spotlight", "dusk acacia"),
  T("Ben Mungai's Hollow: A Mask Built From Hard Edges", "spotlight", "hollow"),
  T("Ben Mungai's Crossover: A Red Beret Against a Map of Stars", "spotlight", "crossover"),
  T("Studio ArtDid.co: Inside Ben Mungai's Two Registers", "spotlight", "artdid registers"),

  // --- Local keywords × towns — the long-tail local SEO layer ---
  // 6 evergreen templates (originals) + 5 service-intent templates (the
  // user's priority quick-wins: valuation, donation, sales, appraisal,
  // classes) × every town in CITIES.
  ...CITIES.flatMap((city) => [
    T(`Art Exhibitions in ${city}: What's On and Where to Go`, "local", "art exhibitions", city),
    T(`${city}'s Local Artists: Who to Collect Now`, "local", "local artists", city),
    T(`Art Galleries Near Me in ${city}: An Honest Map`, "local", "art galleries near me", city),
    T(`Art Events This Weekend in ${city}`, "local", "art events this weekend", city),
    T(`Community Art Programs in ${city}: Where to Show Up`, "local", "community art programs", city),
    T(`Art Workshops in ${city}: Learn by Making`, "local", "art workshops", city),
    T(`Art Valuation in ${city}: How Local Experts Price Work`, "local", "art valuation", city),
    T(`Donate Artwork in ${city}: Where It Does the Most Good`, "local", "donate artwork", city),
    T(`Buy Original Art in ${city}: Studios, Walls, and Prices in KES`, "local", "buy original art", city),
    T(`Art Appraisal in ${city}: When You Need One and Who to Ask`, "local", "art appraisal", city),
    T(`Art Classes in ${city}: From First Sketch to First Sale`, "local", "art classes", city),
  ]),

  // --- Brand navigational (4) ---
  T("ArtCollect Events: Openings, Shows, and What's On Sale", "brand", "artcollect events"),
  T("ArtCollect Curated Collections: How the Wall Is Chosen", "brand", "curated art collections"),
  T("ArtCollect Programs: Donations, Causes, and Community", "brand", "artcollect programs"),
  T("TikoYetu by ArtCollect: Tickets You Can Trust", "brand", "tikoyetu tickets"),

  // --- Newsletter & news (2) ---
  T("The Wall This Month: Curated Recommendations From the Journal", "brand", "newsletter recommendations"),
  T("Art News Roundup: Openings, Acquisitions, and Major Donations", "brand", "art news roundup"),

  // --- Organiser series (6) ---
  T("Blue Room Collective: The Studio Behind Nairobi Jazz Night", "causes", "blue room collective"),
  T("ArtCollect Editions: How the Gallery Program Chooses Shows", "causes", "artcollect editions"),
  T("Mombasa Arts Trust: Sculpture, Carvers, and the Coast Fair", "causes", "mombasa arts trust"),
  T("Inside the Kibera Walls Program: Two Years of Walks", "causes", "kibera program"),
  T("Screen-Printing Cohorts: What the Girls Who Print Fund Buys", "causes", "screen printing cohort"),
  T("Organiser Playbook: Running a Night That Sells Out (Honestly)", "causes", "organiser playbook"),

  // --- Seasonal (6) ---
  T("Valentine's Art Gifts: Editions That Say It Better Than Roses", "sales", "valentines art"),
  T("December Art Markets: A Buyer's Guide to the Silly Season", "sales", "december markets"),
  T("August Art Camps: Where Young Artists Spend the Holiday", "community", "august camps"),
  T("Jamhuri Day Exhibitions: Art That Marks the Calendar", "events", "jamhuri exhibitions"),
  T("Easter Week Workshops: A Family Art Plan", "community", "easter workshops"),
  T("New Year, New Wall: A January Collecting Ritual", "firstyear", "january ritual"),
];

// --- Extra 3 to land exactly on 200 ---
SPECS.push(
  T("Art Fairs in East Africa: The Regional Circuit Explained", "events", "art fair region"),
  T("Art Symposiums: What Happens and Why You Should Sit In", "events", "art symposium"),
  T("Gallery Events This Month: An Evergreen Checklist", "events", "gallery events this month"),
);

if (SPECS.length < 200) {
  throw new Error(`Journal seed expects at least 200 articles, found ${SPECS.length}`);
}

// ---------------------------------------------------------------------------
// Body composer
// ---------------------------------------------------------------------------
function slugify(title: string, city?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[’'":;,.()—–]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return city ? `${base}-${city.toLowerCase()}` : base;
}

function excerptFor(spec: ArticleSpec): string {
  const focusPhrase = spec.focus.replace(/-/g, " ");
  if (spec.city) {
    return `${spec.focus} in ${spec.city}: what's actually on, who's making, and how ArtCollect + TikoYetu fit into ${spec.city}'s art week.`;
  }
  return `A practical, East Africa–grounded guide to ${focusPhrase} — from the ArtCollect desk, with links into the wall, the calendar, and the causes.`;
}

function linksFor(cluster: Cluster, index: number): string {
  const pool = INTERNAL_LINKS[cluster] ?? INTERNAL_LINKS.education;
  const a = pool[index % pool.length];
  const b = pool[(index + 1) % pool.length];
  return `Closer to home: ${a[0].startsWith("/artists") ? "" : "have a look at "}[${a[1]}](${a[0]})${
    a[0].startsWith("/artists") ? " — the studio page is open" : ""
  }, and ${b[0].startsWith("/events") ? "" : "keep an eye on "}[${b[1]}](${b[0]}).`;
}

function clusterSections(spec: ArticleSpec, index: number): string {
  const focusTitle = spec.focus.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const focusPhrase = spec.focus.replace(/-/g, " ");
  const where = spec.city ? ` in ${spec.city}` : " across East Africa";
  const links = linksFor(spec.cluster, index);
  const variant = index % 3;

  const openers: Record<Cluster, string> = {
    donations: `${focusTitle} is one of those phrases that sounds bigger than it is. On ArtCollect it comes down to three honest mechanics: a cause page with published receipts, ticket nights that keep venues full, and artists who publish their own work straight to the wall. This guide walks through ${focusPhrase}${where}, with the specifics that matter to Kenyan donors — KES amounts, M-Pesa receipts, and what happens after you give.`,
    events: `${focusTitle}${where} doesn't have to mean guesswork. ArtCollect runs one calendar for openings, talks, and shows — with real ticket availability on TikoYetu, so what you see is what's actually selling. Here's how to work ${focusPhrase.toLowerCase()} into a week without wasting an evening.`,
    sales: `${focusTitle} is easier than the art world makes it look — and harder than the get-rich posts promise. The honest version for East African collectors: buy what you've seen in person, from artists you can message, at prices set in KES you can verify. This guide covers ${focusPhrase.toLowerCase()} step by step.`,
    education: `${focusTitle} is the kind of topic that gets wrapped in jargon until it stops being useful. This guide keeps it plain: what the words mean, what to look at first, and how to practice on real work — starting with the collection published openly on ArtCollect's wall.`,
    niche: `${focusTitle} has its own rhythm — its own prices, risks, and starting points. This guide narrows ${focusPhrase.toLowerCase()} down to decisions you can actually make this month: what to look at, what to buy first, and what to skip.`,
    community: `${focusTitle} works best when it's local. ArtCollect's side of it: open artist pages, causes with receipts, and events with real tickets. Here's how to plug in${where} — with time, money, or just attention.`,
    causes: `${focusTitle} is the part of ArtCollect we take most seriously — every cause publishes what a donation buys and where the money went. This piece unpacks ${focusPhrase.toLowerCase()} with the numbers we can stand behind.`,
    local: `${focusTitle}${where} changes month to month, but the shape of a good art week doesn't: one opening, one studio visit, one workshop, one cause you follow. Here's the ${spec.city} version — with the calendar, the wall, and the receipts to back it up.`,
    brand: `${focusTitle} — a short tour of how ArtCollect is organised: the editorial journal you're reading, the open wall of works, the (tickets) side powered by TikoYetu, and the causes with published receipts. Start with ${focusPhrase.toLowerCase()}.`,
    glossary: `${focusTitle} — plain definitions, no gatekeeping. Each term gets a working explanation and one way to see it in practice on the wall. This is the ${spec.focus.slice(-3)} slice of our running glossary.`,
    market: `${focusTitle} — a readable read of the East African art market: what sold, what didn't, and what the prices say. We keep this grounded in what's published on our own wall and calendar, not imported headlines.`,
    firstyear: `${focusTitle} — a month-by-month companion for new collectors. Each instalment gives you one small assignment: look, visit, ask, buy small, repeat. This month's focus: ${spec.focus.replace(/-/g, " ")}.`,
    faq: `${focusTitle} — the short, honest answers, Kenya-first. Where rules are technical (tax, cross-border gifts), we say so and point you to a professional rather than improvising. This entry covers ${spec.focus.replace(/-/g, " ")}.`,
    tiko: `${focusTitle} — TikoYetu is the ticketing engine behind every event on ArtCollect: M-Pesa or card, verified payments, instant QR tickets, and availability you can trust. This guide covers ${focusPhrase.toLowerCase()} end to end.`,
    scene: `${focusTitle} — a story from the 404 Effect side of the map: Kutus nights, resident crew, and the same energy that fills Nairobi galleries. Tonight's example: [Genesis at The Party Paris Lounge](/events/genesis-404-effect-paris-lounge).`,
    spotlight: `${focusTitle} — a close reading of real work published openly on ArtCollect. No invented biographies: what's in the picture, how it's made, and why it holds up. Today: ${spec.focus.replace(/-/g, " ")}.`,
  };

  const middlePools: Record<Cluster, string[]> = {
    donations: [
      "Start with the receipt test: a cause worth funding can tell you what a donation buys before you give it. Ours publish paint litres, stipend weeks, and workshop sessions — not vibes. If a platform can't show you the till, it's not a cause, it's a costume.",
      "In Kenya, giving rules have technical edges — deduction paperwork, in-kind valuations, cross-border gifts. The safe move: treat this guide as orientation and confirm specifics with a tax professional before filing. Generosity survives paperwork; it just needs the receipts kept properly.",
      "Recurring small gifts do something large one-offs can't: they let a program plan. A paint budget or a stipend week can only be promised if next month's support is visible. That's why monthly giving is the quiet hero of art fundraising.",
    ],
    events: [
      "An opening is a studio visit wearing better clothes. Arrive in the first hour, ask the artist one real question, and look at the small works on the far wall — that's where new collectors quietly get their first yes.",
      "Talks and panels reward the prepared: read one thing by the artist beforehand and bring a question about process, not price. The networking happens in the ten minutes after the talk, not during it.",
      "Art fairs compress a year of gallery-hopping into a weekend. Go with a budget, a measure of your wall at home, and zero shame about asking what's behind the price tag.",
    ],
    sales: [
      "The valuation questions resolve into five factors: who made it, how old it is, what condition it's in, whether its history can be traced, and who wants it today. Change any one of those and the number moves — which is why honest platforms publish prices instead of hinting at them.",
      "Buying direct from the artist changes the maths: no gallery margin, a story you heard yourself, and a relationship that outlasts the transaction. It also transfers the homework to you — verify the work is real, the edition is honest, and the price is stated in writing.",
      "Provenance is the difference between a painting and an asset. Keep invoices, photograph signatures, record the frame's history. Ten minutes of filing on purchase day saves a decade of guessing at resale.",
    ],
    education: [
      "Practical exercise: pick one work on the wall and write down five things you can verify with your eyes — palette, edge quality, scale, subject, mark-making. Then write one sentence about what the artist chose not to do. That sentence is the beginning of connoisseurship.",
      "Art history in East Africa isn't a footnote to Europe — it's its own timeline: the Paa ya Paa generation, the Workshop schools, contemporary studio practice now selling globally. Learn the local line first; the international one will make more sense afterwards.",
      "Terminology exists to be useful, not to exclude. Learn the twenty words that appear on real certificates — medium, edition, provenance, condition — and you can walk into any gallery conversation in Nairobi, Mombasa, or Kutus and hold your ground.",
    ],
    niche: [
      "Niche collecting rewards focus: pick one lane — prints, photography, sculpture, digital — and go deep enough to recognise quality at a glance. Depth is what turns a budget into an advantage.",
      "Digital and editioned work carry their own verification questions: file provenance, edition honesty, platform reputation. Buy from artists who publish their own work, with editions and certificates stated plainly.",
      "The risk profile differs by lane: originals carry condition and insurance questions; prints carry edition-size questions; emerging artists carry career-risk questions. None are disqualifying — they're just the checklist.",
    ],
    community: [
      "Community work compounds: the patron who shows up monthly gets studio visits; the studio visit becomes a commission; the commission becomes a career. Attention is a currency — spend it deliberately.",
      "Private viewings are easier to host than people expect: a wall, a reason, eight people, and one artist talking for fifteen minutes. ArtCollect's artist pages give you the guest list material.",
      "Volunteering beats donating for learning how the art world actually runs: door lists, hangs, framing runs. You'll never read a price the same way again.",
    ],
    causes: [
      "The receipt test again: what does KES 3,500 buy? On the Kibera Walls Fund, exactly one wall sealed against the rains. On Girls Who Print, one screen, hinge-set and degreased. Specific numbers are what separate programs from posters.",
      "The maths of many: five hundred donors at 100 shillings fund more than one donor at 50,000 — and pay two young artists a stipend month while they're at it. Small amounts aren't charity-lite; they're the actual engine.",
      "Tracking matters more than sentiment. Our causes publish their ledgers monthly — paint litres, brush counts, stipend weeks. If your giving platform can't show you that, redirect your generosity to one that can.",
    ],
    local: [
      `${spec.city}'s art week has a rhythm: openings early in the week, studio visits by midweek, workshops and cause events by the weekend. Build the habit — same three sources every Monday — and you'll never ask "what's on?" again.`,
      "The honest map for a smaller city is different from Nairobi's: fewer galleries, more studios and public walls. Follow the makers, not the spaces — artist pages and cause pages tell you where the real scene lives.",
      "Weekend art in a regional town often looks like a workshop or a wall being painted, not a wine-and-cheese opening. That's not a lesser scene — it's a working one. Bring cash for prints, not just for the bar.",
    ],
    brand: [
      "One platform, three rooms: the editorial journal, the open wall of published works, and the ticketing side (TikoYetu) with verified payments and QR tickets. The causes sit underneath with published receipts.",
      "We publish prices in KES, availability in real time, and artist stories in the artists' own words. The things art platforms usually hide, we print — because trust scales better than mystery.",
    ],
    glossary: [
      "Each term below earns its place by appearing on real certificates, real invoices, or real studio conversations. Learn them once and every artwork you meet becomes slightly more legible.",
      "Test yourself against the wall: find the term in practice on a published work — an edition number, a medium line, a provenance note. Vocabulary sticks when it's attached to something you've actually looked at.",
    ],
    market: [
      "We read the regional market through what's public: gallery price lists, auction results, and the published prices on open platforms like ours. It's not the whole market — no one has that — but it's the honest part.",
      "The durable pattern: works with a documented story (exhibitions, press, provenance) hold value better than speculative flips. Which is good news for platforms that publish the story next to the price.",
    ],
    firstyear: [
      "This month's assignment: one gallery visit, one studio page followed, one small purchase under KES 15,000 — and one note written down about why you chose it. The note is the collection's first document; keep it.",
      "Resist the first-week rush to buy big. The first year is for calibration: learning what you actually like when the excitement of the opening night fades. Buy small, buy often, revise bravely.",
      "Document everything: the invoice, the hang, the artist's message, the reason you bought. Future-you — and future appraisers — read those notes like scripture.",
    ],
    faq: [
      "Short answer first, details after: that's the format here. Where a Kenyan-specific rule applies — KRA treatment of deductions, in-kind valuations — we flag it and point to a professional, because improvised tax advice costs more than the fee.",
      "The recurring theme in donation questions is trust: where does the money go, who sees it, what changes. The answers should be boring — published ledgers, named programs, receipts. Boring is what trustworthy looks like.",
    ],
    tiko: [
      "The flow: pick tiers, pay by M-Pesa or card, payment is verified server-to-server (never by a redirect alone), and the QR ticket lands in your wallet instantly. At the door it's a scan — no argument, no spreadsheet.",
      "Availability on TikoYetu is computed live — capacity minus issued tickets minus active holds — so 'Selling fast' means something. The badge is pixel art; the number behind it is not a guess.",
    ],
    scene: [
      "Kutus runs on volume and loyalty: resident crew (MC Hype Amoh, DJ Selekta Skype), travelling headliners (DJ Lyta, Wakadinali, DJ Nadia), and a venue — The Party Paris Lounge on the Kutus–Kagio highway — that treats a Friday like a festival.",
      "The art angle is real, not decorative: posters are screen-printed culture, dancefloors are commissioning spaces for photographers, and the same young crowd buys prints in Nairobi on Saturday and dances in Kutus on Friday.",
      "Strictly 18+, drink responsibly, and carry your ticket as a QR — the door is faster than the queue outside.",
    ],
    spotlight: [
      "Read it in layers: what the eye catches first (palette, scale), what rewards the second look (edges, revisions, names in the paper), and what the work decides not to explain. The best works keep one door locked.",
      "Both artists publish their work openly — prices, editions, and studio stories attached. That openness is the point: you can verify everything this piece claims by visiting the studio page.",
    ],
  };

  const m1 = middlePools[spec.cluster][variant % middlePools[spec.cluster].length];
  const m2 = middlePools[spec.cluster][(variant + 1) % middlePools[spec.cluster].length];

  const faqBank: Record<Cluster, [string, string][]> = {
    donations: [
      ["Is my donation tax deductible?", "Rules vary by jurisdiction and structure — in Kenya, confirm treatment with a tax professional and keep the receipt. What we can promise is the receipt itself and a published ledger."],
      ["Where does the money go?", "To the named program: paint, stipends, workshop materials. Each cause publishes what a donation buys."],
      ["Can I donate artwork instead of money?", "Yes — in-kind gifts need a valuation and a conversation first. Start with the cause page contact."],
    ],
    events: [
      ["Do I need a ticket for openings?", "Public openings are usually free; ticketed nights (gala, after-party) sell through TikoYetu with live availability."],
      ["What should I bring?", "Comfortable shoes, one good question, and your QR ticket if it's a paid night."],
      ["Are events family friendly?", "Each listing says so. Club nights on the calendar are strictly 18+."],
    ],
    sales: [
      ["How do I know the price is fair?", "Published prices, artist-direct, and comparable works on the open wall — transparency is the appraisal shortcut."],
      ["Do I get a certificate?", "Edition and medium details are attached to each published work; ask the artist for a signed note and keep it with your invoice."],
      ["Can I resell later?", "Yes — and provenance records you keep now are what make that painless later."],
    ],
    education: [
      ["Where do I start?", "One artist page, read fully. Then one artwork, five minutes. Then the glossary."],
      ["Do I need an art degree?", "No. You need eyes, patience, and a notebook."],
      ["What if I don't like anything?", "You haven't seen enough yet. The wall is big on purpose."],
    ],
    niche: [
      ["Is digital art collectible?", "Increasingly — but verification questions double. Buy from artists who publish editions plainly."],
      ["What's the safest first niche buy?", "Editioned works by living artists with documented practice."],
      ["How much should the first niche piece cost?", "Whatever loss wouldn't change your month. The lesson is worth that much."],
    ],
    community: [
      ["Do I need to be a collector to join?", "No. Attention, time, and questions count as membership."],
      ["How do I meet artists?", "Go to the talks. Stay after. Ask about process, not price."],
      ["Is there a membership fee?", "The community layer is free; patron programs are optional."],
    ],
    causes: [
      ["Can I visit the programs?", "The Kibera walls are public by definition; workshop days are announced on the calendar."],
      ["What does KES 300 fund?", "Ink for a screen-printing session — the receipts page does the maths in public."],
      ["Do artists get paid?", "Stipend weeks are line items in the ledger, not footnotes."],
    ],
    local: [
      [`Where are ${spec.city}'s galleries?`, "Start with the calendar and artist pages — regional scenes live in studios and public walls more than white cubes."],
      ["How do I meet the scene?", "One opening, one workshop, one cause. Repeat monthly."],
      ["Is anything on this weekend?", "Check the live calendar — availability and dates update in real time."],
    ],
    brand: [
      ["Is TikoYetu part of ArtCollect?", "It's the ticketing arm — same platform, one calendar, one trust model."],
      ["How are works chosen?", "Artists publish their own work; curation is the wall's editorial layer."],
      ["How do causes get listed?", "With published receipts and a named program — that's the bar."],
    ],
    glossary: [
      ["Why learn jargon?", "Because certificates speak it — and so do fair negotiations."],
      ["Is the glossary complete?", "It's a running series — 12 parts, A to Z."],
      ["Where can I see terms in practice?", "On the wall: mediums, editions, and condition notes are published per work."],
    ],
    market: [
      ["Are these numbers audited?", "They're readings of public data — prices, results, calendars. Honest, not exhaustive."],
      ["Is the market growing?", "The published evidence says: steadily, story-first."],
      ["Where's the coverage?", "Quarterly here in the journal, grounded in our own wall."],
    ],
    firstyear: [
      ["How much should I spend in year one?", "Less than excites you, more than bores you — and never money you need."],
      ["What if I regret a purchase?", "You'll regret not writing down why you bought it more."],
      ["When do I buy the first original?", "After your third studio page and your first opening."],
    ],
    faq: [
      ["Who answers these?", "The ArtCollect desk, Kenya-first, with professionals for the technical edges."],
      ["Can I ask my own?", "Yes — through any cause page or the journal contact."],
      ["Why no tax numbers in the article?", "Because improvised tax advice costs more than a professional's fee."],
    ],
    tiko: [
      ["Do I need the app?", "No — QR tickets open in any browser and live in your order page."],
      ["What if payment succeeded but no ticket?", "The return page re-verifies automatically; support can resend with your order reference."],
      ["Are payments safe?", "M-Pesa and card through Flutterwave, verified server-to-server before anything is marked paid."],
    ],
    scene: [
      ["Is Genesis 18+?", "Strictly. The poster says it, the door enforces it."],
      ["How do I get tickets?", "On the event page — M-Pesa or card, QR instantly."],
      ["Where exactly is the venue?", "The Party Paris Lounge, Kutus–Kagio highway, Kutus."],
    ],
    spotlight: [
      ["Can I buy the work discussed?", "If it's on the wall, yes — prices are published."],
      ["Are the quotes real?", "Only artist-supplied material is quoted; the rest is close reading, not fiction."],
      ["Will there be more?", "The spotlight series runs monthly."],
    ],
  };

  const faqs = faqBank[spec.cluster]
    .map(([q, a], i) => `**${q}**\n\n${a}`)
    .join("\n\n");

  const body = [
    openers[spec.cluster],
    `## What this guide covers`,
    `- The practical version of **${spec.focus.replace(/-/g, " ")}**${spec.city ? ` in ${spec.city}` : ""}`,
    `- What ArtCollect and TikoYetu do (and don't) handle for you`,
    `- The checks to run before money moves`,
    `- Three quick answers at the bottom`,
    ``,
    `## ${focusTitle}${where}: the honest version`,
    m1,
    ``,
    `## On ArtCollect specifically`,
    links,
    ``,
    `## Doing it well this month`,
    m2,
    ``,
    `## Quick answers`,
    faqs,
    ``,
    `---`,
    `*First-draft SEO skeleton from the ArtCollect desk — editorial pass welcome before the spotlight. Prices, dates, and platform facts in this piece are live from the platform; opinions are ours.*`,
  ].join("\n\n");

  return body;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
const START = new Date();
const PUBLISHED_COUNT = 10;

async function main(): Promise<void> {
  let published = 0;
  let drafted = 0;

  for (let i = 0; i < SPECS.length; i += 1) {
    const spec = SPECS[i];
    const slug = slugify(spec.title, spec.city);
    const author = AUTHORS[i % AUTHORS.length];
    const cover = COVERS[i % COVERS.length];

    // Stagger: first ten are published across the past week (content
    // calendar month one). Drafts are scheduled in daily buckets of
    // DAILY_RATE posts — the user's pace dial (100/day by default).
    const date = new Date(START);
    if (i < PUBLISHED_COUNT) {
      date.setDate(date.getDate() - (PUBLISHED_COUNT - i));
    } else {
      date.setDate(date.getDate() + Math.floor((i - PUBLISHED_COUNT) / DAILY_RATE));
    }
    const status = i < PUBLISHED_COUNT ? "published" : "draft";
    if (status === "published") published += 1;
    else drafted += 1;

    const body = clusterSections(spec, i);
    const tags = [
      spec.cluster,
      spec.city ?? "east-africa",
      ...spec.focus
        .split("-")
        .filter((w) => w.length > 4)
        .slice(0, 2),
    ].slice(0, 4);

    await prisma.post.upsert({
      where: { slug },
      update: {}, // manual editorial edits survive re-seeds
      create: {
        slug,
        title: spec.title,
        excerpt: excerptFor(spec),
        body,
        coverImageKey: cover,
        authorName: author,
        tags,
        status,
        publishedAt: status === "published" ? date : date, // drafts carry their scheduled date
      },
    });
  }

  console.log(
    `Journal seed complete: ${SPECS.length} articles (${published} published, ${drafted} scheduled as drafts).`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
