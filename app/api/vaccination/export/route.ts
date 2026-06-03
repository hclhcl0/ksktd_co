import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getCampaigns, getVaccinationReports } from '@/lib/vaccination_data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
    }

    const campaign = (await getCampaigns()).find(c => c.id === campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const reports = await getVaccinationReports(campaignId);

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Chi tiết tiêm chủng');

    // Title Row
    const titleRow = ws.addRow([`BÁO CÁO CHI TIẾT: ${campaign.name.toUpperCase()}`]);
    titleRow.font = { name: 'Times New Roman', size: 14, bold: true };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 30;
    ws.mergeCells(1, 1, 1, 12);
    
    const headers = [
      'STT', 'Ngày tiêm', 'Đơn vị', 'Người nộp báo cáo', 'Người cao tuổi', 'Người khuyết tật',
      'Hộ nghèo', 'Hộ cận nghèo', 'Người có công', 'Vùng khó khăn', 'Trẻ em dưới 6 tuổi', 'Thời gian nộp'
    ];
    
    const headerRow = ws.addRow(headers);
    headerRow.font = { name: 'Times New Roman', bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    reports.forEach((r, idx) => {
      ws.addRow([
        idx + 1,
        r.ngay_tiem,
        r.don_vi,
        r.nguoi_nop_bao_cao || '',
        r.nguoi_cao_tuoi,
        r.nguoi_khuyet_tat,
        r.ho_ngheo,
        r.ho_can_ngheo,
        r.nguoi_co_cong,
        r.vung_kho_khan,
        r.tre_em_duoi_6_tuoi,
        new Date(r.created_at).toLocaleString('vi-VN')
      ]);
    });

    // Add totals row
    if (reports.length > 0) {
      const totalRow = ws.addRow([
        '', '', 'TỔNG CỘNG', '',
        reports.reduce((sum, r) => sum + r.nguoi_cao_tuoi, 0),
        reports.reduce((sum, r) => sum + r.nguoi_khuyet_tat, 0),
        reports.reduce((sum, r) => sum + r.ho_ngheo, 0),
        reports.reduce((sum, r) => sum + r.ho_can_ngheo, 0),
        reports.reduce((sum, r) => sum + r.nguoi_co_cong, 0),
        reports.reduce((sum, r) => sum + r.vung_kho_khan, 0),
        reports.reduce((sum, r) => sum + r.tre_em_duoi_6_tuoi, 0),
        ''
      ]);
      totalRow.font = { name: 'Times New Roman', bold: true };
    }

    // Styling
    ws.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (rowNumber > 1) { // Skip title row for borders
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (!cell.font) cell.font = { name: 'Times New Roman' };
        }
      });
    });

    ws.columns.forEach((col, i) => {
      if (i === 0) col.width = 6; // STT
      else if (i === 1) col.width = 15; // Ngày
      else if (i === 2) col.width = 25; // Đơn vị
      else if (i === 3) col.width = 20; // Nguoi nop
      else if (i === 11) col.width = 20; // Thoi gian
      else col.width = 15; // Stats
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=bao_cao_tiem_chung.xlsx`,
      },
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate excel' }, { status: 500 });
  }
}
