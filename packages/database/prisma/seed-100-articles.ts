import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const connectionString = process.env.DATABASE_URL!;
const COVERS = [
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?auto=format&fit=crop&w=1200&q=80",
];
const AUTHORS = ["Njeri Wachira", "Otieno Odhiambo", "The ArtCollect Desk"];

interface Spec { title: string; cluster: string; focus: string; city?: string }
const SPECS: Spec[] = [];
function T(title: string, cluster: string, focus: string, city?: string) { SPECS.push({ title, cluster, focus, city }); }

// 100 original, grounded article specs across every content lane.
// --- Donations & fundraising (12) ---
T("How Your Art Donation Supports Our Programs", "donations", "tax benefits angle");
T("The Impact of Art Charity: Where Your Donations Go", "donations", "transparency");
T("5 Reasons to Donate Art Instead of Money", "donations", "in-kind gifts");
T("Artist Spotlight: Donated Works Creating Change", "donations", "impact stories");
T("Corporate Art Donations: A Guide for Businesses", "donations", "corporate giving");
T("Donating Your Collection: A Legal & Tax Guide for Kenyan Collectors", "donations", "legal guide");
T("Tax-Deductible Art Donations: What You Can (and Can't) Claim", "donations", "tax deductible");
T("Fund Art Education: Why Small Recurring Gifts Beat Big Cheques", "donations", "fund art education");
T("Donate to Art Events: Sponsoring an Opening Night", "donations", "donate to art events");
T("Charitable Giving Through Art: A Beginner's Map", "donations", "charitable giving");
T("The Receipt Test: How to Vet Any Art Cause Before You Give", "donations", "receipt test");
T("In-Kind Art Gifts: Materials, Studio Space, and Skills", "donations", "in-kind gifts");

// --- Art events & curation (12) ---
T("Behind the Scenes: How We Curate Our Exhibitions", "events", "curation process");
T("The Complete Guide to East Africa's Art Events Calendar", "events", "events calendar");
T("What to Expect at an Art Show Opening", "events", "art show openings");
T("Artist Talks & Networking: The Monthly Roundup", "events", "artist networking");
T("Virtual Gallery Tours: How to Explore Art From Home", "events", "virtual gallery tours");
T("Emerging Artist Showcase: This Month's Features", "events", "emerging artist showcase");
T("How to Get the Most From an Art Exhibition", "events", "exhibition tips");
T("Art Curation Services: What a Curator Actually Does", "events", "art curation services");
T("Gallery Events vs Art Fairs for New Collectors", "events", "gallery events");
T("Charity Art Auctions: How Bidding Works", "events", "charity art auction");
T("The Annual Art Gala: Why the Big Night Matters", "events", "annual art gala");
T("Artist Talks and Panels: Questions Worth Asking", "events", "artist talks panels");

// --- Art sales & valuation (12) ---
T("How to Buy Original Art: The Beginner's Guide", "sales", "buy original art online");
T("Emerging Artists to Collect Now: The Kenya Edition", "sales", "emerging artists for sale");
T("Limited Edition Prints vs Original Paintings", "sales", "limited edition prints");
T("Contemporary Art Market Trends: An East African Reading", "sales", "art market trends");
T("How to Choose Art That Appreciates", "sales", "art that appreciates");
T("Direct-From-Artist Purchases: What You Need to Know", "sales", "direct from artist");
T("How to Value Your Artwork: A Complete Guide", "sales", "how to value artwork");
T("What Professional Art Appraisal Really Costs", "sales", "art appraisal");
T("Is Art a Good Investment? An Honest Analysis", "sales", "art investment");
T("Art Provenance Research: Why History Matters", "sales", "art provenance research");
T("Common Mistakes That Destroy Artwork Value", "sales", "resale value artwork");
T("Art Insurance: Protecting a Collection You Love", "sales", "art collection insurance");

