# KỊCH BẢN PHIM SHOWCASE 5 PHÚT (300 GIÂY)
## "THE ESCALATION REFEREE — HỆ THỐNG PHÂN XỬ DUYỆT NGHỈ PHÉP THÔNG MINH"
### Đề bài Bảng 1 — OrganizationAI · Spec A · Hợp tác cùng VNG

---

## ⏱️ CẤU TRÚC PHÂN BỔ THỜI LƯỢNG TỔNG THỂ (300 GIÂY = 5 PHÚT)

| Màn (Act) | Phân cảnh | Thời lượng | Trọng tâm nội dung |
| :--- | :--- | :---: | :--- |
| **MÀN 1: CASE STUDY & BỐI CẢNH** | **Cảnh 1: Case Study & Điểm gãy của AI Agent**<br>• Xu hướng số hóa & AI Agent trong tổ chức<br>• Lỗ hổng chí mạng: Agent không được tự quyết những gì?<br>• Rủi ro "Duyệt Mù" & Phê duyệt trái thẩm quyền | **60s** (0:00 - 1:00) | Giới thiệu case study thực tế, vấn đề nhức nhối khi giao phó toàn bộ cho AI Agent tự quyết định trong doanh nghiệp & đại học. |
| **MÀN 2: CỔNG NỘP ĐƠN (APPLICANT VIEW)** | **Cảnh 2: Giao diện Nhân viên / Sinh viên**<br>• Biểu mẫu chuẩn BM-HR-01 & BM-DT-02 trông như thế nào?<br>• Bằng chứng y tế: Mộc đỏ bệnh viện, chữ ký bác sĩ<br>• Điền thông tin cụ thể (ngày nghỉ, lý do, cam kết) & Đóng gói thư mục tự động | **75s** (1:00 - 2:15) | Trình diễn chi tiết cổng nộp đơn của người dùng cuối: đơn chuẩn, minh chứng thực tế, cách đóng gói bảo mật phân quyền. |
| **MÀN 3: CỔNG CẤP TRÊN & VLM QUÉT SÂU** | **Cảnh 3: Giao diện Cấp trên / Trưởng khoa & Laser VLM**<br>• Màn hình buồng lái xét duyệt của Trưởng phòng / Trưởng khoa<br>• Bấm nút kích hoạt Agent Check (Qwen3-VL 4B Vision)<br>• Từng bước quét laser VLM trích xuất chữ OCR $\rightarrow$ Soi mộc đỏ tròn $\rightarrow$ Soi chữ ký bác sĩ $\rightarrow$ Bật các tick xanh pháp lý | **80s** (2:15 - 3:35) | Trình diễn tương tác của cấp trên, hoạt họa tia laser quét trực quan, bounding box bắt từng chi tiết và bật các badge xanh xác thực. |
| **MÀN 4: ĐỐI SOÁT & 3 ĐIỂM DỪNG THÔNG MINH** | **Cảnh 4: Đối chiếu logic & Kích hoạt Smart Stop**<br>• Bắn tia kết nối chéo giữa Đơn PDF và Bằng chứng y tế<br>• Cảnh báo màu hổ phách bùng sáng: Khoan đã!<br>• 3 Thẻ Điểm Dừng Thông Minh (Không chắc dữ kiện / Ngoài chính sách / Vượt thẩm quyền) | **45s** (3:35 - 4:20) | Cốt lõi của Spec A: AI biết khi nào phải dừng lại, giữ hồ sơ và đặt câu hỏi phân xử cụ thể cho con người. |
| **MÀN 5: CON NGƯỜI QUYẾT ĐỊNH & KIỂM THỬ HÀNG LOẠT** | **Cảnh 5: Phán quyết 1 lượt, Verify Harness & Outro**<br>• Con người ra quyết định: Từ chối đơn hoặc Phê duyệt đặc cách<br>• Chạy Verify Harness kiểm chứng 16 ca thực tế tốc độ 5ms<br>• Kết bài: 0% Duyệt mù · Vận hành an toàn cùng VNG | **40s** (4:20 - 5:00) | Con người là trọng tài tối cao, lưu vết audit trail bất biến, kiểm chứng tính chuẩn xác trên hàng loạt ca thử nghiệm. |

