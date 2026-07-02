import "./style.css";

// The per-level marker content is generated dynamically.
const markers = Array.from({ length: 6 }, (_, i) => i + 1)
	.map(
		(lv) => `
	.doc-container h${lv}::before {
		content: "${"#".repeat(lv)}";
	}
`,
	)
	.join("\n");

GM_addStyle(markers);
