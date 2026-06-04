'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, LayoutDashboard, FileText, Menu, X,
  LogOut, ChevronDown, Users, Target, Settings, BookOpen
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';

const mainLinks = [
  { href: '/dashboard',             label: 'Báo cáo Khám SK',       icon: LayoutDashboard, adminOnly: true  },
  { href: '/submit-report',         label: 'Nộp báo cáo (Khám SK)', icon: FileText,        unitOnly: true  },
  { href: '/my-benchmarks',         label: 'Chỉ tiêu của tôi',      icon: Target,          unitOnly: true  },
  { href: '/vaccination/dashboard', label: 'Tiến độ Tiêm chủng',    icon: Activity,        adminOnly: true  },
  { href: '/vaccination/submit',    label: 'Báo cáo Tiêm chủng',    icon: FileText,        unitOnly: true  },
  { href: '/history',               label: 'Lịch sử báo cáo',       icon: FileText                          },
  { href: '/guide',                 label: 'Hướng dẫn',             icon: BookOpen                          },
];

// Các link gom vào dropdown "Quản trị" (chỉ admin)
const adminMenuLinks = [
  { href: '/vaccination/campaigns', label: 'Quản lý Đợt tiêm',   icon: Activity  },
  { href: '/benchmarks',            label: 'Xem chỉ tiêu',        icon: Target    },
  { href: '/accounts',              label: 'Tài khoản',            icon: Users     },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const { data: session } = useSession();

  const role = (session?.user as { role?: string })?.role;
  const displayName = session?.user?.name ?? '';

  const visibleMain = mainLinks.filter((l) => {
    if (l.adminOnly && role !== 'admin' && role !== 'admin_cdc') return false;
    if (l.unitOnly  && role !== 'unit')  return false;
    return true;
  });

  const isAdminActive = adminMenuLinks.some((l) => pathname === l.href || pathname.startsWith(l.href));

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const roleLabel = role === 'admin_cdc' ? 'Admin' : role === 'admin' ? 'Admin' : 'Đơn vị báo cáo';
  const roleBadgeClass = role === 'admin_cdc' 
    ? 'bg-purple-100 text-purple-700' 
    : role === 'admin'
    ? 'bg-purple-100 text-purple-700'
    : 'bg-blue-100 text-blue-700';

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={(role === 'admin' || role === 'admin_cdc') ? '/dashboard' : '/submit-report'} className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 shadow-md shadow-blue-600/30 group-hover:bg-blue-700 transition-colors flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-tight">Khám Sức khỏe Toàn dân</p>
              <p className="text-xs text-blue-600 font-medium leading-tight hidden sm:block">Thành phố Đà Nẵng</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleMain.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}

            </nav>

            {/* User menu (desktop) */}
            {session && (
              <div className="relative hidden md:block ml-2">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight max-w-[140px] truncate">
                      {displayName}
                    </p>
                    <p className={`text-[10px] font-medium leading-tight px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${roleBadgeClass}`}>
                      {roleLabel}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {(session.user as { username?: string })?.username}
                      </p>
                    </div>

                    {(role === 'admin' || role === 'admin_cdc') && (
                      <div className="py-1 border-b border-slate-100 mb-1">
                        <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Quản trị hệ thống
                        </p>
                        {adminMenuLinks.map(({ href, label, icon: Icon }) => {
                          const isActive = pathname === href || pathname.startsWith(href);
                          return (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setUserMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 font-semibold'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {label}
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    <button
                      onClick={() => { setUserMenuOpen(false); setPasswordModalOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                      Đổi mật khẩu
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors ml-1"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1 animate-fade-in">
          {session && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleBadgeClass}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          )}

          {/* Main links */}
          {visibleMain.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}

          {/* Admin section (mobile) */}
          {(role === 'admin' || role === 'admin_cdc') && (
            <div className="pt-1">
              <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quản trị
              </p>
              {adminMenuLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {session && (
            <>
              <button
                onClick={() => { setMobileOpen(false); setPasswordModalOpen(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                Đổi mật khẩu
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </>
          )}
        </div>
      )}

      {/* Backdrops */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>

    <ChangePasswordModal
      isOpen={passwordModalOpen}
      onClose={() => setPasswordModalOpen(false)}
    />
    </>
  );
}
