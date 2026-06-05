import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    return NextResponse.json({
      allow_unit_report_edit: settingsMap['allow_unit_report_edit'] ?? 'true',
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
