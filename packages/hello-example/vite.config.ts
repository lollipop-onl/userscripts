import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import { resolveVersion } from "../../scripts/version.ts";

const name = "hello-example";
const repoRawBase =
	"https://raw.githubusercontent.com/simochee/userscripts/main/packages";
const downloadURL = `${repoRawBase}/${name}/dist/${name}.user.js`;

export default defineConfig({
	plugins: [
		monkey({
			entry: "src/main.ts",
			build: { fileName: `${name}.user.js` },
			userscript: {
				name: "Hello Example",
				namespace: "https://github.com/simochee/userscripts",
				description: "Example userscript demonstrating the build setup.",
				version: resolveVersion(`dist/${name}.user.js`),
				match: ["https://example.com/*"],
				grant: [],
				downloadURL,
				updateURL: downloadURL,
			},
		}),
	],
});
