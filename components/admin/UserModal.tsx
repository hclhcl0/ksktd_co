'use client';

import { useState, useEffect } from 'react';
import { Account } from '@/lib/accounts';
import { X, Save, Loader2 } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Account | null; // null means adding a new user, otherwise editing
  onSaved: () => void;
}

export default function UserModal({ isOpen, onClose, user, onSaved }: UserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    password: '',
    role: 'unit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        displayName: user.displayName,
        password: user.password || '',
        role: user.role
      });
    } else {
      setFormData({
        username: '',
        displayName: '',
        password: '118ldl', // Default password
        role: 'unit'
      });
    }
    setError('');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const method = user ? 'PUT' : 'POST';
      const res = await fetch('/api/accounts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {user ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Tên đăng nhập</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              disabled={!!user} // Không cho đổi username khi edit
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500" 
              required
            />
            {!user && <p className="text-xs text-slate-400 mt-1">Viết liền không dấu (VD: ytephuong)</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Tên hiển thị</label>
            <input 
              type="text" 
              name="displayName" 
              value={formData.displayName} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Mật khẩu</label>
            <input 
              type="text" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Vai trò</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="unit">Đơn vị (Báo cáo)</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
