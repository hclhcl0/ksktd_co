'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { VaccineCampaign, CampaignVaccine } from '@/lib/types';
import { Activity, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { GROUP_DEFINITIONS } from '@/lib/constants'

type EnrichedCampaign = VaccineCampaign & { vaccinesInfo: (CampaignVaccine & { name: string })[] };

export default function SubmitVaccinationPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<EnrichedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [formData, setFormData] = useState<any>({
    campaignId: '',
    vaccineId: '',
    ngay_tiem: new Date().toISOString().split('T')[0],
    nguoi_nop_bao_cao: '',
    // Groups
    ...Object.fromEntries(GROUP_DEFINITIONS.map(g => [g.key, 0]))
  });

  useEffect(() => {
    fetch('/api/vaccination/campaigns')
      .then(r => r.json())
      .then(data => {
        const active = data.filter((c: EnrichedCampaign) => c.status === 'active');
        setCampaigns(active);
        if (active.length > 0) {
          setFormData((prev: any) => ({ 
            ...prev, 
            campaignId: active[0].id,
            vaccineId: active[0].vaccinesInfo?.[0]?.vaccineId || ''
          }));
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'campaignId') {
      const selectedCampaign = campaigns.find(c => c.id === value);
      setFormData((prev: any) => ({
        ...prev,
        campaignId: value,
        vaccineId: selectedCampaign?.vaccinesInfo?.[0]?.vaccineId || ''
      }));
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value, 10) : 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.campaignId || !formData.vaccineId || !formData.nguoi_nop_bao_cao) {
      setError('Vui lòng chọn đợt tiêm, loại vắc xin và nhập tên người nộp báo cáo.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/vaccination/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset numbers
      setFormData((prev: any) => ({
        ...prev,
        ...Object.fromEntries(GROUP_DEFINITIONS.map(g => [g.key, 0]))
      }));
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    }
    setSubmitting(false);
  };

  const selectedCampaign = campaigns.find(c => c.id === formData.campaignId);

  if (loading) return <div className="p-8 text-center mt-20">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-16 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20 shadow-inner">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1 drop-shadow-sm">
                Báo cáo Tiêm chủng Vắc xin
              </h1>
              <p className="text-indigo-100 font-medium text-sm flex items-center gap-2">
                Đơn vị: <span className="bg-white/20 px-2 py-0.5 rounded-md">{session?.user?.name || 'Đang tải...'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {campaigns.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Hiện không có Đợt tiêm chủng nào đang mở.</p>
              <p className="text-slate-400 text-sm mt-1">Vui lòng liên hệ Thành phố Đà Nẵng để được hỗ trợ.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid md:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Chọn Đợt tiêm chủng <span className="text-red-500">*</span></label>
                  <select name="campaignId" value={formData.campaignId} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Loại vắc xin <span className="text-red-500">*</span></label>
                  <select name="vaccineId" value={formData.vaccineId} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
                    {selectedCampaign?.vaccinesInfo?.map((v: any) => (
                      <option key={v.vaccineId} value={v.vaccineId}>{v.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Ngày tiêm <span className="text-red-500">*</span></label>
                  <input type="date" name="ngay_tiem" value={formData.ngay_tiem} onChange={handleChange} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1.5">Người báo cáo <span className="text-red-500">*</span></label>
                  <input type="text" name="nguoi_nop_bao_cao" value={formData.nguoi_nop_bao_cao} onChange={handleChange} required placeholder="Họ và tên..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Số mũi đã tiêm (theo nhóm đối tượng)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {GROUP_DEFINITIONS.map(group => (
                    <div key={group.key} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                      <label className="block text-xs font-semibold text-slate-600 mb-2">{group.shortLabel}</label>
                      <input 
                        type="number" 
                        name={group.key} 
                        value={formData[group.key]} 
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 text-lg font-bold text-indigo-700 bg-indigo-50/50 border border-indigo-100 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              {success && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  Báo cáo thành công! Dữ liệu đã được ghi nhận.
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                  {submitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
