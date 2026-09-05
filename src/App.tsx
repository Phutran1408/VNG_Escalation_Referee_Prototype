import { useState, useCallback } from "react";
import Header from "./components/Header";
import VerifyHarness from "./components/VerifyHarness";
import AuditTrail from "./components/AuditTrail";
import { apiEvaluate, apiOverride } from "./services/api";
import type { AuditEntry, EvaluateResponse, VerifyResult, LeaveType } from "./types";

// ── Helpers ─────────────────────────────────────────────────────────────────

function verifyToAudit(r: VerifyResult & { policyBasis?: string }, idx: number): AuditEntry {
  const parts = r.summary.split(" · ");
  return {
    requestId: `VRF-${r.caseId}-${Date.now() + idx}`,
    timestamp: r.timestamp,
    employeeInfo: [parts[0], parts[1]].filter(Boolean).join(" · "),
    department: parts[2] ?? "—",
    leaveType: parts[3] ?? "—",
    decision: r.actual,
    policyBasis:
      (r as VerifyResult & { policyBasis?: string }).policyBasis ??
      (r.triggerCategory
        ? "Xem câu hỏi Escalate — policy.md"
        : "Quy chế Nhân sự nội bộ — Điều kiện tự động phê duyệt"),
    overridden: false,
    triggerCategory: r.triggerCategory,
    escalationQuestion: r.escalationQuestion,
  };
}

// ── Form ────────────────────────────────────────────────────────────────────

const LEAVE_TYPES: LeaveType[] = [
  "Nghỉ phép năm",
  "Nghỉ ốm/chế độ",
  "Nghỉ không lương",
  "Nghỉ việc riêng",
];

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white placeholder-slate-400 transition-shadow";

const labelCls = "block text-[11px] font-700 text-slate-500 mb-1.5 uppercase tracking-widest";

function TriggerLabel({ cat }: { cat?: EvaluateResponse["triggerCategory"] }) {
  if (!cat) return null;
  const cls =
    cat === "Không chắc dữ kiện"
      ? "trigger-fact"
      : cat === "Ngoài chính sách"
      ? "trigger-policy"
      : "trigger-authority";
  return <span className={`badge ${cls}`}>{cat}</span>;
}

interface FormState {
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  employeeId: "",
  employeeName: "",
  department: "",
  leaveType: "Nghỉ phép năm",
  fromDate: "",
  toDate: "",
  reason: "",
  notes: "",
};

interface LeaveFormProps {
  onResult: (res: EvaluateResponse, form: FormState) => void;
}

