import { NextResponse } from 'next/server';
import { getVaccinationReports, addVaccinationReport } from '@/lib/vaccination_data';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GROUP_DEFINITIONS } from '@/lib/constants';
import { logActivity } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId') || undefined;
    return NextResponse.json(await getVaccinationReports(campaignId));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const role = (session.user as any)?.role;
    const isAdmin = role === 'admin' || role === 'admin_cdc';
    const don_vi = body.don_vi || session.user.name || 'Unknown';
    const { ngay_tiem, vaccineId, campaignId, co_so_y_te, nguoi_nop_bao_cao } = body;

    if (!isAdmin) {
      const existing = await prisma.vaccinationReport.findFirst({
        where: { don_vi, ngay_tiem, vaccineId, campaignId }
      });
      if (existing) {
        return NextResponse.json({ error: `Đơn vị "${don_vi}" đã nộp báo cáo cho vắc xin này ngày ${ngay_tiem}. Mỗi đơn vị chỉ được nộp 1 báo cáo/ngày cho mỗi loại vắc xin.` }, { status: 409 });
      }
    }

    // Extract details from flat body structure
    const details = GROUP_DEFINITIONS.map(g => ({
      groupKey: g.key,
      count: body[g.key] !== undefined ? parseInt(body[g.key], 10) : 0
    }));

    // Add report
    const newReport = await addVaccinationReport({
      campaignId,
      vaccineId,
      ngay_tiem,
      nguoi_nop_bao_cao,
      don_vi,
      details
    });

    await logActivity({
      unitName: don_vi,
      username: session.user.name || 'unknown',
      action: 'CREATE',
      entityType: 'vaccination_report',
      entityId: newReport.id,
      details: `Nộp báo cáo tiêm chủng ngày ${ngay_tiem}`
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error: any) {
    console.error('Vaccination report save error:', error);
    return NextResponse.json({ error: `Lỗi khi lưu báo cáo: ${error.message}` }, { status: 500 });
  }
}
