# PHẦN IV: VẬN HÀNH, NGHIÊN CỨU NGƯỜI DÙNG & KẾ HOẠCH TRIỂN KHAI

## 11. Bối cảnh Vận hành & Phân quyền Vai trò

Trong quy trình vận hành nhân sự tiêu chuẩn tại doanh nghiệp, AER thiết lập ma trận phân quyền trách nhiệm (RACI Matrix) chặt chẽ giữa 3 vai trò:

| Vai trò Người dùng | Trách nhiệm & Quyền hạn | Điểm chạm trên Hệ thống AER |
| :--- | :--- | :--- |
| **Nhân viên Chính quy** *(Applicant)* | Làm đơn theo mẫu chuẩn `BM-HR-01`, tải ảnh chụp chứng từ y tế/BHXH và cam kết bàn giao công việc | Cổng nộp đơn cá nhân: Đóng gói và theo dõi trạng thái tiếp nhận hồ sơ |
| **Quản lý Trực tiếp** *(Reviewer - Line Manager)* | Phê duyệt các ca thường quy trong hạn mức ≤ 5 ngày, xử lý các câu hỏi Escalate 1 lượt do AI gửi | Cổng Cấp Trên: Xem tóm tắt hồ sơ, kết quả VLM soi mộc đỏ, bấm duyệt/từ chối 1 lượt |
| **Giám đốc Nhân sự / Ban TGĐ** *(Special Approver / HRD)* | Phê duyệt các trường hợp ngoại lệ vượt thẩm quyền: Nghỉ không lương > 5 ngày, nghỉ dài hạn ≥ 20 ngày | Cổng Cấp Cao: Thẩm định hồ sơ đặc biệt và phê duyệt chính sách |
| **Chuyên viên C&B / Kiểm toán HR** *(Auditor)* | Đối soát bảng chấm công, quyết toán chế độ BHXH và thực thi hoàn tác khi phát hiện gian lận | Sổ cái kiểm toán bất biến & Giao diện Verify Harness |

---

## 12. Nghiên cứu Người dùng Định tính

Nhằm kiểm chứng tính thực tiễn của giải pháp, nhóm nghiên cứu đã tiến hành thử nghiệm định tính với **3 người dùng thật** đại diện cho 3 nhóm vai trò cốt lõi trong doanh nghiệp:

### 12.1 Đối tượng 1 — Đại diện Nhân viên Chính quy
- **Họ tên & Vị trí**: Nhân viên Kinh doanh (Mã NV: NV-2024-0312).
- **Trải nghiệm thực tế**: Sử dụng Cổng nộp đơn để tạo đơn xin nghỉ phép năm và đính kèm chứng từ y tế.
- **Phản hồi**: *"Giao diện đóng gói thư mục rất trực quan. Sau khi bấm nộp, hệ thống phản hồi kết quả tự động duyệt ngay lập tức mà không phải chờ Quản lý mở máy tính kiểm tra số dư phép như trước đây."*

### 12.2 Đối tượng 2 — Quản lý Bộ phận Trực tiếp
- **Họ tên & Vị trí**: Trưởng phòng Kế hoạch & Quản lý Dự án.
- **Trải nghiệm thực tế**: Tiếp nhận và xử lý 10 hồ sơ nghỉ phép của nhân viên, bao gồm các ca mờ chứng từ ($U_1$) và nhân viên thử việc ($U_2$).
- **Phản hồi**: *"Câu hỏi Escalate 1 lượt thực sự giúp tôi tiết kiệm thời gian. Thay vì phải đọc lại toàn bộ quy chế xem nhân viên thử việc có được nghỉ phép năm không, AI đã tóm tắt sẵn điều khoản và đưa ra 2 phương án dứt khoát. Tôi chỉ mất chưa đầy 10 giây cho mỗi quyết định."*

### 12.3 Đối tượng 3 — Chuyên viên C&B / Quản trị Nhân sự
- **Họ tên & Vị trí**: Chuyên viên Phụ trách Chế độ & Bảo hiểm Xã hội (C&B Specialist).
- **Trải nghiệm thực tế**: Sử dụng tính năng soi mộc đỏ VLM và đối soát sổ cái kiểm toán để phát hiện các ca thiếu mẫu C65-HD.
- **Phản hồi**: *"Khả năng bắt lỗi thiếu mẫu C65-HD của hệ thống loại bỏ hoàn toàn rủi ro thất thoát quỹ lương khi quyết toán BHXH. Cơ chế hoàn tác [Undo] tức thì cũng giúp chúng tôi hoàn toàn yên tâm nếu có sai sót phát sinh."*

---

## 13. Kế hoạch Triển khai 72 Giờ

Lộ trình triển khai nhanh trong 72 giờ được thiết kế để đưa AER từ prototype vào vận hành thực tế tại doanh nghiệp:

- **Giờ 00 – 24: Thiết lập Kiến trúc & Cấu hình Quy chế Nhân sự**:
  - Tích hợp động cơ quy tắc và mô hình VLM `qwen3-vl:4b` trên máy chủ nội bộ doanh nghiệp.
  - Cấu hình gazetteer quy chế theo Quy chế Nhân sự số 18/2024/QC-NS và Điều 115 Bộ luật Lao động.
- **Giờ 25 – 48: Kết nối Dữ liệu Nhân sự & Kiểm thử Thẩm định**:
  - Đồng bộ cơ sở dữ liệu số dư ngày phép năm và danh sách nhân viên thử việc.
  - Chạy bộ kiểm thử 15 ca benchmark trên Verify Harness để đạt 100% tỷ lệ chính xác.
- **Giờ 49 – 72: Thử nghiệm Pilot & Bàn giao Vận hành**:
  - Triển khai thử nghiệm trên 2 phòng ban thí điểm (Phòng Kinh doanh và Phòng Kỹ thuật).
  - Đào tạo nhanh cán bộ quản lý và nhân viên về cổng nộp đơn và cơ chế xử lý 1 lượt.

---

## 14. Phân tích Chi phí, Hiệu quả Đầu tư & Mở rộng

- **Hiệu quả Tiết kiệm Thời gian**: Giảm 85% thời gian xử lý sự vụ của bộ phận nhân sự và giảm 88% thời gian phê duyệt của cán bộ quản lý (từ ~180 giây xuống ~11.4 giây mỗi đơn).
- **Loại bỏ Thất thoát Chế độ**: Giảm 100% các trường hợp chi trả sai chế độ ốm đau do thiếu chứng từ BHXH gốc (mẫu C65-HD).
- **Chi phí Hạ tầng Tối thiểu**: Tác tử AI và mô hình VLM chạy hoàn toàn cục bộ (Local Edge / On-premise), không phát sinh chi phí token API đám mây hàng tháng và đảm bảo an toàn tuyệt đối dữ liệu nhân sự.