function LeaveForm({ onResult }: LeaveFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateResponse | null>(null);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await apiEvaluate(form);
      setResult(res);
      onResult(res, form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="leave-form" className="scroll-mt-6">
      <div className="card">
        {/* Section header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="font-display text-lg font-700 text-slate-900">Nộp Đơn Xin Nghỉ Phép</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Agent AI phân loại tức thì theo Quy chế Nhân sự nội bộ — không cần đăng nhập
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          {/* Employee identity row */}
          <fieldset className="mb-5">
            <legend className="font-display text-xs font-700 text-indigo-700 uppercase tracking-widest mb-3 pb-1.5 border-b border-indigo-100 w-full">
              Thông tin Nhân viên
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>
                  Mã nhân viên <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="VD: NV-2024-0312"
                  value={form.employeeId}
                  onChange={(e) => set("employeeId", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="VD: Nguyễn Thị Hương"
                  value={form.employeeName}
                  onChange={(e) => set("employeeName", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Phòng ban / Khối <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="VD: Phòng Kinh doanh"
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </fieldset>

          {/* Leave details */}
          <fieldset className="mb-5">
            <legend className="font-display text-xs font-700 text-indigo-700 uppercase tracking-widest mb-3 pb-1.5 border-b border-indigo-100 w-full">
              Chi tiết Nghỉ phép
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>
                  Loại nghỉ phép <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.leaveType}
                  onChange={(e) => set("leaveType", e.target.value as LeaveType)}
                  className={inputCls}
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>
                  Từ ngày <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => set("fromDate", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Đến ngày <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={form.toDate}
                  onChange={(e) => set("toDate", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </fieldset>

          {/* Reason & notes */}
          <fieldset className="mb-6">
            <legend className="font-display text-xs font-700 text-indigo-700 uppercase tracking-widest mb-3 pb-1.5 border-b border-indigo-100 w-full">
              Lý do & Chứng từ
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Lý do chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Mô tả chi tiết lý do xin nghỉ phép..."
                  value={form.reason}
                  onChange={(e) => set("reason", e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className={labelCls}>Ghi chú chứng từ đính kèm</label>
                <textarea
                  rows={4}
                  placeholder="VD: Giấy khám bệnh số 0042/MC ngày 12/10/2025, Giấy chứng nhận kết hôn số 001456..."
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </fieldset>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Agent đang phân tích…
                </>
              ) : (
                "Gửi Đơn Xin Nghỉ Phép →"
              )}
            </button>
            {!loading && (
              <button
                type="button"
                onClick={() => { setForm(EMPTY_FORM); setResult(null); }}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Xóa form
              </button>
            )}
          </div>
        </form>

        {/* Result box */}
        {result && (
          <div className="mx-6 mb-6">
            {result.decision === "AUTO_APPROVE" ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-700 text-emerald-800">
                      TỰ ĐỘNG PHÊ DUYỆT
                    </h3>
                    <p className="text-sm text-emerald-700 mt-1 font-medium">
                      Hợp lệ theo Quy chế Nhân sự nội bộ
                    </p>
                    <p className="text-xs text-emerald-600 mt-2 italic">{result.policyBasis}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="font-mono-data text-[11px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded">
                        {result.requestId}
                      </span>
                      <span className="font-mono-data text-[11px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded">
                        {result.timestamp.replace("T", " ").slice(0, 19)}Z
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-700 text-amber-800">
                      CHUYỂN PHÂN XỬ — ESCALATE
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <TriggerLabel cat={result.triggerCategory} />
                    </div>
                    <div className="mt-3 bg-white border border-amber-200 rounded-lg px-4 py-3.5">
                      <p className="text-[11px] font-700 text-amber-600 uppercase tracking-wider mb-1.5">
                        Câu hỏi Escalate
                      </p>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        {result.escalationQuestion}
                      </p>
                    </div>
                    <p className="text-xs text-amber-600 mt-2.5 italic">{result.policyBasis}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="font-mono-data text-[11px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded">
                        {result.requestId}
                      </span>
                      <span className="font-mono-data text-[11px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded">
                        {result.timestamp.replace("T", " ").slice(0, 19)}Z
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  const handleVerifyResults = useCallback((results: VerifyResult[]) => {
    const entries = results.map((r, i) =>
      verifyToAudit(r as VerifyResult & { policyBasis?: string }, i)
    );
    setAuditEntries((prev) => [...entries, ...prev]);
  }, []);

  const handleFormResult = useCallback((res: EvaluateResponse, form: FormState) => {
    const entry: AuditEntry = {
      requestId: res.requestId,
      timestamp: res.timestamp,
      employeeInfo: `${form.employeeId} · ${form.employeeName}`,
      department: form.department,
      leaveType: form.leaveType,
      decision: res.decision,
      policyBasis: res.policyBasis,
      overridden: false,
      triggerCategory: res.triggerCategory,
      escalationQuestion: res.escalationQuestion,
    };
    setAuditEntries((prev) => [entry, ...prev]);
  }, []);

  const handleOverride = useCallback(async (requestId: string) => {
    await apiOverride(requestId);
    setAuditEntries((prev) =>
      prev.map((e) => (e.requestId === requestId ? { ...e, overridden: true } : e))
    );
  }, []);

  return (
    <div className="min-h-full flex flex-col bg-slate-100">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        <VerifyHarness onResults={handleVerifyResults} />
        <LeaveForm onResult={handleFormResult} />
        <AuditTrail entries={auditEntries} onOverride={handleOverride} />
      </main>
      <footer className="border-t border-slate-200 bg-white mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500 font-medium">
            AI Escalation Referee — Spec A &middot; Enterprise HR · Phân xử Duyệt Đơn Nghỉ Phép Nội bộ
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono-data text-[11px] text-slate-400">FastAPI · Render</span>
            <span className="text-slate-300">|</span>
            <span className="font-mono-data text-[11px] text-slate-400">React + Vite · Vercel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
