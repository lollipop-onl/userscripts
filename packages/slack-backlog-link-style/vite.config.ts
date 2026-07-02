import { defineMonkeyConfig } from "@userscripts/shared/vite";

export default defineMonkeyConfig(import.meta.dirname, {
	name: {
		"": "Style Backlog Links in Slack",
		ja: "Slack 内の Backlog リンクにスタイルをつける",
	},
	description: {
		"": "Adds a Backlog icon and brand color to Backlog links in the Slack web app.",
		ja: "Slack のウェブアプリ内の Backlog リンクに Backlog アイコンとブランドカラーをつけます。",
	},
	icon: "https://www.google.com/s2/favicons?sz=64&domain=slack.com",
	version: "2026.07.02",
	match: ["https://app.slack.com/*"],
	grant: ["GM_addStyle"],
});