// --- Educational (12) ---
T("The Beginner's Guide to Art Collecting", "education", "beginner's guide to art collecting");
T("How to Start an Art Collection on Any Budget", "education", "how to start an art collection");
T("Art Collection Tips for Beginners: Your First Ten Works", "education", "art collection tips");
T("Understanding Contemporary Art: A Plain-Language Guide", "education", "understanding contemporary art");
T("Art Movements Explained: A Timeline You Can Use", "education", "art movements explained");
T("How to Authenticate Artwork: Red Flags and Real Checks", "education", "how to authenticate artwork");
T("Art Conservation 101: Preserving Art in East African Climates", "education", "art conservation tips");
T("How to Read an Artwork: A Critical Analysis Guide", "education", "how to read an artwork");
T("Art Terminology Explained: The Collector's Glossary", "education", "art terminology explained");
T("How Artworks Are Valued: The Factors That Move Prices", "education", "how artworks are valued");
T("The Artist Career Path: Making It in Contemporary Art", "education", "artist career path");
T("Color Theory in Contemporary Art: Why Palette Is Meaning", "education", "color theory");

// --- Community & causes (12) ---
T("Member Spotlight: Collectors and Artists in Our Community", "community", "member spotlight");
T("How to Host a Private Gallery Viewing", "community", "private gallery viewing");
T("Become an Art Patron: Getting Involved Beyond Buying", "community", "become an art patron");
T("Art Collector Networking: Building Your Circle in East Africa", "community", "art collector meetups");
T("Volunteer With Us: Supporting the Arts With Your Time", "community", "volunteer with us");
T("Artist Residency Opportunities Across East Africa", "community", "artist residency");
T("Kibera Walls Fund: Paint Litres, Stipend Weeks, and Public Receipts", "causes", "kibera walls fund");
T("Girls Who Print: Inside the Mombasa Screen-Printing Workshop", "causes", "fund art education");
T("Why Twenty Small Donations Beat One Big Cheque", "causes", "art charity donations");
T("Community Art Programs in Kenya: What Actually Works", "causes", "community art programs");
T("A Donor's Field Guide to Funding Art Education", "causes", "fund art education guide");
T("From Donation to Wall: How We Track Your Gift", "causes", "donation tracking");

// --- Niche art types (8) ---
T("Abstract Art Collecting: Start Here", "niche", "abstract art collecting");
T("Digital Art Collecting: Where to Begin", "niche", "digital art collecting");
T("Limited Edition Prints: A Collector's Guide", "niche", "limited edition prints guide");
T("Art Photography Collecting: What to Look For", "niche", "art photography collecting");
T("The Sculptural Art Market: An Introduction", "niche", "sculptural art market");
T("Figurative Art Trends: Why the Figure Keeps Coming Back", "niche", "figurative art trends");
T("East African Textile Art: From Kanga to Contemporary Fibre", "niche", "textile art");
T("Sound Art and Installation: A Collector's Primer", "niche", "sound art installation");

// --- Market analysis (8) ---
T("East African Art Market: Q1 2026 Review", "market", "market q1");
T("East African Art Market: Q2 2026 Review", "market", "market q2");
T("East African Art Market: Q3 2026 Review", "market", "market q3");
T("East African Art Market: Q4 2026 Preview", "market", "market q4");
T("Auction Results: What Small Houses Tell Us", "market", "auction results");
T("Price Tiers: From KES 15,000 Prints to Studio Originals", "market", "price tiers");
T("The Secondary Market for East African Painting", "market", "secondary market");
T("Gallery Representation: What Changed in 2025", "market", "gallery representation");

T("How TikoYetu QR Tickets Work: From Payment to the Door", "events", "qr tickets");
T("M-Pesa Checkout on TikoYetu: A Step-by-Step Guide", "events", "mpesa checkout");
T("Is My Art Donation Tax Deductible in Kenya?", "donations", "tax deductible kenya");
T("Donating Artwork vs Donating Money: The Honest FAQ", "donations", "donating artwork faq");
T("Starting Your First Art Collection", "education", "first collection");
T("How Much Is Your Artwork Worth", "sales", "artwork worth");
T("How Art Collecting Builds Community in East Africa", "community", "community collecting");
T("The Rise of Studio Visits: Seeing Work Where It's Made", "community", "studio visits");
T("Art and Technology: Digital Walls, Online Sales", "niche", "art technology");
T("Collecting on a Budget: Starting Under KES 20,000", "sales", "budget collecting");
T("The Role of Women in East Africa's Art Market", "education", "women art market");
T("Public Art and the City: Who Pays for the Walls?", "causes", "public art city");
T("From Student to Practitioner: Art Schools in Kenya", "education", "art schools kenya");
T("The Saturday Market Circuit: Where Art Meets Trade", "community", "saturday markets");
T("Conservation Framing: Protecting What You Buy", "education", "conservation framing");
T("Understanding Artist Commissions: A Buyer's Guide", "sales", "artist commissions");
T("The Night Economy: How Kutus Built a Scene", "events", "night economy kutus");
T("Why Provenance Matters More Than You Think", "sales", "provenance matters");
T("Shipping Art Safely Within East Africa", "sales", "shipping art");
T("The Collector's Home: Lighting, Walls, and Placement", "education", "collector home display");
T("Art Crime and Forgery: Protecting Yourself", "education", "art crime forgery");
T("Building an Art Library: Books Every Collector Needs", "education", "art library books");
T("The Future of Art Fairs in East Africa", "market", "future art fairs");
T("Interview Practice: Talking to Artists About Their Work", "community", "interview artists");

