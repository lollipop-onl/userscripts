// ==UserScript==
// @name         ダッシュボードの「自分の課題」の行に色をつける
// @namespace    https://github.com/simochee/userscripts
// @version      2026.07.02
// @description  ダッシュボードの「自分の課題」の各行を状態に合わせた色にします
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
	function watch(selector, onAdd, options = {}) {
		const cleanups = new WeakMap();
		const live = new Set();
		const root = options.root ?? document.body ?? document.documentElement;
		const runOnAdd = (el) => {
			if (cleanups.has(el)) return;
			let cleanup = null;
			try {
				cleanup = onAdd(el) ?? null;
			} catch (error) {
				console.error("[shared/watch] onAdd threw", error);
				cleanup = null;
			}
			cleanups.set(el, cleanup);
			live.add(el);
		};
		const runCleanup = (el) => {
			if (!cleanups.has(el)) return;
			const cleanup = cleanups.get(el);
			cleanups.delete(el);
			live.delete(el);
			if (cleanup) try {
				cleanup();
			} catch (error) {
				console.error("[shared/watch] cleanup threw", error);
			}
		};
		const handleAdded = (node) => {
			if (!(node instanceof HTMLElement)) return;
			if (node.matches(selector)) runOnAdd(node);
			for (const el of node.querySelectorAll(selector)) if (el instanceof HTMLElement) runOnAdd(el);
		};
		const handleRemoved = (node) => {
			if (!(node instanceof HTMLElement)) return;
			runCleanup(node);
			for (const el of node.querySelectorAll(selector)) if (el instanceof HTMLElement) runCleanup(el);
		};
		const observer = new MutationObserver((records) => {
			for (const record of records) {
				for (const node of record.addedNodes) handleAdded(node);
				for (const node of record.removedNodes) handleRemoved(node);
			}
		});
		observer.observe(root, {
			childList: true,
			subtree: true
		});
		if (root instanceof HTMLElement) handleAdded(root);
		else for (const el of root.querySelectorAll(selector)) if (el instanceof HTMLElement) runOnAdd(el);
		return () => {
			observer.disconnect();
			for (const el of [...live]) runCleanup(el);
		};
	}
	_css("#issueList tbody tr{background-color:color-mix(in srgb, var(--defaultColorLink) 10%, transparent)}#issueList tbody tr:has(.status--1){--defaultColorLink:var(--statusColor-1)}#issueList tbody tr:has(.status--2){--defaultColorLink:var(--statusColor-2)}#issueList tbody tr:has(.status--3){--defaultColorLink:var(--statusColor-3)}#issueList tbody tr:has(.status--4){--defaultColorLink:var(--statusColor-4)}#issueList tbody tr:has(.status--custom-1){--defaultColorLink:var(--commonColorRed)}#issueList tbody tr:has(.status--custom-2){--defaultColorLink:var(--commonColorOrange)}#issueList tbody tr:has(.status--custom-3){--defaultColorLink:var(--commonColorPink)}#issueList tbody tr:has(.status--custom-4){--defaultColorLink:var(--commonColorPurple)}#issueList tbody tr:has(.status--custom-5){--defaultColorLink:var(--commonColorAcua)}#issueList tbody tr:has(.status--custom-6){--defaultColorLink:var(--commonColorGreen)}#issueList tbody tr:has(.status--custom-7){--defaultColorLink:var(--commonColorLime)}#issueList tbody tr:has(.status--custom-8){--defaultColorLink:var(--commonColorYellow)}#issueList tbody tr:has(.status--custom-9){--defaultColorLink:var(--commonColorShockingPink)}#issueList tbody tr:has(.status--custom-10){--defaultColorLink:var(--commonColorBlack)}");
	watch(".dummy-never-matches", (el) => {
		console.log("appeared", el);
		return () => console.log("removed", el);
	});
	console.log("ready.");
})();
