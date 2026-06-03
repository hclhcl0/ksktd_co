'use client';

import { useState } from 'react';
import { KeyRound, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (newPassword.length < 6) {
      setStatus('error');
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change', oldPassword, newPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');
      
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi hệ thống');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Modal */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">Đổi mật khẩu</h3>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                required
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMessage}
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Đổi mật khẩu thành công!
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác nhận'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
