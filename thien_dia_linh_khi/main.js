// main.js - Mod Thiên Địa Linh Khí (ES Module)

import { DEFAULT_OPTIONS, MOD_ID, MOD_VERSION, QUALITY_PRESETS } from "./lib/constants.js";

function createRuntimeOptions(mod) {
  const values = { ...DEFAULT_OPTIONS, ...(mod.options || {}) };
  if (!QUALITY_PRESETS[values.chat_luong]) values.chat_luong = DEFAULT_OPTIONS.chat_luong;

  const listeners = new Set();
  return {
    get(key) {
      return values[key];
    },
    set(key, value) {
      if (values[key] === value) return;
      values[key] = value;
      listeners.forEach(listener => listener(key, value));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

function boot(tt, mod) {
  mod.log(`[${MOD_ID}] Boot v${MOD_VERSION}`);
}

async function ready(tt, mod) {
  mod.log(`[${MOD_ID}] Ready`);

  const { injectMasterStyles } = await import("./lib/styles.js");
  const { ParticleSystem } = await import("./lib/core.js");
  const { CinematicController } = await import("./lib/cinematic.js");
  const { dangKyUI } = await import("./lib/ui.js");
  const { dangKyHooks } = await import("./lib/hooks.js");
  const { startPeriodicUpdateCheck } = await import("./lib/update.js");
  const options = createRuntimeOptions(mod);

  injectMasterStyles();

  const particleSystem = new ParticleSystem(tt, mod);
  particleSystem.setQuality(options.get("chat_luong"));
  particleSystem.ambientEnabled = options.get("bat_tat_linh_khi");
  particleSystem.autoQualityEnabled = options.get("giam_toc_do_nguyen");
  window.__TDLK_ParticleSystem = particleSystem;

  const cinematic = new CinematicController(tt, mod, particleSystem, options);
  window.__TDLK_Cinematic = cinematic;

  dangKyUI(tt, mod, particleSystem, cinematic, options);
  dangKyHooks(tt, mod, particleSystem, cinematic, options);

  options.subscribe((key, value) => {
    if (key === "chat_luong") particleSystem.setQuality(value);
    if (key === "bat_tat_linh_khi") {
      particleSystem.ambientEnabled = value;
      if (value) particleSystem.startAmbient();
      else particleSystem.stopAmbient();
    }
    if (key === "giam_toc_do_nguyen") particleSystem.autoQualityEnabled = value;
  });

  if (options.get("bat_tat_linh_khi")) {
    particleSystem.startAmbient();
  }

  startPeriodicUpdateCheck(mod, 24);
  mod.log(`[${MOD_ID}] Khởi động hoàn tất`);
}

(window.tuTienMods ??= []).push({
  id: MOD_ID,
  boot,
  ready
});