import { describe, expect, it } from "vitest";
import { fmtAgo, fmtClock, fmtTime, fmtUpdated } from "../lib/format";

// 10:11 UTC is 13:11 in Africa/Addis_Ababa (UTC+3).
const ISO = "2026-11-17T10:11:07.106Z";
const AT = new Date(ISO).getTime();

describe("time formatting", () => {
  it("uses a 12-hour clock with AM/PM", () => {
    expect(fmtClock(ISO)).toBe("1:11 PM");
    expect(fmtTime(ISO)).toBe("17 Nov 2026, 1:11 PM");
  });

  it("describes the age of an observation", () => {
    expect(fmtAgo(ISO, AT + 20_000)).toBe("just now");
    expect(fmtAgo(ISO, AT + 18 * 60_000)).toBe("18 min ago");
    expect(fmtAgo(ISO, AT + 3 * 3_600_000)).toBe("3 hrs ago");
    expect(fmtAgo(ISO, AT + 3_600_000)).toBe("1 hr ago");
    expect(fmtAgo(ISO, AT + 26 * 3_600_000)).toBe("1 day ago");
    expect(fmtAgo(ISO, AT + 50 * 3_600_000)).toBe("2 days ago");
  });

  it("combines the observation time and its age", () => {
    expect(fmtUpdated(ISO)).toMatch(
      /^17 Nov 2026, 1:11 PM · (just now|\d+ min ago|\d+ hrs? ago|\d+ days? ago)$/,
    );
  });

  it("returns a dash for a missing or invalid timestamp", () => {
    expect(fmtTime(null)).toBe("—");
    expect(fmtAgo("not-a-date", AT)).toBe("—");
  });
});
