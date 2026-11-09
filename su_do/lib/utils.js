/**
 * Mod Sư Đồ Truyền Thừa (su_do) - Utility Functions
 */

import { CANH_GIOI_TEN, TIEU_CANH_GIOI_TEN, HE_MAP } from "./constants.js";

/**
 * Đồng bộ tiến độ lịch luyện của đệ tử theo mốc năm hiện tại của thế giới
 */
export function dongBoTienDoLichLuyen(dt, namHienTai = 1) {
  if (!dt || dt.trangThai?.loai !== "lich_luyen") return;
  const tt = dt.trangThai;
  const curYear = Number(namHienTai) || 1;

  if (
    tt.namConLai === 0 &&
    tt.namHoanThanh != null &&
    tt.namHoanThanh > curYear
  ) {
    tt.namHoanThanh = curYear;
  }

  if (tt.namHoanThanh == null) {
    const conLaiCu = Math.max(0, Number(tt.namConLai) || 0);
    tt.namBatDau = curYear;
    tt.namHoanThanh = Math.round((curYear + conLaiCu) * 100) / 100;
  }

  const conLai = Math.max(
    0,
    Math.round(((Number(tt.namHoanThanh) || 0) - curYear) * 10) / 10,
  );
  tt.namConLai = conLai;
}

export function dinhDangThoiGianNam(nam) {
  const n = Number(nam);
  if (!Number.isFinite(n)) return "Năm 1 · Tháng 1";
  const namInt = Math.floor(n);
  const frac = n - namInt;
  const thang = Math.min(12, Math.max(1, Math.floor(frac * 12 + 1e-4) + 1));
  return `Năm ${namInt} · Tháng ${thang}`;
}

export function dinhDangCanhGioi(cg, tieu = 0) {
  if (
    typeof window !== "undefined" &&
    window.tuTien?.core?.index?.tenCanhGioi
  ) {
    return window.tuTien.core.index.tenCanhGioi(cg, tieu);
  }
  const c = Number(cg) || 0;
  const t = Number(tieu) || 0;
  if (c <= 0) return "Phàm Nhân";
  const cName = CANH_GIOI_TEN[c] ?? "Hóa Thần";
  const tName = TIEU_CANH_GIOI_TEN[t] ?? "Sơ kỳ";
  return `${cName} ${tName}`;
}

export function tuViYeuCauChoCanhGioi(cg, tieu = 0) {
  const base = Math.max(1, Number(cg) || 1);
  const t = Math.max(0, Number(tieu) || 0);
  return (base * 4 + t + 1) * 12;
}

export function sucChuaDeTu(canhGioiNguoiChoi) {
  const cg = Number(canhGioiNguoiChoi) || 0;
  if (cg <= 1) return 2; // Phàm Nhân / Luyện Khí: 2
  if (cg === 2) return 4; // Trúc Cơ: 4
  if (cg === 3) return 6; // Kết Đan: 6
  if (cg === 4) return 9; // Nguyên Anh: 9
  return 12; // Hóa Thần trở lên: 12
}

export function dinhDangHe(heList) {
  if (!Array.isArray(heList) || heList.length === 0) return "Vô thuộc tính";
  const tenHe = heList.map((h) => HE_MAP[h] ?? h).join(" · ");
  return `Hệ ${tenHe}`;
}

/**
 * Trích xuất và chuẩn hóa an toàn trạng thái mod từ game state
 */
