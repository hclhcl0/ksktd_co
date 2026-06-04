import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { username, groupIds } = await request.json();

    if (!username || !Array.isArray(groupIds)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Lấy toàn bộ các nhóm đối tượng không phải Global
    const customGroups = await prisma.demographicGroup.findMany({
      where: { isGlobal: false }
    });

    const updates = customGroups.map(async (group) => {
      const isSelected = groupIds.includes(group.id);
      const currentlyHas = group.appliedUnits.includes(username);

      if (isSelected && !currentlyHas) {
        // Thêm đơn vị vào danh sách
        return prisma.demographicGroup.update({
          where: { id: group.id },
          data: {
            appliedUnits: [...group.appliedUnits, username]
          }
        });
      } else if (!isSelected && currentlyHas) {
        // Xóa đơn vị khỏi danh sách
        const newUnits = group.appliedUnits.filter(u => u !== username);
        return prisma.demographicGroup.update({
          where: { id: group.id },
          data: {
            appliedUnits: newUnits
          }
        });
      }
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Assign groups error:', error);
    return NextResponse.json({ error: 'Failed to assign groups' }, { status: 500 });
  }
}
