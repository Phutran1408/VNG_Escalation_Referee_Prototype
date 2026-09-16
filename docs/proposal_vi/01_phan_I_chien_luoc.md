# ĐỀ XUẤT GIẢI PHÁP HACKATHON MLAI 2026 — TRACK 1: ORGANIZATIONAI
## SPEC A: HỆ THỐNG TRỌNG TÀI PHÂN XỬ & THẨM ĐỊNH NGHỈ PHÉP NHÂN SỰ TỰ ĐỘNG
### (ACADEMIC & ENTERPRISE ESCALATION REFEREE — AER: HR EDITION)

---

# MỤC LỤC

**PHẦN I: TUYÊN BỐ CHIẾN LƯỢC & ĐỘNG LỰC BÀI TOÁN**
- 1. Quyết định điều hành & Tóm tắt điều hành ................................................................. Trang 1
  - 1.1 Tuyên bố giá trị cốt lõi ..................................................................................... Trang 1
  - 1.2 Bảng đối chiếu mục tiêu và kết quả định lượng ..................................................... Trang 2
  - 1.3 Phạm vi và ranh giới hệ thống .............................................................................. Trang 2
- 2. Khảo sát cơ hội và Lựa chọn đề tài ............................................................................ Trang 3
  - 2.1 Bảng sàng lọc ý tưởng có trọng số ....................................................................... Trang 3
  - 2.2 Động lực lựa chọn quy trình Quản lý Nghỉ phép Doanh nghiệp ................................. Trang 4
- 3. Bối cảnh bài toán và Thất bại kép của Tự động hóa HR .............................................. Trang 5
  - 3.1 Thực trạng thẩm định nghỉ phép & rủi ro thất thoát quỹ lương ................................ Trang 5
  - 3.2 Nguy cơ Duyệt mù và Chuyển tiếp thừa trong doanh nghiệp .................................... Trang 6
- 4. Ba nguyên tắc thiết kế bất biến ................................................................................. Trang 7

**PHẦN II: KIẾN TRÚC HỆ THỐNG & ĐÓNG GÓP KHOA HỌC KỸ THUẬT**
- 5. Kiến trúc tổng thể và Luồng dữ liệu khép kín ............................................................. Trang 8
  - 5.1 Sơ đồ khối kiến trúc 4 tầng ................................................................................. Trang 8
  - 5.2 Luồng xử lý hồ sơ khép kín ................................................................................. Trang 9
- 6. Các đóng góp khoa học và kỹ thuật (C1 – C6) ........................................................... Trang 10
  - 6.1 Đóng góp C1: Không gian Bất định Nhân sự 3 Chiều (U_Enterprise) .......................... Trang 10
  - 6.2 Đóng góp C2: Hàm quyết định kép kết hợp quy tắc và dự phòng ............................. Trang 11
  - 6.3 Đóng góp C3: Cơ chế sinh câu hỏi chuyển tiếp đơn lượt ........................................ Trang 12
  - 6.4 Đóng góp C4: Cơ chế hoàn tác lạc quan & Nhật ký kiểm toán SHA-256 .................... Trang 13
  - 6.5 Đóng góp C5: Thanh đo số dư ngày phép và cảnh báo thử việc ................................ Trang 14
  - 6.6 Đóng góp C6: Giao thức kiểm thử tự động độc lập trạng thái ................................. Trang 15

**PHẦN III: MÔ HÌNH DỮ LIỆU, HỢP ĐỒNG API & PHƯƠNG PHÁP ĐÁNH GIÁ**
- 7. Mô hình dữ liệu và Lược đồ JSON ............................................................................. Trang 16
- 8. Giao diện Lập trình Ứng dụng & Hợp đồng Công cụ ................................................... Trang 18
- 9. Bộ tiêu chuẩn Đánh giá & Thiết kế Thử nghiệm ......................................................... Trang 19
- 10. Kết quả Thực nghiệm & Báo cáo Tái lập .................................................................... Trang 20

