import { NextRequest, NextResponse } from 'next/server';
import { getReportById, deleteReport, updateReport } from '@/lib/data';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: report });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const role = (session?.user as any)?.role;
    const isAdmin = role === 'admin' || role === 'admin_cdc';

    const { id } = await params;
    const report = await getReportById(id);
    if (!report) return NextResponse.json({ success: false, error: 'Không tìm thấy báo cáo' }, { status: 404 });

    if (!isAdmin) {
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'allow_unit_report_edit' } });
      if (setting?.value === 'false') {
        return NextResponse.json({ success: false, error: 'Hệ thống đã khóa tính năng xóa báo cáo.' }, { status: 403 });
      }
      
      // Unit users can only delete their own reports until end of next day
      if (report.don_vi !== session.user?.name) {
        return NextResponse.json({ success: false, error: 'Không có quyền xóa báo cáo của đơn vị khác.' }, { status: 403 });
      }
      const reportDay = new Date(report.created_at).toISOString().split('T')[0];
      const deadline = new Date(reportDay);
      deadline.setDate(deadline.getDate() + 1);
      const todayDay = new Date().toISOString().split('T')[0];
      if (todayDay > deadline.toISOString().split('T')[0]) {
        return NextResponse.json({ success: false, error: 'Báo cáo đã quá hạn chỉnh sửa (hết ngày hôm sau). Vui lòng liên hệ Admin.' }, { status: 403 });
      }
    }

    const deleted = await deleteReport(id);
    if (!deleted) return NextResponse.json({ success: false, error: 'Không thể xóa' }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Xóa thành công' });
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const role = (session?.user as any)?.role;
    
    const { id } = await params;
    const report = await getReportById(id);
    if (!report) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy báo cáo' }, { status: 404 });
    }

    if (role === 'unit') {
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'allow_unit_report_edit' } });
      if (setting?.value === 'false') {
        return NextResponse.json({ success: false, error: 'Hệ thống đã khóa tính năng sửa báo cáo.' }, { status: 403 });
      }

      const reportDay = new Date(report.created_at).toISOString().split('T')[0];
      const deadline = new Date(reportDay);
      deadline.setDate(deadline.getDate() + 1);
      const todayDay = new Date().toISOString().split('T')[0];
      if (todayDay > deadline.toISOString().split('T')[0]) {
        return NextResponse.json({ success: false, error: 'Báo cáo đã quá hạn chỉnh sửa (hết ngày hôm sau). Vui lòng liên hệ Admin.' }, { status: 403 });
      }
      if (report.don_vi !== session.user?.name) {
        return NextResponse.json({ success: false, error: 'Không có quyền sửa báo cáo của đơn vị khác.' }, { status: 403 });
      }
    }

    const body = await request.json();
    // Validate body if needed, but for now we trust the client side format
    const updated = await updateReport(id, body);
    
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
