export type DomainMode = "enterprise" | "academic";

interface HeaderProps {
  currentDomain: DomainMode;
  onDomainChange: (domain: DomainMode) => void;
}

export default function Header({ currentDomain, onDomainChange }: HeaderProps) {
  const isEnterprise = currentDomain === "enterprise";

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800">
      {/* Top Utility Bar with Domain Switcher */}
      <div className="border-b border-slate-800/80 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between py-2 sm:h-12 gap-2">
          {/* Brand & Badge */}
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isEnterprise ? "text-blue-400" : "text-indigo-400"}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-display text-xs font-bold text-slate-200 tracking-wider uppercase">
              AI Escalation Referee · Spec A
            </span>
            <span className="font-mono-data text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              SV2 Lõi Agent &amp; Decision Log
            </span>
          </div>

          {/* Context / Domain Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden md:inline">Chọn Ngữ Cảnh:</span>
            <div className="inline-flex bg-slate-800/90 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => onDomainChange("enterprise")}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEnterprise
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>🏢</span>
                <span>Doanh Nghiệp (HR Leave)</span>
              </button>
              <button
                type="button"
                onClick={() => onDomainChange("academic")}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  !isEnterprise
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>🎓</span>
                <span>Trường Học (Student Leave)</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-emerald-400 ml-2 hidden sm:flex">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </div>
          </div>
        </div>
      </div>

      {/* ── TIÊU CHÍ SV3: LANDING PAGE GHI ĐÚNG MỘT DÒNG CHỈ VIỆC CẦN THỬ ĐẦU TIÊN ── */}
      <div className="bg-amber-400 text-slate-950 font-bold px-4 py-2.5 text-center text-xs sm:text-sm shadow-inner flex items-center justify-center gap-2">
        <span className="bg-slate-950 text-amber-300 text-[10px] uppercase font-mono-data px-2 py-0.5 rounded tracking-wider">
          Việc cần thử đầu tiên
        </span>
        <span>
          👉 Bấm nút <u>"Chạy Verify (5 Ca)"</u> bên dưới để kiểm tra tự động xem Lõi Agent có tự duyệt ca thường quy và dừng lại đúng lúc ở 3 loại bất định không.
        </span>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left Title & Callout */}
          <div className="max-w-2xl">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              AI Escalation Referee
              <span className={`block text-base sm:text-lg font-medium mt-0.5 ${isEnterprise ? "text-blue-400" : "text-indigo-400"}`}>
                {isEnterprise
                  ? "Phân xử Duyệt Đơn Nghỉ Phép Nội Bộ (Enterprise HR Management)"
                  : "Phân xử Duyệt Đơn Xin Nghỉ Học Sinh Viên (Academic Student Leave)"}
              </span>
            </h1>

            <div className={`mt-3 p-3 rounded-xl border leading-relaxed text-xs ${
              isEnterprise
                ? "bg-blue-950/40 border-blue-900/60 text-blue-100"
                : "bg-indigo-950/40 border-indigo-900/60 text-indigo-100"
            }`}>
              {isEnterprise ? (
                <p>
                  <strong className="text-white">Quy chế Nhân sự Doanh nghiệp:</strong> Tự động duyệt đơn thường quy &amp; kích hoạt dừng ở 3 loại:
                  <span className="underline decoration-blue-400 mx-1">Chứng từ y tế mờ ngày</span> (Dữ kiện),
                  <span className="underline decoration-blue-400 mx-1">Ngoài chính sách</span>, và
                  <span className="underline decoration-blue-400 mx-1">Nghỉ không lương &gt; 5 ngày</span> (Vượt thẩm quyền Quản lý trực tiếp).
                </p>
              ) : (
                <p>
                  <strong className="text-white">Quy chế Đào tạo Học đường:</strong> Tự động duyệt đơn thường quy &amp; kích hoạt dừng ở 3 loại:
                  <span className="underline decoration-indigo-400 mx-1">Giấy khám mờ ngày ("nghỉ từ ngày nào?")</span>,
                  <span className="underline decoration-indigo-400 mx-1">Vắng quá 20% buổi ("có xét đặc biệt?")</span>, và
                  <span className="underline decoration-indigo-400 mx-1">Bảo lưu cả kỳ ("thẩm quyền Trưởng khoa")</span>.
                </p>
              )}
            </div>
          </div>

          {/* Right Stat Chips */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-4 py-2 min-w-[150px]">
              <div className="text-lg font-bold text-white leading-none">
                {isEnterprise ? "5 Ca Chuẩn" : "5 Ca / 15 Ca"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Kiểm thử Verify Harness</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-4 py-2 min-w-[150px]">
              <div className="text-lg font-bold text-emerald-400 leading-none">3 Loại Dừng</div>
              <div className="text-[11px] text-slate-400 mt-1">Dữ kiện · Chính sách · Thẩm quyền</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
