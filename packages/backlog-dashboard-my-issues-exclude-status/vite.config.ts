import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: "ダッシュボードの「自分の課題」で状態を除外する",
	description:
		"ダッシュボードの「自分の課題」で状態が「処理済み」「未対応」の行を非表示にできるオプションを追加します",
	version: "2026.07.02",
	match: [
		"https://*.backlog.com/*",
		"https://*.backlog.jp/*",
		"https://*.backlogtool.com/*",
	],
	grant: ["GM_addStyle"],
});
