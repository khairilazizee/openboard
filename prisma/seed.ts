import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.ads.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adsTag.deleteMany();

  function generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return slug;
  }

  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        clerkId: `user_${i}`,
        name: `User ${i}`,
        email: `user_${i}@example.com`,
        imageUrl: `https://picsum.photos/200/300?random=${i}`,
      },
    });
    users.push(user);
  }

  const categories = ["BUSINESSES", "SERVICES", "REQUESTS"];
  const statuses = ["ACTIVE", "PRIVATE", "INACTIVE"];

  const titles = [
    "Summer Sale - 50% Off",
    "New Product Launch",
    "Job Opportunity Available",
    "Free Workshop",
    "Premium Service",
    "Business Partnership",
    "Looking for Freelancer",
    "Discount Offer",
    "Grand Opening",
    "Special Promotion",
  ];

  const descriptions = [
    "Get amazing discounts on all items this summer season. Limited time only!",
    "Introducing our latest product line. Be the first to experience innovation.",
    "We are hiring! Join our growing team of professionals.",
    "Learn digital marketing skills for free. Register now!",
    "Premium services tailored to your needs. Satisfaction guaranteed.",
    "Looking for business partners to expand our reach. Let's grow together.",
    "Looking for talented freelancers for ongoing projects.",
    "Special discount offer for new customers. Don't miss out!",
    "Join us for our grand opening event. Free gifts for attendees!",
    "Limited time promotion. Act fast before it's too late!",
  ];

  for (let i = 1; i <= 120; i++) {
    const userIndex = i % 10;
    const titleIndex = (i - 1) % titles.length;
    const descIndex = (i - 1) % descriptions.length;
    const title = `${titles[titleIndex]} ${Math.floor((i - 1) / 10) + 1}`;

    await prisma.ads.create({
      data: {
        userId: users[userIndex].id,
        title: title,
        slug: generateSlug(title),
        description: descriptions[descIndex],
        category: categories[i % 3] as "BUSINESSES" | "SERVICES" | "REQUESTS",
        status: statuses[i % 3] as "ACTIVE" | "PRIVATE" | "INACTIVE",
        contactName: users[userIndex].name,
        hotness: Math.floor(Math.random() * 100),
        priority: Math.floor(Math.random() * 4),
        contactNumber: `+1234567${String(i).padStart(4, "0")}`,
      },
    });
  }

  const tags = [
    "urgent",
    "new",
    "sale",
    "free",
    "premium",
    "featured",
    "limited",
    "exclusive",
  ];

  const createdTags = [];
  for (const tagName of tags) {
    const tag = await prisma.adsTag.create({
      data: { name: tagName },
    });
    createdTags.push(tag);
  }

  const allAds = await prisma.ads.findMany({
    include: { user: true },
  });

  for (let i = 0; i < 50; i++) {
    const ad = allAds[i];
    const randomTags = createdTags
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);

    for (const tag of randomTags) {
      await prisma.ads.update({
        where: { id: ad.id },
        data: {
          tags: {
            connect: { id: tag.id },
          },
        },
      });
    }
  }

  for (let i = 1; i <= 20; i++) {
    const adIndex = Math.floor(Math.random() * allAds.length);
    const ad = allAds[adIndex];
    const senderIndex = Math.floor(Math.random() * 10);

    await prisma.message.create({
      data: {
        adsId: ad.id,
        senderId: users[senderIndex].clerkId,
        receiverId: ad.user.clerkId,
        content: `Hi! I'm interested in your ad "${ad.title}". Is it still available?`,
        read: Math.random() > 0.5,
      },
    });
  }

  console.log("Seeding completed!");
  console.log(`Created ${users.length} users`);
  console.log(`Created ${allAds.length} ads`);
  console.log(`Created ${createdTags.length} tags`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
