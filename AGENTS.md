# HƯỚNG DẪN & QUY TẮC PHÁT TRIỂN MOD VẠN KIẾP TU TIÊN

Tài liệu này là chỉ thị bắt buộc cho mọi AI Agent và lập trình viên khi làm việc trong workspace phát triển các bản mod cho web game **Vạn Kiếp Tu Tiên** (`https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev`).

---

## 1. QUY CHUẨN CẤU TRÚC MOD (OFFICIAL MOD SPEC)

Mỗi bản mod được tổ chức theo chuẩn chính thức của game (dạng thư mục hoặc nén thành file `.zip` để cài đặt trực tiếp trong game tại **Cấu hình → Mods**):

```
<ten_mod>/
  mod.yaml            # Bắt buộc: id, name, version, api_version, author, description, patch, balance, options...
  main.js             # Tùy chọn: Logic code (boot / ready), can thiệp hook, UI, sự kiện
  content/            # Tùy chọn: Dữ liệu YAML mới (items/, encounters/, enemies/, npc/, recipes/...)
    patch/            # Tùy chọn: Các file patch YAML sửa đè nội dung gốc
    bang/             # Tùy chọn: Bảng CSV sửa / thêm dữ liệu hàng loạt
  img/                # Tùy chọn: Ảnh / icon (img/vat/, img/dich/, img/man/, img/chieu/)
```

### Quy Tắc Đặt ID Bắt Buộc:
* Mọi ID mới tạo trong mod **BẮT BUỘC** phải có tiền tố mod: `<loại>.<id_mod>_<tên>`.
  * Ví dụ: `item.my_mod_thanh_kiem`, `enemy.my_mod_yeu_ho`, `ev.my_mod_bi_canh`.
  * Tiền tố loại gồm: `item.`, `enemy.`, `chieu.`, `ev.`, `chain.`, `dp.`, `npc.`, `noi.`, `loot.`, `origin.`, `the_chat.`, `thanh_tuu.`.
  * *Sai quy tắc ID sẽ khiến toàn bộ nội dung của mod bị game bỏ qua.*
* `id` trong `mod.yaml` và `id` trong `main.js` (nếu có) phải trùng khớp hoàn toàn.

---

## 2. QUY TẮC ĐÁNH SỐ PHIÊN BẢN (SEMVER STANDARD)

Mọi bản mod đều tuân thủ Semantic Versioning trong `mod.yaml`:

| Loại Thay Đổi | Cấp Phiên Bản | Quy Tắc Tăng | Ví Dụ |
| :--- | :--- | :--- | :--- |
| **Sửa Bug / Tối ưu** | **PATCH** | Tăng số cuối (`x.y.Z` $\rightarrow$ `x.y.Z+1`) | `1.0.0` $\rightarrow$ `1.0.1` |
| **Thêm Nội Dung / Tính Năng** | **MINOR** | Tăng số giữa (`x.Y.0` $\rightarrow$ `x.Y+1.0`), reset patch về `0` | `1.0.1` $\rightarrow$ `1.1.0` |
| **Đại Tu / Thay Đổi Lớn** | **MAJOR** | Chỉ nâng khi có thay đổi kiến trúc hoặc yêu cầu trực tiếp | `1.x.x` $\rightarrow$ `2.0.0` |

---

## 3. NGUYÊN TẮC LẬP TRÌNH & SỬ DỤNG API

1. **Ghi trạng thái an toàn:**
   - Chỉ thay đổi trạng thái game qua các hàm lệnh `tuTien.game.*` hoặc `mod.addAction`. Tuyệt đối không sửa trực tiếp object trong `tuTien.state()`.
   - Muốn tính toán thử hoặc mô phỏng, dùng `tuTien.game.readCtx()` (bản sao an toàn, không đụng kiếp thật).
