import { useState } from "react";
import { CASE_FOLDERS, type CaseFolderItem } from "../core/data/caseFolders";
import { inspectMedicalEvidenceWithVLM, type VlmInspectionResult } from "../core/agent/vlmClient";
import { refereeAgent } from "../core/agent/EscalationRefereeAgent";
import type { LocalLlmConfig } from "../core/agent/localLlmClient";
import type { EvaluateResponse } from "../domains/enterprise/types";

interface CaseEvaluationState {
  checking: boolean;
  vlmResult?: VlmInspectionResult;
  refereeDecision?: EvaluateResponse;
  managerAction?: "APPROVED" | "REJECTED" | null;
}

interface ReviewerPortalProps {
  domain: "enterprise" | "academic";
  llmConfig: LocalLlmConfig;
}

export default function ReviewerPortal({ domain, llmConfig }: ReviewerPortalProps) {
  const isEnterprise = domain === "enterprise";
  const approverRoleName = isEnterprise
    ? "Cấp Trên (Trưởng Phòng / HR)"
    : "Cấp Trên (Trưởng Khoa / Ban Đào Tạo)";

  // Lọc đúng danh sách case theo ngữ cảnh Doanh nghiệp hoặc Trường học
  const domainCases = CASE_FOLDERS.filter((c) =>
    isEnterprise ? c.applicantRole === "employee" : c.applicantRole === "student"
  );

  const [selectedCaseId, setSelectedCaseId] = useState<string>(domainCases[0]?.id || "");
  const [evalStates, setEvalStates] = useState<Record<string, CaseEvaluationState>>({});
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  const activeCase =
    domainCases.find((c) => c.id === selectedCaseId) || domainCases[0] || CASE_FOLDERS[0];
  const activeState = evalStates[activeCase.id] || { checking: false };

  // Agent Check cho 1 case cụ thể (chạy trực tiếp VLM 4b + Referee Agent)
  async function runAgentCheck(c: CaseFolderItem) {
    setEvalStates((prev) => ({
      ...prev,
      [c.id]: { ...prev[c.id], checking: true },
    }));

    try {
      let vlmRes: VlmInspectionResult | undefined = undefined;

      // 1. Chạy VLM thật bằng model qwen3-vl:4b nếu có file ảnh
      if (c.evidenceFiles.length > 0 && c.evidenceFiles[0].fileType === "image") {
        vlmRes = await inspectMedicalEvidenceWithVLM(c.evidenceFiles[0].filePath, "qwen3-vl:4b");
      }

      // 2. Chạy Escalation Referee Agent đối chiếu
      const isMissingEvidence = c.evidenceFiles.length === 0;
      const isOverAuthority = c.leaveType === "Xin bảo lưu học kỳ" || c.durationLabel.includes("20 ngày");
      const isUnclearDate = c.notes.includes("không xác định được ngày") || c.notes.includes("mờ");
      const durationVal = c.durationLabel.includes("20 ngày") ? 20 : c.applicantRole === "student" ? 1 : 10;

      const agentRes = await refereeAgent.evaluateAsync(
        {
          domain: isEnterprise ? "enterprise" : "academic",
          subjectId: c.applicantId,
          subjectName: c.applicantName,
          organizationUnit: c.departmentOrFaculty,
          leaveType: c.leaveType,
          fromDate: c.fromDate,
          toDate: c.toDate,
          durationDaysOrSessions: isOverAuthority ? 20 : durationVal,
          docStatus: isUnclearDate ? "UNCLEAR_DATE" : isMissingEvidence ? "MISSING" : "VALID",
          reasonText: c.reason,
          notesText: `${c.notes}. VLM soi mộc: ${
            vlmRes
              ? `Mộc đỏ: ${vlmRes.hasRedStamp ? "CÓ" : "KHÔNG"}, Chữ ký: ${
                  vlmRes.hasDoctorSignature ? "CÓ" : "KHÔNG"
                } (${vlmRes.doctorName})`
              : "Không có file ảnh"
          }`,
        },
        llmConfig
      );

      const decision: EvaluateResponse = {
        requestId: agentRes.decisionId,
        decision: agentRes.outcome,
        policyBasis: agentRes.policyBasis,
        escalationQuestion: agentRes.escalationQuestion,
        triggerCategory: agentRes.uncertaintyCategory,
        timestamp: agentRes.timestamp,
        reasoningTrace: agentRes.reasoningTrace,
      };

      setEvalStates((prev) => ({
        ...prev,
        [c.id]: {
          checking: false,
          vlmResult: vlmRes,
          refereeDecision: decision,
          managerAction: null,
        },
      }));
    } catch (e) {
      console.error(e);
      setEvalStates((prev) => ({
        ...prev,
        [c.id]: { ...prev[c.id], checking: false },
      }));
    }
  }

  // Agent Check All: Lần lượt chạy thẩm định toàn bộ các hồ sơ trong domain hiện tại
  async function runAgentCheckAll() {
    setIsCheckingAll(true);
    for (const c of domainCases) {
      setSelectedCaseId(c.id);
      await runAgentCheck(c);
    }
    setIsCheckingAll(false);
  }

  function handleManagerAction(caseId: string, action: "APPROVED" | "REJECTED") {
    setEvalStates((prev) => ({
      ...prev,
      [caseId]: {
        ...prev[caseId],
        managerAction: action,
      },
    }));
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              🛡️ {approverRoleName}
            </span>
            <span className="text-xs text-slate-400">
              VLM Engine: <strong className="text-amber-300 font-mono">qwen3-vl:4b (Local)</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold font-display mt-2 text-white">
            Bảng Điều Khiển Xét Duyệt Đơn &amp; Bằng Chứng
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Mỗi ca được lưu trữ trong một thư mục riêng biệt. Cấp trên có thể bấm <strong>"Agent Check"</strong> để AI quét OCR và chạy trực tiếp mô hình thị giác <strong>qwen3-vl:4b</strong> kiểm tra con dấu đỏ + chữ ký bác sĩ tại chỗ.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={runAgentCheckAll}
            disabled={isCheckingAll}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            {isCheckingAll ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Đang Quét Toàn Bộ...</span>
              </>
            ) : (
              <>
                <span>⚡⚡</span>
                <span>Agent Check All ({domainCases.length} Cases)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Reviewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cases List with Individual Agent Check Buttons */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Danh Sách Hồ Sơ Nghỉ ({domainCases.length})
            </span>
            <span className="text-[11px] text-slate-400">Click để đối soát</span>
          </div>

          <div className="space-y-2">
            {domainCases.map((c) => {
              const isSelected = activeCase.id === c.id;
              const state = evalStates[c.id];
              const isDone = Boolean(state?.refereeDecision);
              const isApproved = state?.refereeDecision?.decision === "AUTO_APPROVE";

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 shadow-sm ring-1 ring-blue-600/30"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-mono font-bold text-blue-700">
                      📁 {c.folderName}
                    </span>

                    {/* Badge status */}
                    {isDone ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isApproved ? "✓ Hợp lệ" : "⚠️ Escalate"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Chưa Check
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{c.applicantName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {c.applicantId} · {c.leaveType} ({c.durationLabel})
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-150 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500">
                      📄 1 PDF {c.evidenceFiles.length > 0 ? `· 🩺 ${c.evidenceFiles.length} Ảnh` : ""}
                    </span>

                    {/* Single Agent Check Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseId(c.id);
                        runAgentCheck(c);
                      }}
                      disabled={state?.checking}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 hover:bg-slate-900 text-white cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                    >
                      {state?.checking ? (
                        <>
                          <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>Agent Check</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Focused Case Review Details & VLM Inspector */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card p-5 space-y-4">
            {/* Header of Active Case */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hồ Sơ Đang Xem:
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeCase.applicantName} ({activeCase.applicantId}) — {activeCase.departmentOrFaculty}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => runAgentCheck(activeCase)}
                disabled={activeState.checking}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {activeState.checking ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Qwen3-VL:4b Đang Soi Bằng Chứng...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Chạy Agent Check Cho Case Này</span>
                  </>
                )}
              </button>
            </div>

            {/* Side-by-side: PDF & Evidence Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document 1: PDF */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>📄</span>
                    <span>File Đơn PDF</span>
                  </span>
                  <a
                    href={activeCase.pdfFile.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline font-bold"
                  >
                    Xem PDF Gốc ↗
                  </a>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div><strong>Mã văn bản:</strong> {activeCase.pdfFile.docCode}</div>
                  <div><strong>Loại nghỉ:</strong> {activeCase.leaveType}</div>
                  <div><strong>Thời gian:</strong> {activeCase.fromDate} → {activeCase.toDate} ({activeCase.durationLabel})</div>
                  <div><strong>Lý do:</strong> {activeCase.reason}</div>
                  <div><strong>Ghi chú:</strong> {activeCase.notes}</div>
                </div>
              </div>

              {/* Document 2: Evidence Image with VLM live check */}
              <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    <span>🩺</span>
                    <span>Bằng Chứng Y Tế Đi Kèm</span>
                  </span>
                  {activeCase.evidenceFiles[0] && (
                    <a
                      href={activeCase.evidenceFiles[0].filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-700 hover:underline font-bold"
                    >
                      Mở Ảnh Gốc ↗
                    </a>
                  )}
                </div>

                {activeCase.evidenceFiles.length > 0 ? (
                  <div className="bg-white p-3 rounded-lg border border-indigo-200 text-xs space-y-2">
                    <div className="flex items-center justify-center p-1 bg-slate-50 rounded border border-slate-200 max-h-36 overflow-hidden">
                      <img
                        src={activeCase.evidenceFiles[0].filePath}
                        alt="Bằng chứng"
                        className="max-h-32 object-contain"
                      />
                    </div>

                    {/* VLM Result Status */}
                    {activeState.vlmResult ? (
                      <div className="space-y-2 pt-1 text-[11px] border-t border-slate-150">
                        <div className="text-[10px] font-bold text-indigo-600 uppercase flex items-center justify-between">
                          <span>🔍 Qwen3-VL:4b OCR &amp; Thẩm Định:</span>
                          <span className="text-slate-400 font-mono">({activeState.vlmResult.executionTimeSec}s)</span>
                        </div>
                        
                        {/* Legal Badges */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-700">Mộc đỏ:</span>
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                activeState.vlmResult.hasRedStamp
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {activeState.vlmResult.hasRedStamp ? "✓ CÓ MỘC ĐỎ" : "✕ Không có"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-700">Chữ ký:</span>
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                activeState.vlmResult.hasDoctorSignature
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {activeState.vlmResult.hasDoctorSignature ? "✓ CÓ CHỮ KÝ" : "✕ Không có"}
                            </span>
                          </div>
                        </div>

                        {/* OCR Text Extracted Box */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                          <span className="font-bold text-[10px] text-slate-600 uppercase tracking-wider block">
                            📋 Văn bản đọc được từ ảnh (OCR):
                          </span>
                          <div className="text-[11px] text-slate-700 space-y-0.5">
                            {activeState.vlmResult.patientName && (
                              <div>• <strong>Họ tên:</strong> {activeState.vlmResult.patientName}</div>
                            )}
                            {activeState.vlmResult.hospitalOrClinic && (
                              <div>• <strong>Cơ sở y tế:</strong> {activeState.vlmResult.hospitalOrClinic}</div>
                            )}
                            {activeState.vlmResult.diagnosisText && (
                              <div>• <strong>Chẩn đoán:</strong> {activeState.vlmResult.diagnosisText}</div>
                            )}
                            {activeState.vlmResult.daysGranted && (
                              <div>• <strong>Số ngày nghỉ chỉ định:</strong> {activeState.vlmResult.daysGranted} ngày ({activeState.vlmResult.fromDate} - {activeState.vlmResult.toDate})</div>
                            )}
                            {activeState.vlmResult.doctorName && (
                              <div>• <strong>Bác sĩ / Người ký:</strong> {activeState.vlmResult.doctorName}</div>
                            )}
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {activeState.vlmResult.summary}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-500 text-center">
                        Bấm <strong>Agent Check</strong> để mô hình VLM 4b đọc toàn bộ chữ trên ảnh và kiểm tra dấu mộc + chữ ký.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/80 p-6 rounded-lg border border-amber-300 text-center space-y-1.5">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-xs font-bold text-amber-900">
                      Thư mục này không có bằng chứng y tế đính kèm
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Hồ sơ xin nghỉ không nộp kèm ảnh chứng nhận BHXH hoặc giấy ra viện.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Referee Decision Card */}
            {activeState.refereeDecision ? (
              <div
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  activeState.refereeDecision.decision === "AUTO_APPROVE"
                    ? "bg-emerald-50/80 border-emerald-300"
                    : "bg-amber-50/80 border-amber-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        activeState.refereeDecision.decision === "AUTO_APPROVE"
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500 text-slate-950"
                      }`}
                    >
                      {activeState.refereeDecision.decision === "AUTO_APPROVE"
                        ? "✓ Đủ Điều Kiện Tự Động Phê Duyệt"
                        : "⚠️ Kích Hoạt Điểm Dừng (Escalate)"}
                    </span>
                    {activeState.refereeDecision.triggerCategory && (
                      <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-amber-400 text-amber-900 rounded-md">
                        {activeState.refereeDecision.triggerCategory}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeState.refereeDecision.requestId}
                  </span>
                </div>

                <div className="text-xs text-slate-800 space-y-1">
                  <div>
                    <strong>Căn cứ đối chiếu quy chế:</strong> {activeState.refereeDecision.policyBasis}
                  </div>
                  {activeState.refereeDecision.escalationQuestion && (
                    <div className="bg-white p-3 rounded-lg border border-amber-300 font-medium text-amber-950 mt-2">
                      <span className="font-bold text-amber-800 block text-[11px] uppercase tracking-wider mb-1">
                        Câu hỏi phân xử chuyển Cấp Trên:
                      </span>
                      👉 {activeState.refereeDecision.escalationQuestion}
                    </div>
                  )}
                </div>

                {/* Manager Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/60">
                  {activeState.managerAction ? (
                    <span className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-300">
                      ✓ Đã thực hiện: {activeState.managerAction === "APPROVED" ? "KÝ DUYỆT PHÊ CHUẨN" : "TỪ CHỐI ĐƠN"}
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleManagerAction(activeCase.id, "REJECTED")}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-red-50 text-red-700 border border-red-300 cursor-pointer"
                      >
                        ✕ Từ Chối Đơn
                      </button>
                      <button
                        type="button"
                        onClick={() => handleManagerAction(activeCase.id, "APPROVED")}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                      >
                        ✍️ Ký Duyệt Phê Chuẩn
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                Chưa chạy thẩm định. Bấm <strong>Agent Check</strong> ở trên để xem kết quả phân xử.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
