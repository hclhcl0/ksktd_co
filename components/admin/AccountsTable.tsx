'use client';

import { Account } from '@/lib/accounts';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, Building2, Copy, CheckCheck, UserPlus, Pencil, Trash2 } from 'lucide-react';
import UserModal from './UserModal';

interface AccountsTableProps {
  accounts: Account[];
}

export default function AccountsTable({ accounts: initialAccounts }: AccountsTableProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [query, setQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'unit'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Account | null>(null);

  const fetchAccounts = () => {
    fetch('/api/accounts?_t=' + Date.now(), { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAccounts(data);
          router.refresh();
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingUser(account);
    setIsModalOpen(true);
  };

  const handleDelete = async (username: string) => {
    if (username === 'admin') {
      alert('Không thể xóa tài khoản Admin hệ thống!');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"? Hành động này không thể hoàn tác.`)) return;

    try {
      const res = await fetch(`/api/accounts?username=${username}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAccounts();
      } else {
        const data = await res.json();
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (e) {
      alert('Lỗi hệ thống');
    }
  };

  const handleResetPassword = async (username: string) => {
    if (!confirm(`Bạn có chắc chắn muốn khôi phục mật khẩu tài khoản "${username}" về mặc định (118ldl)?`)) return;
    
    setResettingId(username);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', targetUsername: username }),
      });
      if (res.ok) {
        alert(`Đã khôi phục mật khẩu cho tài khoản ${username} thành công!`);
        window.location.reload(); // Quick way to refresh UI state although password isn't displayed except in this component if it's SSR'd. Actually the table gets static data from props, so reload will fetch new props.
      } else {
        const data = await res.json();
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (e) {
      alert('Lỗi hệ thống');
    }
    setResettingId(null);
  };

  const filtered = accounts.filter((a) => {
    const matchQuery =
      a.username.toLowerCase().includes(query.toLowerCase()) ||
      a.displayName.toLowerCase().includes(query.toLowerCase());
    const matchRole = filterRole === 'all' || a.role === filterRole;
    return matchQuery && matchRole;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Filters */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tên đơn vị hoặc tên đăng nhập..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50
              text-sm text-slate-800
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
              transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'unit', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                filterRole === r
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'Tất cả' : r === 'unit' ? 'Đơn vị' : 'Admin CDC'}
            </button>
          ))}
          <button
            onClick={handleAdd}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm tài khoản</span>
          </button>
        </div>
      </div>

      <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
        Hiển thị <span className="font-semibold text-slate-700">{filtered.length}</span> / {accounts.length} tài khoản
      </div>

      {/* Table (desktop) */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">STT</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tên đơn vị</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tên đăng nhập</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mật khẩu</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vai trò</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((account, idx) => (
              <tr key={account.username} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-5 py-3.5 text-slate-400 text-xs">{idx + 1}</td>
                <td className="px-5 py-3.5">
                  <span className="font-medium text-slate-800">{account.displayName}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-slate-100 text-blue-700 px-2 py-1 rounded-lg font-mono">
                      {account.username}
                    </code>
                    <button
                      onClick={() => handleCopy(account.username, `u-${account.username}`)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Sao chép"
                    >
                      {copiedId === `u-${account.username}` ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-mono">
                      {account.password}
                    </code>
                    <button
                      onClick={() => handleCopy(account.password || '', `p-${account.username}`)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Sao chép"
                    >
                      {copiedId === `p-${account.username}` ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {account.role === 'admin' || account.role === 'admin_cdc' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      <ShieldCheck className="w-3 h-3" />
                      Quản trị CDC
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      <Building2 className="w-3 h-3" />
                      Đơn vị
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(account)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    title="Sửa thông tin"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Sửa
                  </button>
                  {account.username !== 'admin' && (
                    <button
                      onClick={() => handleDelete(account.username)}
                      className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                      title="Xóa tài khoản"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  )}
                  {account.role === 'unit' && (
                    <button
                      onClick={() => handleResetPassword(account.username)}
                      disabled={resettingId === account.username}
                      className="text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {resettingId === account.username ? (
                        <span className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      )}
                      Reset mật khẩu
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {filtered.map((account, idx) => (
          <div key={account.username} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-xs text-slate-400 mr-2">#{idx + 1}</span>
                <span className="font-semibold text-slate-800 text-sm">{account.displayName}</span>
              </div>
              {account.role === 'admin' || account.role === 'admin_cdc' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                  <ShieldCheck className="w-3 h-3" /> Admin CDC
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  <Building2 className="w-3 h-3" /> Đơn vị
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-400 mb-1">Tên đăng nhập</p>
                <code className="bg-slate-100 text-blue-700 px-2 py-1 rounded-lg font-mono text-xs block truncate">
                  {account.username}
                </code>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Mật khẩu</p>
                <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-mono text-xs block">
                  {account.password}
                </code>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => handleEdit(account)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" /> Sửa
              </button>
              {account.username !== 'admin' && (
                <button
                  onClick={() => handleDelete(account.username)}
                  className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              )}
              {account.role === 'unit' && (
                <button
                  onClick={() => handleResetPassword(account.username)}
                  disabled={resettingId === account.username}
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {resettingId === account.username ? (
                    <span className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  )}
                  Reset mật khẩu
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Không tìm thấy tài khoản phù hợp</p>
        </div>
      )}

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editingUser}
        onSaved={() => fetchAccounts()}
      />
    </div>
  );
}