---

## 🎬 CHI TIẾT TỪNG PHÂN CẢNH, HÌNH ẢNH (VISUAL) & LỜI THOẠI (SPEECH SCRIPT)

### 🔴 MÀN 1: CASE STUDY & BỐI CẢNH THỰC TẾ (0:00 – 1:00 · 60 Giây)

#### Phân cảnh 1.1: Xu hướng số hóa & Trợ thủ AI Agent (0:00 - 0:25 · 25s)
- **Hình ảnh trên màn hình (Visual):**
  - Mở đầu bằng không gian 3D hiện đại, dòng chữ chuyển động: *Chuyển đổi số · Kỷ nguyên Tự động hóa*.
  - Biểu tượng **AI Agent** kết nối với hệ thống quản trị nhân sự và đại học.
  - Số liệu thống kê sinh động: *Hơn 85% tổ chức đang ứng dụng AI Agent vào xử lý quy trình vận hành và giấy tờ*.
- **Lời thoại thuyết minh:**
  > *"Trong làn sóng chuyển đổi số hiện nay, các tổ chức từ doanh nghiệp hàng đầu đến các trường đại học lớn đều đang tích cực triển khai các AI Agent như một trợ thủ đắc lực. AI Agent có thể tự động bóc tách email, phân loại hồ sơ, tổng hợp dữ liệu và hỗ trợ giải phóng hàng ngàn giờ lao động thủ công mỗi tháng."*

#### Phân cảnh 1.2: Lỗ hổng chết người — Những điều Agent TUYỆT ĐỐI KHÔNG ĐƯỢC tự quyết (0:25 - 1:00 · 35s)
- **Hình ảnh trên màn hình (Visual):**
  - Chuyển cảnh đột ngột sang tông màu cảnh báo tối & đỏ.
  - Case study xuất hiện: *Hồ sơ xin nghỉ dài ngày kèm viện phí / Giấy khám bệnh chụp mờ*.
  - Hình ảnh mô phỏng một AI Agent truyền thống "tự tin giả tạo" tự động bấm nút `APPROVE` một lá đơn giả mạo con dấu hoặc một đơn bảo lưu cả học kỳ vượt quá thẩm quyền.
  - Chữ lớn xuất hiện trên vạch sáng: **DUYỆT MÙ (BLIND APPROVAL)** và **VƯỢT TRẦN THẨM QUYỀN**.
- **Lời thoại thuyết minh:**
  > *"Tuy nhiên, một câu hỏi sống còn đặt ra: **Liệu ta có thể giao toàn quyền quyết định cho AI hay không?**  
  > Câu trả lời dứt khoát là: **KHÔNG.** Có những ranh giới pháp lý và quy chế mà AI Agent tuyệt đối không được phép tự tiện phê duyệt!  
  > Hãy tưởng tượng một case study thực tế: Một nhân viên nộp đơn xin nghỉ ốm 20 ngày với giấy tờ mờ nhòe, hoặc một sinh viên đã nghỉ quá 20% số tiết quy định xin nghỉ tiếp, thậm chí xin bảo lưu cả học kỳ. Nếu một AI Agent tự ý phê duyệt, tổ chức sẽ lập tức đối mặt với thất thoát ngân sách bảo hiểm xã hội, phá vỡ quy chế đào tạo và tạo ra tiền lệ sai phạm nghiêm trọng.  
  > Đó chính là lý do **Escalation Referee** ra đời — Hệ thống phân xử thông minh biết chính xác **KHI NÀO PHẢI DỪNG LẠI** để con người quyết định."*

---

### 🔵 MÀN 2: CỔNG TIẾP NHẬN HỒ SƠ — APPLICANT PORTAL (1:00 – 2:15 · 75 Giây)

