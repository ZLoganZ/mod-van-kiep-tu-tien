# Modding Guide — Vạn Kiếp Tu Tiên

Tài liệu này định nghĩa quy ước, công cụ và quy trình cho việc phát triển mod cho game **Vạn Kiếp Tu Tiên**.

---

## 1. Kiến trúc Mod

### Cấu trúc thư mục chuẩn
```
<mod_id>/
├── mod.yaml           # Metadata, options, script entry
├── main.js            # ES Module entry (boot/ready phases)
└── lib/
    ├── constants.js   # Shared constants
    ├── core.js        # Core logic (nếu có)
    ├── actions.js     # modAction handlers
    ├── hooks.js       # Game event hooks (tt.on, mod.addTickHook)
    ├── ui.js          # UI registration (docks, panels, slots)
    ├── styles.js      # CSS injection
    ├── utils.js       # Shared utilities
    └── update.js      # Auto-update checker (GitHub Releases)
```

### Entry point (`main.js`)
```js
import { MOD_VERSION } from "./lib/constants.js";
import { injectMasterStyles } from "./lib/styles.js";
import { dangKyModActions } from "./lib/actions.js";
import { dangKyHooks } from "./lib/hooks.js";
import { dangKySlotsVaDocks } from "./lib/ui.js";
import { startPeriodicUpdateCheck } from "./lib/update.js";

(window.tuTienMods ??= []).push({
  id: "<mod_id>",
  boot(tt, mod) {
    // Chỉ đăng ký actions, hooks, effects, conditions
    // KHÔNG truy cập DOM, UI, PixiJS ở đây
  },
  async ready(tt, mod) {
    // Inject CSS, khởi tạo systems, đăng ký UI
    injectMasterStyles();
    dangKySlotsVaDocks(tt, mod);
    startPeriodicUpdateCheck(mod, 24); // Auto-update check 24h
  },
});
```

---

## 2. Mod API Reference

### `mod` object (nhận trong boot/ready)
| Method | Mô tả |
|--------|-------|
| `mod.log(...args)` | Log ra console game (có prefix mod) |
| `mod.setOption(key, value)` | Thay đổi option, trigger `onOptionChange` |
| `mod.options` | Object chứa giá trị options hiện tại |
| `mod.addEffect(id, {description, duration})` | Đăng ký effect custom |
| `mod.addCondition(id, fn)` | Đăng ký condition cho balance/trigger |
| `mod.setBalance(path, value)` | Override balance value |
| `mod.addTickHook(fn)` | Hook chạy mỗi tick game (ctx, years, h) |
| `mod.onOptionChange(fn)` | Listen option changes: `fn(key, new, old)` |
| `mod.ui.addDock(config)` | Thêm dock vào HUD (trụ cột 5) |
| `mod.ui.addPanel(config)` | Thêm panel settings |
| `mod.ui.addSlot(slotName, config)` | Thêm slot: `characterTab`, `placeInfo`, `mapLayer`, `itemTooltip` |
| `mod.ui.toast(msg, opts)` | Hiện toast notification |
| `mod.ui.kit` | UI kit: `button, select, toggle, slider, row, section, tabs, richText` |

### `tt` (tuTien) object
| Property/Method | Mô tả |
|-----------------|-------|
| `tt.state()` | Lấy toàn bộ state game (reactive) |
| `tt.subscribe(fn)` | Subscribe state changes, trả về `unsub()` |
| `tt.on(event, handler)` | Listen game events: `breakthrough`, `placeChanged`, `lifeEnd`, `combatStart`, `itemUsed`, `cultivationStart`, `stateChanged` |
| `tt.game.modAction(modId, action, payload)` | Gửi action đến mod khác |
| `tt.ui.gamePanel(id, open)` | Mở/đóng panel game (character, inventory, etc.) |
| `tt.pixi` | PixiJS instance (map layer) |
| `tt.map.requestRender()` | Yêu cầu render lại map |

---

## 3. ID Naming Convention (QUAN TRỌNG)

**Format:** `<type>.<mod_id>_<name>`

| Type | Prefix | Example |
|------|--------|---------|
| Effect | `eff` | `eff.su_do_tu_linh_buff` |
| Condition | `cond` | `cond.su_do_can_tuyen_do` |
| Action | `act` | `act.su_do_ban_thuong` |
| Item | `item` | `item.su_do_ho_mach_dan` |
| Encounter | `enc` | `enc.su_do_ky_ngo` |
| NPC | `npc` | `npc.su_do_de_tu` |
| Dock | `dock` | `dock.su_do_hud` |
| Panel | `panel` | `panel.su_do_dao_trang` |
| Slot | `slot` | `slot.su_do_de_tu_tab` |

---

## 4. Options Schema (mod.yaml)

```yaml
options:
  - key: snake_case_key
    label: "Nhãn hiển thị"
    hint: "Mô tả chi tiết (tooltip)"
    type: bool | choice | number | text
    default: <giá trị>
    choices:          # chỉ cho choice
      - { value: "value1", label: "Label 1" }
      - { value: "value2", label: "Label 2" }
    min: 0            # chỉ cho number
    max: 100
    step: 1
```

---

## 5. UI Kit Components

