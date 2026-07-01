# Shared DOM Watch Utility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared workspace package providing a `watch(selector, onAdd)` utility that reacts to DOM elements appearing/disappearing via a single MutationObserver, robust against large element counts and non-HTML (SVG/text) nodes.

**Architecture:** A new non-userscript workspace package `packages/shared` exposes its TypeScript source directly (no build step). One `MutationObserver` observes `childList + subtree`; added/removed HTMLElements are matched against a CSS selector (self + descendants), tracked in a `WeakMap<HTMLElement, Cleanup | null>` for idempotency and cleanup, with an initial synchronous scan. Consumers bundle it via `vite-plugin-monkey`.

**Tech Stack:** TypeScript (ESNext, strict), pnpm workspace, Biome, vite-plugin-monkey (consumer side only).

## Global Constraints

- **catalog mandatory.** Any dependency version lives in `pnpm-workspace.yaml` under `catalog:`; `package.json` references deps as `"catalog:"`. Never inline a version range. (This package needs no runtime/dev deps, so its `package.json` omits dependency blocks.)
- **All authored text in English** (code, comments, config).
- **`nr check` (Biome `check --write .`) must exit 0.** Run it before every commit.
- **No test suite.** Vitest was removed; do NOT add `nr test` or a test runner dependency. Verification is done with throwaway scripts run under Node's built-in `--experimental-*` is NOT needed — use a self-contained jsdom-free simulation (see Task 2) executed from the scratchpad and NOT committed.
- **Shared package has NO `build` script** so `pnpm -r build` skips it.
- Use `@antfu/ni` commands (`ni`, `nr`), never npm/pnpm/yarn/npx directly, except `pnpm --filter` for single-package ops as documented in CLAUDE.md.

---

### Task 1: Scaffold `packages/shared`

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: workspace package named `shared` with entry `./src/index.ts`; `import { watch } from "shared"` resolves once Task 3 lands. `src/index.ts` initially re-exports from `./watch`.

- [ ] **Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Note: no `scripts`, no `dependencies`/`devDependencies` — nothing to install or build.

- [ ] **Step 2: Create `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
```

- [ ] **Step 3: Create placeholder `packages/shared/src/index.ts`**

```ts
export { watch } from "./watch";
```

This will fail to resolve until Task 3 creates `watch.ts` — that is expected; do not run type-check yet.

- [ ] **Step 4: Install so pnpm links the workspace package**

Run: `ni`
Expected: completes successfully; `packages/shared` recognized as a workspace package (no error about missing build; `pnpm -r build` would skip it since it has no `build` script).

- [ ] **Step 5: Commit**

```bash
git add packages/shared/package.json packages/shared/tsconfig.json packages/shared/src/index.ts pnpm-lock.yaml
git commit -m "feat(shared): scaffold shared workspace package"
```

---

### Task 2: Implement `watch` with verification harness

**Files:**
- Create: `packages/shared/src/watch.ts`
- Verify (throwaway, NOT committed): `<scratchpad>/watch-verify.mjs`

**Interfaces:**
- Consumes: nothing (uses DOM globals `MutationObserver`, `HTMLElement`, `document`).
- Produces:
  - `type Cleanup = () => void;`
  - `type OnAdd = (el: HTMLElement) => Cleanup | void;`
  - `function watch(selector: string, onAdd: OnAdd, options?: { root?: ParentNode }): () => void;`
  - Default root = `document.body ?? document.documentElement` resolved at call time.
  - `index.ts` re-exports `watch` (already wired in Task 1).

- [ ] **Step 1: Write the verification harness first (the failing test)**

Create `<scratchpad>/watch-verify.mjs`. It stubs a minimal DOM + MutationObserver so it runs under plain Node (no jsdom dependency), imports the compiled logic by copying the source path via a tiny transpile-free approach: since `watch.ts` is TS, the harness instead re-implements nothing — it dynamically imports a JS mirror. To keep it dependency-free, the harness inlines a fake environment and `await import()`s the source through `tsx` is NOT available; instead compile on the fly:

Run the source through the TypeScript that ships with the repo:

