import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant-shadowroot-hq' },
    update: {},
    create: {
      id: 'tenant-shadowroot-hq',
      name: 'Shadow Root Security Technologies',
      domain: 'shadowroot.tech',
    },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@shadowroot.tech';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(12).toString('base64url');
  const passwordHash = await argon2.hash(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'URUU Super Admin',
      role: Role.SUPER_ADMIN,
      tenantId: tenant.id,
    },
  });

  console.log('Tenant:', tenant.name, `(${tenant.id})`);
  console.log('Admin user:', admin.email);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log('Generated password (shown once, save it now):', adminPassword);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