2. **Phân định rõ pha `boot` vs `ready` trong `main.js`:**
   - **`boot(tt, mod)`**: Chạy trước khi dựng nội dung; dùng để đăng ký modifier (`mod.modify`), hằng cân bằng (`mod.setBalance`), hiệu ứng/điều kiện mới (`mod.addEffect`, `mod.addCondition`), hành động (`mod.addAction`).
   - **`ready(tt, mod)`**: Chạy khi game đã khởi động xong; dùng để dựng giao diện (`mod.ui.addPanel`, `mod.ui.addDock`, `mod.ui.addSlot`), lắng nghe sự kiện (`tt.on(...)`).
3. **Giao diện chuẩn game (`ui.kit`):**
   - Ưu tiên sử dụng bộ component tích hợp `tuTien.ui.kit` (`button`, `select`, `combobox`, `checkbox`, `stepper`, `slider`, `modal`, `popup`...) để đảm bảo đồng bộ giao diện và tự tương thích khi game cập nhật style.
4. **Vá dữ liệu gốc (`patchContent` / `patch`):**
   - Thêm vào danh sách/mảng có sẵn luôn dùng `$append`, tránh chép đè cả mảng gốc để không xung đột với các mod khác hoặc các bản cập nhật sau của game.
5. **Đóng gói Module Scope (IIFE) cho `main.js`:**
   - Khi chia sẻ hằng số, bảng tra cứu hoặc hàm tiện ích (`CANH_GIOI_TEN`, `dinhDangCanhGioi`, `sucChuaDeTu`...) giữa cả 2 pha `boot` và `ready`, **bắt buộc** bọc file script trong closure `(() => { ... })();`. Tuyệt đối không khai báo cục bộ riêng trong `boot()` để tránh lỗi sập giao diện `ReferenceError` khi `ready()` gọi tới.
6. **Quy chuẩn Callback Modifier (`mod.modify`):**
   - Điểm móc nhận tham số đầu vào là một object duy nhất: `({ id, slot, value }, h)`.
   - Hàm callback **bắt buộc luôn trả về một số hữu hạn hợp lệ (`number`)**, ví dụ `return (value ?? 1) * heSo;`. Trả về `undefined` hoặc object sẽ khiến engine game ngắt giao dịch và vô hiệu hóa mod vĩnh viễn.
7. **Đặc tính của `tuTien.game.modAction` trong kiểm thử:**
   - Engine bọc hành động qua `Game.act` và trả về `void` / `undefined`. Khi viết bài test kiểm thử tự động, **không assert giá trị trả về của `modAction`**, mà phải assert sự thay đổi (hoặc giữ nguyên khi bị chặn) của trạng thái trong `window.tuTien.state()`.

---

## 4. CẨM NANG ĐIỀU TRA & THÍCH ỨNG KHI GAME CÓ BẢN UPDATE MỚI

Khi game deploy bản build mới hoặc người dùng báo game vừa cập nhật, thực hiện quy trình điều tra trong thư mục `scratch/`:

### Bước 0: Dọn Dẹp File Cũ Trong `scratch/` (BẮT BUỘC TRƯỚC KHI TẢI MỚI)
1. **Lưu bản hiện hành làm mốc so sánh (diffing):**
   - Đổi tên `latest_game_bundle.js` $\rightarrow$ `old_game_bundle.js`.
   - Đổi tên thư mục `latest_template_extracted` $\rightarrow$ `old_template_extracted`.
   - Đổi tên `latest_content.json` $\rightarrow$ `old_content.json`.
2. **Xóa sạch file rác và script nháp cũ:**
   - Xóa bỏ các file bundle thừa, file nén `*.zip`, thư mục giải nén cũ.
   - Xóa sạch các script tạm một lần (`check_*.js`, `diff_*.js`, `inspect_*.js`...). Thư mục `scratch/` chỉ chứa duy nhất bộ mốc `old_*` sẵn sàng cho việc so sánh.

### Bước 1: Lấy Bundle JS Mới Nhất
1. Quét trang chủ để lấy tên file bundle mới:
   ```bash
   curl.exe -s https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/ | Select-String -Pattern "index-.*\.js"
   ```
