import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addReport, getAllReports } from '@/lib/data';
import { healthReportSchema } from '@/lib/validations';
import { HealthReport } from '@/lib/types';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { logActivity } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reports = await getAllReports();
    return NextResponse.json({ success: true, data: reports });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách báo cáo' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Xác thực session
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate với Zod
    const parsed = healthReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dữ liệu không hợp lệ',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { don_vi, ngay_kham } = parsed.data;
    const role = (session.user as any)?.role;
    const isAdmin = role === 'admin' || role === 'admin_cdc';

    // Kiểm tra: mỗi đơn vị chỉ được nộp 1 báo cáo/ngày (admin không bị giới hạn)
    if (!isAdmin) {
      const existing = await prisma.healthReport.findFirst({
        where: { don_vi, ngay_kham },
      });
      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: `Đơn vị "${don_vi}" đã nộp báo cáo ngày ${ngay_kham}. Mỗi đơn vị chỉ được nộp 1 báo cáo/ngày.`,
          },
          { status: 409 }
        );
      }
    }

    const newReport: HealthReport = {
      id: uuidv4(),
      ...parsed.data,
      co_so_y_te: !isAdmin && (session.user as any).facilityName ? (session.user as any).facilityName : parsed.data.co_so_y_te,
      created_at: new Date().toISOString(),
    };

    await addReport(newReport);

    await logActivity({
      unitName: don_vi,
      username: session.user?.name || 'unknown',
      action: 'CREATE',
      entityType: 'health_report',
      entityId: newReport.id,
      details: `Nộp báo cáo khám sức khỏe ngày ${ngay_kham}`
    });

    return NextResponse.json({ success: true, data: newReport }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ, vui lòng thử lại' },
      { status: 500 }
    );
  }
}
