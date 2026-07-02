// ==UserScript==
// @name            Exclude Statuses from Backlog Dashboard My Issues
// @name:ja         ダッシュボードの「自分の課題」で状態を除外する
// @namespace       https://github.com/simochee/userscripts
// @version         2026.07.02.1
// @description     Adds an option to the Backlog dashboard's My Issues to hide rows whose status is Closed or Open.
// @description:ja  Backlog のダッシュボードの「自分の課題」で状態が「処理済み」「未対応」の行を非表示にできるオプションを追加します。
// @license         MIT
// @icon            https://www.google.com/s2/favicons?sz=64&domain=backlog.jp
// @downloadURL     https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/backlog-dashboard-my-issues-exclude-status.user.js
// @updateURL       https://raw.githubusercontent.com/lollipop-onl/userscripts/dist/backlog-dashboard-my-issues-exclude-status.user.js
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
	_css("body:has(#row_filter_resolve:checked) #issueList tr:has(.status--3){display:none}body:has(#row_filter_open:checked) #issueList tr:has(.status--1){display:none}#issueListMenu input[name=row_filter]{display:none}#issueListMenu input[name=row_filter]:checked+label{background-color:var(--defaultColorAccent);color:var(--backgroundColorSchemeBase);text-decoration:none}");
	(() => {
		const OPTIONS = [["resolve", "処理済み"], ["open", "未対応"]];
		watch("#issueListMenu", (el) => {
			el.insertAdjacentHTML("beforeend", `
      <dl class="filter-nav">
        <dt class="filter-nav__term">行除外</dt>
        ${OPTIONS.map(([status, name]) => `
          <dd class="filter-nav__item">
            <input
              type="checkbox"
              name="row_filter"
              id="row_filter_${status}"
              value="${status}"
              ${localStorage.getItem("dashboard_row_filter:${status}") === "true" ? "checked" : ""}
              onchange="localStorage.setItem('dashboard_row_filter:${status}', this.checked.toString())"
            >
            <label for="row_filter_${status}" class="filter-nav__link">
              <span class="filter-nav__text">${name}</span>
            </label>
          </dd>
          `).join("")}
      </dl>
      `);
		});
	})();
})();
