import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || "postgresql://inventory_user:inventory_password@localhost:5433/inventory_db?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      password: hashedPassword
    }
  });
  console.log(`Demo user created: ${user.username} / password123`);

  // Warehouses
  const w1 = await prisma.warehouse.upsert({
    where: { code: 'W-NYC' },
    update: {},
    create: { name: 'New York Warehouse', code: 'W-NYC' }
  });

  const w2 = await prisma.warehouse.upsert({
    where: { code: 'W-LA' },
    update: {},
    create: { name: 'Los Angeles Warehouse', code: 'W-LA' }
  });

  // Products
  const p1 = await prisma.product.upsert({
    where: { sku: 'SKU-001' },
    update: {},
    create: { name: 'Wireless Mouse', sku: 'SKU-001' }
  });

  const p2 = await prisma.product.upsert({
    where: { sku: 'SKU-002' },
    update: {},
    create: { name: 'Mechanical Keyboard', sku: 'SKU-002' }
  });

  // Ensure inventory records exist
  const products = [p1, p2];
  const warehouses = [w1, w2];

  for (const product of products) {
    for (const warehouse of warehouses) {
      await prisma.inventory.upsert({
        where: {
          productId_warehouseId: {
            productId: product.id,
            warehouseId: warehouse.id
          }
        },
        update: {},
        create: {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: 100 // Seed with some initial stock
        }
      });
    }
  }
  
  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
