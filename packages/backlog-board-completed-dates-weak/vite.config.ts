import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: {
		"": "Dim Completed Card Dates on Backlog Board",
		ja: "ボードの処理済み・完了カードの日付を弱いテキスト表示にする",
	},
	description: {
		"": "Renders the due date of cards in the Closed column of the Backlog board with a subdued text color.",
		ja: "Backlog のボードで、処理済み・完了カードの期日を弱いテキスト表示にします。",
	},
	icon: "https://www.google.com/s2/favicons?sz=64&domain=backlog.jp",
	version: "2026.07.02",
	match: [
		"https://*.backlog.com/board/*",
		"https://*.backlog.jp/board/*",
		"https://*.backlogtool.com/board/*",
	],
	grant: ["GM_addStyle"],
});