```js
const kit = tt.ui.kit;

// Button
kit.button({ text: "Label", kind: "chinh" | "nho" | "nguy_hiem", onClick: fn })

// Select
kit.select({ options: [{value, label}], value: "current", onChange: fn })

// Toggle
kit.toggle({ checked: true, onChange: fn })

// Slider
kit.slider({ min: 0, max: 100, value: 50, step: 1, onChange: fn })

// Row (label + control)
kit.row({ label: "Label", children: [control], hint: "Tooltip" })

// Section
kit.section({ title: "Title", children: [elements] })

// Tabs
kit.tabs({ tabs: [{ id, title, mount(box) {...} }] })

// Rich text
kit.richText("HTML string")
```

---

## 6. Game Events (tt.on)

| Event | Payload | Khi nào |
|-------|---------|---------|
| `breakthrough` | `{entity, isPlayer, realm, tuVi}` | Entity đột phá cảnh giới |
| `placeChanged` | `{place, oldPlace}` | Player đổi nơi chốn |
| `lifeEnd` | `{entity, isPlayer}` | Entity chết/kết thúc kiếp |
| `combatStart` | `{enemy, isPlayer}` | Bắt đầu chiến đấu |
| `combatEnd` | `{result, rewards}` | Kết thúc chiến đấu |
| `itemUsed` | `{item, target, quantity}` | Dùng vật phẩm |
| `cultivationStart` | `{method, location}` | Bắt đầu tu luyện |
| `cultivationEnd` | `{gainedTuVi}` | Kết thúc tu luyện |
| `stateChanged` | `{path, value, oldValue}` | State bất kỳ thay đổi |

---

## 7. Versioning & Release

### SemVer
- **MAJOR**: Breaking API changes, restructure lớn
- **MINOR**: Features mới, UI mới, systems mới
- **PATCH**: Bugfix, tweak số liệu, typo

### Release Workflow
1. Cập nhật `version` trong `mod.yaml`
2. Commit: `git commit -m "chore: bump version X.Y.Z"`
3. Tag: `git tag <mod_id>/vX.Y.Z`
4. Push: `git push origin main --tags`
5. GitHub Action tự động:
   - Build zip từ source
   - Tạo GitHub Release
   - Upload asset `<mod_id>_vX.Y.Z.zip`
   - Mod trong game auto-detect qua GitHub Releases API

### Auto-update (lib/update.js)
- Check mỗi 24h (configurable) via GitHub Releases API
- Silent check → toast khi có bản mới
- Panel có nút "Kiểm tra cập nhật" + "Cập nhật"
- Tự download + install nếu game support `mod.installModFromBlob`

---

## 8. Performance Guidelines

- **Particle systems**: Reuse objects, wrap-around ambient, limit max particles theo quality preset
- **Flow field**: Update throttle (không mỗi frame), resolution 40px
- **FPS monitoring**: Auto-drop quality khi FPS < 30 (nếu option bật)
- **CSS**: `prefers-reduced-motion` support, low-quality mode class
- **Memory**: Cleanup listeners (`tt.subscribe`, `tt.on`, `window` events) trong `destroy()`

---

## 9. Testing Checklist

Trước khi release:
- [ ] `node --check main.js` + all `lib/*.js` pass syntax check
- [ ] Mod load không lỗi trong game (console clean)
- [ ] Options persist qua reload
- [ ] Dock/panel/slot hiển thị đúng, không leak DOM
- [ ] Hooks trigger đúng event (breakthrough, placeChanged, etc.)
- [ ] Auto-update check không throw error (network fail handled)
- [ ] `prefers-reduced-motion` disable animations
- [ ] Quality presets (thap/trung_binh/cao) thay đổi particle count

---

## 10. Current Mods

| Mod ID | Name | Version | Description |
|--------|------|---------|-------------|
| `su_do` | Sư Đồ Truyền Thừa | 1.3.2 | Hệ thống Sư Môn, Đạo Tràng, Đồ Đệ, Nhân Mạch |
| `thien_dia_linh_khi` | Thiên Địa Linh Khí | 1.0.0 | Linh Khí Diện nền + Thiên Kiếp Cinematic + Avatar Visual |

---

## 11. GitHub Actions

```yaml
# .github/workflows/release-<mod_id>.yml
on:
  push:
    tags:
      - '<mod_id>/v*'
    paths:
      - '<mod_id>/**'
```

- Đọc version từ `mod.yaml`
- Zip source (exclude `.git`, `node_modules`)
- Tạo Release với asset zip
- Generate update manifest artifact

---

## 12. Common Patterns

### State-derived UI update
```js
const unsub = tt.subscribe(() => {
  const s = tt.state();
  const data = layModData(s);
  // update DOM từ data
});
return unsub; // cleanup
```

### Mod action handler
```js
// actions.js
export function dangKyModActions(tt, mod) {
  mod.onAction("ten_action", async (payload) => {
    // payload từ modAction(modId, "ten_action", payload)
    // return value sẽ thành kết quả promise
  });
}
```

### Tick hook (hiệu năng)
```js
mod.addTickHook((ctx, years, h) => {
  // ctx.run.nam, ctx.run.nhanVat
  // h.random() - seeded random
  // Chỉ tính toán nhẹ, tránh allocation object lớn
});
```

---

*Cập nhật lần cuối: 2026-11-14*