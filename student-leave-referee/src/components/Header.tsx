export default function Header() {
  return (
    <header className="bg-indigo-950 text-white">
      {/* Top utility bar */}
      <div className="border-b border-indigo-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
          <div className="flex items-center gap-2.5">
            {/* Academic Graduation / Shield Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span className="font-display text-xs font-600 text-indigo-300 tracking-widest uppercase">
              Hệ thống Học đường · OrganizationAI Spec A
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-data text-[10px] text-indigo-400">SV2 — Lõi Agent & Decision Log</span>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Hệ thống hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* Hero band */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          {/* Left: title */}
          <div className="max-w-2xl">
            <h1 className="font-display text-2xl sm:text-3xl font-800 text-white leading-tight tracking-tight">
              AI Escalation Referee
              <span className="block text-indigo-400 text-base sm:text-lg font-500 mt-0.5 tracking-normal">
                Phân xử Duyệt Đơn Xin Nghỉ Học của Sinh viên
              </span>
            </h1>

            {/* Instruction callout */}
            <div className="mt-4 bg-indigo-900/50 border border-indigo-800 rounded-lg px-4 py-3 max-w-xl">
              <p className="text-sm text-indigo-100 leading-relaxed">
                <span className="font-semibold text-white">Tự động hóa duyệt đơn nghỉ học thường quy & dừng thông minh</span>{" "}
                <span className="font-mono-data text-[11px] text-indigo-400">(3 loại độ bất định: Dữ kiện · Chính sách · Thẩm quyền)</span>.{" "}
                Bấm{" "}
                <kbd className="inline-flex items-center gap-1 bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded border border-indigo-500 transition-colors cursor-default">
                  Chạy Verify (5 ca chuẩn)
                </kbd>{" "}
                để kiểm chứng hành vi của Lõi Agent hoặc nộp đơn trực tiếp bên dưới.
              </p>
            </div>
          </div>

          {/* Right: stat chips */}
          <div className="flex flex-wrap lg:flex-col gap-2 lg:items-end shrink-0">
            {[
              { label: "Ca thử nghiệm chuẩn", value: "5 ca", sub: "3 thường quy · 2 dừng" },
              { label: "3 Nhóm dừng bất định", value: "3 loại", sub: "Dữ kiện · Chính sách · Thẩm quyền" },
            ].map((s) => (
              <div key={s.label} className="bg-indigo-900/40 border border-indigo-800 rounded-lg px-4 py-2.5 min-w-[170px]">
                <div className="font-display text-xl font-700 text-white leading-none">{s.value}</div>
                <div className="text-[11px] text-indigo-300 mt-1 font-medium">{s.label}</div>
                <div className="font-mono-data text-[10px] text-indigo-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation strip */}
      <nav className="border-t border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto">
          {[
            { label: "▶ Verify Harness (5 Ca Chuẩn)", anchor: "#verify", accent: true },
            { label: "Nộp Đơn Nghỉ Học", anchor: "#leave-form", accent: false },
            { label: "Nhật Ký Quyết Định (Audit Trail)", anchor: "#audit", accent: false },
          ].map((item) => (
            <a
              key={item.anchor}
              href={item.anchor}
              className={`flex-none px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                item.accent
                  ? "text-indigo-300 border-indigo-400 hover:text-white"
                  : "text-indigo-400 border-transparent hover:text-indigo-200 hover:border-indigo-700"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
