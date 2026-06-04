import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const don_vi = session?.user?.name;

    let whereClause = {};
    if (role === 'unit' && don_vi) {
      whereClause = {
        OR: [
          { isGlobal: true },
          { appliedUnits: { has: don_vi } }
        ]
      };
    }

    const groups = await prisma.demographicGroup.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const newGroup = await prisma.demographicGroup.create({
      data: {
        key: data.key,
        name: data.name,
        shortLabel: data.shortLabel,
        icon: data.icon || '👥',
        color: data.color || '#3b82f6',
        isActive: data.isActive ?? true,
        isGlobal: data.isGlobal ?? true,
        appliedUnits: data.appliedUnits || []
      }
    });

    return NextResponse.json(newGroup);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const data = await request.json();
    
    // Support partial updates
    const updateData: any = {
      name: data.name,
      shortLabel: data.shortLabel,
      icon: data.icon,
      color: data.color,
      isActive: data.isActive
    };
    
    if (data.isGlobal !== undefined) updateData.isGlobal = data.isGlobal;
    if (data.appliedUnits !== undefined) updateData.appliedUnits = data.appliedUnits;

    const updated = await prisma.demographicGroup.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    // Try to delete, might fail if constrained by foreign keys
    try {
      await prisma.demographicGroup.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      // If it fails, do a soft delete (set isActive to false)
      const updated = await prisma.demographicGroup.update({
        where: { id },
        data: { isActive: false }
      });
      return NextResponse.json(updated);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
