// lib/ui.js
// Quản lý điều phối giao diện Đạo Tràng, Tabs, Slots & HUD Mini-Dock

import { injectMasterStyles } from "./styles.js";

import { dinhDangCanhGioi, layModData, sucChuaDeTu } from "./utils.js";

import { capNhatDanhSachDeTu, capNhatUngVien } from "./ui_card.js";

import {
  capNhatKienThiet,
  capNhatLuanKiem,
  capNhatLichLuyen,
  capNhatNhatKy,
  capNhatTienDuyen,
} from "./ui_tabs.js";

let unsubLifeEndListener = null;

// ==========================================
// HEADER ĐẠO TRÀNG
// ==========================================
export function taoDaoTrangHeader(data, nv, maxDt, kitInstance, ttInstance) {
  const header = document.createElement("div");
  header.className = "su-do-header";

  const titleRow = document.createElement("div");
  titleRow.className = "su-do-header-title";

  const titleText = document.createElement("span");
  titleText.className = "su-do-title-text";
  titleText.textContent = data.daoTrangTen;
  titleRow.append(titleText);

  const btnDoiTen = kitInstance.button({
    text: "✏️ Đổi Tên",
    kind: "nho",
    onClick: async () => {
      const tenMoi = prompt(
        "Nhập danh hiệu Đạo Tràng mới của Sư Tôn:",
        data.daoTrangTen,
      );
      if (tenMoi && tenMoi.trim() && tenMoi.trim() !== data.daoTrangTen) {
        ttInstance.game.modAction("su_do", "doi_ten_dao_trang", {
          ten: tenMoi.trim(),
        });
        ttInstance.ui.toast(`Đã đổi tên đạo tràng thành "${tenMoi.trim()}"!`);
      }
    },
  });
  btnDoiTen.classList.add("su-do-btn-wrap");
  btnDoiTen.style.cssText += "padding: 1px 6px; font-size: 10.5px;";
  titleRow.append(btnDoiTen);
  header.append(titleRow);

  const subRow = document.createElement("div");
  subRow.className = "su-do-header-sub";
  header.append(subRow);

  const statsRow = document.createElement("div");
  statsRow.className = "su-do-header-stats";
  header.append(statsRow);

  header._update = (newData, newNv, newMaxDt) => {
    titleText.textContent = newData.daoTrangTen;
    const cgTen = dinhDangCanhGioi(newNv?.canhGioi ?? 0);
    subRow.textContent = `Sư Tôn: ${newNv?.ten ?? "Vô Danh"} (${cgTen})`;

    const count = newData.danhSachDeTu.length;
    const capTLT = Number(newData.daoTrang?.kienThiet?.tuLinhTran?.cap) || 0;
    const capHT = Number(newData.daoTrang?.kienThiet?.hoTongDaiTran?.cap) || 0;
    statsRow.innerHTML = `
      <span>👥 Đồ đệ: <b>${count}/${newMaxDt}</b></span>
      <span>⚡ Tụ Linh: <b>Lv${capTLT}</b></span>
      <span>🛡️ Hộ Tông: <b>Lv${capHT}</b></span>
      <span>💰 Linh thạch: <b>${newNv?.linhThach ?? 0}</b></span>
    `;
  };

  header._update(data, nv, maxDt);
  return header;
}

