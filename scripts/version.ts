/**
 * Generates a date-based userscript version: `YYYY.MM.DD`.
 *
 * Greasy Fork requires monotonically increasing `@version` values and rejects
 * re-uploads of the same version. Dates satisfy that naturally. When a package
 * is rebuilt more than once on the same day, a monotonic `.N` suffix is added.
 *
 * @param now The build timestamp. Injected for testability; callers pass `new Date()`.
 * @param existingVersions Previously published versions, used to pick the suffix.
 */
export function getVersion(now: Date, existingVersions: string[] = []): string {
	const year = now.getUTCFullYear();
	const month = String(now.getUTCMonth() + 1).padStart(2, "0");
	const day = String(now.getUTCDate()).padStart(2, "0");
	const date = `${year}.${month}.${day}`;

	const sameDay = existingVersions.filter(
		(v) => v === date || v.startsWith(`${date}.`),
	);
	if (sameDay.length === 0) {
		return date;
	}

	const highestSuffix = sameDay.reduce((max, v) => {
		const suffix = v === date ? 0 : Number(v.slice(date.length + 1));
		return Number.isNaN(suffix) ? max : Math.max(max, suffix);
	}, 0);

	return `${date}.${highestSuffix + 1}`;
}
