import { useState } from "react";
import type { AuditEntry } from "./types";

interface Props {
  entries: AuditEntry[];
  onOverride: (requestId: string) => void;
  onClear?: () => void;
}

function DecisionCell({ entry }: { entry: AuditEntry }) {
  if (entry.overridden) {
    return (
      <div>
        <span className="badge badge-override">✎ Can thiệp bởi Giảng viên/Trưởng khoa</span>
        <p className="text-[10px] text-slate-400 mt-1 font-mono-data">Đã đảo ngược quyết định gốc</p>
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

export default function AuditTrail({ entries, onOverride, onClear }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"ALL" | "APPROVE" | "ESCALATE" | "OVERRIDDEN">("ALL");

  const filtered = entries.filter((e) => {
    const matchText =
      e.studentInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.requestId.toLowerCase().includes(searchTerm.toLowerCase());

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
    downloadAnchor.setAttribute("download", `student_leave_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <section id="audit" className="scroll-mt-6">
      <div className="card">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-700 text-slate-900">
              Nhật Ký Quyết Định & Kiểm Toán Tuân Thủ (Audit Trail)
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Ghi vết minh bạch toàn bộ quyết định của Agent SV2 · Căn cứ quy chế đào tạo · Hỗ trợ Giảng viên can thiệp
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-data text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded">
              {entries.length} bản ghi
            </span>
            {entries.some((e) => e.overridden) && (
              <span className="font-mono-data text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded">
                {entries.filter((e) => e.overridden).length} đã can thiệp
              </span>
            )}
            {entries.length > 0 && (
              <button
                type="button"
                onClick={exportJSON}
                className="text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer"
                title="Tải về file JSON toàn bộ log quyết định"
              >
                <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Xuất log JSON
              </button>
            )}
            {entries.length > 0 && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1.5 transition-colors cursor-pointer"
              >
                Xóa log
              </button>
            )}
          </div>
        </div>

        {/* Filter bar & Search */}
        {entries.length > 0 && (
          <div className="px-6 py-2.5 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(
                [
                  { key: "ALL", label: `Tất cả (${entries.length})` },
                  { key: "APPROVE", label: `Tự duyệt (${entries.filter((x) => x.decision === "AUTO_APPROVE" && !x.overridden).length})` },
                  { key: "ESCALATE", label: `Escalate (${entries.filter((x) => x.decision === "ESCALATE" && !x.overridden).length})` },
                  { key: "OVERRIDDEN", label: `Can thiệp (${entries.filter((x) => x.overridden).length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    filter === tab.key
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm MSSV, tên, môn học..."
                className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Table Body */}
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
              Chưa có bản ghi nào. Hãy bấm "Chạy Verify" hoặc nộp đơn xin nghỉ để sinh log quyết định.
            </p>
          </div>
        ) : (
          <div className="scroll-x">
            <table className="w-full text-sm min-w-[980px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  {["Mã đơn", "Thời gian (ISO-8601)", "Sinh viên & Môn học", "Quyết định Agent", "Căn cứ Quy chế & Câu hỏi Escalate", "Thao tác Can thiệp"].map((h) => (
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

                    {/* Thời gian */}
                    <td className="px-4 py-3.5 align-top font-mono-data text-xs text-slate-500 whitespace-nowrap">
                      <div>{entry.timestamp.slice(0, 10)}</div>
                      <div className="text-[11px] text-slate-400">{entry.timestamp.slice(11, 19)}Z</div>
                    </td>

                    {/* Thông tin sinh viên & môn học */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="text-xs font-600 text-slate-800">{entry.studentInfo}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{entry.faculty}</div>
                      <div className="text-[11px] text-indigo-700 font-medium mt-0.5">
                        {entry.courseName} · {entry.sessionsInfo}
                      </div>
                    </td>

                    {/* Quyết định Agent */}
                    <td className="px-4 py-3.5 align-top">
                      <DecisionCell entry={entry} />
                      <TriggerPill cat={entry.triggerCategory} />
                    </td>

                    {/* Căn cứ & câu hỏi */}
                    <td className="px-4 py-3.5 align-top max-w-sm">
                      <p className="text-xs text-slate-700 leading-relaxed">{entry.policyBasis}</p>
                      {entry.escalationQuestion && !entry.overridden && (
                        <p className="text-[11px] text-amber-950 bg-amber-100/70 border border-amber-300 rounded p-2 mt-1.5 leading-snug">
                          <strong>Câu hỏi Escalate:</strong> "{entry.escalationQuestion}"
                        </p>
                      )}
                    </td>

                    {/* Thao tác can thiệp */}
                    <td className="px-4 py-3.5 align-top">
                      {!entry.overridden ? (
                        <button
                          onClick={() => onOverride(entry.requestId)}
                          className="text-xs font-semibold text-amber-700 hover:text-white hover:bg-amber-600 border border-amber-400 rounded px-2.5 py-1 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                          title="Giảng viên/Trưởng khoa can thiệp đổi quyết định"
                        >
                          Đảo ngược quyết định
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                          ✓ Đã ghi nhận
                        </span>
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
