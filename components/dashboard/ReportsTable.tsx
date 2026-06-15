'use client';

import { useState } from 'react';
import { UnitSummary } from '@/lib/types';
import { formatNumber, formatDate } from '@/lib/utils';
import { Building2, CalendarDays, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReportsTableProps {
  data: UnitSummary[];
}

export default function ReportsTable({ data }: ReportsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
        <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Chưa có dữ liệu báo cáo</p>
        <p className="text-sm text-slate-400 mt-1">
          Các đơn vị hãy nộp báo cáo để hiển thị tại đây
        </p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Chi tiết theo đơn vị báo cáo
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.length} đơn vị đã nộp báo cáo
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
      </div>

      {/* Desktop table */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">STT</th>
              <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Đơn vị báo cáo</th>

              <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Ngày khám</th>
              <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide text-right">Số báo cáo</th>
              <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wide text-right">Tổng lượt khám</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.map((row, idx) => (
              <tr key={row.don_vi} className="hover:bg-blue-50/30 transition-colors duration-100">
                <td className="px-5 py-4 text-slate-400 font-medium">{startIndex + idx + 1}</td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-800">{row.don_vi}</div>
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden w-40">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(row.total / maxTotal) * 100}%` }}
                    />
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {formatDate(row.ngay_kham)}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {row.reportCount} báo cáo
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="font-bold text-blue-700 text-base">
                    {formatNumber(row.total)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {paginatedData.map((row, idx) => (
          <div key={row.don_vi} className="p-4 hover:bg-blue-50/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-400">#{startIndex + idx + 1}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {row.reportCount} báo cáo
                  </span>
                </div>
                <p className="font-semibold text-slate-800 text-sm">{row.don_vi}</p>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(row.ngay_kham)}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-blue-700">{formatNumber(row.total)}</p>
                <p className="text-xs text-slate-400">lượt khám</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-medium text-slate-700">{startIndex + 1}</span> đến <span className="font-medium text-slate-700">{Math.min(startIndex + itemsPerPage, data.length)}</span> trong <span className="font-medium text-slate-700">{data.length}</span> đơn vị
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-slate-600 min-w-[3rem] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              aria-label="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
