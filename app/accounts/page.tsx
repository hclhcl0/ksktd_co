import { auth } from '@/lib/auth';
import { getAccounts } from '@/lib/accounts';
import { redirect } from 'next/navigation';
import { Users, ShieldCheck, Building2, Search } from 'lucide-react';
import AccountsTable from '@/components/admin/AccountsTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý tài khoản | CDC',
};

export default async function AccountsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (role !== 'admin' && role !== 'admin_cdc') redirect('/submit-report');

  const accountsList = await getAccounts();
  const unitAccounts = accountsList.filter((a) => a.role === 'unit');
  const adminAccounts = accountsList.filter((a) => a.role === 'admin' || a.role === 'admin_cdc');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-600" />
          Quản lý tài khoản
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Danh sách toàn bộ tài khoản đơn vị trong hệ thống
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{unitAccounts.length}</p>
            <p className="text-xs text-slate-500 font-medium">Tài khoản đơn vị</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{adminAccounts.length}</p>
            <p className="text-xs text-slate-500 font-medium">Tài khoản quản trị</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <Search className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{accountsList.length}</p>
            <p className="text-xs text-slate-500 font-medium">Tổng tài khoản</p>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <AccountsTable accounts={accountsList} />
    </div>
  );
}
