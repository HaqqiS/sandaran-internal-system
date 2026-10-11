/**
 * Dashboard Constants
 *
 * Centralized business constants used across dashboard queries,
 * role lenses, and metric calculations.
 */

/** Proyek aktif tanpa laporan harian dalam >= 2 hari dianggap stale (butuh perhatian) */
export const REPORT_STALE_DAYS = 2;

/** Jendela waktu monitoring kendala & mutasi mingguan (7 hari terakhir) */
export const ISSUE_WINDOW_DAYS = 7;

/** Zona waktu operasional proyek: WITA (UTC+8, Bali & Lombok), tanpa DST */
export const TZ_OFFSET_HOURS = 8;
