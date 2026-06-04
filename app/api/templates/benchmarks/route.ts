import { NextResponse } from 'next/server';
import { getBenchmarks } from '@/lib/benchmarks_db';
import { getActiveGroups } from '@/lib/data';
import ExcelJS from 'exceljs';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== 'admin' && role !== 'admin_cdc') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [benchmarks, activeGroups] = await Promise.all([
      getBenchmarks(),
      getActiveGroups()
    ]);
    
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Health Report System';
    wb.created = new Date();

    const ws = wb.addWorksheet('Mau_Chi_Tieu');

    // Header styling
    const styleHeader = (cell: ExcelJS.Cell) => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
      };
    };

    const headers = [
      'STT',
      'Tên xã/phường',
      ...activeGroups.map(g => g.name)
    ];

    const headerRow = ws.addRow(headers);
    headerRow.height = 30;
    headerRow.eachCell(cell => styleHeader(cell));

    // Define column widths
    ws.getColumn(1).width = 6;
    ws.getColumn(2).width = 30;
    for (let i = 3; i <= headers.length; i++) {
      ws.getColumn(i).width = 18;
    }

    // Add data
    if (benchmarks.length === 0) {
      // Add a dummy row if db is empty
      const row = ws.addRow([1, 'Phường Mẫu', ...activeGroups.map(() => '')]);
      row.eachCell(c => {
         c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    } else {
      benchmarks.forEach((b, idx) => {
        const rowData = [
          idx + 1,
          b.don_vi
        ];

        activeGroups.forEach(g => {
          const detail = b.details.find(d => d.groupKey === g.key);
          rowData.push(detail && detail.target !== null ? detail.target : '');
        });

        const dataRow = ws.addRow(rowData);
        dataRow.eachCell((cell, colNumber) => {
          cell.font = { name: 'Times New Roman', size: 12 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 ? 'left' : 'center' };
        });
      });
    }

    const buf = await wb.xlsx.writeBuffer();

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Mau_Import_Chi_Tieu.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export Template Error:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
