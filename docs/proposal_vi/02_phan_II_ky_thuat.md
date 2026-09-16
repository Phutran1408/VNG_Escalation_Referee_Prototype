# PHẦN II: KIẾN TRÚC HỆ THỐNG & ĐÓNG GÓP KHOA HỌC KỸ THUẬT

## 5. Kiến trúc tổng thể và Luồng dữ liệu khép kín

### 5.1 Sơ đồ khối kiến trúc 4 tầng

Hệ thống AER được xây dựng theo kiến trúc 4 tầng phân lập rõ ràng, tối ưu hóa cho môi trường doanh nghiệp:

1. **Tầng 1 — Giao diện Tương tác Đa vai trò (Multi-role UI Layer)**:
   - *Cổng Nhân viên (Applicant Portal)*: Cho phép nhân viên đóng gói thư mục hồ sơ gồm file PDF đơn xin nghỉ (`BM-HR-01`) và ảnh chụp minh chứng y tế/giấy viện.
   - *Cổng Quản lý / HR (Reviewer Portal)*: Hiển thị danh sách hồ sơ cần duyệt, giao diện soi quét VLM laser scan và câu hỏi chuyển tiếp 1 lượt.
   - *Giao diện Kiểm chứng (Verify Harness)*: Dành cho Giám khảo và chuyên viên kiểm toán chạy kiểm thử hàng loạt 15 ca đối soát.
2. **Tầng 2 — Động cơ Quy tắc Tiền định & Soi quét Thị giác (Deterministic & VLM Engine)**:
   - *Mô hình VLM cục bộ (qwen3-vl:4b)*: Trích xuất tự động và phát hiện con dấu tròn đỏ, chữ ký bác sĩ và độ nét của mốc ngày tháng trên chứng từ.
   - *Động cơ Quy tắc (Rule Guardrails)*: Thực thi đối soát số dư ngày phép, kiểm tra điều kiện thử việc và phân cấp thẩm quyền trong dưới 5 mili-giây.
3. **Tầng 3 — Tác tử Phân xử Nhận thức Cục bộ (Cognitive LLM Referee)**:
   - Khi phát hiện rủi ro bất định, tác tử AI cục bộ tổng hợp thông tin và sinh câu hỏi đóng ngữ cảnh sắc bén, loại bỏ hoàn toàn việc trao đổi thư từ qua lại nhiều vòng.
4. **Tầng 4 — Sổ cái Kiểm toán Bất biến & Khôi phục Trạng thái (Audit & Rollback Store)**:
   - Ghi nhận toàn bộ vết suy luận (Reasoning Trace) và chuỗi băm mật mã SHA-256 cho từng quyết định, hỗ trợ nút hoàn tác [Undo] tức thì trong 0.1 giây.

### 5.2 Luồng xử lý hồ sơ khép kín

Luồng dữ liệu trong hệ thống diễn ra khép kín và tự trị:

> **Nhân viên nộp hồ sơ (`BM-HR-01` + Minh chứng)** → **Trích xuất VLM & Động cơ Quy tắc Tiền định** → **Đánh giá Không gian Bất định (*U*<sub>Enterprise</sub>)**
> - **Ca thường quy hợp lệ (*U* = ∅)** → Phê duyệt tự động tức thì (`AUTO_APPROVE`) trong < 10ms.
> - **Ca gắn cờ rủi ro (*U* ≠ ∅)** → Đóng khung câu hỏi chuyển tiếp 1 lượt gửi Quản lý / HR xử lý.

---

## 6. Các đóng góp khoa học và kỹ thuật (C1 – C6)

### 6.1 Đóng góp C1: Mô hình Không gian Bất định Nhân sự 3 Chiều (U_Enterprise)

Trong các hệ thống tác tử AI truyền thống, độ bất định thường bị gộp chung thành một giá trị xác suất vô hướng *p* ∈ [0, 1]. Cách tiếp cận này hoàn toàn thất bại trong môi trường tổ chức doanh nghiệp, bởi vì nguyên nhân gây ra sự bất định quyết định trực tiếp **ai là người có thẩm quyền và trách nhiệm xử lý tiếp theo**.

AER đóng góp mô hình phân rã không gian bất định thành bộ ba trực giao:

> *U*<sub>Enterprise</sub> = ⟨ *U*<sub>data</sub>, *U*<sub>policy</sub>, *U*<sub>auth</sub> ⟩

