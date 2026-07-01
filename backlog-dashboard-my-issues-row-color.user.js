// ==UserScript==
// @name         ダッシュボードの「自分の課題」の行に色をつける
// @namespace    https://github.com/simochee/userscripts
// @version      2026.07.02
// @description  Backlog のダッシュボードの「自分の課題」の各行を状態に合わせた色にします。
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=backlog.jp
// @downloadURL  https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/backlog-dashboard-my-issues-row-color.user.js
// @updateURL    https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/backlog-dashboard-my-issues-row-color.user.js
// @match        https://*.backlog.com/*
// @match        https://*.backlog.jp/*
// @match        https://*.backlogtool.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
	"use strict";
	var s = new Set();
	var _css = async (t) => {
		if (s.has(t)) return;
		s.add(t);
		((c) => {
			if (typeof GM_addStyle === "function") GM_addStyle(c);
			else (document.head || document.documentElement).appendChild(document.createElement("style")).append(c);
		})(t);
	};
	_css("#issueList tbody tr{background-color:color-mix(in srgb, var(--defaultColorLink) 10%, transparent)}#issueList tbody tr:has(.status--1){--defaultColorLink:var(--statusColor-1)}#issueList tbody tr:has(.status--2){--defaultColorLink:var(--statusColor-2)}#issueList tbody tr:has(.status--3){--defaultColorLink:var(--statusColor-3)}#issueList tbody tr:has(.status--4){--defaultColorLink:var(--statusColor-4)}#issueList tbody tr:has(.status--custom-1){--defaultColorLink:var(--commonColorRed)}#issueList tbody tr:has(.status--custom-2){--defaultColorLink:var(--commonColorOrange)}#issueList tbody tr:has(.status--custom-3){--defaultColorLink:var(--commonColorPink)}#issueList tbody tr:has(.status--custom-4){--defaultColorLink:var(--commonColorPurple)}#issueList tbody tr:has(.status--custom-5){--defaultColorLink:var(--commonColorAcua)}#issueList tbody tr:has(.status--custom-6){--defaultColorLink:var(--commonColorGreen)}#issueList tbody tr:has(.status--custom-7){--defaultColorLink:var(--commonColorLime)}#issueList tbody tr:has(.status--custom-8){--defaultColorLink:var(--commonColorYellow)}#issueList tbody tr:has(.status--custom-9){--defaultColorLink:var(--commonColorShockingPink)}#issueList tbody tr:has(.status--custom-10){--defaultColorLink:var(--commonColorBlack)}");
})();