**PHẦN IV: VẬN HÀNH, NGHIÊN CỨU NGƯỜI DÙNG & KẾ HOẠCH TRIỂN KHAI**
- 11. Bối cảnh Vận hành & Phân quyền Vai trò ................................................................. Trang 22
- 12. Nghiên cứu Người dùng Định tính ............................................................................ Trang 23
- 13. Kế hoạch Triển khai 72 Giờ ..................................................................................... Trang 25
- 14. Phân tích Chi phí, Hiệu quả Đầu tư & Mở rộng ........................................................ Trang 26

**PHẦN V: CƠ CHẾ QUẢN TRỊ, PHÁP LÝ & PHỤ LỤC**
- 15. Tuân thủ Pháp lý & Bảo vệ Dữ liệu ........................................................................... Trang 27
- 16. Cơ chế Quản trị & Trách nhiệm Giải trình ................................................................. Trang 28
- 17. Giới hạn Đã biết & Hướng phát triển ........................................................................ Trang 29
- 18. Tuyên bố Liêm chính & Đạo đức AI .......................................................................... Trang 30
- PHỤ LỤC A: Quy chế Quản lý Nghỉ phép Doanh nghiệp số 18/2024/QC-NS ...................... Trang 31
- PHỤ LỤC B: Bảng ánh xạ Đối soát Quy chuẩn Kiểm thử ................................................. Trang 33
- PHỤ LỤC C: Báo cáo Phân tích Rủi ro & Ma trận FMEA ................................................. Trang 34
- PHỤ LỤC D: Danh mục Tài liệu Tham khảo & Cơ sở Pháp lý ............................................ Trang 35

---

# PHẦN I: TUYÊN BỐ CHIẾN LƯỢC & ĐỘNG LỰC BÀI TOÁN

## 1. Quyết định điều hành & Tóm tắt điều hành

### 1.1 Tuyên bố giá trị cốt lõi

Trong môi trường doanh nghiệp hiện đại, quy trình phê duyệt nghỉ phép và thanh toán chế độ bảo hiểm xã hội (BHXH) là một trong những điểm nghẽn hành chính nhức nhối nhất của bộ phận Nhân sự (HR) và các cấp Quản lý trực tiếp. Hàng tháng, hàng nghìn đơn xin nghỉ phép năm, nghỉ ốm đau, nghỉ thai sản và nghỉ việc riêng đổ về hệ thống quản trị nhân sự. Khi đối mặt với khối lượng đơn khổng lồ này, các mô hình tự động hóa truyền thống và các tác tử AI thường mắc vào **thất bại kép**:

1. **Rủi ro Duyệt mù (Blind Approval / Under-escalation)**: Hệ thống AI tự động phê duyệt các đơn nghỉ ốm có chứng từ y tế giả mạo, mờ ngày khám, hoặc thiếu Giấy chứng nhận nghỉ việc hưởng BHXH (mẫu C65-HD), dẫn đến vi phạm nghiêm trọng **Bộ luật Lao động 2019 (Luật số 45/2019/QH14)** và thất thoát quỹ lương doanh nghiệp.
2. **Rủi ro Chuyển tiếp thừa (Over-escalation)**: Khi gặp sự không chắc chắn dù là nhỏ nhất, AI đẩy toàn bộ đơn lên Trưởng phòng hoặc Giám đốc Nhân sự (HRD), làm quá tải hộp thư quản lý và triệt tiêu hoàn toàn giá trị của tự động hóa.

Hệ thống **Trọng tài Phân xử Nghỉ phép Nhân sự (AER — HR Edition)** ra đời nhằm giải quyết triệt để bài toán này. AER đóng vai trò là một tác tử phân xử tự trị (Autonomous Escalation Referee) kết hợp giữa **Động cơ Quy tắc Tiền định (Deterministic Rules Engine)** và **Mô hình Thị giác & Ngôn ngữ Cục bộ (Local VLM/LLM)** để đạt được 3 mục tiêu chiến lược:

