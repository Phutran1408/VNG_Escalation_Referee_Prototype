# AI Escalation Referee Prototype (Spec A · OrganizationAI)

Hệ thống **AI Escalation Referee** (Phân xử thẩm định tự động và kích hoạt điểm dừng thông minh) theo chuẩn đề bài **Bảng 1 — OrganizationAI · Spec A**.

---

## 🌟 Tính Năng Nổi Bật: Dual-Domain Option (Doanh Nghiệp & Trường Học)

Ứng dụng tích hợp sẵn **bộ chuyển đổi trực tiếp giữa 2 ngữ cảnh thực tế (Domain Switcher)** ngay trên thanh điều hướng, giúp giám khảo và ban tổ chức kiểm chứng cả 2 môi trường:

### 🏢 1. Ngữ cảnh Doanh nghiệp (Enterprise HR Leave Management)
- **Đối tượng**: Cán bộ nhân viên (`NV-2024-...`), phòng ban doanh nghiệp.
- **Quy chế**: Quy chế Nhân sự nội bộ.
- **3 loại dừng theo Spec A**:
  - **Không chắc dữ kiện**: Chứng từ y tế mờ ngày xuất viện $\rightarrow$ *"Nhân viên xin nghỉ từ ngày 12/10 hay 15/10?"*
  - **Ngoài chính sách**: Nghỉ việc riêng không có minh chứng hoặc lý do ngoài chính sách.
  - **Vượt thẩm quyền**: Nghỉ không lương $> 5$ ngày (ca 20 ngày) vượt quyền Quản lý trực tiếp $\rightarrow$ *"Cần chuyển Giám đốc Khối / HRD phê duyệt?"*
- **Verify Test Harness**: Chạy 5 ca kiểm thử chuẩn Enterprise HR.
- **Audit Trail**: Ghi log quyết định và hỗ trợ HR Admin override.

### 🎓 2. Ngữ cảnh Trường học (Academic Student Leave Management)
- **Đối tượng**: Sinh viên (`SV-2024-...`), Khoa/Viện, môn học cụ thể.
- **Quy chế**: Quy chế Đào tạo & Quản lý chuyên cần sinh viên.
- **3 loại dừng theo Spec A**:
  - **Không chắc dữ kiện**: Giấy khám bệnh không đọc được ngày $\rightarrow$ *"Sinh viên xin nghỉ từ ngày nào?"*
  - **Ngoài chính sách**: Đã nghỉ quá 20% số buổi môn học (nguy cơ cấm thi) $\rightarrow$ *"Vượt mức cho phép, có xét đặc biệt không?"*
  - **Vượt thẩm quyền**: Xin bảo lưu cả học kỳ $\rightarrow$ *"Thuộc thẩm quyền Trưởng khoa."*
- **Verify Test Harness**: Hỗ trợ 2 chế độ:
  - **5 ca chuẩn (SV4 - Verify 90s)**: 3 ca thường quy + 2 ca dừng.
  - **15 ca toàn diện (SV1)**: Bộ test case đa dạng tất cả các tình huống.
- **Thanh đo tỷ lệ vắng (Visual Gauge Bar)**: Cảnh báo thời gian thực khi vượt mốc 20%.
- **Audit Trail**: Tìm kiếm, bộ lọc, xuất file JSON và nút Override cho Giảng viên.

---

## 🚀 Khởi chạy và Trải nghiệm

Hệ thống đang chạy trên cổng `8443`:
- **Preview**: [http://localhost:8443](http://localhost:8443)
- Bấm nút chọn **🏢 Doanh Nghiệp** hoặc **🎓 Trường Học** trên Header để đổi ngữ cảnh ngay lập tức!
