import 'dotenv/config';
import { prisma } from './lib/prisma';
import * as fs from 'fs';

async function main() {
  const accounts = await prisma.account.findMany({
    where: {
      role: 'unit'
    },
    orderBy: {
      displayName: 'asc'
    }
  });

  const csvLines = ['Tên đăng nhập,Tên đơn vị,Mật khẩu'];
  for (const acc of accounts) {
    csvLines.push(`"${acc.username}","${acc.displayName}","${acc.password}"`);
  }

  const csvData = csvLines.join('\n');
  fs.writeFileSync('C:\\Users\\SingPC\\.gemini\\antigravity\\brain\\35832369-542c-4184-a381-e2abc4977372\\scratch\\accounts.csv', csvData, 'utf-8');
  console.log(`Exported ${accounts.length} accounts to accounts.csv`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
