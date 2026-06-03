import { NextResponse } from 'next/server';
import { getAllReports, getProgressDashboard } from '@/lib/data';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawReports = await getAllReports();
    const progress = await getProgressDashboard();
    
    // Create workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Health Report System';
    wb.created = new Date();

    // --- Helper function to style cells ---
    const styleCell = (cell: ExcelJS.Cell, isHeader = false) => {
      cell.font = { name: 'Times New Roman', size: 12, bold: isHeader };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: isHeader ? 'center' : 'left', wrapText: true };
      if (isHeader) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9E1F2' } // Light blue header
        };
      }
    };

    // =========================================================================
    // SHEET 1: TIẾN ĐỘ TỔNG HỢP
    // =========================================================================
    const wsSummary = wb.addWorksheet('Tiến độ Tổng hợp');
    
    if (progress.units.length > 0) {
      // Add Title Row
      const titleRow = wsSummary.addRow(['BÁO CÁO TIẾN ĐỘ KHÁM SỨC KHỎE TOÀN DÂN']);
      titleRow.font = { name: 'Times New Roman', size: 14, bold: true };
      titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
      titleRow.height = 30;

      const headerRow1 = ['STT', 'Đơn vị', 'Tiến độ chung (%)'];
      const headerRow2 = ['', '', ''];
      
      progress.units[0].stats.forEach(s => {
        headerRow1.push(s.label, '', '');
        headerRow2.push('Đã khám', 'Chỉ tiêu', '%');
      });
      
      // Merge Title across all columns
      const totalCols = 3 + progress.units[0].stats.length * 3;
      wsSummary.mergeCells(1, 1, 1, totalCols);

      // Add Header Rows
      const row1 = wsSummary.addRow(headerRow1);
      const row2 = wsSummary.addRow(headerRow2);
      
      row1.height = 25;
      row2.height = 25;
      
      [row1, row2].forEach(row => {
        row.eachCell({ includeEmpty: true }, cell => styleCell(cell, true));
      });

      // Merge Cells for Headers (shifted down by 1 row due to title)
      wsSummary.mergeCells(2, 1, 3, 1); // STT
      wsSummary.mergeCells(2, 2, 3, 2); // Đơn vị
      wsSummary.mergeCells(2, 3, 3, 3); // Tiến độ chung
      
      progress.units[0].stats.forEach((s, i) => {
        const startCol = 4 + i * 3;
        wsSummary.mergeCells(2, startCol, 2, startCol + 2);
      });

      // Track Totals
      const totals = progress.units[0].stats.map(() => ({ achieved: 0, target: 0 }));

      // Add Data Rows
      progress.units.forEach((u, idx) => {
        const rowData: any[] = [
          idx + 1,
          u.don_vi,
          u.overallPct !== null ? u.overallPct : ''
        ];
        u.stats.forEach((s, i) => {
          rowData.push(s.achieved);
          rowData.push(s.target !== null ? s.target : '');
          rowData.push(s.pct !== null ? s.pct : '');
          
          totals[i].achieved += s.achieved;
          if (s.target !== null) totals[i].target += s.target;
        });
        
        const dataRow = wsSummary.addRow(rowData);
        dataRow.eachCell(cell => {
          styleCell(cell, false);
          // Center align numeric columns
          if (typeof cell.value === 'number') {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      });
      
      // Add Total Row
      const totalRowData: any[] = [
        '',
        'TỔNG CỘNG',
        progress.systemOverallPct !== null ? progress.systemOverallPct : ''
      ];
      totals.forEach(t => {
        totalRowData.push(t.achieved);
        totalRowData.push(t.target > 0 ? t.target : '');
        const pct = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : '';
        totalRowData.push(pct);
      });
      
      const totalRow = wsSummary.addRow(totalRowData);
      totalRow.eachCell(cell => {
        styleCell(cell, true); // Bold and highlighted
        if (typeof cell.value === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
      totalRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };

      // Set column widths
      wsSummary.columns.forEach((col, i) => {
        if (i === 0) col.width = 6; // STT
        else if (i === 1) col.width = 25; // Đơn vị
        else col.width = 15; // Stats
      });
    }

    // =========================================================================
    // SHEET 2: CHI TIẾT BÁO CÁO
    // =========================================================================
    const wsRaw = wb.addWorksheet('Lịch sử Nộp Báo cáo');
    
    // Add Title Row
    const titleRowRaw = wsRaw.addRow(['CHI TIẾT LỊCH SỬ NỘP BÁO CÁO']);
    titleRowRaw.font = { name: 'Times New Roman', size: 14, bold: true };
    titleRowRaw.alignment = { horizontal: 'center', vertical: 'middle' };
    titleRowRaw.height = 30;
    wsRaw.mergeCells(1, 1, 1, 12);
    
    const rawHeaders = [
      'STT', 'Ngày khám', 'Đơn vị', 'Người nộp báo cáo', 'Người cao tuổi', 'Người khuyết tật',
      'Hộ nghèo', 'Hộ cận nghèo', 'Người có công', 'Vùng khó khăn', 'Trẻ em dưới 6 tuổi', 'Thời gian nộp'
    ];
    
    // Add Header Row
    const rawHeaderRow = wsRaw.addRow(rawHeaders);
    rawHeaderRow.eachCell(cell => styleCell(cell, true));
    rawHeaderRow.height = 30;

    // Add Data Rows
    rawReports.forEach((r, idx) => {
      const dataRow = wsRaw.addRow([
        idx + 1,
        r.ngay_kham,
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
      dataRow.eachCell((cell, colNumber) => {
        styleCell(cell, false);
        // Center align numbers and dates
        if (colNumber !== 3) { // 3 is Đơn vị
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });

    // Set column widths
    wsRaw.columns.forEach((col, i) => {
      if (i === 0) col.width = 6; // STT
      else if (i === 1) col.width = 15; // Ngày khám
      else if (i === 2) col.width = 25; // Đơn vị
      else if (i === 3) col.width = 20; // Người nộp báo cáo
      else if (i === 11) col.width = 20; // Thời gian nộp
      else col.width = 15; // Stats
    });

    // Write to buffer
    const buf = await wb.xlsx.writeBuffer();

    // Return as downloadable file
    const dateStr = new Date().toISOString().split('T')[0];
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Bao_Cao_KSK_${dateStr}.xlsx"`,
      },
    });

  } catch (error) {
    console.error('Export Excel error:', error);
    return NextResponse.json({ error: 'Failed to generate Excel file' }, { status: 500 });
  }
}
