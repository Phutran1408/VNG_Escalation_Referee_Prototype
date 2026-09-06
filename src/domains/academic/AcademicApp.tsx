import { useState, useCallback } from "react";
import VerifyHarness from "./VerifyHarness";
import AuditTrail from "./AuditTrail";
import { refereeAgent } from "../../core/agent/EscalationRefereeAgent";
import type { LocalLlmConfig } from "../../core/agent/localLlmClient";
import type {
  AuditEntry,
  EvaluateResponse,
  VerifyResult,
  LeaveType,
  DocEvidenceStatus,
} from "./types";

// ── Helpers ─────────────────────────────────────────────────────────────────

function verifyToAudit(r: VerifyResult, idx: number): AuditEntry {
  const parts = r.summary.split(" · ");
  return {
    requestId: `VRF-STU-${r.caseId}-${Date.now() + idx}`,
    timestamp: r.timestamp,
    studentInfo: [parts[0], parts[1]].filter(Boolean).join(" · "),
    faculty: parts[2] ?? "Khoa Công nghệ Thông tin",
    courseName: parts[3] ?? "Học phần",
    sessionsInfo: parts[4] ?? "1 buổi",
    decision: r.actual,
    policyBasis:
      r.policyBasis ??
      (r.triggerCategory
        ? "Xem câu hỏi Escalate — Quy chế Đào tạo"
        : "Quy chế Đào tạo — Điều kiện tự động phê duyệt"),
    overridden: false,
    triggerCategory: r.triggerCategory,
    escalationQuestion: r.escalationQuestion,
  };
}

const LEAVE_TYPES: LeaveType[] = [
  "Nghỉ ốm điều trị",
  "Nghỉ việc riêng gia đình",
  "Nghỉ tham gia hoạt động trường",
  "Xin bảo lưu học kỳ",
];

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow";

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
  studentId: string;
  studentName: string;
  faculty: string;
  courseName: string;
  totalSessions: number;
  pastAbsences: number;
  sessionsRequested: number;
  fromDate: string;
  toDate: string;
  leaveType: LeaveType;
  docEvidenceStatus: DocEvidenceStatus;
  isSemesterDeferral: boolean;
  reason: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  studentId: "",
  studentName: "",
  faculty: "Khoa Công nghệ Thông tin",
  courseName: "Lập trình Web nâng cao",
  totalSessions: 15,
  pastAbsences: 0,
  sessionsRequested: 1,
  fromDate: "2025-10-10",
  toDate: "2025-10-10",
  leaveType: "Nghỉ ốm điều trị",
  docEvidenceStatus: "VALID",
  isSemesterDeferral: false,
  reason: "",
  notes: "",
};

const PRESETS: { label: string; tagColor: string; data: FormState }[] = [
  {
    label: "Ca 1: Thường quy (Auto-Approve)",
    tagColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    data: {
      studentId: "SV-2024-1001",
      studentName: "Nguyễn Văn An",
      faculty: "Khoa Công nghệ Thông tin",
      courseName: "Lập trình Web nâng cao",
      totalSessions: 15,
      pastAbsences: 0,
      sessionsRequested: 1,
      fromDate: "2025-10-10",
      toDate: "2025-10-10",
      leaveType: "Nghỉ ốm điều trị",
      docEvidenceStatus: "VALID",
      isSemesterDeferral: false,
      reason: "Sốt phát ban, có giấy khám bệnh Bệnh viện Quận 1.",
      notes: "Giấy khám bệnh rõ ràng ngày khám 10/10/2025, chữ ký bác sĩ đầy đủ.",
    },
  },
  {
    label: "Ca 2: Giấy khám mờ ngày",
    tagColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
    data: {
      studentId: "SV-2024-4099",
      studentName: "Phạm Đức Anh",
      faculty: "Khoa Công nghệ Thông tin",
      courseName: "Cấu trúc Dữ liệu & Giải thuật",
      totalSessions: 15,
      pastAbsences: 1,
      sessionsRequested: 1,
      fromDate: "2025-10-12",
      toDate: "2025-10-12",
      leaveType: "Nghỉ ốm điều trị",
      docEvidenceStatus: "UNCLEAR_DATE",
      isSemesterDeferral: false,
      reason: "Nghỉ ốm khám ngoại trú.",
      notes: "Giấy khám bệnh không đọc được ngày: bản chụp bị mờ nhoè phần ngày điều trị.",
    },
  },
  {
    label: "Ca 3: Đã nghỉ quá 20% số buổi",
    tagColor: "bg-rose-100 text-rose-800 border-rose-300",
    data: {
      studentId: "SV-2023-5012",
      studentName: "Hoàng Minh Tuấn",
      faculty: "Khoa Điện tử - Viễn thông",
      courseName: "Kiến trúc Máy tính",
      totalSessions: 15,
      pastAbsences: 3, // 3/15 = 20%
      sessionsRequested: 1, // Tổng 4/15 = 26.7% > 20%
      fromDate: "2025-11-20",
      toDate: "2025-11-20",
      leaveType: "Nghỉ ốm điều trị",
      docEvidenceStatus: "VALID",
      isSemesterDeferral: false,
      reason: "Tái khám sau phẫu thuật chân.",
      notes: "Đã vắng 3 buổi trước đó. Xin vắng thêm 1 buổi, tổng vắng 4 buổi (>20% môn học).",
    },
  },
  {
    label: "Ca 4: Xin bảo lưu cả học kỳ",
    tagColor: "bg-amber-100 text-amber-800 border-amber-300",
    data: {
      studentId: "SV-2022-6789",
      studentName: "Đặng Thu Hà",
      faculty: "Khoa Luật Quốc tế",
      courseName: "Toàn bộ học kỳ I (2025-2026)",
      totalSessions: 60,
      pastAbsences: 0,
      sessionsRequested: 60,
      fromDate: "2025-10-01",
      toDate: "2026-01-30",
      leaveType: "Xin bảo lưu học kỳ",
      docEvidenceStatus: "VALID",
      isSemesterDeferral: true,
      reason: "Gia đình khó khăn đột xuất, làm đơn xin bảo lưu kết quả học tập cả học kỳ.",
      notes: "Đơn xin bảo lưu cả học kỳ trọn vẹn. Thuộc thẩm quyền Trưởng khoa.",
    },
  },
];

