import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { upsertBenchmark } from '@/lib/benchmarks_db';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
}

function parseNumber(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v).replace(/[.,\s]/g, '');
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'admin_cdc')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: 'Không có file' }, { status: 400 });
    }

    // Lấy danh sách nhóm đối tượng
    const activeGroups = await prisma.demographicGroup.findMany({ where: { isActive: true } });

    // Đọc file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Lấy sheet đầu tiên
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Chuyển sang mảng 2D (bao gồm cả ô trống)
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      blankrows: false,
    });

    if (rows.length < 2) {
      return NextResponse.json({ success: false, error: 'File Excel không có dữ liệu' }, { status: 400 });
    }

    // Tìm hàng header (hàng đầu tiên có nhiều hơn 2 ô không trống)
    let headerRowIdx = 0;
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const nonEmpty = rows[i].filter(c => c !== null && c !== '').length;
      if (nonEmpty >= 3) { headerRowIdx = i; break; }
    }

    const headerRow = rows[headerRowIdx];
    
    // Map cột → groupKey
    const colMap: Record<number, string> = {};
    let donViCol = -1;

    for (let c = 0; c < headerRow.length; c++) {
      const h = String(headerRow[c] ?? '');
      const norm = normalizeText(h);
      // Tìm cột đơn vị (xã/phường)
      if (norm.includes('xa') || norm.includes('phuong') || norm.includes('don vi') || norm.includes('đơn vị')) {
        donViCol = c;
        continue;
      }
      
      const matchedGroup = activeGroups.find(g => 
        norm.includes(normalizeText(g.name)) || norm.includes(normalizeText(g.shortLabel))
      );
      
      if (matchedGroup) {
        colMap[c] = matchedGroup.key;
      }
    }

    if (donViCol === -1) {
      donViCol = 1;
    }

    // Xử lý từng hàng dữ liệu
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      const donVi = String(row[donViCol] ?? '').trim();

      // Bỏ qua hàng trống, hàng tổng, hàng tiêu đề phụ
      if (!donVi || donVi.length < 3) { skipped++; continue; }
      if (/^(tổng|total|stt|sttt|\d+$)/i.test(donVi)) { skipped++; continue; }

      const details = [];
      for (const [colStr, groupKey] of Object.entries(colMap)) {
        const col = parseInt(colStr);
        const target = parseNumber(row[col]);
        details.push({ groupKey, target });
      }

      try {
        await upsertBenchmark(donVi, details);
        updated++;
      } catch (e: any) {
        errors.push(`${donVi}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      errors,
      columnMapping: { donViCol, colMap },
      message: `Đã cập nhật ${updated} đơn vị${errors.length > 0 ? `, ${errors.length} lỗi` : ''}`,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: `Lỗi xử lý file: ${error.message}` },
      { status: 500 }
    );
  }
}
