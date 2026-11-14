// lib/ui.js - UI Components (Panel, Dock, Slots, Avatar enhancements)

import { CANH_GIOI_VISUAL, QUALITY_PRESETS } from "./constants.js";

/** Tạo avatar glow ring element */
export function taoAvatarRing(entity, particleSystem) {
  const visual = particleSystem.getVisualForRealm(Number(entity?.canhGioi ?? 0));
  const ring = document.createElement("div");
  ring.className = "tdlk-avatar-ring";
  ring.style.cssText = `
    border: 2px solid ${visual.mau};
    box-shadow: 0 0 10px ${visual.glow}, inset 0 0 10px ${visual.glow};
  `;
  return ring;
}

/** Tạo badge trạng thái */
export function taoAvatarBadge(entity, particleSystem) {
  const tuVi = Number(entity?.tuVi ?? 0);
  const tuViYeuCau = Number(entity?.tuViYeuCau ?? 1);
  const canhGioi = Number(entity?.canhGioi ?? 0);
  const trangThai = entity?.trangThai?.loai;

  let text = "", bgColor = "#666", show = false, pulse = false;

  if (trangThai === "lich_luyen") {
    text = "🗺️"; bgColor = "#3b82f6"; show = true;
  } else if (trangThai === "be_quan") {
    text = "🧘"; bgColor = "#8b5cf6"; show = true;
  } else if (trangThai === "ma_hoa") {
    text = "👿"; bgColor = "#ef4444"; show = true; pulse = true;
  } else if (tuVi >= tuViYeuCau && tuViYeuCau > 0) {
    text = "⚡"; bgColor = "#f59e0b"; show = true; pulse = true;
  } else if (canhGioi >= 5) {
    text = "✨"; bgColor = CANH_GIOI_VISUAL[canhGioi]?.mau || "#a78bfa"; show = true;
  } else if (entity?.vaiVe === "dai_su_huynh" || entity?.vaiVe === "dai_su_ty") {
    text = "👑"; bgColor = "#fbbf24"; show = true;
  }

  if (!show) return null;

  const badge = document.createElement("div");
  badge.className = "tdlk-avatar-badge" + (pulse ? " tdlk-pulse" : "");
  badge.textContent = text;
  badge.style.background = bgColor;
  badge.title = entity?.ten || "";
  return badge;
}

/** Enhance existing avatar element */
export function enhanceAvatar(el, entity, particleSystem) {
  if (!el || el.dataset.tdlkEnhanced) return;
  el.style.position = "relative";
  el.dataset.tdlkEnhanced = "true";

  // Ring
  const ring = taoAvatarRing(entity, particleSystem);
  el.appendChild(ring);

  // Badge
  const badge = taoAvatarBadge(entity, particleSystem);
  if (badge) el.appendChild(badge);

  // Store refs for update
  el._tdlkRing = ring;
  el._tdlkBadge = badge;
}

/** Update enhanced avatar */
export function capNhatAvatar(el, entity, particleSystem) {
  if (!el || !el.dataset.tdlkEnhanced) return;
  const ring = el._tdlkRing;
  const badge = el._tdlkBadge;

  if (ring) {
    const visual = particleSystem.getVisualForRealm(Number(entity?.canhGioi ?? 0));
    ring.style.borderColor = visual.mau;
    ring.style.boxShadow = `0 0 10px ${visual.glow}, inset 0 0 10px ${visual.glow}`;

    // Breakthrough ready state
    const tuVi = Number(entity?.tuVi ?? 0);
    const tuViYeuCau = Number(entity?.tuViYeuCau ?? 1);
    if (tuVi >= tuViYeuCau && tuViYeuCau > 0) {
      ring.classList.add("tdlk-breakthrough-ready");
      ring.classList.remove("tdlk-cultivating");
    } else {
      ring.classList.remove("tdlk-breakthrough-ready");
      ring.classList.add("tdlk-cultivating");
    }
  }

  if (badge) {
    const newBadge = taoAvatarBadge(entity, particleSystem);
    if (newBadge) {
      badge.textContent = newBadge.textContent;
      badge.style.background = newBadge.style.background;
      badge.className = newBadge.className;
    } else {
      badge.remove();
      el._tdlkBadge = null;
    }
  }
}

/** ==========================================
 *  MAIN UI REGISTRATION
 *  ========================================== */
