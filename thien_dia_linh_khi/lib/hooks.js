/** Đăng ký các event được game hỗ trợ. */
export function dangKyHooks(tt, mod, particleSystem, cinematic, options) {
  const unsubscribe = [];
  const listen = (event, handler) => unsubscribe.push(tt.on(event, handler));
  const currentPlace = () => {
    const viTri = tt.state()?.run?.viTri;
    return tt.content?.noiChon?.get?.(viTri) || viTri;
  };
  const updateBiome = () => particleSystem.setBiome(inferBiomeFromPlace(currentPlace()));

  listen("breakthrough", async data => {
    if (!data.success || !options.get("bat_tat_thien_kiep")) return;
    const previousBiome = particleSystem.currentBiome;
    particleSystem.setBiome("thien_kiep");
    try {
      await cinematic.onBreakthrough(data);
    } finally {
      particleSystem.setBiome(previousBiome);
    }
  });

  listen("runStart", updateBiome);
  listen("travel", updateBiome);
  listen("lifeEnd", () => particleSystem.setBiome("default"));
  listen("combatStart", () => {
    if (options.get("bat_tat_linh_khi")) particleSystem.setIntensity("high");
  });
  listen("combatEnd", () => particleSystem.setIntensity("normal"));
  listen("itemUsed", ({ id }) => {
    if (!id || !/linh_dan|kim_dan|nguyen_anh_dan|thien_ky_dan|kiep_hoa_dan/.test(id)) return;
    particleSystem.burstAt(window.innerWidth / 2, window.innerHeight / 2, { count: 24, hue: 45 });
  });
  listen("cultivationGain", () => {
    particleSystem.burstAt(window.innerWidth / 2, window.innerHeight / 2, { count: 16, hue: 135 });
  });

  updateBiome();
  mod.log("[Hooks] Game events registered");
  return () => unsubscribe.forEach(unsub => unsub?.());
}

/** Nhận diện biome từ nơi chốn hiện tại. */
export function inferBiomeFromPlace(place) {
  if (!place) return "default";
  const normalize = value => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const loai = normalize(typeof place === "string" ? place : `${place.loai || ""} ${place.ten || ""} ${place.id || ""}`);
  const phe = normalize(typeof place === "object" ? place.phe : "");

  if (phe.includes("ta")) return "ta_phai";
  if (phe.includes("chinh")) return "chinh_phai";
  if (loai.includes("nui")) return "nui";
  if (loai.includes("bien") || loai.includes("ho") || loai.includes("ha")) return "bien";
  if (loai.includes("rung")) return "rung";
  if (loai.includes("sa mac") || loai.includes("sa_moc") || loai.includes("sa moc")) return "sa_moc";
  if (loai.includes("dong_phu") || loai.includes("bi_canh") || loai.includes("bich_canh") || loai.includes("doanh")) return "bich_canh";
  return "default";
}

/** Chọn kiểu kiếp theo cảnh giới. */
export function getKiepTypeForRealm(realm) {
  if (realm >= 8) return "thien_kiep_toi_thuong";
  if (realm >= 5) return "tam_ma_kiep";
  if (realm >= 4) return "loi_kiep";
  return "hoa_kiep";
}
