import type { DomainMode } from "./Header";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainMode;
}

export default function PolicyModal({ isOpen, onClose, domain }: Props) {
  if (!isOpen) return null;

  const isEnterprise = domain === "enterprise";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{isEnterprise ? "🏢" : "🎓"}</span>
            <div>
              <h3 className="font-bold text-base">
                {isEnterprise
                  ? "Quy Chế Nghỉ Phép Doanh Nghiệp (HR Policy)"
                  : "Quy Chế Đào Tạo & Chuyên Cần Sinh Viên (Academic Policy)"}
              </h3>
              <p className="text-xs text-slate-300">
                Khung căn cứ tự động phê duyệt &amp; phân loại bất định của AI Referee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed">
          {isEnterprise ? (
            <>
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-1">1. Điều kiện Tự Động Duyệt (Auto-Approve)</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-blue-800">
                  <li><strong>Nghỉ phép năm:</strong> Còn đủ ngày phép, nộp trước hạn định mức.</li>
                  <li><strong>Nghỉ ốm hưởng BHXH:</strong> Có giấy chứng nhận y tế/ra viện hợp lệ, rõ ràng ngày tháng.</li>
                  <li><strong>Nghỉ việc riêng hưởng lương:</strong> Kết hôn lần đầu (3 ngày), tứ thân phụ mẫu/vợ/chồng/con qua đời (3 ngày) có minh chứng.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-900 mb-1">2. Ba Nhóm Bất Định Bắt Buộc Dừng (Escalate)</h4>
                <div className="space-y-2 text-xs text-amber-900">
                  <div>
                    <span className="font-bold bg-amber-200/80 px-1.5 py-0.5 rounded">Không chắc dữ kiện:</span>{" "}
                    Chứng từ scan mờ, mất góc, không đọc được mốc ngày điều trị thực tế.
                  </div>
                  <div>
                    <span className="font-bold bg-amber-200/80 px-1.5 py-0.5 rounded">Ngoài chính sách:</span>{" "}
                    Nghỉ việc riêng không có minh chứng, nhân viên thử việc xin nghỉ phép năm hưởng lương.
                  </div>
                  <div>
                    <span className="font-bold bg-amber-200/80 px-1.5 py-0.5 rounded">Vượt thẩm quyền:</span>{" "}
                    Nghỉ không lương &gt; 5 ngày, nghỉ phép liên tục &gt; 5 ngày, nghỉ dài hạn &gt; 20 ngày cần cấp Trưởng phòng / HRD / Ban Giám Đốc phê duyệt.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                <h4 className="font-bold text-indigo-900 mb-1">1. Điều kiện Tự Động Duyệt (Auto-Approve)</h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-indigo-800">
                  <li>Tổng số buổi nghỉ tích lũy ≤ 20% tổng số tiết môn học (đảm bảo điều kiện thi).</li>
                  <li>Có chứng từ hợp lệ: Giấy khám bệnh có mộc đỏ, giấy triệu tập Đoàn/Trường, giấy xác nhận gia đình.</li>
                  <li>Thời gian xin nghỉ không trùng lịch thi kết thúc học phần.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-900 mb-1">2. Ba Nhóm Bất Định Bắt Buộc Dừng (Escalate)</h4>
                <div className="space-y-2 text-xs text-amber-900">
                  <div>
                    <span className="font-bold bg-amber-200/80 px-1.5 py-0.5 rounded">Không chắc dữ kiện:</span>{" "}
                    Giấy khám bệnh mờ, thiếu chữ ký bác sĩ, không đọc rõ ngày nghỉ.
                  </div>
                  <div>
                    <span className="font-bold bg-amber-200/80 px-1.5 py-0.5 rounded">Ngoài chính sách:</span>{" "}
                    Vắng tích lũy &gt; 20% số buổi môn học (nguy cơ cấm thi), nghỉ việc riêng không có phụ huynh xác nhận.
                  </div>
                  <div>
                    <span className="font-bold bg-amber-200/80 px-1.5 py-0.5 rounded">Vượt thẩm quyền:</span>{" "}
                    Đơn xin bảo lưu cả học kỳ, chuyển điểm hoặc nghỉ dài hạn toàn khóa thuộc thẩm quyền Trưởng khoa &amp; Phòng Đào tạo.
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            🔒 <strong>Nguyên lý an toàn:</strong> Khi phát hiện bất kỳ cờ bất định nào trong 3 nhóm trên, AI Referee tuyệt đối không tự ý ra quyết định mà tạo câu hỏi đơn lượt (single-turn) chuyển tiếp đến cấp có thẩm quyền.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Đã hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
