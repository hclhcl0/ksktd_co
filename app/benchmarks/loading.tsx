import { Target } from 'lucide-react';

export default function BenchmarksLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-slate-200 rounded-lg w-64 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded-md w-96"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-24"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Import Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-48">
            <div className="h-4 bg-slate-200 rounded w-40 mb-4"></div>
            <div className="h-10 bg-slate-100 rounded-xl w-full mb-4"></div>
            <div className="h-20 bg-slate-50 rounded-lg w-full"></div>
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="lg:col-span-2">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 h-48 flex gap-3">
            <div className="w-4 h-4 bg-blue-200 rounded-full flex-shrink-0"></div>
            <div className="w-full space-y-2">
              <div className="h-4 bg-blue-100 rounded w-full"></div>
              <div className="h-4 bg-blue-100 rounded w-5/6"></div>
              <div className="h-4 bg-blue-100 rounded w-4/6 mt-4"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-96 flex flex-col items-center justify-center text-slate-400">
        <Target className="w-8 h-8 animate-bounce mb-3 text-blue-300" />
        <p className="text-sm font-medium">Đang tải bảng chỉ tiêu...</p>
      </div>
    </div>
  );
}
