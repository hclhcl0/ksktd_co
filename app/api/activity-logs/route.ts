import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const unitName = searchParams.get('unitName');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const where: any = {};
    if (unitName) where.unitName = { contains: unitName, mode: 'insensitive' };
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
      })
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
