import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });
async function main() {
  const causes = await prisma.donationCause.findMany({ select: { title: true, currency: true, goalMinor: true, country: true, status: true }, orderBy: { createdAt: "asc" } });
  console.log(`\n=== ${causes.length} causes ===`);
  const kes = causes.filter((c) => c.currency === "KES");
  const usd = causes.filter((c) => c.currency === "USD");
  console.log(`KES: ${kes.length} | USD: ${usd.length} | all published: ${causes.every((c) => c.status === "published")}`);
  console.log("\n--- KES causes (goal / raised) ---");
  for (const c of kes) console.log(`  ${c.title}: ${(Number(c.goalMinor) / 100).toLocaleString()} KES goal, ${(Number(c.raisedMinor) / 100).toLocaleString()} raised (${c.country})`);
  console.log("\n--- USD causes (goal / raised) ---");
  for (const c of usd) console.log(`  ${c.title}: $${(Number(c.goalMinor) / 100).toLocaleString()} goal, $${(Number(c.raisedMinor) / 100).toLocaleString()} raised (${c.country})`);
  // verify donation tiers present in story
  const withTiers = causes.filter((c) => c.story.includes("What a donation buys") || c.story.includes("donation buys"));
  console.log(`\ncauses with donation-tier breakdowns: ${withTiers.length}/${causes.length}`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
