import { describe, expect, it } from "vitest";
import {
  calculateElapsedPercent,
  formatWitaDate,
  getDaysAgoWita,
  getStartOfMonthWita,
  getStartOfTodayWita,
} from "./time-utils";

describe("time-utils (WITA timezone helpers)", () => {
  it("getStartOfTodayWita correctly returns 00:00:00 WITA", () => {
    // 2026-10-10 02:30:00 UTC = 2026-10-10 10:30:00 WITA
    const sampleUtcMorning = new Date("2026-10-10T02:30:00.000Z");
    const startOfToday = getStartOfTodayWita(sampleUtcMorning);

    // 00:00:00 WITA on 2026-10-10 is 2026-10-09 16:00:00 UTC
    expect(startOfToday.toISOString()).toBe("2026-10-09T16:00:00.000Z");

    // Check pre-dawn WITA: 2026-10-10 03:00 WITA = 2026-10-09 19:00 UTC
    const sampleUtcEarly = new Date("2026-10-09T19:00:00.000Z");
    const startOfTodayEarly = getStartOfTodayWita(sampleUtcEarly);
    expect(startOfTodayEarly.toISOString()).toBe("2026-10-09T16:00:00.000Z");
  });

  it("getDaysAgoWita returns exact previous days offset in WITA", () => {
    const sample = new Date("2026-10-10T05:00:00.000Z");
    const twoDaysAgo = getDaysAgoWita(2, sample);

    // 2 days ago from 2026-10-10 00:00 WITA is 2026-10-08 00:00 WITA (2026-10-07 16:00 UTC)
    expect(twoDaysAgo.toISOString()).toBe("2026-10-07T16:00:00.000Z");
  });

  it("getStartOfMonthWita returns 1st day of the month at 00:00:00 WITA", () => {
    // 2026-10-15 12:00:00 WITA
    const sample = new Date("2026-10-15T04:00:00.000Z");
    const startOfMonth = getStartOfMonthWita(sample);

    // 2026-10-01 00:00:00 WITA = 2026-09-30 16:00:00 UTC
    expect(startOfMonth.toISOString()).toBe("2026-09-30T16:00:00.000Z");
  });

  it("calculateElapsedPercent calculates proper percentages and handles bounds", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const end = new Date("2026-01-11T00:00:00.000Z"); // 10 days duration

    // Exactly halfway: 5 days later
    const mid = new Date("2026-01-06T00:00:00.000Z");
    expect(calculateElapsedPercent(start, end, mid)).toBe(50);

    // Before start
    const before = new Date("2025-12-01T00:00:00.000Z");
    expect(calculateElapsedPercent(start, end, before)).toBe(0);

    // After end
    const after = new Date("2026-02-01T00:00:00.000Z");
    expect(calculateElapsedPercent(start, end, after)).toBe(100);

    // Missing dates
    expect(calculateElapsedPercent(null, end)).toBeNull();
    expect(calculateElapsedPercent(start, null)).toBeNull();
  });

  it("formatWitaDate formats date in Indonesian locale", () => {
    const sample = new Date("2026-10-10T02:00:00.000Z"); // 10 Okt 2026 10:00 WITA
    const formatted = formatWitaDate(sample);
    expect(formatted).toContain("Oktober");
    expect(formatted).toContain("2026");
  });
});