#### Phân cảnh 2.1: Giao diện nộp đơn của Nhân viên / Sinh viên (1:00 - 1:25 · 25s)
- **Hình ảnh trên màn hình (Visual):**
  - Chiếc Laptop 3D mở ra mượt mà, hiển thị **Cổng Nộp Đơn (Applicant Portal)**.
  - Header xanh biển hiện đại: `👤 Cổng Nộp Đơn — Sinh Viên / Nhân Viên · Phân Quyền Riêng Tư`.
  - Hiển thị rõ ràng nguyên tắc: Cấp dưới chỉ thấy và nộp hồ sơ của chính mình, hoàn toàn cách ly bảo mật thông tin so với các nhân sự khác.
- **Lời thoại thuyết minh:**
  > *"Trước hết, hãy bước vào giao diện của người nộp đơn — dù là cán bộ nhân viên trong công ty hay sinh viên tại giảng đường.  
  > Tại Cổng Nộp Đơn, tính năng phân quyền riêng tư được thiết lập nghiêm ngặt: người nộp chỉ quản lý gói hồ sơ của riêng mình. Quy trình yêu cầu một cấu trúc đóng gói tiêu chuẩn: **Bắt buộc 1 file PDF đơn xin nghỉ theo mẫu chuẩn**, đi kèm **các tài liệu minh chứng y tế bổ sung**."*

#### Phân cảnh 2.2: Biểu mẫu chuẩn BM-HR-01 / BM-DT-02 trông như thế nào? (1:25 - 1:45 · 20s)
- **Hình ảnh trên màn hình (Visual):**
  - Modal **Biểu Mẫu Chuẩn** mở lên nổi bật giữa màn hình.
  - Phóng to chi tiết tờ đơn chuẩn Quốc gia:
    - Tiêu ngữ: *CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — Độc lập – Tự do – Hạnh phúc*.
    - Mã biểu mẫu: `BM-HR-01 (Doanh nghiệp)` hoặc `BM-DT-02 (Trường đại học)`.
    - Các trường định danh: Mã số nhân viên/MSSV, Họ tên, Phòng ban/Khoa viện, Thời gian nghỉ cụ thể từ ngày đến ngày, Lý do nghỉ và Phần cam kết bàn giao công việc / kế hoạch học bù.
- **Lời thoại thuyết minh:**
  > *"Để tránh dữ liệu rác, hệ thống quy chuẩn hóa biểu mẫu: BM-HR-01 đối với doanh nghiệp và BM-DT-02 đối với trường đại học.  
  > Tờ đơn chứa đầy đủ căn cứ pháp lý: từ thông tin cá nhân, thời gian nghỉ chính xác từ ngày nào đến ngày nào, lý do cụ thể, cho đến chữ ký cam kết bàn giao công việc hoặc kế hoạch học bù. Việc chuẩn hóa này giúp OCR trích xuất dữ liệu với độ chính xác tuyệt đối."*

#### Phân cảnh 2.3: Bằng chứng y tế: Con dấu mộc đỏ & Chữ ký bác sĩ (1:45 - 2:15 · 30s)
- **Hình ảnh trên màn hình (Visual):**
  - Hiển thị ảnh chụp thực tế **Giấy chứng nhận nghỉ việc hưởng BHXH (Mẫu CT07)** hoặc **Giấy ra viện**.
  - Con trỏ chuột kéo thả `don_xin_nghi.pdf` vào vùng Dropzone 1.
  - Tiếp tục kéo thả ảnh chụp `bang_chung_ct07.jpg` vào vùng Dropzone 2.
  - Hiệu ứng đóng gói thư mục tự động: `📁 case_01_le_thi_phuong/` được nén lại và cấp mã tiếp nhận minh bạch.
  - Phóng to 2 yếu tố bắt buộc trên ảnh: **Con dấu mộc đỏ tròn của cơ sở y tế** và **Chữ ký mực của bác sĩ điều trị**.