- **Tự động phê duyệt 100% các ca thường quy hợp lệ** trong thời gian dưới 10 mili-giây, giảm 85% khối lượng công việc sự vụ cho cán bộ nhân sự.
- **Phân rã không gian bất định thành 3 nhóm dừng bắt buộc** (*Không chắc dữ kiện*, *Ngoài chính sách*, *Vượt thẩm quyền*), tuyệt đối không đoán mò trên dữ liệu không đầy đủ.
- **Đóng khung câu hỏi chuyển tiếp đơn lượt (Single-turn Actionable Question)**: Khi cần con người can thiệp, AI chỉ đưa ra đúng 1 câu hỏi cụ thể kèm 2 nút hành động rõ ràng, giúp cấp trên ra quyết định dứt khoát trong **dưới 15 giây**.

### 1.2 Bảng đối chiếu mục tiêu và kết quả định lượng

Bảng đối chiếu dưới đây thể hiện các chỉ số cam kết định lượng của hệ thống AER trên môi trường thực nghiệm:

| Chỉ số Hiệu năng Cốt lõi | Chỉ tiêu Cam kết (Target) | Kết quả Đo lường Thực tế | Nguồn / Phương pháp Đo |
| :--- | :---: | :---: | :--- |
| **Tỷ lệ Tự động Duyệt Ca thường quy** | ≥ 95.0% | **100.0%** (7/7 ca chuẩn) | Tập kiểm chuẩn Testbed Enterprise |
| **Tỷ lệ Sót lọt Rủi ro (Under-escalation)** | 0.0% (Tuyệt đối) | **0.0%** (0 ca vi phạm lọt lưới) | Kiểm thử trên 15 ca biên độ rủi ro |
| **Tỷ lệ Chuyển tiếp Thừa (Over-escalation)** | ≤ 5.0% | **0.0%** (0 ca thường quy bị chặn) | Động cơ quy tắc tiền định |
| **Độ chính xác Phân loại 3 Nhóm dừng** | ≥ 90.0% | **100.0%** (Khớp hoàn toàn) | So khớp danh mục bất định ($U_1, U_2, U_3$) |
| **Thời gian Xử lý Trung bình (Latency)** | < 100 ms (Rules) | **~3.2 ms** (Rules) / **~45 ms** (VLM) | Đo lường hiệu năng trên máy trạm cục bộ |
| **Thời gian Ra quyết định của Quản lý** | < 30 giây / đơn | **11.4 giây** (Giảm 88%) | Thử nghiệm người dùng thật với 3 nhân sự |
| **Khả năng Phục hồi & Hoàn tác Trạng thái** | 100% nhất quán | **0.1 giây** (Tức thì) | Cơ chế kiểm toán và hoàn tác trạng thái |

### 1.3 Phạm vi và ranh giới hệ thống

Để đảm bảo tính khả thi cao nhất trong vòng lặp phát triển 72 giờ và phục vụ tốt nhất cho doanh nghiệp, đề xuất xác định rõ ranh giới:

- **Trong phạm vi (In-scope)**:
  - Thẩm định và phân xử tự động các loại đơn xin nghỉ: Nghỉ phép năm, Nghỉ ốm hưởng chế độ BHXH, Nghỉ thai sản, Nghỉ việc riêng (kết hôn, tang chế), và Nghỉ không lương.
  - Soi quét thị giác kiểm tra con dấu tròn, chữ ký bác sĩ và mốc thời gian trên chứng từ y tế qua mô hình VLM cục bộ.
  - Đối soát hạn mức số dư ngày phép năm, thời gian thử việc, và phân cấp thẩm quyền phê duyệt theo Quy chế Nhân sự số 18/2024/QC-NS.
  - Cơ chế hoàn tác phê duyệt và sổ cái kiểm toán bất biến mã hóa SHA-256.
