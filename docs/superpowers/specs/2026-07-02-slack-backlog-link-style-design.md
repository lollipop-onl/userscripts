# Slack Backlog Link Style — Design

## Purpose

Style Backlog links inside the Slack web app (`app.slack.com`) so they are
visually distinguishable: brand-green text, a Backlog icon before the link, and
an underline on hover. Pure presentational enhancement — no interaction, no data
extraction.

## Package

`packages/slack-backlog-link-style/`

Scaffolded from the standard userscript template (`nr new`), then adjusted.

## Scope

- **`@match`**: `https://app.slack.com/*` (current unified Slack web app only).
- **Target links**: all Backlog domains — `backlog.jp`, `backlog.com`,
  `backlogtool.com`.
- **`@grant`**: `["GM_addStyle"]`.
- **`version`**: `2026.07.02` (date-based, per repo convention).
- **`name` / `description`**: bilingual (`""` + `ja`), matching sibling packages.
- **`icon`** (userscript metadata): Backlog favicon
  (`https://www.google.com/s2/favicons?sz=64&domain=backlog.jp`), consistent with
  the other Backlog packages.

## Approach: static CSS via GM_addStyle

CSS attribute selectors match Backlog links regardless of when Slack injects
them into the DOM, so no JS DOM-walking / MutationObserver is needed. A single
`GM_addStyle` call at document start is sufficient.

The one piece of JS logic is assembling the icon as a `data:` URI to sidestep
Slack's Content-Security-Policy (which is expected to block external `img`/
`background` URLs). The SVG is imported as a raw string and inlined.

### Icon

`src/icon.svg` — the Backlog brand icon supplied by the user (green rounded
square `#42ce9f` with the white Backlog "B"). Imported via `?raw` and encoded:

```ts
import iconRaw from "./icon.svg?raw";
const iconDataUri = `data:image/svg+xml,${encodeURIComponent(iconRaw)}`;
```

A `declare module "*.svg?raw"` type shim is added (in the package or shared
types) so TypeScript accepts the `?raw` import.

### Style

```ts
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

Selector note: `[href*="backlog.com/"]` etc. use substring match because CSS
attribute selectors have no wildcard for the subdomain. Unrelated URLs
containing these substrings are effectively nonexistent, so this is acceptable.

## Files

- `packages/slack-backlog-link-style/package.json`
- `packages/slack-backlog-link-style/tsconfig.json` (extends `../shared/tsconfig.json`)
- `packages/slack-backlog-link-style/vite.config.ts`
- `packages/slack-backlog-link-style/src/main.ts`
- `packages/slack-backlog-link-style/src/icon.svg`
- SVG `?raw` type declaration (package-local `.d.ts` or shared)

## Non-goals (YAGNI)

- No MutationObserver / DOM class tagging.
- No issue-key parsing or title fetching.
- No support for legacy `<workspace>.slack.com` (can be added to `@match` later
  if needed).

## Open risk

Slack CSP may still block a `data:` background image in some configurations. If
the icon fails to render, fallbacks (in order): confirm `data:` is allowed →
otherwise drop the icon and keep color + hover underline only.
