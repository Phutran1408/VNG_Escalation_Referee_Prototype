# BUILD LOG — AI Escalation Referee (Spec A · Bảng 1 OrganizationAI)

Quy trình: **DUYỆT ĐƠN XIN NGHỈ** · Repo: 30 commit, không squash/force-push · 08/09/2026

---

## 1. Dùng AI thế nào

Claude Code làm **trợ lý lập trình**, tôi làm người duyệt. Quy trình chia thành các **cổng**,
mỗi cổng AI dừng lại, báo cáo, tôi đọc và duyệt rồi mới cho đi tiếp:

| Cổng | AI làm | Tôi quyết |
|---|---|---|
| A — Audit | Đọc code, chạy agent thật trên 15 ca + 6 ca tự nghĩ, báo cáo bằng chứng `file:dòng` | Xác nhận phát hiện, chốt việc phải sửa |
| B — Thiết kế harness | Đề xuất 5 ca, quy tắc so sánh, cách lộ lỗi | Chọn TC16 thay TC05; yêu cầu lỗi phải hiện đỏ |
| C — Code | Viết comparator, dọn 12 file chết | Duyệt phạm vi xoá; giữ `enterprise/types.ts` |
| D — Vá agent | Vá B1/B1b/B2 | Quyết **ẩn** nhánh enterprise thay vì vá |

Nguyên tắc tôi áp: **không nhận thay đổi nào mà tôi không giải thích lại được.** Mỗi sửa đổi
đều kèm 1–2 câu lý do trong commit message và trong `RUNBOOK.md`.

---

## 2. Chỗ AI có lợi rõ nhất — harness bắt lỗi cho chính agent

Đây là kết quả tôi hài lòng nhất, và nó **có bằng chứng trong lịch sử commit**:

```
a25c0d2  test(SV4): comparator 3 vế …        → bộ 5 = 4/5, bộ 16 = 14/16  (ĐỎ)
d9a8f36  fix(agent): B1/B1b/B2 …             → bộ 5 = 5/5, bộ 16 = 16/16  (XANH)
```

Harness cũ chỉ so `outcome`. Một ca gắn **sai loại dừng** vẫn ra `ESCALATE` nên vẫn hiện
PASS — đúng cái bẫy đề bài cảnh báo. Comparator mới so **3 vế**: `outcome` + `uncertaintyCategory`
+ regex câu hỏi escalate. Chạy lại thì lòi ra ngay:

> **B1** — agent coi "nghỉ ≥ 10 buổi" là "xin bảo lưu học kỳ", nên sinh viên nghỉ ốm 12 buổi
> bị hỏi *"Đơn xin bảo lưu cả học kỳ … có chuyển Trưởng khoa không?"* trong khi họ chưa hề xin
> bảo lưu. Thẩm quyền phải theo **loại đơn**, không theo **độ dài đơn**.

Dựng ca sentinel còn lòi thêm **B1b**: agent quét chuỗi `includes("bảo lưu học kỳ")` nên ghi chú
*"sinh viên KHÔNG xin bảo lưu học kỳ"* vẫn kích hoạt đúng nhánh nó phủ định.

Điểm mấu chốt: **commit vá agent không đụng một dòng harness nào** (`git show d9a8f36 --stat`
chỉ có 1 file). Bảng chuyển từ đỏ sang xanh vì logic được sửa, không vì thước đo bị nới.

---

## 3. Chỗ mất công

**Python cắt mất file tiếng Việt.** Tôi dùng script Python sửa hàng loạt `RUNBOOK.md`. Script
mở file ở chế độ ghi rồi mới lỗi encode emoji — file bị cắt về **0 byte**. Khôi phục được từ
commit trước, không mất gì, nhưng từ đó **bỏ hẳn Python cho file tiếng Việt**, chuyển sang công
cụ sửa file trực tiếp. Trước đó cũng đã một lần Python biến toàn bộ dấu tiếng Việt thành `?`.

**Không kiểm được UI bằng trình duyệt.** Extension Chrome không kết nối, nên AI chỉ xác minh
được gián tiếp: `tsc` sạch, build PASS, bundle chứa đủ chuỗi UI mới, logic agent đúng qua `tsx`.
**Phần bấm tay trên giao diện là việc tôi tự làm** trước khi quay video.

**Suýt để lẫn thành phần của dự án khác.** Khi soạn slide kiến trúc, tôi định ghi "gazetteer OSM"
vào cột công nghệ THẬT. Dự án này **không có** dữ liệu địa lý nào — nó lẫn từ việc khác. Bắt được
nhờ đối chiếu lại với code thay vì tin trí nhớ. Đã rà toàn repo: không còn dấu vết.

**Nhãn nút tự mình nói dối.** Tôi thêm 3 nút "vặn thử" cho giám khảo. Nút thứ ba hứa *"quay lại
Tự động duyệt"*, nhưng bấm nối tiếp sau nút hai thì minh chứng vẫn "mờ ngày" nên ca vẫn escalate.
Đúng loại bệnh vừa đi vá ở B1. Phải chạy thử chuỗi nối tiếp mới phát hiện.

---

## 4. Tính năng lớn nhất đã CẮT — nhánh Doanh Nghiệp

Sản phẩm ban đầu có **hai ngữ cảnh**: Trường học và Doanh nghiệp, đổi qua lại bằng nút trên
thanh điều hướng. Tôi đã **ngắt nhánh Doanh nghiệp khỏi giao diện**.

**Lý do:** sau khi vá B1/B1b cho nhánh trường học, tôi soi sang nhánh doanh nghiệp
(`EscalationRefereeAgent.ts:98-103`) và thấy **đúng hai lỗi đó còn nguyên** — thẩm quyền suy từ
số ngày (`>= 20`), và quét chuỗi tự do (`includes("vượt thẩm quyền")`). Nhưng **không có ca kiểm
thử nào phủ nhánh này**: cả 16 ca đều là trường học.

Vá logic mà không có test là **vá mù** — tôi không có cách nào biết bản vá đúng hay tạo lỗi mới,
và rủi ro đó lớn hơn giá trị của việc khoe thêm một ngữ cảnh. Nên:

- Bộ chuyển ngữ cảnh → nhãn tĩnh "🎓 Trường Học"; `App.tsx` chốt `DEMO_DOMAIN = "academic"`.
- **Không xoá code enterprise** — giữ nguyên trong repo để bảo toàn lịch sử.
- Khai báo thẳng trong `RUNBOOK.md §5.1`, kèm câu: *đây là việc đầu tiên nếu mở rộng — viết
  test trước, vá sau, rồi mới mở lại nút.*

Cùng lý do, tôi **không** nới danh sách từ khoá để chữa bẫy free-text (`RUNBOOK §5.2`): nới chỉ
đẩy ranh giới đi chỗ khác. Thay vào đó tôi sửa **giao diện** để hướng người dùng vào trường có
cấu trúc, và ghi rõ giới hạn còn đó.

---

## 5. Số liệu chốt

| Hạng mục | Giá trị |
|---|---|
| Bộ 5 ca chuẩn | **5/5 PASS** |
| Bộ toàn diện | **16/16 PASS** |
| Độ trễ / ca | < 5 ms (rule engine tất định) |
| `tsc --noEmit` | sạch (trước khi dọn: 3 lỗi) |
| Build | PASS · 29 modules · ~300 ms |
| File nguồn | 18 sống · **0 mồ côi** (xoá 12 file chết, trong đó 3 file hardcode `pass: true`) |
| Commit | 30 · lịch sử nguyên vẹn |
