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
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
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

  // --- Seed.ts lead articles (extended via PRESERVE_LEAD, not replaced) ---
  T("Five Community Walls That Raised Themselves This Year", "causes", "community walls"),
  T("Why Collage Owns the Nairobi Wall Right Now", "education", "collage nairobi"),
  T("Studio Visit: Wanjiku Mwangi on Cutting a City Into a Face", "spotlight", "studio visit wanjiku"),
  T("What Happens at an Opening Night", "events", "opening night"),
  T("Inside the Kibera Walls Fund", "causes", "kibera walls fund"),
  T("Buying Direct From the Artist", "sales", "buying direct"),
  T("Why Donate to an Art Cause", "donations", "donate art cause"),
  T("Starting Your First Art Collection", "education", "first collection"),
  T("How Much Is Your Artwork Worth", "sales", "artwork worth"),
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

const MIN_WORDS = 1700;

// ---------------------------------------------------------------------------
// Content banks — the long-form layer. Each paragraph is written once with
// real substance about the East African art world and recombined per
// article with keyword/city/series slots, so no two openings read alike.
// ---------------------------------------------------------------------------
const BANKS: Record<Cluster, string[]> = {
  donations: [
    "Start with the receipt test. A cause worth funding can tell you what a donation buys before you take out your phone: one wall sealed against the rains, one screen hinge-set and degreased, one stipend week for a painter between commissions. Ours publish those line items publicly — paint litres, brush counts, stipend weeks — because a ledger you can read is worth more than a logo on a poster.",
    "Kenya's giving rules have technical edges. Whether a gift is deductible, how an in-kind artwork is valued for a receipt, and what cross-border transfers require — these are questions for a tax professional, not for a blog. What a platform owes you is simpler and stricter: a receipt for every gift, a named program behind every shilling, and numbers that don't move after the money arrives.",
    "Recurring gifts do something one-off generosity can't: they let a program plan. A paint budget can only be promised if next month's support is visible on the books. This is why the quiet hero of art fundraising isn't the gala headline gift — it's the five hundred people who set up a monthly 100 bob and forgot about it in the best way.",
    "In-kind gifts are underrated. A roll of unprinted paper, a spare register hinge, a Saturday of studio space, a skill — these land differently from cash and often land faster, because they skip the procurement step entirely. The etiquette: talk to the program first, agree a fair value for the receipt, and deliver what you said you would.",
    "Corporate givers want three things their CSR teams can actually report: a named program, a paper trail, and an impact story with pictures. Art programs are unusually good at the third — the wall photographs itself. The first two are where discipline shows: contracts, receipts, and a closing report that matches the proposal.",
    "The impact story is the receipt, retold. When a cause publishes that KES 3,500 became one sealed wall, the donor doesn't have to imagine the outcome — they can walk past it. That's the standard we hold: every gift traceable from phone to paint to public wall.",
  ],
  events: [
    "An opening has an anatomy, and the first hour is its heart. Come early enough to see the work before the room fills, ask the artist one real question about process, and walk the far wall where the small, affordable pieces usually hang. The cheapest education in any exhibition is standing in front of one work for five full minutes.",
    "Calendar discipline beats inspiration. Pick three sources — the platform calendar, two venues — and check them the same time every Monday. On ArtCollect, openings and ticketed nights share one calendar with live TikoYetu availability, so 'is it actually happening?' and 'can I still get in?' are the same glance.",
    "Art fairs compress a year of gallery-hopping into a weekend, which is their gift and their trap. Go with a budget, a measurement of your wall at home, and no shame about asking what sits behind a price tag. Fairs reward the prepared: the collector who arrives having already followed three of the exhibiting artists online.",
    "Talks and panels reward preparation more than price. Read one thing by the speaker beforehand, bring a question about process rather than market, and know that the real networking happens in the ten minutes after the session — the part everyone skips. That's where studio visits get arranged.",
    "Virtual tours are a complement, not a substitute. A screen flattens scale and hides texture — you lose the impasto, the paper's tooth, the way a canvas sits in a room. What they add is access: walkthroughs with the artist talking over their own work, and a preview that makes the in-person visit faster and better chosen.",
    "The formats worth knowing: the gallery opening (free, standing, conversational), the ticketed gala (dress code, program, auction), the after-party (where the real questions get asked), and — on our Kutus nights — the club takeover, strictly 18+, where a DJ set and a crowd do what no catalogue can.",
  ],
  sales: [
    "Valuation resolves into five honest factors: who made it, how old it is, what condition it's in, whether its history can be traced, and who wants it today. Move any one and the number moves. Which is why the platforms worth trusting publish prices openly — a number that hides behind a 'please enquire' is a number you can't verify.",
    "Buying direct from the artist changes the maths in your favour and moves the homework onto you. No gallery margin, a story you heard from the source, a relationship that outlasts the sale. The homework: confirm the work is genuinely theirs, that the edition (if any) is honestly numbered, and that the price is stated in writing before money moves.",
    "Provenance is the difference between a painting and an asset. The habit is ten minutes on purchase day: keep the invoice, photograph the signature, note where and when you bought it, and file the artist's own description with it. Future appraisers, insurers, and estate lawyers read those notes like scripture.",
    "Editions carry their own honesty rules. A limited edition should say its size; a print should say its process; an 'open edition' should say so and price accordingly. The red flags are vague — 'limited' with no number, 'giclée' with no process, a certificate that names no printer or plate.",
    "Emerging and established are risk categories, not quality categories. An emerging artist offers the entry price and the career risk; an established name offers liquidity at a multiple. The balanced first-year answer: mostly emerging, one established work if the budget allows, and a written reason for every purchase.",
    "Condition is where value quietly leaks. Direct sun fades pigments; coastal humidity swells paper and rusts staples; cheap glass sticks to pastel and print surfaces. Framing to conservation standard costs more up front and repays itself at the first resale or appraisal.",
  ],
  education: [
    "The five-verifiable-things exercise is the fastest way to learn to see. Stand in front of any published work and write down five things you can check with your eyes — palette, edge quality, scale, subject, mark-making — then one sentence about what the artist chose not to do. That sentence is where connoisseurship starts.",
    "East African art history is not a footnote to anyone else's. The line runs from the early Nairobi galleries and the workshop movements through today's studio practice, with the continent's modernists writing their own story alongside — and sometimes ahead of — the Euro-American canon. Learn the local line first; the international one makes more sense afterwards.",
    "Twenty words unlock every certificate: medium, edition, provenance, condition report, giclée, impasto, verso, signature block, printer's chop, blind stamp. Learn them once, attached to real works, and the paperwork of collecting stops being a wall and becomes a window.",
    "Looking is a skill with a method: palette first (what colors carry the piece), then edges (hard, soft, torn, glazed), then scale (how big it actually is against your wall), then subject, then mark-making. Then the locked door: what did the artist decide not to explain? The best works keep one.",
    "Terminology exists to be useful, not to gatekeep. Anyone who makes you feel small for asking what 'giclée' means is defending a price, not a practice. Learn the words on the real documents and you can hold your ground in any gallery conversation from Nairobi to Mombasa to Kutus.",
    "The looking habit compounds like interest: ten minutes a week in front of published work — any platform's, any artist's — recalibrates your eye faster than a year of scrolling. The wall is open for exactly this reason: looking is free, and it's the whole prerequisite.",
  ],
  niche: [
    "Niche collecting rewards depth over breadth. Pick one lane — editions, photography, sculpture, digital — and go deep enough to recognise quality without the label. A collector who knows one thing deeply outbids a collector who knows ten things shallowly, because they can tell the difference at a glance.",
    "Digital work doubles the verification questions: where the file lives, how the edition is enforced, and whether the platform's receipts survive a platform change. Buy from artists who publish their edition terms plainly, and treat the certificate as part of the work, not an accessory.",
    "Prints are the honest gateway: real works, real artists, real editions, at prices a first-year budget survives. The checks are simple and learnable — edition size stated, numbering consistent, printer named, paper specified. Everything else is decoration on the certificate.",
    "Photography collects differently: the edition is the asset, the print is the object. Ask for the edition size, the paper, and the printing date. A photograph reprinted years later in a larger run is a different asset — and the market prices it that way.",
    "Sculpture and three-dimensional work carry logistics that paintings don't: weight, installation, transport insurance, the plinth question. Budget the crate and the rigger, not just the piece — and check the floor before you fall in love.",
    "The figurative revival is not nostalgia — it's subject matter returning because the figure carries story that abstraction chose to set down. The collectors who read it well are the ones who learned to see bodies as compositions: weight, gesture, and the space the figure refuses to fill.",
  ],
  community: [
    "Community work compounds like interest. The patron who shows up monthly gets studio visits; the studio visit becomes a commission; the commission becomes a career the whole circle can point to. Attention is a currency, and it spends further than most people expect.",
    "Hosting a private viewing is easier than it sounds: one wall, one reason (a birthday, a launch, a Tuesday), eight people, and one artist talking for fifteen minutes. The artist pages on ArtCollect exist precisely to give you the guest-list material — real work, real stories, real prices.",
    "Volunteering teaches the parts of the art world that money can't buy you into: how a hang is planned, why the door list matters, what a frame costs before the discount. You will never read a price tag the same way again — and the relationships are the point.",
    "Patronage has stages, and skipping them looks like what it is. Look first, buy small, ask second, commission third, fund a cause fourth. Each stage earns the next; the collectors who arrive at stage four from nowhere are buying access, not art.",
    "A collector circle is three people who will tell you the truth: one who knows the market, one who knows the artist, and one who will say 'not this one' when you're about to overpay. Build it slowly and in person — it doesn't fit in a group chat.",
    "Residencies are supply chains for the whole scene: time, materials, and quiet in exchange for work and openness. If you fund one, fund the boring parts — transport, materials, a real stipend. If you host one, publish what came out of it. Both sides compound.",
  ],
  causes: [
    "The receipt test is the whole standard: a cause that can't tell you what a donation buys before you give isn't a cause, it's a costume. Ours publish paint litres per wall, screens per cohort, stipend weeks per painter — line items you can price-check against any hardware store in Kenya.",
    "The maths of many is the engine: one donor at 50,000 paints one wall; five hundred donors at 100 paint eight walls and cover two stipend months. Small amounts aren't charity-lite — they're the actual funding model, and they're more resilient than a single cheque.",
    "Publishing the ledger monthly is how trust scales. When the wall list and the till agree, donors stop wondering and start planning — and planning is what turns a one-night generosity into a multi-year program.",
    "Stipend weeks are the line item that changes careers. Paint is replaceable; a painter dropping out of practice to chase day-work is not. A cause that budgets the artist's time alongside the materials has understood what it's actually funding.",
    "Materials have honest prices: exterior paint that survives the rains, a screen hinge-set, a bench press that stays after the residency doesn't. Ask a cause for its shopping list before its mission statement — the list tells you whether they've done this before.",
    "Cross-border giving adds a layer: transfer fees, currency spread, and paperwork. The practical advice is unromantic — consolidate smaller gifts, ask the program which channel loses the least to fees, and keep every receipt for both sides of the border.",
  ],
  local: [
    "A regional art week has a shape you can learn in a month: openings early in the week, studio visits midweek, workshops and cause events toward the weekend. Set a Monday ritual — check the calendar, message one artist, plan one visit — and the question 'what's on?' answers itself.",
    "Smaller cities run on makers, not spaces. Where Nairobi has a gallery circuit, regional scenes live in studios, public walls, school halls, and the backs of cafés. Follow the artist pages and cause pages — they'll point you to the wall being painted this month, not the one that was painted last year.",
    "A weekend workshop is the fastest on-ramp into any local scene: you arrive a stranger, you leave with a finished piece, a teacher who knows your name, and a group message you'll be added to. Art worlds are group messages with paint on them.",
    "County cultural festivals and school art programs are where the next generation actually shows work first — before the galleries, before the platforms. Showing up to those is how you watch a career start, and buying there is how you make sure it continues.",
    "The economics differ outside the capitals: lower rents mean bigger studios, fewer galleries mean direct sales, and prices sit in KES you can verify against materials. It's not a discount scene — it's a different cost structure, and it favours the collector who shows up in person.",
    "Transport is a real cost in regional collecting — plan it like framing. One trip that covers a studio visit, a cause wall, and a market beats three separate weekend drives, and the artist you're visiting can usually tell you what else is worth seeing while you're in town.",
  ],
  brand: [
    "ArtCollect is organised in three rooms. The journal — what you're reading — is the editorial layer. The wall is the commerce layer: artists publishing their own work with prices in KES. And the ticketing side, TikoYetu, runs events with verified payments and instant QR tickets. The causes sit underneath with published receipts.",
    "The transparency stance is the brand: prices published, availability computed live, artist stories in the artists' own words, and cause ledgers open to anyone. The things the traditional art market hides are the things we print.",
    "One calendar serves the whole platform — openings, ticketed nights, club takeovers — because a collector in Kutus and a curator in Nairobi deserve the same answer to 'what's on this weekend?'",
    "The trust model is boring on purpose: server-to-server payment verification, receipts for every gift, availability computed from real rows rather than a marketing counter. Boring is what trustworthy looks like at scale.",
  ],
  glossary: [
    "Certificates and invoices speak this language, which is the only reason to learn it: not to impress anyone at an opening, but to read the paperwork that protects your purchase. Every term here appears on real documents from real Kenyan and international galleries.",
    "The test that makes vocabulary stick: find the term in practice. An edition number on a print, a medium line on an invoice, a condition note on a certificate — attach each word to something you've actually looked at and it never falls out of your head.",
    "This glossary runs as a series — twelve parts, A to Z — because a single page of terms is a list, and a list is not a lesson. Each slice adds the working definitions plus one practical way to see the term in use.",
    "The words collectors actually need number about twenty. Everything beyond those is either Latin for lawyers or slang for insiders. Start with the twenty and you can walk into any conversation in this market holding your end up.",
  ],
  market: [
    "We read the regional market through what's public: gallery price lists, published platform prices, auction results, and event calendars. It's not the whole market — nobody has the private sales — but it's the part that can be checked, which makes it the part worth arguing from.",
    "The durable pattern across every cycle: works with a documented story — exhibitions, press, provenance — hold value better than speculative flips. Good news, that, for platforms that publish the story next to the price.",
    "Price tiers in this market are wider than outsiders expect: from KES 15,000 prints that start collections to multi-million shilling originals that end them. The tiers aren't a quality ranking — they're a participation structure, and knowing your tier is knowing your strategy.",
    "Small auction houses tell the truth about a region faster than the headline sales do. The lots that pass, the ones that fetch estimates, the买家 who return season after season — that's the real temperature, and it's readable from public results.",
  ],
  firstyear: [
    "The first year of collecting is a calibration year, not an acquisition year. You are learning what you actually like when the opening-night adrenaline fades — and the only way to learn it is to look a lot, buy small, and write down the reasons.",
    "Documentation is the habit that pays forever: invoice, photo, artist's message, and the sentence about why you bought. Future appraisers read those notes like scripture, and future-you will too.",
    "One assignment per month, done honestly, beats every masterclass: a gallery visit, a studio page followed, a workshop attended, a small purchase, a cause followed. The sequence matters less than the cadence.",
    "The first original — the first real KES six-figure work — should be the work you'd buy again at the same price after sleeping on it twice. If that test fails, the work isn't wrong; the timing is.",
  ],
  faq: [
    "Short answer first, details after — that's the format for all our guides. Where a Kenyan-specific rule applies (KRA treatment of deductions, in-kind valuations, cross-border transfers), we flag it and point to a professional, because improvised tax advice costs more than the fee.",
    "The recurring theme in reader questions is trust: where the money goes, who sees it, what changes after the gift or the purchase. The answers should be boring — published ledgers, named programs, receipts. Boring is what trustworthy looks like.",
    "We answer in Kenya-first terms because our artists, venues, and buyers are here — but the principles travel. Where another country's rules differ materially, we say so instead of pretending one answer fits every border.",
  ],
  tiko: [
    "The TikoYetu flow is designed around one rule: never trust a single signal. You pay by M-Pesa or card, the payment is verified server-to-server (a redirect proves nothing), and only then does the QR ticket land in your wallet. At the door it's a scan, not an argument.",
    "Availability on every event page is computed live — capacity minus issued tickets minus active holds — so 'Selling fast' is arithmetic, not marketing. The pixel stamp is decoration; the number behind it is an SQL query.",
    "Ticket tiers exist to price rooms honestly: general, early, VIP, table. Each tier is a capacity and a price in KES, and the platform enforces per-order limits so resellers can't clear a room in one transaction.",
    "The organiser side is the same engine pointed the other way: real-time sales, validator tools for the door, and payout reconciliation. A platform that can't show an organiser their own numbers can't be trusted with a buyer's either.",
    "Group bookings have honest limits (per-order maximums per tier) precisely so that one buyer can't flip a room. If your crew is bigger than the cap, split the orders — or talk to the organiser about a real group arrangement.",
  ],
  scene: [
    "Kutus runs on volume and loyalty: a resident crew (MC Hype Amoh on the mic, DJ Selekta Skype on the decks), travelling headliners (DJ Lyta, Wakadinali, DJ Nadia), and a home venue — The Party Paris Lounge on the Kutus–Kagio highway — that treats every Friday like a festival. The model is simple: consistency, location, and a crowd that knows the crew by name.",
    "Posters are screen-print culture, and screen-print culture is art-market culture with better marketing. The same design discipline that sells a Friday night sells a limited print — and the same young crowd buys both.",
    "Dancefloors are commissioning spaces for photographers. The pictures that come out of a night like Genesis are portfolio, advertisement, and archive at once — and the photographers building those bodies of work are exactly the 'local artists' every regional art story claims to want.",
    "The crossover is the point: a Nairobi collector who follows the calendar can end a month having seen a gallery opening in Kilimani, a wall painted in Kibera, and a club night in Kutus — one platform, one ticketing rail, one trust model.",
    "Strictly 18+, drink responsibly, carry the QR — the door moves faster than the queue, and the platform's availability counter means the 'sold out' sign never surprises anyone who checked the page.",
  ],
  spotlight: [
    "Close reading happens in layers: what the eye catches first (palette, scale), what rewards the second look (edges, revisions, the names hiding in the paper), and what the work decides not to explain. The best pieces keep one door locked on purpose.",
    "Every spotlight in this series covers work published openly on ArtCollect — prices, editions, and studio stories attached. That openness is the point: you can verify everything claimed here by opening the artist's page.",
    "No invented biographies. Where an artist hasn't supplied a history, the reading stays with the work itself — what's visible, how it's made, what it argues. The career chapters get written when the artist writes them.",
    "The spotlight series runs monthly and deliberately slow: one artist, a few works, enough space to say something true. Volume is a gallery problem; attention is the reader's gift.",
  ],
};