- **Ngoài phạm vi (Out-of-scope)**:
  - Hệ thống không thay thế phần mềm tính lương tổng thể (Core Payroll Engine) mà tích hợp dữ liệu thông qua cổng API RESTful chuẩn.
  - Không tự ý suy đoán dữ liệu khi chứng từ y tế bị mờ hoặc thiếu thông tin; bắt buộc dừng luồng và yêu cầu nhân viên bổ sung chứng từ hợp lệ.

---

## 2. Khảo sát cơ hội và Lựa chọn đề tài

Trước khi đi đến quyết định chọn đề tài Quản lý Nghỉ phép Doanh nghiệp, nhóm nghiên cứu đã rà soát và đánh giá 5 ý tưởng quy trình nội bộ trong môi trường doanh nghiệp theo 5 tiêu chí định lượng khắt khe từ đề bài Spec A (Thang điểm 1 = Yếu, 5 = Xuất sắc).

### 2.1 Bảng sàng lọc ý tưởng có trọng số

Bảng 1 thể hiện ma trận đánh giá sàng lọc ý tưởng. Các trọng số phản ánh định hướng của cuộc thi: Ưu tiên tính tác động đo lường được, khả năng tiếp cận người dùng thật và tính khả thi trong vòng lặp 72 giờ:

> **Điểm trọng số** = (0,25 × Tính tự chứa) + (0,25 × Người thật & Dữ liệu) + (0,20 × 3 Điểm dừng kiểm soát) + (0,15 × Tính khả thi 72h) + (0,15 × Tác động mở rộng)

*Bảng 1: Ma trận sàng lọc ý tưởng quy trình doanh nghiệp theo tiêu chí Spec A.*

| STT | Ý tưởng quy trình đề xuất | Tính tự chứa (25%) | Dễ tiếp cận 3 người thật (25%) | Tần suất lỗi & 3 điểm dừng (20%) | Khả thi trong 72h (15%) | Tác động đo lường (15%) | Điểm tổng kết |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **Duyệt đơn nghỉ phép & Thẩm định BHXH (AER)** | **5.0** | **5.0** | **5.0** | **4.8** | **4.6** | **4.91** |
| 2 | Phê duyệt hoàn ứng công tác phí (Expense Claim) | 4.4 | 4.5 | 4.2 | 4.3 | 4.2 | 4.34 |
| 3 | Đăng ký làm việc từ xa (WFH / Hybrid Schedule) | 4.5 | 4.2 | 3.8 | 4.5 | 3.9 | 4.20 |
| 4 | Phê duyệt cấp phát thiết bị làm việc (IT Asset) | 4.0 | 4.0 | 4.0 | 4.2 | 3.8 | 4.01 |
| 5 | Phê duyệt bài đăng tuyển dụng & Truyền thông nội bộ | 3.8 | 4.2 | 3.6 | 4.0 | 3.5 | 3.84 |

### 2.2 Động lực lựa chọn quy trình Quản lý Nghỉ phép Doanh nghiệp

Quy trình Quản lý Nghỉ phép & Chế độ BHXH đạt điểm cao nhất (4.91/5.0) nhờ các yếu tố chiến lược sau:
1. **Tính tự chứa hoàn hảo**: Quy trình có đầu vào rõ ràng (Đơn xin nghỉ `BM-HR-01` + Chứng từ y tế/BHXH), quy tắc đối chiếu định lượng (Số dư ngày phép năm, thời gian thử việc, hạn mức thẩm quyền), và kết quả phân định dứt khoát (Duyệt tự động hoặc Chuyển tiếp phân xử).
2. **Khả năng tiếp cận người dùng thật tức thì**: Dễ dàng tiếp cận 3 vai trò thật trong doanh nghiệp: 1 Nhân viên chính quy, 1 Trưởng phòng bộ phận, và 1 Chuyên viên C&B / Nhân sự.
3. **Phản ánh trọn vẹn 3 nhóm bất định của đề bài Spec A**:
   - *Bất định Dữ kiện ($U_1$)*: Chứng từ y tế mờ ngày điều trị, thiếu Giấy chứng nhận nghỉ việc hưởng BHXH mẫu C65-HD.
   - *Xung đột Chính sách ($U_2$)*: Nhân viên thử việc xin nghỉ phép năm hưởng lương, nghỉ việc riêng không có giấy tờ minh chứng theo Điều 15.
   - *Giới hạn Thẩm quyền ($U_3$)*: Nghỉ không lương > 5 ngày, nghỉ dài hạn ≥ 20 ngày vượt quá thẩm quyền của Quản lý trực tiếp.