- **Lời thoại thuyết minh:**
  > *"Yếu tố cốt lõi của một lá đơn hợp lệ nằm ở minh chứng đính kèm. Đối với nghỉ ốm hoặc thai sản, hồ sơ bắt buộc phải có Giấy chứng nhận nghỉ việc hưởng BHXH Mẫu CT07 hoặc Giấy ra viện có giá trị pháp lý.  
  > Minh chứng bắt buộc phải hội tụ đủ hai điều kiện: **Thứ nhất, con dấu mộc đỏ tròn hợp pháp của bệnh viện hoặc trạm y tế phường. Thứ hai, chữ ký sống kèm họ tên rõ ràng của bác sĩ điều trị.**  
  > Người nộp chỉ cần kéo thả đơn PDF và ảnh minh chứng. Hệ thống tự động đóng gói toàn bộ vào một thư mục hồ sơ riêng biệt và gửi thẳng đến cấp thẩm quyền."*

---

### 🟢 MÀN 3: CỔNG CẤP TRÊN & CÔNG NGHỆ LASER VLM QUÉT SÂU (2:15 – 3:35 · 80 Giây)

#### Phân cảnh 3.1: Giao diện Cấp trên / Trưởng khoa (Reviewer Portal) (2:15 - 2:40 · 25s)
- **Hình ảnh trên màn hình (Visual):**
  - Laptop chuyển đổi mượt mà sang tab vai trò: `🛡️ Cấp Trên (Trưởng Phòng / Trưởng Khoa)`.
  - Bên trái: Danh sách hàng chờ các thư mục hồ sơ xin nghỉ (`case_01_le_thi_phuong`, `case_02_truong_minh_tri`,...).
  - Bên phải: Màn hình đối soát song song (Split-screen) — Một bên là thông tin Đơn PDF, một bên là Ảnh chụp bằng chứng y tế.
  - Nút bấm nổi bật với biểu tượng tia sét: `⚡ Chạy Agent Check Cho Case Này`.
- **Lời thoại thuyết minh:**
  > *"Bây giờ, hãy chuyển sang góc nhìn của Cấp xét duyệt — Trưởng phòng ban trong doanh nghiệp hoặc Trưởng khoa, Giảng viên tại trường đại học.  
  > Màn hình cấp xét duyệt được thiết kế trực quan chia đôi: bên trái là danh sách hàng đợi hồ sơ, bên phải là không gian đối soát song song giữa nội dung đơn xin nghỉ và tài liệu minh chứng.  
  > Thay vì phải căng mắt đọc hàng trăm trang tài liệu mỗi ngày, cấp trên chỉ cần nhấn một nút duy nhất: **Agent Check**."*

#### Phân cảnh 3.2: Cơ chế VLM quét sâu tài liệu trông như thế nào? (2:40 - 3:10 · 30s)
- **Hình ảnh trên màn hình (Visual):**
  - Con trỏ chuột nhấp vào nút `⚡ Agent Check`.
  - Trạng thái kích hoạt: `Qwen3-VL:4b Vision Inspection · Local Ollama (0.8s)`.
  - **Tia laser màu xanh cyan phát sáng** quét dọc từ đỉnh xuống đáy của bức ảnh y tế 2K siêu nét.
  - Bounding Box động khoanh vùng chuẩn xác từng vị trí thực tế trên chứng từ:
    - Hộp viền đỏ bắt chuẩn xác con dấu đỏ: **TYT P. Hòa Cường Nam (99.4%)**.
    - Hộp viền đỏ bắt chuẩn xác chữ ký bác sĩ: **BS. Khương Linh Nhi (98.8%)**.
    - Hộp viền xanh bắt trúng chẩn đoán y khoa: **Nhiễm SARS-CoV-2 (10 ngày)**.
- **Lời thoại thuyết minh:**
  > *"Ngay khi bấm nút, mô hình thị giác máy tính cục bộ Qwen3-VL 4B lập tức được đánh thức.  
  > Hãy quan sát tia laser xanh đang quét trực tiếp trên tài liệu y tế độ phân giải cao:  
  > Không chỉ đọc text thông thường, mạng nơ-ron thị giác bóc tách ngữ nghĩa không gian: Tia laser quét qua và khoanh vùng chuẩn xác con dấu mộc đỏ với độ tin cậy 99.4%, nhận diện chữ ký bác sĩ Khương Linh Nhi với độ tin cậy 98.8%, và trích xuất chuẩn xác mã chẩn đoán: Nhiễm SARS-CoV-2 với thời gian chỉ định nghỉ 10 ngày."*

