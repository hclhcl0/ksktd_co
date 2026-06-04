import ReportForm from '@/components/submit-report/ReportForm';
import { FileText } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nộp báo cáo | Khám Sức khỏe Toàn dân',
  description: 'Biểu mẫu nhập liệu kết quả khám sức khỏe toàn dân dành cho các đơn vị y tế',
};

export default function SubmitReportPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <PageHeader
        icon={<FileText className="w-5 h-5 text-white" />}
        title="Biểu mẫu Báo cáo Kết quả Khám Sức khỏe Toàn dân"
        description="Dành cho các trạm y tế, phòng khám tuyến dưới — Theo hướng dẫn của Sở Y tế Đà Nẵng"
        note="Mỗi đơn vị chỉ được nộp 1 báo cáo/ngày. Bạn có thể sửa hoặc xóa báo cáo trong phạm vi ngày nộp và ngày hôm sau. Chỉ nộp báo cáo trong vòng 7 ngày gần đây."
      />

      <ReportForm />

      <p className="text-center text-xs text-slate-400 mt-6">
        Mọi thắc mắc vui lòng liên hệ bộ phận kế hoạch – nghiệp vụ CDC Đà Nẵng
      </p>
    </div>
  );
}
