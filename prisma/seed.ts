import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding categories, subcategories, and products...");

  const categories = [
    {
      name: "Hardware Components",
      slug: "hardware-components",
      description: "High-performance desktop computers for work and gaming.",
      subCategories: [
        { name: "Graphic Cards" },
        { name: "Motherboard" },
        { name: "Processors" },
      ],
      products: [
        { name: "Alienware Aurora R15", price: 2499.99, description: "High-end gaming desktop with RTX 4090.", image:"" },
        { name: "HP Z4 G5 Workstation", price: 3299.99, description: "Powerful workstation for professionals.", image:"" },
        { name: "ASUS TUF Gaming GeForce RTX™ 4070TI 12GB", price: 1199.99, description: "High-performance graphics card with 12GB GDDR6X memory.", image: "" },
        { name: "GeForce RTX™ 3060 GAMING OC 12G", price: 399.99, description: "NVIDIA GeForce RTX 3060, 12GB GDDR6, OC edition.", image: "" },
        { name: "Intel Core i5-12400f Processor 6 Cores", price: 189.99, description: "6-core Intel Core i5-12400f desktop processor.", image: "" },
        { name: "CPU Ryzen 3 4300G Up To 4.0GHz", price: 129.99, description: "AMD Ryzen 3 4300G, up to 4.0GHz, quad-core processor.", image: "" },
        { name: "MB MSI Pro B760M-P DDR5", price: 149.99, description: "MSI Pro B760M-P motherboard, DDR5 support.", image: "" },
        { name: "GIGABYTE B760M DS3H AX DDR4", price: 159.99, description: "GIGABYTE B760M DS3H AX motherboard, DDR4 support.", image: "" }
      ],
    },
    {
      name: "Monitors",
      slug: "monitors",
      description: "High-resolution screens for work and entertainment.",
      subCategories: [
        { name: "Gaming Monitors" },
        { name: "Curved Monitors" },
      ],
      products: [
        { name: "LG UltraGear 32GP850", price: 499.99, description: "Gaming monitor with 165Hz refresh rate.", image:"" },
        { name: "Dell UltraSharp U3223QE", price: 799.99, description: "32-inch 4K IPS monitor.", image:"" },
        { name: "Samsung 32 Odyssey G5 G55C LS32CG552EMXEG", price: 399.99, description: "Samsung 32-inch Odyssey G5 curved gaming monitor.", image: "" },
        { name: "Asus TUF Gaming VG259Q3A​ Gaming Monitor 25 Inch IPS FHD", price: 229.99, description: "Asus TUF Gaming 25-inch IPS FHD monitor, VG259Q3A.", image: "" }
      ],
    },
    {
      name: "Network",
      slug: "network",
      description: "Routers, modems, and networking accessories.",
      subCategories: [
        { name: "Routers" },
        { name: "Switches" },
      ],
      products: [
        {name:"TP-Link 300Mbps (TD-W9960)",price:199.99,description:"High-speed Wi-Fi router with 300 Mbps downlink and 100 Mbps uplink.",image:"https://res.cloudinary.com/dkaflvjbb/image/upload/v1745007631/TP-Link_300Mbps_TD-W9960_c4gpzp.jpg"},
        {name:"TP-Link 5-Port 10-100 Mbps Desktop Switch",price:299.99,description:"5-port 10/100 Mbps switch with 1000 base stations.",image:"https://res.cloudinary.com/dkaflvjbb/image/upload/v1745007631/TP-Link_5-Port_10-100_Mbps_Desktop_Switch_i5bnct.jpg"},
      ],
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Keyboards, mice, webcams, and other peripherals.",
      subCategories: [
        { name: "Keyboards" },
        { name: "Mice" },
        
      ],
      products: [
        { name: "Logitech G502 LIGHTSPEED", price: 99.99, description: "Wireless ergonomic mouse.", image:"https://res.cloudinary.com/dkaflvjbb/image/upload/v1745007631/G502_LIGHTSPEED_scbyds.webp" },
        { name: "Logitech PRO X SUPERLIGHT 2 DEX", price: 169.99, description: "Mechanical gaming keyboard.", image:"https://res.cloudinary.com/dkaflvjbb/image/upload/v1745007631/PRO_X_SUPERLIGHT_2_DEX_jsxh5t.webp" },
        {name:"Redragon K618 Horus Wireless RGB Mechanical Keyboard",price:149.99,description:"Mechanical gaming keyboard with RGB lighting.",image:"https://res.cloudinary.com/dkaflvjbb/image/upload/v1745007631/Redragon_K618_Horus_Wireless_RGB_Mechanical_Keyboard_ytahua.webp"},
        {name:"Logitech G915 X Keyboard",price:199.99,description:"Wireless gaming keyboard with 1000 DPI.",image:"https://res.cloudinary.com/dkaflvjbb/image/upload/v1745007631/G915_X_ywm9t8.webp"}
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
              image: product.image,
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