#### Phân cảnh 3.3: Bật các dấu Tick xanh pháp lý & Trích xuất OCR toàn văn (3:10 - 3:35 · 25s)
- **Hình ảnh trên màn hình (Visual):**
  - Ngay sau tia quét laser, 2 huy hiệu xanh lá cây bừng sáng:
    - `[✓ CÓ MỘC ĐỎ TRÒN]`
    - `[✓ CÓ CHỮ KÝ BÁC SĨ]`
  - Bảng trích xuất OCR văn bản tự động điền đầy đủ các trường: Họ tên bệnh nhân, Cơ sở y tế cấp, Ngày bắt đầu (21/01/2022) và Ngày kết thúc (30/01/2022).
  - Tốc độ xử lý hiển thị trực tiếp: `0.8 giây · Chạy hoàn toàn On-Premise/Local, bảo mật 100% không lọt dữ liệu ra ngoài`.
- **Lời thoại thuyết minh:**
  > *"Toàn bộ kết quả thẩm định được chuẩn hóa thành các bằng chứng thị giác trực quan: hai dấu tick xanh pháp lý lập tức được xác nhận — **Có con dấu đỏ hợp lệ, có chữ ký bác sĩ đầy đủ.**  
  > Toàn bộ thông tin từ cơ sở y tế đến thời gian nghỉ được số hóa tức thì chỉ trong 0.8 giây. Đặc biệt, quá trình này diễn ra hoàn toàn cục bộ trên máy chủ nội bộ, đảm bảo tính bảo mật và quyền riêng tư y tế tuyệt đối cho nhân sự."*

---

### 🟡 MÀN 4: DUYỆT 16 CASE HÀNG LOẠT, CẢNH BÁO "KHOAN ĐÃ" & 3 ĐIỂM DỪNG (3:35 – 4:20 · 45 Giây)

#### Phân cảnh 4.1: Chạy Thẩm Định Hàng Loạt 16 Ca Kiểm Thử (3:35 - 3:55 · 20s)
- **Hình ảnh trên màn hình (Visual):**
  - Bảng thẩm định hàng loạt (Test Runner) tự động chạy qua toàn bộ 16 ca thực tế từ `case_01` đến `case_16`.
  - Thanh tiến trình duyệt quét lần lượt:
    - Các ca hợp lệ (`case_01`, `case_03`, ...) nhận ngay tick xanh phê duyệt tự động.
    - Tuy nhiên khi duyệt đến các ca bất thường (`case_02`, `case_05`, `case_08`, ...), hệ thống phát hiện các dấu hiệu vi phạm và bất định.
- **Lời thoại thuyết minh:**
  > *"Để kiểm chứng độ tin cậy trong môi trường thực tế quy mô lớn, hệ thống tiến hành duyệt hàng loạt mười sáu hồ sơ kiểm thử.  
  > Các trường hợp chuẩn mực được tự động thông qua trong chớp mắt. Nhưng đối với các bộ hồ sơ có độ phức tạp cao, điều gì sẽ xảy ra khi gặp các ca bất thường?"*

#### Phân cảnh 4.2: Cảnh báo "Khoan đã!" & Phân loại 3 Điểm Dừng Thông Minh (3:55 - 4:20 · 25s)
- **Hình ảnh trên màn hình (Visual):**
  - Ngay trong quá trình duyệt 16 ca, hệ thống bắt gặp các ca bất thường nghiêm trọng (nghỉ 20 ngày, bảo lưu kỳ, minh chứng mờ).
  - Cảnh báo bùng nổ trên màn hình: **"KHOAN ĐÃ! CÓ VẤN ĐỀ BẤT THƯỜNG CẦN PHÂN XỬ..."**
  - 3 Thẻ Điểm Dừng 3D vươn lên với đầy đủ định nghĩa chuẩn:
    1. **Điểm dừng 1: Không Chắc Dữ Kiện** *(Ảnh mờ ngày khám, thiếu trang chứng từ)*
    2. **Điểm dừng 2: Ngoài Chính Sách** *(Nghỉ việc riêng không lý do, vắng quá 20% số tiết)*
    3. **Điểm dừng 3: Vượt Thẩm Quyền** *(Nghỉ > 5 ngày thuộc Giám đốc, bảo lưu học kỳ thuộc Trưởng khoa)*