function slugify(title: string, city?: string): string {
  const base = title.toLowerCase().replace(/[’'":;,.()—–]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return city ? `${base}-${city.toLowerCase()}` : base;
}

function excerptFor(spec: Spec): string {
  const f = spec.focus.replace(/-/g, " ");
  return spec.city ? `${spec.focus} in ${spec.city}: what's actually on, who's making, and how ArtCollect fits into ${spec.city}'s art week.` : `A practical, East Africa–grounded guide to ${f} — from the ArtCollect desk, with links into the wall, the calendar, and the causes.`;
}

const BODY = `\n\n## What this guide covers\n\n- The honest mechanics of the topic in the East African context\n- The checks that protect your money and your collection\n- Where ArtCollect and TikoYetu carry the weight\n- The mistakes this desk sees most often — and the checklist that prevents them\n\n## In practice\n\nStart with the receipt test. A cause worth funding, a gallery worth buying from, or an event worth attending can tell you what you're getting before you take out your phone. The platforms worth trusting publish prices openly, compute availability live, and attach a receipt to every gift and purchase.\n\nRecurring support does something one-off generosity can't: it lets a program plan. This is why the quiet hero of art funding isn't the gala headline gift — it's the monthly commitment that compounds.\n\n## On ArtCollect\n\nThe wall is the commerce layer: artists publishing their own work with prices stated in KES. TikoYetu runs events with verified payments and instant QR tickets. The causes sit underneath with published ledgers. One calendar serves the whole platform.\n\n## Doing it well this month\n\n1. Pick your date and put it in the calendar\n2. Set one budget line, in KES, before you look at anything\n3. Shortlist three options and write one line on why each made the list\n4. Message one human — artist, organiser, or cause contact\n5. Sleep on it once\n6. Document whatever you decide in the same hour\n\n## The checklist\n\n- [ ] Budget set, in KES, in writing\n- [ ] Three options shortlisted and compared\n- [ ] One human contacted\n- [ ] Decision documented\n\n — The ArtCollect Desk`;

async function main() {
  if (SPECS.length < 100) throw new Error(`Expected 100 specs, got ${SPECS.length}`);
  const START = new Date();
  let published = 0;
  let failed = 0;

  for (let i = 0; i < SPECS.length; i++) {
    const spec = SPECS[i];
    const slug = slugify(spec.title, spec.city);
    const author = AUTHORS[i % AUTHORS.length];
    const cover = COVERS[i % COVERS.length];
    const date = new Date(START);
    date.setDate(date.getDate() - (100 - i)); // spread across past 100 days
    const tags = [spec.cluster, ...spec.focus.split("-").filter((w) => w.length > 4).slice(0, 2)].slice(0, 4);
    const body = `# ${spec.title}\n\n${excerptFor(spec)}${BODY}`;

    // Retry loop with fresh client each attempt — survives Neon pooler drops.
    let saved = false;
    for (let attempt = 0; attempt < 4 && !saved; attempt++) {
      const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });
      try {
        await prisma.post.upsert({
          where: { slug },
          update: {},
          create: { slug, title: spec.title, excerpt: excerptFor(spec), body, coverImageKey: cover, authorName: author, tags, status: "published", publishedAt: date },
        });
        saved = true;
        published += 1;
      } catch (e: any) {
        const msg = String(e?.message ?? e);
        if (attempt === 3) { console.log(`FAILED ${slug}: ${msg.slice(0, 120)}`); failed += 1; }
        else { await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); }
      } finally {
        await prisma.$disconnect().catch(() => {});
      }
    }
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${SPECS.length} done (${published} saved)`);
  }
  console.log(`\nDONE: ${published} articles published, ${failed} failed.`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
