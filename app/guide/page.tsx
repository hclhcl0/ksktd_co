import PageHeader from '@/components/layout/PageHeader';
import {
  BookOpen, FileText, CheckCircle2, LayoutDashboard,
  Target, Users, AlertCircle, Activity, Edit2, Trash2,
  Clock, ShieldCheck, ClipboardList, Info
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hướng dẫn sử dụng | CDC Đà Nẵng',
};

function Section({ color, icon, title, children }: {
  color: 'blue' | 'purple' | 'emerald';
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const colors = {
    blue:    { bg: 'bg-blue-50/50',    border: 'border-blue-100',    icon: 'bg-blue-100 text-blue-600'    },
    purple:  { bg: 'bg-purple-50/50',  border: 'border-purple-100',  icon: 'bg-purple-100 text-purple-600' },
    emerald: { bg: 'bg-emerald-50/50', border: 'border-emerald-100', icon: 'bg-emerald-100 text-emerald-600' },
  }[color];
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className={`${colors.bg} px-6 py-4 border-b ${colors.border} flex items-center gap-3`}>
        <div className={`p-2 rounded-lg ${colors.icon}`}>{icon}</div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>
      <div className="p-6 space-y-8">{children}</div>
    </section>
  );
}

function SubSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3">{icon}{title}</h3>
      {children}
    </div>
  );
}

