# userscripts

A pnpm-workspace monorepo for authoring userscripts with
[vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) and
[Biome](https://biomejs.dev/), distributed via
[Greasy Fork](https://greasyfork.org/).

## Requirements

- Node.js 26
- pnpm 11
- [@antfu/ni](https://github.com/antfu-collective/ni) (commands below use it)

## Setup

```bash
ni
```

## Creating a new userscript

```bash
nr new
```

Answer the prompts (name, display name, description, namespace, match patterns,
GM grants). A new package is created under `packages/<name>/`. Then run `ni` to
install its dependencies.

## Development

```bash
nr dev -- --filter <name>
```

Vite starts a dev server and vite-plugin-monkey serves an install URL
(`<name>.proxy.user.js`). Install it once in your userscript manager
(Tampermonkey / Violentmonkey), then edits hot-reload live.

## Build

```bash
nr build                    # build all packages
nr build -- --filter <name> # build one package
```

Each package emits a single `packages/<name>/dist/<name>.user.js` with the
metadata banner and inlined dependencies. `@version` is a date, `YYYY.MM.DD`
(with a `.N` suffix for same-day rebuilds).

> The `--` separates `ni`/`nr` arguments from pnpm's own flags, so pnpm's
> `--filter` reaches pnpm instead of the underlying script.

## Lint & format

```bash
nr check
```

## Distribution

Upload the built `.user.js` to Greasy Fork manually. Each script carries
`@downloadURL`/`@updateURL` so end users receive automatic updates.

## Versioning

Versions are date-based (`YYYY.MM.DD`) and generated at build time by
`scripts/version.ts`. Greasy Fork requires monotonically increasing versions,
which dates satisfy naturally. The `version` field in each package's
`package.json` is unused for distribution.
