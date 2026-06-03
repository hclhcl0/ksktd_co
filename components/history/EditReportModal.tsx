'use client';

import { useState, useEffect } from 'react';
import { HealthReport, VaccinationReport } from '@/lib/types';
import { GROUP_DEFINITIONS } from '@/lib/constants'
import { X, Save, Loader2 } from 'lucide-react';

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: HealthReport | VaccinationReport | null;
  type: 'health' | 'vaccination';
  onSaved: () => void;
}

export default function EditReportModal({ isOpen, onClose, report, type, onSaved }: EditReportModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (report) {
      setFormData({ ...report });
    }
  }, [report]);

  if (!isOpen || !report) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value, 10) : 0) : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = type === 'health' ? `/api/reports/${report.id}` : `/api/vaccination/reports/${report.id}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật thất bại');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const dateLabel = type === 'health' ? 'Ngày khám' : 'Ngày tiêm';
  const dateField = type === 'health' ? 'ngay_kham' : 'ngay_tiem';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Sửa báo cáo</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{dateLabel}</label>
              <input type="date" name={dateField} value={formData[dateField] || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Người nộp</label>
              <input type="text" name="nguoi_nop_bao_cao" value={formData.nguoi_nop_bao_cao || ''} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Số liệu theo nhóm</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GROUP_DEFINITIONS.map(g => (
                <div key={g.key} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{g.shortLabel}</label>
                  <input 
                    type="number" 
                    name={g.key} 
                    value={formData[g.key] !== undefined ? formData[g.key] : ''} 
                    onChange={handleChange} 
                    min="0"
                    className="w-full px-2 py-1.5 text-center text-sm font-bold text-indigo-700 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
            Hủy
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
