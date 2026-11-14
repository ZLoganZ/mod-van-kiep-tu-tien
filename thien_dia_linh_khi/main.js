// main.js - Mod Thiên Địa Linh Khí (ES Module)

import { MOD_ID, MOD_VERSION, CANH_GIOI_VISUAL, BIOME_CONFIG, QUALITY_PRESETS } from "./lib/constants.js";

// Expose ra window để các file lib khác dùng (backwards compat)
window.__TDLK_CONSTANTS = {
  MOD_ID, MOD_VERSION, CANH_GIOI_VISUAL, BIOME_CONFIG, QUALITY_PRESETS
};

// ==========================================
// BOOT PHASE
// ==========================================
function boot(tt, mod) {
  mod.log(`[${MOD_ID}] Boot v${MOD_VERSION}`);

  // Register balance overrides nếu cần
  // mod.setBalance("cultivation.TU_VI_MOI_NAM", 1.05);

  // Add custom effects/conditions cho cinematic
  mod.addEffect("tdlk_thien_kiep_active", {
    description: "Đang trải nghiệm Thiên Kiếp cinematic",
    duration: 0 // permanent until removed
  });

  mod.addCondition("tdlk_can_trigger_cinematic", (ctx) => {
    const opts = mod.options;
    return opts.bat_tat_thien_kiep && !ctx.flags?.tdlk_cinematic_playing;
  });
}

// ==========================================
// READY PHASE
// ==========================================
async function ready(tt, mod) {
  mod.log(`[${MOD_ID}] Ready`);

  const { injectMasterStyles } = await import("./lib/styles.js");
  const { ParticleSystem } = await import("./lib/core.js");
  const { CinematicController } = await import("./lib/cinematic.js");
  const { dangKyUI } = await import("./lib/ui.js");
  const { dangKyHooks } = await import("./lib/hooks.js");
  const { startPeriodicUpdateCheck } = await import("./lib/update.js");

  // Inject CSS
  injectMasterStyles();

  // Khởi tạo Particle System (singleton)
  const particleSystem = new ParticleSystem(tt, mod);
  window.__TDLK_ParticleSystem = particleSystem;

  // Khởi tạo Cinematic Controller
  const cinematic = new CinematicController(tt, mod, particleSystem);
  window.__TDLK_Cinematic = cinematic;

  // Đăng ký UI
  dangKyUI(tt, mod, particleSystem, cinematic);

  // Đăng ký Hooks
  dangKyHooks(tt, mod, particleSystem, cinematic);

  // Auto-start ambient nếu bật
  if (mod.options.bat_tat_linh_khi) {
    particleSystem.startAmbient();
  }

  // Khởi động auto-update check (mặc định 24h, silent)
  startPeriodicUpdateCheck(mod, 24);

  mod.log(`[${MOD_ID}] Khởi động hoàn tất`);
}

// ==========================================
// REGISTER MOD
// ==========================================
(window.tuTienMods ??= []).push({
  id: MOD_ID,
  boot,
  ready
});