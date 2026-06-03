'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { healthReportSchema, HealthReportFormValues } from '@/lib/validations';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Send,
  Building2,
  CalendarDays,
  Hospital,
  Info,
  UserCircle2,
} from 'lucide-react';
import { FACILITIES, UNIT_TO_FACILITY } from '@/lib/facilities';
import { Account } from '@/lib/accounts'; // Only type import

const STAT_FIELDS: {
  name: keyof Omit<HealthReportFormValues, 'don_vi' | 'ngay_kham' | 'co_so_y_te'>;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    name: 'nguoi_cao_tuoi',
    label: 'Người cao tuổi',
    description: 'Tổng số người cao tuổi được khám',
    icon: '👴',
  },
  {
    name: 'nguoi_khuyet_tat',
    label: 'Người khuyết tật',
    description: 'Tổng số người khuyết tật được khám',
    icon: '♿',
  },
  {
    name: 'ho_ngheo',
    label: 'Hộ nghèo',
    description: 'Người thuộc hộ nghèo theo chuẩn hiện hành',
    icon: '🏠',
  },
  {
    name: 'ho_can_ngheo',
    label: 'Hộ cận nghèo',
    description: 'Người thuộc hộ cận nghèo theo chuẩn hiện hành',
    icon: '🏡',
  },
  {
    name: 'nguoi_co_cong',
    label: 'Người có công',
    description: 'Người có công với cách mạng và thân nhân',
    icon: '⭐',
  },
  {
    name: 'vung_kho_khan',
    label: 'Vùng khó khăn / DTTS',
    description: 'Người sống tại vùng đồng bào DTTS, miền núi, xã đảo, vùng khó khăn',
    icon: '🏔️',
  },
  {
    name: 'tre_em_duoi_6_tuoi',
    label: 'Trẻ em dưới 6 tuổi',
    description: 'Trẻ em dưới 6 tuổi không/chưa đi học mẫu giáo',
    icon: '👶',
  },
];

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ReportForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (session?.user && ((session.user as any).role === 'admin' || (session.user as any).role === 'admin_cdc')) {
      fetch('/api/accounts')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAccounts(data);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HealthReportFormValues>({
    resolver: zodResolver(healthReportSchema),
    defaultValues: {
      don_vi: '',
      ngay_kham: new Date().toISOString().split('T')[0],
      co_so_y_te: '',
      nguoi_nop_bao_cao: '',
      nguoi_cao_tuoi: 0,
      nguoi_khuyet_tat: 0,
      ho_ngheo: 0,
      ho_can_ngheo: 0,
      nguoi_co_cong: 0,
      vung_kho_khan: 0,
      tre_em_duoi_6_tuoi: 0,
    },
  });

  const watchedDonVi = watch('don_vi');

  useEffect(() => {
    if (session?.user?.name && (session.user as any).role !== 'admin' && (session.user as any).role !== 'admin_cdc') {
      setValue('don_vi', session.user.name);
    }
  }, [session, setValue]);

  useEffect(() => {
    if (watchedDonVi) {
      if (UNIT_TO_FACILITY[watchedDonVi]) {
        setValue('co_so_y_te', UNIT_TO_FACILITY[watchedDonVi]);
      }
    } else {
      setValue('co_so_y_te', '');
    }
  }, [watchedDonVi, setValue]);

  const onSubmit = async (data: HealthReportFormValues) => {
    setSubmitStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra khi gửi báo cáo');
      }

      setSubmitStatus('success');
      reset();
      if (session?.user?.name && (session.user as any).role !== 'admin' && (session.user as any).role !== 'admin_cdc') {
        setValue('don_vi', session.user.name);
      }

      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleReset = () => {
    reset();
    setSubmitStatus('idle');
    setErrorMessage('');
    if (session?.user?.name && (session.user as any).role !== 'admin' && (session.user as any).role !== 'admin_cdc') {
      setValue('don_vi', session.user.name);
    }
  };

  const inputCls = (hasError: boolean) =>
    `w-full px-3 py-2.5 rounded-xl border text-slate-800 text-sm bg-white
     focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-400
     disabled:opacity-50 disabled:cursor-not-allowed ${
       hasError
         ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400'
         : 'border-slate-200 focus:ring-blue-500/40 focus:border-blue-500'
     }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ============================================
          SECTION 1: General Information
      ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
            <span className="text-blue-700 font-bold text-sm">1</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Thông tin chung</h2>
            <p className="text-xs text-slate-400">Thông tin đơn vị và thời gian thực hiện</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Don vi */}
          <div className="md:col-span-2">
            <label htmlFor="don_vi" className="block text-sm font-medium text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Tên đơn vị báo cáo
                <span className="text-red-500">*</span>
              </span>
            </label>
            {session?.user && ((session.user as any).role === 'admin' || (session.user as any).role === 'admin_cdc') ? (
              <select
                id="don_vi"
                className={inputCls(!!errors.don_vi)}
                {...register('don_vi')}
              >
                <option value="">-- Chọn đơn vị báo cáo --</option>
                {accounts.filter((acc) => acc.role === 'unit').map((acc) => (
                  <option key={acc.username} value={acc.displayName}>
                    {acc.displayName}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="don_vi"
                type="text"
                className={`${inputCls(!!errors.don_vi)} bg-slate-50 border-slate-200 text-slate-500 font-medium`}
                readOnly
                {...register('don_vi')}
              />
            )}
            {errors.don_vi && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.don_vi.message}
              </p>
            )}
          </div>

          {/* Co so y te */}
          <div>
            <label htmlFor="co_so_y_te" className="block text-sm font-medium text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Hospital className="w-3.5 h-3.5 text-slate-400" />
                Cơ sở y tế phụ trách
                <span className="text-red-500">*</span>
              </span>
            </label>
            <select
              id="co_so_y_te"
              className={inputCls(!!errors.co_so_y_te)}
              {...register('co_so_y_te')}
            >
              <option value="">-- Chọn cơ sở y tế phụ trách --</option>
              {FACILITIES.map((facility) => (
                <option key={facility} value={facility}>
                  {facility}
                </option>
              ))}
            </select>
            {errors.co_so_y_te && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.co_so_y_te.message}
              </p>
            )}
          </div>

          {/* Nguoi nop bao cao */}
          <div className="md:col-span-2">
            <label htmlFor="nguoi_nop_bao_cao" className="block text-sm font-medium text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <UserCircle2 className="w-3.5 h-3.5 text-slate-400" />
                Họ và tên người nộp báo cáo
                <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id="nguoi_nop_bao_cao"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A"
              className={inputCls(!!errors.nguoi_nop_bao_cao)}
              {...register('nguoi_nop_bao_cao')}
            />
            {errors.nguoi_nop_bao_cao && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.nguoi_nop_bao_cao.message}
              </p>
            )}
          </div>

          {/* Ngay kham */}
          <div>
            <label htmlFor="ngay_kham" className="block text-sm font-medium text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                Ngày thực hiện khám
                <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              id="ngay_kham"
              type="date"
              className={inputCls(!!errors.ngay_kham)}
              {...register('ngay_kham')}
            />
            {errors.ngay_kham && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.ngay_kham.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================
          SECTION 2: Statistical Data Table
      ============================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
            <span className="text-blue-700 font-bold text-sm">2</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Số liệu theo nhóm đối tượng</h2>
            <p className="text-xs text-slate-400">Nhập số người thuộc từng nhóm được khám (≥ 0)</p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Một người có thể thuộc nhiều nhóm đối tượng khác nhau. Vui lòng nhập số liệu chính xác
            theo từng danh mục từ sổ theo dõi của đơn vị.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAT_FIELDS.map((field) => {
            const hasError = !!errors[field.name];
            return (
              <div
                key={field.name}
                className={`relative p-4 rounded-xl border transition-all duration-200 ${
                  hasError
                    ? 'border-red-200 bg-red-50'
                    : 'border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{field.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{field.label}</p>
                    <p className="text-[11px] text-slate-400 leading-tight">{field.description}</p>
                  </div>
                </div>

                <input
                  id={field.name}
                  type="number"
                  min={0}
                  step={1}
                  className={`w-full px-3 py-2.5 rounded-xl border text-slate-800 text-lg font-bold text-center bg-white
                    focus:outline-none focus:ring-2 transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasError
                        ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400'
                        : 'border-slate-200 focus:ring-blue-500/40 focus:border-blue-500'
                    }`}
                  {...register(field.name, { valueAsNumber: true })}
                />

                {hasError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Gửi báo cáo thành công!</p>
            <p className="text-xs text-emerald-600 mt-0.5">Đang chuyển về trang tổng hợp...</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Gửi báo cáo thất bại</p>
            <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={submitStatus === 'loading'}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
            bg-slate-100 hover:bg-slate-200 active:bg-slate-300
            text-slate-700 text-sm font-medium
            transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed
            w-full sm:w-auto"
        >
          Xóa dữ liệu
        </button>
        <button
          type="submit"
          disabled={submitStatus === 'loading' || submitStatus === 'success'}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            text-white text-sm font-semibold
            shadow-md shadow-blue-600/25 hover:shadow-blue-700/30
            transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
            w-full sm:w-auto"
        >
          {submitStatus === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Gửi báo cáo
            </>
          )}
        </button>
      </div>
    </form>
  );
}
