import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getProgressDashboard, getAllReports, getUnitActiveGroups } from '@/lib/data';
import { getBenchmarks } from '@/lib/benchmarks_db';
import { Activity, Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import HistoryChart from '@/components/dashboard/HistoryChart';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard của tôi | CDC',
};

export default async function MyDashboardPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const unitName = session?.user?.name;

  if (role !== 'unit' || !unitName) redirect('/login');

  // Lấy dữ liệu báo cáo của đơn vị
  const [reports, myBenchmarks, activeGroups] = await Promise.all([
    getAllReports(),
    getBenchmarks(),
    getUnitActiveGroups(unitName)
  ]);

  // Lấy progress hiện tại
  const progressData = await getProgressDashboard();
  const myProgress = progressData.units.find(u => u.don_vi === unitName);

  // Tính lũy kế theo ngày cho biểu đồ
  const cumulativeByDate: Record<string, number> = {};
  let totalSoFar = 0;
  
  reports.forEach((r: any) => {
    const dailyTotal = r.details.reduce((sum: number, d: any) => sum + d.count, 0);
    totalSoFar += dailyTotal;
    cumulativeByDate[r.ngay_kham] = totalSoFar;
  });

  const chartData = Object.entries(cumulativeByDate).map(([date, total]) => ({
    date,
    total,
  }));

  const totalReports = reports.length;
  const overallPct = myProgress?.overallPct ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Activity className="w-7 h-7 text-blue-600" />
          Dashboard Lũy kế
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Theo dõi tiến độ thực hiện khám sức khỏe của đơn vị <strong>{unitName}</strong>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-700">{totalSoFar.toLocaleString('vi-VN')}</p>
            <p className="text-sm text-slate-500 font-medium">Tổng số người đã khám</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-emerald-700">{overallPct}%</p>
            <p className="text-sm text-slate-500 font-medium">Hoàn thành chỉ tiêu (TB)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-xl">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-700">{totalReports}</p>
            <p className="text-sm text-slate-500 font-medium">Số lượt nộp báo cáo</p>
          </div>
        </div>
      </div>

      {/* Detail Progress Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
            Tiến độ từng nhóm đối tượng
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 font-semibold text-slate-600">Nhóm đối tượng</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-right">Đã khám</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-right">Chỉ tiêu</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-right">Tỷ lệ</th>
                <th className="px-6 py-3 font-semibold text-slate-600 min-w-[150px]">Tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myProgress?.stats.map((stat) => (
                <tr key={stat.key} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="font-medium text-slate-700">{stat.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-700">
                    {stat.achieved.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {stat.hasNoBenchmark ? (
                      <span className="text-slate-500 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Tự động
                      </span>
                    ) : stat.target !== null ? (
                      stat.target.toLocaleString('vi-VN')
                    ) : (
                      <span className="text-slate-400 italic">Chưa có</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {stat.pct !== null ? (
                      <span className={stat.pct >= 100 ? 'text-emerald-600' : 'text-amber-600'}>
                        {stat.pct}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {stat.pct !== null ? (
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full ${stat.pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(stat.pct, 100)}%` }}
                        ></div>
                      </div>
                    ) : (
                      <div className="w-full bg-slate-100 rounded-full h-2.5"></div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Lịch sử tăng trưởng cộng dồn
          </h2>
        </div>
        <div className="p-6">
          <HistoryChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