const CITY_PARAS: Record<string, string> = {
  Nairobi: "Nairobi carries the region's densest circuit: established galleries in Kilimani, Karen, and the CBD, studio clusters toward Industrial Area, auction previews, and an opening most weekends. The practical truths: traffic decides your evening — pick one side of town per night — and the gallery-to-studio ratio means studio visits are both easier and more rewarding here than anywhere else in the country.",
  Mombasa: "Mombasa's art life runs along the coast's own logic: Swahili carving traditions, the Fort Jesus cultural pull, and a humid climate that punishes careless framing. The scene is smaller and warmer than Nairobi's — ask about workshop programs before you leave, and let the conservation advice in this series double for the salt air.",
  Kisumu: "Kisumu's lake-region scene is growing on its own schedule: cultural centres, beach-side maker culture at Dunga, and a county government that programs festivals around the calendar. Collectors here tend to meet artists before they meet galleries — which is exactly the right order.",
  Nakuru: "Nakuru sits between the Rift's landscapes and a growing urban middle class, and its art week reflects both: school programs and county festivals feeding a small but serious buyer base. The caution is the same as any fast-growing scene — buy the artist, not the moment.",
  Eldoret: "Eldoret's highlands economy funds a quieter art life than its size suggests — athletics money, agricultural wealth, and a university presence. Openings are rarer; studio visits are better. Plan a Saturday that ends at a workshop, not a white cube.",
  Kutus: "Kutus proves a regional town can run a scene on consistency: 404 Effect's resident crew (MC Hype Amoh, DJ Selekta Skype) filling The Party Paris Lounge on the Kutus–Kagio highway, travelling headliners (DJ Lyta, Wakadinali, DJ Nadia), and a market-town crowd that shows up. The art angle is real — posters, photographers, and printers all eat from this ecosystem.",
  Thika: "Thika's industrial money and Nairobi proximity give it a practical scene: fewer galleries, more commissioned walls and school programs, and collectors who buy on recommendation rather than gallery PR. The 40-minute ride makes it an easy Saturday loop with Nairobi's circuit.",
  Nyeri: "Nyeri's central-highlands scene is county-program led: cultural festivals, school art, and memorial institutions around town. The collector's move here is patience — meet the teachers and the program organisers, because they know which students are actually working.",
  Malindi: "Malindi's art market is visitor-shaped: galleries and craft markets oriented to the coast's international passers-through. The honest advice: the tourist strip is a filter, not the scene — the serious makers sit one street back, and their prices hold better than the beach kiosks'.",
  Diani: "Diani's gallery-and-lodge circuit serves a clientèle that arrives on holiday and ships art home. That logistics reality shapes everything: editions and prints travel better than canvases, and the galleries worth their wall space will pack and freight properly — ask before you buy.",
  Naivasha: "Naivasha's weekend-economy scene — floriculture money, lakeside lodges, Nairobi day-trippers — supports craft markets and lodge hangings more than formal galleries. The collector's play is the lodge circuit: walk in, look at what the wall chose, ask who chose it.",
  Nanyuki: "Nanyuki mixes conservancy wealth, the mountaineering set, and a market town core — and its art life mirrors the mix: lodge collections, Equator-market craft, and a small number of serious makers serving both. Buy the landscape work here on its own terms; the light justifies it.",
  Kericho: "Kericho's tea-green hills and county programs give it a small, school-led scene: art competitions, cultural days, and the occasional wall. The realistic role for a collector here is patron of the pipeline — fund the school program and watch what comes out of it.",
  Bungoma: "Bungoma's scene is county-festival and church-hall territory today, which is precisely where regional scenes start. The move that matters: a school program that keeps its best students working after graduation. Ask the teachers who's still holding a brush.",
  Voi: "Voi sits on the Mombasa highway with Taita hills and a transit economy, and its art life follows: carving and craft for the passing trade, with the serious practice staying close to the coast's institutions. Collect on the drive-through sparingly; collect after a proper visit generously.",
  Machakos: "Machakos' proximity to Nairobi and its own county programs give it a genuine middle scene — studios reachable in an afternoon, county galleries, and buyers who commute. The Sunday loop (studio, wall, lunch) is the best-kept routine in the region.",
  Kitui: "Kitui's strength is the county program plus craft cooperatives — basketry, carving, and textile work that predates the gallery economy and outlasts it. Collect the cooperatives honestly: fair prices, direct payment, and the names of the actual makers.",
  Meru: "Meru's highlands economy supports a small, school-and-church-led art circuit with real growth in the last few years. The same regional rules apply: follow the makers, attend the county show, and let the teachers tell you whose work is getting serious.",
  Kakamega: "Kakamega's forest-and-festival culture — the bullfighting heritage, the rainforest edge — gives local makers subject matter that doesn't exist anywhere else in the country. Regional collecting at its best: subjects you cannot buy in Nairobi because they don't grow there.",
  Garissa: "Garissa's scene is the youngest on this list and the most worth watching: Somali-influenced design language, county youth programs, and almost no gallery infrastructure — which means the collectors who arrive now are founding patrons, not customers.",
};

