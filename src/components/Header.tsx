export type DomainMode = "enterprise" | "academic";
export type UserRole = "harness" | "reviewer" | "applicant";

interface HeaderProps {
  currentDomain: DomainMode;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenPolicy: () => void;
  onOpenStandardForm: () => void;
}

export default function Header({
  currentDomain,
  userRole,
  onRoleChange,
  onOpenPolicy,
  onOpenStandardForm,
}: HeaderProps) {
  // Ngữ cảnh trình diễn chốt ở Trường học, nên nhãn vai cố định theo trường học.
  const applicantLabel = "Sinh Viên";
  const reviewerLabel = "Trưởng Khoa / GV";

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md bg-indigo-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Escalation Referee
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Agent Đánh Giá
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hệ thống thẩm định &amp; duyệt đơn xin nghỉ học sinh viên
              </p>
            </div>
          </div>

          {/* Right Actions: Role Selector, Domain Switcher, Standard Form, Policy */}
          <div className="flex items-center gap-2">
            {/* View / Role Switcher */}
            <div className="inline-flex bg-slate-800 p-1 rounded-xl border border-amber-400/40">
              <button
                type="button"
                onClick={() => onRoleChange("harness")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  userRole === "harness"
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Giao diện Verify Harness dành cho Giám khảo (Tự nhập ca & Kiểm chứng tự động)"
              >
                <span>🧪</span>
                <span className="hidden sm:inline">Verify Harness</span>
                <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1 py-0.2 rounded font-bold sm:hidden">Harness</span>
              </button>
              <button
                type="button"
                onClick={() => onRoleChange("reviewer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  userRole === "reviewer"
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Giao diện dành cho cấp trên / trưởng khoa (Duyệt & Phân xử hồ sơ)"
              >
                <span>🛡️</span>
                <span>{reviewerLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => onRoleChange("applicant")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  userRole === "applicant"
                    ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Giao diện dành cho người làm đơn (Nộp thư mục hồ sơ)"
              >
                <span>👤</span>
                <span>{applicantLabel}</span>
              </button>
            </div>

            {/*
              Ngữ cảnh trình diễn: CHỈ Trường học.
              Nhánh doanh nghiệp (EscalationRefereeAgent.ts:98-103) còn đúng loại lỗi
              B1/B1b đã vá cho nhánh trường học — thẩm quyền suy từ số ngày, và quét
              chuỗi tự do — nhưng chưa có bộ ca kiểm thử nào phủ. Vá logic không có test
              là vá mù, nên chủ động NGẮT khỏi UI thay vì sửa vội.
              Code enterprise vẫn giữ trong repo để bảo toàn lịch sử; chỉ không có
              đường nào từ giao diện chạm tới. Xem docs/RUNBOOK.md §5.
            */}
            <div
              className="inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-indigo-200"
              title="Bản trình diễn giới hạn ở ngữ cảnh Trường học — xem RUNBOOK mục 'Đã biết & đang xử'"
            >
              <span>🎓</span>
              <span className="hidden sm:inline">Trường Học</span>
            </div>

            {/* Mẫu Đơn Chuẩn Button */}
            <button
              type="button"
              onClick={onOpenStandardForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors shadow-xs"
              title="Xem và tải Biểu mẫu đơn chuẩn (BM-HR-01 / BM-DT-02)"
            >
              <span>📄</span>
              <span className="hidden md:inline">Mẫu Đơn Chuẩn</span>
            </button>

            {/* Xem Quy chế Button */}
            <button
              type="button"
              onClick={onOpenPolicy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors shadow-xs"
              title="Mở bảng tra cứu điều khoản quy chế và nguyên tắc bất định"
            >
              <span>📖</span>
              <span>Quy chế</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
