# Student Leave Referee Prototype (Spec A · OrganizationAI)

Hệ thống **AI Escalation Referee** chuyên xử lý và phân xử tự động các **Đơn xin nghỉ học của Sinh viên** theo Quy chế Đào tạo nội bộ.

## 1. Mục tiêu & Phạm vi (Vai SV2 — Lõi Agent)
Dự án giải quyết trọn vẹn **Task 1 & Task 2** theo chuẩn Spec A:
- **Tự động duyệt (Auto-Approve)** các ca thường quy (nghỉ trong hạn mức $\le 20\%$ số buổi, có minh chứng rõ ràng, thuộc thẩm quyền giảng viên).
- **Phân loại độ bất định thành 3 loại dừng bắt buộc**:
  1. **Không chắc dữ kiện**: Giấy khám bệnh không đọc được ngày $\rightarrow$ Câu hỏi: *"Giấy khám bệnh không đọc được ngày: Sinh viên xin nghỉ từ ngày nào?"*
  2. **Ngoài chính sách**: Đã nghỉ quá 20% số buổi học phần $\rightarrow$ Câu hỏi: *"Sinh viên đã nghỉ quá 20% số buổi (vượt mức cho phép), có xét đặc biệt không?"*
  3. **Vượt thẩm quyền**: Xin bảo lưu cả học kỳ $\rightarrow$ Câu hỏi: *"Đơn xin bảo lưu cả học kỳ thuộc thẩm quyền Trưởng khoa. Chuyển hồ sơ lên Trưởng khoa phê duyệt?"*
- **Nguyên tắc cốt lõi**:
  - Câu hỏi Escalate phải **cụ thể** và **trả lời được trong 1 lượt**.
  - **Không bao giờ xuất kết quả chắc chắn trên ca đã gắn cờ** (kết quả luôn là `ESCALATE`).
  - Ghi nhận đầy đủ **Mã nguồn + Log quyết định (Audit Trail)** và cơ chế can thiệp/hoàn tác của con người (Human-in-the-loop).

## 2. Cấu trúc thư mục
- `policy.md`: Quy chế đào tạo và căn cứ pháp lý xử lý đơn nghỉ học.
- `src/types/index.ts`: Định nghĩa dữ liệu sinh viên, môn học, 3 loại dừng, kết quả quyết định.
- `src/data/mockTestCases.ts`: Lõi Agent SV2 (`runMockEvaluate`) + 5 ca kiểm thử chuẩn (`runMockVerify`).
- `src/services/api.ts`: API client kết nối backend hoặc fallback mock engine độc lập.
- `src/components/VerifyHarness.tsx`: Bộ kiểm thử 5 ca chuẩn.
- `src/components/AuditTrail.tsx`: Nhật ký quyết định & nút can thiệp của Giảng viên/Trưởng khoa.
- `src/App.tsx`: Giao diện nộp đơn nghỉ học & chọn preset ca mẫu nhanh.

## 3. Khởi chạy
Dự án sử dụng Vite và Node.js:
```bash
# Cài đặt dependencies (nếu chạy độc lập)
pnpm install

# Khởi chạy chế độ dev
pnpm dev
```
