import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: {
		"": "Reverse Backlog Issue Comment Order",
		ja: "Backlog の課題コメントの順序を反転させる",
	},
	description: {
		"": "Reverses the order of comments on Backlog issue pages so the newest appear at the top.",
		ja: "Backlog の課題ページのコメント一覧を反転させて、新しいコメントが上に表示されるようにします。",
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
