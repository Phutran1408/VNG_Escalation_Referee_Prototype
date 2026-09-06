# Tin nhắn gửi em Hiền

Chào em Hiền,

Các bạn đã đọc đề bài rồi thì mình vào việc luôn. Nhóm mình xây một **sản phẩm mẫu (artifact)** hoàn chỉnh cho **Bảng 1 — OrganizationAI**, theo **Spec A — The Escalation Referee**.

Sản phẩm này dùng thật cho ba việc, không phải bài tập:

- Gửi kèm đề xuất cho **VNG**.
- Kiểm chứng xem đề bài có làm nổi trong 72 giờ không.
- Làm ví dụ cho session hướng dẫn ở buổi **kickoff 19/09**.

**Vì sao chọn Spec A:** nó tự chứa được. Spec B bắt buộc phải đo thời gian thật của một quy trình đang chạy; Spec C bắt buộc phải có người thật ở *cả hai phía* một bất đồng đứng ra xác nhận. Cả hai đều không kịp trong ba tuần.

---

### 1. Chốt đúng MỘT quy trình 

Spec A là một agent mà kỹ năng quan trọng nhất là **biết khi nào phải dừng lại và hỏi người thật**. Cái làm nên Spec A là **ba loại dừng khác nhau**. Đây là năm gợi ý, kèm ba loại dừng trông như thế nào trong từng cái — để các bạn dễ hình dung:

| Quy trình                           | Không chắc dữ kiện                                                          | Ngoài chính sách                                                                                                       | Vượt thẩm quyền                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Hoàn phí câu lạc bộ**   | Hóa đơn chụp mờ —*"450.000₫ hay 480.000₫?"*                           | Chi cho đồ uống có cồn —*"khoản này có thể ngoài quy định CLB, duyệt không?"*                            | Trên 5 triệu —*"cần chữ ký chủ nhiệm, không phải của em."*     |
| **Duyệt đơn xin nghỉ**     | Giấy khám bệnh không đọc được ngày —*"nghỉ từ ngày nào?"*      | Đã nghỉ quá 20% số buổi —*"vượt mức cho phép, có xét đặc biệt không?"*                                 | Xin bảo lưu cả học kỳ —*"thuộc thẩm quyền trưởng khoa."*       |
| **Đặt phòng học / lab**    | Ghi "chiều thứ Năm" —*"cụ thể mấy giờ đến mấy giờ?"*              | Mượn lab cho hoạt động ngoài chuyên môn —*"phòng này giới hạn mục đích, có duyệt ngoại lệ không?"* | Đặt hội trường lớn —*"cần phòng CTSV duyệt trước."*           |
| **Cho mượn thiết bị khoa** | Không ghi ngày trả —*"mượn đến ngày nào?"*                          | Mang ra khỏi trường —*"quy định chỉ cho mượn trong khuôn viên."*                                             | Thiết bị trên 20 triệu —*"cần trưởng bộ môn ký."*              |
| **Duyệt bài đăng CLB**     | Ảnh có logo tài trợ —*"đã ký hợp đồng với đơn vị này chưa?"* | Nhắc nhãn hàng chưa tài trợ —*"cần xác nhận trước khi đăng."*                                             | Nội dung nhân danh Nhà trường —*"phải qua phòng truyền thông."* |

**Chọn theo ba tiêu chí, xếp theo thứ tự quan trọng:**

1. **Có ba người thật để hỏi.** Đây là tiêu chí số một. Mục "người dùng thật" nặng **20 điểm** và cần ba người **có tên, có vai trò, thật sự làm công việc này** — thủ quỹ CLB, thư ký khoa, người quản lý thiết bị. Chọn quy trình mà nhóm hỏi được ba người ngay trong tuần tới. Đừng chọn cái nghe hay nhưng không quen ai.
2. **Ba loại dừng phải xuất hiện tự nhiên,** không gán ép. Nếu phải nghĩ mãi mới ra một ví dụ "vượt thẩm quyền" thì quy trình đó không hợp.
3. **Tự tạo được dữ liệu.** Đề bài cho phép dữ liệu tự tạo, miễn khai báo rõ cái nào thật cái nào giả. Nhưng hệ thống **bắt buộc phải nhận được dữ liệu mới**, vì giám khảo sẽ nhập ca do chính họ nghĩ ra.

### 2. Chốt vai — 4 vai

