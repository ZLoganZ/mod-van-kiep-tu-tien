// lib/styles.js - Master CSS cho mod Thiên Địa Linh Khí

export const STYLE_ID = "mod-tdlk-master-css";

export function injectMasterStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
/* ==========================================
   AMBIENT CANVAS OVERLAY
   ========================================== */
.tdlk-ambient-canvas {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 1; /* dưới UI game, trên background */
  opacity: 0.14;
  transition: opacity 0.5s ease;
}
.tdlk-ambient-canvas.tdlk-hidden { opacity: 0; display: none; }
.tdlk-ambient-canvas.tdlk-intense { opacity: 0.3; }

/* ==========================================
   CINEMATIC OVERLAY (full-screen)
   ========================================== */
.tdlk-cinematic-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 9998; /* trên mọi UI trừ modal */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(57, 48, 36, 0.06);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.tdlk-cinematic-overlay.tdlk-active {
  opacity: 1;
  visibility: visible;
}
.tdlk-cinematic-canvas {
  width: 100%; height: 100%;
  display: block;
}

/* Cinematic text overlay */
.tdlk-cinematic-text {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
  min-width: min(280px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  padding: 14px 24px;
  border: 1px solid rgba(104, 81, 52, 0.3);
  background: rgba(244, 238, 220, 0.78);
  box-shadow: 0 3px 16px rgba(48, 40, 29, 0.16);
  pointer-events: none;
  text-align: center;
  z-index: 10;
}
.tdlk-cinematic-title {
  font-family: Georgia, "Noto Serif", serif;
  font-size: clamp(1.25rem, 4.5vw, 3rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 5px rgba(52, 39, 26, 0.2);
  animation: tdlk-title-appear 0.5s ease-out both;
  line-height: 1.1;
  white-space: normal;
}
.tdlk-cinematic-subtitle {
  color: #514638;
  font-size: clamp(0.85rem, 2vw, 1rem);
  margin-top: 0.6rem;
  opacity: 0.9;
}

/* ==========================================
   AVATAR STATE VISUAL
   ========================================== */
.tdlk-avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 5;
  animation: tdlk-ring-pulse 3s ease-in-out infinite;
  box-shadow: 0 0 0 0 currentColor;
}
.tdlk-avatar-ring.tdlk-breakthrough-ready {
  animation: tdlk-ring-breakthrough 1s ease-in-out infinite;
  box-shadow: 0 0 20px 4px currentColor;
}
.tdlk-avatar-ring.tdlk-cultivating {
  animation: tdlk-ring-cultivate 4s ease-in-out infinite;
}

.tdlk-avatar-badge {
  position: absolute;
  bottom: -8px; right: -8px;
  min-width: 20px; height: 20px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  z-index: 6;
  animation: tdlk-badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.tdlk-avatar-badge.tdlk-pulse { animation: tdlk-badge-pulse 2s ease-in-out infinite; }

/* ==========================================
   DOCK / PANEL UI
   ========================================== */
.tdlk-dock-box {
  display: flex; flex-direction: column; gap: 6px;
  padding: 8px; font-size: 12px; line-height: 1.4;
}
.tdlk-dock-row {
  display: flex; justify-content: space-between; align-items: center;
  gap: 8px; flex-wrap: wrap;
}
.tdlk-dock-label { color: var(--muc-nhat); font-size: 11px; }
.tdlk-dock-value { font-weight: 600; color: var(--chu-do); white-space: nowrap; }
.tdlk-dock-bar {
  width: 100%; height: 4px; background: rgba(0,0,0,0.1);
  border-radius: 2px; overflow: hidden; margin-top: 2px;
}
.tdlk-dock-bar-fill {
  height: 100%; border-radius: 2px;
  transition: width 0.5s ease, background 0.3s ease;
}
.tdlk-dock-status {
  display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;
}
.tdlk-status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  animation: tdlk-dot-pulse 2s ease-in-out infinite;
}
.tdlk-status-dot.tdlk-active { animation-duration: 1s; }

.tdlk-panel-section {
  border: 1px solid var(--vien-hud);
  background: var(--nen-hud);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}
.tdlk-panel-title {
  font-weight: 600; color: var(--chu-do);
  margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
}
.tdlk-setting-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0; border-bottom: 1px dashed var(--vien-trong);
}
.tdlk-setting-row:last-child { border-bottom: none; }
.tdlk-setting-label { color: var(--muc); font-size: 12px; }
.tdlk-setting-hint { color: var(--muc-nhat); font-size: 11px; margin-top: 2px; }

/* ==========================================
   ANIMATIONS
   ========================================== */
@keyframes tdlk-title-appear {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes tdlk-ring-pulse {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50% { box-shadow: 0 0 15px 3px currentColor; }
}
@keyframes tdlk-ring-breakthrough {
  0% { box-shadow: 0 0 0 0 currentColor; transform: scale(1); }
  50% { box-shadow: 0 0 30px 8px currentColor; transform: scale(1.05); }
  100% { box-shadow: 0 0 0 0 currentColor; transform: scale(1); }
}
@keyframes tdlk-ring-cultivate {
  0%, 100% { box-shadow: 0 0 8px 1px currentColor; opacity: 0.6; }
  50% { box-shadow: 0 0 20px 4px currentColor; opacity: 1; }
}
@keyframes tdlk-badge-pop {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes tdlk-badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
@keyframes tdlk-dot-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ==========================================
   CINEMATIC TYPE SPECIFIC
   ========================================== */
/* Lôi Kiếp - xanh mực */
.tdlk-cinematic-loi_kiep .tdlk-cinematic-title { color: #52677b; }

/* Hỏa Kiếp - sắc son đất */
.tdlk-cinematic-hoa_kiep .tdlk-cinematic-title { color: #98552f; }

/* Tâm Ma Kiếp - tím khói */
.tdlk-cinematic-tam_ma_kiep .tdlk-cinematic-title { color: #6d5a78; }

/* Thiên Kiếp Tối Thượng - vàng cổ */
.tdlk-cinematic-thien_kiep_toi_thuong .tdlk-cinematic-title { color: #88703d; }

/* ==========================================
   RESPONSIVE / PERFORMANCE
   ========================================== */
@media (prefers-reduced-motion: reduce) {
  .tdlk-ambient-canvas,
  .tdlk-cinematic-overlay *,
  .tdlk-avatar-ring,
  .tdlk-avatar-badge,
  .tdlk-status-dot {
    animation: none !important;
    transition: none !important;
  }
}

/* Low quality mode */
.tdlk-ambient-canvas.tdlk-quality-thap { opacity: 0.3 !important; }
`;
  document.head.appendChild(style);
}