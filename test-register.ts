import { prisma } from './lib/prisma';

async function test() {
  try {
    const newAccount = await prisma.account.create({
      data: {
        username: 'test_register_user_1',
        displayName: 'Test Register',
        password: 'password123',
        role: 'unit',
        status: 'pending',
        orgType: 'school',
      }
    });
    console.log('Success:', newAccount);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