| Vai                                       | Việc chính                                                                                                                                                                                                                          | Bàn giao                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **SV1 — Chính sách & ca thử**   | Viết tài liệu chính sách cho quy trình đã chốt. Dựng bộ**tối thiểu 15 ca thử**, cài sẵn ca nhập nhằng, ca ngoài chính sách, ca vượt thẩm quyền.                                                        | `policy.md` + bảng 15 ca     |
| **SV2 — Lõi agent**               | Xử lý tự động ca thường quy. Phân loại độ bất định thành**3 loại**. Câu hỏi escalate phải cụ thể, trả lời được trong một lượt. Không bao giờ xuất kết quả chắc chắn trên ca đã gắn cờ. | Mã nguồn + log quyết định  |
| **SV3 — Live URL & audit trail**   | Deploy công khai,**không cần tài khoản, không cần cài đặt**. Landing page ghi đúng một dòng chỉ việc cần thử đầu tiên. Màn hình tra cứu audit trail + nút dừng/hoàn tác.                            | URL chạy thật + trang audit   |
| **SV4 — Verify harness & hồ sơ** | Một nút chạy hết**5 ca** (3 thường quy, 2 phải escalate), in bảng pass/fail có mốc thời gian. Kèm runbook, 5 slide, video 3 phút, build log.                                                                       | Harness + runbook + slide/video |

**Nếu nhóm không đúng 4 bạn:** ít hơn thì gộp SV1 vào SV2 trước — nhưng **tuyệt đối không gộp SV4** vào vai khác, đây là phần bị bỏ rơi đầu tiên mà lại nặng điểm nhất. Nhiều hơn thì người thứ 5 làm cùng SV4, tách phần hồ sơ ra khỏi phần harness. Có bạn ngoài khối kỹ thuật thì giao vai **SV1** — viết chính sách cần đầu óc quy trình hơn là code, và đề bài nói thẳng rằng đội liên ngành đúng tinh thần cuộc thi hơn ba kỹ sư.

Em nhận thêm một vai kỹ thuật cũng được, điều phối không chiếm nhiều thời gian.

---

## Checklist bàn giao

Sáu hạng mục bắt buộc theo **Mục 3** của đề bài. Con số bên phải là số điểm hạng mục đó bảo vệ trong thang 100 — thiếu là mất trắng, không có điểm an ủi.

| ☐ | Hạng mục                                     | Yêu cầu                                                                                                                                                                                          | Điểm          |
| -- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| ☐ | **Live URL**                             | Công khai, không tạo tài khoản, không cài đặt. Một dòng hướng dẫn trên landing page.                                                                                                | **10 đ** |
| ☐ | **Verify harness + 4 ca thử**           | Một lệnh hoặc một nút, in bảng pass/fail có mốc thời gian. Ít nhất một ca mà hành vi đúng là**từ chối hoặc escalate**. Kèm runbook từ clone sạch đến chạy được. | **12 đ** |
| ☐ | **Repository công khai**                | Giữ nguyên lịch sử commit.**Squash hoặc force-push là bị loại** — lịch sử chính là bằng chứng.                                                                                | bắt buộc      |
| ☐ | **Video demo ≤ 3 phút**                | Ưu tiên quay màn hình không cắt ghép. Phải cho thấy cả một chỗ chưa hoàn hảo.                                                                                                       | **10 đ** |
| ☐ | **5 slide đúng cấu trúc cố định** | Không thêm slide nào. Slide 3 (đo lường) và slide 5 (điểm gãy) trọng số cao bất thường — thiếu một trong hai mất nửa số điểm mục này.                                     | **10 đ** |
| ☐ | **Build log một trang**                 | Dùng công cụ AI nào, chỗ nào lợi, chỗ nào mất công, thứ lớn nhất đã phải cắt bỏ.                                                                                                | bắt buộc      |

**Cấu trúc 5 slide là cố định, không được thêm bớt:**

1. Vấn đề hiện tại — quy trình đang chạy thế nào trong thực tế.
2. Đầu vào → Xử lý → Đầu ra — và **chỉ rõ chỗ con người vẫn quyết định**.
3. Tác động: trước so với sau — **và đo bằng cách nào**.
4. Xây thế nào — kiến trúc; **cái nào thật, cái nào giả lập**.
5. Cái gì làm hỏng nó — giới hạn, kiểu lỗi, làm gì tiếp.

### Hai mục dễ mất điểm nhất

- **"Người dùng thật" — 20 điểm.** Ba người có tên, có vai trò, thật sự làm công việc này (6đ); **trích nguyên văn lời họ**, không tóm tắt (4đ); một thay đổi cụ thể truy được về phản hồi đó, dạng commit hoặc trước/sau (6đ); một thứ sản phẩm làm **tệ đi**, nói cụ thể (4đ).
- **"Điều gì tệ đi" — trả lời "không có gì" là 0 điểm.** Đề bài ghi rõ như vậy. Nhóm phải tìm ra và nói thật: việc mới phát sinh, một kỹ năng không còn được luyện, một cuộc trao đổi giữa người với người biến mất.
- 
- Em họp xong gửi thầy **quy trình đã chốt + bảng phân vai** nhé.

Thầy Bách
