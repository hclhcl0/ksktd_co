import { NextRequest, NextResponse } from 'next/server';
import { deleteVaccinationReport, updateVaccinationReport, getVaccinationReports } from '@/lib/vaccination_data';
import { auth } from '@/lib/auth';

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
    const reports = await getVaccinationReports();
    const report = reports.find(r => r.id === id);
    if (!report) return NextResponse.json({ success: false, error: 'Không tìm thấy báo cáo' }, { status: 404 });

    if (!isAdmin) {
      if (report.don_vi !== session.user?.name) {
        return NextResponse.json({ success: false, error: 'Không có quyền xóa báo cáo của đơn vị khác.' }, { status: 403 });
      }
      const reportDate = new Date(report.created_at);
      const diffDays = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        return NextResponse.json({ success: false, error: 'Báo cáo đã quá 7 ngày, không thể xóa. Vui lòng liên hệ Admin.' }, { status: 403 });
      }
    }

    const deleted = await deleteVaccinationReport(id);
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
    // We need to fetch the specific report to check permissions
    // Since getVaccinationReportById doesn't exist, we can use await getVaccinationReports().find
    const reports = await getVaccinationReports();
    const report = reports.find(r => r.id === id);

    if (!report) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy báo cáo' }, { status: 404 });
    }

    if (role === 'unit') {
      const reportDate = new Date(report.created_at);
      const diffDays = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        return NextResponse.json({ success: false, error: 'Báo cáo đã quá 7 ngày, không thể sửa. Vui lòng liên hệ Admin.' }, { status: 403 });
      }
      if (report.don_vi !== session.user?.name) {
        return NextResponse.json({ success: false, error: 'Không có quyền sửa báo cáo của đơn vị khác.' }, { status: 403 });
      }
    }

    const body = await request.json();
    const updated = await updateVaccinationReport(id, body);
    
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
