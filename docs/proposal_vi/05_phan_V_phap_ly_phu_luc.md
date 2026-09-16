# PHẦN V: CƠ CHẾ QUẢN TRỊ, PHÁP LÝ & PHỤ LỤC

## 15. Tuân thủ Pháp lý & Bảo vệ Dữ liệu

Hệ thống AER được thiết kế tuân thủ nghiêm ngặt khung pháp lý hiện hành của Việt Nam:
1. **Bộ luật Lao động 2019 (Luật số 45/2019/QH14)**:
   - Tuân thủ Điều 113 (Nghỉ hằng năm hưởng nguyên lương).
   - Tuân thủ Điều 115 (Nghỉ việc riêng hưởng nguyên lương đối với kết hôn, tang chế).
   - Tuân thủ Điều 116 (Nghỉ việc không hưởng lương theo thỏa thuận).
2. **Luật Bảo hiểm Xã hội**:
   - Tuân thủ quy định về chế độ ốm đau và hồ sơ hưởng trợ cấp bắt buộc phải có Giấy chứng nhận nghỉ việc hưởng BHXH (mẫu C65-HD) hoặc Giấy ra viện có dấu mộc tròn của cơ sở khám chữa bệnh có thẩm quyền.
3. **Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân**:
   - Toàn bộ dữ liệu hồ sơ nhân sự, mã nhân viên và ảnh chụp chứng từ y tế được xử lý cục bộ trên hạ tầng máy chủ nội bộ (On-premise), không gửi ra ngoài Internet, đảm bảo an toàn bí mật đời tư và dữ liệu sức khỏe của người lao động.

---

## 16. Cơ chế Quản trị & Trách nhiệm Giải trình

- **Quyền Phán Quyết Cuối Cùng Thuộc Về Con Người (Human-in-the-Loop)**: AI không bao giờ có quyền đưa ra quyết định từ chối đơn cuối cùng trên các ca rủi ro bất định; AI chỉ đóng vai trò phân loại, tóm tắt và chuyển tiếp cho Quản lý / HR có thẩm quyền quyết định.
- **Trách Nhiệm Giải Trình Qua Sổ Cái (Audit Traceability)**: Mọi quyết định tự động duyệt hoặc can thiệp của con người đều được gắn mã định danh giao dịch bất biến và chuỗi băm SHA-256, giúp kiểm toán nội bộ truy vết chính xác nguyên nhân trong 100% trường hợp.

---

## 17. Giới hạn Đã biết & Hướng phát triển

1. **Giới hạn Nhận diện Ảnh Chứng từ Quá Mờ**: Các ảnh chụp chứng từ y tế bị rung lắc mạnh hoặc điều kiện thiếu sáng (< 50 lux) sẽ bị hệ thống gắn cờ dừng ở nhóm $U_1$ (Bất định Dữ kiện) thay vì cố gắng suy đoán. Đây là cơ chế an toàn chủ động được lập trình sẵn.
2. **Mở Rộng Tính Năng Tương Lai**: Tích hợp cổng kết nối trực tiếp với cổng thông tin Giám định BHYT/BHXH Việt Nam để tra cứu mã số chứng từ điện tử theo thời gian thực.

---

## 18. Tuyên bố Liêm chính & Đạo đức AI

Nhóm tác giả cam kết toàn bộ dữ liệu thực nghiệm, kết quả đo lường độ trễ và tỷ lệ chính xác được trình bày trong đề xuất này đều được ghi nhận trực tiếp từ mã nguồn thực thi trên hệ thống AER prototype, không sử dụng số liệu giả định hay can thiệp thủ công vào kết quả kiểm thử.

---

# PHỤ LỤC A: TOÀN VĂN QUY CHẾ QUẢN LÝ NGHỈ PHÉP DOANH NGHIỆP SỐ 18/2024/QC-NS

**Điều 1: Mục đích và Phạm vi Áp dụng**
Quy chế này quy định chế độ nghỉ phép năm, nghỉ ốm đau hưởng BHXH, nghỉ thai sản, nghỉ việc riêng và nghỉ không hưởng lương đối với toàn thể cán bộ, nhân viên chính quy và nhân viên thử việc trong doanh nghiệp.