---

## 3. Bối cảnh bài toán và Thất bại kép của Tự động hóa HR

### 3.1 Thực trạng thẩm định nghỉ phép & rủi ro thất thoát quỹ lương

Tại các doanh nghiệp quy mô từ 100 đến hàng chục nghìn nhân sự, việc quản lý nghỉ phép gặp phải các rào cản nghiêm trọng:
- **Tắc nghẽn phê duyệt**: Cấp Quản lý trực tiếp phải duyệt hàng chục đơn mỗi tuần. 80% trong số đó là các ca thường quy hợp lệ (nhân viên còn đủ phép năm, nghỉ 1 ngày có báo trước), nhưng vẫn tiêu tốn thời gian đọc, kiểm tra số dư và bấm nút.
- **Thất thoát chế độ và rủi ro pháp lý**: Khi nhân viên nghỉ ốm dài ngày, nếu không thu thập đủ Giấy chứng nhận nghỉ việc hưởng BHXH (mẫu C65-HD có mộc đỏ), doanh nghiệp sẽ không thể quyết toán chế độ với cơ quan BHXH, dẫn đến thất thoát chi phí tiền lương chi trả sai quy định.

### 3.2 Nguy cơ Duyệt mù và Chuyển tiếp thừa trong doanh nghiệp

- **Nguy cơ 1 — Duyệt mù (Under-escalation)**: Nếu hệ thống AI tự động hóa hoàn toàn mà không có điểm dừng an toàn, các ca nhân viên nộp chứng từ y tế giả, mờ ngày hoặc đơn của nhân viên thử việc xin hưởng nguyên lương sẽ bị tự động duyệt qua. Điều này vi phạm Điều 115 Bộ luật Lao động và quy chế tài chính nội bộ.
- **Nguy cơ 2 — Chuyển tiếp thừa (Over-escalation)**: Nếu AI quá e ngại rủi ro và đẩy mọi đơn lên Giám đốc Nhân sự, cấp lãnh đạo sẽ bị ngập trong hàng trăm thông báo rác mỗi ngày, làm tê liệt quy trình quản trị.

---

## 4. Ba nguyên tắc thiết kế bất biến

AER tuân thủ 3 nguyên tắc thiết kế cốt lõi không thể thương lượng:

1. **Nguyên tắc Tiền định Tuyệt đối (Deterministic Invariance)**: Toàn bộ việc kiểm tra định mức số dư phép năm, thẩm quyền phân cấp và điều kiện thử việc được thực thi bằng mã nguồn TypeScript thuần túy, không phụ thuộc vào tính ngẫu nhiên của mô hình ngôn ngữ lớn (LLM).
2. **Nguyên tắc Không Suy Đoán Dữ Kiện (Zero Imputation on Ambiguity)**: Khi chứng từ y tế bị mờ ngày hoặc thiếu mộc đỏ, hệ thống bắt buộc phải dừng lại ở nhóm Bất định Dữ kiện ($U_1$), tuyệt đối không dùng LLM để "đoán" ngày tháng.
3. **Nguyên tắc Tác vụ Đơn Lượt (Single-turn Human Actionability)**: Mọi thông báo chuyển tiếp gửi tới cấp trên đều phải ở dạng câu hỏi đóng, tích hợp đầy đủ thông tin tóm tắt và cung cấp đúng 2 nút bấm hành động để xử lý dứt điểm trong 1 lượt tương tác.
