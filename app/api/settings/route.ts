import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();
    let override = false;
    const role = (session?.user as any)?.role;
    if (role === 'unit' && session?.user?.name) {
      const acc = await prisma.account.findUnique({ where: { username: session.user.name } });
      if (acc?.allowEditOverride) {
        override = true;
      }
    }

    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    
    // Nếu được đặc cách, trả về true luôn bất chấp cài đặt chung
    const isAllowed = override || (settingsMap['allow_unit_report_edit'] ?? 'true') === 'true';

    return NextResponse.json({
      allow_unit_report_edit: isAllowed ? 'true' : 'false',
      edit_timeout_hours: parseInt(settingsMap['edit_timeout_hours'] || '48', 10)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    
    // UPSERT settings
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    await logActivity({
      unitName: 'Admin',
      username: session?.user?.name || 'admin',
      action: 'UPDATE',
      entityType: 'settings',
      details: `Thay đổi cài đặt hệ thống: ${JSON.stringify(data)}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
