import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding categories, subcategories, and products...");

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
      products: [
        { name: "Alienware Aurora R15", price: 2499.99, description: "High-end gaming desktop with RTX 4090.", images: [] },
        { name: "HP Z4 G5 Workstation", price: 3299.99, description: "Powerful workstation for professionals.", images: [] },
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
      products: [
        { name: "MacBook Pro 16 M3", price: 2799.99, description: "Apple's latest laptop for creators.", images: [] },
        { name: "Razer Blade 15", price: 2199.99, description: "Sleek and powerful gaming laptop.", images: [] },
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
      products: [
        { name: "Samsung 990 Pro SSD", price: 199.99, description: "Fast PCIe 4.0 NVMe SSD.", images: [] },
        { name: "WD My Passport 4TB", price: 129.99, description: "Portable external hard drive.", images: [] },
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
      products: [
        { name: "LG UltraGear 32GP850", price: 499.99, description: "Gaming monitor with 165Hz refresh rate.", images: [] },
        { name: "Dell UltraSharp U3223QE", price: 799.99, description: "32-inch 4K IPS monitor.", images: [] },
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
      products: [
        { name: "Asus RT-AX86U", price: 249.99, description: "Wi-Fi 6 gaming router.", images: [] },
        { name: "Netgear Nighthawk CM2000", price: 219.99, description: "High-speed DOCSIS 3.1 modem.", images: [] },
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
      products: [
        { name: "Logitech MX Master 3S", price: 99.99, description: "Wireless ergonomic mouse.", images: [] },
        { name: "Razer BlackWidow V4", price: 169.99, description: "Mechanical gaming keyboard.", images: [] },
      ],
    },
  ];

  try {
    // Delete existing data to prevent duplicates
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
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
              slug: sub.name.toLowerCase().replace(/\s+/g, "-"),
            })),
          },
          products: {
            create: category.products.map((product) => ({
              name: product.name,
              price: product.price,
              description: product.description,
              images: product.images,
            })),
          },
        },
        include: { subCategories: true, products: true },
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
