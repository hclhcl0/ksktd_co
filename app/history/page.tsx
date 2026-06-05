'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Activity, Trash2, Calendar, FileText, Search, Edit2 } from 'lucide-react';
import { HealthReport, VaccinationReport } from '@/lib/types';
import EditReportModal from '@/components/history/EditReportModal';
import PageHeader from '@/components/layout/PageHeader';

export default function HistoryPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isAdmin = role === 'admin' || role === 'admin_cdc';
  const unitName = session?.user?.name || '';

  const [activeTab, setActiveTab] = useState<'health' | 'vaccination'>('health');
  const [healthReports, setHealthReports] = useState<HealthReport[]>([]);
  const [vaccinationReports, setVaccinationReports] = useState<VaccinationReport[]>([]);
  const [vaccines, setVaccines] = useState<any[]>([]);
  
  // Filters
  const [dateFilter, setDateFilter] = useState<string>('');
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [systemAllowEdit, setSystemAllowEdit] = useState(true);
  const [editTimeoutHours, setEditTimeoutHours] = useState(48);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReport, setEditReport] = useState<HealthReport | VaccinationReport | null>(null);
  const [editType, setEditType] = useState<'health' | 'vaccination'>('health');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [healthRes, vacRes, vacListRes, settingsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/vaccination/reports'),
        fetch('/api/vaccination/campaigns?type=vaccines'),
        fetch('/api/settings')
      ]);
      const healthData = await healthRes.json();
      const vacData = await vacRes.json();
      const vacList = await vacListRes.json();
      const settingsData = await settingsRes.json();
      
      setHealthReports(healthData.data || []);
      setVaccinationReports(Array.isArray(vacData) ? vacData : (vacData.data || []));
      setVaccines(Array.isArray(vacList) ? vacList : (vacList.data || []));
      setSystemAllowEdit(settingsData.allow_unit_report_edit === 'true');
      setEditTimeoutHours(settingsData.edit_timeout_hours || 48);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string, type: 'health' | 'vaccination') => {
    if (!confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) return;
    
    try {
      const endpoint = type === 'health' 
        ? `/api/reports/${id}`
        : `/api/vaccination/reports/${id}`;
        
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      // Update local state
      if (type === 'health') {
        setHealthReports(prev => prev.filter(r => r.id !== id));
      } else {
        setVaccinationReports(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      alert('Có lỗi xảy ra hoặc bạn không có quyền xóa báo cáo này.');
    }
  };

  const handleEdit = (report: HealthReport | VaccinationReport, type: 'health' | 'vaccination') => {
    setEditReport(report);
    setEditType(type);
    setEditModalOpen(true);
  };

  const isEditable = (report: HealthReport | VaccinationReport) => {
    if (isAdmin) return true;
    if (!systemAllowEdit) return false;
    
    // Calculate exact deadline based on created_at and editTimeoutHours
    const reportTime = new Date(report.created_at).getTime();
    const deadlineTime = reportTime + editTimeoutHours * 60 * 60 * 1000;
    
    return Date.now() <= deadlineTime;
  };

  const getFilteredHealthReports = () => {
    return healthReports.filter(r => {
      if (!isAdmin && r.don_vi !== unitName) return false;
      if (dateFilter && r.ngay_kham !== dateFilter) return false;
      if (isAdmin && unitFilter && !r.don_vi.toLowerCase().includes(unitFilter.toLowerCase())) return false;
      return true;
    });
  };

  const getFilteredVacReports = () => {
    return vaccinationReports.filter(r => {
      if (!isAdmin && r.don_vi !== unitName) return false;
      if (dateFilter && r.ngay_tiem !== dateFilter) return false;
      if (isAdmin && unitFilter && !r.don_vi.toLowerCase().includes(unitFilter.toLowerCase())) return false;
      return true;
    });
  };

  const filteredHealth = getFilteredHealthReports();
  const filteredVac = getFilteredVacReports();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 mt-0">
      <PageHeader
        icon={<FileText className="w-5 h-5 text-white" />}
        title="Lịch sử Báo cáo"
        description={isAdmin ? 'Quản lý, tìm kiếm và xóa báo cáo của các đơn vị' : 'Xem lại các báo cáo đã nộp của đơn vị bạn'}
        note={`Bạn có thể tự sửa hoặc xóa báo cáo trong vòng ${editTimeoutHours} giờ kể từ lúc nộp. Nếu quá hạn, vui lòng liên hệ Admin.`}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'health' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Khám Sức Khỏe
          </button>
          <button
            onClick={() => setActiveTab('vaccination')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'vaccination' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Tiêm Chủng
          </button>
        </div>

        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
          {isAdmin && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Lọc theo tên đơn vị..."
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
          )}
          <button 
            onClick={() => { setDateFilter(''); setUnitFilter(''); }}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-50 flex flex-col items-center">
            <Activity className="w-8 h-8 animate-pulse text-indigo-400 mb-2" />
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Đơn vị</th>
                  {activeTab === 'vaccination' && <th className="px-6 py-4 font-semibold uppercase text-xs">Vắc xin</th>}
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Ngày thực hiện</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Tổng số lượng</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Người báo cáo</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs">Thời gian nộp</th>
                  <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'health' ? (
                  filteredHealth.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">Không có báo cáo nào khớp với bộ lọc.</td></tr>
                  ) : (
                    filteredHealth.map(r => {
                      const total = r.details.reduce((acc, curr) => acc + curr.count, 0);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">{r.don_vi}</td>
                          <td className="px-6 py-4 text-slate-600">{new Date(r.ngay_kham).toLocaleDateString('vi-VN')}</td>
                          <td className="px-6 py-4 text-indigo-600 font-bold text-right">{total.toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-600">{r.nguoi_nop_bao_cao || '-'}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                          <td className="px-6 py-4 text-right">
                            {isEditable(r) && (
                              <button onClick={() => handleEdit(r, 'health')} title="Sửa báo cáo" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-1">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {(isAdmin || isEditable(r)) && (
                              <button onClick={() => handleDelete(r.id, 'health')} title="Xóa báo cáo" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )
                ) : (
                  filteredVac.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">Không có báo cáo nào khớp với bộ lọc.</td></tr>
                  ) : (
                    filteredVac.map(r => {
                      const total = r.details.reduce((acc, curr) => acc + curr.count, 0);
                      const vName = vaccines.find(v => v.id === r.vaccineId)?.name || 'Unknown';
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">{r.don_vi}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium text-indigo-600 bg-indigo-50/50 rounded-lg inline-block my-2 px-2 py-1">{vName}</td>
                          <td className="px-6 py-4 text-slate-600">{new Date(r.ngay_tiem).toLocaleDateString('vi-VN')}</td>
                          <td className="px-6 py-4 text-emerald-600 font-bold text-right">{total.toLocaleString()} mũi</td>
                          <td className="px-6 py-4 text-slate-600">{r.nguoi_nop_bao_cao || '-'}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                          <td className="px-6 py-4 text-right">
                            {isEditable(r) && (
                              <button onClick={() => handleEdit(r, 'vaccination')} title="Sửa báo cáo" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-1">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {(isAdmin || isEditable(r)) && (
                              <button onClick={() => handleDelete(r.id, 'vaccination')} title="Xóa báo cáo" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditReportModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        report={editReport}
        type={editType}
        onSaved={() => {
          fetchReports();
        }}
      />
    </div>
  );
}
