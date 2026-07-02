import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: {
		"": "Colorize Backlog Dashboard My Issues Rows",
		ja: "ダッシュボードの「自分の課題」の行に色をつける",
	},
	description: {
		"": "Colors each row of the Backlog dashboard's My Issues according to its status.",
		ja: "Backlog のダッシュボードの「自分の課題」の各行を状態に合わせた色にします。",
	},
	icon: "https://www.google.com/s2/favicons?sz=64&domain=backlog.jp",
	version: "2026.07.02.2",
	match: [
		"https://*.backlog.com/*",
		"https://*.backlog.jp/*",
		"https://*.backlogtool.com/*",
	],
	grant: ["GM_addStyle"],
});
