import { TZ_OFFSET_HOURS } from "./dashboard-constants";

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;
const TZ_OFFSET_MS = TZ_OFFSET_HOURS * MS_PER_HOUR;

/**
 * Mendapatkan representasi waktu virtual UTC dari sebuah Date berdasarkan offset WITA (UTC+8).
 * Karena WITA tidak memiliki Daylight Saving Time (DST), konversi ini murni matematis dan deterministik.
 */
function getWitaVirtualDate(date: Date): Date {
  return new Date(date.getTime() + TZ_OFFSET_MS);
}

/**
 * Menghasilkan timestamp Date untuk jam 00:00:00.000 WITA pada hari ini (atau tanggal acuan).
 *
 * Contoh:
 * Jika UTC saat ini adalah 2026-10-10 02:00:00 (10:00 WITA),
 * fungsi mengembalikan 2026-10-09 16:00:00 UTC (yang setara 2026-10-10 00:00:00 WITA).
 */
export function getStartOfTodayWita(now = new Date()): Date {
  return new Date(
    Math.floor((now.getTime() + TZ_OFFSET_MS) / MS_PER_DAY) * MS_PER_DAY -
      TZ_OFFSET_MS,
  );
}

/**
 * Menghasilkan timestamp Date untuk batas hari N hari sebelumnya dalam WITA.
 */
export function getDaysAgoWita(days: number, now = new Date()): Date {
  const startOfToday = getStartOfTodayWita(now);
  return new Date(startOfToday.getTime() - days * MS_PER_DAY);
}

/**
 * Menghasilkan timestamp awal bulan (tanggal 1, 00:00:00.000 WITA).
 */
export function getStartOfMonthWita(now = new Date()): Date {
  const v = getWitaVirtualDate(now);
  const startOfMonthUtc = Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), 1);
  return new Date(startOfMonthUtc - TZ_OFFSET_MS);
}

/**
 * Menghitung persentase waktu kalender proyek yang telah berlalu (0 - 100).
 * Jika tanggal mulai atau tanggal selesai tidak diset, mengembalikan null.
 */
export function calculateElapsedPercent(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  now = new Date(),
): number | null {
  if (!startDate || !endDate) return null;

  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  const startMs = start.getTime();
  const endMs = end.getTime();
  const nowMs = now.getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return null;
  }

  const elapsed = (nowMs - startMs) / (endMs - startMs);
  return Math.round(Math.min(Math.max(elapsed, 0), 1) * 100);
}

/**
 * Format tanggal ramah bahasa Indonesia untuk tampilan dashboard (WITA).
 */
export function formatWitaDate(
  date: Date | string,
  options: {
    includeTime?: boolean;
    shortMonth?: boolean;
  } = {},
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar",
    day: "numeric",
    month: options.shortMonth ? "short" : "long",
    year: "numeric",
    ...(options.includeTime
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : {}),
  }).format(d);
}
