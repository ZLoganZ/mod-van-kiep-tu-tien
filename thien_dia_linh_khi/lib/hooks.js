// lib/hooks.js - Game Event Hooks (Breakthrough, Place Change, State Changes)

/** Đăng ký các hooks lắng nghe game events */
export function dangKyHooks(tt, mod, particleSystem, cinematic) {
  // ------------------------------------------
  // 1. BREAKTHROUGH EVENT - Trigger Cinematic
  // ------------------------------------------
  tt.on("breakthrough", async (data) => {
    const { entity, isPlayer, realm, tuVi } = data;
    mod.log("[Hook] Breakthrough:", entity?.ten, "realm:", realm);

    if (!mod.options.bat_tat_thien_kiep) return;

    // Set thien_kiep biome during cinematic
    const prevBiome = particleSystem.currentBiome;
    particleSystem.setBiome("thien_kiep");

    // Trigger cinematic
    await cinematic.onBreakthrough(entity, { realm, isPlayer, tuVi });

    // Restore biome after
    setTimeout(() => particleSystem.setBiome(prevBiome), 2000);
  });

  // ------------------------------------------
  // 2. PLACE/MAP CHANGE - Switch Biome
  // ------------------------------------------
  tt.on("placeChanged", (data) => {
    const { place, oldPlace } = data;
    if (!place) return;

    // Infer biome from place properties
    let biome = "default";
    if (place.loai) {
      const loai = place.loai.toLowerCase();
      if (loai.includes("nui")) biome = "nui";
      else if (loai.includes("bien") || loai.includes("ha")) biome = "bien";
      else if (loai.includes("rung")) biome = "rung";
      else if (loai.includes("sa") || loai.includes("mac")) biome = "sa_moc";
      else if (loai.includes("dong_phu") || loai.includes("bi_canh") || loai.includes("doanh")) biome = "bich_canh";
    }
    if (place.phe === "ta") biome = "ta_phai";
    else if (place.phe === "chinh") biome = "chinh_phai";

    if (biome !== particleSystem.currentBiome) {
      mod.log("[Hook] Place changed:", place.ten, "→ biome:", biome);
      particleSystem.setBiome(biome);
    }
  });

  // ------------------------------------------
  // 3. PLAYER STATE CHANGES - Update Avatar FX
  // ------------------------------------------
  tt.on("stateChanged", (data) => {
    const { path, value, oldValue } = data;

    // Tu vi change - check breakthrough readiness
    if (path?.includes("tuVi") || path?.includes("tuViYeuCau")) {
      const nv = tt.state()?.run?.nhanVat;
      if (nv && mod.options.bat_tat_avatar_fx) {
        // Force update avatar visuals
        const avatars = document.querySelectorAll(".tdlk-avatar-ring, .avatar, [data-avatar]");
        avatars.forEach(el => {
          if (el.dataset?.tdlkEnhanced) {
            // Will be updated via subscribe in UI
          }
        });
      }
    }

    // Canh gioi change - update ring color
    if (path?.includes("canhGioi")) {
      mod.log("[Hook] Cảnh giới changed:", oldValue, "→", value);
      // Particle system will pick up new realm via getVisualForRealm
    }

    // Trang thai change - update badge
    if (path?.includes("trangThai")) {
      mod.log("[Hook] Trạng thái changed:", value?.loai);
    }
  });

  // ------------------------------------------
  // 4. LIFE END / REINCARNATION - Cleanup
  // ------------------------------------------
  tt.on("lifeEnd", (data) => {
    const { entity, isPlayer } = data;
    mod.log("[Hook] Life end:", entity?.ten, "isPlayer:", isPlayer);

    if (isPlayer) {
      // Stop all effects, reset biome
      particleSystem.setBiome("default");
      cinematic.destroy();
    }
  });

  // ------------------------------------------
  // 5. COMBAT EVENTS - Optional visual feedback
  // ------------------------------------------
  tt.on("combatStart", (data) => {
    if (!mod.options.bat_tat_linh_khi) return;
    // Intensify particles during combat
    particleSystem.setIntensity("high");
  });

  tt.on("combatEnd", (data) => {
    particleSystem.setIntensity("normal");
  });

  // ------------------------------------------
  // 6. ITEM/CONSUMABLE USE - Visual feedback
  // ------------------------------------------
  tt.on("itemUsed", (data) => {
    const { item, target } = data;
    if (!item) return;

    // Special items trigger particle burst
    const specialItems = ["linh_dan", "kim_dan", "nguyen_anh_dan", "thien_ky_dan", "kiep_hoa_dan"];
    if (specialItems.some(id => item.id?.includes(id) || item.ten?.includes(id))) {
      particleSystem.burstAt(target?.x ?? window.innerWidth/2, target?.y ?? window.innerHeight/2, {
        type: "cinematic",
        count: 30,
        color: "#fbbf24"
      });
    }
  });

  // ------------------------------------------
  // 7. CULTIVATION SESSION - Ambient changes
  // ------------------------------------------
  tt.on("cultivationStart", (data) => {
    const { method, location } = data;
    mod.log("[Hook] Cultivation start:", method, location);
    // Could intensify ambient particles
    if (method === "be_quan" || method === "tu_luyen") {
      particleSystem.setIntensity("meditate");
    }
  });

  tt.on("cultivationEnd", (data) => {
    particleSystem.setIntensity("normal");
  });

  // ------------------------------------------
  // 8. MOD OPTIONS CHANGE - React to settings
  // ------------------------------------------
  mod.onOptionChange?.((key, value, oldValue) => {
    mod.log("[Hook] Option changed:", key, oldValue, "→", value);

    switch (key) {
      case "bat_tat_linh_khi":
        if (value) particleSystem.startAmbient();
        else particleSystem.stopAmbient();
        break;
      case "bat_tat_thien_kiep":
        if (!value) cinematic.destroy();
        break;
      case "chat_luong":
        particleSystem.setQuality(value);
        break;
      case "bat_tat_avatar_fx":
        // UI handles this via subscribe
        break;
      case "giam_toc_do_nguyen":
        particleSystem.autoQualityEnabled = value;
        break;
      case "am_thanh":
        // Just a flag for cinematic
        break;
    }
  });

  // ------------------------------------------
  // 9. REAL-TIME SUBSCRIPTION - For UI updates
  // ------------------------------------------
  // This runs every tick - lightweight
  let lastFpsCheck = 0;
  tt.subscribe(() => {
    const now = Date.now();
    if (now - lastFpsCheck > 1000) {
      lastFpsCheck = now;
      // FPS is tracked in particleSystem
    }
  });

  mod.log("[Hooks] All hooks registered");
}

/** Helper: Get biome từ place object */
export function inferBiomeFromPlace(place) {
  if (!place) return "default";
  const loai = (place.loai || "").toLowerCase();
  if (loai.includes("nui")) return "nui";
  if (loai.includes("bien") || loai.includes("ha")) return "bien";
  if (loai.includes("rung")) return "rung";
  if (loai.includes("sa") || loai.includes("mac")) return "sa_moc";
  if (loai.includes("dong_phu") || loai.includes("bi_canh") || loai.includes("doanh")) return "bich_canh";
  if (place.phe === "ta") return "ta_phai";
  if (place.phe === "chinh") return "chinh_phai";
  return "default";
}

/** Helper: Determine kiep type từ realm */
export function getKiepTypeForRealm(realm) {
  if (realm >= 8) return "thien_kiep_toi_thuong";
  if (realm >= 5) return "tam_ma_kiep";
  if (realm >= 4) return "loi_kiep";
  return "hoa_kiep";
}