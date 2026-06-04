'use client';

import { useState } from 'react';
import { X, Target, Save, Loader2 } from 'lucide-react';

interface CustomGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  don_vi: string;
  onSuccess: () => void;
}

export function CustomGroupModal({ isOpen, onClose, don_vi, onSuccess }: CustomGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    shortLabel: '',
    icon: '👥',
    color: '#3b82f6',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.shortLabel.trim()) return;

    setIsSaving(true);
    setErrorMsg('');

    try {
      const key = `custom_${don_vi}_${Date.now()}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      
      const res = await fetch('/api/demographic-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          key,
          isActive: true,
          don_vi
        }),
      });

      if (!res.ok) {
        throw new Error('Không thể thêm nhóm chỉ tiêu');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Thêm loại chỉ tiêu riêng
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-xl mb-2">
            Loại chỉ tiêu này sẽ <strong>chỉ áp dụng</strong> cho đơn vị: <span className="font-bold">{don_vi}</span>.
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên nhóm / Đối tượng <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="VD: Công nhân khu công nghiệp"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên viết tắt (Cột Excel) <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.shortLabel}
              onChange={e => setFormData(p => ({ ...p, shortLabel: e.target.value }))}
              placeholder="VD: Công nhân KCN"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Biểu tượng (Emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))}
                placeholder="VD: 👷‍♂️"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Màu sắc</label>
              <input
                type="color"
                value={formData.color}
                onChange={e => setFormData(p => ({ ...p, color: e.target.value }))}
                className="w-full h-10 border border-slate-200 rounded-xl cursor-pointer p-1 bg-white"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-sm text-red-600 p-2 bg-red-50 rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu loại chỉ tiêu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
