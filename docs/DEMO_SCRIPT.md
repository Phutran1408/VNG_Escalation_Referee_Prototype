# KỊCH BẢN QUAY VIDEO DEMO SẢN PHẨM (DEMO SCRIPT)
**Hackathon MLAI 2026 · Bảng 1: OrganizationAI · Spec A: "The Escalation Referee"**  
**Quy trình thẩm định:** DUYỆT ĐƠN XIN NGHỈ  
**Thời lượng đề xuất:** Bản ngắn gọn 90 giây (bắt buộc) & Bản chi tiết 3 phút

---

## 1. KỊCH BẢN 90 GIÂY: CHẤM THI LIVE & THẨM ĐỊNH TỰ ĐỘNG

| Mốc Thời Gian | Thao Tác Trực Quan Trên Màn Hình | Lời Thoại Thuyết Minh (Voiceover Tiếng Việt) |
| :--- | :--- | :--- |
| **00:00 – 00:15** *(Mở đầu)* | Mở Live URL trên trình duyệt. Màn hình hạ cánh trực tiếp tại **Verify Harness (Giám Khảo)**. Con trỏ lia qua dòng tiêu đề và 3 huy hiệu: *SV4 Verify Harness · Spec A · 0% Over-escalation*. | *"Xin chào Ban Giám khảo. Đây là sản phẩm The Escalation Referee — Hệ thống phân xử và phê duyệt tự động đơn xin nghỉ học của sinh viên cho Spec A, Bảng 1 MLAI 2026."* |
| **00:15 – 00:30** *(Demo Ca Thường Quy)* | Tại khu vực **Giám Khảo Tự Nhập Ca Mới**, bấm nút mẫu: **Ca 1: Thường quy hợp lệ**. Nhấn nút vàng **⚡ Phân Xử Bằng Agent Thật**. Kết quả hiện lên xanh lá: `✓ TỰ ĐỘNG DUYỆT (AUTO_APPROVE)` trong 6ms. | *"Với các ca thường quy hợp lệ — như sinh viên bị sốt 1 ngày kèm giấy khám bệnh rõ ràng — Agent lập tức tự động phê duyệt trong 6ms, căn cứ đúng Điều 2.1 Quy chế. Tỷ lệ Over-escalation đạt chuẩn 0%, hoàn toàn giải phóng thời gian cho giảng viên."* |
| **00:30 – 00:55** *(Demo 3 Nhóm Dừng Bất Định)* | Lần lượt bấm: <br>1. **Preset 2 (Mờ ngày)** → Ra kết quả Amber: `Không chắc dữ kiện`, câu hỏi: *"Sinh viên xin nghỉ từ ngày nào?"*<br>2. **Preset 3 (>20% vắng)** → Ra kết quả Đỏ: `Ngoài chính sách`, câu hỏi: *"Đã vắng 4/15 buổi (26.7%), có xét ngoại lệ cấm thi không?"*<br>3. **Preset 4 (Bảo lưu)** → Ra kết quả Tím: `Vượt thẩm quyền`, câu hỏi: *"Thuộc thẩm quyền Trưởng khoa. Chuyển Trưởng khoa phê duyệt?"* | *"Khi phát sinh rủi ro, Agent không suy đoán bừa bãi mà phân định chính xác 3 nhóm dừng bất định: <br>- Nhóm 1: Giấy khám mờ ngày → Hỏi bổ sung mốc thời gian.<br>- Nhóm 2: Vắng vượt quá 20% số buổi → Hỏi giảng viên có xét đặc biệt cấm thi không.<br>- Nhóm 3: Bảo lưu cả học kỳ → Chuyển đúng thẩm quyền Trưởng khoa. Mọi câu hỏi đều chuẩn hóa đúng 1 lượt hành động."* |
| **00:55 – 01:15** *(Giám Khảo Tự Gõ Ca Mới)* | Bấm **"Đặt lại / Xóa trắng form"**. Tự gõ: Mã SV: `SV-CHAMTHI`, Họ tên: `Giám Khảo Test`, Số buổi: `1`, Đã vắng: `3`, Tổng: `15`. Bấm **⚡ Phân Xử Bằng Agent Thật**. Kết quả ra ngay lập tức. Bấm **"📌 Ghim ca này"** để đưa vào bảng. | *"Đặc biệt, hệ thống KHÔNG hề hardcode kết quả. Giám khảo có thể tự gõ bất kỳ ca mới nào — ví dụ sinh viên đã vắng 3 buổi, xin thêm 1 buổi thành 4/15 buổi — Agent tính toán động theo thời gian thực và phân loại ngay vào nhóm Ngoài chính sách."* |
| **01:15 – 01:30** *(Kiểm chứng hàng loạt & Kết luận)* | Cuộn xuống bảng kiểm chứng. Bấm **"Chạy Kiểm Chứng Hàng Loạt"** (15 ca). Cột trạng thái xanh rực: `15/15 PASS (100%)`. Bấm **"📥 Xuất JSON"**. | *"Chạy kiểm chứng hàng loạt trên toàn bộ 15 ca toàn diện: đạt độ chính xác 100%, 0% over-escalation, bảo đảm tuyệt đối nguyên tắc bất định. Hệ thống sẵn sàng xuất biên bản JSON minh bạch cho hội đồng thẩm định. Cảm ơn Ban Giám khảo!"* |