const FAQ_BANKS: Record<Cluster, [string, string][]> = {
  donations: [
    ["Is my donation tax deductible?", "Rules vary by structure and jurisdiction — in Kenya, confirm with a tax professional and keep every receipt. What we guarantee is the receipt itself and a published ledger behind it."],
    ["Where does the money actually go?", "To the named program: paint, stipends, workshop materials. Each cause page publishes what a donation buys before you give."],
    ["Can I donate artwork instead of money?", "Yes — in-kind gifts need a valuation and a conversation first. Start on the cause page."],
    ["How do I know the program is real?", "Read the ledger. Paint litres, stipend weeks, and wall lists are published monthly — trust that survives arithmetic."],
    ["Can I give anonymously?", "Yes. Anonymous donors appear as 'Anonymous' on public supporter lists, with the same receipt."],
    ["What's the smallest useful gift?", "KES 100 funds real line items in our causes — the maths of many is the actual model."],
    ["Do you accept cross-border gifts?", "Yes — consolidate to reduce fees and keep both sides of the paperwork."],
    ["Can companies give?", "Yes — corporate gifts get contracts, reports, and the impact photography CSR teams actually need."],
  ],
  events: [
    ["Do openings cost money?", "Public openings are usually free; ticketed nights (gala, after-party, club takeovers) sell through TikoYetu with live availability."],
    ["What should I bring?", "Comfortable shoes, one good question, and the QR ticket if it's a paid night."],
    ["How early should I arrive?", "First hour for the art; last hour for the conversation. Choose your hour."],
    ["Are events family friendly?", "Each listing says so — club nights on the platform are strictly 18+."],
    ["What if I miss the opening?", "The work usually hangs for weeks; the calendar tells you until when."],
    ["Can I meet the artist?", "At the opening, at the talk, or via the studio page — all three work."],
    ["Do tickets sell out?", "Yes — availability is computed live, and 'Selling fast' means the arithmetic says so."],
    ["Is there parking?", "Venue listings note it where it matters; city venues assume matatu culture."],
  ],
  sales: [
    ["How do I know the price is fair?", "Published prices, artist-direct sales, and comparable works on the open wall — transparency is the honest appraisal shortcut."],
    ["Do I get a certificate?", "Edition and medium details attach to each published work; request a signed note and file it with the invoice."],
    ["Can I resell later?", "Yes — and the provenance file you keep now is what makes that painless later."],
    ["What if the work arrives damaged?", "Document it on arrival, contact the platform and artist the same week; condition notes taken on day one are the claim."],
    ["Is art a good investment?", "Story-first works with documented history hold best. Buy what you love at a price you can verify — the investment follows."],
    ["How do I start with KES 15,000?", "Editions and small originals from emerging artists — the print guide covers the checks."],
    ["Do artists ship?", "Within Kenya, yes by courier; regionally and internationally, ask per piece — packaging is part of the price for originals."],
    ["Can I commission instead?", "Yes — start with a studio page conversation, agree scope and price in writing."],
  ],
  education: [
    ["Where do I start?", "One artist page, read fully. Then one artwork for five minutes. Then the glossary."],
    ["Do I need an art degree?", "No. Eyes, patience, and a notebook."],
    ["How long until I 'get' contemporary art?", "The question is the wrong shape — you'll get particular works first, then the field."],
    ["What if I don't like anything?", "You haven't seen enough yet. The wall is big on purpose."],
    ["Is there a right interpretation?", "There are supported and unsupported readings — the guide shows the difference."],
    ["How do I learn the history?", "Local line first: the region's movements explain the global ones better than the reverse."],
    ["Are workshops worth it?", "Making one bad collage teaches more than reading ten good essays about collage."],
    ["What about kids?", "The workshops series covers family-friendly programs by county."],
  ],
  niche: [
    ["Which niche first?", "The one whose problems you enjoy — verification, logistics, and pricing differ by lane."],
    ["Is digital art collectible?", "Increasingly — with doubled verification questions. Buy plainly published editions."],
    ["How much for a first niche piece?", "Whatever loss wouldn't change your month."],
    ["Do prints hold value?", "Documented, honestly numbered prints by working artists do — the checks are in the guide."],
    ["What about photography?", "Edition size and print date are the asset; the paper is the object."],
    ["Sculpture for beginners?", "Budget the crate and the rigger — then fall in love."],
    ["Figurative or abstract?", "Both markets exist; the figure currently carries more story per shilling."],
    ["When does a niche become a collection?", "When you can name what you'd refuse, not just what you'd buy."],
  ],
  community: [
    ["Do I need to be a collector to join?", "No — attention, time, and good questions count as membership."],
    ["How do I meet artists?", "Talks, openings, and studio pages — then stay ten minutes after."],
    ["Is there a fee?", "The community layer is free; patron programs are optional and published."],
    ["Can I volunteer?", "Yes — hangs, door lists, and workshop days all need hands."],
    ["What do patrons actually do?", "Look, buy small, ask, commission, fund — in that order."],
    ["Are residencies open to applications?", "Program-by-program; the journal lists them as they open."],
    ["How do private viewings work?", "A wall, a reason, eight people, one artist — the how-to guide covers it."],
    ["What if my city has no scene?", "Every scene on this list started with people who showed up before it existed."],
  ],
  causes: [
    ["Can I visit the programs?", "The Kibera walls are public by definition; workshop days are announced on the calendar."],
    ["What does KES 300 fund?", "Ink for a screen-printing session — the ledger shows the full conversion."],
    ["Do artists get paid?", "Stipend weeks are line items, not footnotes."],
    ["How often are ledgers published?", "Monthly — wall list and till together."],
    ["Can I fund a specific wall or workshop?", "Ask on the cause page — designated gifts are possible when the program can honour them."],
    ["What happens if a cause exceeds its goal?", "The surplus rolls to the next program cycle — published in the ledger."],
    ["Do you take platform fees?", "The cause pages state it in plain numbers — no surprises between gift and ground."],
    ["Can I give materials instead?", "Yes — in-kind needs a valuation conversation first; start on the page."],
  ],
  local: [
    [`Where are the galleries in __CITY__?`, "Start with the calendar and artist pages — regional scenes live in studios, public walls, and school halls more than white cubes."],
    ["How do I meet the scene?", "One opening, one workshop, one cause. Repeat monthly."],
    ["Is anything on this weekend?", "The live calendar answers this in real time — dates and availability update continuously."],
    ["Are prices lower outside Nairobi?", "The cost structure differs — materials-priced, direct-from-artist, KES-stated. Not cheaper: different."],
    ["How do I find artists before they're famous?", "School programs, county festivals, and the cause pages — the pipeline is public."],
    ["Can I visit studios?", "Most published artist pages welcome a message; regional studios are the easiest doors in the country."],
    ["What about framing and shipping?", "Regional framers handle standard sizes; originals travel by courier with the packaging priced in."],
    ["Is the local scene worth collecting?", "That's what the local series exists to answer — one town at a time, with receipts."],
  ],
  brand: [
    ["Is TikoYetu part of ArtCollect?", "It's the ticketing arm — one platform, one calendar, one trust model."],
    ["How are works chosen for the wall?", "Artists publish their own work; editorial curation is the wall's layer, not a gate."],
    ["How do causes get listed?", "With published receipts and a named program — that's the bar, and it doesn't move."],
    ["Do you authenticate artwork?", "The platform publishes provenance and artist-direct facts; formal authentication is a professional service we can point you to."],
    ["Where is ArtCollect based?", "Nairobi and Kutus — with the wall open to artists across East Africa."],
    ["How do I contact a human?", "Every artist page and cause page reaches a real person; the journal replies too."],
  ],
  glossary: [
    ["Why learn the jargon?", "Because certificates speak it — and so do fair negotiations."],
    ["Is the glossary complete?", "It's a running series — twelve parts, A to Z, still growing."],
    ["Where can I see terms in practice?", "On the wall: mediums, editions, and condition notes are published per work."],
    ["Which terms matter most?", "The twenty that appear on real certificates — the first slices cover them."],
    ["Do other countries use different terms?", "The core twenty are universal; the slang isn't — and we say which is which."],
    ["Will there be a PDF?", "The series compiles into a downloadable guide at the end of the run."],
  ],
  market: [
    ["Are these market numbers audited?", "They're readings of public data — prices, results, calendars. Honest, not exhaustive."],
    ["Is the market growing?", "The published evidence says: steadily, story-first."],
    ["Where does the data come from?", "Public price lists, published platform prices, and auction results — linked where possible."],
    ["Does a bad quarter matter?", "To flippers, yes; to collectors with documented stories, far less."],
    ["Which tier should I read first?", "The one you're standing in — most readers start at the KES 15,000–100,000 tier."],
    ["Do you predict prices?", "We read them. Prediction is a different trade with different liabilities."],
  ],
  firstyear: [
    ["How much should I spend in year one?", "Less than excites you, more than bores you — never money you need."],
    ["What if I regret a purchase?", "You'll regret not writing down why you bought it more."],
    ["When do I buy the first original?", "After your third studio page and your first opening."],
    ["Do I need to specialise?", "Year one is for breadth; specialisation is year two's discovery."],
    ["How many works is a 'real' collection?", "There's no number — there's a notebook."],
    ["What do I do with works I outgrow?", "Resell, gift, or rotate — documented provenance makes all three easy."],
  ],
  faq: [
    ["Who answers these questions?", "The ArtCollect desk — Kenya-first, with professionals for the technical edges."],
    ["Can I ask my own question?", "Yes — through any cause page, artist page, or the journal."],
    ["Why no tax numbers in the articles?", "Because improvised tax advice costs more than a professional's fee."],
    ["How often is this updated?", "As rules and programs change — the journal dates every piece."],
    ["Is this legal advice?", "No — it's orientation that tells you when to get legal advice."],
    ["Do you answer donation questions publicly?", "The useful ones, anonymised, right here in the series."],
  ],
  tiko: [
    ["Do I need an app?", "No — QR tickets open in any browser and live on your order page."],
    ["What if payment succeeds but no ticket shows?", "The return page re-verifies automatically; support can resend with your order reference."],
    ["Are payments safe?", "M-Pesa and card through Flutterwave — verified server-to-server before anything is marked paid."],
    ["Can I transfer a ticket?", "Transfer support is on the roadmap; for now, contact support with the order reference."],
    ["What does 'Selling fast' mean?", "Live availability has crossed the low-availability threshold — arithmetic, not marketing."],
    ["Do you store my card?", "No — Flutterwave processes; TikoYetu never sees or stores card numbers."],
  ],
  scene: [
    ["Is Genesis 18+?", "Strictly — the poster says it, the door enforces it."],
    ["How do I get tickets?", "On the event page: M-Pesa or card, QR instantly, availability live."],
    ["Where exactly is the venue?", "The Party Paris Lounge, Kutus–Kagio highway, Kutus."],
    ["Who are the residents?", "MC Hype Amoh and DJ Selekta Skype — the crew's own description."],
    ["Who has headlined before?", "DJ Lyta, Wakadinali, and DJ Nadia — per the organiser's track record."],
    ["What time does it end?", "Late. The event page lists doors and close times."],
  ],
  spotlight: [
    ["Can I buy the work discussed?", "If it's published on the wall — yes, at the listed price."],
    ["Are the quotes real?", "Only artist-supplied material is quoted; the rest is close reading, not fiction."],
    ["Will there be more spotlights?", "Monthly — one artist, a few works, done slowly."],
    ["Do artists approve these readings?", "They can read everything before it carries the brand; corrections are welcome."],
    ["Why focus on local artists?", "Because the region's story is the one we can verify — and the one worth telling."],
    ["How do I get my studio featured?", "Publish your work openly — the series reads the wall."],
  ],
};

