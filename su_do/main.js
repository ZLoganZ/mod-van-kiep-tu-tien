// main.js - Mod Sư Đồ Truyền Thừa (Tông Môn & Đạo Tràng)
// Multi-module ES architecture

import { MOD_VERSION } from './lib/constants.js';
import { injectMasterStyles } from './lib/styles.js';
import { dangKyModActions } from './lib/actions.js';
import { dangKyHooks } from './lib/hooks.js';
import { dangKySlotsVaDocks } from './lib/ui.js';

(window.tuTienMods ??= []).push({
  id: 'su_do',
  boot(tt, mod) {
    mod.log(`Mod Sư Đồ Truyền Thừa đang khởi động (Pha boot v${MOD_VERSION})`);
    dangKyModActions(tt, mod);
    dangKyHooks(tt, mod);
  },
  ready(tt, mod) {
    window.__suDoModUi = mod.ui;
    mod.log(`Mod Sư Đồ Truyền Thừa đã sẵn sàng (Pha ready v${MOD_VERSION})`);
    injectMasterStyles();
    dangKySlotsVaDocks(tt, mod);
  },
});