// ==========================================
// DỰNG GIAO DIỆN SƯ MÔN CHÍNH THỐNG
// ==========================================
export function taoSuMonDashboard(
  container,
  ttInstance,
  kitInstance,
  { isCharacterTab = false } = {},
) {
  const s0 = ttInstance.state();
  const data0 = layModData(s0);
  const nv0 = s0.run?.nhanVat;
  const maxDt0 = sucChuaDeTu(nv0?.canhGioi ?? 0);

  const header = taoDaoTrangHeader(data0, nv0, maxDt0, kitInstance, ttInstance);
  container.append(header);

  const tabUpdaters = {};

  const tabsEl = kitInstance.tabs({
    tabs: [
      // TAB 1: ĐỒ ĐỆ
      {
        id: "tab_de_tu",
        title: `Đồ Đệ (${data0.danhSachDeTu.length})`,
        mount(box) {
          box.style.cssText =
            "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

          const topAct = document.createElement("div");
          topAct.style.cssText =
            "display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; gap: 8px;";

          const desc = document.createElement("div");
          desc.style.cssText =
            "font-size: 11.5px; color: var(--muc-nhat); white-space: nowrap;";
          topAct.append(desc);

          const btnChieuMo = kitInstance.button({
            text: "📜 Chiêu Mộ Đồ Đệ",
            kind: "chinh",
            onClick: () => {
              ttInstance.game.modAction("su_do", "tuyen_do", {});
              ttInstance.ui.toast(
                "Đã mở kỳ tuyển đồ! 3 ứng viên xuất hiện bên dưới.",
              );
            },
          });
          btnChieuMo.classList.add("su-do-btn-wrap");
          btnChieuMo.style.cssText += "padding: 3px 8px; font-size: 11px;";
          topAct.append(btnChieuMo);
          box.append(topAct);

          const listUngVien = document.createElement("div");
          listUngVien.style.cssText =
            "display: flex; flex-direction: column; gap: 6px;";
          box.append(listUngVien);

          const listDeTu = document.createElement("div");
          listDeTu.style.cssText =
            "display: flex; flex-direction: column; gap: 6px;";
          box.append(listDeTu);

          tabUpdaters.tab_de_tu = (data, s, nv, maxDt) => {
            desc.textContent = `Đệ tử: ${data.danhSachDeTu.length}/${maxDt}`;
            capNhatUngVien(data.ungVien, listUngVien, ttInstance, kitInstance);
            capNhatDanhSachDeTu(
              data.danhSachDeTu,
              listDeTu,
              ttInstance,
              kitInstance,
            );
          };

          const curS = ttInstance.state();
          const curData = layModData(curS);
          const curNv = curS.run?.nhanVat;
          tabUpdaters.tab_de_tu(
            curData,
            curS,
            curNv,
            sucChuaDeTu(curNv?.canhGioi ?? 0),
          );

          return () => {
            delete tabUpdaters.tab_de_tu;
          };
        },
      },

      // TAB 2: KIẾN THIẾT ĐẠO TRÀNG / ĐỘNG PHỦ
      {
        id: "tab_kien_thiet",
        title: "Kiến Thiết",
        mount(box) {
          box.style.cssText =
            "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

          tabUpdaters.tab_kien_thiet = (data, s, nv) => {
            capNhatKienThiet(data, box, s, nv, ttInstance, kitInstance);
          };

          const curS = ttInstance.state();
          const curData = layModData(curS);
          const curNv = curS.run?.nhanVat;
          tabUpdaters.tab_kien_thiet(curData, curS, curNv);

          return () => {
            delete tabUpdaters.tab_kien_thiet;
          };
        },
      },

      // TAB 3: LUẬN KIẾM TÔNG MÔN
      {
        id: "tab_luan_kiem",
        title: "Luận Kiếm",
        mount(box) {
          box.style.cssText =
            "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

          tabUpdaters.tab_luan_kiem = (data) => {
            capNhatLuanKiem(data, box, ttInstance, kitInstance);
          };

          const curS = ttInstance.state();
          const curData = layModData(curS);
          tabUpdaters.tab_luan_kiem(curData);

          return () => {
            delete tabUpdaters.tab_luan_kiem;
          };
        },
      },

      // TAB 4: LỊCH LUYỆN
      {
        id: "tab_lich_luyen",
        title: "Lịch Luyện",
        mount(box) {
          box.style.cssText =
            "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

          tabUpdaters.tab_lich_luyen = (data, s) => {
            capNhatLichLuyen(
              data.danhSachDeTu,
              box,
              s?.run?.nam ?? 1,
              ttInstance,
              kitInstance,
            );
          };

          const curS = ttInstance.state();
          const curData = layModData(curS);
          tabUpdaters.tab_lich_luyen(curData, curS);

          return () => {
            delete tabUpdaters.tab_lich_luyen;
          };
        },
      },

      // TAB 5: NHẬT KÝ SƯ MÔN
      {
        id: "tab_su_mon",
        title: "Nhật Ký",
        mount(box) {
          box.style.cssText =
            "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-bottom: 24px;";

          tabUpdaters.tab_su_mon = (data) => {
            capNhatNhatKy(data.nhatKy, box);
          };

          const curS = ttInstance.state();
          const curData = layModData(curS);
          tabUpdaters.tab_su_mon(curData);

          return () => {
            delete tabUpdaters.tab_su_mon;
          };
        },
      },

      // TAB 6: TIỀN DUYÊN
      {
        id: "tab_truyen_thua",
        title: "Tiền Duyên",
        mount(box) {
          box.style.cssText =
            "display: flex; flex-direction: column; gap: 10px; margin-top: 6px; font-size: 13px; padding-bottom: 24px;";

          tabUpdaters.tab_truyen_thua = () => {
            capNhatTienDuyen(box);
          };

          tabUpdaters.tab_truyen_thua();

          return () => {
            delete tabUpdaters.tab_truyen_thua;
          };
        },
      },
    ],
  });

  container.append(tabsEl);

  const onStateChange = () => {
    const s = ttInstance.state();
    const data = layModData(s);
    const nv = s.run?.nhanVat;
    const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);

    header._update?.(data, nv, maxDt);

    const tab1Btn = tabsEl.querySelector(".ui-tabs > button:nth-child(1)");
    if (tab1Btn) {
      const expectedTitle = `Đồ Đệ (${data.danhSachDeTu.length})`;
      if (tab1Btn.textContent !== expectedTitle) {
        tab1Btn.textContent = expectedTitle;
      }
    }

    for (const k of Object.keys(tabUpdaters)) {
      try {
        tabUpdaters[k]?.(data, s, nv, maxDt);
      } catch (err) {
        console.error(`[Mod Sư Đồ] Lỗi khi cập nhật tab ${k}:`, err);
      }
    }
  };

  const unsubState = ttInstance.subscribe(onStateChange);
  return () => {
    unsubState();
  };
}

