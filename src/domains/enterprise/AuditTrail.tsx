import { useState } from "react";
import type { AuditEntry } from "./types";

interface Props {
  entries: AuditEntry[];
  onOverride: (requestId: string) => void;
}

function DecisionCell({ entry }: { entry: AuditEntry }) {
  if (entry.overridden) {
    return (
      <div>
        <span className="badge badge-override">✎ Overridden by HR Admin</span>
        <p className="text-[10px] text-slate-400 mt-1 font-mono-data">Đã can thiệp thủ công</p>
      </div>
    );
  }
  return entry.decision === "AUTO_APPROVE" ? (
    <span className="badge badge-approve">Tự động duyệt</span>
  ) : (
    <span className="badge badge-escalate">Escalate</span>
  );
}

function TriggerPill({ cat }: { cat?: AuditEntry["triggerCategory"] }) {
  if (!cat) return null;
  const cls =
    cat === "Không chắc dữ kiện"
      ? "trigger-fact"
      : cat === "Ngoài chính sách"
      ? "trigger-policy"
      : "trigger-authority";
  return <span className={`badge ${cls} mt-1`}>{cat}</span>;
}

export default function AuditTrail({ entries, onOverride }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"ALL" | "APPROVE" | "ESCALATE" | "OVERRIDDEN">("ALL");
  const [isEmergencyStopped, setIsEmergencyStopped] = useState(false);

  const filtered = entries.filter((e) => {
    const matchText =
      e.employeeInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.leaveType && e.leaveType.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchText) return false;

    if (filter === "APPROVE") return e.decision === "AUTO_APPROVE" && !e.overridden;
    if (filter === "ESCALATE") return e.decision === "ESCALATE" && !e.overridden;
    if (filter === "OVERRIDDEN") return e.overridden;
    return true;
  });

  function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hr_leave_audit_decision_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <section id="audit" className="scroll-mt-6">
      <div className="card">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-700 text-slate-900">Nhật Ký Kiểm Duyệt Tuân Thủ (Audit Trail)</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Audit compliance trail — toàn bộ đơn đã xử lý · Hỗ trợ Rollback / Hoàn tác thủ công bởi HR Admin
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Export JSON Button */}
            {entries.length > 0 && (
              <button
                type="button"
                onClick={exportJSON}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Tải toàn bộ file Log quyết định kiểm thử định dạng JSON"
              >
                <span>📥</span>
                <span>Xuất Log Quyết Định (JSON)</span>
              </button>
            )}

            {/* Nút Dừng Hệ Thống */}
            <button
              type="button"
              onClick={() => setIsEmergencyStopped(!isEmergencyStopped)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isEmergencyStopped
                  ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                  : "bg-white text-rose-700 border-rose-300 hover:bg-rose-50"
              }`}
              title="Dừng khẩn cấp toàn bộ luồng tự động duyệt"
            >
              <span className={`w-2 h-2 rounded-full ${isEmergencyStopped ? "bg-white" : "bg-rose-500"}`} />
              {isEmergencyStopped ? "🛑 Khôi Phục Hoạt Động" : "⛔ Dừng Khẩn Cấp"}
            </button>

            <span className="font-mono-data text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded">
              {entries.length} bản&nbsp;ghi
            </span>
            {entries.some((e) => e.overridden) && (
              <span className="font-mono-data text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded">
                {entries.filter((e) => e.overridden).length} đã can thiệp
              </span>
            )}
          </div>
        </div>

        {/* Emergency Stop Banner */}
        {isEmergencyStopped && (
          <div className="bg-rose-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-base">🛑</span>
              <span>CẢNH BÁO AN TOÀN: Quá trình tự động duyệt nhân sự đã được HR Admin TẠM DỪNG KHẨN CẤP. Toàn bộ đơn mới sẽ dừng lại để duyệt thủ công!</span>
            </div>
            <button
              onClick={() => setIsEmergencyStopped(false)}
              className="bg-white text-rose-800 text-[11px] font-extrabold px-2.5 py-1 rounded cursor-pointer hover:bg-rose-50 uppercase"
            >
              Mở lại tự động
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        {entries.length > 0 && (
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Tra cứu theo mã đơn, nhân viên, phòng ban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-2.5 top-2 text-slate-400">🔍</span>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <span className="text-slate-500 text-[11px] mr-1">Lọc:</span>
              {(["ALL", "APPROVE", "ESCALATE", "OVERRIDDEN"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f === "ALL"
                    ? `Tất cả (${entries.length})`
                    : f === "APPROVE"
                    ? `Tự duyệt (${entries.filter((e) => e.decision === "AUTO_APPROVE" && !e.overridden).length})`
                    : f === "ESCALATE"
                    ? `Escalate (${entries.filter((e) => e.decision === "ESCALATE" && !e.overridden).length})`
                    : `Đã can thiệp (${entries.filter((e) => e.overridden).length})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
                <path d="M13 21l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                <rect x="13" y="13" width="8" height="8" rx="1" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">
              Chưa có bản ghi. Chạy Verify hoặc nộp đơn để tạo nhật ký kiểm duyệt.
            </p>
          </div>
        ) : (
          <div className="scroll-x">
            <table className="w-full text-sm min-w-[980px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  {["Mã đơn", "Thời gian (ISO-8601)", "Thông tin nhân sự", "Quyết định Agent", "Căn cứ quy chế nội bộ", "Thao tác can thiệp"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-700 text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((entry) => (
                  <tr
                    key={entry.requestId}
                    className={
                      entry.overridden
                        ? "bg-slate-50 opacity-70"
                        : entry.decision === "ESCALATE"
                        ? "bg-amber-50/20 hover:bg-amber-50/40"
                        : "hover:bg-slate-50"
                    }
                  >
                    {/* Mã đơn */}
                    <td className="px-4 py-3.5 align-top">
                      <span className="font-mono-data text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded block break-all">
                        {entry.requestId}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3.5 align-top">
                      <span className="font-mono-data text-[11px] text-slate-600 block">
                        {entry.timestamp.slice(0, 10)}
                      </span>
                      <span className="font-mono-data text-[11px] text-slate-400 block">
                        {entry.timestamp.slice(11, 19)}Z
                      </span>
                    </td>

                    {/* HR info */}
                    <td className="px-4 py-3.5 align-top max-w-[200px]">
                      <p className="text-[12px] text-slate-800 font-medium leading-snug">
                        {entry.employeeInfo}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{entry.department}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 italic">{entry.leaveType}</p>
                      <TriggerPill cat={entry.triggerCategory} />
                      {entry.escalationQuestion && (
                        <p className="text-[11px] text-slate-500 italic mt-1.5 leading-snug">
                          {entry.escalationQuestion}
                        </p>
                      )}
                    </td>

                    {/* Decision */}
                    <td className="px-4 py-3.5 align-top">
                      <DecisionCell entry={entry} />
                    </td>

                    {/* Policy */}
                    <td className="px-4 py-3.5 align-top max-w-[220px]">
                      <p className="text-[12px] text-slate-500 italic leading-snug">
                        {entry.policyBasis}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 align-top">
                      {entry.overridden ? (
                        <span className="text-[11px] text-slate-400 italic font-mono-data">
                          Đã can thiệp
                        </span>
                      ) : (
                        <button
                          onClick={() => onOverride(entry.requestId)}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                          ↩ Hoàn tác / Ghi đè
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