function NoteBox({ type = 'warn', children }: { type?: 'warn' | 'info' | 'ok'; children: React.ReactNode }) {
  const styles = {
    warn: { bg: 'bg-red-50 border-red-200',     icon: <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />,   text: 'text-red-700'   },
    info: { bg: 'bg-blue-50 border-blue-200',   icon: <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />,           text: 'text-blue-700'  },
    ok:   { bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />, text: 'text-emerald-700' },
  }[type];
  return (
    <div className={`flex items-start gap-2 p-4 rounded-xl border text-sm ${styles.bg}`}>
      {styles.icon}
      <p className={styles.text}>{children}</p>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in zoom-in-95 duration-300">
      <PageHeader
        icon={<BookOpen className="w-5 h-5 text-white" />}
        title="Hướng dẫn sử dụng Hệ thống"
        description="Tài liệu dành cho Trạm Y tế xã/phường và Quản trị viên CDC Đà Nẵng"
        note="Vui lòng đọc kỹ hướng dẫn để nắm rõ các quy định về nộp, sửa, xóa báo cáo và cập nhật chỉ tiêu."
      />

      <div className="space-y-8 mt-8">

        {/* ===== PHẦN 1: ĐƠN VỊ ===== */}
        <Section color="blue" icon={<FileText className="w-5 h-5" />} title="1. Dành cho Đơn vị / Trạm Y tế xã, phường">

          {/* 1.1 Nộp báo cáo Khám SK */}
          <SubSection icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} title="1.1. Nộp báo cáo Khám Sức khỏe Toàn dân">
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed mb-4">
              <li>Truy cập menu <strong>"Nộp báo cáo (Khám SK)"</strong>.</li>
              <li>Hệ thống tự động điền <strong>Tên đơn vị</strong> và <strong>Cơ sở y tế</strong> từ tài khoản của bạn.</li>
              <li>Chọn <strong>Ngày khám</strong> (chỉ được chọn trong phạm vi <strong>7 ngày gần nhất</strong>).</li>
              <li>Nhập chính xác số liệu vào 7 nhóm đối tượng.</li>
              <li>Nhấn <strong>"Gửi Báo Cáo"</strong> — hệ thống báo thành công bằng thông báo màu xanh lá.</li>
            </ul>
            <NoteBox type="warn">
              Mỗi đơn vị chỉ được nộp <strong>1 báo cáo / ngày</strong>. Nếu cố nộp lần 2 cùng ngày, hệ thống sẽ báo lỗi và không ghi nhận.
            </NoteBox>
          </SubSection>

          {/* 1.2 Nộp báo cáo Tiêm chủng */}
          <SubSection icon={<Activity className="w-5 h-5 text-indigo-500" />} title="1.2. Nộp báo cáo Tiêm chủng Vắc xin">
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed mb-4">
              <li>Truy cập menu <strong>"Báo cáo Tiêm chủng"</strong>.</li>
              <li>Chọn <strong>Đợt tiêm đang mở</strong> và <strong>Loại vắc xin</strong> tương ứng.</li>
              <li>Chọn <strong>Ngày tiêm</strong> (chỉ được chọn trong phạm vi <strong>7 ngày gần nhất</strong>).</li>
              <li>Điền họ tên <strong>người nộp báo cáo</strong>.</li>
              <li>Nhập số mũi đã tiêm theo từng nhóm đối tượng rồi nhấn <strong>"Gửi Báo Cáo"</strong>.</li>
            </ul>
            <NoteBox type="warn">
              Mỗi đơn vị chỉ được nộp <strong>1 báo cáo / ngày cho mỗi loại vắc xin</strong>. Nếu cùng đơn vị, cùng loại vắc xin, cùng ngày đã có báo cáo thì hệ thống từ chối.
            </NoteBox>
          </SubSection>

          {/* 1.3 Sửa / xóa */}
          <SubSection icon={<Edit2 className="w-5 h-5 text-amber-500" />} title="1.3. Xem, Sửa và Xóa báo cáo (Lịch sử báo cáo)">
            <p className="text-sm text-slate-600 mb-4">
              Tại menu <strong>"Lịch sử báo cáo"</strong>, bạn có thể xem lại tất cả báo cáo đã nộp (cả Khám SK và Tiêm chủng), đồng thời sửa hoặc xóa nếu chưa quá hạn.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                  <Edit2 className="w-4 h-4 text-blue-500" /> Chỉnh sửa số liệu
                </h4>
                <p className="text-sm text-slate-600">Nhấn biểu tượng <strong>bút chì</strong> để sửa trực tiếp. Chỉ được sửa trong <strong>ngày nộp và ngày hôm sau</strong>. Quá hạn → nút bị khóa.</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                  <Trash2 className="w-4 h-4 text-red-500" /> Xóa báo cáo
                </h4>
                <p className="text-sm text-slate-600">Nhấn biểu tượng <strong>thùng rác</strong> để xóa. Thời hạn tương tự tính năng sửa: chỉ trong <strong>ngày nộp và ngày hôm sau</strong>.</p>
              </div>
            </div>
            <NoteBox type="info">
              Nếu cần sửa/xóa báo cáo đã quá hạn, vui lòng liên hệ bộ phận <strong>Kế hoạch – Nghiệp vụ CDC Đà Nẵng</strong> để được hỗ trợ.
            </NoteBox>
          </SubSection>

          {/* 1.4 Chỉ tiêu */}
          <SubSection icon={<Target className="w-5 h-5 text-blue-500" />} title="1.4. Cập nhật Chỉ tiêu của đơn vị">
            <p className="text-sm text-slate-600 mb-4">
              Truy cập menu <strong>"Chỉ tiêu của tôi"</strong> để tự nhập chỉ tiêu kế hoạch cho 7 nhóm đối tượng của đơn vị bạn.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed mb-4">
              <li>Nhập số lượng chỉ tiêu cho từng nhóm đối tượng vào các ô tương ứng.</li>
              <li>Nhấn <strong>"Lưu chỉ tiêu"</strong> — số liệu <strong>có hiệu lực ngay</strong> trên Dashboard tổng hợp.</li>
              <li>Bạn có thể cập nhật lại bất kỳ lúc nào nếu chỉ tiêu thay đổi.</li>
            </ul>
            <NoteBox type="warn">
              <strong>Mỗi đơn vị tự chịu trách nhiệm</strong> về tính chính xác của chỉ tiêu mình đã nhập. Admin CDC có thể hỗ trợ nhập hoặc điều chỉnh nếu cần thiết.
            </NoteBox>
          </SubSection>

          {/* 1.5 Đăng ký và Đổi mật khẩu */}
          <SubSection icon={<ShieldCheck className="w-5 h-5 text-slate-500" />} title="1.5. Quản lý Tài khoản">
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed mb-4">
              <li><strong>Đăng ký tài khoản:</strong> Các đơn vị/tổ chức mới (trường học, doanh nghiệp,...) có thể tự đăng ký tài khoản tại trang đăng nhập. Tài khoản mới sẽ ở trạng thái "Chờ duyệt", cần chờ Admin phê duyệt để sử dụng.</li>
              <li><strong>Đổi mật khẩu:</strong> Nhấn vào tên tài khoản góc trên bên phải → chọn <strong>"Đổi mật khẩu"</strong>. Nhập mật khẩu hiện tại và mật khẩu mới.</li>
            </ul>
          </SubSection>

        </Section>

        {/* ===== PHẦN 2: ADMIN ===== */}
        <Section color="purple" icon={<LayoutDashboard className="w-5 h-5" />} title="2. Dành cho Quản trị viên (Admin CDC)">

          {/* 2.1 Dashboard */}
          <SubSection icon={<LayoutDashboard className="w-5 h-5 text-indigo-500" />} title="2.1. Bảng điều hành — Khám Sức khỏe">
            <p className="text-sm text-slate-600 mb-3">
              Theo dõi tiến độ khám sức khỏe toàn thành phố theo từng đơn vị xã/phường theo thời gian thực.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed mb-4">
              <li><strong>Lọc nâng cao (biểu tượng Phễu):</strong> Lọc đơn vị theo trạng thái (Đã nộp / Chưa nộp), mức hoàn thành (&lt;50%, 50–80%, &gt;100%), hoặc theo Cơ sở y tế.</li>
              <li><strong>Xuất Excel:</strong> Tải toàn bộ số liệu về máy dưới dạng file .xlsx.</li>
              <li>Nhấn vào tên đơn vị để xem chi tiết lịch sử báo cáo từng ngày.</li>
            </ul>
            <NoteBox type="info">
              Cột "% Hoàn thành" chỉ hiển thị khi đơn vị đã có chỉ tiêu. Nếu còn trống, hãy nhắc đơn vị vào mục <strong>"Chỉ tiêu của tôi"</strong> để tự nhập.
            </NoteBox>
          </SubSection>

          {/* 2.2 Dashboard tiêm chủng */}
          <SubSection icon={<Activity className="w-5 h-5 text-rose-500" />} title="2.2. Bảng điều hành — Tiêm chủng">
            <p className="text-sm text-slate-600 mb-3">
              Theo dõi tiến độ tiêm chủng theo từng Đợt tiêm và Loại vắc xin.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed">
              <li>Chọn đợt tiêm từ bộ lọc để xem thống kê riêng từng đợt.</li>
              <li>Xem số mũi đã tiêm so với chỉ tiêu phân bổ của từng loại vắc xin.</li>
              <li>Xuất Excel toàn bộ số liệu tiêm chủng.</li>
            </ul>
          </SubSection>

          {/* 2.3 Xem chỉ tiêu */}
          <SubSection icon={<Target className="w-5 h-5 text-emerald-500" />} title="2.3. Xem Chỉ tiêu đơn vị (Chỉ đọc)">
            <p className="text-sm text-slate-600 mb-3">
              Truy cập <strong>Quản trị → Xem chỉ tiêu</strong> để theo dõi tổng thể trạng thái chỉ tiêu của 93 xã/phường.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed mb-4">
              <li>Bảng hiển thị số liệu chỉ tiêu 7 nhóm đối tượng của từng đơn vị.</li>
              <li>Cột <strong>"Trạng thái"</strong> cho biết đơn vị đã tự nhập chỉ tiêu chưa.</li>
              <li>Nếu một đơn vị chưa nhập, hãy liên hệ và nhắc đơn vị đó vào mục <strong>"Chỉ tiêu của tôi"</strong> để tự nhập.</li>
            </ul>
            <NoteBox type="info">
              Mỗi đơn vị tự quản lý số liệu chỉ tiêu của mình. Tuy nhiên, Admin có quyền hỗ trợ nhập hoặc cập nhật trực tiếp tại Bảng điều hành (nhấn nút ✏️ Cập nhật chỉ tiêu).
            </NoteBox>
          </SubSection>

          {/* 2.4 Đợt tiêm */}
          <SubSection icon={<ClipboardList className="w-5 h-5 text-rose-500" />} title="2.4. Quản lý Đợt tiêm & Vắc xin">
            <p className="text-sm text-slate-600 mb-3">Truy cập <strong>Quản trị → Quản lý Đợt tiêm</strong>.</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-800 mb-2 text-sm">Tạo Vắc xin mới</h4>
                <p className="text-sm text-slate-600">Nhập tên vắc xin (VD: AstraZeneca, Pfizer, Sinopharm) rồi nhấn <strong>"Thêm Vắc xin"</strong>.</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-800 mb-2 text-sm">Tạo / Sửa Đợt tiêm</h4>
                <p className="text-sm text-slate-600">Điền tên đợt, ngày bắt đầu – kết thúc, chọn vắc xin và số mũi phân bổ. Nhấn nút <strong>✏️ Sửa</strong> để chỉnh sửa đợt đã tạo.</p>
              </div>
            </div>
            <NoteBox type="info">
              Đợt tiêm ở trạng thái <strong>"Đang diễn ra"</strong> mới cho phép các đơn vị nộp báo cáo tiêm chủng. Đổi trạng thái sang <strong>"Đã kết thúc"</strong> khi đợt tiêm hoàn tất.
            </NoteBox>
          </SubSection>

          {/* 2.5 Tài khoản */}
          <SubSection icon={<Users className="w-5 h-5 text-blue-500" />} title="2.5. Quản lý Tài khoản">
            <p className="text-sm text-slate-600 mb-3">Truy cập <strong>Quản trị → Tài khoản</strong>.</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed">
              <li><strong>Duyệt tài khoản mới:</strong> Xem danh sách các đơn vị mới đăng ký (trạng thái "Chờ duyệt") và thao tác Duyệt hoặc Từ chối.</li>
              <li><strong>Tạo tài khoản mới:</strong> Nhập tên đăng nhập, tên đơn vị, mật khẩu và phân quyền (Đơn vị / Admin).</li>
              <li><strong>Quản lý:</strong> Đổi thông tin tài khoản, Reset mật khẩu cho đơn vị quên mật khẩu. Admin có thể trực tiếp theo dõi tiến độ của đơn vị từ Dashboard riêng của đơn vị đó.</li>
              <li><strong>Xóa tài khoản:</strong> Xóa tài khoản không còn sử dụng (trừ tài khoản <code>admin</code> chính).</li>
            </ul>
          </SubSection>

          {/* 2.6 Lịch sử */}
          <SubSection icon={<FileText className="w-5 h-5 text-slate-500" />} title="2.6. Lịch sử báo cáo (Quyền Admin)">
            <p className="text-sm text-slate-600 mb-3">
              Admin thấy <strong>toàn bộ báo cáo</strong> của tất cả đơn vị ở trang <strong>"Lịch sử báo cáo"</strong>, không bị giới hạn theo đơn vị.
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-2 text-sm leading-relaxed">
              <li>Có thể sửa hoặc xóa bất kỳ báo cáo nào, <strong>không bị giới hạn thời gian</strong>.</li>
              <li>Dùng bộ lọc để tìm báo cáo theo đơn vị, ngày, loại báo cáo.</li>
            </ul>
          </SubSection>

        </Section>

        {/* ===== PHẦN 3: QUY ĐỊNH CHUNG ===== */}
        <Section color="emerald" icon={<Clock className="w-5 h-5" />} title="3. Quy định thời gian và ràng buộc hệ thống">

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700 min-w-[180px]">Quy định</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Khám SK</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Tiêm chủng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">Giới hạn nộp</td>
                  <td className="px-4 py-3 text-slate-600">1 báo cáo / ngày / đơn vị</td>
                  <td className="px-4 py-3 text-slate-600">1 báo cáo / ngày / vắc xin / đơn vị</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">Chọn ngày</td>
                  <td className="px-4 py-3 text-slate-600">Chỉ trong 7 ngày gần nhất</td>
                  <td className="px-4 py-3 text-slate-600">Chỉ trong 7 ngày gần nhất</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">Sửa / xóa (đơn vị)</td>
                  <td className="px-4 py-3 text-slate-600">Trong ngày nộp + ngày hôm sau</td>
                  <td className="px-4 py-3 text-slate-600">Trong ngày nộp + ngày hôm sau</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">Sửa / xóa (Admin)</td>
                  <td className="px-4 py-3 text-slate-600">Không giới hạn thời gian</td>
                  <td className="px-4 py-3 text-slate-600">Không giới hạn thời gian</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">Cập nhật chỉ tiêu</td>
                  <td className="px-4 py-3 text-slate-600" colSpan={2}>Đơn vị tự cập nhật bất kỳ lúc nào — có hiệu lực ngay</td>
                </tr>
              </tbody>
            </table>
          </div>

          <NoteBox type="ok">
            Mọi thắc mắc hoặc trường hợp ngoại lệ, vui lòng liên hệ bộ phận <strong>Kế hoạch – Nghiệp vụ CDC Đà Nẵng</strong> để được hỗ trợ kịp thời.
          </NoteBox>

        </Section>

      </div>
    </div>
  );
}
