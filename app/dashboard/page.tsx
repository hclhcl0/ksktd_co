import { getDashboardStats, getProgressDashboard } from '@/lib/data';
import KpiCard from '@/components/dashboard/KpiCard';
import GroupBarChart from '@/components/dashboard/GroupBarChart';
import ReportsTable from '@/components/dashboard/ReportsTable';
import ProgressTable from '@/components/dashboard/ProgressTable';
import { Activity, FileCheck, Building2, RefreshCw, Target } from 'lucide-react';
import Link from 'next/link';

// Revalidate every 30 seconds
export const revalidate = 30;

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const progress = await getProgressDashboard();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tổng hợp Kết quả Khám Sức khỏe Toàn dân
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Dữ liệu tổng hợp từ tất cả các đơn vị y tế tuyến dưới
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
            <RefreshCw className="w-3 h-3" />
            Cập nhật mỗi 30 giây
          </div>
          <Link href="/submit-report" className="btn-primary text-sm">
            <FileCheck className="w-4 h-4" />
            Nộp báo cáo
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Tổng lượt khám"
          value={stats.totalExaminations}
          subtitle="Toàn bộ các nhóm đối tượng"
          icon={Activity}
          color="blue"
        />
        <KpiCard
          title="Tỷ lệ hoàn thành"
          value={progress.systemOverallPct !== null ? `${progress.systemOverallPct}%` : 'N/A'}
          subtitle="Trung bình toàn hệ thống"
          icon={Target}
          color="amber"
        />
        <KpiCard
          title="Số báo cáo đã nhận"
          value={stats.totalReports}
          subtitle="Từ các đơn vị tuyến dưới"
          icon={FileCheck}
          color="emerald"
        />
        <KpiCard
          title="Đơn vị đã nộp"
          value={stats.uniqueUnits}
          subtitle={`Trên tổng số ${progress.units.length} đơn vị`}
          icon={Building2}
          color="violet"
        />
      </div>

      {/* Bar Chart */}
      <div className="mb-8 animate-fade-in">
        <GroupBarChart data={stats.groupTotals} />
      </div>

      {/* Progress Table (Benchmarking) */}
      <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <ProgressTable data={progress} />
      </div>

      {/* Detail Table */}
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <ReportsTable data={stats.reportsByUnit} />
      </div>
    </div>
  );
}
