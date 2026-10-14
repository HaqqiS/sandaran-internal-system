import { describe, expect, it } from "vitest";
import {
  buildCosmeticSlug,
  deriveShortId,
  extractShortIdFromSlug,
  isLegacySlug,
  slugify,
} from "./slug-utils";

describe("slug-utils", () => {
  describe("slugify", () => {
    it("converts simple string to slug", () => {
      expect(slugify("Villa Jimbaran")).toBe("villa-jimbaran");
    });

    it("handles multiple spaces and special characters", () => {
      expect(slugify("Villa & Resort — Canggu #01")).toBe(
        "villa-resort-canggu-01",
      );
    });

    it("handles accented characters", () => {
      expect(slugify("Café Crème")).toBe("cafe-creme");
    });

    it("strips leading and trailing hyphens", () => {
      expect(slugify("---Villa Ubud---")).toBe("villa-ubud");
    });
  });

  describe("deriveShortId", () => {
    it("extracts last 10 characters from database CUID", () => {
      const cuid = "cmum2x8u90002nxd0df55qy7c";
      expect(deriveShortId(cuid, 10)).toBe("d0df55qy7c");
    });

    it("extracts custom length if specified", () => {
      const cuid = "cmum2x8u90002nxd0df55qy7c";
      expect(deriveShortId(cuid, 12)).toBe("nxd0df55qy7c");
    });

    it("cleans non-alphanumeric characters", () => {
      const id = "proj_villa_jimbaran";
      expect(deriveShortId(id, 8)).toBe("jimbaran");
    });

    it("returns empty string for empty input", () => {
      expect(deriveShortId("")).toBe("");
    });
  });

  describe("buildCosmeticSlug", () => {
    it("combines slugified name and shortId", () => {
      expect(buildCosmeticSlug("Villa Jimbaran", "d0df55qy7c")).toBe(
        "villa-jimbaran-d0df55qy7c",
      );
    });

    it("handles case where name has symbols", () => {
      expect(buildCosmeticSlug("Villa Jimbaran (Phase 2!)", "d0df55qy7c")).toBe(
        "villa-jimbaran-phase-2-d0df55qy7c",
      );
    });

    it("returns shortId if name is empty", () => {
      expect(buildCosmeticSlug("", "d0df55qy7c")).toBe("d0df55qy7c");
    });
  });

  describe("extractShortIdFromSlug", () => {
    it("extracts shortId from standard cosmetic slug", () => {
      expect(extractShortIdFromSlug("villa-jimbaran-luxury-d0df55qy7c")).toBe(
        "d0df55qy7c",
      );
    });

    it("extracts shortId from 12-char suffix", () => {
      expect(extractShortIdFromSlug("sadara-resort-nxd0df55qy7c")).toBe(
        "nxd0df55qy7c",
      );
    });

    it("matches standalone shortId directly", () => {
      expect(extractShortIdFromSlug("d0df55qy7c")).toBe("d0df55qy7c");
    });

    it("returns null for legacy slugs without an ID suffix", () => {
      expect(extractShortIdFromSlug("villa-jimbaran")).toBeNull();
      expect(extractShortIdFromSlug("sadara-boutique-resort")).toBeNull();
      expect(extractShortIdFromSlug("b-a-house")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(extractShortIdFromSlug("")).toBeNull();
    });
  });

  describe("isLegacySlug", () => {
    it("identifies legacy slugs correctly", () => {
      expect(isLegacySlug("villa-jimbaran")).toBe(true);
      expect(isLegacySlug("sadara-boutique-resort")).toBe(true);
    });

    it("identifies cosmetic dynamic slugs correctly", () => {
      expect(isLegacySlug("villa-jimbaran-d0df55qy7c")).toBe(false);
    });
  });
});