// ==========================================
// ĐĂNG KÝ SLOTS, DOCKS VÀ PANELS
// ==========================================
export function dangKySlotsVaDocks(tt, mod) {
  const kit = tt.ui.kit;

  // LẮNG NGHE KẾT THÚC KIẾP (Di trạch đệ tử)
  if (typeof unsubLifeEndListener === "function") {
    try {
      unsubLifeEndListener();
    } catch (e) {}
    unsubLifeEndListener = null;
  }

  unsubLifeEndListener = tt.on("lifeEnd", () => {
    try {
      const s = tt.state();
      const data = layModData(s);
      const deTuList = data.danhSachDeTu;
      if (deTuList.length > 0) {
        const key = "mod:su_do:tien_duyen";
        const luu = deTuList.map((d) => ({
          ten: d.ten,
          canhGioi: Number(d.canhGioi) || 1,
          tieuCanhGioi: Number(d.tieuCanhGioi) || 0,
          tuChat: d.tuChat,
        }));
        localStorage.setItem(key, JSON.stringify(luu));
        mod.log("Đã lưu truyền thừa đệ tử cho kiếp sau:", luu);
      }
    } catch (err) {
      console.error("[Mod Sư Đồ] Lỗi khi lưu di trạch:", err);
    }
  });

  // 1. CẮM Ô TAB VÀO MÀN HÌNH NHÂN VẬT (CHARACTER TAB SLOT)
  mod.ui.addSlot("characterTab", {
    id: "de_tu_tab",
    title: "Đồ Đệ",
    mount(el) {
      injectMasterStyles();
      el.innerHTML = "";
      const container = document.createElement("div");
      container.className = "su-do-panel su-do-in-char-tab";
      container.style.cssText =
        "padding: 4px 0; width: 100%; box-sizing: border-box;";
      el.append(container);
      return taoSuMonDashboard(container, tt, kit, { isCharacterTab: true });
    },
  });

  // 2. CẮM Ô KHUNG NƠI CHỐN (PLACE INFO SLOT)
  mod.ui.addSlot("placeInfo", {
    id: "su_do_place_slot",
    title: "🏯 Sư Môn Đạo Tràng",
    mount(el) {
      injectMasterStyles();
      el.innerHTML = "";

      const box = document.createElement("div");
      box.style.cssText =
        "display: flex; flex-direction: column; gap: 6px; font-size: 12px; padding: 4px 0;";

      const updatePlaceSlot = () => {
        const s = tt.state();
        const data = layModData(s);
        const nv = s.run?.nhanVat;
        const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);
        const count = data.danhSachDeTu.length;
        const conLaiLichLuyen = data.danhSachDeTu.filter(
          (d) => d.trangThai?.loai === "lich_luyen",
        ).length;
        const choDotPha = data.danhSachDeTu.filter(
          (d) => (Number(d.tuVi) || 0) >= (Number(d.tuViYeuCau) || 1),
        ).length;

        box.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: var(--chu-do);">${data.daoTrangTen}</span>
            <span class="hud-phu">Đồ đệ: ${count}/${maxDt}</span>
          </div>
          <div style="font-size: 11px; color: var(--muc-nhat); line-height: 1.4;">
            ${conLaiLichLuyen > 0 ? `<span>🗺️ ${conLaiLichLuyen} đệ tử đang xuất sơn lịch luyện.<br/></span>` : ""}
            ${choDotPha > 0 ? `<span style="color: #f59e0b;">⚡ ${choDotPha} đệ tử tu vi viên mãn, sẵn sàng phá quan!<br/></span>` : ""}
            ${count === 0 ? "<span>Chưa có đồ đệ môn hạ. Mở kỳ tuyển đồ để thu nạp thiếu niên có linh căn.</span>" : ""}
          </div>
        `;

        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display: flex; gap: 6px; margin-top: 2px;";

        const btnMoSuMon = kit.button({
          text: "👥 Quản Trị Sư Môn",
          kind: "chinh",
          onClick: () => {
            tt.ui.gamePanel("character", true);
            setTimeout(() => {
              const tabBtn = Array.from(
                document.querySelectorAll(
                  ".bnv-tren button, .mod-tab-nv button, button",
                ),
              ).find(
                (b) =>
                  b.textContent &&
                  (b.textContent.includes("Sư Môn") ||
                    b.textContent.includes("Đồ Đệ")),
              );
              if (tabBtn) tabBtn.click();
              else mod.ui.openPanel("dao_trang_panel");
            }, 150);
          },
        });
        btnMoSuMon.style.cssText +=
          "padding: 3px 8px; font-size: 11px; flex: 1;";
        btnRow.append(btnMoSuMon);
        box.append(btnRow);
      };

      updatePlaceSlot();
      el.append(box);
      const unsub = tt.subscribe(updatePlaceSlot);
      return () => {
        unsub();
      };
    },
  });

  // 3. TIỆN ÍCH HUD MINI-DOCK (TRỤ CỘT 5)
  mod.ui.addDock({
    id: "su_do_dock",
    title: "🏛️ Đạo Tràng",
    mount(el) {
      injectMasterStyles();
      el.innerHTML = "";

      const dockBox = document.createElement("div");
      dockBox.className = "su-do-dock-box";

      const updateDock = () => {
        const s = tt.state();
        const data = layModData(s);
        const nv = s?.run?.nhanVat;
        const maxDt = sucChuaDeTu(nv?.canhGioi ?? 0);
        const count = data.danhSachDeTu.length;
        const capTLT = Number(data.daoTrang.kienThiet.tuLinhTran.cap) || 0;
        const capDD = Number(data.daoTrang.kienThiet.duocDien.cap) || 0;
        const capHT = Number(data.daoTrang.kienThiet.hoTongDaiTran?.cap) || 0;

        const hasMaHoa = data.danhSachDeTu.some(
          (d) => d.trangThai?.loai === "ma_hoa",
        );
        const hasXongLichLuyen = data.danhSachDeTu.some(
          (d) =>
            d.trangThai?.loai === "lich_luyen" &&
            (Number(d.trangThai?.namConLai) || 0) <= 0,
        );
        const hasReadyBreakthrough = data.danhSachDeTu.some(
          (d) => (Number(d.tuVi) || 0) >= (Number(d.tuViYeuCau) || 1),
        );

        dockBox.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="color:var(--chu-do); font-size:12px;">${data.daoTrangTen}</b>
            <span class="hud-phu" style="font-size:11px;">${count}/${maxDt}</span>
          </div>
          <div style="font-size:10.5px; color:var(--muc-nhat); display:flex; gap:6px;">
            <span>⚡ Tụ Linh: Lv${capTLT}</span>
            <span>🌾 Dược Điền: Lv${capDD}</span>
            <span>🛡️ Hộ Tông: Lv${capHT}</span>
          </div>
          ${hasMaHoa ? '<div style="color:#ef4444; font-weight:bold; font-size:10.5px;">🔴 Có nghịch đồ ma hóa!</div>' : ""}
          ${hasXongLichLuyen ? '<div style="color:#10b981; font-weight:bold; font-size:10.5px;">📜 Đệ tử lịch luyện đã về!</div>' : ""}
          ${hasReadyBreakthrough ? '<div style="color:#f59e0b; font-weight:bold; font-size:10.5px;">⚡ Có đệ tử chờ đột phá!</div>' : ""}
        `;

        const btnOpen = kit.button({
          text: "🏛️ Mở Đạo Tràng",
          kind: "chinh",
          onClick: () => {
            mod.ui.openPanel("dao_trang_panel");
          },
        });
        btnOpen.style.cssText +=
          "margin-top:2px; padding:2px 6px; font-size:11px; width:100%;";
        dockBox.append(btnOpen);
      };

      updateDock();
      el.append(dockBox);
      const unsub = tt.subscribe(updateDock);
      return () => {
        unsub();
      };
    },
  });

  // 4. BẢNG ĐIỀU KHIỂN CHÍNH: ĐẠO TRÀNG (PANEL)
  mod.ui.addPanel({
    id: "dao_trang_panel",
    title: "🏛️ Đạo Tràng",
    mount(el) {
      injectMasterStyles();
      el.innerHTML = "";
      const container = document.createElement("div");
      container.className = "su-do-panel";
      container.style.cssText = "min-height: 440px; width: 100%;";
      el.append(container);
      return taoSuMonDashboard(container, tt, kit, { isCharacterTab: false });
    },
  });
}