2. Tải bundle mới về thư mục `scratch/latest_game_bundle.js`:
   ```bash
   curl.exe -s -o .\scratch\latest_game_bundle.js https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/assets/index-[hash].js
   ```

### Bước 2: Tải & So Sánh Gói Mod Template (`tu-tien.d.ts`) - **QUAN TRỌNG NHẤT**
Game luôn phục vụ gói mod mẫu chính thức tại đường dẫn cố định:
- **URL tải template:** `https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/mod/template.zip`
1. Tải về và giải nén:
   ```bash
   curl.exe -s -o .\scratch\latest_template.zip https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/mod/template.zip
   Expand-Archive -Path .\scratch\latest_template.zip -DestinationPath .\scratch\latest_template_extracted -Force
   ```
2. So sánh `scratch/latest_template_extracted/vi_du/tu-tien.d.ts` với `scratch/old_template_extracted/vi_du/tu-tien.d.ts` để phát hiện các hàm API mới, kiểu dữ liệu mới, thay đổi công thức.
3. Đọc các file cập nhật đi kèm: `vi_du/doi-api.md`, `vi_du/balance.md`, `vi_du/tai-lieu-api.md`, `vi_du/surface.txt`.

### Bước 3: Tải Gói Dữ Liệu Nội Dung Gốc (`content-[hash].json`)
1. Tìm tên file content JSON trong bundle JS:
   Tìm chuỗi `new URL("content-[hash].json", import.meta.url).href`.
2. Tải về file `scratch/latest_content.json`:
   ```bash
   curl.exe -s -o .\scratch\latest_content.json https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/assets/content-[hash].json
   ```

### Bước 4: So Sánh Sai Khác (Diffing)
- Quét danh mục ID vật phẩm, sự kiện, quái vật mới trong `latest_content.json` so với `old_content.json`.
- Kiểm tra danh sách export của `window.tuTien.core` trong bundle mới để đảm bảo tính tương thích.

### Bước 5: Cập Nhật Mod & Dọn Dẹp Sau Cùng
1. Thích ứng và nâng cấp các bản mod theo API hoặc dữ liệu mới của game.
2. Nâng phiên bản mod tương ứng theo SemVer.
3. Đóng gói kiểm tra mod.
4. **Dọn dẹp:** Xóa bỏ toàn bộ các script tạm (`*.js`, `*.txt`) và bộ mốc `old_*` sinh ra trong đợt điều tra. Chỉ giữ lại bộ source chuẩn hiện hành (`latest_game_bundle.js`, `latest_template_extracted`, `latest_template.zip`, `latest_content.json`) để làm mốc so sánh cho lần cập nhật kế tiếp.

---

## 5. GIT & GITHUB SYNCHRONIZATION RULES (AUTOMATIC COMMIT & PUSH)

* **Mandatory Commit & Push on File Modification**: Whenever any file in the workspace is created, updated, or deleted (logic scripts, docs, `mod.yaml`, content configs, assets, etc.), the Agent **MUST** immediately commit and push all changes to GitHub:
  ```bash
  git add .
  git commit -m "<concise description of changes>"
  git push
  ```
* **No Delay**: Never batch changes across multiple turns or conclude a request without synchronizing changes to the remote GitHub repository.

---

## 6. QUY TẮC BẮT BUỘC KIỂM THỬ TRỰC QUAN GIAO DIỆN (UI VERIFICATION BEFORE DONE TASK)

