import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: {
		"": "Open Backlog New Issue Modal with N",
		ja: "Backlog で n キーから新しい課題を追加するモーダルを開く",
	},
	description: {
		"": "Press N on Backlog to open the modal for adding a new issue.",
		ja: "Backlog で n キーを押すと新しい課題を追加するモーダルを開きます。",
	},
	icon: "https://www.google.com/s2/favicons?sz=64&domain=backlog.jp",
	version: "2026.07.02",
	match: [
		"https://*.backlog.com/*",
		"https://*.backlog.jp/*",
		"https://*.backlogtool.com/*",
	],
});
