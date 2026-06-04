'use client';

import { useState, useEffect } from 'react';
import { X, Target, Check } from 'lucide-react';
import { DemographicGroup } from '@/lib/types';
import { Account } from '@/lib/accounts';

interface AssignUnitGroupsModalProps {
  account: Account;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignUnitGroupsModal({ account, onClose, onSuccess }: AssignUnitGroupsModalProps) {
  const [groups, setGroups] = useState<DemographicGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/demographic-groups')
      .then(res => res.json())
      .then(data => {
        setGroups(data);
        // Pre-select custom groups that include this unit
        const initialSelected = data
          .filter((g: DemographicGroup) => !g.isGlobal && g.appliedUnits?.includes(account.username))
          .map((g: DemographicGroup) => g.id);
        setSelectedGroupIds(initialSelected);
        setLoading(false);
      })
      .catch(() => {
        alert('Lỗi tải danh sách đối tượng');
        setLoading(false);
      });
  }, [account.username]);

  const handleToggle = (id: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/accounts/assign-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: account.username,
          groupIds: selectedGroupIds
        })
      });

      if (res.ok) {
        alert('Cấp đối tượng thành công!');
        onSuccess();
      } else {
        const err = await res.json();
        alert(err.error || 'Lỗi khi lưu dữ liệu');
      }
    } catch (e) {
      alert('Có lỗi xảy ra');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Cấp đối tượng khám</h3>
            <p className="text-sm text-slate-500 mt-1">
              Phân bổ đối tượng cho đơn vị: <span className="font-semibold text-blue-600">{account.displayName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải...</div>
          ) : (
            <div className="space-y-4">
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Đối tượng Tùy chỉnh</h4>
                <div className="grid gap-3">
                  {groups.filter(g => !g.isGlobal).map(g => (
                    <label key={g.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedGroupIds.includes(g.id) ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.includes(g.id)}
                        onChange={() => handleToggle(g.id)}
                        className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className={`font-medium ${selectedGroupIds.includes(g.id) ? 'text-blue-900' : 'text-slate-700'}`}>{g.name}</span>
                        <span className="block text-xs text-slate-500">Mã: {g.key}</span>
                      </div>
                      <span className="text-xl opacity-50">{g.icon}</span>
                    </label>
                  ))}
                  {groups.filter(g => !g.isGlobal).length === 0 && (
                    <div className="text-sm text-slate-500 italic">Không có đối tượng tùy chỉnh nào.</div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Đối tượng Toàn hệ thống
                </h4>
                <p className="text-xs text-slate-500 mb-3">Các đối tượng này tự động áp dụng cho mọi đơn vị, không thể bỏ chọn.</p>
                <div className="grid gap-2">
                  {groups.filter(g => g.isGlobal).map(g => (
                    <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 opacity-70">
                      <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center">
                        <Check className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-600 flex-1">{g.name}</span>
                      <span className="text-xl opacity-50">{g.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50">Hủy</button>
          <button onClick={handleSave} disabled={saving || loading} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 inline-flex items-center gap-2">
            {saving ? 'Đang lưu...' : 'Lưu cấp phát'}
          </button>
        </div>
      </div>
    </div>
  );
}