- **Lời thoại thuyết minh:**
  > *"Khoan đã! Có vấn đề bất thường...  
  > AI không tự tiện duyệt qua! Hệ thống lập tức kích hoạt bộ quy tắc bảo vệ mang tên **Ba Điểm Dừng Thông Minh**:  
  > Dừng loại một khi **Không chắc dữ kiện** do tài liệu mờ nhòe;  
  > Dừng loại hai khi **Ngoài chính sách** như vắng quá hai mươi phần trăm số buổi;  
  > Và dừng loại ba khi **Vượt thẩm quyền** — hồ sơ vượt cấp bắt buộc phải đưa lên đúng cấp lãnh đạo có thẩm quyền giải quyết!"*

---

### 🟣 MÀN 5: CON NGƯỜI QUYẾT ĐỊNH, TEST HARNESS & KẾT THÚC (4:20 – 5:00 · 40 Giây)

#### Phân cảnh 5.1: Con người là trọng tài tối cao & Phán quyết dứt điểm (4:20 - 4:40 · 20s)
- **Hình ảnh trên màn hình (Visual):**
  - Màn hình hiển thị 3 dòng chữ trang trọng, sắc nét:  
    **Con người.**  
    **Những ca vượt thẩm quyền**  
    **sẽ được những người có thẩm quyền xử lí.**
  - Hộp câu hỏi phân xử cụ thể: *"Đơn nghỉ 20 ngày vượt thẩm quyền Quản lý trực tiếp — Bạn có muốn Từ Chối hay Chuyển tiếp phê chuẩn đặc cách?"*.
  - Con trỏ chuột di chuyển dứt khoát đến nút `✕ Từ Chối Đơn` $\rightarrow$ Click $\rightarrow$ Vòng sóng tròn nổ ra $\rightarrow$ Nút chuyển sang trạng thái đỏ xác nhận: `✓ ĐÃ TỪ CHỐI ĐƠN`.
  - Bảng Audit Trail ghi nhận mốc thời gian và chữ ký số bất biến.
- **Lời thoại thuyết minh:**
  > *"Tại điểm dừng này, vị thế thuộc về **Con người**. Những ca vượt thẩm quyền sẽ được chính những người có thẩm quyền xử lý.  
  > Cấp quản lý xem xét câu hỏi phân xử trực quan, đánh giá toàn bộ chứng cứ và đưa ra phán quyết dứt điểm — một cú nhấp chuột từ chối đơn minh bạch, và mọi thao tác đều được lưu vết nhật ký kiểm toán không thể tẩy xóa."*

#### Phân cảnh 5.2: Verify Test Harness 16 ca & Outro VNG (4:40 - 5:00 · 20s)
- **Hình ảnh trên màn hình (Visual):**
  - Giao diện **Verify Harness** xuất hiện. Bấm nút `Chạy Toàn Diện 16 Ca Kiểm Thử`.
  - Thanh tiến trình quét xanh chạy mượt mà từ 1/16 đến 16/16:
    - 7 ca thường quy tự động phê duyệt chuẩn xác.
    - 9 ca bất thường phân loại đúng vào 3 nhóm điểm dừng.
    - Thời gian phản hồi: **5.2 mili-giây / ca**, tỷ lệ chính xác **100%**.
  - Logo **VNG** bừng sáng cùng tiêu đề:  
    **THE ESCALATION REFEREE**  
    **0% Duyệt Mù · Vận Hành An Toàn Cùng VNG.**
- **Lời thoại thuyết minh:**
  > *"Không dừng lại ở một trường hợp đơn lẻ, Verify Harness chứng minh năng lực thẩm định hàng loạt: 16 ca kiểm thử phức tạp được xử lý chỉ trong 5.2 mili-giây với độ chuẩn xác tuyệt đối!  
  > Tự động hóa mạnh mẽ nhưng luôn giữ con người ở vị trí trọng tài tối cao:  
  > **The Escalation Referee — 0% Duyệt mù, Vận hành an toàn cùng VNG.**"*

