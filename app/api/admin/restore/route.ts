import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'admin' && role !== 'admin_cdc')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file' }, { status: 400 });
    }

    const fileContent = await file.text();
    let backupData;
    
    try {
      backupData = JSON.parse(fileContent);
    } catch (e) {
      return NextResponse.json({ error: 'File không đúng định dạng JSON' }, { status: 400 });
    }

    if (!backupData.data || !backupData.version) {
      return NextResponse.json({ error: 'File JSON không phải là bản sao lưu hợp lệ' }, { status: 400 });
    }

    const { data } = backupData;

    // Tiến hành nạp dữ liệu tuần tự
    // 1. Xóa dữ liệu cũ theo thứ tự ngược lại (Tránh lỗi khóa ngoại)
    await prisma.$transaction([
      prisma.activityLog.deleteMany(),
      prisma.vaccinationReportData.deleteMany(),
      prisma.vaccinationReport.deleteMany(),
      prisma.healthReportData.deleteMany(),
      prisma.healthReport.deleteMany(),
      prisma.benchmarkData.deleteMany(),
      prisma.benchmark.deleteMany(),
      prisma.campaignVaccine.deleteMany(),
      prisma.vaccineCampaign.deleteMany(),
      prisma.account.deleteMany(),
      prisma.vaccine.deleteMany(),
      prisma.demographicGroup.deleteMany(),
      prisma.facility.deleteMany(),
      prisma.systemSetting.deleteMany(),
    ]);

    // 2. Nạp dữ liệu mới theo thứ tự chuẩn
    if (data.systemSettings?.length) await prisma.systemSetting.createMany({ data: data.systemSettings, skipDuplicates: true });
    if (data.facilities?.length) await prisma.facility.createMany({ data: data.facilities, skipDuplicates: true });
    if (data.demographicGroups?.length) await prisma.demographicGroup.createMany({ data: data.demographicGroups, skipDuplicates: true });
    if (data.vaccines?.length) await prisma.vaccine.createMany({ data: data.vaccines, skipDuplicates: true });
    if (data.accounts?.length) await prisma.account.createMany({ data: data.accounts, skipDuplicates: true });
    if (data.campaigns?.length) await prisma.vaccineCampaign.createMany({ data: data.campaigns, skipDuplicates: true });
    if (data.campaignVaccines?.length) await prisma.campaignVaccine.createMany({ data: data.campaignVaccines, skipDuplicates: true });
    if (data.benchmarks?.length) await prisma.benchmark.createMany({ data: data.benchmarks, skipDuplicates: true });
    if (data.benchmarkData?.length) await prisma.benchmarkData.createMany({ data: data.benchmarkData, skipDuplicates: true });
    if (data.healthReports?.length) await prisma.healthReport.createMany({ data: data.healthReports, skipDuplicates: true });
    if (data.healthReportData?.length) await prisma.healthReportData.createMany({ data: data.healthReportData, skipDuplicates: true });
    if (data.vaccinationReports?.length) await prisma.vaccinationReport.createMany({ data: data.vaccinationReports, skipDuplicates: true });
    if (data.vaccinationReportData?.length) await prisma.vaccinationReportData.createMany({ data: data.vaccinationReportData, skipDuplicates: true });
    if (data.activityLogs?.length) await prisma.activityLog.createMany({ data: data.activityLogs, skipDuplicates: true });

    return NextResponse.json({ success: true, message: 'Khôi phục dữ liệu thành công!' });
  } catch (error: any) {
    console.error('Lỗi khi khôi phục dữ liệu:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server khi nạp dữ liệu' }, { status: 500 });
  }
}
