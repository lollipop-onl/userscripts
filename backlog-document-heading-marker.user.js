// ==UserScript==
// @name            Mark Backlog Document Headings
// @name:ja         Backlog ドキュメントの見出しにマーカーをつける
// @namespace       https://github.com/simochee/userscripts
// @version         2026.07.02.1
// @description     Adds heading-level markers before each heading in Backlog documents to improve their visibility.
// @description:ja  Backlog のドキュメントの各見出しの前に見出しレベルのマーカーをつけて視認性を上げます。
// @license         MIT
// @icon            https://www.google.com/s2/favicons?sz=64&domain=backlog.jp
// @downloadURL     https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/backlog-document-heading-marker.user.js
// @updateURL       https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/backlog-document-heading-marker.user.js
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
	_css("@import \"https://fonts.googleapis.com/css2?family=Pathway+Gothic+One&text=%23&display=swap\";\n\n.doc-container :where(h1, h2, h3, h4, h5, h6) {\n  position: relative;\n}\n\n.doc-container :where(h1, h2, h3, h4, h5, h6):before {\n  color: var(--textColorWeak);\n  font-family: Pathway Gothic One, sans-serif;\n  position: absolute;\n  top: 50%;\n  left: 0;\n  transform: translateX(calc(-100% - 8px)) translateY(-50%);\n}\n\n.main-container:where(.-medium, .-small) :where(h1, h2, h3, h4, h5, h6):before {\n  left: 5px;\n}\n");
	var markers = Array.from({ length: 6 }, (_, i) => i + 1).map((lv) => `
	.doc-container h${lv}::before {
		content: "${"#".repeat(lv)}";
	}
`).join("\n");
	GM_addStyle(markers);
})();
