# Slack Backlog Link Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a userscript that styles Backlog links inside `app.slack.com` with brand color, an inlined Backlog icon, and a hover underline.

**Architecture:** A single new pnpm-workspace package scaffolded from the repo's standard vite-plugin-monkey template. It imports the Backlog SVG as a raw string, encodes it into a `data:` URI (to bypass Slack CSP), and injects one static stylesheet via `GM_addStyle`. No DOM walking — CSS attribute selectors handle links Slack injects at any time.

**Tech Stack:** TypeScript, Vite, vite-plugin-monkey, `GM_addStyle`, `?raw` asset import (typed by `vite/client`).

## Global Constraints

- **catalog only:** every dependency in `package.json` uses `"catalog:"` — never an inline version range.
- **All authored text in English** (code, comments, config) — except the `ja` localized `name`/`description` fields.
- **`monkey()` must be the LAST plugin** — satisfied automatically by `defineMonkeyConfig` from `@userscripts/shared/vite`.
- **Date-based version:** `version` is `YYYY.MM.DD` with optional `.N` same-day suffix. Use `2026.07.02`.
- **`nr check` must exit 0** (Biome lint + format). Tabs for indentation (repo Biome style).
- **No test suite.** Verification = `nr check` clean + `pnpm --filter <name> build` succeeds. Do NOT add Vitest or `nr test`.
- **Use @antfu/ni** (`nr`, `ni`) — but package filtering needs `pnpm --filter <name> build` directly (`nr build --filter` does not work).

---

### Task 1: Scaffold the package files

**Files:**
- Create: `packages/slack-backlog-link-style/package.json`
- Create: `packages/slack-backlog-link-style/tsconfig.json`
- Create: `packages/slack-backlog-link-style/src/icon.svg`

**Interfaces:**
- Consumes: `@userscripts/shared` (workspace package) for tsconfig + vite helper (used in Task 2).
- Produces: package directory `slack-backlog-link-style` whose basename becomes the derived script name; `./icon.svg` importable as raw string.

- [ ] **Step 1: Create `package.json`**

Mirror the sibling package exactly (same deps, all `catalog:`):

