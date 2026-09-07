import { useState } from "react";

interface ApplicantPortalProps {
  domain: "enterprise" | "academic";
}

export default function ApplicantPortal({ domain }: ApplicantPortalProps) {
  const [applicantName, setApplicantName] = useState("");
  const [applicantId, setApplicantId] = useState("");
  const [departmentOrFaculty, setDepartmentOrFaculty] = useState("");
  const [leaveType, setLeaveType] = useState("Nghỉ ốm / Chế độ BHXH");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [submittedFolder, setSubmittedFolder] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEnterprise = domain === "enterprise";
  const userTitle = isEnterprise ? "Nhân Viên" : "Sinh Viên";
  const orgTitle = isEnterprise ? "Phòng Ban" : "Khoa / Ngành";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pdfFile) {
      alert("Vui lòng tải lên tệp PDF đơn xin nghỉ bắt buộc!");
      return;
    }

    setIsSubmitting(true);
    // Simulate folder packaging & upload
    await new Promise((r) => setTimeout(r, 1000));
    const folderCode = `case_${applicantId ? applicantId.toLowerCase().replace(/[^a-z0-9]/g, "_") : "demo"}_${Date.now().toString().slice(-4)}`;
    setSubmittedFolder(folderCode);
    setIsSubmitting(false);
  }

  function handleReset() {
    setApplicantName("");
    setApplicantId("");
    setDepartmentOrFaculty("");
    setFromDate("");
    setToDate("");
    setReason("");
    setPdfFile(null);
    setEvidenceFiles([]);
    setSubmittedFolder(null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            👤 Cổng Nộp Đơn — {userTitle}
          </span>
          <span className="text-xs text-blue-200">Bảo mật thông tin &amp; Phân quyền riêng tư</span>
        </div>
        <h2 className="text-2xl font-bold font-display mt-2">
          Nộp Hồ Sơ &amp; Bằng Chứng Xin Nghỉ Phép
        </h2>
        <p className="text-sm text-blue-100 mt-1 leading-relaxed">
          Mỗi lần xin nghỉ là một <strong>thư mục hồ sơ riêng</strong> gồm: <strong>1 file PDF đơn xin nghỉ</strong> và <strong>các tài liệu minh chứng bổ sung</strong> (ảnh giấy viện, mộc đỏ, chữ ký bác sĩ). Cấp dưới chỉ quản lý việc nộp hồ sơ của mình mà không thấy danh sách của nhân viên khác.
        </p>
      </div>

      {submittedFolder ? (
        <div className="card p-8 text-center space-y-4 bg-emerald-50/70 border border-emerald-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-xs">
            ✓
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-900">
              Hồ Sơ Đã Được Đóng Gói Và Nộp Lên Hệ Thống Thành Công!
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Thư mục tiếp nhận: <code className="bg-white px-2.5 py-1 rounded border border-slate-300 font-mono text-blue-700 font-bold">{submittedFolder}</code>
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white p-4 rounded-xl border border-emerald-200 text-xs text-left space-y-2">
            <div className="font-bold text-slate-800 text-sm border-b pb-1.5">Tóm tắt tệp đã đính kèm:</div>
            <div className="flex items-center justify-between text-slate-600">
              <span>📄 File Đơn PDF:</span>
              <span className="font-mono text-slate-900 font-medium">{pdfFile?.name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>📎 Bằng chứng đi kèm:</span>
              <span className="font-mono text-slate-900 font-medium">
                {evidenceFiles.length > 0 ? `${evidenceFiles.length} tệp (${evidenceFiles.map((f) => f.name).join(", ")})` : "Không có"}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Trạng thái:</span>
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                Chờ AI Referee &amp; Cấp Trên Thẩm Định
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white cursor-pointer"
            >
              Nộp Hồ Sơ Đơn Khác
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-6 space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>📝</span>
              <span>Điền Thông Tin Và Tải Lên Bộ Hồ Sơ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Vui lòng điền đúng thông tin để AI Referee đối chiếu tự động với file PDF và ảnh chứng từ.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Họ và tên {userTitle} *
                </label>
                <input
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={isEnterprise ? "VD: Lê Thị Phương" : "VD: Nguyễn Văn An"}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Mã số {userTitle} ({isEnterprise ? "Mã NV" : "MSSV"}) *
                </label>
                <input
                  value={applicantId}
                  onChange={(e) => setApplicantId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={isEnterprise ? "VD: NV-1981-0592" : "VD: SV-2024-1001"}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  {orgTitle}
                </label>
                <input
                  value={departmentOrFaculty}
                  onChange={(e) => setDepartmentOrFaculty(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={isEnterprise ? "Phòng Kế hoạch & QLSX" : "Khoa CNTT"}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Loại Nghỉ Phép
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Nghỉ ốm / Chế độ BHXH">Nghỉ ốm / Chế độ BHXH</option>
                  <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                  <option value="Nghỉ không lương">Nghỉ không lương</option>
                  <option value="Nghỉ việc riêng">Nghỉ việc riêng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Thời Gian Nghỉ
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-2 text-xs text-slate-800 bg-white outline-none"
                    required
                  />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-2 text-xs text-slate-800 bg-white outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Lý do xin nghỉ
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: Nhiễm SARS-COV-2 điều trị ngoại trú cách ly tại nhà theo chỉ định y tế..."
              />
            </div>

            {/* Folder Upload Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Box 1: PDF */}
              <div className="border-2 border-dashed border-blue-400 rounded-xl p-5 bg-blue-50/50 text-center space-y-2">
                <div className="text-3xl">📄</div>
                <div className="text-xs font-bold text-slate-800 uppercase">
                  1. Tệp Đơn Xin Nghỉ (.pdf) *
                </div>
                <p className="text-[11px] text-slate-500">
                  Bắt buộc 1 file PDF đơn theo mẫu chuẩn BM-HR-01
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  required
                  onChange={(e) => {
                    if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                  }}
                  className="text-xs text-slate-600 cursor-pointer"
                />
                {pdfFile && (
                  <div className="text-xs font-bold text-emerald-800 bg-emerald-100 py-1 px-2 rounded-md">
                    ✓ Đã chọn: {pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {/* Box 2: Evidence */}
              <div className="border-2 border-dashed border-indigo-400 rounded-xl p-5 bg-indigo-50/50 text-center space-y-2">
                <div className="text-3xl">🩺 📎</div>
                <div className="text-xs font-bold text-slate-800 uppercase">
                  2. Bằng Chứng Y Tế / Giấy Tờ Bổ Sung
                </div>
                <p className="text-[11px] text-slate-500">
                  Ảnh (.jpg, .png) giấy chứng nhận BHXH, giấy viện có dấu mộc &amp; chữ ký
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files) {
                      setEvidenceFiles(Array.from(e.target.files));
                    }
                  }}
                  className="text-xs text-slate-600 cursor-pointer"
                />
                {evidenceFiles.length > 0 && (
                  <div className="text-xs font-bold text-indigo-800 bg-indigo-100 py-1 px-2 rounded-md">
                    ✓ Đã nạp {evidenceFiles.length} tài liệu minh chứng
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang Đóng Gói Thư Mục &amp; Tải Lên...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Đóng Gói Thư Mục &amp; Nộp Hồ Sơ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
