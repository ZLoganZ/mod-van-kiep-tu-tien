// lib/update.js - Auto-update checker for mod Thiên Địa Linh Khí

import { MOD_ID, MOD_VERSION } from "./constants.js";

const UPDATE_CHECK_URL = "https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${MOD_ID}/v${LATEST_VERSION}";
const MANIFEST_URL = "https://raw.githubusercontent.com/${GITHUB_REPO}/main/update_manifest.json";

/** Kiểm tra cập nhật từ GitHub Releases */
export async function checkForUpdate(mod, options = {}) {
  const {
    githubRepo = "ZLoganZ/mod-van-kiep-tu-tien", // Update this to actual repo
    checkIntervalHours = 24,
    silent = false,
    onUpdateAvailable = null
  } = options;

  // Throttle checks
  const lastCheck = localStorage.getItem(`tdlk_last_update_check_${MOD_ID}`);
  const now = Date.now();
  if (lastCheck && (now - parseInt(lastCheck)) < checkIntervalHours * 3600 * 1000) {
    return null;
  }

  try {
    // Try to fetch latest release tag
    const releasesUrl = `https://api.github.com/repos/${githubRepo}/releases`;
    const response = await fetch(releasesUrl, {
      headers: { Accept: "application/vnd.github.v3+json" }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const releases = await response.json();
    const modReleases = releases.filter(r =>
      r.tag_name.startsWith(`${MOD_ID}/v`) && !r.draft && !r.prerelease
    );

    if (modReleases.length === 0) return null;

    const latest = modReleases[0];
    const latestVersion = latest.tag_name.replace(`${MOD_ID}/v`, "");
    const currentVersion = MOD_VERSION;

    if (compareVersions(latestVersion, currentVersion) > 0) {
      const updateInfo = {
        currentVersion,
        latestVersion,
        releaseUrl: latest.html_url,
        downloadUrl: latest.assets.find(a => a.name.endsWith(".zip"))?.browser_download_url,
        changelog: latest.body,
        publishedAt: latest.published_at
      };

      localStorage.setItem(`tdlk_last_update_check_${MOD_ID}`, now.toString());

      if (!silent) {
        mod.log(`[Update] New version available: ${latestVersion} (current: ${currentVersion})`);
        mod.ui.toast(`🌌 Mod ${MOD_ID} có bản mới v${latestVersion}!`, { duration: 10000 });
      }

      if (onUpdateAvailable) onUpdateAvailable(updateInfo);
      return updateInfo;
    }

    localStorage.setItem(`tdlk_last_update_check_${MOD_ID}`, now.toString());
    return null;

  } catch (e) {
    mod.log("[Update] Check failed:", e.message);
    return null;
  }
}

/** So sánh version semver đơn giản */
function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

/** Tự động download và apply update (nếu game support) */
export async function autoUpdate(mod, updateInfo) {
  if (!updateInfo.downloadUrl) return false;

  try {
    mod.log("[Update] Downloading:", updateInfo.downloadUrl);
    const response = await fetch(updateInfo.downloadUrl);
    const blob = await response.blob();

    // Trigger game's mod installer if API exists
    if (mod.installModFromBlob) {
      await mod.installModFromBlob(blob, `${MOD_ID}_v${updateInfo.latestVersion}.zip`);
      mod.ui.toast(`Đã cập nhật lên v${updateInfo.latestVersion}, hãy reload game`);
      return true;
    }

    // Fallback: open download page
    window.open(updateInfo.releaseUrl, "_blank");
    return false;

  } catch (e) {
    mod.log("[Update] Auto-update failed:", e);
    return false;
  }
}

/** UI Component cho update check trong panel */
export function createUpdateCheckUI(mod, tt) {
  const kit = tt?.ui?.kit;
  if (!kit) return null;

  const container = document.createElement("div");
  container.style.cssText = "padding: 8px;";

  const checkBtn = kit.button({
    text: "🔍 Kiểm tra cập nhật",
    kind: "nho",
    onClick: async () => {
      checkBtn.disabled = true;
      checkBtn.textContent = "⏳ Đang kiểm tra...";
      const update = await checkForUpdate(mod, { silent: false, githubRepo: "ZLoganZ/mod-van-kiep-tu-tien" });
      checkBtn.disabled = false;
      checkBtn.textContent = "🔍 Kiểm tra cập nhật";

      if (update) {
        const updateBtn = kit.button({
          text: `⬇️ Cập nhật lên v${update.latestVersion}`,
          kind: "nho",
          onClick: () => autoUpdate(mod, update)
        });
        container.appendChild(updateBtn);
      }
    }
  });

  const versionInfo = document.createElement("div");
  versionInfo.style.cssText = "font-size: 11px; color: var(--muc-nhat); margin-top: 8px;";
  versionInfo.textContent = `Phiên bản hiện tại: ${MOD_VERSION}`;

  container.appendChild(checkBtn);
  container.appendChild(versionInfo);

  // Auto check on mount
  setTimeout(() => checkForUpdate(mod, { silent: true }), 1000);

  return container;
}

/** Khởi tạo auto-check định kỳ */
export function startPeriodicUpdateCheck(mod, intervalHours = 24) {
  const check = () => checkForUpdate(mod, { silent: true });
  check(); // Initial
  return setInterval(check, intervalHours * 3600 * 1000);
}