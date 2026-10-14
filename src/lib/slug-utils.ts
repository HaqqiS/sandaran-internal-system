/**
 * Slug and Short ID Utility for Sandaran System
 * Implements Notion / Stack Overflow style cosmetic dynamic slugs
 */

/**
 * Convert string to a clean, URL-safe slug base
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // normalize accented characters
    .replace(/[\u0300-\u036f]/g, "") // remove accent diacritics
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
}

/**
 * Derive shortId from database primary key (e.g. project.id CUID)
 * Takes the last `length` characters of the database ID
 * Default length: 10 characters
 */
export function deriveShortId(databaseId: string, length = 10): string {
  if (!databaseId) return "";
  const cleaned = databaseId.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned.slice(-length);
}

/**
 * Build a cosmetic dynamic slug combining the project name and shortId
 * Format: [slugified-name]-[shortId]
 * Example: "Villa Jimbaran Luxury", "d0df55qy7c" -> "villa-jimbaran-luxury-d0df55qy7c"
 */
export function buildCosmeticSlug(name: string, shortId: string): string {
  const base = slugify(name);
  if (!base) return shortId.toLowerCase();
  return `${base}-${shortId.toLowerCase()}`;
}

/**
 * Extract shortId from a slug or URL param
 * Looks for trailing hyphen followed by 10 alphanumeric characters (matching CUID slice)
 * Example: "villa-jimbaran-luxury-d0df55qy7c" -> "d0df55qy7c"
 * Example: "d0df55qy7c" -> "d0df55qy7c" (direct ID match)
 */
export function extractShortIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  const trimmed = slug.trim();

  // Pattern 1: Trailing shortId preceded by a hyphen (10 to 12 chars)
  const hyphenMatch = trimmed.match(/-([a-z0-9]{10,12})$/i);
  if (hyphenMatch?.[1]) {
    return hyphenMatch[1].toLowerCase();
  }

  // Pattern 2: Standalone shortId (10 to 12 chars)
  if (/^[a-z0-9]{10,12}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return null;
}

/**
 * Check if a slug is a legacy slug without an ID suffix
 */
export function isLegacySlug(slug: string): boolean {
  return extractShortIdFromSlug(slug) === null;
}
