import PageHeader from '@/components/layout/PageHeader';
import { BookOpen, FileText, CheckCircle2, LayoutDashboard, Target, Users, AlertCircle, Activity, Edit2, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hướng dẫn sử dụng | CDC Đà Nẵng',
};

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in zoom-in-95 duration-300">
      <PageHeader
        icon={<BookOpen className="w-5 h-5 text-white" />}
        title="Hướng dẫn sử dụng Hệ thống"
        description="Tài liệu dành cho Trạm Y tế và Quản trị viên CDC"
        note="Vui lòng đọc kỹ hướng dẫn để nắm rõ các quy định về việc nộp, sửa và xóa báo cáo."
      />

      <div className="space-y-8 mt-8">
        
        {/* Phần 1: Dành cho Đơn vị / Trạm Y tế */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">1. Dành cho Đơn vị / Trạm y tế</h2>
          </div>
          
          <div className="p-6 space-y-8">
            
            {/* 1.1 Nộp báo cáo */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                1.1. Nộp báo cáo Khám Sức khỏe / Tiêm chủng
              </h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 mb-4 leading-relaxed">
                <li>Truy cập menu <strong>"Nộp báo cáo (Khám SK)"</strong> hoặc <strong>"Báo cáo Tiêm chủng"</strong>.</li>
                <li>Hệ thống sẽ tự động điền Tên đơn vị và Cơ sở y tế dựa trên tài khoản của bạn.</li>
                <li>Đối với Tiêm chủng: Bạn cần chọn <strong>Đợt tiêm</strong> và <strong>Loại Vắc xin</strong> đang được mở.</li>
                <li>Nhập chính xác số liệu vào các nhóm đối tượng.</li>
                <li>Nhấn nút <strong>Gửi Báo Cáo</strong> ở cuối trang. Nếu thành công, hệ thống sẽ hiện thông báo màu xanh.</li>
              </ul>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                <strong className="text-red-600 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4" /> Lưu ý quan trọng:
                </strong>
                <p className="text-slate-600">Mỗi đơn vị chỉ được nộp <strong>1 báo cáo / ngày</strong>. Hệ thống có tính năng chống click đúp, do đó bạn không thể vô tình gửi 2 lần.</p>
              </div>
            </div>

            {/* 1.2 Xem, Sửa và Xóa báo cáo */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Edit2 className="w-5 h-5 text-amber-500" />
                1.2. Xem, Sửa và Xóa báo cáo (Menu: Lịch sử báo cáo)
              </h3>
              <p className="text-slate-600 mb-4">Tại menu <strong>Lịch sử báo cáo</strong>, bạn có thể xem lại toàn bộ các báo cáo đã nộp.</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-blue-500" /> Chỉnh sửa (Sửa số liệu)
                  </h4>
                  <p className="text-sm text-slate-600">Bạn chỉ có thể sửa báo cáo <strong>trong ngày nộp và ngày hôm sau</strong>. Quá thời hạn này, nút sửa sẽ bị khóa lại. Nhấn vào biểu tượng cây bút để sửa trực tiếp trên bảng.</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" /> Xóa báo cáo
                  </h4>
                  <p className="text-sm text-slate-600">Tương tự như tính năng sửa, bạn chỉ được phép xóa báo cáo nếu báo cáo đó được nộp <strong>chưa quá 1 ngày</strong>. Nhấn vào biểu tượng thùng rác màu đỏ để xóa.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Phần 2: Dành cho Admin */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-purple-50/50 px-6 py-4 border-b border-purple-100 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">2. Dành cho Quản trị viên (Admin CDC)</h2>
          </div>
          
          <div className="p-6 space-y-8">
            
            {/* Dashboard */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-indigo-500" />
                2.1. Theo dõi Bảng điều khiển (Dashboard)
              </h3>
              <p className="text-slate-600 mb-3">Bảng điều khiển cho phép Admin theo dõi tiến độ tổng thể của toàn hệ thống (Bao gồm Khám SK và Tiêm chủng).</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed">
                <li>Sử dụng thanh <strong>Tìm kiếm nâng cao</strong> (biểu tượng cái Phễu) để lọc các đơn vị: "Đã nộp / Chưa nộp báo cáo", lọc theo "Tiến độ hoàn thành (&lt;50%, 50-80%, &gt;100%)", hoặc lọc theo Cơ sở y tế.</li>
                <li>Sử dụng tính năng <strong>Xuất báo cáo (Excel)</strong> để tải số liệu toàn thành phố về máy.</li>
              </ul>
            </div>

            {/* Quản lý chỉ tiêu */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-emerald-500" />
                2.2. Quản lý Chỉ tiêu (Import Excel)
              </h3>
              <p className="text-slate-600 mb-3">Để hệ thống tính được % hoàn thành, Admin cần cung cấp số liệu Chỉ tiêu cho các Trạm.</p>
              <ol className="list-decimal pl-5 text-slate-600 space-y-2 text-sm leading-relaxed">
                <li>Truy cập menu Quản trị ➜ <strong>Chỉ tiêu</strong>.</li>
                <li>Nhấn nút <strong>Tải file mẫu</strong>. Hệ thống sẽ tự động tạo ra một file Excel chứa sẵn danh sách 93 đơn vị.</li>
                <li>Điền các con số chỉ tiêu vào file Excel vừa tải và lưu lại.</li>
                <li>Nhấn <strong>Import từ Excel / CSV</strong> để tải file lên. Hệ thống sẽ tự động cập nhật toàn bộ chỉ tiêu.</li>
              </ol>
            </div>

            {/* Đợt tiêm */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-rose-500" />
                2.3. Quản lý Đợt tiêm
              </h3>
              <p className="text-slate-600 mb-2 text-sm">Truy cập Quản trị ➜ Quản lý Đợt tiêm.</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed">
                <li><strong>Tạo Vắc xin mới:</strong> Thêm danh mục các loại vắc xin (VD: AstraZeneca, Pfizer).</li>
                <li><strong>Tạo Đợt tiêm chủng mới:</strong> Chọn Tên đợt, ngày bắt đầu, ngày kết thúc và chọn các loại Vắc xin được phân bổ trong đợt đó. Ngay khi được tạo, đợt tiêm sẽ ở trạng thái Mở để người dùng nộp báo cáo.</li>
              </ul>
            </div>

            {/* Tài khoản */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-500" />
                2.4. Quản lý Tài khoản
              </h3>
              <p className="text-slate-600 mb-2 text-sm">Truy cập Quản trị ➜ Tài khoản.</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed">
                <li>Tạo tài khoản mới cho các Trạm y tế hoặc cấp quyền Admin phụ.</li>
                <li>Có thể <strong>Đổi mật khẩu</strong> cho bất kỳ tài khoản nào nếu người dùng quên mật khẩu.</li>
              </ul>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
