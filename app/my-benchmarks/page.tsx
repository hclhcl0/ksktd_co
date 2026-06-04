'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Target, Save, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { DemographicGroup } from '@/lib/types';

type BenchmarkData = Record<string, number | null>;

type Status = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

export default function MyBenchmarksPage() {
  const { data: session } = useSession();
  const unitName = session?.user?.name ?? '';

  const [groups, setGroups] = useState<DemographicGroup[]>([]);
  const [data, setData] = useState<BenchmarkData>({});
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/demographic-groups').then(r => r.json()),
      fetch('/api/benchmarks').then(r => r.json())
    ]).then(([groupsData, benchmarksJson]) => {
      const activeGroups = (Array.isArray(groupsData) ? groupsData : []).filter(g => g.isActive);
      setGroups(activeGroups);

      const d: BenchmarkData = {};
      activeGroups.forEach(g => { d[g.key] = null; });

      if (unitName) {
        const list: any[] = benchmarksJson.data ?? [];
        const mine = list.find(b => b.don_vi === unitName);
        if (mine && Array.isArray(mine.details)) {
          setHasExisting(mine.details.some((detail: any) => detail.target !== null));
          mine.details.forEach((detail: any) => {
            if (d[detail.groupKey] !== undefined) {
              d[detail.groupKey] = detail.target;
            }
          });
        }
      }
      
      setData(d);
      setStatus('idle');
    }).catch(() => setStatus('idle'));
  }, [unitName]);

  const handleChange = (key: string, val: string) => {
    const trimmed = val.trim();
    const n = trimmed === '' ? null : parseInt(trimmed.replace(/[.,\s]/g, ''), 10);
    setData(prev => ({ ...prev, [key]: isNaN(n as number) ? null : n }));
  };

  const handleSave = async () => {
    setStatus('saving');
    setErrorMsg('');
    try {
      const details = groups.map(g => ({
        groupKey: g.key,
        target: data[g.key]
      }));

      const res = await fetch(`/api/benchmarks/${encodeURIComponent(unitName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Lỗi không xác định');
      }
      setHasExisting(true);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  };

  const totalFilled = groups.filter(g => data[g.key] !== null).length;

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Chỉ tiêu của tôi</h1>
            <p className="text-sm text-slate-500">{unitName}</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 leading-relaxed">
          Đây là số liệu <strong>chỉ tiêu kế hoạch</strong> của đơn vị bạn cho từng nhóm đối tượng,
          dùng để tính % hoàn thành trên bảng điều hành. Bạn <strong>tự chịu trách nhiệm</strong> về
          tính chính xác của số liệu này. Chỉ tiêu có hiệu lực ngay sau khi bạn nhấn Lưu.
        </p>
      </div>

      {/* Status indicator */}
      {hasExisting && (
        <div className="flex items-center gap-2 mb-4 text-sm text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>Đơn vị đã có chỉ tiêu ({totalFilled}/{groups.length} nhóm đã nhập)</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {groups.map(g => (
            <div key={g.key} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <span className="text-2xl w-8 text-center flex-shrink-0">{g.icon || '👥'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{g.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{g.shortLabel}</p>
              </div>
              <div className="flex-shrink-0">
                <input
                  type="number"
                  min="0"
                  value={data[g.key] === null ? '' : String(data[g.key])}
                  onChange={e => handleChange(g.key, e.target.value)}
                  placeholder="—"
                  className="w-28 px-3 py-2 text-right text-base font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              Chưa có danh mục đối tượng nào được định nghĩa.
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Success */}
      {status === 'saved' && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Đã lưu chỉ tiêu thành công! Số liệu có hiệu lực ngay trên Dashboard.
        </div>
      )}

      {/* Save button */}
      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={status === 'saving' || groups.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all"
        >
          {status === 'saving'
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
            : <><Save className="w-4 h-4" /> Lưu chỉ tiêu</>}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Mọi thắc mắc vui lòng liên hệ bộ phận Kế hoạch – Nghiệp vụ CDC Đà Nẵng
      </p>
    </div>
  );
}
