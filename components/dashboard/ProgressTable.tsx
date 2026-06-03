'use client';

import { ProgressDashboard, StatProgress, UnitProgress } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { AlertCircle, Target, Trophy, Info, Edit2, Check, X, Loader2, Download } from 'lucide-react';
import { useState } from 'react';
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
    return matchSearch && matchFacility;
  });

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
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={handleExport}
              className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </button>
            <select
              value={filterFacility}
              onChange={(e) => setFilterFacility(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none focus:border-blue-500"
            >
              <option value="">Tất cả Cơ sở y tế</option>
              {facilities.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Tìm đơn vị báo cáo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none focus:border-blue-500 min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Flash Cards (All screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 bg-slate-50/50">
        {filteredUnits.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Không tìm thấy đơn vị nào phù hợp
          </div>
        ) : (
          filteredUnits.map((row) => (
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
                  <div className="mt-2">
                    {row.reportCount > 0 ? (
                      <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        Đã nộp: {row.reportCount} báo cáo
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        Chưa nộp báo cáo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-center bg-slate-50 rounded-lg p-2 min-w-[70px] border border-slate-100">
                   <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Trung bình</span>
                   {row.overallPct !== null ? (
                      <div className={`font-bold text-lg ${
                        row.overallPct >= 80 ? 'text-emerald-600' :
                        row.overallPct >= 50 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {row.overallPct}%
                      </div>
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
  
  let color = 'bg-red-500';
  let lightColor = 'bg-red-100';
  if (pct >= 80) { color = 'bg-emerald-500'; lightColor = 'bg-emerald-100'; }
  else if (pct >= 50) { color = 'bg-amber-500'; lightColor = 'bg-amber-100'; }
  
  // Cap visual bar at 100%
  const widthPct = Math.min(100, pct);

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[11px] font-medium text-slate-500">
          {formatNumber(stat.achieved)} / {formatNumber(stat.target)}
        </span>
        <span className={`text-xs font-bold ${pct >= 100 ? 'text-emerald-600' : 'text-slate-700'}`}>
          {pct}%
        </span>
      </div>
      <div className={`h-1.5 w-full rounded-full overflow-hidden ${lightColor}`}>
        <div 
          className={`h-full ${color} transition-all duration-500`} 
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
