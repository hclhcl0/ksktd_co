import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const newGroup = await prisma.demographicGroup.create({
      data: {
        key: 'test_creation_' + Date.now(),
        name: 'Test Creation',
        shortLabel: 'TC',
        icon: '👥',
        color: '#3b82f6',
        isActive: true,
        isGlobal: true,
        appliedUnits: []
      }
    });
    console.log('Created successfully:', newGroup.id);
    
    await prisma.demographicGroup.delete({ where: { id: newGroup.id } });
    console.log('Deleted successfully.');
  } catch (error) {
    console.error('Error creating group:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
