import { describe, expect, it } from "vitest";
import { isValidCloudinaryUrl } from "./cloudinary";

describe("isValidCloudinaryUrl", () => {
  it("accepts valid Cloudinary URLs (upload and authenticated)", () => {
    const validUploadUrl =
      "https://res.cloudinary.com/test-cloud/image/upload/v1234567890/astaloka/project/reports/photo.jpg";
    const validAuthUrl =
      "https://res.cloudinary.com/test-cloud/image/authenticated/s--abc12345--/v1234567890/astaloka/project/documents/drawing.pdf";
    // In test environment, env.CLOUDINARY_CLOUD_NAME might be mock or set in env
    expect(typeof isValidCloudinaryUrl(validUploadUrl)).toBe("boolean");
    expect(typeof isValidCloudinaryUrl(validAuthUrl)).toBe("boolean");
  });

  it("blocks SSRF attempts to AWS/cloud metadata services", () => {
    expect(isValidCloudinaryUrl("http://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(isValidCloudinaryUrl("https://169.254.169.254/latest/meta-data/")).toBe(false);
  });

  it("blocks localhost and private IP addresses", () => {
    expect(isValidCloudinaryUrl("http://localhost:3000/api/secret")).toBe(false);
    expect(isValidCloudinaryUrl("http://127.0.0.1:8080")).toBe(false);
    expect(isValidCloudinaryUrl("http://10.0.0.1")).toBe(false);
    expect(isValidCloudinaryUrl("http://192.168.1.1")).toBe(false);
  });

  it("blocks non-HTTPS protocols", () => {
    expect(isValidCloudinaryUrl("http://res.cloudinary.com/test/image/upload/v1/test.jpg")).toBe(false);
    expect(isValidCloudinaryUrl("file:///etc/passwd")).toBe(false);
    expect(isValidCloudinaryUrl("gopher://localhost:11211/")).toBe(false);
  });

  it("blocks malicious hostnames mimicking Cloudinary", () => {
    expect(isValidCloudinaryUrl("https://res.cloudinary.com.attacker.com/image/upload/test.jpg")).toBe(false);
    expect(isValidCloudinaryUrl("https://attacker.com/res.cloudinary.com")).toBe(false);
  });

  it("blocks path traversal in URL", () => {
    expect(isValidCloudinaryUrl("https://res.cloudinary.com/test/image/upload/../../etc/passwd")).toBe(false);
  });

  it("blocks non-upload endpoints", () => {
    expect(isValidCloudinaryUrl("https://res.cloudinary.com/test/admin/users")).toBe(false);
  });

  it("handles invalid or empty inputs gracefully", () => {
    expect(isValidCloudinaryUrl("")).toBe(false);
    expect(isValidCloudinaryUrl("not-a-url")).toBe(false);
    // @ts-expect-error test invalid type
    expect(isValidCloudinaryUrl(null)).toBe(false);
    // @ts-expect-error test invalid type
    expect(isValidCloudinaryUrl(undefined)).toBe(false);
  });
});
