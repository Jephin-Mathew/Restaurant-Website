import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@restaurant.com" },
    update: {},
    create: { email: "admin@restaurant.com", passwordHash: hashedPassword },
  });

  await prisma.restaurantConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, capacityPerSlot: 30, slotDurationMinutes: 60, maxPartySize: 10 },
  });

  // Opening hours for all 7 days
  for (let day = 0; day < 7; day++) {
    await prisma.openingHour.upsert({
      where: { dayOfWeek: day },
      update: {},
      create: { dayOfWeek: day, isClosed: false, openTime: "10:00", closeTime: "22:00" },
    });
  }

  // Menu
  const starters = await prisma.menuCategory.create({
    data: { name: "Starters", sortOrder: 0 },
  });

  await prisma.menuItem.createMany({
    data: [
      { name: "Chicken Wings", description: "Spicy grilled wings", price: 299, categoryId: starters.id, sortOrder: 0 },
      { name: "Garlic Bread", description: "Crispy garlic bread", price: 199, categoryId: starters.id, sortOrder: 1 },
    ],
  });

  // Blog
  await prisma.blogPost.create({
    data: {
      title: "Welcome to Our Restaurant",
      slug: "welcome-to-our-restaurant",
      excerpt: "Experience the best dining.",
      content: "Full blog content here...",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  console.log("🌱 Seed complete");
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
