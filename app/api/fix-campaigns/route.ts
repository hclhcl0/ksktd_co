import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await prisma.vaccineCampaign.updateMany({
      where: {
        status: 'upcoming'
      },
      data: {
        status: 'active'
      }
    });
    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
