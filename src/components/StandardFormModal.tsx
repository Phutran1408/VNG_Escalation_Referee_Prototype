import { useState } from "react";
import type { DomainMode } from "./Header";

interface StandardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainMode;
  onApplyToForm?: (presetData: any) => void;
}

export default function StandardFormModal({
  isOpen,
  onClose,
  domain,
  onApplyToForm,
}: StandardFormModalProps) {
  const [copied, setCopied] = useState(false);
  const isEnterprise = domain === "enterprise";

  if (!isOpen) return null;

  function handleCopy() {
    const textToCopy = isEnterprise ? ENTERPRISE_FORM_TEXT : ACADEMIC_FORM_TEXT;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-base font-bold shadow-xs">
              📄
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isEnterprise
                  ? "Biểu Mẫu Chuẩn BM-HR-01 — Đơn Xin Nghỉ Phép"
                  : "Biểu Mẫu Chuẩn BM-DT-02 — Đơn Xin Nghỉ Học Tạm Thời"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEnterprise
                  ? "Ban hành theo Quy chế Quản lý Nhân sự số 18/2024/QC-NS"
                  : "Ban hành theo Quy chế Quản lý Đào tạo số 05/2024/QC-ĐT"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-900">Quy chuẩn:</span>
            <span>Đầy đủ trường pháp lý · Hỗ trợ trích xuất OCR · Đạt chuẩn lưu trữ</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <span>{copied ? "✓ Đã chép" : "📋 Sao chép mẫu"}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <span>🖨️ In / Tải PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Form Body */}
        <div className="p-6 sm:p-8 overflow-y-auto font-sans text-slate-800 leading-relaxed text-sm space-y-6">
          {/* National Emblem Format */}
          <div className="text-center space-y-1">
            <p className="font-bold uppercase tracking-wider text-xs text-slate-700">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="font-semibold text-xs text-slate-800">
              Độc lập – Tự do – Hạnh phúc
            </p>
            <div className="w-24 h-0.5 bg-slate-400 mx-auto my-2" />
            <p className="text-xs text-slate-500 italic">
              ..., ngày ..... tháng ..... năm 202...
            </p>
          </div>

          <div className="text-center pt-2">
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-slate-900">
              {isEnterprise ? "ĐƠN XIN NGHỈ PHÉP" : "ĐƠN XIN NGHỈ HỌC TẠM THỜI"}
            </h2>
            <p className="text-xs text-slate-500 font-mono-data mt-0.5">
              {isEnterprise ? "Mã biểu mẫu: BM-HR-01" : "Mã biểu mẫu: BM-DT-02"}
            </p>
          </div>

          {/* Kính gửi */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-900">Kính gửi:</p>
            {isEnterprise ? (
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>Ban Giám Đốc Khối / Ban Giám Đốc Công ty;</li>
                <li>Trưởng phòng Bộ phận trực tiếp;</li>
                <li>Phòng Nhân Sự (HR).</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>Ban Chủ nhiệm Khoa chuyên môn;</li>
                <li>Phòng Quản lý Đào tạo;</li>
                <li>Giảng viên phụ trách học phần.</li>
              </ul>
            )}
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
              <h4 className="font-bold text-xs uppercase tracking-wide text-blue-900 border-b border-slate-100 pb-1">
                1. Thông tin người làm đơn
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Họ và tên:</span>{" "}
                  <span className="font-semibold text-slate-800">....................................................................</span>
                </div>
                <div>
                  <span className="text-slate-500">{isEnterprise ? "Mã số nhân viên:" : "Mã số sinh viên (MSSV):"}</span>{" "}
                  <span className="font-semibold text-slate-800">....................................................................</span>
                </div>
                <div>
                  <span className="text-slate-500">{isEnterprise ? "Phòng ban / Bộ phận:" : "Khoa / Lớp sinh hoạt:"}</span>{" "}
                  <span className="font-semibold text-slate-800">....................................................................</span>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại liên hệ:</span>{" "}
                  <span className="font-semibold text-slate-800">....................................................................</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
              <h4 className="font-bold text-xs uppercase tracking-wide text-blue-900 border-b border-slate-100 pb-1">
                2. Nội dung đề nghị
              </h4>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <strong>Thời gian:</strong> Từ ...../...../202... đến ...../...../202...
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <strong>Độ dài:</strong> ......... {isEnterprise ? "ngày làm việc" : "buổi học"}
                  </div>
                </div>
                <p>
                  <strong>Lý do cụ thể:</strong> .............................................................................................................................................
                </p>
              </div>
            </div>

            <div className="border border-amber-200 rounded-xl p-4 space-y-2 bg-amber-50/50">
              <h4 className="font-bold text-xs uppercase tracking-wide text-amber-900 border-b border-amber-200/60 pb-1 flex items-center justify-between">
                <span>3. Danh mục minh chứng bắt buộc nộp kèm</span>
                <span className="text-[11px] font-normal lowercase text-amber-700 font-sans">
                  (Kiểm tra kỹ trước khi quét OCR)
                </span>
              </h4>
              {isEnterprise ? (
                <ul className="text-xs space-y-1.5 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">☑</span>
                    <span><strong>Nghỉ ốm hưởng BHXH:</strong> Bắt buộc có <em>Giấy chứng nhận nghỉ việc hưởng BHXH (mẫu C65-HD)</em> hoặc <em>Giấy ra viện</em> có mộc đỏ hợp lệ (Điều 14.3).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">☑</span>
                    <span><strong>Nghỉ việc riêng:</strong> Giấy đăng ký kết hôn (hưởng 3 ngày) hoặc Giấy chứng tử/cáo phó tứ thân phụ mẫu (hưởng 3 ngày) (Điều 15).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">☑</span>
                    <span><strong>Nghỉ không lương:</strong> Kèm cam kết bàn giao tiến độ công việc đầy đủ (Điều 18).</span>
                  </li>
                </ul>
              ) : (
                <ul className="text-xs space-y-1.5 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">☑</span>
                    <span><strong>Nghỉ ốm khám bệnh:</strong> Sổ khám bệnh / Giấy viện rõ ngày vào và ra, mộc cơ sở y tế (Điều 2.2).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">☑</span>
                    <span><strong>Việc riêng gia đình:</strong> Đơn xin phép có chữ ký và số CCCD của phụ huynh (Điều 1.1).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">☑</span>
                    <span><strong>Hoạt động trường:</strong> Giấy triệu tập của Đoàn trường / Ban Giám Hiệu (Điều 1.2).</span>
                  </li>
                </ul>
              )}
            </div>

            {/* Signature blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 text-center text-xs">
              <div className="p-2 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-800">Người làm đơn</p>
                <p className="text-[10px] text-slate-400 mt-0.5">(Ký & ghi rõ họ tên)</p>
                <div className="h-10" />
              </div>
              <div className="p-2 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-800">{isEnterprise ? "Người nhận bàn giao" : "Giảng viên học phần"}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">(Ký xác nhận)</p>
                <div className="h-10" />
              </div>
              <div className="p-2 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-800">{isEnterprise ? "Trưởng phòng" : "Xác nhận phụ huynh"}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">(Ký duyệt)</p>
                <div className="h-10" />
              </div>
              <div className="p-2 border border-blue-200 bg-blue-50/50 rounded-lg">
                <p className="font-bold text-blue-900">Cấp có thẩm quyền</p>
                <p className="text-[10px] text-blue-600 mt-0.5">(Ký & đóng dấu)</p>
                <div className="h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Hệ thống AI Phân Xử tuân thủ chặt chẽ biểu mẫu & điều khoản quy định
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

const ENTERPRISE_FORM_TEXT = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập – Tự do – Hạnh phúc
---------------------------------
ĐƠN XIN NGHỈ PHÉP (Mẫu BM-HR-01)

Kính gửi:
- Ban Giám Đốc Công ty;
- Trưởng phòng Phòng chuyên môn;
- Phòng Nhân Sự (HR).

1. Họ và tên nhân viên: ............................................ Mã NV: ....................
2. Phòng ban: ........................................................... Chức vụ: ....................
3. Loại nghỉ đề nghị: [ ] Phép năm   [ ] Nghỉ ốm BHXH   [ ] Việc riêng   [ ] Không lương
4. Thời gian xin nghỉ: Từ .../.../202... đến hết .../.../202... (Tổng: .... ngày).
5. Lý do: ...............................................................................................
6. Danh mục minh chứng kèm theo:
- Giấy chứng nhận nghỉ việc hưởng BHXH (mẫu C65-HD) / Giấy ra viện có mộc đỏ (nếu nghỉ ốm).
- Giấy đăng ký kết hôn / Giấy chứng tử (nếu nghỉ việc riêng hưởng lương).
7. Người nhận bàn giao công việc: ................................... Mã NV: ....................

Cam kết: Tôi xin cam đoan thông tin và giấy tờ đính kèm là hoàn toàn trung thực.`;

const ACADEMIC_FORM_TEXT = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập – Tự do – Hạnh phúc
---------------------------------
ĐƠN XIN NGHỈ HỌC TẠM THỜI (Mẫu BM-DT-02)

Kính gửi:
- Ban Chủ nhiệm Khoa;
- Phòng Quản lý Đào tạo;
- Giảng viên phụ trách học phần.

1. Họ và tên sinh viên: ............................................ MSSV: ....................
2. Khoa: ................................................................. Lớp: ........................
3. Học phần xin nghỉ: ............................................... Buổi nghỉ: ..... buổi
4. Lý do xin nghỉ: ......................................................................................
5. Minh chứng nộp kèm:
- Giấy khám bệnh / Giấy viện có mộc tròn cơ sở y tế.
- Giấy xác nhận của phụ huynh / Giấy triệu tập Đoàn trường.
6. Cam kết: Tự chủ động học bù kiến thức và làm bài tập theo quy định.`;
