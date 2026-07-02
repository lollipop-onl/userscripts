import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: {
		"": "Lock Body Scroll When Backlog Modal Is Open",
		ja: "モーダルが出ている時に body をスクロールしないようにする",
	},
	description: {
		"": "Prevents the body from scrolling while a modal dialog is open on Backlog.",
		ja: "Backlog でモーダルダイアログが開いている間、body のスクロールを無効にします。",
	},
	icon: "https://www.google.com/s2/favicons?sz=64&domain=backlog.jp",
	version: "2026.07.02",
	match: [
		"https://*.backlog.com/*",
		"https://*.backlog.jp/*",
		"https://*.backlogtool.com/*",
	],
	grant: ["GM_addStyle"],
});
