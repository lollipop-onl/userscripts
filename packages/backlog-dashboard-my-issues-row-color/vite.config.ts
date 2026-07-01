import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
  name: "ダッシュボードの「自分の課題」の行に色をつける",
  description:
    "Backlog のダッシュボードの「自分の課題」の各行を状態に合わせた色にします。",
  icon: "https://www.google.com/s2/favicons?sz=64&domain=backlog.jp",
  version: "2026.07.02",
  match: [
    "https://*.backlog.com/*",
    "https://*.backlog.jp/*",
    "https://*.backlogtool.com/*",
  ],
  grant: ["GM_addStyle"],
});
