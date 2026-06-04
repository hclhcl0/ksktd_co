'use client';

import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2, Lock, User, Activity, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/submit-report';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          username: username.trim(),
          password: password.trim(),
          redirect: false,
        });

        if (result?.error) {
          if (result.error === 'CredentialsSignin' || result.error === 'Configuration') {
            setError('Tên đăng nhập hoặc mật khẩu không chính xác');
          } else {
            setError(result.error); // Hiển thị lỗi tuỳ chỉnh (pending/rejected)
          }
          return;
        }

        // Redirect dựa trên role (middleware sẽ handle nếu cần)
        router.push(callbackUrl);
        router.refresh();
      } catch {
        setError('Đã xảy ra lỗi, vui lòng thử lại');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Header logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Khám Sức khỏe Toàn dân</h1>
          <p className="text-blue-200 text-sm mt-1">
            Hệ thống Báo cáo Số liệu Y tế
          </p>
          <p className="text-blue-300 text-xs mt-0.5 font-medium tracking-wide">
            THÀNH PHỐ ĐÀ NẴNG
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/40 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Đăng nhập</h2>
            <p className="text-sm text-slate-500 mt-1">
              Nhập thông tin tài khoản được cấp bởi đơn vị quản lý
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="VD: tammy hoặc admin"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50
                    text-slate-800 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                    transition-all duration-200 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50
                    text-slate-800 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
                    transition-all duration-200 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white text-sm font-semibold
                shadow-md shadow-blue-600/30 hover:shadow-blue-700/40
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Help text */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3">
            <Link 
              href="/register"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                bg-blue-50 hover:bg-blue-100 active:bg-blue-200
                text-blue-600 text-sm font-semibold border border-blue-100
                transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              Đăng ký tài khoản tổ chức mới
            </Link>
            <p className="text-xs text-slate-400 text-center leading-relaxed mt-2">
              Quên mật khẩu? Liên hệ bộ phận kế hoạch – nghiệp vụ CDC để được hỗ trợ
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-300/60 text-xs mt-6">
          © 2026 THÀNH PHỐ ĐÀ NẴNG. Hệ thống quản lý nội bộ.
        </p>
      </div>
    </div>
  );
}
