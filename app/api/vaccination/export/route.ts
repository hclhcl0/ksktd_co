import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getCampaigns, getVaccinationReports } from '@/lib/vaccination_data';
import { getActiveGroups } from '@/lib/data';

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

    const [reports, activeGroups] = await Promise.all([
      getVaccinationReports(campaignId),
      getActiveGroups()
    ]);

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Chi tiết tiêm chủng');

    // Title Row
    const titleRow = ws.addRow([`BÁO CÁO CHI TIẾT: ${campaign.name.toUpperCase()}`]);
    titleRow.font = { name: 'Times New Roman', size: 14, bold: true };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRow.height = 30;
    ws.mergeCells(1, 1, 1, 4 + activeGroups.length + 1);
    
    const headers = [
      'STT', 'Ngày tiêm', 'Đơn vị', 'Người nộp báo cáo',
      ...activeGroups.map(g => g.name),
      'Thời gian nộp'
    ];
    
    const headerRow = ws.addRow(headers);
    headerRow.font = { name: 'Times New Roman', bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    reports.forEach((r, idx) => {
      const rowData: any[] = [
        idx + 1,
        r.ngay_tiem,
        r.don_vi,
        r.nguoi_nop_bao_cao || ''
      ];

      activeGroups.forEach(g => {
        const detail = r.details.find(d => d.groupKey === g.key);
        rowData.push(detail ? detail.count : 0);
      });

      rowData.push(new Date(r.created_at).toLocaleString('vi-VN'));
      ws.addRow(rowData);
    });

    // Add totals row
    if (reports.length > 0) {
      const totalsRow: any[] = ['', '', 'TỔNG CỘNG', ''];
      
      activeGroups.forEach(g => {
        const sum = reports.reduce((acc, r) => {
          const detail = r.details.find(d => d.groupKey === g.key);
          return acc + (detail ? detail.count : 0);
        }, 0);
        totalsRow.push(sum);
      });
      totalsRow.push('');

      const totalRow = ws.addRow(totalsRow);
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
      else if (i === headers.length - 1) col.width = 20; // Thoi gian
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
