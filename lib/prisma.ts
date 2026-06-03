import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaClient: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  const adapter = new PrismaPg(pool);
  prismaClient = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prismaClient = globalForPrisma.prisma;
}

export const prisma = prismaClient;
