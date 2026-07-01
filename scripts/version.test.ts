import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getVersion, readBuiltVersion, resolveVersion } from "./version.ts";

describe("getVersion", () => {
	const now = new Date("2026-07-01T10:00:00Z");

	it("returns a zero-padded date version", () => {
		expect(getVersion(new Date("2026-03-05T00:00:00Z"))).toBe("2026.03.05");
	});

	it("returns the plain date when there are no existing versions", () => {
		expect(getVersion(now, [])).toBe("2026.07.01");
	});

	it("appends .1 on the first same-day collision", () => {
		expect(getVersion(now, ["2026.07.01"])).toBe("2026.07.01.1");
	});

	it("increments past the highest existing same-day suffix", () => {
		expect(
			getVersion(now, ["2026.07.01", "2026.07.01.1", "2026.07.01.2"]),
		).toBe("2026.07.01.3");
	});

	it("ignores versions from other days", () => {
		expect(getVersion(now, ["2026.06.30", "2026.06.30.5"])).toBe("2026.07.01");
	});
});

describe("readBuiltVersion", () => {
	let dir: string;

	beforeAll(() => {
		dir = mkdtempSync(join(tmpdir(), "version-test-"));
	});

	afterAll(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("returns undefined when the file does not exist", () => {
		expect(readBuiltVersion(join(dir, "missing.user.js"))).toBeUndefined();
	});

	it("returns undefined when the file has no @version banner", () => {
		const file = join(dir, "no-version.user.js");
		writeFileSync(file, "// just some code\nconsole.log(1);\n");
		expect(readBuiltVersion(file)).toBeUndefined();
	});

	it("extracts the @version from a metadata banner", () => {
		const file = join(dir, "with-version.user.js");
		writeFileSync(
			file,
			"// ==UserScript==\n// @name Foo\n// @version      2026.07.01.2\n// ==/UserScript==\n",
		);
		expect(readBuiltVersion(file)).toBe("2026.07.01.2");
	});
});

describe("resolveVersion", () => {
	let dir: string;
	const now = new Date("2026-07-01T10:00:00Z");

	beforeAll(() => {
		dir = mkdtempSync(join(tmpdir(), "resolve-test-"));
	});

	afterAll(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("returns the plain date when there is no prior build", () => {
		expect(resolveVersion(join(dir, "missing.user.js"), now)).toBe(
			"2026.07.01",
		);
	});

	it("bumps the suffix when the prior build is from the same day", () => {
		const file = join(dir, "same-day.user.js");
		writeFileSync(file, "// @version 2026.07.01\n");
		expect(resolveVersion(file, now)).toBe("2026.07.01.1");
	});

	it("resets to the plain date when the prior build is from another day", () => {
		const file = join(dir, "other-day.user.js");
		writeFileSync(file, "// @version 2026.06.30.3\n");
		expect(resolveVersion(file, now)).toBe("2026.07.01");
	});
});
