// Backlog's global toolbar has an "Add" menu (#addItemLink) whose dropdown
// (#addItemContainer) starts with an "Add issue" button. Chain both clicks
// behind the "n" key so a new issue is one keystroke away.

const nextFrame = () =>
	new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const isTypingTarget = (el: Element | null): boolean => {
	if (!(el instanceof HTMLElement)) return false;
	if (el.isContentEditable) return true;
	return (
		el.tagName === "INPUT" ||
		el.tagName === "TEXTAREA" ||
		el.tagName === "SELECT"
	);
};

document.addEventListener("keydown", async (event) => {
	if (event.key !== "n" && event.key !== "N") return;
	// Leave OS-level shortcuts (Cmd+N / Ctrl+N / Alt+N) alone.
	if (event.ctrlKey || event.metaKey || event.altKey) return;
	if (isTypingTarget(document.activeElement)) return;

	event.preventDefault();

	if (!document.querySelector("#addItemContainer")) {
		document.querySelector<HTMLElement>("#addItemLink")?.click();
		// Backlog renders the dropdown on the next frame; wait one before
		// clicking into it.
		await nextFrame();
	}

	document.querySelector<HTMLElement>("#addItemContainer button")?.click();
});
