'use client';

import { ProgressDashboard, StatProgress, UnitProgress } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { AlertCircle, Target, Trophy, Info, Edit2, Check, X, Loader2, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ProgressTableProps {
  data: ProgressDashboard;
}

export default function ProgressTable({ data }: ProgressTableProps) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isAdmin = role === 'admin' || role === 'admin_cdc';

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFacility, setFilterFacility] = useState('');
  
  // Advanced search and pagination state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProgress, setFilterProgress] = useState('');
  const [filterDate, setFilterDate] = useState(() => {
    // Default to today in local time
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().split('T')[0];
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterFacility, filterStatus, filterProgress, filterDate]);
  
  // Inline edit state
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (unit: UnitProgress) => {
    const initial: Record<string, string> = {};
    unit.stats.forEach((s) => {
      initial[s.key] = s.target !== null ? String(s.target) : '';
    });
    setFormData(initial);
    setEditingUnitId(unit.don_vi);
  };

  const handleSave = async (don_vi: string) => {
    setIsSaving(true);
    const payload: Partial<Record<string, number | null>> = {};
    Object.keys(formData).forEach((k) => {
      const val = formData[k].trim();
      payload[k] = val === '' ? null : Number(val);
    });

    try {
      const res = await fetch(`/api/benchmarks/${encodeURIComponent(don_vi)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.refresh();
        setEditingUnitId(null);
      } else {
        alert('Có lỗi xảy ra khi lưu chỉ tiêu.');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu chỉ tiêu.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUnits = data.units.filter((u) => {
    const matchSearch = u.don_vi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFacility = filterFacility ? u.co_so_y_te === filterFacility : true;
    
    let matchStatus = true;
    if (filterStatus === 'submitted') {
      matchStatus = filterDate ? u.reportDates.includes(filterDate) : u.reportCount > 0;
    }
    if (filterStatus === 'unsubmitted') {
      matchStatus = filterDate ? !u.reportDates.includes(filterDate) : u.reportCount === 0;
    }

    let matchProgress = true;
    if (filterProgress !== '') {
      if (u.overallPct === null) {
        matchProgress = false;
      } else {
        if (filterProgress === 'under50') matchProgress = u.overallPct < 50;
        else if (filterProgress === '50to80') matchProgress = u.overallPct >= 50 && u.overallPct < 80;
        else if (filterProgress === '80to100') matchProgress = u.overallPct >= 80 && u.overallPct < 100;
        else if (filterProgress === 'over100') matchProgress = u.overallPct >= 100;
      }
    }

    return matchSearch && matchFacility && matchStatus && matchProgress;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / itemsPerPage));
  const currentUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const facilities = Array.from(new Set(data.units.map(u => u.co_so_y_te).filter(Boolean))).sort();

  const handleExport = () => {
    // Navigate to the API route to trigger download
    window.location.href = '/api/export';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Tiến độ Hoàn thành Chỉ tiêu
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Trung bình toàn hệ thống:{' '}
              <span className="font-bold text-blue-600">
                {data.systemOverallPct !== null ? `${data.systemOverallPct}%` : 'Chưa xác định'}
              </span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              onClick={handleExport}
              className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất báo cáo</span>
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Tìm đơn vị báo cáo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none focus:border-blue-500 w-full sm:w-auto sm:min-w-[200px]"
              />
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-2 rounded-lg border transition-colors flex items-center justify-center flex-shrink-0 ${
                  showAdvanced || filterStatus || filterProgress || filterFacility 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                title="Tìm kiếm nâng cao"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search Panel */}
      {showAdvanced && (
        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lọc theo Cơ sở y tế</label>
              <select
                value={filterFacility}
                onChange={(e) => setFilterFacility(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-500"
              >
                <option value="">Tất cả Cơ sở y tế</option>
                {facilities.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Trạng thái nộp</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="submitted">Đã nộp báo cáo</option>
                <option value="unsubmitted">Chưa nộp báo cáo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Lọc theo ngày
                <span className="ml-1 text-[10px] font-normal text-slate-400">(áp dụng cho trạng thái nộp)</span>
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tiến độ hoàn thành</label>
              <select
                value={filterProgress}
                onChange={(e) => setFilterProgress(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-500"
              >
                <option value="">Tất cả tiến độ</option>
                <option value="over100">Vượt chỉ tiêu (≥ 100%)</option>
                <option value="80to100">Gần hoàn thành (80% - 99%)</option>
                <option value="50to80">Trung bình (50% - 79%)</option>
                <option value="under50">Thấp (&lt; 50%)</option>
              </select>
            </div>
          </div>
          {filterStatus && filterDate && (
            <p className="mt-3 text-xs text-blue-600 font-medium">
              📅 Đang lọc đơn vị <strong>{filterStatus === 'submitted' ? 'đã nộp' : 'chưa nộp'}</strong> báo cáo ngày <strong>{new Date(filterDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </p>
          )}
        </div>
      )}

      {/* Top Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredUnits.length)}</span> trong tổng số <span className="font-semibold text-slate-700">{filteredUnits.length}</span> đơn vị
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2 min-w-[5rem] text-center">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Flash Cards (All screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-slate-50/50">
        {currentUnits.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm col-span-full">
            Không tìm thấy đơn vị nào phù hợp
          </div>
        ) : (
          currentUnits.map((row) => (
            <div key={row.don_vi} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group">
              <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                    {row.don_vi}
                    {isAdmin && editingUnitId !== row.don_vi && (
                      <button 
                        onClick={() => startEdit(row)} 
                        className="text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 p-1.5 rounded-md border border-slate-100"
                        title="Cập nhật chỉ tiêu"
                      >
                         <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && editingUnitId === row.don_vi && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSave(row.don_vi)}
                          disabled={isSaving}
                          className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-100 transition-all"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingUnitId(null)}
                          disabled={isSaving}
                          className="p-1.5 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{row.co_so_y_te}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {filterDate && filterStatus ? (
                      // Show per-date status when date filter is active
                      row.reportDates.includes(filterDate) ? (
                        <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          ✓ Đã nộp ngày {new Date(filterDate + 'T00:00:00').toLocaleDateString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-[11px] text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          ✗ Chưa nộp ngày {new Date(filterDate + 'T00:00:00').toLocaleDateString('vi-VN')}
                        </span>
                      )
                    ) : row.reportCount > 0 ? (
                      <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        Đã nộp: {row.reportCount} báo cáo
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        Chưa nộp báo cáo
                      </span>
                    )}
                    {row.lastReportDate && (
                      <span className="text-[10px] text-slate-400">
                        Gần nhất: {new Date(row.lastReportDate + 'T00:00:00').toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`flex-shrink-0 text-center rounded-lg p-2 min-w-[70px] border ${
                  row.overallPct !== null && row.overallPct >= 100
                    ? 'bg-violet-50 border-violet-200'
                    : 'bg-slate-50 border-slate-100'
                }`}>
                   <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Trung bình</span>
                   {row.overallPct !== null ? (
                      <>
                        <div className={`font-bold text-lg ${
                          row.overallPct >= 100 ? 'text-violet-600' :
                          row.overallPct >= 80  ? 'text-emerald-600' :
                          row.overallPct >= 50  ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {row.overallPct}%
                        </div>
                        {row.overallPct >= 100 && (
                          <span className="text-[9px] font-bold text-violet-500 bg-violet-100 px-1.5 py-0.5 rounded-full block mt-0.5">
                            🏆 Vượt CT
                          </span>
                        )}
                      </>
                   ) : (
                      <span className="text-slate-400">-</span>
                   )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {row.stats.map(s => (
                   <div key={s.key} className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="text-xs font-bold text-slate-700">{s.label}</span>
                     </div>
                     {editingUnitId === row.don_vi ? (
                       <input
                          type="number"
                          min="0"
                          placeholder="Trống"
                          value={formData[s.key] || ''}
                          onChange={(e) => setFormData({ ...formData, [s.key]: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     ) : (
                       <ProgressCell stat={s} />
                     )}
                   </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredUnits.length)}</span> trong tổng số <span className="font-semibold text-slate-700">{filteredUnits.length}</span> đơn vị
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2 min-w-[5rem] text-center">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {data.unitsNoBenchmark.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-xs text-slate-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <p>
            Có <span className="font-semibold">{data.unitsNoBenchmark.length}</span> đơn vị chưa có dữ liệu chỉ tiêu nào. {isAdmin ? 'Bạn' : 'Admin'} có thể cập nhật trong tương lai.
          </p>
        </div>
      )}

    </div>
  );
}

function ProgressCell({ stat }: { stat: StatProgress }) {
  if (stat.target === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[11px] text-slate-400">
        <span className="bg-slate-100 px-2 py-1 rounded">Chưa có chỉ tiêu</span>
      </div>
    );
  }

  if (stat.target === 0) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-[11px] text-amber-500">
        <span className="bg-amber-50 px-2 py-1 rounded border border-amber-100" title="Chưa xác nhận hoặc = 0">
          Chưa xác nhận
        </span>
        {stat.achieved > 0 && (
          <span className="mt-1 font-medium text-amber-600">Đã khám: {formatNumber(stat.achieved)}</span>
        )}
      </div>
    );
  }

  const pct = stat.pct ?? 0;
  const isExceeded = pct >= 100;

  let barColor = 'bg-red-500';
  let trackColor = 'bg-red-100';
  let textColor = 'text-slate-700';

  if (isExceeded)       { barColor = 'bg-violet-500'; trackColor = 'bg-violet-100'; textColor = 'text-violet-600'; }
  else if (pct >= 80)   { barColor = 'bg-emerald-500'; trackColor = 'bg-emerald-100'; textColor = 'text-emerald-700'; }
  else if (pct >= 50)   { barColor = 'bg-amber-500'; trackColor = 'bg-amber-100'; textColor = 'text-amber-700'; }
  else                  { textColor = 'text-red-600'; }

  // Bar always full (100%) when exceeded, show as overflowing with pulse
  const widthPct = isExceeded ? 100 : pct;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-medium text-slate-500">
          {formatNumber(stat.achieved)} / {formatNumber(stat.target)}
        </span>
        <div className="flex items-center gap-1">
          {isExceeded && (
            <span className="text-[9px] font-bold text-violet-600 bg-violet-100 px-1 py-0.5 rounded-full">Vượt</span>
          )}
          <span className={`text-xs font-bold ${textColor}`}>
            {pct}%
          </span>
        </div>
      </div>
      <div className={`h-1.5 w-full rounded-full overflow-hidden ${trackColor}`}>
        <div
          className={`h-full ${barColor} transition-all duration-500 ${isExceeded ? 'animate-pulse' : ''}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
