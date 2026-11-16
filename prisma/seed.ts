import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MHC database...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('Admin@MHC2026', 10);
  await prisma.user.upsert({
    where: { email: 'admin@mayharvest.com' },
    update: {},
    create: {
      email: 'admin@mayharvest.com',
      name: 'System Administrator',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create Guard accounts
  const guardPassword = await bcrypt.hash('Guard@MHC2026', 10);
  await prisma.user.upsert({
    where: { email: 'guard1@mayharvest.com' },
    update: {},
    create: {
      email: 'guard1@mayharvest.com',
      name: 'Officer Reyes',
      password: guardPassword,
      role: 'GUARD',
    },
  });

  await prisma.user.upsert({
    where: { email: 'guard2@mayharvest.com' },
    update: {},
    create: {
      email: 'guard2@mayharvest.com',
      name: 'Officer Santos',
      password: guardPassword,
      role: 'GUARD',
    },
  });

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('Default Accounts:');
  console.log('  Admin  → admin@mayharvest.com  / Admin@MHC2026');
  console.log('  Guard  → guard1@mayharvest.com / Guard@MHC2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
