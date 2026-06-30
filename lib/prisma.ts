import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  var pgPool: Pool | undefined;
}

function buildPoolConfig() {
  const connectionString = process.env.POSTGRES_URL || '';
  const isSupabase = connectionString.includes('supabase');

  // Strip sslmode from connection string to avoid conflict with ssl config below
  const cleanUrl = connectionString.replace(/[?&]sslmode=[^&]*/g, '').replace(/[?&]pgbouncer=[^&]*/g, '').replace(/[?&]supa=[^&]*/g, '');

  return {
    connectionString: cleanUrl,
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
    // Supabase pooler uses self-signed cert — must disable verification
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  };
}

function createPrisma(): PrismaClient {
  if (!global.pgPool) {
    global.pgPool = new Pool(buildPoolConfig());
  }
  const adapter = new PrismaPg(global.pgPool);
  return new PrismaClient({ adapter });
}

export const prisma = global.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
