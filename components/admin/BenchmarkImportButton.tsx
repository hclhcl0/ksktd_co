'use client';

import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X, Download } from 'lucide-react';

interface ImportResult {
  success: boolean;
  updated?: number;
  skipped?: number;
  errors?: string[];
  message?: string;
  error?: string;
}

interface Props {
  onImported?: () => void;
}

export default function BenchmarkImportButton({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Kiểm tra định dạng
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
      setResult({ success: false, error: 'Chỉ hỗ trợ file .xlsx, .xls, .csv' });
      setStatus('error');
      setShowResult(true);
      return;
    }

    setStatus('uploading');
    setShowResult(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/benchmarks/import', {
        method: 'POST',
        body: formData,
      });
      const data: ImportResult = await res.json();
      setResult(data);
      setStatus(data.success ? 'success' : 'error');
      setShowResult(true);
      if (data.success && onImported) {
        // Reload page để cập nhật bảng
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setResult({ success: false, error: 'Lỗi kết nối server' });
      setStatus('error');
      setShowResult(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const downloadTemplate = () => {
    // Tạo link tải template mẫu (file CSV)
    const csvContent = [
      'STT,Xã/Phường,Trẻ em dưới 6 tuổi,Người cao tuổi,Người có công,Người khuyết tật,Hộ nghèo,Hộ cận nghèo,Vùng khó khăn/DTTS',
      '1,Xã Núi Thành,458,2060,,1800,127,146,',
      '2,Phường Tam Kỳ,972,6811,,875,44,29,',
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_chi_tieu.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone + button */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : status === 'success'
            ? 'border-emerald-300 bg-emerald-50'
            : status === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 bg-white'
        }`}
        onClick={() => status !== 'uploading' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          className="hidden"
        />

        {status === 'uploading' ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-blue-600">Đang xử lý file...</p>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-700">{result?.message}</p>
            <p className="text-xs text-slate-500">Trang sẽ tự làm mới sau giây lát...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileSpreadsheet className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Kéo thả file vào đây hoặc <span className="text-blue-600">nhấn để chọn</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ .xlsx, .xls, .csv</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
            >
              <Upload className="w-4 h-4" />
              Chọn file Excel
            </button>
          </div>
        )}
      </div>

      {/* Nút tải template */}
      <button
        onClick={downloadTemplate}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Tải file mẫu (.csv)
      </button>

      {/* Result panel */}
      {showResult && result && (
        <div className={`rounded-xl border p-4 text-sm relative ${
          result.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <button
            onClick={() => setShowResult(false)}
            className="absolute top-3 right-3 text-current opacity-50 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {result.success ? (
            <>
              <div className="flex items-center gap-2 font-semibold mb-2">
                <CheckCircle className="w-4 h-4" />
                Import thành công
              </div>
              <div className="space-y-1 text-xs">
                <p>✅ Đã cập nhật: <strong>{result.updated}</strong> đơn vị</p>
                <p>⏭️ Bỏ qua: <strong>{result.skipped}</strong> hàng</p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold text-amber-700">⚠️ Một số lỗi:</p>
                    <ul className="mt-1 space-y-0.5 text-amber-700">
                      {result.errors.slice(0, 5).map((e, i) => (
                        <li key={i}>• {e}</li>
                      ))}
                      {result.errors.length > 5 && <li>... và {result.errors.length - 5} lỗi khác</li>}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{result.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