const STEPS: Partial<Record<Cluster, string[]>> & { general: string[] } = {
  general: [
    "Pick your date and put it in the calendar — intentions without dates are the reason 'someday' never arrives.",
    "Set one budget line, in KES, before you look at anything. The number protects the decision.",
    "Shortlist three options from the platform and write one line on why each made the list.",
    "Message or visit one human — artist, organiser, or cause contact. The conversation is the research.",
    "Sleep on it once. The work that survives the night is the work you actually wanted.",
    "Document whatever you decide — invoice, screenshot, note — in the same hour.",
  ],
  donations: [
    "Choose the cause from its published ledger, not its poster.",
    "Decide the amount in KES and whether it's one-off or monthly — monthly is the quiet superpower.",
    "Give through the page (M-Pesa or card) and keep the receipt that lands with the confirmation.",
    "Read the next ledger the month after — the wall list and the till should agree.",
    "Tell one friend why you funded it; the maths of many needs the telling.",
  ],
  events: [
    "Check the calendar Monday; pick the event; buy the ticket while availability is live.",
    "Plan the route and the hour — openings reward the first hour, clubs reward the last.",
    "Bring one question for the artist or the crew.",
    "Look at the small works and the far walls — that's where new discoveries live.",
    "Follow the artist's page before you go, so the work isn't the first thing you've seen by them.",
  ],
  sales: [
    "Measure your wall and set the budget in KES — both in writing.",
    "Browse the wall and shortlist three works by two different artists.",
    "Message one artist about the piece you keep thinking about — process, edition, and story.",
    "Verify: medium stated, edition numbered, provenance noted, price in writing.",
    "Pay through the platform, keep the invoice, and photograph the signature on arrival.",
  ],
  education: [
    "Pick one published work and give it five unhurried minutes.",
    "Write the five verifiable things — palette, edge, scale, subject, mark-making.",
    "Add the locked-door sentence: what the artist chose not to explain.",
    "Read one artist page end to end, bio to prices.",
    "Repeat weekly — the habit is the curriculum.",
  ],
  causes: [
    "Read the cause's ledger before its mission statement.",
    "Pick your line item — paint, screen, stipend week — and fund it named.",
    "Give monthly if you can; the planning value compounds.",
    "Show up to one program day or wall visit in the quarter.",
    "Share the ledger, not the poster — the receipts are the story.",
  ],
  tiko: [
    "Pick the event and the tier on the live availability page.",
    "Pay by M-Pesa or card — the verification happens server-side, not by redirect.",
    "Keep the QR ticket on your phone; screenshot the order page as backup.",
    "Screenshot the order page as backup.",
    "At the door, present the QR — the scan settles the argument.",
  ],
  local: [
    "Follow three artist pages and one cause page in your town.",
    "Check the calendar every Monday morning.",
    "Attend one thing this week — opening, workshop, or wall.",
    "Message one maker and ask what they're working on.",
    "Buy one small work this month, and write down why.",
  ],
  firstyear: [
    "Complete this month's one assignment honestly — visit, follow, buy small, or write.",
    "Add the invoice and the reason-sentence to the collection document.",
    "Revisit last month's purchase: does it still hold the wall?",
    "Book next month's studio visit before the month starts.",
    "Upgrade one frame or one light — the collection grows by care too.",
  ],
};

