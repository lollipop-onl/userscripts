import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: {
		"": "Customize Backlog Dashboard Layout to Feature My Issues",
		ja: "ダッシュボードのレイアウトをカスタマイズして「自分の課題」を大きく表示する",
	},
	description: {
		"": "Rearranges the Backlog dashboard so My Issues occupies the full-height right column and takes visual priority, with projects and pull requests stacked on the left and blog articles hidden.",
		ja: "Backlog のダッシュボードのレイアウトを組み替えて、「自分の課題」を右側に大きく表示し、プロジェクト一覧とプルリクエストを左側にまとめ、ブログ記事は非表示にします。",
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
