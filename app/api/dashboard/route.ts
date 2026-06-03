import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Không thể tải dữ liệu tổng hợp' },
      { status: 500 }
    );
  }
}
