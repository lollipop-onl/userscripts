# CLAUDE.md

pnpm-workspace monorepo of userscripts. One package per userscript under
`packages/<name>/`, built with vite + vite-plugin-monkey, distributed via
Greasy Fork from the `dist` branch.

## Commands (use @antfu/ni, never npm/pnpm/yarn/npx directly)

- `ni` — install. `ni --frozen` in CI (= `pnpm install --frozen-lockfile`).
- `nr build` — build ALL packages (`pnpm -r build`).
- `pnpm --filter <name> build` — build ONE package. NOTE: `nr build --filter` does
  NOT work (the `-r` script swallows the flag); call pnpm directly for filtering.
- `pnpm --filter <name> dev` — dev server (HMR + vite-plugin-monkey install URL).
- `nr check` — Biome lint + format (`biome check --write .`). Must exit 0.
- `nr new` — Plop generator; scaffolds `packages/<name>/` from `plop-templates/userscript/`.
- No test suite — Vitest was removed. Do not add `nr test`.

## Toolchain (pinned)

- Node 26.2.0 + pnpm 11.6.0 via `package.json` `devEngines` (`onFail: download`).
  mise reads `devEngines` and downloads both; `mise install` also honors mise.toml
  `[settings]`. Do NOT add `npm:@antfu/ni` to mise `[tools]`: mise resolves it via
  `npm view`, which npm aborts with EBADDEVENGINES against `devEngines.packageManager`
  (pnpm). `ni` is a local convenience only — install it globally if you want it.
- Bootstrap with `mise install`, then `pnpm install`. CI (release.yml) uses
  `pnpm install --frozen-lockfile` + `pnpm -r build` directly, not `ni`/`nr`.
- `pnpm-lock.yaml` records node as a dependency (devEngines onFail:download) — this is
  expected; do not "clean" it.

## Hard rules

- **catalog is mandatory.** Every dependency version lives in `pnpm-workspace.yaml`
  under `catalog:`. Every `package.json` references deps as `"catalog:"`. NEVER write
  an inline version range in any package.json.
- **All authored text in English** (code, comments, config, docs, Plop prompts).
- **`monkey()` must be the LAST plugin** in each package's vite plugin list.
- **`dist/` is gitignored** — build output is never committed to `main`.
- **Manual date-based versioning.** Each package hard-codes a `version` string in its
  `vite.config.ts` shaped as `YYYY.MM.DD` (the release date), with an optional `.N`
  suffix for a same-day re-release. The first release on a given day is `YYYY.MM.DD`
  (i.e. an omitted `.0`); if another release happens the same day, append `.1`, then
  `.2`, and so on. Bump to publish; leave unchanged to ship code without republishing
  (Greasy Fork treats an unchanged `@version` as a no-op).

## Per-package vite.config.ts shape

Each `vite.config.ts` calls the shared helper:
`export default defineMonkeyConfig(import.meta.dirname, { name, description, version, match, grant, ... })`
imported from `shared/vite`. The helper (`packages/shared/src/vite.ts`) derives
the script name from the directory basename (`import.meta.dirname`) and fills in
everything identical across packages: `entry: "src/main.ts"`, output
`build.fileName`, `server.mountGmApi: true`, a default `namespace` and `icon`,
`@downloadURL`/`@updateURL`, and vite `build.minify: false`. The second argument
is a `MonkeyUserScript` merged over those defaults (`...userscript` last), so a
package overrides any default (e.g. `namespace`, `icon`) by simply setting it.
`@downloadURL`/`@updateURL` are built from env with local fallbacks:
`https://raw.githubusercontent.com/${GITHUB_REPOSITORY}/${DIST_BRANCH}/<name>.user.js`
where `GITHUB_REPOSITORY` (GitHub-injected in CI) defaults to `simochee/userscripts`
and `DIST_BRANCH` (set by release.yml) defaults to `dist`. So a plain local `nr build`
still produces valid URLs; CI overrides them to track the actual repo/branch.
The Plop template (`plop-templates/userscript/vite.config.ts.hbs`) is the source of
truth for this shape; new packages are scaffolded from it via `nr new`.

## Release / distribution

- `.github/workflows/release.yml`: on push to `main`, builds all packages and syncs
  each `<name>.user.js` (flat) to the orphan `dist` branch, committing only on change.
- The `dist` branch is created manually once; CI assumes it exists.
- Greasy Fork sync source = the raw `dist` URL above (registered manually per script).

## Layout

- `packages/<name>/` — one userscript (package.json, tsconfig.json extends
  `../shared/tsconfig.json`, vite.config.ts, src/main.ts).
- `plopfile.mjs` + `plop-templates/userscript/` — scaffold.
