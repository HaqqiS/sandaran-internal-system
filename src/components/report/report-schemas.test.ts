import { describe, expect, it } from "vitest";
import {
  reportSchema,
  step1Schema,
  step2Schema,
  step3Schema,
} from "./report-form";

describe("Report Form Validation Schemas (Multi-Step Stepper)", () => {
  describe("Step 1: Kondisi Lapangan (step1Schema)", () => {
    it("fails when reportDate is missing or invalid", () => {
      const result = step1Schema.safeParse({
        totalWorkers: 5,
        weather: "Cerah",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("reportDate");
      }
    });

    it("fails when totalWorkers is negative", () => {
      const result = step1Schema.safeParse({
        reportDate: new Date(),
        totalWorkers: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("totalWorkers");
      }
    });

    it("fails when weather is custom but customWeather is empty or omitted", () => {
      const result = step1Schema.safeParse({
        reportDate: new Date(),
        totalWorkers: 3,
        weather: "custom",
        customWeather: "   ",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("customWeather");
      }
    });

    it("passes with valid Step 1 data", () => {
      const result = step1Schema.safeParse({
        reportDate: new Date("2026-10-15T08:00:00Z"),
        totalWorkers: 12,
        weather: "Cerah",
        location: "Lantai 2, Ruang Rapat",
      });
      expect(result.success).toBe(true);
    });

    it("passes when weather is custom and valid customWeather is provided", () => {
      const result = step1Schema.safeParse({
        reportDate: new Date(),
        totalWorkers: 8,
        weather: "custom",
        customWeather: "Gerimis berangin kencang",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Step 2: Progres & Rincian Tugas (step2Schema)", () => {
    it("fails when taskDescription is empty", () => {
      const result = step2Schema.safeParse({
        taskDescription: "",
        progressPercent: 50,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("taskDescription");
      }
    });

    it("fails when progressPercent is below 0 or above 100", () => {
      const resultBelow = step2Schema.safeParse({
        taskDescription: "Pengecoran kolom selesai",
        progressPercent: -5,
      });
      expect(resultBelow.success).toBe(false);

      const resultAbove = step2Schema.safeParse({
        taskDescription: "Pengecoran kolom selesai",
        progressPercent: 120,
      });
      expect(resultAbove.success).toBe(false);
    });

    it("passes with valid Step 2 data", () => {
      const result = step2Schema.safeParse({
        taskDescription: "Pemasangan hebel lantai 1 dan plesteran dinding",
        progressPercent: 65,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Step 3: Dokumentasi & Kendala (step3Schema)", () => {
    it("passes with empty/optional values", () => {
      const result = step3Schema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("passes with issues and image list", () => {
      const result = step3Schema.safeParse({
        issues: "Keterlambatan pengiriman semen 2 jam",
        images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Complete Report Schema (reportSchema)", () => {
    it("validates entire multi-step form data successfully", () => {
      const result = reportSchema.safeParse({
        reportDate: new Date("2026-10-15T08:00:00Z"),
        totalWorkers: 10,
        weather: "Cerah",
        location: "Zona A",
        taskDescription: "Pekerjaan pembesian sloof",
        progressPercent: 80,
        issues: "Tidak ada kendala berarti",
        images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      });
      expect(result.success).toBe(true);
    });

    it("rejects incomplete data even if some steps are filled", () => {
      const result = reportSchema.safeParse({
        reportDate: new Date(),
        totalWorkers: 10,
        weather: "Cerah",
        // missing taskDescription (Step 2)
        taskDescription: "",
        progressPercent: 50,
      });
      expect(result.success).toBe(false);
    });
  });
});
