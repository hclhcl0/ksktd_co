import { NextRequest, NextResponse } from 'next/server';
import { getReportById, deleteReport, updateReport } from '@/lib/data';
import { auth } from '@/lib/auth';

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
    const role = (session?.user as any)?.role;
    if (role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await deleteReport(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy báo cáo' }, { status: 404 });
    }

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
      const todayDate = new Date().toISOString().split('T')[0];
      const reportDate = new Date(report.created_at).toISOString().split('T')[0];
      if (todayDate !== reportDate) {
        return NextResponse.json({ success: false, error: 'Đã hết hạn sửa báo cáo. Vui lòng liên hệ Admin.' }, { status: 403 });
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