* **Tuyệt đối không suy đoán giao diện**: Khi thêm mới, tinh chỉnh hoặc sửa lỗi bất kỳ thành phần UI nào (Panel, Modal, Dock, Slot, Card, Tab, Button...):
  1. **Khởi chạy kiểm thử tự động với trình duyệt thật**: Sử dụng `puppeteer-core` (kết nối trực tiếp tới `C:\Program Files\Google\Chrome\Application\chrome.exe`) để truy cập web game `https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/`.
  2. **Nạp mod & Khởi tạo dữ liệu kiểm thử**: Khởi chạy một ván chơi mẫu (`tuTien.game.newRun({})`), kích hoạt script mod, tiêm dữ liệu mô phỏng đại diện (trường hợp danh sách rỗng, 1 phần tử, nhiều phần tử, tên dài, danh hiệu...) và mở giao diện cần kiểm tra (`mod.ui.openPanel`, `kit.modal`, v.v.).
  3. **Chụp ảnh màn hình (Screenshot) & Thẩm định trực quan**: Chụp ảnh màn hình phần tử UI hoặc toàn trang, sau đó đọc lại file ảnh bằng công cụ `read_file` để tự mắt nhìn và thẩm định chất lượng hiển thị.
  4. **Tiêu chuẩn nghiệm thu UI (UI Acceptance Criteria)**:
     - **Không tràn viền (Overflow)**: Nội dung phải nằm gọn gàng bên trong khung hiển thị tiêu chuẩn (khoảng 300px – 360px của game).
     - **Không gãy chữ/vỡ chữ ngớ ngẩn (No Awkward Word-Wrapping)**: Các cụm từ có nghĩa (tên nhân vật, danh xưng, cảnh giới, linh căn, phẩm cấp, nhãn tab, badge...) phải được bảo vệ nguyên vẹn bằng `white-space: nowrap`, không bao giờ được để vỡ thành từng chữ đơn rải rác trên nhiều dòng (như `Khương / Vy`, `Đại Sư / Huynh`, `Hóa Thần / Sư Tôn`, `Phổ / Thông`).
     - **Khoảng cách & Cân đối (Spacing & Hierarchy)**: Các cột, nút bấm, thanh tiến trình (progress bar), nhãn thông tin phải có padding/margin cân đối, thẩm mỹ theo phong cách thủy mặc / tiên hiệp của game.
  5. **Điều kiện tiên quyết để quyết định xong task (Done Task)**: Chỉ được phép xác nhận hoàn thành công việc sau khi đã chạy kiểm thử trực quan trên UI thật, lưu ảnh minh chứng và xác nhận không còn bất kỳ lỗi tràn viền hay vỡ bố cục nào.

---

## 7. QUY TẮC BẮT BUỘC KIỂM THỬ CHỨC NĂNG & MỤC ĐÍCH GAMEPLAY (FUNCTIONAL & INTENT VERIFICATION)

* **Nguyên tắc "Không Văng Lỗi Phá Huỷ" trong `mod.addAction`**:
  - Engine của game bọc hành động mod bằng hàm bắt lỗi `Rw(e, t, n)`. Khi một action quăng ra `throw new Error(...)`, engine sẽ kích hoạt hàm `jwt()` đánh dấu `e.disabled = true`, hiển thị thông báo *"Mod gặp lỗi, đã tạm tắt"* và **vô hiệu hóa vĩnh viễn mod trong suốt ván chơi**!
  - **Quy tắc vàng**: Mod actions **TUYỆT ĐỐI KHÔNG DÙNG `throw new Error(...)`** để từ chối nghiệp vụ (như thiếu tiền, thiếu tu vi, tên rỗng, danh sách đầy). Thay vào đó:
    - Trong action: Kiểm tra điều kiện, nếu không thoả thì trả về `'khong_tick'` và kết thúc an toàn.
    - Trong giao diện (UI): Kiểm tra điều kiện đầu vào trước khi gọi `modAction`, nếu vi phạm thì gọi `tt.ui.toast(...)` để báo cho người chơi một cách êm ái.

