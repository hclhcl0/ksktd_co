'use client';

import { useState, useEffect } from 'react';
import { Vaccine, VaccineCampaign, CampaignVaccine } from '@/lib/types';
import { Plus, Trash2, ShieldPlus, CalendarDays, CheckCircle2, X } from 'lucide-react';

type EnrichedCampaign = VaccineCampaign & { 
  vaccinesInfo: (CampaignVaccine & { name: string })[] 
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<EnrichedCampaign[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  
  const [newVaccine, setNewVaccine] = useState({ name: '', description: '' });
  const [newCampaign, setNewCampaign] = useState({ 
    name: '', 
    startDate: '', 
    endDate: '',
    vaccines: [] as { vaccineId: string; totalAllocated: string }[]
  });
  
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const [cRes, vRes] = await Promise.all([
        fetch('/api/vaccination/campaigns'),
        fetch('/api/vaccination/campaigns?type=vaccines')
      ]);
      if (!cRes.ok || !vRes.ok) throw new Error('Không thể tải dữ liệu từ máy chủ');
      const cData = await cRes.json();
      const vData = await vRes.json();
      setCampaigns(Array.isArray(cData) ? cData : []);
      setVaccines(Array.isArray(vData) ? vData : []);
      if (Array.isArray(vData) && vData.length > 0 && newCampaign.vaccines.length === 0) {
        setNewCampaign(prev => ({ 
          ...prev, 
          vaccines: [{ vaccineId: vData[0].id, totalAllocated: '' }] 
        }));
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccine.name) return;
    await fetch('/api/vaccination/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_vaccine', data: newVaccine })
    });
    setNewVaccine({ name: '', description: '' });
    fetchData();
  };

  const handleAddCampaignVaccine = () => {
    if (vaccines.length > 0) {
      setNewCampaign(prev => ({
        ...prev,
        vaccines: [...prev.vaccines, { vaccineId: vaccines[0].id, totalAllocated: '' }]
      }));
    }
  };

  const handleRemoveCampaignVaccine = (index: number) => {
    setNewCampaign(prev => {
      const newVacs = [...prev.vaccines];
      newVacs.splice(index, 1);
      return { ...prev, vaccines: newVacs };
    });
  };

  const handleCampaignVaccineChange = (index: number, field: 'vaccineId' | 'totalAllocated', value: string) => {
    setNewCampaign(prev => {
      const newVacs = [...prev.vaccines];
      newVacs[index] = { ...newVacs[index], [field]: value };
      return { ...prev, vaccines: newVacs };
    });
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name || newCampaign.vaccines.length === 0 || !newCampaign.startDate || !newCampaign.endDate) return;
    
    // validate
    if (newCampaign.vaccines.some(v => !v.vaccineId || !v.totalAllocated)) {
      alert("Vui lòng điền đầy đủ loại vắc xin và số lượng cấp phát.");
      return;
    }

    await fetch('/api/vaccination/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_campaign', data: newCampaign })
    });
    setNewCampaign({ 
      name: '', 
      startDate: '', 
      endDate: '',
      vaccines: vaccines.length > 0 ? [{ vaccineId: vaccines[0].id, totalAllocated: '' }] : []
    });
    fetchData();
  };

  const handleDelete = async (type: 'vaccine' | 'campaign', id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    await fetch(`/api/vaccination/campaigns?type=${type}&id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  if (fetchError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="font-bold text-slate-800 mb-2">Không thể tải trang</h2>
        <p className="text-slate-500 text-sm mb-4">{fetchError}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
          Thử lại
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Đợt tiêm & Vắc xin</h1>
        <p className="text-slate-500 text-sm mt-1">Cấu hình danh mục vắc xin và tạo các đợt tiêm mới</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Vắc xin Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <ShieldPlus className="w-5 h-5 text-blue-600" />
              Thêm Vắc xin mới
            </h2>
            <form onSubmit={handleCreateVaccine} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên Vắc xin</label>
                <input required type="text" value={newVaccine.name} onChange={e => setNewVaccine({...newVaccine, name: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="VD: AstraZeneca" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                <input type="text" value={newVaccine.description} onChange={e => setNewVaccine({...newVaccine, description: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="VD: Vắc xin phòng COVID-19" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" /> Thêm Vắc xin
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">Danh sách Vắc xin</h3>
            <div className="space-y-2">
              {vaccines.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{v.name}</p>
                    <p className="text-xs text-slate-500">{v.description}</p>
                  </div>
                  <button onClick={() => handleDelete('vaccine', v.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {vaccines.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">Chưa có vắc xin nào</p>}
            </div>
          </div>
        </div>

        {/* Đợt tiêm Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              Tạo Đợt tiêm chủng mới
            </h2>
            <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên chiến dịch / Đợt tiêm <span className="text-red-500">*</span></label>
                <input required type="text" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="VD: Chiến dịch tiêm Sởi - Rubella đợt 1" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-2">Các loại vắc xin trong đợt này <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                  {newCampaign.vaccines.map((cv, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <select required value={cv.vaccineId} onChange={e => handleCampaignVaccineChange(idx, 'vaccineId', e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                          {vaccines.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input required type="number" min="1" value={cv.totalAllocated} onChange={e => handleCampaignVaccineChange(idx, 'totalAllocated', e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" placeholder="Số lượng mũi cấp..." />
                      </div>
                      {newCampaign.vaccines.length > 1 && (
                        <button type="button" onClick={() => handleRemoveCampaignVaccine(idx)} className="mt-1 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddCampaignVaccine} className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700 mt-2">
                    <Plus className="w-4 h-4" /> Thêm loại vắc xin
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
                <input required type="date" value={newCampaign.startDate} onChange={e => setNewCampaign({...newCampaign, startDate: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ngày kết thúc <span className="text-red-500">*</span></label>
                <input required type="date" value={newCampaign.endDate} onChange={e => setNewCampaign({...newCampaign, endDate: e.target.value})} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>

              <div className="md:col-span-2 pt-2">
                <button type="submit" disabled={vaccines.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Tạo đợt tiêm
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Các Đợt tiêm đã tạo</h3>
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 text-sm">{c.name}</h4>
                    <div className="mt-2 space-y-1">
                      {c.vaccinesInfo?.map((vi, i) => (
                        <div key={i} className="flex items-center text-xs text-slate-600">
                          <ShieldPlus className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                          <span className="font-medium mr-2">{vi.name}</span>
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-auto">{vi.totalAllocated.toLocaleString()} mũi</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
                      <CalendarDays className="w-3.5 h-3.5 text-amber-500" /> 
                      {new Date(c.startDate).toLocaleDateString('vi-VN')} - {new Date(c.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <button onClick={() => handleDelete('campaign', c.id)} className="self-end sm:self-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    Xóa
                  </button>
                </div>
              ))}
              {campaigns.length === 0 && (
                <div className="text-center py-8">
                  <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Chưa có đợt tiêm nào được tạo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