export function layModData(s) {
  const suDo = s?.run?.modData?.su_do;
  return {
    version: Number(suDo?.version) || 2,
    daoTrangTen:
      typeof suDo?.daoTrangTen === "string" && suDo.daoTrangTen.trim()
        ? suDo.daoTrangTen
        : "Thanh Khê Đạo Tràng",
    danhSachDeTu: Array.isArray(suDo?.danhSachDeTu) ? suDo.danhSachDeTu : [],
    ungVien: Array.isArray(suDo?.ungVien) ? suDo.ungVien : [],
    nhatKy: Array.isArray(suDo?.nhatKy) ? suDo.nhatKy : [],
    daoTrang: {
      kienThiet: {
        tuLinhTran: {
          cap: Number(suDo?.daoTrang?.kienThiet?.tuLinhTran?.cap) || 0,
        },
        duocDien: {
          cap: Number(suDo?.daoTrang?.kienThiet?.duocDien?.cap) || 0,
          duocDongId: suDo?.daoTrang?.kienThiet?.duocDien?.duocDongId ?? null,
          tienDo: Number(suDo?.daoTrang?.kienThiet?.duocDien?.tienDo) || 0,
        },
        luyenDanPhong: {
          cap: Number(suDo?.daoTrang?.kienThiet?.luyenDanPhong?.cap) || 0,
          danDongId:
            suDo?.daoTrang?.kienThiet?.luyenDanPhong?.danDongId ?? null,
          tienDo: Number(suDo?.daoTrang?.kienThiet?.luyenDanPhong?.tienDo) || 0,
        },
        hoTongDaiTran: {
          cap: Number(suDo?.daoTrang?.kienThiet?.hoTongDaiTran?.cap) || 0,
          tranDongId:
            suDo?.daoTrang?.kienThiet?.hoTongDaiTran?.tranDongId ?? null,
        },
      },
      chienBaoMoiNhat: suDo?.daoTrang?.chienBaoMoiNhat ?? null,
    },
  };
}

/**
 * Trả về chữ ký trạng thái cấu trúc để phát hiện khi nào card đệ tử cần rebuild nút bấm
 */
export function layChuKyCauTrucDeTu(dt) {
  const cg = Number(dt?.canhGioi) || 1;
  const tcg = Number(dt?.tieuCanhGioi) || 0;
  const laDinhPhong = cg >= 5 && tcg >= 3;
  const tuViReq = Math.max(1, Number(dt?.tuViYeuCau) || 1);
  const tuViCur = Math.max(0, Number(dt?.tuVi) || 0);
  const sanSang = tuViCur >= tuViReq && !laDinhPhong;
  const laDaiCanhGioi = tcg >= 3;
  const loai = dt?.trangThai?.loai ?? "nha_roi";
  const nv = dt?.trangThai?.nhiemVu ?? "";
  const namConLai = Math.max(
    0,
    Math.round((Number(dt?.trangThai?.namConLai) || 0) * 10) / 10,
  );
  const vaiVe = dt?.vaiVe ?? "de_tu";
  const cpId = dt?.congPhap?.id ?? "";
  const pbId = dt?.phapBao?.id ?? "";
  return `${vaiVe}_${cg}_${tcg}_${loai}_${nv}_${namConLai}_${sanSang ? 1 : 0}_${laDaiCanhGioi ? 1 : 0}_${cpId}_${pbId}`;
}

