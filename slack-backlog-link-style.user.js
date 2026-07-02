// ==UserScript==
// @name            Style Backlog Links in Slack
// @name:ja         Slack 内の Backlog リンクにスタイルをつける
// @namespace       https://github.com/simochee/userscripts
// @version         2026.07.02
// @description     Adds a Backlog icon and brand color to Backlog links in the Slack web app.
// @description:ja  Slack のウェブアプリ内の Backlog リンクに Backlog アイコンとブランドカラーをつけます。
// @license         MIT
// @icon            https://www.google.com/s2/favicons?sz=64&domain=slack.com
// @downloadURL     https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/slack-backlog-link-style.user.js
// @updateURL       https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/slack-backlog-link-style.user.js
// @match           https://app.slack.com/*
// @grant           GM_addStyle
// ==/UserScript==

(function() {
	"use strict";
	var iconDataUri = `data:image/svg+xml,${encodeURIComponent("<svg id=\"Layer_1\" data-name=\"Layer 1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 50 50\"><defs><style>.cls-1{fill:#42ce9f;}.cls-2{fill:#fff;}</style></defs><title>Artboard 1 copy 18</title><rect class=\"cls-1\" width=\"50\" height=\"50\" rx=\"10.2\" ry=\"10.2\"/><path class=\"cls-2\" d=\"M18.76,37h0A2.41,2.41,0,0,1,17,36.29h0c-.71-.72-.72-1.4-.74-2.64,0-.61,0-1.48,0-2.52,0-1.82,0-4.35,0-7.52,0-5.45.06-10.88.06-10.88l4.82,0c0,1.2,0,2.53,0,3.91,5.71.66,10,3.13,11.76,6.9a8.31,8.31,0,0,1-1.28,9C28.24,36.67,23.41,37,18.76,37Zm2.38-15.48c0,4.15,0,8.19,0,10.6,3.61-.2,5.4-.93,6.82-2.63a3.5,3.5,0,0,0,.61-3.88C27.75,23.91,25.41,22.12,21.13,21.52Z\"/></svg>")}`;
	GM_addStyle(`
	a[href*="backlog.jp/"],
	a[href*="backlog.com/"],
	a[href*="backlogtool.com/"] {
		color: #00836b;
		text-decoration: none;
	}
	a[href*="backlog.jp/"]::before,
	a[href*="backlog.com/"]::before,
	a[href*="backlogtool.com/"]::before {
		content: "";
		display: inline-block;
		width: 1em;
		aspect-ratio: 1;
		background: url("${iconDataUri}") no-repeat;
		background-size: contain;
		vertical-align: -10%;
		margin-inline-end: 0.2em;
		border-radius: 16%;
	}
	a[href*="backlog.jp/"]:hover,
	a[href*="backlog.com/"]:hover,
	a[href*="backlogtool.com/"]:hover {
		text-decoration: underline;
	}
`);
})();
