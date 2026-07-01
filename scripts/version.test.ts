import { describe, expect, it } from "vitest";
import { getVersion } from "./version.ts";

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
