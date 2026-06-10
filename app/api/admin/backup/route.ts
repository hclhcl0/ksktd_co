import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'admin' && role !== 'admin_cdc')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Xuất toàn bộ dữ liệu từ tất cả bảng
    const [
      accounts,
      healthReports,
      healthReportData,
      benchmarks,
      benchmarkData,
      demographicGroups,
      vaccines,
      campaigns,
      campaignVaccines,
      vaccinationReports,
      vaccinationReportData,
      systemSettings,
      facilities,
      activityLogs,
    ] = await Promise.all([
      prisma.account.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.healthReport.findMany({ orderBy: { created_at: 'asc' } }),
      prisma.healthReportData.findMany(),
      prisma.benchmark.findMany({ orderBy: { don_vi: 'asc' } }),
      prisma.benchmarkData.findMany(),
      prisma.demographicGroup.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.vaccine.findMany(),
      prisma.vaccineCampaign.findMany({ orderBy: { startDate: 'asc' } }),
      prisma.campaignVaccine.findMany(),
      prisma.vaccinationReport.findMany({ orderBy: { created_at: 'asc' } }),
      prisma.vaccinationReportData.findMany(),
      prisma.systemSetting.findMany(),
      prisma.facility.findMany({ orderBy: { name: 'asc' } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: 'asc' } }),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      exportedBy: (session.user as any)?.username,
      version: '1.0',
      counts: {
        accounts: accounts.length,
        healthReports: healthReports.length,
        healthReportData: healthReportData.length,
        benchmarks: benchmarks.length,
        benchmarkData: benchmarkData.length,
        demographicGroups: demographicGroups.length,
        vaccines: vaccines.length,
        campaigns: campaigns.length,
        campaignVaccines: campaignVaccines.length,
        vaccinationReports: vaccinationReports.length,
        vaccinationReportData: vaccinationReportData.length,
        systemSettings: systemSettings.length,
        facilities: facilities.length,
        activityLogs: activityLogs.length,
      },
      data: {
        accounts,
        healthReports,
        healthReportData,
        benchmarks,
        benchmarkData,
        demographicGroups,
        vaccines,
        campaigns,
        campaignVaccines,
        vaccinationReports,
        vaccinationReportData,
        systemSettings,
        facilities,
        activityLogs,
      },
    };

    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Không thể tạo bản sao lưu' }, { status: 500 });
  }
}