**Điều 8: Chế độ Nghỉ phép đối với Nhân viên Thử việc**
8.1. Trong thời gian thử việc theo Hợp đồng thử việc, nhân viên không phát sinh quỹ ngày phép năm hưởng nguyên lương.
8.2. Trường hợp nhân viên thử việc có nhu cầu nghỉ giải quyết việc cá nhân, đơn nghỉ phải được Quản lý trực tiếp phê duyệt và tính vào diện Nghỉ việc không hưởng lương.

**Điều 10: Chế độ Nghỉ phép năm Hưởng nguyên lương**
10.1. Nhân viên chính quy làm việc đủ 12 tháng được nghỉ 12 ngày phép năm hưởng nguyên lương. Đơn xin nghỉ phép năm từ 1 đến 3 ngày phải nộp trước ít nhất 1 ngày làm việc; đơn từ 4 đến 5 ngày phải nộp trước ít nhất 3 ngày làm việc.
10.2. Các đơn xin nghỉ phép năm hợp lệ, còn đủ số dư ngày phép và trong hạn mức ≤ 5 ngày thuộc thẩm quyền phê duyệt tự động của Quản lý trực tiếp.
10.3. Đơn xin nghỉ phép năm liên tục trên 5 ngày làm việc phải được sự phê duyệt của Trưởng phòng ban hoặc Giám đốc Khối.

**Điều 14: Chế độ Nghỉ ốm đau và Hồ sơ Hưởng BHXH**
14.1. Nhân viên nghỉ ốm đau được thanh toán chế độ BHXH theo quy định của Luật Bảo hiểm Xã hội hiện hành.
14.2. Hồ sơ nghỉ ốm đau hợp lệ bắt buộc phải có Giấy ra viện hoặc Giấy khám bệnh có đầy đủ con dấu mộc tròn của cơ sở y tế hợp pháp và chữ ký của bác sĩ điều trị.
14.3. Đối với các đợt điều trị ngoại trú, nhân viên bắt buộc phải nộp Giấy chứng nhận nghỉ việc hưởng BHXH (Mẫu C65-HD hoặc CT07) bản gốc trong vòng 3 ngày làm việc kể từ ngày đi làm lại để bộ phận C&B làm thủ tục thanh toán với cơ quan BHXH.

**Điều 15: Chế độ Nghỉ việc riêng Hưởng nguyên lương**
Nhân viên được nghỉ việc riêng hưởng nguyên lương trong các trường hợp sau (bắt buộc nộp giấy tờ minh chứng kèm theo đơn):
- Bản thân kết hôn: Nghỉ 03 ngày làm việc (Nộp kèm Giấy đăng ký kết hôn).
- Con đẻ, con nuôi kết hôn: Nghỉ 01 ngày làm việc (Nộp kèm Thiệp báo hỷ / Giấy kết hôn của con).
- Cha đẻ, mẹ đẻ, cha nuôi, mẹ nuôi; cha đẻ, mẹ đẻ, cha nuôi, mẹ nuôi của vợ hoặc chồng; vợ hoặc chồng; con đẻ, con nuôi chết: Nghỉ 03 ngày làm việc (Nộp kèm Giấy cáo phó / Giấy chứng tử).

**Điều 18: Phân cấp Thẩm quyền Phê duyệt Đơn Nghỉ phép**
18.1. Quản lý trực tiếp có thẩm quyền phê duyệt các đơn xin nghỉ phép năm, nghỉ việc riêng, nghỉ ốm đau trong hạn mức tối đa 05 ngày làm việc và đơn xin nghỉ không lương tối đa 05 ngày làm việc.
18.2. Đơn xin nghỉ không lương trên 05 ngày làm việc phải được sự phê duyệt của Trưởng phòng ban và Giám đốc Nhân sự (HRD).
18.3. Đơn xin nghỉ dài hạn từ 20 ngày làm việc trở lên phải được sự phê duyệt của Tổng Giám Đốc.

---

# PHỤ LỤC B: BẢNG ÁNH XẠ ĐỐI SOÁT QUY CHUẨN KIỂM THỬ

