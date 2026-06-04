import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBenchmarks } from '@/lib/benchmarks_db';
import { Target, Info } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Xem chỉ tiêu | CDC',
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

  const FIELDS = [
    { key: 'tre_em_duoi_6_tuoi' as const, short: 'Trẻ <6T'    },
    { key: 'nguoi_cao_tuoi'     as const, short: 'Cao tuổi'   },
    { key: 'nguoi_co_cong'      as const, short: 'Có công'    },
    { key: 'nguoi_khuyet_tat'   as const, short: 'Khuyết tật' },
    { key: 'ho_ngheo'           as const, short: 'Hộ nghèo'   },
    { key: 'ho_can_ngheo'       as const, short: 'Cận nghèo'  },
    { key: 'vung_kho_khan'      as const, short: 'Vùng khó'   },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Target className="w-7 h-7 text-blue-600" />
          Xem chỉ tiêu đơn vị
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Chỉ tiêu do từng đơn vị tự cập nhật — dùng để tính % hoàn thành trên Dashboard
        </p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Lưu ý:</strong> Mỗi đơn vị tự chịu trách nhiệm nhập và cập nhật chỉ tiêu của mình
          tại trang <strong>"Chỉ tiêu của tôi"</strong>. Trang này chỉ để xem — Admin không chỉnh sửa chỉ tiêu thay đơn vị.
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

      {/* Read-only table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 sticky left-0 bg-slate-50 min-w-[180px]">
                Xã / Phường
              </th>
              {FIELDS.map(f => (
                <th key={f.key} className="text-center px-3 py-3 font-semibold text-slate-600 min-w-[90px] whitespace-nowrap">
                  {f.short}
                </th>
              ))}
              <th className="text-center px-3 py-3 font-semibold text-slate-600 whitespace-nowrap">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {benchmarks.map((row, idx) => {
              const hasSome = FIELDS.some(f => row[f.key] !== null);
              return (
                <tr key={row.don_vi} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/20`}>
                  <td className="px-4 py-2.5 font-medium text-slate-800 sticky left-0 bg-inherit whitespace-nowrap">
                    {row.don_vi}
                  </td>
                  {FIELDS.map(f => (
                    <td key={f.key} className="px-3 py-2.5 text-center">
                      <span className={row[f.key] === null ? 'text-slate-300 italic text-xs' : 'text-slate-700 font-medium'}>
                        {row[f.key] === null ? '—' : (row[f.key] as number).toLocaleString('vi-VN')}
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-center">
                    {hasSome
                      ? <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Đã nhập</span>
                      : <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-600 rounded-full">Chưa nhập</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
