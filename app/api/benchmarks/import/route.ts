import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { upsertBenchmark } from '@/lib/benchmarks_db';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

// Mapping tên cột từ Excel → field trong DB
// Hỗ trợ nhiều cách viết khác nhau (viết hoa, viết thường, viết tắt)
const COLUMN_KEYWORDS: Record<string, string> = {
  'cao tuổi':       'nguoi_cao_tuoi',
  'người cao':      'nguoi_cao_tuoi',
  'nctuoi':         'nguoi_cao_tuoi',
  'khuyết tật':     'nguoi_khuyet_tat',
  'khuyet tat':     'nguoi_khuyet_tat',
  'nkt':            'nguoi_khuyet_tat',
  'hộ nghèo':       'ho_ngheo',
  'ho ngheo':       'ho_ngheo',
  'nghèo ':         'ho_ngheo',
  'cận nghèo':      'ho_can_ngheo',
  'can ngheo':      'ho_can_ngheo',
  'người có công':  'nguoi_co_cong',
  'co cong':        'nguoi_co_cong',
  'nguoi co cong':  'nguoi_co_cong',
  'vùng':           'vung_kho_khan',
  'dtts':           'vung_kho_khan',
  'khó khăn':       'vung_kho_khan',
  'kho khan':       'vung_kho_khan',
  'trẻ em':         'tre_em_duoi_6_tuoi',
  'tre em':         'tre_em_duoi_6_tuoi',
  'dưới 6':         'tre_em_duoi_6_tuoi',
  'duoi 6':         'tre_em_duoi_6_tuoi',
  '<6':             'tre_em_duoi_6_tuoi',
};

function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
}

function detectField(header: string): string | null {
  const norm = normalizeText(header);
  for (const [kw, field] of Object.entries(COLUMN_KEYWORDS)) {
    if (norm.includes(normalizeText(kw))) return field;
  }
  return null;
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
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: 'Không có file' }, { status: 400 });
    }

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
    
    // Map cột → field
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
      const field = detectField(h);
      if (field) colMap[c] = field;
    }

    // Nếu không tìm được cột đơn vị, thử tìm cột chứa "xã" hoặc "phường" trong data rows
    if (donViCol === -1) {
      // Fallback: cột thứ 2 (index 1) thường là tên đơn vị
      donViCol = 1;
    }

    // Nếu không tìm được mapping → dùng mapping mặc định theo thứ tự cột từ Google Sheets
    // STT | Đơn vị | Trẻ <6T | Cao tuổi | Có công | Khuyết tật | Nghèo | Cận nghèo | Vùng khó
    if (Object.keys(colMap).length === 0) {
      colMap[2] = 'tre_em_duoi_6_tuoi';
      colMap[3] = 'nguoi_cao_tuoi';
      colMap[4] = 'nguoi_co_cong';
      colMap[5] = 'nguoi_khuyet_tat';
      colMap[6] = 'ho_ngheo';
      colMap[7] = 'ho_can_ngheo';
      colMap[8] = 'vung_kho_khan';
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

      const data: Record<string, number | null> = {};
      for (const [colStr, field] of Object.entries(colMap)) {
        const col = parseInt(colStr);
        data[field] = parseNumber(row[col]);
      }

      try {
        await upsertBenchmark(donVi, data);
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