const MISTAKES: Partial<Record<Cluster, string[]>> & { general: string[] } = {
  general: [
    "Buying the moment instead of the work — opening-night adrenaline has sold many a mediocre canvas.",
    "Skipping the paperwork — an undocumented purchase loses half its value at the first appraisal.",
    "Trusting a screenshot over a ledger — availability and receipts exist to be checked, not admired.",
    "Waiting for expertise before starting — the eye is built by looking, not by qualifying.",
    "Insulting the price — the question is always 'what's the story behind the number', never 'why so much'.",
  ],
  donations: [
    "Giving to the poster instead of the ledger.",
    "Sending in-kind gifts without a valuation conversation first.",
    "Assuming deduction treatment instead of asking a professional.",
    "One big cheque instead of the recurring gift the program can plan around.",
    "Not keeping the receipt — the M-Pesa confirmation is the document.",
  ],
  events: [
    "Arriving at the second hour and complaining the art is hard to see.",
    "Buying tickets from resellers instead of the platform — the QR is the proof of purchase.",
    "Treating the artist as a price tag with a name attached.",
    "Skipping the small works wall.",
    "Leaving before the ten minutes after the talk.",
  ],
  sales: [
    "Paying before the price is in writing.",
    "Buying an edition without seeing its numbering.",
    "Hanging a work in direct sun and calling the fade 'vintage'.",
    "Reselling inside a year and calling the result a market verdict.",
    "Not photographing the signature on arrival.",
  ],
  education: [
    "Reading about art instead of looking at it.",
    "Learning terminology before learning to look.",
    "Mistaking confusion for incapacity — confusion is the syllabus.",
    "Only looking at one kind of work and calling it taste.",
    "Quoting a critic where your own eyes would do.",
  ],
  causes: [
    "Funding the mission statement instead of the line items.",
    "Skipping the ledger month.",
    "Assuming artists are paid because 'the program says so'.",
    "Cross-border transfers without asking which channel loses least to fees.",
    "Treating the stipend week as overhead instead of the point.",
  ],
  tiko: [
    "Waiting at the door to buy — availability was live all week.",
    "Losing the QR with no screenshot backup.",
    "Trusting a redirect as payment confirmation — verification is server-side.",
    "Group-buying past the per-order cap and expecting the room to bend.",
    "Not reading the tier description — the table ticket includes things general doesn't.",
  ],
  local: [
    "Waiting for a white cube to arrive before taking the scene seriously.",
    "Driving through Voi/Machakos/Nyeri without visiting the maker you messaged.",
    "Paying beach-kiosk prices for studio work and calling it a bargain.",
    "Ignoring school programs — that's where the pipeline is visible.",
    "Not telling the platform what your town actually has — the calendar improves by report.",
  ],
  firstyear: [
    "Buying big before the eye is calibrated.",
    "Collecting without the reason-sentence document.",
    "Outgrowing works and leaving them in a drawer instead of rotating.",
    "Confusing the collection with the shopping.",
    "Skipping the studio visit because the wall photo looked fine.",
  ],
};

