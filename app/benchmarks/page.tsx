import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBenchmarks } from '@/lib/benchmarks_db';
import BenchmarksTable from '@/components/admin/BenchmarksTable';
import BenchmarkImportButton from '@/components/admin/BenchmarkImportButton';
import { Target, Info, FileSpreadsheet } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Quản lý chỉ tiêu | CDC',
};

export default async function BenchmarksPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== 'admin' && role !== 'admin_cdc') redirect('/submit-report');

  const benchmarks = await getBenchmarks();

  const totalUnits = benchmarks.length;
  const filledUnits = benchmarks.filter((b) =>
    [b.nguoi_cao_tuoi, b.nguoi_khuyet_tat, b.ho_ngheo, b.ho_can_ngheo, b.nguoi_co_cong, b.vung_kho_khan, b.tre_em_duoi_6_tuoi].some((v) => v !== null)
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Target className="w-7 h-7 text-blue-600" />
          Quản lý chỉ tiêu
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Nhập số liệu chỉ tiêu từng nhóm đối tượng cho 93 xã/phường — dùng để tính % hoàn thành trên Dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-blue-700">{totalUnits}</p>
          <p className="text-xs text-slate-500 mt-0.5">Tổng đơn vị</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-emerald-600">{filledUnits}</p>
          <p className="text-xs text-slate-500 mt-0.5">Đã có chỉ tiêu</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-amber-600">{totalUnits - filledUnits}</p>
          <p className="text-xs text-slate-500 mt-0.5">Chưa có chỉ tiêu</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-2xl font-bold text-violet-600">
            {totalUnits > 0 ? Math.round((filledUnits / totalUnits) * 100) : 0}%
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Hoàn thiện dữ liệu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Import từ Excel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Import từ Excel / CSV
            </h2>
            <BenchmarkImportButton />
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-2">📋 Cấu trúc file mẫu:</p>
              <div className="text-xs text-slate-400 space-y-1 font-mono bg-slate-50 rounded-lg p-2">
                <p>Cột A: STT</p>
                <p>Cột B: Tên xã/phường</p>
                <p>Cột C: Trẻ em dưới 6 tuổi</p>
                <p>Cột D: Người cao tuổi</p>
                <p>Cột E: Người có công</p>
                <p>Cột F: Người khuyết tật</p>
                <p>Cột G: Hộ nghèo</p>
                <p>Cột H: Hộ cận nghèo</p>
                <p>Cột I: Vùng khó khăn/DTTS</p>
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">
                * Hệ thống tự nhận diện tên cột, không cần đúng thứ tự tuyệt đối
              </p>
            </div>
          </div>
        </div>

        {/* Hướng dẫn nhập tay */}
        <div className="lg:col-span-2">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 h-full">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Cách 1 — Import Excel:</strong> Tải file Excel/CSV lên bên trái. Hệ thống tự đọc và cập nhật toàn bộ chỉ tiêu cho tất cả đơn vị trong file.</p>
              <p><strong>Cách 2 — Nhập tay:</strong> Nhấn vào ô số trong bảng bên dưới để chỉnh sửa trực tiếp, nhấn <strong>Enter</strong> để xác nhận, rồi nhấn <strong>💾</strong> cuối hàng để lưu.</p>
              <p className="text-blue-600 text-xs">💡 Tên đơn vị trong Excel phải khớp với tên trong hệ thống (ví dụ: "Xã Núi Thành", "Phường Tam Kỳ"). Ô trống sẽ được lưu là không có dữ liệu (—).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <BenchmarksTable initialData={benchmarks} />
    </div>
  );
}
