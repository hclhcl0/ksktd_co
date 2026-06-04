import { getDashboardStats, getProgressDashboard } from '@/lib/data';
import KpiCard from '@/components/dashboard/KpiCard';
import GroupBarChart from '@/components/dashboard/GroupBarChart';
import ReportsTable from '@/components/dashboard/ReportsTable';
import ProgressTable from '@/components/dashboard/ProgressTable';
import PageHeader from '@/components/layout/PageHeader';
import { Activity, FileCheck, Building2, Target } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering to prevent prerender timeout during build
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const progress = await getProgressDashboard();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <PageHeader
        icon={<Activity className="w-5 h-5 text-white" />}
        title="Tổng hợp Kết quả Khám Sức khỏe Toàn dân"
        description="Dữ liệu tổng hợp từ tất cả các đơn vị y tế tuyến dưới — cập nhật theo thời gian thực"
        note="Dữ liệu được tính tự động từ các báo cáo đơn vị đã nộp. Thanh tiến độ màu tím 🏆 thể hiện đơn vị đã vượt chỉ tiêu."
        actions={
          <Link href="/submit-report" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-colors">
            <FileCheck className="w-4 h-4" />
            Nộp báo cáo
          </Link>
        }
      />

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
