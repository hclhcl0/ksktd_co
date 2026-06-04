import { prisma } from './lib/prisma';

async function main() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(accounts);
}

main().finally(() => prisma.$disconnect());