```js
// <scratchpad>/watch-verify.mjs
import { readFileSync } from "node:fs";
import ts from "typescript"; // resolvable: typescript is a root devDependency (catalog)
import { pathToFileURL } from "node:url";

// --- minimal DOM fakes ---
let observers = [];
class FakeMutationObserver {
  constructor(cb) { this.cb = cb; observers.push(this); }
  observe() {}
  disconnect() { observers = observers.filter((o) => o !== this); }
}
function flush(records) { for (const o of observers) o.cb(records, o); }

class FakeElement {
  constructor(tag) {
    this.tag = tag; this.children = []; this.className = "";
    this.isHTML = true; // toggle for SVG/text simulation
  }
  matches(sel) { return matchNode(this, sel); }
  querySelectorAll(sel) {
    const out = [];
    const walk = (n) => { for (const c of n.children) { if (c.matches?.(sel)) out.push(c); walk(c); } };
    walk(this);
    return out;
  }
  append(child) { this.children.push(child); }
}
// class-selector matcher good enough for the harness: ".foo"
function matchNode(node, sel) {
  if (!node.isHTML) return false;
  if (sel.startsWith(".")) return node.className.split(/\s+/).includes(sel.slice(1));
  return node.tag === sel;
}

// HTMLElement guard: our impl uses `instanceof HTMLElement`. Alias it to FakeElement
// but only nodes with isHTML===true should pass; emulate by making SVG a different class.
class FakeSVG extends FakeElement { constructor(t){ super(t); this.isHTML = false; } }
globalThis.HTMLElement = FakeElement;
globalThis.MutationObserver = FakeMutationObserver;

const root = new FakeElement("root");
globalThis.document = { body: root, documentElement: root };

// --- transpile watch.ts and import it ---
const srcPath = new URL("../packages/shared/src/watch.ts", import.meta.url); // ADJUST relative path
const source = readFileSync(srcPath, "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
}).outputText;
const dataUrl = "data:text/javascript;base64," + Buffer.from(js).toString("base64");
const { watch } = await import(dataUrl);

// --- assertions ---
let ok = true;
const assert = (cond, msg) => { if (!cond) { ok = false; console.error("FAIL:", msg); } else console.log("PASS:", msg); };

// A) initial sync scan: pre-existing match fires onAdd
const pre = new FakeElement("div"); pre.className = "target"; root.append(pre);
const events = [];
const stop = watch(".target", (el) => { events.push(["add", el]); return () => events.push(["remove", el]); });
assert(events.length === 1 && events[0][0] === "add" && events[0][1] === pre, "initial scan fires onAdd for existing match");

// B) added node fires once
const a = new FakeElement("div"); a.className = "target"; root.append(a);
flush([{ addedNodes: [a], removedNodes: [] }]);
assert(events.some((e) => e[0] === "add" && e[1] === a), "added node fires onAdd");

// C) duplicate mutation does NOT double-fire
const before = events.filter((e) => e[0] === "add" && e[1] === a).length;
flush([{ addedNodes: [a], removedNodes: [] }]);
const after = events.filter((e) => e[0] === "add" && e[1] === a).length;
assert(before === 1 && after === 1, "duplicate mutation does not double-fire onAdd");

// D) descendant match via subtree scan
const wrap = new FakeElement("section");
const deep = new FakeElement("div"); deep.className = "target"; wrap.append(deep);
flush([{ addedNodes: [wrap], removedNodes: [] }]);
assert(events.some((e) => e[0] === "add" && e[1] === deep), "descendant match detected via subtree scan");

// E) SVG / non-HTML node is ignored (no throw, no add)
const svg = new FakeSVG("svg"); svg.className = "target";
flush([{ addedNodes: [svg], removedNodes: [] }]);
assert(!events.some((e) => e[0] === "add" && e[1] === svg), "non-HTML node ignored");

// F) removal runs cleanup for node and tracked descendants
flush([{ addedNodes: [], removedNodes: [wrap] }]);
assert(events.some((e) => e[0] === "remove" && e[1] === deep), "removal runs cleanup for tracked descendant");
flush([{ addedNodes: [], removedNodes: [a] }]);
assert(events.some((e) => e[0] === "remove" && e[1] === a), "removal runs cleanup for tracked node");

// G) onAdd throwing does not abort other elements
const boom = new FakeElement("div"); boom.className = "target";
const good = new FakeElement("div"); good.className = "target";
let goodAdded = false;
const stop2 = watch(".target", (el) => {
  if (el === boom) throw new Error("boom");
  if (el === good) goodAdded = true;
});
flush([{ addedNodes: [boom, good], removedNodes: [] }]);
assert(goodAdded, "throwing onAdd does not prevent sibling processing");

// H) stop() disconnects and runs pending cleanups
const cleaned = [];
const live = new FakeElement("div"); live.className = "t2"; root.append(live);
const stop3 = watch(".t2", (el) => () => cleaned.push(el));
stop3();
assert(cleaned.includes(live), "stop() runs pending cleanups");

stop(); stop2();
console.log(ok ? "\nALL PASS" : "\nSOME FAILED");
process.exit(ok ? 0 : 1);
```

