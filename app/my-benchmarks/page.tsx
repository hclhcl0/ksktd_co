'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Target, Save, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

const FIELDS = [
  { key: 'tre_em_duoi_6_tuoi', label: 'Trẻ em dưới 6 tuổi', icon: '👶', description: 'Trẻ em dưới 6 tuổi chưa đi học mẫu giáo' },
  { key: 'nguoi_cao_tuoi',     label: 'Người cao tuổi',       icon: '👴', description: 'Tổng số người cao tuổi cần được khám' },
  { key: 'nguoi_co_cong',      label: 'Người có công',        icon: '⭐', description: 'Người có công với cách mạng và thân nhân' },
  { key: 'nguoi_khuyet_tat',   label: 'Người khuyết tật',     icon: '♿', description: 'Tổng số người khuyết tật' },
  { key: 'ho_ngheo',           label: 'Hộ nghèo',             icon: '🏠', description: 'Người thuộc hộ nghèo theo chuẩn hiện hành' },
  { key: 'ho_can_ngheo',       label: 'Hộ cận nghèo',         icon: '🏡', description: 'Người thuộc hộ cận nghèo' },
  { key: 'vung_kho_khan',      label: 'Vùng khó khăn / DTTS', icon: '🏔️', description: 'Người sống tại vùng khó khăn, đồng bào DTTS' },
] as const;

type FieldKey = typeof FIELDS[number]['key'];
type BenchmarkData = Record<FieldKey, number | null>;

const empty = (): BenchmarkData =>
  Object.fromEntries(FIELDS.map(f => [f.key, null])) as BenchmarkData;

type Status = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

export default function MyBenchmarksPage() {
  const { data: session } = useSession();
  const unitName = session?.user?.name ?? '';

  const [data, setData] = useState<BenchmarkData>(empty());
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    if (!unitName) return;
    fetch('/api/benchmarks')
      .then(r => r.json())
      .then(json => {
        const list: any[] = json.data ?? [];
        const mine = list.find(b => b.don_vi === unitName);
        if (mine) {
          setHasExisting(FIELDS.some(f => mine[f.key] !== null));
          const d: BenchmarkData = empty();
          FIELDS.forEach(f => { d[f.key] = mine[f.key] ?? null; });
          setData(d);
        }
        setStatus('idle');
      })
      .catch(() => setStatus('idle'));
  }, [unitName]);

  const handleChange = (key: FieldKey, val: string) => {
    const trimmed = val.trim();
    const n = trimmed === '' ? null : parseInt(trimmed.replace(/[.,\s]/g, ''), 10);
    setData(prev => ({ ...prev, [key]: isNaN(n as number) ? null : n }));
  };

  const handleSave = async () => {
    setStatus('saving');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/benchmarks/${encodeURIComponent(unitName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  const totalFilled = FIELDS.filter(f => data[f.key] !== null).length;

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
          <span>Đơn vị đã có chỉ tiêu ({totalFilled}/7 nhóm đã nhập)</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {FIELDS.map(f => (
            <div key={f.key} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <span className="text-2xl w-8 text-center flex-shrink-0">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{f.description}</p>
              </div>
              <div className="flex-shrink-0">
                <input
                  type="number"
                  min="0"
                  value={data[f.key] === null ? '' : String(data[f.key])}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder="—"
                  className="w-28 px-3 py-2 text-right text-base font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          ))}
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
          disabled={status === 'saving'}
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