---

## 2. KỊCH BẢN CHI TIẾT 3 PHÚT (BỔ SUNG THƯ MỤC CẤP TRÊN & VLM)

### Phần 1: Tổng quan bài toán & Kiến trúc Hybrid (00:00 – 00:45)
- Giới thiệu giao diện tổng thể và bài toán duyệt đơn xin nghỉ học của Spec A.
- Giải thích kiến trúc 2 tầng:
  - **Tầng 1 (Deterministic Rules Engine)**: Tính toán số học chuyên cần (>20%), rà soát mốc ngày y tế, kiểm tra phân cấp thẩm quyền (≤ 6ms).
  - **Tầng 2 (Local LLM Qwen)**: Chạy offline để tạo câu hỏi leo thang 1 lượt hành động.
- Trình bày 3 nhóm dừng bất định:
  - Dừng 1: Không chắc dữ kiện
  - Dừng 2: Ngoài chính sách
  - Dừng 3: Vượt thẩm quyền

### Phần 2: Thao tác thực nghiệm trên Verify Harness (00:45 – 02:00)
- Thao tác chi tiết trên **Verify Harness**:
  1. Thử nghiệm ca thường quy → `AUTO_APPROVE` (0% Over-escalation).
  2. Thử nghiệm ca mờ ngày → `ESCALATE (Không chắc dữ kiện)`.
  3. Thử nghiệm ca vắng quá 20% (4/15 buổi) → `ESCALATE (Ngoài chính sách)`.
  4. Thử nghiệm ca bảo lưu cả kỳ → `ESCALATE (Vượt thẩm quyền)`.
- Nhập trực tiếp ca mới của Giám khảo:
  - Cho thấy các trường nhập liệu tự do và tính năng ghim ca vào bảng báo cáo có nhãn tím `[GIÁM KHẢO]`.
  - Minh chứng mã nguồn gọi hàm `refereeAgent.evaluateAsync(...)` hoàn toàn dynamic.

### Phần 3: Trải nghiệm Thư mục Cấp trên & Thị giác AI (02:00 – 02:40)
- Chuyển sang tab `🛡️ Trưởng Khoa / GV`:
  - Mở các folder hồ sơ sinh viên thực tế (kèm ảnh chụp giấy khám bệnh, đơn thuốc, giấy triệu tập).
  - Trình diễn mô hình thị giác AI (VLM) đọc ảnh chứng từ y tế, bóc tách ngày khám và đối chiếu tự động với ngày sinh viên xin nghỉ.
  - Thao tác phê duyệt / từ chối hoặc ghi đè (Human Override) có lưu vết kiểm toán.

### Phần 4: Tổng kết & Xuất báo cáo kiểm thử (02:40 – 03:00)
- Quay lại Verify Harness, bấm **Chạy Kiểm Chứng Hàng Loạt (15 Ca)** → Đạt 100% Pass.
- Bấm tải **Xuất JSON** báo cáo audit log.
- Khẳng định 3 cam kết chất lượng:
  1. **0% Over-escalation**: Giữ vững hiệu quả tự động hóa.
  2. **100% Bảo mật**: Không gửi dữ liệu người dùng lên cloud bên ngoài.
  3. **Minh bạch & Bất biến**: Mọi quyết định đều có căn cứ quy chế pháp lý rõ ràng.

---

## 3. CHECKLIST KỸ THUẬT KHI QUAY VIDEO
- [ ] Trình duyệt đặt tỷ lệ zoom 100%, độ phân giải Full HD (1920x1080) hoặc 2K.
- [ ] Live URL mở sẵn tab `Verify Harness (Giám Khảo)`.
- [ ] Âm thanh rõ ràng, không lẫn tạp âm, giọng điệu tự tin, dứt khoát.
- [ ] Khi bấm nút phân xử, giữ chuột cố định 1-2 giây để người xem nhìn rõ tốc độ thực thi (6ms) và các nhãn kết quả.
- [ ] Chuẩn bị sẵn file JSON đã tải về để minh họa tính năng xuất biên bản.