export function taoDeTuNgauNhien(seed = 1, canhGioiNguoiChoi = 1) {
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const HO_POOL = [
    "Lâm",
    "Diệp",
    "Tiêu",
    "Sở",
    "Vương",
    "Lý",
    "Bạch",
    "Vũ",
    "Trần",
    "Hoàng",
    "Dương",
    "Phan",
    "Hàn",
    "Cố",
    "Thẩm",
  ];
  const DEM_NAM = [
    "Thanh",
    "Văn",
    "Nhật",
    "Đình",
    "Bảo",
    "Minh",
    "Thiên",
    "Tuấn",
    "Hải",
    "Trọng",
    "Bá",
    "Vĩnh",
    "Quốc",
  ];
  const TEN_NAM = [
    "Phong",
    "Hạo",
    "Vũ",
    "Hiên",
    "Phàm",
    "Dương",
    "Nham",
    "Kình",
    "Vân",
    "Lôi",
    "Long",
    "Châu",
    "Đạt",
    "Kiệt",
    "Bân",
    "Bình",
  ];
  const DEM_NU = [
    "Thanh",
    "Như",
    "Ngọc",
    "Tuyết",
    "Bích",
    "Tiểu",
    "Diệu",
    "Mộng",
    "Tố",
    "Linh",
    "Thục",
    "Nhã",
  ];
  const TEN_NU = [
    "Vy",
    "Dao",
    "Nguyệt",
    "Sương",
    "Huyên",
    "Nhi",
    "Hân",
    "Chi",
    "Tâm",
    "Liên",
    "Yến",
    "Trinh",
    "Uyên",
    "Thư",
    "Châu",
  ];

  const gioiTinh = rng() > 0.5 ? "nam" : "nu";
  const ho = HO_POOL[Math.floor(rng() * HO_POOL.length)];
  const dem =
    gioiTinh === "nam"
      ? DEM_NAM[Math.floor(rng() * DEM_NAM.length)]
      : DEM_NU[Math.floor(rng() * DEM_NU.length)];
  const tenGoc =
    gioiTinh === "nam"
      ? TEN_NAM[Math.floor(rng() * TEN_NAM.length)]
      : TEN_NU[Math.floor(rng() * TEN_NU.length)];
  const ten = `${ho} ${dem} ${tenGoc}`;

  const HE_POOL = ["kim", "moc", "thuy", "hoa", "tho", "loi", "phong", "bang"];
  const heCount = rng() > 0.7 ? 2 : 1;
  const he = [];
  for (let i = 0; i < heCount; i++) {
    const h = HE_POOL[Math.floor(rng() * HE_POOL.length)];
    if (!he.includes(h)) he.push(h);
  }

  const TU_CHAT_LIST = [
    { id: "pho_thong", tile: 0.5 },
    { id: "kha", tile: 0.3 },
    { id: "thien_tai", tile: 0.15 },
    { id: "yeu_nghiet", tile: 0.05 },
  ];
  const rTc = rng();
  let tuChat = TU_CHAT_LIST[0];
  let acc = 0;
  for (const t of TU_CHAT_LIST) {
    acc += t.tile;
    if (rTc <= acc) {
      tuChat = t;
      break;
    }
  }

  const TINH_CACH_LIST = [
    { id: "hieu_thuan", tile: 0.35 },
    { id: "kien_dinh", tile: 0.35 },
    { id: "kieu_ngao", tile: 0.15 },
    { id: "can_man", tile: 0.15 },
  ];
  const rTch = rng();
  let tinhCach = TINH_CACH_LIST[0];
  let accTch = 0;
  for (const tc of TINH_CACH_LIST) {
    accTch += tc.tile;
    if (rTch <= accTch) {
      tinhCach = tc;
      break;
    }
  }

  const tieuCanhGioi = rng() > 0.6 ? 1 : 0;
  const canhGioi = 1;
  const tuoi = 14 + Math.floor(rng() * 6);

  return {
    id: `dt_${Date.now()}_${Math.floor(rng() * 100000)}_${Math.floor((Number(seed) || 0) % 1000)}`,
    ten,
    gioiTinh,
    tuoi,
    he,
    tuChat: tuChat.id,
    tinhCach: tinhCach.id,
    khuynhHuong: "chinh_dao",
    canhGioi,
    tieuCanhGioi,
    tuVi: 0,
    tuViYeuCau: tuViYeuCauChoCanhGioi(canhGioi, tieuCanhGioi),
    haoCam: 60,
    doKy: 0,
    vaiVe: "de_tu",
    congPhap: null,
    phapBao: null,
    trangThai: {
      loai: "nha_roi",
      nhiemVu: null,
      soNam: 0,
      namBatDau: null,
      namHoanThanh: null,
      namConLai: 0,
      daThongBao: false,
    },
  };
}

