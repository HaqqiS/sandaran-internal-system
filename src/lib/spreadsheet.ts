/**
 * Neutralizes spreadsheet formula injection characters (=, +, -, @, tab, carriage return)
 * preventing malicious formula execution when exported files (.xlsx / .csv) are opened
 * in spreadsheet applications (Microsoft Excel, LibreOffice Calc, etc.).
 */
export function sanitizeSpreadsheetText(
  value: string | null | undefined,
): string {
  if (!value) return "-";
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}