* **Tiêu Chuẩn Kiểm Thử Chức Năng Tự Động (Automated Functional Testing)**:
  Trước khi bàn giao hoặc đánh dấu hoàn thành bất kỳ tính năng mod nào, Agent bắt buộc phải tạo/chạy kịch bản kiểm thử tự động với `puppeteer-core` bao quát toàn diện các khía cạnh:
  1. **Kiểm thử đúng ý định nghiệp vụ (Intent Verification)**:
     - Kiểm tra toàn bộ các đột biến trạng thái (state mutations): Ví dụ truyền công phải trừ chân nguyên sư tôn, tăng tu vi đệ tử, tăng đố kỵ đồng môn; hộ pháp thành công phải tăng tiểu cảnh giới, reset tu vi về 0, nâng tu vi yêu cầu cho tầng kế tiếp.
  2. **Kiểm thử biên & Chặn điều kiện an toàn (Edge Cases & Boundary Validation)**:
     - Kiểm tra các trường hợp không đủ điều kiện (tên rỗng, vượt quá sức chứa môn phái, đệ tử chưa đủ tu vi đột phá, sư tôn không đủ linh thạch, v.v.). Xác nhận trạng thái không bị thay đổi sai trái và hệ thống không văng lỗi unhandled crash.
  3. **Kiểm thử nhịp thế giới (World Tick Hook Verification)**:
     - Giả lập bước nhảy thời gian qua năm (bằng `window.tuTien.core.index.passTime(ctx, years)` trong giao dịch `act`) để xác minh: đệ tử tăng tuổi theo năm, tích lũy tu vi theo hệ số tư chất, đếm lùi thời gian lịch luyện và kích hoạt các sự kiện tâm tính (hiếu thuận, đố kỵ).
  4. **Nghiệm thu tỷ lệ đạt 100%**: Chỉ được phép xác nhận tính năng sẵn sàng khi 100% bài test trong bộ kiểm thử chức năng tự động trả về `PASS`.

---

## 8. QUY CHUẨN BẢNG DỮ LIỆU CSV (BANG.MD & CONTENT/BANG/)

Thiết kế chính thức của game hỗ trợ quản lý và chỉnh sửa chỉ số hàng loạt bằng bảng tính thay vì viết file YAML:

### 1. Nguồn Dữ Liệu & Cách Lấy Bảng:
* **Tải bảng chuẩn của game:**
  * Trực tiếp từ web game: `https://van-kiep-tu-tien.vuhaiquan2k1.workers.dev/mod/bang.zip`.
  * Hoặc trong game tại: **Cấu hình → Mods → "Tải bảng dữ liệu"** (xuất ra file `.zip` phản ánh chính xác trạng thái game kèm các mod đang chạy).
* **Danh mục các file CSV chính:**
  * `item_<loai>.csv`: Vật phẩm tách theo phân loại (`item_phap_khi`, `item_dan_duoc`, `item_nguyen_lieu`, `item_cong_phap`...).
  * `enemy.csv`: Địch, yêu thú, boss.
  * `chieu.csv`: Chiêu thức chiến đấu của địch.
  * `dp.csv`: Đan phương, công thức luyện khí / luyện đan.
  * `npc.csv`, `the_chat.csv`, `linh_can.csv`, `toc.csv`, `origin.csv`...: Các bảng thiết lập nhân vật và thế giới.

### 2. Nguyên Tắc Cốt Lõi: Cây Lời Kể (YAML) vs Bảng Chỉ Số (CSV):
* **KHÔNG CÓ bảng CSV cho Sự Kiện (`ev.`), Chuỗi Sự Kiện (`chain.`), Lore/Cốt truyện**:
  * Các sự kiện là cây hội thoại phân nhánh với điều kiện logic, văn bản dẫn truyện và lựa chọn tương tác. **BẮT BUỘC viết bằng YAML** đặt trong `content/encounters/*.yaml` hoặc qua `mod.addContent`.
* **Bảng CSV dành riêng cho việc sửa / thêm hàng loạt chỉ số**:
  * Thích hợp khi điều chỉnh giá cả, thuộc tính ngũ hành, tỷ lệ rớt đồ, thêm hàng chục vật phẩm hoặc quái vật mới.

