import { useState, useCallback } from "react";
import EnterpriseVerifyHarness from "./VerifyHarness";
import EnterpriseAuditTrail from "./AuditTrail";
import { refereeAgent } from "../../core/agent/EscalationRefereeAgent";
import type { LocalLlmConfig } from "../../core/agent/localLlmClient";
import type { AuditEntry, EvaluateResponse, VerifyResult, LeaveType } from "./types";

// ── Helpers ─────────────────────────────────────────────────────────────────

function verifyToAudit(r: VerifyResult & { policyBasis?: string }, idx: number): AuditEntry {
  const parts = r.summary.split(" · ");
  return {
    requestId: `VRF-HR-${r.caseId}-${Date.now() + idx}`,
    timestamp: r.timestamp,
    employeeInfo: [parts[0], parts[1]].filter(Boolean).join(" · "),
    department: parts[2] ?? "—",
    leaveType: parts[3] ?? "—",
    decision: r.actual,
    policyBasis:
      (r as VerifyResult & { policyBasis?: string }).policyBasis ??
      (r.triggerCategory
        ? "Xem câu hỏi Escalate — Quy chế Nhân sự"
        : "Quy chế Nhân sự nội bộ — Điều kiện tự động phê duyệt"),
    overridden: false,
    triggerCategory: r.triggerCategory,
    escalationQuestion: r.escalationQuestion,
  };
}

function daysBetween(from: string, to: string): number {
  if (!from || !to) return 1;
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

const LEAVE_TYPES: LeaveType[] = [
  "Nghỉ phép năm",
  "Nghỉ ốm/chế độ",
  "Nghỉ không lương",
  "Nghỉ việc riêng",
];

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow";

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
  department: "Phòng Kinh doanh",
  leaveType: "Nghỉ phép năm",
  fromDate: "",
  toDate: "",
  reason: "",
  notes: "",
};

const HR_PRESETS: { label: string; desc: string; color: string; data: FormState }[] = [
  {
    label: "Ca 1: Nghỉ phép năm hợp lệ",
    desc: "Nghỉ 1 ngày, nộp trước 3 ngày, còn đủ 4 ngày phép -> Tự động duyệt",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    data: {
      employeeId: "NV-2024-0312",
      employeeName: "Nguyễn Thị Hương",
      department: "Phòng Kinh doanh",
      leaveType: "Nghỉ phép năm",
      fromDate: "2025-10-15",
      toDate: "2025-10-15",
      reason: "Nghỉ phép năm theo kế hoạch, nộp trước 3 ngày làm việc.",
      notes: "Đã xác nhận số dư phép năm còn 4 ngày. Không ảnh hưởng tiến độ nhóm.",
    },
  },
  {
    label: "Ca 2: Chứng từ mờ ngày xuất viện",
    desc: "Nghỉ ốm 4 ngày, chứng từ y tế mờ ngày điều trị -> Không chắc dữ kiện",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    data: {
      employeeId: "NV-2024-0489",
      employeeName: "Phạm Đức Anh",
      department: "Phòng Marketing",
      leaveType: "Nghỉ ốm/chế độ",
      fromDate: "2025-10-12",
      toDate: "2025-10-15",
      reason: "Nghỉ ốm điều trị tại bệnh viện, đính kèm chứng từ y tế.",
      notes: "Chứng từ y tế bị mờ, không đọc rõ ngày bắt đầu điều trị. Cần xác minh.",
    },
  },
  {
    label: "Ca 3: Nghỉ không lương 20 ngày",
    desc: "Nghỉ không lương 20 ngày liên tục -> Vượt thẩm quyền Quản lý trực tiếp",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    data: {
      employeeId: "NV-2021-0034",
      employeeName: "Hoàng Văn Bình",
      department: "Phòng Vận hành",
      leaveType: "Nghỉ không lương",
      fromDate: "2025-11-10",
      toDate: "2025-12-05",
      reason: "Xin nghỉ không lương dài hạn để chăm sóc người thân bị bệnh nặng.",
      notes: "Thời gian nghỉ 20 ngày làm việc liên tục. Vượt thẩm quyền phê duyệt của Quản lý trực tiếp.",
    },
  },
];

