import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

async function main() {
  const spec = {
    slug: "diaspora-artist-relief-fund",
    title: "East African Diaspora Artist Relief",
    summary: "Emergency materials and studio grants for East African artists abroad facing a sudden loss of workspace or materials.",
    story: `An East African artist abroad who loses a studio, a materials shipment, or a commission in the same month is one bad quarter out of the practice. This relief fund is the fast, small grant that bridges that quarter.\n\n## What a donation buys\n\n- 100 USD — an emergency materials grant\n- 250 USD — a one-month studio-bridge grant\n- 500 USD — a full quarter's relief for one artist\n\nGrants paid and a spending ledger are published monthly.`,
    country: "East Africa",
    organiserName: "Diaspora Artist Support",
    currency: "USD" as const,
    goalMinor: 4000000n,
    raisedMinor: 620000n,
  };
  const cover = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80";
  await prisma.donationCause.upsert({
    where: { slug: spec.slug },
    update: {},
    create: { slug: spec.slug, title: spec.title, summary: spec.summary, story: spec.story, country: spec.country, organiserName: spec.organiserName, goalMinor: spec.goalMinor, currency: spec.currency, coverImageKey: cover, status: "published" },
  });
  const cause = await prisma.donationCause.findUniqueOrThrow({ where: { slug: spec.slug } });
  const existing = await prisma.donation.count({ where: { causeId: cause.id } });
  if (existing === 0) {
    const donors = [
      { key: "amina", amount: 50000n, name: "Amina H.", msg: "For the work on the ground." },
      { key: "anon", amount: 200000n, name: "Anonymous", msg: null },
      { key: "grace", amount: 80000n, name: "Grace W.", msg: "Keep the walls painted." },
    ];
    let remaining = spec.raisedMinor;
    for (const d of donors) {
      if (remaining <= 0n) break;
      const amt = d.amount > remaining ? remaining : d.amount;
      remaining -= amt;
      await prisma.donation.create({ data: { causeId: cause.id, donorEmail: `demo-${spec.slug}-${d.key}@example.com`, donorName: d.name === "Anonymous" ? null : d.name, message: d.msg, anonymous: d.name === "Anonymous", amountMinor: amt, currency: spec.currency, status: "succeeded", providerRef: `demo-${spec.slug}-${d.key}`, webhookEventId: `demo-webhook-${spec.slug}-${d.key}` } });
    }
  }
  console.log("done — total causes:", await prisma.donationCause.count());
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
