// lib/constants.js - Shared constants extracted from main.js IIFE

/** Cảnh giới mapping cho visual */
export const CANH_GIOI_VISUAL = {
  0: { ten: "Phàm Nhân", mau: "#888888", glow: "rgba(136,136,136,0.4)", kiep: null },
  1: { ten: "Luyện Khí", mau: "#4ade80", glow: "rgba(74,222,128,0.5)", kiep: null },
  2: { ten: "Trúc Cơ", mau: "#60a5fa", glow: "rgba(96,165,250,0.55)", kiep: null },
  3: { ten: "Kim Đan", mau: "#fbbf24", glow: "rgba(251,191,36,0.6)", kiep: "hoa_kiep" },
  4: { ten: "Nguyên Anh", mau: "#f87171", glow: "rgba(248,113,113,0.65)", kiep: "loi_kiep" },
  5: { ten: "Hóa Thần", mau: "#a78bfa", glow: "rgba(167,139,250,0.7)", kiep: "tam_ma_kiep" },
  6: { ten: "Hợp Thể", mau: "#f472b6", glow: "rgba(244,114,182,0.75)", kiep: "loi_kiep" },
  7: { ten: "Đại Thừa", mau: "#38bdf8", glow: "rgba(56,189,248,0.8)", kiep: "tam_ma_kiep" },
  8: { ten: "Vô Cực", mau: "#ffffff", glow: "rgba(255,255,255,0.9)", kiep: "thien_kiep_toi_thuong" }
};

/** Biome → particle config */
export const BIOME_CONFIG = {
  default: { hue: 120, saturation: 0.6, speed: 1.0, density: 1.0, weather: "none" },
  nui: { hue: 100, saturation: 0.5, speed: 0.8, density: 1.2, weather: "mist" },
  bien: { hue: 200, saturation: 0.7, speed: 1.2, density: 1.0, weather: "mist" },
  rung: { hue: 130, saturation: 0.6, speed: 0.9, density: 1.1, weather: "rain" },
  sa_moc: { hue: 40, saturation: 0.4, speed: 1.3, density: 0.8, weather: "dust" },
  bich_canh: { hue: 280, saturation: 0.8, speed: 0.7, density: 1.5, weather: "sparkle" },
  ta_phai: { hue: 0, saturation: 0.7, speed: 1.1, density: 1.3, weather: "ember" },
  chinh_phai: { hue: 50, saturation: 0.6, speed: 0.9, density: 1.2, weather: "golden" },
  thien_kiep: { hue: 30, saturation: 1.0, speed: 2.0, density: 2.0, weather: "storm" }
};

/** Quality presets */
export const QUALITY_PRESETS = {
  thap: { maxParticles: 30, useShader: false, fpsCap: 30, cinematicParticles: 50 },
  trung_binh: { maxParticles: 100, useShader: true, fpsCap: 45, cinematicParticles: 150 },
  cao: { maxParticles: 200, useShader: true, fpsCap: 60, cinematicParticles: 300 }
};

/** Mod metadata */
export const MOD_ID = "thien_dia_linh_khi";
export const MOD_VERSION = "1.0.0";

/** Cinematic type labels */
export const KIEP_LABELS = {
  loi_kiep: "Lôi Kiếp",
  hoa_kiep: "Hỏa Kiếp",
  tam_ma_kiep: "Tâm Ma Kiếp",
  thien_kiep_toi_thuong: "Thiên Kiếp Tối Thượng"
};

/** Biome labels */
export const BIOME_LABELS = {
  default: "Bình thường", nui: "Núi rừng", bien: "Biển/Hồ",
  rung: "Rừng già", sa_moc: "Sa mạc", bich_canh: "Bí cảnh",
  ta_phai: "Tà phái", chinh_phai: "Chính phái", thien_kiep: "Thiên Kiếp"
};

/** Default mod options */
export const DEFAULT_OPTIONS = {
  chat_luong: "trung_binh",
  bat_tat_linh_khi: true,
  bat_tat_thien_kiep: true,
  bat_tat_avatar_fx: true,
  am_thanh: true,
  giam_toc_do_nguyen: true
};

/** Cinematic cooldown (ms) */
export const CINEMATIC_COOLDOWN = 2000;

/** Particle system defaults */
export const PARTICLE_DEFAULTS = {
  ambient: { wrapAround: true, trailLength: 0 },
  cinematic: { wrapAround: false, trailLength: 8, centerBurst: true }
};