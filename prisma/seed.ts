import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Desktop', slug: 'desktop', description: 'High-performance desktop computers for work and gaming.' },
    { name: 'Notebook', slug: 'notebook', description: 'Laptops for portability and productivity on the go.' },
    { name: 'Storage', slug: 'storage', description: 'HDDs, SSDs, and external storage solutions.' },
    { name: 'Monitors', slug: 'monitors', description: 'High-resolution screens for work and entertainment.' },
    { name: 'Network', slug: 'network', description: 'Routers, modems, and networking accessories.' },
    { name: 'Accessories', slug: 'accessories', description: 'Keyboards, mice, webcams, and other peripherals.' }
  ];
  

  
    await prisma.category.createMany({
        data: categories
    });
  

  console.log('Seed data added successfully.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
