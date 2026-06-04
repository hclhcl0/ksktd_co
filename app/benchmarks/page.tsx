import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBenchmarks } from '@/lib/benchmarks_db';
import { getActiveGroups } from '@/lib/data';
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

  const [benchmarks, groups] = await Promise.all([
    getBenchmarks(),
    getActiveGroups()
  ]);

  const totalUnits = benchmarks.length;
  const filledUnits = benchmarks.filter((b) =>
    b.details.some((d) => d.target !== null && d.target > 0)
  ).length;

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
              {groups.map(g => (
                <th key={g.key} className="text-center px-3 py-3 font-semibold text-slate-600 min-w-[90px] whitespace-nowrap">
                  {g.shortLabel}
                </th>
              ))}
              <th className="text-center px-3 py-3 font-semibold text-slate-600 whitespace-nowrap">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {benchmarks.map((row, idx) => {
              const hasSome = row.details.some(d => d.target !== null && d.target > 0);
              return (
                <tr key={row.don_vi} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/20`}>
                  <td className="px-4 py-2.5 font-medium text-slate-800 sticky left-0 bg-inherit whitespace-nowrap">
                    {row.don_vi}
                  </td>
                  {groups.map(g => {
                    const detail = row.details.find(d => d.groupKey === g.key);
                    const target = detail ? detail.target : null;
                    return (
                      <td key={g.key} className="px-3 py-2.5 text-center">
                        <span className={target === null ? 'text-slate-300 italic text-xs' : 'text-slate-700 font-medium'}>
                          {target === null ? '—' : target.toLocaleString('vi-VN')}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-center">
                    {hasSome
                      ? <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Đã nhập</span>
                      : <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-600 rounded-full">Chưa nhập</span>
                    }
                  </td>
                </tr>
              );
            })}
            {benchmarks.length === 0 && (
              <tr>
                <td colSpan={groups.length + 2} className="px-4 py-8 text-center text-slate-500">
                  Chưa có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