interface LeaveFormProps {
  llmConfig?: Partial<LocalLlmConfig>;
  onResult: (res: EvaluateResponse, form: FormState) => void;
}

function StudentLeaveForm({ llmConfig, onResult }: LeaveFormProps) {
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
      // Gọi Lõi Agent Hybrid: Rule Guardrails + Local LLM Ollama
      const agentRes = await refereeAgent.evaluateAsync(
        {
          domain: "academic",
          subjectId: form.studentId,
          subjectName: form.studentName,
          organizationUnit: form.faculty,
          leaveType: form.leaveType,
          fromDate: form.fromDate,
          toDate: form.toDate,
          durationDaysOrSessions: form.sessionsRequested,
          pastAbsencesCount: form.pastAbsences,
          totalLimitOrCapacity: form.totalSessions,
          docStatus: form.docEvidenceStatus,
          isSpecialRequest: form.isSemesterDeferral,
          reasonText: form.reason,
          notesText: form.notes,
        },
        llmConfig
      );

      const totalAbsences = (Number(form.pastAbsences) || 0) + (Number(form.sessionsRequested) || 1);
      const ratio = totalAbsences / (Number(form.totalSessions) || 15);

      const res: EvaluateResponse = {
        requestId: agentRes.decisionId,
        decision: agentRes.outcome,
        policyBasis: agentRes.policyBasis,
        escalationQuestion: agentRes.escalationQuestion,
        triggerCategory: agentRes.uncertaintyCategory,
        timestamp: agentRes.timestamp,
        reasoningTrace: agentRes.reasoningTrace,
        details: {
          absenceRatio: ratio,
          maxAllowedRatio: 0.2,
          isExceeded20Percent: ratio > 0.2,
        },
      };

      setResult(res);
      onResult(res, form);
    } finally {
      setLoading(false);
    }
  }

  const currentTotalAbsences = (Number(form.pastAbsences) || 0) + (Number(form.sessionsRequested) || 1);
  const maxTotal = Math.max(1, Number(form.totalSessions) || 15);
  const currentRatio = (currentTotalAbsences / maxTotal) * 100;
  const isOver20 = currentRatio > 20;

  return (
    <section id="leave-form-academic" className="scroll-mt-6">
      <div className="card">
        {/* Card Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-700 text-slate-900">
                  Thẩm Định Đơn Xin Nghỉ Học (Lõi Agent SV2)
                </h2>
                <span className="text-[10px] font-mono-data bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">
                  Rule Guardrails + Local LLM
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Nhập thông tin tự do hoặc bấm các Ca mẫu để kiểm chứng Lõi Agent kích hoạt đúng 3 loại dừng
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyPreset(p.data)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs hover:scale-[1.02] ${p.tagColor}`}
                  title={p.label}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Mã số Sinh viên (MSSV) *</label>
              <input
                className={inputCls}
                placeholder="VD: SV-2024-1001"
                value={form.studentId}
                onChange={(e) => set("studentId", e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Họ và tên Sinh viên *</label>
              <input
                className={inputCls}
                placeholder="VD: Nguyễn Văn An"
                value={form.studentName}
                onChange={(e) => set("studentName", e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Khoa / Viện đào tạo</label>
              <input
                className={inputCls}
                placeholder="VD: Khoa Công nghệ Thông tin"
                value={form.faculty}
                onChange={(e) => set("faculty", e.target.value)}
              />
            </div>
          </div>

          {/* Absence Calculator Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Tên Học phần / Môn học *</label>
                <input
                  className={inputCls}
                  placeholder="VD: Cấu trúc Dữ liệu"
                  value={form.courseName}
                  onChange={(e) => set("courseName", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Tổng số buổi môn học</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className={inputCls}
                  value={form.totalSessions}
                  onChange={(e) => set("totalSessions", Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Số buổi đã nghỉ trước</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className={inputCls}
                  value={form.pastAbsences}
                  onChange={(e) => set("pastAbsences", Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Số buổi xin nghỉ đợt này *</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className={inputCls}
                  value={form.sessionsRequested}
                  onChange={(e) => set("sessionsRequested", Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Tổng vắng dự kiến: <strong className="text-slate-900">{currentTotalAbsences} / {maxTotal} buổi</strong>
                </span>
                <span className={`font-bold ${isOver20 ? "text-rose-600" : "text-emerald-700"}`}>
                  Tỷ lệ vắng: {currentRatio.toFixed(1)}% {isOver20 ? "(⚠️ Vượt mức cho phép > 20% — Nguy cơ cấm thi)" : "(✓ Trong hạn mức chuyên cần <= 20%)"}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-300 ${isOver20 ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(100, currentRatio)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono-data">
                <span>0%</span>
                <span className="text-amber-600 font-semibold">| Mốc 20% Quy chế</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Loại đơn xin nghỉ *</label>
              <select
                className={inputCls}
                value={form.leaveType}
                onChange={(e) => {
                  const val = e.target.value as LeaveType;
                  set("leaveType", val);
                  if (val === "Xin bảo lưu học kỳ") {
                    set("isSemesterDeferral", true);
                  }
                }}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Minh chứng / Giấy khám bệnh *</label>
              <select
                className={inputCls}
                value={form.docEvidenceStatus}
                onChange={(e) => set("docEvidenceStatus", e.target.value as DocEvidenceStatus)}
              >
                <option value="VALID">Có giấy khám bệnh rõ ràng ngày tháng</option>
                <option value="UNCLEAR_DATE">Giấy khám mờ / không đọc được ngày</option>
                <option value="MISSING">Chưa có giấy tờ đính kèm</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded-lg w-full">
                <input
                  type="checkbox"
                  checked={form.isSemesterDeferral}
                  onChange={(e) => set("isSemesterDeferral", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Đơn xin bảo lưu cả học kỳ (Dài hạn)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="VD: Sốt cao cần nghỉ điều trị tại nhà..."
                value={form.reason}
                onChange={(e) => set("reason", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Ghi chú minh chứng đính kèm</label>
              <textarea
                rows={2}
                className={inputCls}
                placeholder="VD: Giấy khám bệnh không đọc được ngày..."
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
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" fill="none" />
                  </svg>
                  Lõi Agent Đang Phân Xử…
                </>
              ) : (
                "Thẩm Định Đơn Sinh Viên (Hybrid Agent)"
              )}
            </button>
          </div>
        </form>

        {/* Evaluation Result Display */}
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
                    KẾT QUẢ PHÂN XỬ LÕI AGENT:
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
                  <strong>Căn cứ Quy chế:</strong> {result.policyBasis}
                </div>

                {/* Escalation Question Box */}
                {result.escalationQuestion && (
                  <div className="p-4 bg-amber-100/90 border-2 border-amber-300 rounded-xl shadow-xs space-y-2">
                    <span className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5">
                      ❓ Câu hỏi Escalate cho Giảng viên / Trưởng khoa:
                    </span>
                    <div className="text-sm font-bold text-amber-950 bg-white/80 p-3 rounded-lg border border-amber-200 leading-snug">
                      "{result.escalationQuestion}"
                    </div>
                  </div>
                )}

                {/* Reasoning Trace Steps (Chuỗi suy luận logic SV2) */}
                {result.reasoningTrace && result.reasoningTrace.length > 0 && (
                  <div className="bg-white/70 border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
                      🔍 Chuỗi Suy Luận Quyết Định (Reasoning Trace — SV2):
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

// ── Academic View Component ────────────────────────────────────────────────

interface AcademicAppProps {
  llmConfig?: Partial<LocalLlmConfig>;
}

export default function AcademicApp({ llmConfig }: AcademicAppProps) {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  const handleVerifyResults = useCallback((results: VerifyResult[]) => {
    const newEntries = results.map((r, i) => verifyToAudit(r, i));
    setAuditEntries((prev) => [...newEntries, ...prev]);
  }, []);

  const handleFormResult = useCallback((res: EvaluateResponse, form: FormState) => {
    const entry: AuditEntry = {
      requestId: res.requestId,
      timestamp: res.timestamp,
      studentInfo: `${form.studentId} · ${form.studentName}`,
      faculty: form.faculty,
      courseName: form.courseName,
      sessionsInfo: `Xin nghỉ ${form.sessionsRequested} buổi (Tổng ${form.pastAbsences + form.sessionsRequested}/${form.totalSessions})`,
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

  const handleClearAudit = useCallback(() => {
    setAuditEntries([]);
  }, []);

  return (
    <div className="space-y-8">
      <VerifyHarness onResults={handleVerifyResults} />
      <StudentLeaveForm llmConfig={llmConfig} onResult={handleFormResult} />
      <AuditTrail
        entries={auditEntries}
        onOverride={handleOverride}
        onClear={handleClearAudit}
      />
    </div>
  );
}
