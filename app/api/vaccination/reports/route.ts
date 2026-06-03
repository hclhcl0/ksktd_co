import { NextResponse } from 'next/server';
import { getVaccinationReports, addVaccinationReport } from '@/lib/vaccination_data';
import { auth } from '@/lib/auth';

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
    
    // Add report
    const newReport = await addVaccinationReport({
      ...body,
      // override don_vi using session user's display name, except if admin
      // wait, let's keep it simple and just trust body.don_vi or enforce it
      don_vi: (session.user as any)?.role === 'unit' ? session.user.name : body.don_vi
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error('Vaccination report save error:', error);
    return NextResponse.json({ error: 'Lỗi khi lưu báo cáo' }, { status: 500 });
  }
}
