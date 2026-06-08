import { NextResponse } from 'next/server';
import { upsertBenchmark, BenchmarkDataRecord } from '@/lib/benchmarks_db';
import { auth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function PUT(
  request: Request,
  context: { params: Promise<{ don_vi: string }> }
) {
  try {
    const { don_vi: encodedDonVi } = await context.params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const role = (session.user as any).role;
    const don_vi = decodeURIComponent(encodedDonVi);

    // Cho phép Admin cập nhật chỉ tiêu thay cho đơn vị nếu cần thiết

    // Đơn vị chỉ được cập nhật chỉ tiêu của chính mình
    if (role === 'unit') {
      const unitName = session.user?.name;
      if (unitName !== don_vi) {
        return NextResponse.json(
          { success: false, error: 'Bạn chỉ được cập nhật chỉ tiêu của đơn vị mình.' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    if (!body.details || !Array.isArray(body.details)) {
      return NextResponse.json(
        { success: false, error: 'Invalid details payload' },
        { status: 400 }
      );
    }

    const parsed: BenchmarkDataRecord[] = body.details.map((d: any) => {
      let target = null;
      if (d.target !== null && d.target !== '' && d.target !== undefined) {
        const n = parseInt(String(d.target).replace(/[.,\s]/g, ''), 10);
        target = isNaN(n) ? null : n;
      }
      return { groupKey: String(d.groupKey), target };
    });

    const updated = await upsertBenchmark(don_vi, parsed);

    await logActivity({
      unitName: session.user?.name || 'unknown',
      username: session.user?.name || 'unknown',
      action: 'UPDATE',
      entityType: 'benchmark',
      entityId: don_vi,
      details: `Cập nhật chỉ tiêu cho đơn vị ${don_vi}`
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật chỉ tiêu' },
      { status: 500 }
    );
  }
}
