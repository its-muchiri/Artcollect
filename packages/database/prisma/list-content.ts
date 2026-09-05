import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });
async function main() {
  const posts = await prisma.post.findMany({ select: { slug: true, title: true, status: true }, orderBy: { createdAt: "asc" } });
  for (const p of posts) console.log(`${p.status.padEnd(9)} ${p.slug}`);
  console.log("---");
  const causes = await prisma.donationCause.findMany({ select: { slug: true, title: true, currency: true } });
  for (const c of causes) console.log(`${c.currency} ${c.slug}`);
  await prisma.$disconnect();
}
main();