```json
{
	"name": "slack-backlog-link-style",
	"version": "0.0.0",
	"private": true,
	"type": "module",
	"scripts": {
		"dev": "vite",
		"build": "vite build"
	},
	"devDependencies": {
		"@userscripts/shared": "workspace:*",
		"vite": "catalog:",
		"vite-plugin-monkey": "catalog:"
	}
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
	"extends": "@userscripts/shared/tsconfig.json",
	"include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 3: Create `src/icon.svg`** (the user-supplied Backlog brand icon, verbatim)

```svg
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><defs><style>.cls-1{fill:#42ce9f;}.cls-2{fill:#fff;}</style></defs><title>Artboard 1 copy 18</title><rect class="cls-1" width="50" height="50" rx="10.2" ry="10.2"/><path class="cls-2" d="M18.76,37h0A2.41,2.41,0,0,1,17,36.29h0c-.71-.72-.72-1.4-.74-2.64,0-.61,0-1.48,0-2.52,0-1.82,0-4.35,0-7.52,0-5.45.06-10.88.06-10.88l4.82,0c0,1.2,0,2.53,0,3.91,5.71.66,10,3.13,11.76,6.9a8.31,8.31,0,0,1-1.28,9C28.24,36.67,23.41,37,18.76,37Zm2.38-15.48c0,4.15,0,8.19,0,10.6,3.61-.2,5.4-.93,6.82-2.63a3.5,3.5,0,0,0,.61-3.88C27.75,23.91,25.41,22.12,21.13,21.52Z"/></svg>
```

- [ ] **Step 4: Install so the workspace picks up the new package**

Run: `ni`
Expected: exit 0; new package linked into the workspace.

- [ ] **Step 5: Commit**

```bash
git add packages/slack-backlog-link-style/package.json packages/slack-backlog-link-style/tsconfig.json packages/slack-backlog-link-style/src/icon.svg pnpm-lock.yaml
git commit -m "chore: scaffold slack-backlog-link-style package"
```

---

### Task 2: Add the vite config

**Files:**
- Create: `packages/slack-backlog-link-style/vite.config.ts`

**Interfaces:**
- Consumes: `defineMonkeyConfig(import.meta.dirname, MonkeyUserScript)` from `@userscripts/shared/vite`. The helper derives `name` from the directory basename, sets `entry: "src/main.ts"`, and injects defaults (namespace, downloadURL, etc.). The second arg is merged last, so fields set here override defaults.
- Produces: a userscript header targeting `https://app.slack.com/*` with `GM_addStyle` granted — this is what `src/main.ts` (Task 3) runs under.

- [ ] **Step 1: Write `vite.config.ts`**

```ts
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
	icon: "https://www.google.com/s2/favicons?sz=64&domain=backlog.jp",
	version: "2026.07.02",
	match: ["https://app.slack.com/*"],
	grant: ["GM_addStyle"],
});
```

- [ ] **Step 2: Commit** (build is verified after `main.ts` exists in Task 3)

```bash
git add packages/slack-backlog-link-style/vite.config.ts
git commit -m "feat: add vite config for slack-backlog-link-style"
```

---

### Task 3: Implement the style injection

**Files:**
- Create: `packages/slack-backlog-link-style/src/main.ts`

**Interfaces:**
- Consumes: `import iconRaw from "./icon.svg?raw"` — resolves to the SVG file's contents as a `string` (typed by `vite/client`, already in shared tsconfig `types`). `GM_addStyle(css: string)` — provided by the userscript runtime because the header grants it.
- Produces: nothing importable; this is the entry point. Side effect only: one `<style>` element injected at document start.

- [ ] **Step 1: Write `src/main.ts`**

```ts
import iconRaw from "./icon.svg?raw";

const iconDataUri = `data:image/svg+xml,${encodeURIComponent(iconRaw)}`;

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
```

- [ ] **Step 2: Lint + format**

Run: `nr check`
Expected: exit 0, no errors. (Biome may reformat; that's fine.)

- [ ] **Step 3: Build the package**

Run: `pnpm --filter slack-backlog-link-style build`
Expected: exit 0; produces `packages/slack-backlog-link-style/dist/slack-backlog-link-style.user.js`.

- [ ] **Step 4: Verify the built output**

Run: `grep -c "app.slack.com" packages/slack-backlog-link-style/dist/*.user.js && grep -c "data:image/svg" packages/slack-backlog-link-style/dist/*.user.js`
Expected: both counts ≥ 1 — the `@match` is present and the SVG was inlined as a `data:` URI (not left as an external asset reference).

- [ ] **Step 5: Commit**

```bash
git add packages/slack-backlog-link-style/src/main.ts
git commit -m "feat: inject Backlog link styles in Slack via GM_addStyle"
```

---

### Task 4: Manual browser verification (human-in-the-loop)

**Files:** none (verification only).

**Interfaces:**
- Consumes: the built userscript from Task 3.

- [ ] **Step 1: Start the dev server**

Run: `pnpm --filter slack-backlog-link-style dev`
Expected: vite prints a vite-plugin-monkey install URL.

- [ ] **Step 2: Install into the userscript manager and open `app.slack.com`**

Open the install URL in a browser with Tampermonkey/Violentmonkey, install, then load `app.slack.com` and view a message/channel containing a Backlog link.

- [ ] **Step 3: Confirm the styling**

Expected: Backlog links show green text (`#00836b`), the Backlog icon before the link, and an underline on hover.

- [ ] **Step 4: If the icon does not render (Slack CSP blocks `data:` backgrounds)**

Fallback, in order:
1. Open DevTools console and check for a CSP violation naming `img-src`/`default-src` and the `data:` URI.
2. If blocked and unfixable, edit `src/main.ts` to drop the `::before` icon rules, keeping only the `color` and `:hover` underline rules. Re-run `nr check`, rebuild, and commit with message `fix: drop icon when blocked by Slack CSP`.

- [ ] **Step 5: Stop the dev server** (Ctrl-C). No commit if styling worked as-is.

---

## Notes

- `dist/` is gitignored on `main`; build output is never committed. The `grep`
  verification in Task 3 inspects the local (untracked) `dist/` only.
- CSS uses substring selectors (`[href*="backlog.com/"]`) because attribute
  selectors have no subdomain wildcard. Unrelated URLs matching these
  substrings are effectively nonexistent, so this is acceptable.
