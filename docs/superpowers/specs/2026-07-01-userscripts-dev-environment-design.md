# Userscripts Development Environment — Design

Date: 2026-07-01

## Goal

Set up a development environment for authoring userscripts with
`vite-plugin-monkey` and Biome, distributed via Greasy Fork. It must support
multiple userscripts and provide a scaffold to create new ones. All authored
text (code comments, metadata, README, prompts, docs) is written in English.

## Toolchain

- **Package manager:** pnpm 11.x, using workspaces.
  - Node.js pinned to 26 via `devEngines.runtime` in root `package.json`.
  - **`catalog:` is mandatory** — every dependency version lives in
    `pnpm-workspace.yaml` under `catalog:`, and all packages reference them with
    the `catalog:` protocol. No inline version ranges in any `package.json`.
- **Bundler:** Vite 8.x + `vite-plugin-monkey` 8.x (one build per package).
- **Lint/format:** Biome 2.x (single tool for both).
- **Scaffold:** Plop 4.x (`nr new`).
- **TypeScript:** 6.x.
- **All package-manager commands use `@antfu/ni`** (`ni`, `nr`, `nlx`).

## Repository Layout (pnpm workspace monorepo)

```
userscripts/
├─ pnpm-workspace.yaml      # packages globs + catalog: definitions
├─ package.json             # root: shared scripts + devDeps (catalog:)
├─ biome.json               # shared lint/format config
├─ tsconfig.base.json       # shared TS config (packages extend this)
├─ plopfile.mjs             # scaffold definition
├─ scripts/
│  └─ version.ts            # getVersion() — date-based version generator
├─ plop-templates/
│  └─ userscript/
│     ├─ package.json.hbs
│     ├─ vite.config.ts.hbs
│     ├─ tsconfig.json.hbs
│     └─ src/main.ts.hbs
├─ packages/
│  └─ <script-name>/
│     ├─ package.json       # name only; version is generated, not from here
│     ├─ vite.config.ts     # monkey.userscript metadata inline
│     ├─ tsconfig.json      # extends ../../tsconfig.base.json
│     ├─ src/main.ts
│     └─ dist/<name>.user.js  # build output (single file)
└─ .github/workflows/       # optional build workflow
```

Rationale: userscripts are distributed as a single file, and
`vite-plugin-monkey` is designed around one userscript per build. A package per
userscript maps cleanly onto that model while sharing config through the
workspace root.

## Metadata Management

- Each package declares its userscript metadata inline in its own
  `vite.config.ts` via `monkey.userscript` (typed, editor completion).
- `@downloadURL` / `@updateURL` are settable per package. The plop template
  pre-fills them from the package name (GitHub raw URL), so new packages are
  update-capable out of the box.

## Version Generation

- Format: `@version YYYY.MM.DD`. If the same package is built more than once on
  the same day, append a monotonic suffix: `YYYY.MM.DD.N` (N = 1, 2, …).
- Rationale for date-based versions:
  - Greasy Fork rejects re-uploading the same version and uses `@version` for
    monotonic-increasing update detection — dates increase naturally.
  - Avoids per-package git tag prefixes (`foo@1.2.3`) in a monorepo.
  - Date-based versions are an established convention for userscripts.
- Implementation (approach A): `scripts/version.ts` exports `getVersion()`.
  Each package's `vite.config.ts` imports it via a workspace-relative path and
  passes the result into `monkey.userscript.version`. No extra dependency, no
  internal build-utils package.
- Package `version` fields in `package.json` are unused for distribution
  (kept at a fixed placeholder such as `0.0.0`).

## Scaffold (`nr new`)

`nr new` runs Plop with the `userscript` generator.

- Prompts (all English):
  - `name` — kebab-case package/script name
  - `description` — one-line description
  - `match` — one or more `@match` URL patterns
  - `grant` — selected `GM_*` grants (multiselect)
  - `namespace` — userscript `@namespace`
- Generates `packages/<name>/` from `plop-templates/userscript/`:
  - `package.json` — name + deps referenced with `catalog:`
  - `vite.config.ts` — `monkey.userscript` metadata filled from prompts, with
    `downloadURL`/`updateURL` derived from `name`
  - `tsconfig.json` — extends the base config
  - `src/main.ts` — starter entry
- After generation, the user runs `ni` to install (or the generator surfaces
  the command to run).

## Dev / Build Flow

- **Dev:** `nr dev --filter <pkg>` starts the Vite dev server for one package.
  `vite-plugin-monkey` serves a `<name>.proxy.user.js` install URL on
  localhost; install it once in Tampermonkey, then HMR reflects changes live.
  Metadata (`@match`, etc.) applies during development too.
- **Build:** `nr build` runs `pnpm -r build` (all packages); `nr build --filter
  <pkg>` builds one. Each package emits a single `dist/<name>.user.js` with the
  metadata banner and inlined dependencies. `@version` is injected at build time
  by `getVersion()`.
- **Check:** `nr check` runs Biome lint + format across the repo.

## Distribution (Greasy Fork)

- Upload is **manual** to Greasy Fork.
- Each built `.user.js` carries `@downloadURL`/`@updateURL` so end users get
  automatic updates from the configured URL (GitHub raw / release).
- CI (optional) builds `.user.js` artifacts; publishing to Greasy Fork stays a
  manual step.

## Out of Scope (YAGNI)

- Turborepo / Nx orchestration (no current need; pnpm `--filter` + root scripts
  suffice).
- Automated Greasy Fork publishing (no official publish API; manual upload).
- git-tag / SemVer versioning (date-based chosen instead).
- Per-package build-utils package (workspace-relative import chosen instead).