Adjust the `srcPath` relative path and the `<scratchpad>` location to the actual session scratchpad directory.

- [ ] **Step 2: Run harness to verify it fails**

Run: `node <scratchpad>/watch-verify.mjs`
Expected: FAIL — `watch.ts` does not exist yet, import throws (`ENOENT` reading the source or module has no `watch` export).

- [ ] **Step 3: Implement `packages/shared/src/watch.ts`**

```ts
export type Cleanup = () => void;
export type OnAdd = (el: HTMLElement) => Cleanup | void;

export interface WatchOptions {
  /** Root to observe. Defaults to document.body ?? document.documentElement. */
  root?: ParentNode;
}

/**
 * Watch for elements matching `selector` appearing anywhere under `root`.
 * `onAdd` fires once per element when it (or an inserted ancestor) enters the
 * DOM. If `onAdd` returns a function, it runs when that element is later
 * removed. Returns a stop function that disconnects the observer and runs all
 * pending cleanups.
 *
 * Only HTMLElements are considered — text nodes, comments, and SVG elements are
 * ignored, so mixed/non-HTML content never breaks matching. A single
 * MutationObserver on childList+subtree drives everything; a WeakMap keeps
 * per-element cleanups and makes repeated mutations idempotent.
 */
export function watch(
  selector: string,
  onAdd: OnAdd,
  options: WatchOptions = {},
): () => void {
  const tracked = new WeakMap<HTMLElement, Cleanup | null>();
  const root =
    options.root ?? document.body ?? document.documentElement;

  const runOnAdd = (el: HTMLElement): void => {
    if (tracked.has(el)) return;
    let cleanup: Cleanup | null = null;
    try {
      cleanup = onAdd(el) ?? null;
    } catch (error) {
      console.error("[shared/watch] onAdd threw", error);
      cleanup = null;
    }
    tracked.set(el, cleanup);
  };

  const runCleanup = (el: HTMLElement): void => {
    if (!tracked.has(el)) return;
    const cleanup = tracked.get(el);
    tracked.delete(el);
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        console.error("[shared/watch] cleanup threw", error);
      }
    }
  };

  const handleAdded = (node: Node): void => {
    if (!(node instanceof HTMLElement)) return;
    if (node.matches(selector)) runOnAdd(node);
    for (const el of node.querySelectorAll(selector)) {
      if (el instanceof HTMLElement) runOnAdd(el);
    }
  };

  const handleRemoved = (node: Node): void => {
    if (!(node instanceof HTMLElement)) return;
    if (tracked.has(node)) runCleanup(node);
    for (const el of node.querySelectorAll(selector)) {
      if (el instanceof HTMLElement) runCleanup(el);
    }
  };

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) handleAdded(node);
      for (const node of record.removedNodes) handleRemoved(node);
    }
  });

  observer.observe(root, { childList: true, subtree: true });

  // Initial synchronous scan of already-present matches.
  handleAdded(root instanceof HTMLElement ? root : (root as Element).ownerDocument!.documentElement);
  if (!(root instanceof HTMLElement)) {
    for (const el of root.querySelectorAll(selector)) {
      if (el instanceof HTMLElement) runOnAdd(el);
    }
  }

  return () => {
    observer.disconnect();
    // Run any pending cleanups. We cannot enumerate a WeakMap, so re-scan the
    // root for currently-matching elements and clean those we tracked.
    for (const el of root.querySelectorAll(selector)) {
      if (el instanceof HTMLElement) runCleanup(el);
    }
  };
}
```

Note on the initial scan: `handleAdded` already handles `root` itself matching plus descendants when `root` is an `HTMLElement`. When `root` is a non-HTMLElement `ParentNode` (rare — e.g. a document fragment), the extra `querySelectorAll` loop covers descendants. Keep both paths.

- [ ] **Step 4: Run harness to verify it passes**

Run: `node <scratchpad>/watch-verify.mjs`
Expected: all `PASS:` lines, final `ALL PASS`, exit code 0.

If any assertion fails, fix `watch.ts` (not the harness, unless the harness fake is wrong) and re-run.

- [ ] **Step 5: Type-check and lint**