const CHECKLIST: Partial<Record<Cluster, string[]>> & { general: string[] } = {
  general: [
    "Budget set, in KES, in writing",
    "Three options shortlisted and compared",
    "One human contacted (artist, organiser, or cause)",
    "Sleep-on-it night completed",
    "Decision documented (invoice, note, screenshot)",
    "Calendar updated with the follow-up",
  ],
  donations: [
    "Ledger read (this month's, not last quarter's)",
    "Line item chosen and named in the gift",
    "M-Pesa or card receipt saved",
    "Monthly option considered",
    "Cause page followed for the next ledger",
    "One friend told why",
  ],
  events: [
    "Ticket bought on the platform (not the door, not a reseller)",
    "QR screenshotted",
    "Route and hour planned",
    "One question written down",
    "Artist page followed",
    "Plus-one briefed on the 18+ rules where they apply",
  ],
  sales: [
    "Wall measured, budget written",
    "Artist verified (studio page, story, prices published)",
    "Medium and edition stated in writing",
    "Invoice saved; signature photographed on arrival",
    "Framing to conservation standard planned",
    "Provenance file opened (folder or drawer, your choice — but one)",
  ],
  education: [
    "Five verifiable things written",
    "Locked-door sentence written",
    "One artist page read fully",
    "One glossary slice read",
    "One workshop or opening attended",
    "Weekly looking slot in the calendar",
  ],
  causes: [
    "Ledger read this month",
    "Line item funded by name",
    "Receipt saved",
    "Monthly giving considered",
    "Program day visited or shared",
    "Question sent where the page didn't answer",
  ],
  tiko: [
    "Availability checked live",
    "Tier limits (per-order cap) read",
    "Payment made on the platform",
    "QR + order page screenshotted",
    "Buyer email and phone entered correctly (the M-Pesa prompt goes to the number)",
    "Door time planned",
  ],
  local: [
    "Three local artist pages followed",
    "Monday calendar check done",
    "One event attended this week",
    "One maker messaged",
    "One small purchase made and documented",
    "One gap reported to the platform (what's missing in your town?)",
  ],
  firstyear: [
    "This month's assignment done",
    "Invoice and reason-sentence filed",
    "Wall reviewed: what still holds?",
    "One care upgrade (frame, light, hang)",
    "Next month's studio visit booked",
    "Budget line respected",
  ],
};