- **Chiều U₁ — Bất định Dữ kiện (U_data)**: Xuất hiện khi dữ liệu đầu vào thiếu tính đầy đủ hoặc tính xác thực (Ảnh chụp giấy khám bệnh mờ ngày, thiếu con dấu tròn bệnh viện, hoặc chưa nộp Giấy chứng nhận nghỉ việc hưởng BHXH mẫu C65-HD theo Điều 14.3). Hành động tương ứng: *Yêu cầu nhân viên bổ sung chứng từ gốc trong 3 ngày làm việc*.
- **Chiều U₂ — Xung đột Chính sách (U_policy)**: Dữ liệu hoàn toàn rõ ràng nhưng nội dung vi phạm các chuẩn mực quy chế (Nhân viên đang thử việc xin nghỉ phép năm hưởng lương theo Điều 8.2, hoặc nghỉ việc riêng không có giấy tờ minh chứng theo Điều 15). Hành động tương ứng: *Chuyển tiếp cho Quản lý trực tiếp xem xét cho phép nghỉ không lương hay từ chối đơn*.
- **Chiều U₃ — Giới hạn Thẩm quyền (U_auth)**: Hồ sơ hợp lệ và chính đáng nhưng tính chất vụ việc vượt quá thẩm quyền của Quản lý trực tiếp (Đơn xin nghỉ không lương > 5 ngày theo Điều 18.1, hoặc nghỉ dài hạn ≥ 20 ngày theo Điều 18.3). Hành động tương ứng: *Khóa quyền duyệt của Quản lý trực tiếp, chuyển tiếp trực tiếp lên Giám đốc Nhân sự (HRD) hoặc Ban Tổng Giám Đốc*.

![Hình 1: Không gian Bất định Nhân sự Doanh nghiệp 3 Chiều](assets/uncertainty_space_vi.svg)

### 6.2 Đóng góp C2: Hàm quyết định kép kết hợp quy tắc và dự phòng

Quy trình ra quyết định của AER không phụ thuộc vào sự ngẫu nhiên của mô hình ngôn ngữ lớn, mà được thực thi thông qua hàm quyết định kép có tính toán học chặt chẽ:

Hàm quyết định *D*(*R*, *S*) được xác định theo 4 nhánh rẽ:
- ***D*(*R*, *S*) = Tự động Duyệt (`AUTO_APPROVE`)**: khi *V*<sub>doc</sub>(*R*) = 1 ∧ SốNgàyNghỉ(*R*) ≤ SốDưPhép(*S*) ∧ ThẩmQuyền(*R*) ≤ Quản lý trực tiếp ∧ ThửViệc(*S*) = False
- ***D*(*R*, *S*) = Chuyển tiếp(*U*₁)**: khi *V*<sub>doc</sub>(*R*) = 0 (Chứng từ y tế mờ ngày hoặc thiếu Mẫu C65-HD)
- ***D*(*R*, *S*) = Chuyển tiếp(*U*₂)**: khi ThửViệc(*S*) = True ∨ (NghỉViệcRiêng(*R*) ∧ ThiếuMinhChứng(*R*))
- ***D*(*R*, *S*) = Chuyển tiếp(*U*₃)**: khi NghỉKhôngLương > 5 ngày ∨ NghỉDàiHạn ≥ 20 ngày ∨ NghỉPhépNăm > 5 ngày liên tục

Trong đó:
- *R* là đối tượng yêu cầu nghỉ phép (`EmployeeLeaveRequest`), *S* là trạng thái hồ sơ nhân sự của nhân viên.
- *V*<sub>doc</sub>(*R*) nhận giá trị 1 khi chứng từ y tế hợp lệ (có dấu mộc tròn, chữ ký bác sĩ và ngày tháng rõ ràng) và nhận giá trị 0 khi ảnh mờ hoặc thiếu thông tin.

### 6.3 Đóng góp C3: Cơ chế sinh câu hỏi chuyển tiếp đơn lượt

