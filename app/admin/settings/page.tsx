'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SystemSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allowEdit, setAllowEdit] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAllowEdit(data.allow_unit_report_edit === 'true');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allow_unit_report_edit: allowEdit ? 'true' : 'false'
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
    </div>
  );
}
