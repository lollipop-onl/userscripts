import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: {
		"": "Mark Backlog Document Headings",
		ja: "Backlog ドキュメントの見出しにマーカーをつける",
	},
	description: {
		"": "Adds heading-level markers before each heading in Backlog documents to improve their visibility.",
		ja: "Backlog のドキュメントの各見出しの前に見出しレベルのマーカーをつけて視認性を上げます。",
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
