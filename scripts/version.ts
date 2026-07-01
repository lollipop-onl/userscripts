import { readFileSync } from "node:fs";

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

/**
 * Reads the `@version` from a previously built userscript file, if it exists.
 *
 * @param distFile Path to a built `.user.js` file.
 * @returns The version string in the file's metadata banner, or `undefined`
 *   when the file is absent or has no `@version` line.
 */
export function readBuiltVersion(distFile: string): string | undefined {
	let contents: string;
	try {
		contents = readFileSync(distFile, "utf8");
	} catch {
		return undefined;
	}
	const match = contents.match(/@version\s+(\S+)/);
	return match?.[1];
}

/**
 * Resolves the version for a userscript build, keeping `@version` monotonic
 * across same-day rebuilds by seeding {@link getVersion} with the version of
 * the last build output.
 *
 * On the first build of a day this returns `YYYY.MM.DD`. Each subsequent build
 * on the same day reads the previous build's `@version` and bumps the `.N`
 * suffix, so re-uploads to Greasy Fork always increase.
 *
 * @param distFile Path to this package's build output, e.g.
 *   `dist/<name>.user.js`.
 * @param now The build timestamp. Defaults to the current time; injectable for
 *   testing.
 */
export function resolveVersion(
	distFile: string,
	now: Date = new Date(),
): string {
	const previous = readBuiltVersion(distFile);
	return getVersion(now, previous ? [previous] : []);
}