const GENERAL_BANK: string[] = [
  "Trust in this market is built from boring materials: receipts, ledgers, published prices, verified payments. The exciting parts — openings, nights, auctions — only mean something because the boring parts are solid. Every guide in this series is an argument for the boring parts.",
  "The KES-first principle: prices stated in shillings you can verify against materials and studio rents, not dollars converted at whoever's advantage. A market that prices in its own currency is a market that belongs to itself.",
  "Artist-direct relationships are the region's structural advantage: shorter chains, honest margins, and stories heard from the source. The homework is verification — and the reward is a collection that means what it says.",
  "Documentation is the collector's compound interest. Invoice, photograph, artist's message, reason-sentence — filed together in the same hour. Ten minutes on purchase day becomes the provenance that answers every future question.",
  "Condition care in East African climates is a real discipline: equatorial light, coastal salt air, dust in the dry season, damp in the rains. Framing to conservation standard and hanging away from direct sun is the cheapest value protection that exists.",
  "The calendar is a public good. One platform, one calendar, live availability — means a collector in Kutus and a curator in Kilimani get the same answer to 'what's on this weekend'. Scarcity of information was the old gate; it's not coming back.",
  "Attention is the underrated currency. The collectors who matter to a scene are the ones who show up monthly — at the opening, at the wall, at the cause day. Money follows attention; it rarely leads it.",
  "The receipt culture extends to everyone: platforms publish ledgers, artists publish prices, buyers keep invoices. Every hand in the chain holding paper is what makes the next hand honest.",
  "Asking questions is a skill: 'what's the story behind this work' opens doors that 'why is it so expensive' closes. The first question respects the making; the second respects only the market. Collectors who learn the first get answers the second never hears.",
  "East African art doesn't need validating from elsewhere — it needs documenting from inside. Every purchase with its papers, every wall with its ledger, every spotlight with its close reading is the region writing its own catalogue raisonné in public.",
];

// ---------------------------------------------------------------------------
// Composer
// ---------------------------------------------------------------------------
function pick<T>(arr: readonly T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length];
}

