'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Settings, Plus, Edit, Trash2, MapPin, Check, X, ShieldAlert } from 'lucide-react';
import { DemographicGroup } from '@/lib/types';

interface Account {
  username: string;
  role: string;
}

export default function DemographicsPage() {
  const [groups, setGroups] = useState<DemographicGroup[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Group Modal State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DemographicGroup | null>(null);
  const [formData, setFormData] = useState({
    key: '', name: '', shortLabel: '', icon: '👥', color: '#3b82f6', isGlobal: true
  });

  // Assign Units Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningGroup, setAssigningGroup] = useState<DemographicGroup | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, accountsRes] = await Promise.all([
        fetch('/api/demographic-groups'),
        fetch('/api/accounts')
      ]);
      const gData = await groupsRes.json();
      const aData = await accountsRes.json();
      
      setGroups(gData);
      if (aData.accounts) {
        setUnits(aData.accounts.filter((a: Account) => a.role === 'unit').map((a: Account) => a.username));
      }
    } catch (e) {
      alert('Lỗi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenGroupModal = (group?: DemographicGroup) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        key: group.key, name: group.name, shortLabel: group.shortLabel,
        icon: group.icon || '👥', color: group.color || '#3b82f6', isGlobal: group.isGlobal
      });
    } else {
      setEditingGroup(null);
      setFormData({
        key: '', name: '', shortLabel: '', icon: '👥', color: '#3b82f6', isGlobal: true
      });
    }
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/demographic-groups' + (editingGroup ? `?id=${editingGroup.id}` : '');
      const method = editingGroup ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Lưu đối tượng thành công');
        setIsGroupModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Lỗi lưu dữ liệu');
      }
    } catch (e) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đối tượng này? Việc này có thể ẩn dữ liệu đã nhập liên quan đến đối tượng.')) return;
    try {
      const res = await fetch(`/api/demographic-groups?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Xóa đối tượng thành công');
        fetchData();
      } else {
        alert('Lỗi khi xóa');
      }
    } catch (e) {
      alert('Có lỗi xảy ra');
    }
  };

  const handleOpenAssignModal = (group: DemographicGroup) => {
    setAssigningGroup(group);
    setSelectedUnits(group.appliedUnits || []);
    setIsAssignModalOpen(true);
  };

  const handleToggleUnit = (unit: string) => {
    setSelectedUnits(prev => 
      prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
    );
  };

  const handleSaveAssign = async () => {
    if (!assigningGroup) return;
    try {
      const res = await fetch(`/api/demographic-groups?id=${assigningGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appliedUnits: selectedUnits })
      });
      if (res.ok) {
        alert('Phân bổ đơn vị thành công');
        setIsAssignModalOpen(false);
        fetchData();
      } else {
        alert('Lỗi khi lưu phân bổ');
      }
    } catch (e) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <PageHeader 
        title="Cài đặt Đối tượng khám" 
        description="Quản lý danh sách đối tượng, chỉ tiêu khám và phân bổ cho các Trạm Y tế"
        icon={<Settings className="w-5 h-5 text-white" />}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800">Danh sách Đối tượng</h2>
            <button
              onClick={() => handleOpenGroupModal()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Thêm Đối tượng mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Đối tượng</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã (Key)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phạm vi áp dụng</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">Đang tải...</td></tr>
                ) : groups.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">Chưa có đối tượng nào</td></tr>
                ) : (
                  groups.map(group => (
                    <tr key={group.id} className={`hover:bg-slate-50/50 transition-colors ${!group.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${group.color}15`, color: group.color || '#3b82f6' }}>
                            <span className="text-xl">{group.icon}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{group.name}</p>
                            <p className="text-xs text-slate-500">Viết tắt: {group.shortLabel}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">{group.key}</code>
                      </td>
                      <td className="px-6 py-4">
                        {group.isGlobal ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                            <Check className="w-3.5 h-3.5" /> Toàn hệ thống
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">
                            <MapPin className="w-3.5 h-3.5" /> Áp dụng {group.appliedUnits?.length || 0} đơn vị
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAssignModal(group)}
                            disabled={group.isGlobal}
                            className={`p-2 rounded-lg transition-colors ${group.isGlobal ? 'text-slate-300 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'}`}
                            title="Phân bổ đơn vị"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenGroupModal(group)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit Group */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{editingGroup ? 'Chỉnh sửa Đối tượng' : 'Thêm Đối tượng mới'}</h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã đối tượng (Key)</label>
                <input
                  type="text"
                  required
                  disabled={!!editingGroup}
                  value={formData.key}
                  onChange={e => setFormData({...formData, key: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500 outline-none transition-all"
                  placeholder="VD: nguoi_cao_tuoi"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên đầy đủ</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="VD: Người cao tuổi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhãn ngắn (Bảng biểu)</label>
                  <input
                    type="text"
                    required
                    value={formData.shortLabel}
                    onChange={e => setFormData({...formData, shortLabel: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="VD: NCT"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Màu sắc (Mã HEX)</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                    className="w-full h-11 px-2 py-1 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isGlobal}
                    onChange={e => setFormData({...formData, isGlobal: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Áp dụng cho TOÀN HỆ THỐNG</p>
                    <p className="text-xs text-slate-500">Mặc định hiển thị cho tất cả các Trạm Y tế.</p>
                  </div>
                </label>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Hủy</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-600/20">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assign Units */}
      {isAssignModalOpen && assigningGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Phân bổ đơn vị</h3>
                <p className="text-sm text-slate-500 mt-1">Chọn các đơn vị áp dụng cho đối tượng: <span className="font-semibold text-slate-700">{assigningGroup.name}</span></p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid gap-3">
                {units.map(unit => (
                  <label key={unit} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedUnits.includes(unit) ? 'border-purple-500 bg-purple-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input
                      type="checkbox"
                      checked={selectedUnits.includes(unit)}
                      onChange={() => handleToggleUnit(unit)}
                      className="w-5 h-5 text-purple-600 rounded-lg border-slate-300 focus:ring-purple-500"
                    />
                    <span className={`font-medium ${selectedUnits.includes(unit) ? 'text-purple-900' : 'text-slate-700'}`}>{unit}</span>
                  </label>
                ))}
                {units.length === 0 && (
                  <div className="text-center py-8 text-slate-500">Không tìm thấy đơn vị nào</div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-600">Đã chọn: <span className="text-purple-600 font-bold">{selectedUnits.length}</span> đơn vị</div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Hủy</button>
                <button onClick={handleSaveAssign} className="px-5 py-2.5 text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-xl transition-colors shadow-sm shadow-purple-600/20">Lưu phân bổ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