### 3. Quy Cách Sử Dụng Bảng CSV Trong Mod:
* **Thư mục đặt bảng:** Đặt file CSV vào thư mục `content/bang/` của mod (ví dụ: `su_do/content/bang/vat_pham.csv`).
* **Quy chuẩn cấu trúc file CSV:**
  * Dòng đầu tiên là tiêu đề cột, bắt buộc phải có cột **`id`**.
  * **Sửa mục đã có (của game hoặc mod khác):** Chỉ điền các ô muốn sửa, ô trống giữ nguyên giá trị cũ, ô `~` để xóa trường. Cột có đuôi `+` (như `chieu+`) dùng để nối tiếp phần tử vào danh sách thay vì thay thế.
  * **Thêm mục mới:** Bắt buộc tuân thủ tiền tố mod: `<loại>.<id_mod>_<tên>` (ví dụ: `item.su_do_ho_mach_dan`). Cần cung cấp đủ các cột trường bắt buộc tương tự như khai báo YAML.
  * **Định dạng lưu file:** Luôn lưu bằng định dạng **CSV UTF-8 (Comma delimited)** để bảo toàn vẹn toàn dấu tiếng Việt.

### 4. Đánh Giá Ảnh Hưởng Đối Với Mod:
* Đối với các mod thiên về logic, giao diện và sự kiện phân nhánh (như `su_do`): Cốt truyện kỳ ngộ giữ vững ở `content/encounters/*.yaml`. Bảng dữ liệu CSV được dùng để tra cứu ID vật phẩm/nguyên liệu/đan phương gốc của game hoặc bổ sung/chỉnh sửa chỉ số vật phẩm hàng loạt khi cần mở rộng kho trang bị, đan dược.

---

## 9. QUY TẮC BẮT BUỘC VỀ VĂN PHONG, LORE & XƯNG HÔ TIÊN HIỆP

1. **Tuyệt đối tránh từ Hán-Việt đa nghĩa gây hiểu nhầm sang họ tên người chơi:**
   - Tránh dùng từ cổ như "Bạch sư tôn" (dễ bị hiểu lầm thành Sư tôn họ Bạch khi nhân vật người chơi mang họ khác như Mạc, Lâm, Diệp...).
   - **Xưng hô chuẩn mực:** Dùng *"Khởi bẩm Sư tôn"*, *"Bẩm Sư tôn"*, *"Đệ tử kính bái Sư tôn"*, hoặc nối họ tên động: `${nv.ten} Sư tôn`.
2. **Quy tắc phân định danh xưng theo giới tính:**
   - Đệ tử đứng đầu môn phái:
     - Đệ tử nam (`gioiTinh === 'nam'`): **`Đại Sư Huynh`**.
     - Đệ tử nữ (`gioiTinh === 'nu'`): **`Đại Sư Tỷ`**.
   - Phải áp dụng đồng bộ danh xưng giới tính trên toàn bộ các thành phần: Huy hiệu trên thẻ (Badge), Biên niên sử nhật ký, Thông báo bái sư, Tooltip nút sắc phong 👑 và Hộp thoại Modal.
3. **Phân định rạch ròi giữa "Đột Phá" vs "Độ Kiếp":**
   - **Đột Phá Tiểu Cảnh Giới & Trúc Cơ:** Thuần túy là xung mạch phá quan, đúc tạo đạo cơ, **hoàn toàn KHÔNG CÓ lôi kiếp/độ kiếp**. Sư tôn hộ trì **0 bị thương** (`thuongThe = 0`).
   - **Độ Kiếp Đại Cảnh Giới Cao (Kết Đan trở lên):** Mới thực sự có Cửu Thiên Lôi Kiếp. Nếu sư tôn gánh lôi kiếp, chỉ tăng đúng **+1 tầng thương thế** trên thang chuẩn `0..3` của game (`Thương nhẹ` = 1/3 thanh), tuyệt đối không để vọt quá 3 gây tình trạng nguy kịch *"Thua trận là chết"*.

---

## 10. BẢNG CHECKLIST QUẢN TRỊ TRẠNG THÁI & EDGE CASES CHO THỰC THỂ (NPC/ĐỆ TỬ)

Khi thiết kế tính năng tương tác với thực thể (đệ tử, đạo lữ, linh thú, NPC môn phái), lập trình viên và AI Agent **BẮT BUỘC** phải rà soát và cài đặt chốt chặn cho các kịch bản biên sau:

