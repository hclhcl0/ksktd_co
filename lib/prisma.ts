import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  var pgPool: Pool | undefined;
}

const poolConfig = {
  connectionString: process.env.POSTGRES_URL,
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.POSTGRES_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
};

function createPrisma(): PrismaClient {
  // Reuse the global pool to avoid creating new connections on every request
  if (!global.pgPool) {
    global.pgPool = new Pool(poolConfig);
  }
  const adapter = new PrismaPg(global.pgPool);
  return new PrismaClient({ adapter });
}

export const prisma = global.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