function wc(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function linksFor(cluster: Cluster, index: number): string {
  const pool = INTERNAL_LINKS[cluster] ?? INTERNAL_LINKS.education;
  const a = pool[index % pool.length];
  const b = pool[(index + 1) % pool.length];
  const c = pool[(index + 2) % pool.length];
  return `Close to home: [${a[1]}](${a[0]}) is where this gets practical — real works, real prices, real availability. Beyond that, [${b[1]}](${b[0]}) and [${c[1]}](${c[0]}) are the two pages this desk keeps open all week.`;
}

const STEPS_FALLBACK = STEPS.general;
const MISTAKES_FALLBACK = MISTAKES.general;
const CHECKLIST_FALLBACK = CHECKLIST.general;

function clusterSections(spec: ArticleSpec, index: number): string {
  const cluster = spec.cluster;
  const focusPhrase = spec.focus.replace(/-/g, " ");
  const focusTitle = focusPhrase.replace(/\b\w/g, (m) => m.toUpperCase());
  const where = spec.city ? ` in ${spec.city}` : " across East Africa";
  const bank = BANKS[cluster];

  const faqBank = FAQ_BANKS[cluster] ?? FAQ_BANKS.education;
  const faqs: string[] = [];
  for (let i = 0; i < Math.min(4, faqBank.length); i += 1) {
    const [q, a] = pick(faqBank, index + i);
    faqs.push(`**${spec.city ? q.replace(/__CITY__/g, spec.city) : q}**\n\n${spec.city ? a.replace(/__CITY__/g, spec.city) : a}`);
  }

  const steps = STEPS[cluster] ?? STEPS_FALLBACK;
  const mistakes = MISTAKES[cluster] ?? MISTAKES_FALLBACK;
  const checklist = CHECKLIST[cluster] ?? CHECKLIST_FALLBACK;

  const sections: string[] = [];

  // Intro
  sections.push(
    `${focusTitle}${where} — this guide is the practical version, written from the platform's own ground: published works, live calendars, cause ledgers, and ticket availability that is computed rather than claimed. No imported headlines, no invented statistics; every specific here traces to something you can click and verify. By the end you'll know what ${focusPhrase.toLowerCase()} involves, which checks to run before money moves, and which pages on ArtCollect and TikoYetu do the heavy lifting for you.`,
  );

  // What this covers
  sections.push(
    `## What this guide covers\n\n- The honest mechanics of **${focusPhrase}**${spec.city ? ` as they play out in ${spec.city}` : " in the East African context"}\n- The checks that protect your money and your collection\n- Where ArtCollect and TikoYetu carry the weight (and where they deliberately don't)\n- The mistakes this desk sees most often — and the checklist that prevents them\n- Four quick answers to the questions readers actually send`,
  );

  // Core section 1
  sections.push(`## ${focusTitle}: what the words actually mean\n\n${pick(bank, index)}`);

  // Core section 2
  sections.push(`## How it works in practice\n\n${pick(bank, index + 2)}`);

  // City module or third bank paragraph
  if (spec.city && CITY_PARAS[spec.city]) {
    sections.push(`## The ${spec.city} picture\n\n${CITY_PARAS[spec.city]}`);
  } else {
    sections.push(`## The regional angle\n\n${pick(bank, index + 4)}`);
  }

  // On ArtCollect
  sections.push(`## On ArtCollect specifically\n\n${linksFor(cluster, index)}`);

  // Steps
  sections.push(
    `## Doing it well this month\n\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
  );

  // Mistakes
  sections.push(
    `## Mistakes this desk sees most\n\n${mistakes.map((m) => `- ${m}`).join("\n")}`,
  );

  // Checklist
  sections.push(
    `## The checklist\n\n${checklist.map((c) => `- [ ] ${c}`).join("\n")}`,
  );

  // FAQ
  sections.push(`## Quick answers\n\n${faqs.join("\n\n")}`);

  // Further reading
  sections.push(
    `## Keep reading on the journal\n\n- [The Beginner's Guide to Art Collecting](/journal/the-beginners-guide-to-art-collecting)\n- [How to Value Your Artwork: A Complete Guide](/journal/how-to-value-your-artwork-a-complete-guide)\n- [Kibera Walls Fund: Paint Litres, Stipend Weeks, and Public Receipts](/journal/kibera-walls-fund-paint-litres-stipend-weeks-and-public-receipts)\n- [Genesis at The Party Paris Lounge: 404 Effect's Friday Night in Kutus](/journal/genesis-at-the-party-paris-lounge-404-effects-friday-night-in-kutus)\n- The full [journal index](/journal) and the [browse wall](/browse) — both update live.`,
  );

  // CTA
  sections.push(
    `## The one-paragraph version\n\n${focusPhrase} rewards the boring disciplines: read the ledger, set the budget, message the human, document everything, show up monthly. ArtCollect exists to make those five steps easy on one platform — the wall for looking, the calendar for planning, TikoYetu for paying, and the causes for giving where it counts. Start with one step this week; the rest of this series will be here, dated and receipted, when you need it. — The ArtCollect Desk`,
  );

  let body = sections.join("\n\n");

  // Pad to the word threshold with evergreen appendices.
  let pad = 0;
  while (wc(body) < MIN_WORDS && pad < 8) {
    body += `\n\n## Going deeper, part ${pad + 1}\n\n${pick(GENERAL_BANK, index + pad)}`;
    body += `\n\n${pick(bank, index + pad + 1)}`;
    pad += 1;
  }

  return body;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
const START = new Date();
const PUBLISHED_COUNT = 10;

/** One-time expansion mode: re-composes every body with the long-form composer. */
const REWRITE_BODY = process.env.JOURNAL_REWRITE_BODY === "1";
/** Hand-written pieces whose lead survives the rewrite (extended, not replaced). */
const PRESERVE_LEAD = new Set([
  "why-collage-owns-the-nairobi-wall",
  "studio-visit-wanjiku-mwangi",
  "five-community-walls-that-raised-themselves",
  "what-happens-at-an-opening-night",
  "inside-the-kibera-walls-fund",
  "buying-direct-from-the-artist",
  "why-donate-to-an-art-cause",
  "starting-your-first-art-collection",
  "how-much-is-your-artwork-worth",
]);

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

    let body = clusterSections(spec, i);
    // The three hand-written originals keep their editorial lead; the new
    // long-form composer extends them past the word threshold instead of
    // replacing their voice.
    if (REWRITE_BODY && PRESERVE_LEAD.has(slug)) {
      const existing = await prisma.post.findUnique({ where: { slug }, select: { body: true } });
      if (existing?.body) body = `${existing.body}\n\n---\n\n${body}`;
    }
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
      // REWRITE_BODY=1 re-composes every body once (this expansion run).
      // Default keeps manual editorial edits intact across re-seeds.
      update: REWRITE_BODY ? { body } : {},
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
