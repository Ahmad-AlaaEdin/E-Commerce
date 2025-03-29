import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding categories and subcategories...");

  const categories = [
    {
      name: "Desktop",
      slug: "desktop",
      description: "High-performance desktop computers for work and gaming.",
      subCategories: [
        { name: "Gaming Desktops" },
        { name: "Workstations" },
        { name: "All-in-One PCs" },
      ],
    },
    {
      name: "Notebook",
      slug: "notebook",
      description: "Laptops for portability and productivity on the go.",
      subCategories: [
        { name: "Ultrabooks" },
        { name: "Gaming Laptops" },
        { name: "Business Laptops" },
      ],
    },
    {
      name: "Storage",
      slug: "storage",
      description: "HDDs, SSDs, and external storage solutions.",
      subCategories: [
        { name: "Internal SSDs" },
        { name: "External HDDs" },
        { name: "USB Flash Drives" },
      ],
    },
    {
      name: "Monitors",
      slug: "monitors",
      description: "High-resolution screens for work and entertainment.",
      subCategories: [
        { name: "4K Monitors" },
        { name: "Gaming Monitors" },
        { name: "Curved Monitors" },
      ],
    },
    {
      name: "Network",
      slug: "network",
      description: "Routers, modems, and networking accessories.",
      subCategories: [
        { name: "Wi-Fi Routers" },
        { name: "Modems" },
        { name: "Network Switches" },
      ],
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Keyboards, mice, webcams, and other peripherals.",
      subCategories: [
        { name: "Keyboards" },
        { name: "Mice" },
        { name: "Webcams" },
      ],
    },
  ];

  try {
    // Delete existing data to avoid duplicates
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();

    for (const category of categories) {
      const createdCategory = await prisma.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          subCategories: {
            create: category.subCategories.map((sub) => ({
              name: sub.name,
              slug: sub.name.toLowerCase().replace(/\s+/g, "-"), // Generate slug
            })),
          },
        },
        include: { subCategories: true },
      });

      console.log(`✅ Created category: ${createdCategory.name}`);
    }

    console.log("🎉 Seed data added successfully.");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
