# QUY CHẾ ĐÀO TẠO & XỬ LÝ ĐƠN NGHỈ HỌC CỦA SINH VIÊN
## Hệ Thống AI Escalation Referee — Spec A (OrganizationAI)

---

### Chương I: Quy định chung về Chuyên cần & Nghỉ học

#### Điều 1. Giới hạn số buổi nghỉ học phần
1. Sinh viên có nghĩa vụ tham gia đầy đủ các buổi học trên lớp của từng học phần.
2. Tổng số buổi vắng mặt (có phép hoặc không phép) của một học phần **không được vượt quá 20%** tổng số buổi của học phần đó.
3. Trường hợp vượt quá 20% số buổi:
   - Sinh viên bị đình chỉ thi (cấm thi) học phần đó và phải học lại.
   - Nếu có lý do đặc biệt (điều trị bệnh nan y, đại diện Nhà trường thi đấu quốc tế, sự cố bất khả kháng), đơn phải chuyển **Ngoài chính sách** để Hội đồng Khoa / Giảng viên phụ trách xem xét diện ngoại lệ.

#### Điều 2. Hồ sơ minh chứng y tế (Nghỉ ốm)
1. Trường hợp nghỉ do ốm đau, tai nạn cần cung cấp:
   - Giấy xác nhận / Giấy ra viện / Giấy khám bệnh từ cơ sở khám chữa bệnh có thẩm quyền.
   - Thông tin trên giấy phải rõ ràng: Họ tên sinh viên, ngày vào viện, ngày ra viện / ngày chỉ định nghỉ dưỡng.
2. Nếu giấy chứng từ bị mờ, mất góc, không đọc được mốc ngày nghỉ:
   - Hệ thống không được tự ý từ chối hoặc duyệt.
   - Hệ thống kích hoạt dừng loại **"Không chắc dữ kiện"** để yêu cầu sinh viên cung cấp lại hoặc làm rõ mốc thời gian vắng.

---

### Chương II: Phân cấp thẩm quyền phê duyệt

#### Điều 3. Thẩm quyền duyệt đơn
1. **Giảng viên phụ trách học phần / Cố vấn học tập**:
   - Được quyền phê duyệt các đơn xin nghỉ thường quy từ **1 đến 2 buổi học** trong phạm vi tổng số buổi nghỉ không vượt quá 20%.
   - Hồ sơ có minh chứng hợp lệ, rõ ràng.
2. **Trưởng khoa / Phòng Đào tạo**:
   - Phê duyệt các đơn xin nghỉ dài hạn (từ 3 buổi liên tục trở lên của học phần).
   - Phê duyệt đơn **xin bảo lưu kết quả học tập / bảo lưu cả học kỳ**.
   - Phê duyệt các ca ngoại lệ vượt quá 20% số buổi nghỉ.

---

### Chương III: Nguyên tắc vận hành của Agent Phân xử (Escalation Referee)

| Tiêu chí | Quy tắc bắt buộc của Agent |
| :--- | :--- |
| **Ca thường quy (Auto-Approve)** | Tự động duyệt khi: Minh chứng rõ ràng + Tổng số buổi vắng $\le 20\%$ + Thuộc thẩm quyền Giảng viên/Cố vấn học tập. |
| **Dừng 1: Không chắc dữ kiện** | Kích hoạt khi giấy tờ y tế mờ ngày, thiếu thông tin mốc thời gian nghỉ. Câu hỏi: *"Giấy khám bệnh mờ/không đọc được ngày: Sinh viên xin nghỉ từ ngày nào đến ngày nào?"* |
| **Dừng 2: Ngoài chính sách** | Kích hoạt khi tổng số buổi nghỉ vượt quá 20% số buổi học phần. Câu hỏi: *"Sinh viên đã nghỉ vượt 20% số buổi (vượt mức cho phép), có xét đặc biệt không?"* |
| **Dừng 3: Vượt thẩm quyền** | Kích hoạt khi sinh viên làm đơn xin bảo lưu cả học kỳ / nghỉ dài hạn toàn khóa. Câu hỏi: *"Đơn xin bảo lưu cả học kỳ thuộc thẩm quyền Trưởng khoa. Chuyển cấp duyệt?"* |
| **Bất biến (Invariance)** | **Tuyệt đối không bao giờ xuất kết quả chắc chắn (Approve/Reject) trên ca đã gắn cờ.** Quyết định bắt buộc là `ESCALATE` để con người phân xử. |
