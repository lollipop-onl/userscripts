import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

const name = "hello-example";
const downloadURL = `https://raw.githubusercontent.com/simochee/userscripts/dist/${name}.user.js`;

export default defineConfig({
	plugins: [
		monkey({
			entry: "src/main.ts",
			build: { fileName: `${name}.user.js` },
			userscript: {
				name: "Hello Example",
				namespace: "https://github.com/simochee/userscripts",
				description: "Example userscript demonstrating the build setup.",
				version: "1.0.0",
				match: ["https://example.com/*"],
				grant: [],
				downloadURL,
				updateURL: downloadURL,
			},
		}),
	],
});