---

## 💡 HƯỚNG DẪN THU ÂM (VOICEOVER PROMPTS CHO TỪNG FILE)

Để bạn dễ dàng đưa vào các công cụ AI Voice (ElevenLabs, Vbee, CapCut, v.v.), kịch bản được chia thành **5 File Audio chuẩn**, đánh số thứ tự từ `part1.mp3` đến `part5.mp3`:

1. **`part1_case_study.mp3` (60s)**:
   > "Trong làn sóng chuyển đổi số hiện nay, các tổ chức từ doanh nghiệp hàng đầu đến các trường đại học lớn đều đang tích cực triển khai các AI Agent như một trợ thủ đắc lực. AI Agent có thể tự động bóc tách email, phân loại hồ sơ, tổng hợp dữ liệu và hỗ trợ giải phóng hàng ngàn giờ lao động thủ công mỗi tháng. Tuy nhiên, một câu hỏi sống còn đặt ra: Liệu ta có thể giao toàn quyền quyết định cho AI hay không? Câu trả lời dứt khoát là: Không. Có những ranh giới pháp lý và quy chế mà AI Agent tuyệt đối không được phép tự tiện phê duyệt! Hãy tưởng tượng một case study thực tế: Một nhân viên nộp đơn xin nghỉ ốm hai mươi ngày với giấy tờ mờ nhòe, hoặc một sinh viên đã nghỉ quá hai mươi phần trăm số tiết quy định xin nghỉ tiếp, thậm chí xin bảo lưu cả học kỳ. Nếu một AI Agent tự ý phê duyệt, tổ chức sẽ lập tức đối mặt với thất thoát ngân sách bảo hiểm xã hội, phá vỡ quy chế đào tạo và tạo ra tiền lệ sai phạm nghiêm trọng. Đó chính là lý do Escalation Referee ra đời — Hệ thống phân xử thông minh biết chính xác khi nào phải dừng lại để con người quyết định."

2. **`part2_applicant_portal.mp3` (75s)**:
   > "Trước hết, hãy bước vào giao diện của người nộp đơn — dù là cán bộ nhân viên trong công ty hay sinh viên tại giảng đường. Tại Cổng Nộp Đơn, tính năng phân quyền riêng tư được thiết lập nghiêm ngặt: người nộp chỉ quản lý gói hồ sơ của riêng mình. Quy trình yêu cầu một cấu trúc đóng gói tiêu chuẩn: Bắt buộc một file PDF đơn xin nghỉ theo mẫu chuẩn, đi kèm các tài liệu minh chứng y tế bổ sung. Để tránh dữ liệu rác, hệ thống quy chuẩn hóa biểu mẫu: BM-HR-01 đối với doanh nghiệp và BM-DT-02 đối với trường đại học. Tờ đơn chứa đầy đủ căn cứ pháp lý: từ thông tin cá nhân, thời gian nghỉ chính xác từ ngày nào đến ngày nào, lý do cụ thể, cho đến chữ ký cam kết bàn giao công việc hoặc kế hoạch học bù. Việc chuẩn hóa này giúp OCR trích xuất dữ liệu với độ chính xác tuyệt đối. Yếu tố cốt lõi của một lá đơn hợp lệ nằm ở minh chứng đính kèm. Đối với nghỉ ốm hoặc thai sản, hồ sơ bắt buộc phải có Giấy chứng nhận nghỉ việc hưởng bảo hiểm xã hội Mẫu CT07 hoặc Giấy ra viện có giá trị pháp lý. Minh chứng bắt buộc phải hội tụ đủ hai điều kiện: Thứ nhất, con dấu mộc đỏ tròn hợp pháp của bệnh viện hoặc trạm y tế phường. Thứ hai, chữ ký sống kèm họ tên rõ ràng của bác sĩ điều trị. Người nộp chỉ cần kéo thả đơn PDF và ảnh minh chứng. Hệ thống tự động đóng gói toàn bộ vào một thư mục hồ sơ riêng biệt và gửi thẳng đến cấp thẩm quyền."

