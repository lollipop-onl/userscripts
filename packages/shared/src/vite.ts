import { basename } from "node:path";
import { type UserConfig, defineConfig } from "vite";
import monkey, { type MonkeyUserScript } from "vite-plugin-monkey";

/**
 * The userscript metadata a package must provide. Every field of the upstream
 * `MonkeyUserScript` is optional, so this makes the ones a real userscript
 * cannot sensibly omit required, catching missing metadata at compile time.
 * `grant` stays optional — a script may legitimately need no GM_* grants.
 */
export type UserScriptMeta = MonkeyUserScript &
	Required<Pick<MonkeyUserScript, "name" | "description" | "version" | "match">>;

/**
 * Build a Vite config for a userscript package with all the boilerplate that is
 * identical across packages filled in, so each `vite.config.ts` only declares
 * what is unique to it (title, description, version, match, grant, ...).
 *
 * Pass `import.meta.dirname` as `packageDir`: its basename becomes the script
 * name, which drives the output filename and the download/update URLs.
 *
 * The given `userscript` fields are merged over the defaults (`namespace` and
 * `icon`), so a package can override them by simply setting them. Only the
 * userscript metadata is configurable — the vite-level options (entry, build,
 * server, plugins) are fixed; a package needing to change those should not use
 * this helper.
 *
 * @downloadURL / @updateURL are derived from GITHUB_REPOSITORY (injected by
 * GitHub in CI) and DIST_BRANCH (set by release.yml), with local fallbacks so a
 * plain local build still produces valid URLs.
 */
export function defineMonkeyConfig(
	packageDir: string,
	userscript: UserScriptMeta,
): UserConfig {
	const name = basename(packageDir);
	const { GITHUB_REPOSITORY = "simochee/userscripts", DIST_BRANCH = "dist" } =
		process.env;
	const distURL = `https://raw.githubusercontent.com/${GITHUB_REPOSITORY}/${DIST_BRANCH}/${name}.user.js`;

	return defineConfig({
		plugins: [
			monkey({
				entry: "src/main.ts",
				build: { fileName: `${name}.user.js` },
				server: { mountGmApi: true },
				userscript: {
					namespace: "https://github.com/simochee/userscripts",
					icon: "https://www.google.com/s2/favicons?sz=64&domain=backlog.jp",
					downloadURL: distURL,
					updateURL: distURL,
					...userscript,
				},
			}),
		],
		build: { minify: false },
	});
}
