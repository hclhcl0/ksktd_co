'use client';

import { useState, useEffect } from 'react';
import { VaccinationReport } from '@/lib/types';
import { Activity, Download, FileSpreadsheet, Percent, ShieldCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import PageHeader from '@/components/layout/PageHeader';

export default function VaccinationDashboard() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetch('/api/vaccination/dashboard')
      .then(r => {
        if (!r.ok) throw new Error('Server error');
        return r.json();
      })
      .then(data => {
        const list = data.campaigns ?? [];
        setCampaigns(list);
        if (list.length > 0) {
          setSelectedCampaign(list[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCampaign) return;
    setDetailsLoading(true);
    fetch(`/api/vaccination/dashboard?campaignId=${selectedCampaign}`)
      .then(r => {
        if (!r.ok) throw new Error('Error');
        return r.json();
      })
      .then(data => {
        setDetails(data);
        setDetailsLoading(false);
      })
      .catch(() => setDetailsLoading(false));
  }, [selectedCampaign]);

  const handleExport = () => {
    if (!selectedCampaign) return;
    window.open(`/api/vaccination/export?campaignId=${selectedCampaign}`, '_blank');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Đang tải dữ liệu...</p>
      </div>
    </div>
  );

  if (campaigns.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10">
        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Chưa có chiến dịch tiêm chủng</h2>
        <p className="text-slate-500 text-sm">Admin cần tạo ít nhất một chiến dịch tiêm chủng trước khi xem tiến độ.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 mt-0 animate-in fade-in zoom-in-95 duration-300">
      <PageHeader
        icon={<Activity className="w-5 h-5 text-white" />}
        title="Tiến độ Tiêm chủng"
        description="Báo cáo số liệu mũi tiêm vắc xin theo chiến dịch"
        note="Chọn chiến dịch tiêm chủng ở bên dưới để xem tiến độ chi tiết. Dữ liệu cập nhật theo báo cáo của các đơn vị."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedCampaign}
              onChange={e => setSelectedCampaign(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none max-w-[180px] sm:max-w-none"
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          </div>
        }
      />

      {detailsLoading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center">
          <Activity className="w-8 h-8 animate-pulse text-indigo-400 mb-2" />
          Đang lấy dữ liệu chiến dịch...
        </div>
      ) : details && (
        <div className="space-y-10">
          
          {details.vaccinesProgress.map((vp: any) => (
            <div key={vp.vaccineId} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">
                Vắc xin: <span className="text-indigo-600">{vp.vaccineName}</span>
              </h2>
              
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-slate-600">Tổng số mũi đã tiêm</h3>
                  </div>
                  <p className="text-3xl font-bold text-indigo-700">{vp.totalAdministered.toLocaleString()}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-slate-600">Tổng mũi được cấp</h3>
                  </div>
                  <p className="text-3xl font-bold text-slate-800">{vp.totalAllocated.toLocaleString()}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-600">Tỷ lệ hoàn thành</h3>
                  </div>
                  <p className="text-3xl font-bold text-amber-600">
                    {vp.totalAllocated > 0 ? ((vp.totalAdministered / vp.totalAllocated) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                 <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
                   <div 
                      className="bg-indigo-600 h-4 rounded-full transition-all duration-1000" 
                      style={{ width: `${vp.totalAllocated > 0 ? Math.min(100, (vp.totalAdministered / vp.totalAllocated) * 100) : 0}%` }}
                    ></div>
                 </div>
                 <div className="flex justify-between text-xs text-slate-500 font-medium px-1">
                   <span>0</span>
                   <span>{vp.totalAdministered.toLocaleString()} / {vp.totalAllocated.toLocaleString()} mũi</span>
                 </div>
              </div>

              {/* Group Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Phân bổ theo đối tượng ({vp.vaccineName})</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  {vp.groupStats.map((g: any) => (
                    <div key={g.key} className="p-4 flex flex-col items-center text-center">
                      <span className="text-xs font-semibold text-slate-500 mb-2 h-8 flex items-end justify-center">{g.shortLabel}</span>
                      <span className="text-xl font-bold text-slate-800">{g.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Detailed Reports Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Lịch sử nộp báo cáo</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Đơn vị</th>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Loại Vắc xin</th>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Ngày tiêm</th>
                    <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Tổng mũi</th>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Người báo cáo</th>
                    <th className="px-6 py-4 font-semibold uppercase text-xs">Thời gian nộp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {details.reports.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">Chưa có báo cáo nào.</td></tr>
                  ) : (
                    details.reports.map((r: VaccinationReport) => {
                      const totalMui = r.details.reduce((acc, curr) => acc + curr.count, 0);
                      const vName = details.vaccinesProgress.find((vp: any) => vp.vaccineId === r.vaccineId)?.vaccineName || 'Unknown';
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">{r.don_vi}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium text-indigo-600 bg-indigo-50/50 rounded-lg inline-block my-2 ml-4 px-2 py-1">{vName}</td>
                          <td className="px-6 py-4 text-slate-600">{new Date(r.ngay_tiem).toLocaleDateString('vi-VN')}</td>
                          <td className="px-6 py-4 text-indigo-600 font-bold text-right">{totalMui.toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-600">{r.nguoi_nop_bao_cao || '-'}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
