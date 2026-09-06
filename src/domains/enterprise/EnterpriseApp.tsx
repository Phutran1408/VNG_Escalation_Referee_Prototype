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

interface ScannedLegalDoc {
  id: string;
  pdfFile: string;
  docTitle: string;
  employeeInfo: string;
  docCode: string;
  summary: string;
  badge: string;
  badgeColor: string;
  charsExtracted: number;
  ocrConfidence: number;
  data: FormState;
}

const SCANNED_LEGAL_DOCUMENTS: ScannedLegalDoc[] = [
  {
    id: "DOC-01",
    pdfFile: "don_nghi_om_truong_minh_tri.pdf",
    docTitle: "Đơn Xin Nghỉ Ốm Phẫu Thuật (6 ngày)",
    employeeInfo: "Trương Minh Trí (NV-2020-0019) · Phòng Kinh doanh",
    docCode: "BM-HR-01 · VB-2025-0012",
    summary: "Nghỉ mổ ruột thừa 6 ngày, kèm Giấy ra viện nhưng CHƯA CÓ mẫu C65-HD (BHXH).",
    badge: "Thiếu chứng từ C65-HD (BHXH)",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    charsExtracted: 1145,
    ocrConfidence: 99.4,
    data: {
      employeeId: "NV-2020-0019",
      employeeName: "Trương Minh Trí",
      department: "Phòng Kinh doanh",
      leaveType: "Nghỉ ốm/chế độ",
      fromDate: "2025-11-01",
      toDate: "2025-11-07",
      reason: "Nghỉ ốm phẫu thuật ruột thừa tại Bệnh viện Nhân dân Gia Định.",
      notes: "Giấy ra viện. Chưa nộp Giấy chứng nhận nghỉ việc hưởng BHXH (mẫu C65-HD).",
    },
  },
  {
    id: "DOC-02",
    pdfFile: "don_nghi_khong_luong_hoang_van_binh.pdf",
    docTitle: "Đơn Nghỉ Không Lương Dài Hạn (20 ngày)",
    employeeInfo: "Hoàng Văn Bình (NV-2021-0034) · Phòng Vận hành",
    docCode: "BM-HR-01 · VB-2025-0034",
    summary: "Nghỉ chăm sóc người thân bệnh nặng 20 ngày, vượt thẩm quyền cấp Phòng, cần TGĐ duyệt.",
    badge: "Vượt thẩm quyền (> 5 ngày)",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    charsExtracted: 1220,
    ocrConfidence: 99.1,
    data: {
      employeeId: "NV-2021-0034",
      employeeName: "Hoàng Văn Bình",
      department: "Phòng Vận hành",
      leaveType: "Nghỉ không lương",
      fromDate: "2025-11-10",
      toDate: "2025-12-05",
      reason: "Xin nghỉ không lương dài hạn để chăm sóc người thân bị bệnh nặng.",
      notes: "Bản cam kết bàn giao tiến độ vận hành. Thời gian nghỉ 20 ngày làm việc liên tục.",
    },
  },
  {
    id: "DOC-03",
    pdfFile: "don_phep_nam_nguyen_thi_huong.pdf",
    docTitle: "Đơn Nghỉ Phép Năm Hợp Lệ (1 ngày)",
    employeeInfo: "Nguyễn Thị Hương (NV-2024-0312) · Phòng Kinh doanh",
    docCode: "BM-HR-01 · VB-2025-0089",
    summary: "Nghỉ phép năm 1 ngày nộp trước 3 ngày, còn đủ 4 ngày phép, hồ sơ đầy đủ.",
    badge: "Đủ điều kiện tự động duyệt",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    charsExtracted: 1080,
    ocrConfidence: 99.8,
    data: {
      employeeId: "NV-2024-0312",
      employeeName: "Nguyễn Thị Hương",
      department: "Phòng Kinh doanh",
      leaveType: "Nghỉ phép năm",
      fromDate: "2025-10-15",
      toDate: "2025-10-15",
      reason: "Nghỉ phép năm theo kế hoạch cá nhân, nộp trước 3 ngày làm việc.",
      notes: "Xác nhận số dư phép năm còn 4 ngày hợp lệ. Không ảnh hưởng tiến độ nhóm.",
    },
  },
];

interface LeaveFormProps {
  llmConfig?: Partial<LocalLlmConfig>;
  onResult: (res: EvaluateResponse, form: FormState) => void;
  onOverride?: (requestId: string) => void;
}

