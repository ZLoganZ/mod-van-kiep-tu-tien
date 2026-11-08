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