1. **Chặn toàn diện trạng thái vắng mặt (Absent / Away State Guard):**
   - Khi thực thể đang ở trạng thái đi xa (như `lich_luyen` / lịch luyện bí cảnh, bế quan, thám hiểm di tích):
     - **Tầng Action:** Bắt buộc kiểm tra `if (dt.trangThai?.loai === 'lich_luyen' && (dt.trangThai?.namConLai ?? 0) > 0) return 'khong_tick';` trên tất cả hành động trực tiếp (đàm tâm, truyền công, luận bàn đấu pháp, ban thưởng, hộ pháp đột phá).
     - **Tầng UI:** Bắt buộc kiểm tra điều kiện để hiện toast báo đệ tử đang xuất sơn; hiển thị nhãn trạng thái trực quan trên thẻ nhân vật: `[Lịch luyện (X năm)]`.
     - **Tầng Hook thế giới:** Chặn các sự kiện tương tác nội bộ tại bổn môn (như đệ tử hiếu thảo nấu Tuyết Liên Trà dâng sư tôn) khi thực thể đang vắng mặt ở phương xa.
2. **Khống chế trần bình cảnh tu vi (Cultivation Bottleneck Ceiling):**
   - Trong tu tiên, khi gặp bình cảnh (tu vi đạt 100%), thực thể không thể hấp thu thêm linh khí.
   - **Công thức an toàn:** `dt.tuVi = Math.min(dt.tuViYeuCau, dt.tuVi + tang);` (áp dụng cho cả nhịp thời gian trôi qua năm `addTickHook` lẫn hành động `truyen_cong`).
   - Chặn truyền công lãng phí chân nguyên của người chơi khi đệ tử đã chạm trần bình cảnh và yêu cầu đột phá trước.
3. **Cơ chế kế nhiệm vai vế khi biến động nhân sự (Succession Fallback):**
   - Khi thực thể giữ vai trò cốt cán (Đại sư huynh / Đại sư tỷ) bị trục xuất, qua đời, tọa hóa hoặc rời tông môn:
   - Hệ thống phải **tự động chuyển giao danh hiệu** cho thực thể lớn tiếp theo trong danh sách (`data.danhSachDeTu[0].vaiVe = 'dai_su_huynh'`) kèm biên niên sử ghi nhận để môn phái không bao giờ bị khuyết vị trí lãnh đạo.
4. **Chống điều động trùng lặp (Anti-Double Dispatch):**
   - Chặn phái đi làm nhiệm vụ mới khi thực thể đang trong một chuyến lịch luyện chưa hoàn thành.
5. **Cực hạn cảnh giới nhân gian (World Realm Ceiling):**
   - Khi thực thể đạt cảnh giới cao nhất mà thế giới hỗ trợ (Hóa Thần Đại viên mãn), khóa hành động đột phá và chuyển sang huy hiệu vinh danh `✨ Đỉnh Phong Viên Mãn`.
6. **Quy chuẩn bố cục thẻ nhân vật chống tràn chữ (Card Spacing & Badge Placement):**
   - **Quy tắc phân tầng:**
     - *Hàng 1:* `[Tên]` + `[Danh hiệu vai vế]` + `[Badge phẩm cấp / tư chất]` + `[Giới tính · Tuổi]` (căn phải).
     - *Hàng 2:* `[Cảnh giới]` + `·` + `[Hệ ngũ hành]` + `[Badge trạng thái đặc biệt nếu có]`.
     - *Hàng 3:* `[Tính cách]` + `·` + `[Hảo cảm]` + `·` + `[Đố kỵ]`.
   - **Tuyệt đối không dồn Badge tư chất vào chung hàng với tên cảnh giới dài**: Tránh việc các chuỗi dài (như `Luyện Khí Đại viên mãn · Hệ Thủy · Thổ`) kết hợp cùng badge có `margin-left: auto` bị đẩy tràn ra ngoài mép phải của khung hiển thị.



