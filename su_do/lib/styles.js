/**
 * Mod Sư Đồ Truyền Thừa (su_do) - Master Styles
 */

export const STYLE_ID = 'mod-su-do-master-css';

export function injectMasterStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .su-do-panel,
      .su-do-panel * {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      .su-do-panel *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      .hud-phai:has(.su-do-panel) {
        width: 360px !important;
      }
      .hud-khung.mod-panel:has(.su-do-panel) {
        width: 360px !important;
        max-width: calc(100vw - 20px) !important;
      }
      .mod-panel-dau {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
      }
      .mod-panel-dau b {
        font-size: 13.5px !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
      }
      .mod-panel-dau .hud-phu {
        font-size: 11px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .su-do-panel {
        font-family: inherit;
        color: var(--muc);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Tab bar 2 hàng gọn gàng, không bị cắt cụt chữ */
      .su-do-panel .ui-tabs {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 4px !important;
        margin: 0 0 8px 0 !important;
      }
      .su-do-panel .ui-tabs > button {
        padding: 5px 2px !important;
        font-size: 11.5px !important;
        font-weight: 500 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        text-align: center !important;
      }

      .su-do-header {
        border: 1px solid var(--vien-hud);
        background: linear-gradient(180deg, rgba(218, 165, 32, 0.08) 0%, rgba(0,0,0,0.02) 100%);
        border-radius: 8px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .su-do-header-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }

      .su-do-title-text {
        font-size: 13.5px;
        font-weight: bold;
        color: var(--chu-do);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .su-do-header-sub {
        font-size: 11px;
        color: var(--muc-nhat);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .su-do-header-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        margin-top: 2px;
        padding-top: 4px;
        border-top: 1px dashed var(--vien-trong);
        white-space: nowrap;
      }
      .su-do-header-stats > span {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        white-space: nowrap;
      }

      /* Thẻ bài đệ tử */
      .su-do-card {
        border: 1px solid var(--vien-hud);
        background: var(--nen-hud);
        border-radius: 8px;
        padding: 6px 8px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        transition: border-color 0.2s ease;
      }
      .su-do-card:hover {
        border-color: var(--vien-muc);
      }
      .su-do-card.su-do-ma-hoa {
        border-color: #ef4444 !important;
        background: linear-gradient(180deg, rgba(239,68,68,0.08) 0%, var(--nen-hud) 100%) !important;
      }

      .su-do-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1.5px solid var(--vien-hud, #d4c5a9);
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        overflow: hidden;
        background-color: rgba(0,0,0,0.03);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .su-do-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .su-do-card-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
      }

      .su-do-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        line-height: 1.4;
        font-weight: 500;
        white-space: nowrap !important;
      }

      .su-do-progress-bar {
        flex: 1 1 auto;
        height: 5px;
        background: rgba(0,0,0,0.08);
        border-radius: 3px;
        overflow: hidden;
        position: relative;
        min-width: 40px;
      }
      .su-do-progress-val {
        height: 100%;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      .su-do-progress-val.su-do-progress-max {
        background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
      }

      .su-do-action-grid {
        display: flex;
        gap: 4px;
        align-items: center;
        margin-top: 2px;
      }
      .su-do-action-grid > button {
        flex: 1 1 0;
        min-width: 0;
        padding: 4px 4px !important;
        font-size: 11px !important;
        white-space: nowrap !important;
        text-align: center !important;
      }

      .su-do-action-subgrid {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: space-between;
      }
      .su-do-action-subgrid > button {
        padding: 2px 6px !important;
        font-size: 10.5px !important;
        white-space: nowrap !important;
      }

      .su-do-btn-wrap {
        white-space: nowrap !important;
      }

      /* Card Kiến Thiết Đạo Tràng */
      .su-do-kienthiet-card {
        border: 1px solid var(--vien-hud);
        background: var(--nen-hud);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.03);
      }
      .su-do-kienthiet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }
      .su-do-kienthiet-title {
        font-size: 13px;
        font-weight: bold;
        color: var(--chu-do);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* Luận Kiếm Arena */
      .su-do-arena-box {
        border: 1px solid var(--vien-hud);
        background: linear-gradient(180deg, rgba(218,165,32,0.05) 0%, var(--nen-hud) 100%);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .su-do-combat-log {
        background: rgba(0,0,0,0.03);
        border: 1px dashed var(--vien-trong);
        border-radius: 6px;
        padding: 8px;
        font-size: 11.5px;
        line-height: 1.5;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      /* Dock HUD Widget */
      .su-do-dock-box {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 6px 8px;
        font-size: 11.5px;
        line-height: 1.3;
      }
    `;
    document.head.append(style);
  }
