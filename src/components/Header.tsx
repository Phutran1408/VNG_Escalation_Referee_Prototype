export default function Header() {
  return (
    <header className="bg-indigo-950 text-white">
      {/* Top utility bar */}
      <div className="border-b border-indigo-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
          <div className="flex items-center gap-2.5">
            {/* HR shield icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-display text-xs font-600 text-indigo-300 tracking-widest uppercase">
              Enterprise HR · AI Referee
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-data text-[10px] text-indigo-400">Spec&nbsp;A · v2.0.0</span>
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
                Phân xử Duyệt Đơn Nghỉ Phép Nội bộ
              </span>
            </h1>

            {/* Instruction callout */}
            <div className="mt-4 bg-indigo-900/50 border border-indigo-800 rounded-lg px-4 py-3 max-w-xl">
              <p className="text-sm text-indigo-100 leading-relaxed">
                <span className="font-semibold text-white">Hệ thống phân xử duyệt đơn xin nghỉ phép nội bộ</span>{" "}
                <span className="font-mono-data text-[11px] text-indigo-400">(Spec A — The Escalation Referee)</span>.{" "}
                Bấm{" "}
                <kbd className="inline-flex items-center gap-1 bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded border border-indigo-500 transition-colors cursor-default">
                  Chạy Verify (90s)
                </kbd>{" "}
                để kiểm tra tự động 5 ca thử nghiệm, hoặc nộp đơn mới bên dưới.
              </p>
            </div>
          </div>

          {/* Right: stat chips */}
          <div className="flex flex-wrap lg:flex-col gap-2 lg:items-end shrink-0">
            {[
              { label: "Ca thử nghiệm", value: "5", sub: "3 duyệt · 2 escalate" },
              { label: "Nhóm trigger", value: "3", sub: "Fact · Policy · Auth" },
            ].map((s) => (
              <div key={s.label} className="bg-indigo-900/40 border border-indigo-800 rounded-lg px-4 py-2.5 min-w-[140px]">
                <div className="font-display text-2xl font-700 text-white leading-none">{s.value}</div>
                <div className="text-[11px] text-indigo-400 mt-0.5 font-medium">{s.label}</div>
                <div className="font-mono-data text-[10px] text-indigo-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation strip */}
      <nav className="border-t border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto">
          {[
            { label: "▶ Verify Harness", anchor: "#verify", accent: true },
            { label: "Nộp Đơn Nghỉ Phép", anchor: "#leave-form", accent: false },
            { label: "Nhật Ký Kiểm Duyệt", anchor: "#audit", accent: false },
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
