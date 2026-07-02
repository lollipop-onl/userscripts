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
