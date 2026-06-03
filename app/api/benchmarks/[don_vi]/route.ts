import { NextResponse } from 'next/server';
import { upsertBenchmark } from '@/lib/benchmarks_db';
import { auth } from '@/lib/auth';

export async function PUT(
  request: Request,
  context: { params: Promise<{ don_vi: string }> }
) {
  try {
    const { don_vi: encodedDonVi } = await context.params;
    const session = await auth();
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'admin_cdc')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const don_vi = decodeURIComponent(encodedDonVi);
    const body = await request.json();

    // Parse values: empty string or null → null, else parseInt
    const parsed: Record<string, number | null> = {};
    const fields = ['nguoi_cao_tuoi', 'nguoi_khuyet_tat', 'ho_ngheo', 'ho_can_ngheo', 'nguoi_co_cong', 'vung_kho_khan', 'tre_em_duoi_6_tuoi'];
    for (const f of fields) {
      const v = body[f];
      if (v === null || v === '' || v === undefined) {
        parsed[f] = null;
      } else {
        const n = parseInt(String(v).replace(/[.,\s]/g, ''), 10);
        parsed[f] = isNaN(n) ? null : n;
      }
    }

    const updated = await upsertBenchmark(don_vi, parsed);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật chỉ tiêu' },
      { status: 500 }
    );
  }
}