Run: `pnpm --filter shared exec tsc --noEmit` (verifies strict types resolve) then `nr check`
Expected: `tsc` prints nothing / exits 0; Biome exits 0 (auto-formats if needed).

- [ ] **Step 6: Commit (harness NOT included)**

```bash
git add packages/shared/src/watch.ts packages/shared/src/index.ts
git commit -m "feat(shared): implement watch() DOM appearance/removal utility"
```

Do NOT `git add` the scratchpad harness — it is throwaway verification.

---

### Task 3: Wire one consumer as an integration smoke test

**Files:**
- Modify: `packages/backlog-dashboard-my-issues-row-color/package.json` (add `shared` dep)
- Modify: `packages/backlog-dashboard-my-issues-row-color/src/main.ts:1-3`

**Interfaces:**
- Consumes: `watch` from `shared` (Task 2).
- Produces: proof that `import { watch } from "shared"` resolves and bundles through vite-plugin-monkey.

- [ ] **Step 1: Add the workspace dependency**

Edit `packages/backlog-dashboard-my-issues-row-color/package.json`, add to `devDependencies`:

```json
    "shared": "workspace:*"
```

(Alongside the existing `vite` / `vite-plugin-monkey` entries. `workspace:*` is a protocol, not a version range, so it does not violate the catalog rule.)

- [ ] **Step 2: Install to link the dependency**

Run: `ni`
Expected: succeeds; `node_modules/shared` symlinked in the consumer.

- [ ] **Step 3: Use `watch` in `main.ts`**

Replace `packages/backlog-dashboard-my-issues-row-color/src/main.ts` contents:

```ts
import { watch } from "shared";
import "./style.css";

watch(".dummy-never-matches", (el) => {
  console.log("appeared", el);
  return () => console.log("removed", el);
});

console.log("ready.");
```

(Selector is intentionally inert — this task only proves resolution/bundling, not behavior on the real page.)

- [ ] **Step 4: Build the consumer to confirm bundling**

Run: `pnpm --filter backlog-dashboard-my-issues-row-color build`
Expected: build succeeds; produces `dist/backlog-dashboard-my-issues-row-color.user.js` containing the inlined `watch` implementation (no unresolved import of `shared`).

- [ ] **Step 5: Lint**

Run: `nr check`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add packages/backlog-dashboard-my-issues-row-color/package.json packages/backlog-dashboard-my-issues-row-color/src/main.ts pnpm-lock.yaml
git commit -m "feat: consume shared watch() in row-color userscript"
```

---

## Self-Review

**Spec coverage:**
- Shared package placement, no-build, workspace:* consumption → Task 1, Task 3. ✓
- `watch(selector, onAdd)` useEffect-style API, stop fn → Task 2 Step 3. ✓
- Single MutationObserver, childList+subtree only → Task 2 Step 3. ✓
- HTMLElement-only guard (SVG/text ignored) → Task 2 Step 3 (`handleAdded`/`handleRemoved`), harness assertion E. ✓
- Subtree scan (self + querySelectorAll) → Task 2 Step 3, harness D. ✓
- WeakMap idempotency + cleanup tracking → Task 2 Step 3, harness C/F. ✓
- Removed-subtree cleanup → `handleRemoved` querySelectorAll, harness F. ✓
- Initial synchronous scan → Task 2 Step 3 + harness A. ✓
- try/catch robustness → `runOnAdd`/`runCleanup`, harness G. ✓
- No batching (YAGNI) → not implemented, by design. ✓
- Non-goals (attributes/characterData/predicate) → not implemented. ✓

**Placeholder scan:** No TBD/TODO. The one adjustable value is the `<scratchpad>` path and `srcPath` relative path in the harness (Task 2 Step 1), explicitly flagged as "adjust to actual session scratchpad." Not a spec placeholder — it is environment-specific by nature.

**Type consistency:** `Cleanup`, `OnAdd`, `WatchOptions`, `watch` signature consistent across index re-export (Task 1) and implementation (Task 2). `runOnAdd`/`runCleanup`/`handleAdded`/`handleRemoved` names consistent within Task 2. Consumer import matches exported name (Task 3). ✓

**Note on removal-cleanup edge:** `handleRemoved`/stop's re-scan relies on `querySelectorAll` still matching removed elements. Within a MutationObserver callback the removed subtree is detached but still structurally intact and queryable, so `querySelectorAll` over the removed node works. For `stop()`, elements still in the DOM are re-scanned; already-removed elements were cleaned at removal time. This is acceptable — `stop()` cleaning currently-attached matches covers the live set.
