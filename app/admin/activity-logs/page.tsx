'use client';

import { useState, useEffect } from 'react';
import { History, Search, Filter, Clock, User, FileText, Activity } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [unitFilter, setUnitFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (unitFilter) query.append('unitName', unitFilter);
      if (actionFilter) query.append('action', actionFilter);
      if (typeFilter) query.append('entityType', typeFilter);

      const res = await fetch(`/api/activity-logs?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [unitFilter, actionFilter, typeFilter]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-700';
      case 'UPDATE': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE': return 'Thêm mới';
      case 'UPDATE': return 'Cập nhật';
      case 'DELETE': return 'Xóa';
      default: return action;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'health_report': return 'Khám sức khỏe';
      case 'vaccination_report': return 'Tiêm chủng';
      case 'benchmark': return 'Chỉ tiêu';
      case 'settings': return 'Cài đặt hệ thống';
      default: return type;
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(d);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 mt-0">
      <PageHeader
        icon={<History className="w-5 h-5 text-white" />}
        title="Nhật ký Hoạt động"
        description="Theo dõi lịch sử thêm, sửa, xóa dữ liệu của các đơn vị trên hệ thống"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đơn vị..."
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="">Tất cả hành động</option>
              <option value="CREATE">Thêm mới</option>
              <option value="UPDATE">Cập nhật</option>
              <option value="DELETE">Xóa</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="">Tất cả dữ liệu</option>
              <option value="health_report">Khám sức khỏe</option>
              <option value="vaccination_report">Tiêm chủng</option>
              <option value="benchmark">Chỉ tiêu</option>
              <option value="settings">Cài đặt</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Đơn vị / Tài khoản</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Loại dữ liệu</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                      <History className="w-12 h-12 text-slate-300" />
                      <p>Không có nhật ký nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">{log.unitName}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3" /> {log.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        {log.entityType.includes('report') ? (
                          <FileText className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Activity className="w-4 h-4 text-slate-400" />
                        )}
                        {getTypeLabel(log.entityType)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 line-clamp-2" title={log.details}>
                        {log.details}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
