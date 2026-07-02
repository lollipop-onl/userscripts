import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: {
		"": "Exclude Statuses from Backlog Dashboard My Issues",
		ja: "ダッシュボードの「自分の課題」で状態を除外する",
	},
	description: {
		"": "Adds an option to the Backlog dashboard's My Issues to hide rows whose status is Closed or Open.",
		ja: "Backlog のダッシュボードの「自分の課題」で状態が「処理済み」「未対応」の行を非表示にできるオプションを追加します。",
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