export function dongBoNpcDeTu(ctx, dt, data) {
  if (!ctx?.run || !dt) return;
  ctx.run.npc ??= {};
  const isDead = dt.trangThai?.loai === "da_khuat" || dt.song === false;
  const isMaHoa = dt.trangThai?.loai === "ma_hoa";
  const isDaiSu = dt.vaiVe === "dai_su_huynh";

  let danhPhan = "quen_biet";
  if (isMaHoa) {
    danhPhan = "phan_boi";
  } else if (isDaiSu || (Number(dt.haoCam) || 0) >= 60) {
    danhPhan = "tri_ky";
  } else if ((Number(dt.haoCam) || 0) >= 30) {
    danhPhan = "bang_huu";
  }

  const goc = isDaiSu
    ? dt.gioiTinh === "nu"
      ? "npc.su_do_dai_su_ty"
      : "npc.su_do_dai_su_huynh"
    : "npc.su_do_de_tu";

  const existing = ctx.run.npc[dt.id] ?? {};
  const currentYear = Math.floor(Number(ctx.run.nam) || 1);
  const playerRealm = Number(ctx.run.nhanVat?.canhGioi) || 1;
  const dtRealm = Number(dt.canhGioi) || 1;
  // Sư tôn luôn thấu suốt cảnh giới đệ tử chân truyền của mình
  const perceivedRealm = Math.min(dtRealm, Math.max(playerRealm, dtRealm));

  ctx.run.npc[dt.id] = {
    ...existing,
    ten: dt.ten,
    goc,
    gioiTinh: dt.gioiTinh ?? "nam",
    namSinh:
      existing.namSinh ?? Math.floor(currentYear - (Number(dt.tuoi) || 16)),
    canhGioi: dtRealm,
    tieuCanhGioi: Number(dt.tieuCanhGioi) || 0,
    tuVi: Number(dt.tuVi) || 0,
    phamChat:
      dt.tuChat === "yeu_nghiet" ? 3 : dt.tuChat === "thien_tai" ? 2 : 1,
    haoCam: Number(dt.haoCam) || 0,
    danhPhan,
    namDanhPhan: existing.namDanhPhan ?? currentYear,
    tamTinh:
      dt.tinhCach === "hieu_thuan"
        ? { trong_nghia: 4 }
        : dt.tinhCach === "kieu_ngao"
          ? { trong_danh: 3 }
          : { trong_nghia: 2 },
    theLuc:
      ctx.run.nhanVat?.theLuc ?? (data?.daoTrangTen || "Thanh Khê Đạo Tràng"),
    noiGap: existing.noiGap ?? ctx.run.viTri ?? "thanh_khe",
    que: existing.que ?? ctx.run.viTri ?? "thanh_khe",
    namGap: existing.namGap ?? currentYear,
    namGapCuoi: currentYear,
    namCapNhat: currentYear,
    seen: {
      year: currentYear,
      slot: existing.noiGap ?? ctx.run.viTri ?? "thanh_khe",
      canhGioi: perceivedRealm,
      tieuCanhGioi: Number(dt.tieuCanhGioi) || 0,
      via: "gap",
    },
    song: !isDead,
    namMat: isDead ? currentYear : undefined,
  };
}

export function layTrangThaiMod(h) {
  const data = h.data() ?? {};
  data.version = Number(data.version) || 2;
  data.daoTrangTen =
    typeof data.daoTrangTen === "string" && data.daoTrangTen.trim()
      ? data.daoTrangTen
      : "Thanh Khê Đạo Tràng";
  data.danhSachDeTu = Array.isArray(data.danhSachDeTu) ? data.danhSachDeTu : [];
  data.ungVien = Array.isArray(data.ungVien) ? data.ungVien : [];
  data.nhatKy = Array.isArray(data.nhatKy) ? data.nhatKy : [];
  data.daoTrang ??= {};
  data.daoTrang.kienThiet ??= {};
  data.daoTrang.kienThiet.tuLinhTran ??= { cap: 0 };
  data.daoTrang.kienThiet.duocDien ??= { cap: 0, duocDongId: null, tienDo: 0 };
  data.daoTrang.kienThiet.luyenDanPhong ??= {
    cap: 0,
    danDongId: null,
    tienDo: 0,
  };
  data.daoTrang.kienThiet.hoTongDaiTran ??= { cap: 0, tranDongId: null };
  data.daoTrang.chienBaoMoiNhat ??= null;
  return data;
}

export function ghiNhatKy(data, text, nam = 1) {
  data.nhatKy ??= [];
  data.nhatKy.unshift({ nam: Number(nam) || 1, text, time: Date.now() });
  if (data.nhatKy.length > 60) data.nhatKy.pop();
}