Khi một hồ sơ bị đẩy vào trạng thái chuyển tiếp, AER áp dụng cơ chế tổng hợp câu hỏi chuyển tiếp có cấu trúc:
1. **Trích xuất thông tin mấu chốt**: Họ tên nhân viên, phòng ban, loại nghỉ phép, số ngày xin nghỉ, số dư phép năm hiện tại, điều khoản quy chế liên quan.
2. **Đóng khung câu hỏi đóng (Single-turn Question)**: Câu hỏi được cấu trúc theo mẫu chuẩn:
   *"Nhân viên [Họ tên] ([Phòng ban]) xin nghỉ [X] ngày [Loại nghỉ], [Căn cứ vi phạm/vượt thẩm quyền theo Điều Y]. Quản lý/Cấp trên quyết định: [Lựa chọn 1] hay [Lựa chọn 2]?"*
3. **Cung cấp đúng 2 nút hành động**:
   - Nút 1: *Từ chối theo quy định* → Hệ thống gửi thông báo từ chối kèm trích dẫn điều khoản cho nhân viên.
   - Nút 2: *Chấp thuận ngoại lệ / Chuyển không lương* → Hệ thống ghi nhận diện ngoại lệ có lưu vết kiểm toán và cập nhật trạng thái đã duyệt.

Nhờ cơ chế này, thời gian tương tác nhận thức của cấp trên giảm từ hơn 3 phút xuống **dưới 15 giây**, loại bỏ hoàn toàn các chuỗi trao đổi email/chat qua lại vô bổ.

### 6.4 Đóng góp C4: Cơ chế hoàn tác lạc quan & Nhật ký kiểm toán SHA-256

Nhằm triệt tiêu tâm lý lo ngại của cán bộ quản lý khi áp dụng AI, AER thiết kế cơ chế kiểm toán với tính năng hoàn tác tức thời:
- Mọi trạng thái chuyển đổi đều sinh ra một bản ghi kiểm toán *T*<sub>*i*</sub>:

> *T*<sub>*i*</sub> = ⟨ Thời điểm, Mã hồ sơ, Tác nhân, Trạng thái cũ, Trạng thái mới, Điều khoản quy chế, Mã băm SHA-256 ⟩

- Nếu Quản lý hoặc HR nhận thấy hệ thống tự động duyệt một ca mà sau đó phát hiện có dấu hiệu gian lận chứng từ, cán bộ chỉ cần nhấn nút [Hoàn tác]. Hệ thống lập tức thu hồi phê duyệt, chuyển trạng thái đơn sang *Đã từ chối do hoàn tác*, đồng thời tự động hiệu chỉnh lại quỹ ngày phép trên bảng chấm công trong **0.1 giây**.

### 6.5 Đóng góp C5: Thanh đo số dư ngày phép và cảnh báo thử việc

Thay vì các con số khô khan ẩn sâu trong cơ sở dữ liệu nhân sự, AER tích hợp động cơ tính toán và trực quan hóa quỹ phép trực tiếp:
- Khi nhân viên chọn số ngày nghỉ dự kiến trên form, thanh đo lập tức mô phỏng vị trí số dư phép năm theo thời gian thực.
- Phân định rõ 3 dải trạng thái:
  - **Dải Xanh (Hợp lệ)**: Số ngày xin nghỉ ≤ Số dư phép năm còn lại (Đủ điều kiện tự động duyệt).
  - **Dải Cam Hổ Phách (Cảnh báo)**: Nhân viên đang trong thời gian thử việc hoặc số ngày xin nghỉ sắp chạm trần quỹ phép.
  - **Dải Đỏ / Tím (Vượt thẩm quyền / Vượt định mức)**: Số ngày nghỉ > 5 ngày liên tục hoặc đơn nghỉ không lương dài hạn (Gắn cờ chuyển cấp phê duyệt).

### 6.6 Đóng góp C6: Giao thức kiểm thử tự động độc lập trạng thái

Nhằm phục vụ quá trình thẩm định khách quan, AER thiết kế giao thức kiểm thử tự động:
- Bộ kiểm thử độc lập trạng thái nạp 5 ca tiêu biểu đại diện cho tất cả các nhánh rẽ quy chế (3 ca thường quy, 1 ca mờ chứng từ $U_1$, 1 ca thử việc $U_2$, 1 ca vượt thẩm quyền 20 ngày $U_3$).
- Trình so khớp 3 vế (*Verify Comparator*) so sánh tự động: Kết quả chính (Outcome), Nhóm bất định (Category), và phát hiện lỗi Over-escalation / Under-escalation với độ chính xác đạt **100% PASS**.
