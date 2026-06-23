'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Save, DatabaseBackup, Download, CalendarRange } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SystemSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allowEdit, setAllowEdit] = useState(true);
  const [timeoutHours, setTimeoutHours] = useState('48');
  const [examDateMin, setExamDateMin] = useState('');
  const [examDateMax, setExamDateMax] = useState('');
  const [backingUp, setBackingUp] = useState(false);
  const [externalApiKey, setExternalApiKey] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAllowEdit(data.allow_unit_report_edit === 'true');
        setTimeoutHours(data.edit_timeout_hours?.toString() || '48');
        setExamDateMin(data.exam_date_min || '');
        setExamDateMax(data.exam_date_max || '');
        setExternalApiKey(data.external_api_key || '');
        setLoading(false);
      });
  }, []);

  const generateRandomApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'cdc_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setExternalApiKey(result);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allow_unit_report_edit: allowEdit ? 'true' : 'false',
          edit_timeout_hours: timeoutHours,
          exam_date_min: examDateMin,
          exam_date_max: examDateMax,
          external_api_key: externalApiKey
        }),
      });
      if (res.ok) {
        alert('Đã lưu cấu hình thành công!');
        router.refresh();
      } else {
        alert('Có lỗi xảy ra khi lưu cấu hình.');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Backup thất bại');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.headers.get('Content-Disposition')?.split('filename="')[1]?.replace('"', '') || 'backup.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Không thể tạo bản sao lưu. Vui lòng thử lại.');
    } finally {
      setBackingUp(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Cài đặt Hệ thống</h1>
            <p className="text-sm text-slate-500 mt-1">Cấu hình các chức năng chung của hệ thống</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Toggle Block */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Cho phép đơn vị sửa/xóa báo cáo</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Nếu tắt tính năng này, tất cả các đơn vị sẽ chỉ có thể xem báo cáo đã nộp. Họ không thể sửa hoặc xóa báo cáo. Rất hữu ích khi cần chốt sổ liệu cuối tháng.
              </p>
            </div>
            <button
              onClick={() => setAllowEdit(!allowEdit)}
              className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                allowEdit ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  allowEdit ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Timeout Block */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Giới hạn thời gian tự sửa báo cáo</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Số giờ tối đa mà đơn vị được phép tự sửa báo cáo của mình sau khi nộp thành công.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={timeoutHours}
                onChange={(e) => setTimeoutHours(e.target.value)}
                className="w-20 px-3 py-2 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
              <span className="text-sm font-medium text-slate-500">Giờ</span>
            </div>
          </div>

          {/* Exam Date Range Block */}
          <div className="flex flex-col gap-4 pt-6 border-t border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-blue-500" />
                Giới hạn ngày thực hiện khám
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Khoảng ngày mà các đơn vị được phép chọn trong trường &quot;Ngày thực hiện khám&quot; khi nộp báo cáo. Để trống cả hai ô nếu không muốn giới hạn (mặc định: 7 ngày gần đây đến hôm nay).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Từ ngày (Ngày sớm nhất)</label>
                <input
                  type="date"
                  value={examDateMin}
                  onChange={(e) => setExamDateMin(e.target.value)}
                  className="px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full"
                />
              </div>
              <span className="text-slate-400 font-medium hidden sm:block mt-5">→</span>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Đến ngày (Ngày muộn nhất)</label>
                <input
                  type="date"
                  value={examDateMax}
                  onChange={(e) => setExamDateMax(e.target.value)}
                  className="px-3 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full"
                />
              </div>
              <button
                type="button"
                onClick={() => { setExamDateMin(''); setExamDateMax(''); }}
                className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors whitespace-nowrap mt-5"
              >
                Xóa giới hạn
              </button>
            </div>
            {examDateMin && examDateMax && examDateMin > examDateMax && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                ⚠️ Ngày bắt đầu không được muộn hơn ngày kết thúc.
              </p>
            )}
          </div>

          {/* API Key Integration Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Khóa tích hợp dữ liệu (EXTERNAL_API_KEY)</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Mã bảo mật được dùng để phần mềm khác kết nối và lấy dữ liệu của hệ thống thông qua API (`X-API-Key`).
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={externalApiKey}
                onChange={(e) => setExternalApiKey(e.target.value)}
                placeholder="Chưa có mã khóa"
                className="px-4 py-2 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full sm:w-64"
              />
              <button
                type="button"
                onClick={generateRandomApiKey}
                className="px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors whitespace-nowrap"
              >
                Tự sinh mã
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <DatabaseBackup className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Sao lưu Dữ liệu</h1>
            <p className="text-sm text-slate-500 mt-1">Tải về bản sao lưu toàn bộ dữ liệu hệ thống (định dạng JSON)</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Xuất toàn bộ dữ liệu</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Tải về file JSON chứa toàn bộ: tài khoản, báo cáo sức khỏe, báo cáo tiêm chủng, chỉ tiêu, nhóm đối tượng, cài đặt hệ thống và nhật ký hoạt động. Nên sao lưu trước mỗi lần nâng cấp hệ thống.
              </p>
              <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ File backup có thể chứa thông tin nhạy cảm, hãy bảo quản cẩn thận.</p>
            </div>
            <button
              onClick={handleBackup}
              disabled={backingUp}
              className="flex-shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {backingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {backingUp ? 'Đang tạo...' : 'Tải bản sao lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
