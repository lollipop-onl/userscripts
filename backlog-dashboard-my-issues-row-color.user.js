// ==UserScript==
// @name            Colorize Backlog Dashboard My Issues Rows
// @name:ja         ダッシュボードの「自分の課題」の行に色をつける
// @namespace       https://github.com/simochee/userscripts
// @version         2026.07.02.2
// @description     Colors each row of the Backlog dashboard's My Issues according to its status.
// @description:ja  Backlog のダッシュボードの「自分の課題」の各行を状態に合わせた色にします。
// @license         MIT
// @icon            https://www.google.com/s2/favicons?sz=64&domain=backlog.jp
// @downloadURL     https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/backlog-dashboard-my-issues-row-color.user.js
// @updateURL       https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/backlog-dashboard-my-issues-row-color.user.js
// @match           https://*.backlog.com/*
// @match           https://*.backlog.jp/*
// @match           https://*.backlogtool.com/*
// @grant           GM_addStyle
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
	_css("#issueList tbody tr {\n  background-color: color-mix(in srgb,\n		var(--defaultColorLink) 10%,\n		transparent);\n}\n\n#issueList tbody tr:has(.status--1) {\n  --defaultColorLink: var(--statusColor-1);\n}\n\n#issueList tbody tr:has(.status--2) {\n  --defaultColorLink: var(--statusColor-2);\n}\n\n#issueList tbody tr:has(.status--3) {\n  --defaultColorLink: var(--statusColor-3);\n}\n\n#issueList tbody tr:has(.status--4) {\n  --defaultColorLink: var(--statusColor-4);\n}\n\n#issueList tbody tr:has(.status--custom-1) {\n  --defaultColorLink: var(--commonColorRed);\n}\n\n#issueList tbody tr:has(.status--custom-2) {\n  --defaultColorLink: var(--commonColorOrange);\n}\n\n#issueList tbody tr:has(.status--custom-3) {\n  --defaultColorLink: var(--commonColorPink);\n}\n\n#issueList tbody tr:has(.status--custom-4) {\n  --defaultColorLink: var(--commonColorPurple);\n}\n\n#issueList tbody tr:has(.status--custom-5) {\n  --defaultColorLink: var(--commonColorAcua);\n}\n\n#issueList tbody tr:has(.status--custom-6) {\n  --defaultColorLink: var(--commonColorGreen);\n}\n\n#issueList tbody tr:has(.status--custom-7) {\n  --defaultColorLink: var(--commonColorLime);\n}\n\n#issueList tbody tr:has(.status--custom-8) {\n  --defaultColorLink: var(--commonColorYellow);\n}\n\n#issueList tbody tr:has(.status--custom-9) {\n  --defaultColorLink: var(--commonColorShockingPink);\n}\n\n#issueList tbody tr:has(.status--custom-10) {\n  --defaultColorLink: var(--commonColorBlack);\n}\n");
})();