function EnterpriseLeaveForm({ llmConfig, onResult, onOverride }: LeaveFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateResponse | null>(null);

  // OCR & Document scan state
  const [selectedDoc, setSelectedDoc] = useState<ScannedLegalDoc | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(false);

  // Manager action state on Escalated Dossier
  const [managerAction, setManagerAction] = useState<"APPROVED" | "REJECTED" | null>(null);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setResult(null);
    setManagerAction(null);
  }

  async function handleOcrScan(doc: ScannedLegalDoc) {
    setSelectedDoc(doc);
    setIsScanning(true);
    setOcrCompleted(false);
    setResult(null);
    setManagerAction(null);

    // Mô phỏng quá trình quét OCR bóc tách văn bản PDF (500ms)
    await new Promise((r) => setTimeout(r, 600));

    setForm({ ...doc.data });
    setIsScanning(false);
    setOcrCompleted(true);
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
                Nộp đơn qua PDF Scan chuẩn chỉnh ➔ OCR bóc tách dữ liệu ➔ AI Phân xử đối chiếu Quy chế
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Quy trình 4 bước khép kín</span>
            </div>
          </div>

          {/* 3 Scanned Documents OCR Selection */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>📎</span>
                <span>Tài Liệu Đơn Scan Pháp Lý (Thử nghiệm OCR Bóc Tách Thực Tế):</span>
              </span>
              <span className="text-slate-400 text-[11px]">
                Chọn văn bản để quét OCR tự động điền form
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {SCANNED_LEGAL_DOCUMENTS.map((doc) => {
                const isChosen = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between gap-2 ${
                      isChosen
                        ? "border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono-data font-bold text-slate-500">
                          {doc.docCode}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${doc.badgeColor}`}>
                          {doc.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                        {doc.docTitle}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        {doc.employeeInfo}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {doc.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 text-xs font-semibold">
                      <a
                        href={`/documents/${doc.pdfFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] cursor-pointer transition-colors shadow-2xs"
                        title="Mở file PDF thực tế được sinh ra"
                      >
                        <span>👁️</span>
                        <span>Xem PDF</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleOcrScan(doc)}
                        disabled={isScanning}
                        className={`flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md text-[11px] cursor-pointer transition-colors shadow-2xs ${
                          isChosen
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-slate-800 hover:bg-slate-900 text-white"
                        }`}
                      >
                        <span>🔍</span>
                        <span>Quét OCR &amp; Điền</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* OCR Scanning Progress Animation */}
        {isScanning && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900">
            <div className="flex items-center gap-2 font-mono-data">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <span>
                🔍 Đang quét laser OCR văn bản <strong>{selectedDoc?.docTitle}</strong> · Bóc tách họ tên, mã NV, loại nghỉ, ngày &amp; chứng từ đính kèm...
              </span>
            </div>
            <span className="font-bold text-blue-700">Đang nhận diện ký tự...</span>
          </div>
        )}

        {/* OCR Success Banner */}
        {ocrCompleted && selectedDoc && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">✓ OCR Thành Công:</span>
              <span>
                Đã trích xuất {selectedDoc.charsExtracted} ký tự từ tệp <strong>{selectedDoc.pdfFile}</strong> · Độ tin cậy OCR: {selectedDoc.ocrConfidence}%
              </span>
            </div>
            <a
              href={`/documents/${selectedDoc.pdfFile}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-900 font-bold hover:underline flex items-center gap-1"
            >
              <span>Đối chiếu file PDF gốc</span>
              <span>↗</span>
            </a>
          </div>
        )}

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
              <label className={labelCls}>Loại nghỉ phép đề nghị</label>
              <select
                className={inputCls}
                value={form.leaveType}
                onChange={(e) => set("leaveType", e.target.value as LeaveType)}
              >
                <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                <option value="Nghỉ ốm/chế độ">Nghỉ ốm/chế độ</option>
                <option value="Nghỉ không lương">Nghỉ không lương</option>
                <option value="Nghỉ việc riêng">Nghỉ việc riêng</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Từ ngày (Bắt đầu nghỉ) *</label>
              <input
                type="date"
                className={inputCls}
                value={form.fromDate}
                onChange={(e) => set("fromDate", e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Đến ngày (Hết ngày nghỉ) *</label>
              <input
                type="date"
                className={inputCls}
                value={form.toDate}
                onChange={(e) => set("toDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Lý do xin nghỉ phép *</label>
            <textarea
              className={inputCls}
              rows={2}
              placeholder="VD: Nghỉ phép năm theo kế hoạch cá nhân..."
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Hồ sơ, minh chứng đính kèm &amp; Ghi chú đối soát</label>
            <textarea
              className={inputCls}
              rows={2}
              placeholder="VD: Giấy ra viện có dấu mộc; Giấy chứng nhận BHXH mẫu C65-HD..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              * Dữ liệu trích xuất từ văn bản PDF được tự động phân tích theo Quy chế Nhân sự
            </span>
            <button
              type="submit"
              disabled={loading || isScanning}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Lõi Agent Đang Thẩm Định…
                </>
              ) : (
                "Thẩm Định Đơn Nhân Sự (AI Referee)"
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
              <div className="space-y-4 flex-1">
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

                {/* ── FORMAL LEGAL ESCALATION REFERRAL DOSSIER (KHI CA BỊ ESCALATE) ── */}
                {result.decision === "ESCALATE" && (
                  <div className="bg-white border-2 border-amber-400 rounded-2xl p-5 shadow-md space-y-4 font-sans">
                    {/* Dossier Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM · ĐỘC LẬP - TỰ DO - HẠNH PHÚC
                        </div>
                        <h3 className="font-extrabold text-sm sm:text-base text-amber-950 uppercase mt-0.5">
                          PHIẾU CHUYỂN TIẾP HỒ SƠ LÊN CẤP CÓ THẨM QUYỀN
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Hồ sơ thẩm định tự động phát hiện độ bất định cần phê duyệt ngoại lệ
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono-data font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded border border-amber-300">
                          Mã hồ sơ: HS-ESC-2025-{form.employeeId}
                        </span>
                      </div>
                    </div>

                    {/* Dossier Meta Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                      <div>
                        <span className="text-slate-500">Người làm đơn:</span>{" "}
                        <strong className="text-slate-900">{form.employeeName} ({form.employeeId})</strong>
                        <div className="text-slate-600 mt-0.5">{form.department} · {form.leaveType}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Cấp có thẩm quyền giải quyết:</span>{" "}
                        <strong className="text-blue-900 block mt-0.5">
                          {result.triggerCategory === "Vượt thẩm quyền"
                            ? "Ban Tổng Giám Đốc / Giám Đốc Khối (Điều 18.3)"
                            : result.triggerCategory === "Không chắc dữ kiện"
                            ? "Phòng Nhân Sự (HR) & Quản lý trực tiếp (Điều 14.2 & 14.3)"
                            : "Giám Đốc Nhân Sự (HRD) — Xét duyệt ngoại lệ (Điều 8.2)"}
                        </strong>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-2 pt-1 border-t border-amber-200/60">
                        <span className="text-slate-500">Văn bản gốc đính kèm:</span>
                        {selectedDoc ? (
                          <a
                            href={`/documents/${selectedDoc.pdfFile}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <span>📄 {selectedDoc.pdfFile} (Bản scan PDF có mộc)</span>
                            <span>↗</span>
                          </a>
                        ) : (
                          <span className="text-slate-600 italic">Đơn điện tử nội bộ</span>
                        )}
                      </div>
                    </div>

                    {/* Single-turn Actionable AI Question */}
                    <div className="p-3.5 bg-amber-100/90 border border-amber-300 rounded-xl space-y-1.5">
                      <span className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
                        <span>❓</span>
                        <span>Ý Kiến Đề Xuất Phê Duyệt 1 Lượt Của AI Referee:</span>
                      </span>
                      <p className="text-sm font-bold text-amber-950 bg-white p-3 rounded-lg border border-amber-200 leading-relaxed shadow-2xs">
                        "{result.escalationQuestion}"
                      </p>
                    </div>

                    {/* Manager Action & Signature Area */}
                    <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        {managerAction === "APPROVED" ? (
                          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                            <span>✓ ĐÃ KÝ DUYỆT NGOẠI LỆ BỞI CẤP CÓ THẨM QUYỀN</span>
                            <span className="text-[10px] font-mono-data text-emerald-700">({new Date().toLocaleTimeString("vi-VN")})</span>
                          </div>
                        ) : managerAction === "REJECTED" ? (
                          <div className="inline-flex items-center gap-2 bg-red-100 text-red-900 border border-red-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                            <span>✕ ĐÃ BÁC ĐƠN &amp; YÊU CẦU BỔ SUNG CHỨNG TỪ</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            Dành cho Cấp có thẩm quyền ký duyệt trực tiếp hồ sơ:
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                        >
                          🖨️ In Phiếu Trình Ký
                        </button>
                        {managerAction === null && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setManagerAction("REJECTED");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                            >
                              ✕ Bác Đơn
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setManagerAction("APPROVED");
                                if (onOverride) onOverride(result.requestId);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                            >
                              ✍️ Ký Duyệt Ngoại Lệ
                            </button>
                          </>
                        )}
                      </div>
                    </div>
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
        <EnterpriseLeaveForm llmConfig={llmConfig} onResult={handleFormResult} onOverride={handleOverride} />
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
