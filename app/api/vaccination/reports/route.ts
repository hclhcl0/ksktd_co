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
      don_vi: body.don_vi || session.user.name || 'Unknown'
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error: any) {
    console.error('Vaccination report save error:', error);
    return NextResponse.json({ error: `Lỗi khi lưu báo cáo: ${error.message}` }, { status: 500 });
  }
}
