import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------- HELPERS ----------------

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomDate() {
  const now = new Date();
  return new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000);
}

function generatePhone() {
  const prefixes = ["012", "013", "014", "016", "017", "018", "019"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(1000000 + Math.random() * 9000000);
  return `+60${prefix.slice(1)}${number}`;
}

// ---------------- DATA ----------------

const locations = [
  "Kuala Lumpur",
  "Petaling Jaya",
  "Subang Jaya",
  "Shah Alam",
  "Puchong",
  "Cheras",
  "Klang",
];

const jobData = [
  { title: "Part-Time Barista", salary: "RM9/hour" },
  { title: "Retail Assistant", salary: "RM1800/month" },
  { title: "Admin Clerk", salary: "RM2500/month" },
  { title: "Warehouse Helper", salary: "RM100/day" },
  { title: "Customer Service Executive", salary: "RM3000/month" },
];

const serviceData = [
  { title: "Aircond Repair Service", price: "From RM80" },
  { title: "Home Cleaning Service", price: "RM100/session" },
  { title: "Plumbing Service", price: "From RM50" },
  { title: "Freelance Graphic Designer", price: "From RM150" },
];

const marketplaceData = [
  { title: "Used iPhone 13", price: "RM1800" },
  { title: "Gaming Laptop ASUS", price: "RM3200" },
  { title: "Office Chair (Good Condition)", price: "RM120" },
];

// ---------------- GENERATOR ----------------

function generateAd() {
  const type = Math.random();

  const location = locations[Math.floor(Math.random() * locations.length)];

  if (type < 0.4) {
    const job = jobData[Math.floor(Math.random() * jobData.length)];
    const title = `${job.title} – ${location} (${job.salary})`;

    return {
      title,
      description: `We are hiring for ${job.title} in ${location}. Immediate start available. Contact us for more details.`,
      category: "JOBS",
      location,
    };
  }

  if (type < 0.7) {
    const service = serviceData[Math.floor(Math.random() * serviceData.length)];
    const title = `${service.title} – ${location} (${service.price})`;

    return {
      title,
      description: `Professional ${service.title.toLowerCase()} available in ${location}. Affordable and reliable.`,
      category: "SERVICES",
      location,
    };
  }

  const item =
    marketplaceData[Math.floor(Math.random() * marketplaceData.length)];
  const title = `${item.title} – ${location} (${item.price})`;

  return {
    title,
    description: `${item.title} for sale in ${location}. Well maintained and ready to use.`,
    category: "MARKETPLACE",
    location,
  };
}

// ---------------- MAIN ----------------

async function main() {
  console.log("Seeding...");

  // Clear data
  await prisma.message.deleteMany();
  await prisma.adsViews.deleteMany();
  await prisma.ads.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adsTag.deleteMany();
  await prisma.adLocation.deleteMany();

  // Create users
  const users = [];
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        clerkId: `user_${i}`,
        name: `User ${i}`,
        email: `user_${i}@example.com`,
        imageUrl: `https://picsum.photos/200?random=${i}`,
      },
    });
    users.push(user);
  }

  // Create locations
  const locationMap: Record<string, any> = {};
  for (const loc of locations) {
    const location = await prisma.adLocation.create({
      data: { name: loc },
    });
    locationMap[loc] = location;
  }

  // Create tags
  const tagNames = ["urgent", "new", "sale", "featured", "limited"];

  const tags = [];
  for (const name of tagNames) {
    const tag = await prisma.adsTag.create({
      data: { name },
    });
    tags.push(tag);
  }

  // Create ads
  const adsList = [];

  for (let i = 0; i < 60; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const adData = generateAd();

    const ad = await prisma.ads.create({
      data: {
        userId: user.id,
        title: adData.title,
        slug: generateSlug(adData.title),
        description: adData.description,
        category: adData.category as any,
        status: "ACTIVE",
        contactName: user.name,
        contactNumber: generatePhone(),
        hotness: Math.floor(Math.random() * 100),
        priority: Math.floor(Math.random() * 3),
        createdAt: randomDate(),

        location: {
          connect: [{ id: locationMap[adData.location].id }],
        },
      },
    });

    // Attach tags
    const randomTags = tags
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);

    await prisma.ads.update({
      where: { id: ad.id },
      data: {
        tags: {
          connect: randomTags.map((t) => ({ id: t.id })),
        },
      },
    });

    adsList.push(ad);
  }

  // Create messages
  // for (let i = 0; i < 30; i++) {
  //   const ad = adsList[Math.floor(Math.random() * adsList.length)];
  //   const sender = users[Math.floor(Math.random() * users.length)];

  //   await prisma.message.create({
  //     data: {
  //       adsId: ad.id,
  //       senderId: sender.clerkId,
  //       receiverId: ad.userId,
  //       content: `Hi, is this still available? I'm interested in "${ad.title}".`,
  //       read: Math.random() > 0.5,
  //       createdAt: randomDate(),
  //     },
  //   });
  // }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