3. **`part3_reviewer_vlm.mp3` (80s)**:
   > "Bây giờ, hãy chuyển sang góc nhìn của Cấp xét duyệt — Trưởng phòng ban trong doanh nghiệp hoặc Trưởng khoa, Giảng viên tại trường đại học. Màn hình cấp xét duyệt được thiết kế trực quan chia đôi: bên trái là danh sách hàng đợi hồ sơ, bên phải là không gian đối soát song song giữa nội dung đơn xin nghỉ và tài liệu minh chứng. Thay vì phải căng mắt đọc hàng trăm trang tài liệu mỗi ngày, cấp trên chỉ cần nhấn một nút duy nhất: Agent Check. Ngay khi bấm nút, mô hình thị giác máy tính cục bộ Qwen3-VL 4B lập tức được đánh thức. Hãy quan sát tia laser xanh đang quét trực tiếp trên tài liệu y tế độ phân giải cao: Không chỉ đọc text thông thường, mạng nơ-ron thị giác bóc tách ngữ nghĩa không gian: Tia laser quét qua và khoanh vùng chuẩn xác con dấu mộc đỏ với độ tin cậy chín mươi chín phẩy bốn phần trăm, nhận diện chữ ký bác sĩ Khương Linh Nhi với độ tin cậy chín mươi tám phẩy tám phần trăm, và trích xuất chuẩn xác mã chẩn đoán: Nhiễm SARS-CoV-2 với thời gian chỉ định nghỉ mười ngày. Toàn bộ kết quả thẩm định được chuẩn hóa thành các bằng chứng thị giác trực quan: hai dấu tick xanh pháp lý lập tức được xác nhận — Có con dấu đỏ hợp lệ, có chữ ký bác sĩ đầy đủ. Toàn bộ thông tin từ cơ sở y tế đến thời gian nghỉ được số hóa tức thì chỉ trong không phẩy tám giây. Đặc biệt, quá trình này diễn ra hoàn toàn cục bộ trên máy chủ nội bộ, đảm bảo tính bảo mật và quyền riêng tư y tế tuyệt đối cho nhân sự."

4. **`part4_smart_stops.mp3` (45s)**:
   > "Để kiểm chứng độ tin cậy trong môi trường thực tế quy mô lớn, hệ thống tiến hành duyệt hàng loạt mười sáu hồ sơ kiểm thử. Các trường hợp chuẩn mực được tự động thông qua trong chớp mắt. Nhưng đối với các bộ hồ sơ có độ phức tạp cao, điều gì sẽ xảy ra khi gặp các ca bất thường? Khoan đã! Có vấn đề bất thường... AI không tự tiện duyệt qua! Hệ thống lập tức kích hoạt bộ quy tắc bảo vệ mang tên Ba Điểm Dừng Thông Minh: Dừng loại một khi Không chắc dữ kiện do tài liệu mờ nhòe; Dừng loại hai khi Ngoài chính sách như vắng quá hai mươi phần trăm số buổi; Và dừng loại ba khi Vượt thẩm quyền — hồ sơ vượt cấp bắt buộc phải đưa lên đúng cấp lãnh đạo có thẩm quyền giải quyết!"

5. **`part5_human_harness.mp3` (40s)**:
   > "Tại điểm dừng này, vị thế thuộc về Con người. Những ca vượt thẩm quyền sẽ được chính những người có thẩm quyền xử lý. Cấp quản lý xem xét câu hỏi phân xử trực quan, đánh giá toàn bộ chứng cứ và đưa ra phán quyết dứt điểm — một cú nhấp chuột từ chối đơn minh bạch, và mọi thao tác đều được lưu vết nhật ký kiểm toán không thể tẩy xóa. Mười sáu ca kiểm thử phức tạp được xử lý chỉ trong năm phẩy hai mili-giây với độ chuẩn xác tuyệt đối! Tự động hóa mạnh mẽ nhưng luôn giữ con người ở vị trí trọng tài tối cao: The Escalation Referee — Không phần trăm Duyệt mù, Vận hành an toàn cùng VNG."
