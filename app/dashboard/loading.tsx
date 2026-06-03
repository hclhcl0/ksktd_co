import { Activity } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-8 bg-slate-200 rounded-lg w-96 mb-2"></div>
          <div className="h-4 bg-slate-100 rounded-md w-64"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 bg-slate-100 rounded-lg w-40"></div>
          <div className="h-10 bg-blue-100 rounded-xl w-32"></div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start mb-2">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
            </div>
            <div>
              <div className="h-8 bg-slate-200 rounded-lg w-20 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart Skeleton */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-96 flex flex-col items-center justify-center text-slate-400">
          <Activity className="w-8 h-8 animate-bounce mb-3 text-blue-300" />
          <p className="text-sm font-medium">Đang tải biểu đồ dữ liệu...</p>
        </div>
      </div>

      {/* Progress Table Skeleton */}
      <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-64 flex items-center justify-center">
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>

      {/* Detail Table Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-64 flex items-center justify-center">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      </div>
    </div>
  );
}
