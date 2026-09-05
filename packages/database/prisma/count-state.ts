import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

async function main() {
  const causes = await prisma.donationCause.count();
  const donations = await prisma.donation.count();
  const posts = await prisma.post.count();
  const publishedPosts = await prisma.post.count({ where: { status: "published" } });
  const draftPosts = await prisma.post.count({ where: { status: "draft" } });
  const events = await prisma.ticketingEvent.count();
  console.log(`causes: ${causes} | donations: ${donations}`);
  console.log(`posts total: ${posts} | published: ${publishedPosts} | draft: ${draftPosts}`);
  console.log(`ticketing events: ${events}`);
  await prisma.$disconnect();
}
main();