export function dangKyUI(tt, mod, particleSystem, cinematic) {
  const kit = tt.ui.kit;

  // ------------------------------------------
  // 1. DOCK - HUD Mini (Trụ cột 5)
  // ------------------------------------------
  mod.ui.addDock({
    id: "tdlk_dock",
    title: "🌌 Linh Khí",
    mount(el, tt) {
      el.innerHTML = "";
      const box = document.createElement("div");
      box.className = "tdlk-dock-box";
      el.appendChild(box);

      const update = () => {
        try {
          const s = tt.state();
          const nv = s?.run?.nhanVat;
          const opts = mod.options;

          const ambientStatus = particleSystem?.running ? "🟢 Đang chạy" : "🔴 Đã tắt";
          const quality = QUALITY_PRESETS?.[opts?.chat_luong]?.label || opts?.chat_luong || "trung_binh";
          const fps = particleSystem?.fps || 0;
          const biome = particleSystem?.currentBiome || "default";
          const particles = particleSystem?.particles || [];
          const particleCount = particles.filter(p => p?.type === "ambient").length;

          box.innerHTML = `
          <div class="tdlk-dock-row">
            <span class="tdlk-dock-label">Linh Khí Diện</span>
            <span class="tdlk-dock-value">${ambientStatus}</span>
          </div>
          <div class="tdlk-dock-row">
            <span class="tdlk-dock-label">Chất lượng</span>
            <span class="tdlk-dock-value">${quality}</span>
          </div>
          <div class="tdlk-dock-row">
            <span class="tdlk-dock-label">FPS / Particles</span>
            <span class="tdlk-dock-value">${fps} / ${particleCount}</span>
          </div>
          <div class="tdlk-dock-row">
            <span class="tdlk-dock-label">Biome</span>
            <span class="tdlk-dock-value">${biome}</span>
          </div>
          <div class="tdlk-dock-bar">
            <div class="tdlk-dock-bar-fill" style="width: ${Math.min(fps/60,1)*100}%; background: ${fps>45?'#10b981':fps>30?'#f59e0b':'#ef4444'};"></div>
          </div>
          <div class="tdlk-dock-status">
            <span class="tdlk-status-dot ${opts.bat_tat_linh_khi ? 'tdlk-active' : ''}" style="background: #10b981;" title="Linh Khí Diện"></span>
            <span class="tdlk-status-dot ${opts.bat_tat_thien_kiep ? 'tdlk-active' : ''}" style="background: #f59e0b;" title="Thiên Kiếp"></span>
            <span class="tdlk-status-dot ${opts.bat_tat_avatar_fx ? 'tdlk-active' : ''}" style="background: #8b5cf6;" title="Avatar FX"></span>
          </div>
        `;

        // Buttons
        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;";
        const btnToggle = kit.button({
          text: opts.bat_tat_linh_khi ? "⏸️ Tắt Ambient" : "▶️ Bật Ambient",
          kind: "nho",
          onClick: () => {
            mod.setOption("bat_tat_linh_khi", !opts.bat_tat_linh_khi);
            if (!opts.bat_tat_linh_khi) particleSystem.startAmbient();
            else particleSystem.stopAmbient();
          }
        });
        const btnTest = kit.button({
          text: "🎬 Test Kiếp",
          kind: "nho",
          onClick: () => cinematic.triggerTestCinematic("loi_kiep")
        });
        const btnPanel = kit.button({
          text: "⚙️ Cài đặt",
          kind: "nho",
          onClick: () => mod.ui.openPanel("tdlk_panel")
        });
        btnRow.append(btnToggle, btnTest, btnPanel);
        box.appendChild(btnRow);
      } catch (e) {
        mod.log("[UI] Dock update error:", e);
        box.innerHTML = `<div style="padding:8px;color:#ef4444;">Lỗi hiển thị dock: ${e.message}</div>`;
      }
    };

      update();
      return tt.subscribe(update);
    }
  });

  // ------------------------------------------
  // 2. PANEL - Cài đặt chi tiết
  // ------------------------------------------
  mod.ui.addPanel({
    id: "tdlk_panel",
    title: "⚙️ Thiên Địa Linh Khí",
    icon: "sparkles",
    mount(el, tt) {
      el.innerHTML = "";
      const opts = mod.options;

      // Section: Ambient
      const secAmbient = document.createElement("div");
      secAmbient.className = "tdlk-panel-section";
      secAmbient.innerHTML = `<div class="tdlk-panel-title">🌌 Linh Khí Diện Nền</div>`;

      const qualitySelect = kit.select({
        options: Object.entries(QUALITY_PRESETS).map(([k, v]) => ({ value: k, label: v.label })),
        value: opts.chat_luong,
        onChange: (v) => mod.setOption("chat_luong", v)
      });
      secAmbient.appendChild(kit.row({ label: "Chất lượng", children: [qualitySelect] }));

      const toggleAmbient = kit.toggle({
        label: "Bật/Tắt",
        checked: opts.bat_tat_linh_khi,
        onChange: (v) => mod.setOption("bat_tat_linh_khi", v)
      });
      secAmbient.appendChild(toggleAmbient);

      const toggleAutoQuality = kit.toggle({
        label: "Tự giảm quality khi lag",
        checked: opts.giam_toc_do_nguyen,
        onChange: (v) => mod.setOption("giam_toc_do_nguyen", v)
      });
      secAmbient.appendChild(toggleAutoQuality);

      el.appendChild(secAmbient);

      // Section: Cinematic
      const secCinematic = document.createElement("div");
      secCinematic.className = "tdlk-panel-section";
      secCinematic.innerHTML = `<div class="tdlk-panel-title">⚡ Thiên Kiếp Cinematic</div>`;

      const toggleCinematic = kit.toggle({
        label: "Bật/Tắt",
        checked: opts.bat_tat_thien_kiep,
        onChange: (v) => mod.setOption("bat_tat_thien_kiep", v)
      });
      secCinematic.appendChild(toggleCinematic);

      const toggleSound = kit.toggle({
        label: "Âm thanh (cần tương tác trước)",
        checked: opts.am_thanh,
        onChange: (v) => mod.setOption("am_thanh", v)
      });
      secCinematic.appendChild(toggleSound);

      // Test buttons
      const testRow = document.createElement("div");
      testRow.style.cssText = "display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;";
      ["loi_kiep", "hoa_kiep", "tam_ma_kiep", "thien_kiep_toi_thuong"].forEach(type => {
        const btn = kit.button({
          text: `Test ${type.replace("_", " ").toUpperCase()}`,
          kind: "nho",
          onClick: () => cinematic.triggerTestCinematic(type)
        });
        testRow.appendChild(btn);
      });
      secCinematic.appendChild(testRow);
      el.appendChild(secCinematic);

      // Section: Avatar FX
      const secAvatar = document.createElement("div");
      secAvatar.className = "tdlk-panel-section";
      secAvatar.innerHTML = `<div class="tdlk-panel-title">✨ Avatar State Visual</div>`;

      const toggleAvatar = kit.toggle({
        label: "Bật/Tắt Glow Ring & Badge",
        checked: opts.bat_tat_avatar_fx,
        onChange: (v) => mod.setOption("bat_tat_avatar_fx", v)
      });
      secAvatar.appendChild(toggleAvatar);

      // Realm color preview
      const realmPreview = document.createElement("div");
      realmPreview.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;";
      Object.entries(CANH_GIOI_VISUAL).forEach(([realm, v]) => {
        if (realm == 0) return;
        const dot = document.createElement("div");
        dot.style.cssText = `
          width:28px;height:28px;border-radius:50%;
          background:${v.mau};border:2px solid ${v.mau};
          box-shadow:0 0 8px ${v.glow};
          display:flex;align-items:center;justify-content:center;
          font-size:10px;color:#fff;text-shadow:0 1px 2px #000;
          cursor:default;transition:transform 0.2s;
        `;
        dot.textContent = realm;
        dot.title = `${v.ten} (${realm})`;
        dot.onmouseenter = () => dot.style.transform = "scale(1.2)";
        dot.onmouseleave = () => dot.style.transform = "scale(1)";
        realmPreview.appendChild(dot);
      });
      secAvatar.appendChild(realmPreview);
      el.appendChild(secAvatar);

      // Info
      const info = kit.richText("Mod <b>Thiên Địa Linh Khí</b> v1.0.0 — Kết hợp Linh Khí Diện nền + Thiên Kiếp Cinematic + Avatar Visual. Dùng dock để bật/tắt nhanh, panel để cấu hình chi tiết.");
      el.appendChild(info);

      // Section: Auto Update (lazy load)
      const secUpdate = document.createElement("div");
      secUpdate.className = "tdlk-panel-section";
      secUpdate.innerHTML = `<div class="tdlk-panel-title">🔄 Tự động cập nhật</div>`;

      import("./update.js").then(({ createUpdateCheckUI }) => {
        const updateUI = createUpdateCheckUI(mod, tt);
        if (updateUI) secUpdate.appendChild(updateUI);
      });

      el.appendChild(secUpdate);
    }
  });

  // ------------------------------------------
  // 3. SLOT - Character Tab (Avatar enhancement)
  // ------------------------------------------
  mod.ui.addSlot("characterTab", {
    id: "tdlk_avatar_fx",
    title: "🌌 Hiện Hình",
    mount(el, tt) {
      el.innerHTML = "";
      const box = document.createElement("div");
      box.style.cssText = "padding: 8px; display:flex;flex-direction:column;gap:8px;";
      el.appendChild(box);

      const update = () => {
        try {
          if (!mod.options?.bat_tat_avatar_fx) {
            box.innerHTML = `<div class="hud-phu" style="text-align:center;padding:20px;">Avatar FX đã tắt. Bật trong dock hoặc panel.</div>`;
            return;
          }

          const s = tt.state();
          const nv = s?.run?.nhanVat;
          if (!nv) return;

          const visual = particleSystem?.getVisualForRealm?.(Number(nv.canhGioi ?? 0)) || { ten: "Phàm Nhân", mau: "#888", glow: "rgba(136,136,136,0.4)" };
          const tuVi = Number(nv.tuVi ?? 0);
          const tuViYeuCau = Number(nv.tuViYeuCau ?? 1);
          const canBreakthrough = tuVi >= tuViYeuCau && tuViYeuCau > 0;

          box.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:linear-gradient(135deg,${visual.mau}20,transparent);border-radius:12px;border:1px solid ${visual.mau}40;">
              <div style="width:60px;height:60px;border-radius:50%;background:conic-gradient(from 0deg,${visual.mau},${visual.mau}80%,transparent);display:flex;align-items:center;justify-content:center;position:relative;">
                <div style="width:52px;height:52px;border-radius:50%;background:var(--nen-hud);display:flex;align-items:center;justify-content:center;font-size:24px;">
                  ${visual.ten.charAt(0)}
                </div>
                <div class="tdlk-avatar-ring tdlk-breakthrough-ready" style="border-color:${visual.mau};box-shadow:0 0 15px ${visual.glow};"></div>
              </div>
              <div style="flex:1;">
                <div style="font-weight:600;font-size:14px;color:var(--chu-do);">${visual.ten}</div>
                <div style="font-size:12px;color:var(--muc);">Tu vi: ${tuVi}/${tuViYeuCau} ${canBreakthrough ? '⚡ <b style="color:#f59e0b">SẴN SÀNG ĐỘT PHÁ</b>' : ''}</div>
                <div style="font-size:11px;color:var(--muc-nhat);margin-top:4px;">Cảnh giới: ${visual.ten} • Linh thạch: ${nv.linhThach ?? 0}</div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--muc-nhat);">
              <b>Hiệu ứng:</b> Glow ring theo cảnh giới • Badge trạng thái (⚡ đột phá, 🗺️ lịch luyện, 👿 ma hóa, 👑 đại sư huynh/tỷ) • Cinematic khi đột phá
            </div>
          `;
        } catch (e) {
          mod.log("[UI] CharacterTab update error:", e);
          box.innerHTML = `<div style="padding:8px;color:#ef4444;">Lỗi hiển thị: ${e.message}</div>`;
        }
      };

      update();
      return tt.subscribe(update);
    }
  });

  // ------------------------------------------
  // 4. SLOT - Place Info (Biome indicator)
  // ------------------------------------------
  mod.ui.addSlot("placeInfo", {
    id: "tdlk_biome_info",
    title: "🌍 Biome",
    mount(el, tt) {
      el.innerHTML = "";
      const box = document.createElement("div");
      box.style.cssText = "padding: 4px 8px; font-size: 11px;";
      el.appendChild(box);

      const update = () => {
        try {
          const s = tt.state();
          const nv = s?.run?.nhanVat;
          const place = s?.run?.noiChon;
          if (!place) {
            box.textContent = "Chưa có nơi chốn";
            return;
          }

          // Infer biome from place type/faction
          let biome = "default";
          if (place.loai?.includes("nui")) biome = "nui";
          else if (place.loai?.includes("bien") || place.loai?.includes("ha")) biome = "bien";
          else if (place.loai?.includes("rung")) biome = "rung";
          else if (place.phe === "ta") biome = "ta_phai";
          else if (place.phe === "chinh") biome = "chinh_phai";
          else if (place.loai?.includes("dong_phu") || place.loai?.includes("bi_canh")) biome = "bich_canh";

          particleSystem?.setBiome?.(biome);

          const biomeNames = {
            default: "Bình thường", nui: "Núi rừng", bien: "Biển/Hồ",
            rung: "Rừng già", sa_moc: "Sa mạc", bich_canh: "Bí cảnh",
            ta_phai: "Tà phái", chinh_phai: "Chính phái", thien_kiep: "Thiên Kiếp"
          };

          box.innerHTML = `
            <span style="color:var(--chu-do);">${place.ten || "Vô danh"}</span>
            <span class="hud-phu" style="margin-left:8px;">🌿 ${biomeNames[biome] || biome}</span>
          `;
        } catch (e) {
          mod.log("[UI] PlaceInfo update error:", e);
          box.textContent = "Lỗi biome";
        }
      };

      update();
      return tt.subscribe(update);
    }
  });

  // ------------------------------------------
  // 5. SLOT - Map Layer (Optional: minimap particles)
  // ------------------------------------------
  mod.ui.addSlot("mapLayer", {
    id: "tdlk_map_particles",
    mount(layer, tt) {
      // PixiJS container - could add subtle particle layer on world map
      const g = new tt.pixi.Graphics();
      layer.addChild(g);
      tt.map.requestRender();
      return () => { g.destroy(); layer.removeChild(g); };
    }
  });
}