interface LeaveFormProps {
  llmConfig?: Partial<LocalLlmConfig>;
  onResult: (res: EvaluateResponse, form: FormState) => void;
}

function EnterpriseLeaveForm({ llmConfig, onResult }: LeaveFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateResponse | null>(null);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setResult(null);
  }

  function applyPreset(p: FormState) {
    setForm({ ...p });
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const lowerAll = (form.reason + " " + form.notes).toLowerCase();
      const isUnclear = lowerAll.includes("mờ") || lowerAll.includes("thiếu mộc") || lowerAll.includes("c65") || lowerAll.includes("chưa nộp");
      const hasMissingDoc = form.leaveType === "Nghỉ việc riêng" && !lowerAll.includes("kết hôn") && !lowerAll.includes("chứng tử") && !lowerAll.includes("tang");

      const agentRes = await refereeAgent.evaluateAsync(
        {
          domain: "enterprise",
          subjectId: form.employeeId,
          subjectName: form.employeeName,
          organizationUnit: form.department,
          leaveType: form.leaveType,
          fromDate: form.fromDate,
          toDate: form.toDate,
          durationDaysOrSessions: days,
          docStatus: isUnclear ? "UNCLEAR_DATE" : hasMissingDoc ? "MISSING" : "VALID",
          reasonText: form.reason,
          notesText: form.notes,
        },
        llmConfig
      );

      const res: EvaluateResponse = {
        requestId: agentRes.decisionId,
        decision: agentRes.outcome,
        policyBasis: agentRes.policyBasis,
        escalationQuestion: agentRes.escalationQuestion,
        triggerCategory: agentRes.uncertaintyCategory,
        timestamp: agentRes.timestamp,
        reasoningTrace: agentRes.reasoningTrace,
      };

      setResult(res);
      onResult(res, form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="leave-form-enterprise" className="scroll-mt-6">
      <div className="card">
        {/* Card Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-700 text-slate-900">
                  Thẩm Định Đơn Xin Nghỉ Phép Nội Bộ (Enterprise HR)
                </h2>
                <span className="text-[10px] font-mono-data bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                  Rule Guardrails + Local LLM
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Nhập đơn nhân sự hoặc bấm Ca mẫu để kiểm chứng Lõi Agent HR tự động phân loại
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {HR_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyPreset(p.data)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs hover:scale-[1.02] ${p.color}`}
                  title={p.desc}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Mã số Nhân viên (Mã NV) *</label>
              <input
                className={inputCls}
                placeholder="VD: NV-2024-0312"
                value={form.employeeId}
                onChange={(e) => set("employeeId", e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Họ và tên Nhân viên *</label>
              <input
                className={inputCls}
                placeholder="VD: Nguyễn Thị Hương"
                value={form.employeeName}
                onChange={(e) => set("employeeName", e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Phòng ban / Khối chức năng</label>
              <input
                className={inputCls}
                placeholder="VD: Phòng Kinh doanh"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Loại nghỉ phép *</label>
              <select
                className={inputCls}
                value={form.leaveType}
                onChange={(e) => set("leaveType", e.target.value as LeaveType)}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Từ ngày *</label>
              <input
                type="date"
                className={inputCls}
                value={form.fromDate}
                onChange={(e) => set("fromDate", e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Đến ngày *</label>
              <input
                type="date"
                className={inputCls}
                value={form.toDate}
                onChange={(e) => set("toDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Lý do xin nghỉ</label>
              <textarea
                rows={2}
                className={inputCls}
                placeholder="VD: Nghỉ phép năm theo kế hoạch..."
                value={form.reason}
                onChange={(e) => set("reason", e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls}>Ghi chú minh chứng đính kèm</label>
              <textarea
                rows={2}
                className={inputCls}
                placeholder="VD: Giấy ra viện, xác nhận số dư phép..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setForm(EMPTY_FORM)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Làm mới form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" fill="none" />
                  </svg>
                  Lõi Agent Đang Thẩm Định…
                </>
              ) : (
                "Thẩm Định Đơn Nhân Sự (Hybrid Agent)"
              )}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div
            className={`border-t p-6 ${
              result.decision === "AUTO_APPROVE"
                ? "bg-emerald-50/80 border-emerald-300"
                : "bg-amber-50/90 border-amber-300"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold font-mono-data text-slate-500 uppercase">
                    KẾT QUẢ PHÂN XỬ HR:
                  </span>
                  {result.decision === "AUTO_APPROVE" ? (
                    <span className="badge badge-approve text-sm px-3.5 py-1 font-bold">
                      TỰ ĐỘNG PHÊ DUYỆT (AUTO_APPROVE)
                    </span>
                  ) : (
                    <span className="badge badge-escalate text-sm px-3.5 py-1 font-bold">
                      CHUYỂN CẤP DUYỆT (ESCALATE)
                    </span>
                  )}
                  <TriggerLabel cat={result.triggerCategory} />
                </div>

                <div className="text-xs text-slate-800 leading-relaxed">
                  <strong>Căn cứ:</strong> {result.policyBasis}
                </div>

                {result.escalationQuestion && (
                  <div className="p-3.5 bg-amber-100/90 border border-amber-300 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1">
                      ❓ Câu hỏi Escalate cho Giám đốc Khối / HRD:
                    </span>
                    <p className="text-sm font-bold text-amber-950 bg-white/80 p-2.5 rounded-lg border border-amber-200">
                      "{result.escalationQuestion}"
                    </p>
                  </div>
                )}

                {/* Reasoning Trace Steps */}
                {result.reasoningTrace && result.reasoningTrace.length > 0 && (
                  <div className="bg-white/70 border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
                      🔍 Các Bước Phân Tích &amp; Đối Chiếu Quy Chế:
                    </span>
                    <div className="space-y-1">
                      {result.reasoningTrace.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-150"
                        >
                          <span className={step.passed ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                            {step.passed ? "✓" : "⚠️"}
                          </span>
                          <div className="flex-1">
                            <span className="font-semibold">{step.checkName}: </span>
                            <span>{step.observation}</span>
                            <span className="text-[10px] text-slate-400 font-mono-data ml-1.5">[{step.ruleCited}]</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-xs font-mono-data text-slate-400 shrink-0">
                {result.requestId}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Enterprise View Component ──────────────────────────────────────────────

interface EnterpriseAppProps {
  llmConfig?: Partial<LocalLlmConfig>;
}

export default function EnterpriseApp({ llmConfig }: EnterpriseAppProps) {
  const [activeTab, setActiveTab] = useState<"form" | "audit" | "verify">("form");
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  const handleVerifyResults = useCallback((results: VerifyResult[]) => {
    const newEntries = results.map((r, i) => verifyToAudit(r, i));
    setAuditEntries((prev) => [...newEntries, ...prev]);
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
      escalationQuestion: res.escalationQuestion,
      triggerCategory: res.triggerCategory,
    };
    setAuditEntries((prev) => [entry, ...prev]);
  }, []);

  const handleOverride = useCallback((requestId: string) => {
    setAuditEntries((prev) =>
      prev.map((e) =>
        e.requestId === requestId
          ? {
              ...e,
              overridden: true,
              decision: e.decision === "AUTO_APPROVE" ? "ESCALATE" : "AUTO_APPROVE",
            }
          : e
      )
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Clean Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="inline-flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "form"
                ? "bg-white text-blue-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📝</span>
            <span>Thẩm Định Đơn</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "audit"
                ? "bg-white text-blue-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📋</span>
            <span>Nhật Ký Xét Duyệt</span>
            {auditEntries.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full text-[10px] font-mono-data">
                {auditEntries.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("verify")}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "verify"
                ? "bg-white text-blue-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🧪</span>
            <span>Kiểm Chứng Tự Động (15 ca)</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "form" && (
        <EnterpriseLeaveForm llmConfig={llmConfig} onResult={handleFormResult} />
      )}
      {activeTab === "audit" && (
        <EnterpriseAuditTrail entries={auditEntries} onOverride={handleOverride} />
      )}
      {activeTab === "verify" && (
        <EnterpriseVerifyHarness onResults={handleVerifyResults} llmConfig={llmConfig} />
      )}
    </div>
  );
}