| Mã Kiểm Thử | Tên Nhân Viên | Phòng Ban | Loại Nghỉ | Số Ngày | Chứng Từ | Quy Chế Áp Dụng | Kết Quả Kỳ Vọng |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :---: |
| **TC-HR-01** | Nguyễn Thị Hương | Kinh doanh | Phép năm | 1 | Đầy đủ | Điều 10.1 Quy chế Nhân sự | `AUTO_APPROVE` |
| **TC-HR-02** | Trần Văn Nam | Kỹ thuật | Kết hôn | 3 | Giấy kết hôn | Điều 15 Quy chế / Điều 115 BLLĐ | `AUTO_APPROVE` |
| **TC-HR-03** | Lê Thị Phương | Kế hoạch | Nghỉ ốm | 3 | Giấy ra viện | Điều 14.1 & 14.2 Quy chế Nhân sự | `AUTO_APPROVE` |
| **TC-HR-04** | Trương Minh Trí | Kinh doanh | Nghỉ ốm | 6 | Thiếu C65-HD | Điều 14.3 Quy chế Nhân sự | `ESCALATE` (Dữ kiện) |
| **TC-HR-05** | Hoàng Văn Bình | Vận hành | Không lương | 20 | Hợp lệ | Điều 18.3 Quy chế Nhân sự | `ESCALATE` (Thẩm quyền) |
| **TC-HR-06** | Phạm Thị Thảo | Marketing | Phép năm | 2 | Thử việc | Điều 8.2 Quy chế Nhân sự | `ESCALATE` (Chính sách) |
| **TC-HR-07** | Đỗ Quốc Bảo | IT | Việc riêng | 2 | Thiếu giấy | Điều 15 Quy chế Nhân sự | `ESCALATE` (Chính sách) |

---

# PHỤ LỤC C: BÁO CÁO PHÂN TÍCH RỦI RO & MA TRẬN FMEA

| Điểm Lỗi Tiềm Ẩn | Nguyên Nhân Gốc | Mức Nghiêm Trọng (S) | Tần Suất Xảy Ra (O) | Khả Năng Phát Hiện (D) | Chỉ Số RPN | Giải Pháp Kiểm Soát Của AER |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| Duyệt sai đơn nghỉ ốm thiếu mẫu C65-HD | AI tự suy đoán chứng từ photo | 8 | 4 | 2 | 64 | Khóa luồng tự duyệt, bắt buộc dừng $U_1$ yêu cầu nộp bản gốc |
| Nhân viên thử việc hưởng phép năm | Quy tắc đối soát không kiểm tra trạng thái thử việc | 7 | 3 | 2 | 42 | Động cơ tiền định chặn $U_2$, hỏi Quản lý duyệt không lương |
| Quản lý duyệt vượt thẩm quyền 20 ngày | Không phân cấp thẩm quyền trên hệ thống | 8 | 3 | 2 | 48 | Khóa thẩm quyền $U_3$, tự động chuyển lên HRD / TGĐ |

---

# PHỤ LỤC D: DANH MỤC TÀI LIỆU THAM KHẢO & CƠ SỞ PHÁP LÝ

1. **Quốc hội Nước CHXHCN Việt Nam (2019)**. *Bộ luật Lao động số 45/2019/QH14*. Hà Nội: Nhà xuất bản Chính trị Quốc gia Sự thật.
2. **Quốc hội Nước CHXHCN Việt Nam (2014)**. *Luật Bảo hiểm Xã hội số 58/2014/QH13*.
3. **Chính phủ Nước CHXHCN Việt Nam (2023)**. *Nghị định số 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân*.
4. **Amodei, D., Olah, C., Steinhardt, J., Christiano, P., Schulman, J., & Mané, D. (2016)**. Concrete Problems in AI Safety. *arXiv preprint arXiv:1606.06565*.
5. **Parasuraman, R., & Riley, V. (1997)**. Humans and Automation: Use, Misuse, Disuse, Abuse. *Human Factors*, 39(2), 230–253.
6. **Shneiderman, B. (2020)**. Human-Centered Artificial Intelligence: Reliable, Safe & Trustworthy. *International Journal of Human–Computer Interaction*, 36(6), 495–504.
7. **Horvitz, E. (1999)**. Principles of Mixed-Initiative User Interfaces. *Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (CHI '99)*, 159–166.
