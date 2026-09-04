/**
 * Kenyan phone normalization — shared by the checkout server action and
 * its tests. Kept OUT of the "use server" module (which may export only
 * async functions).
 */

export function normalizeKenyanPhone(raw: string): string | null {
  const digits = raw.replace(/[\s()\-]/g, "");
  if (/^\+254(7|1)\d{8}$/.test(digits)) return digits;
  if (/^254(7|1)\d{8}$/.test(digits)) return `+${digits}`;
  if (/^0(7|1)\d{8}$/.test(digits)) return `+254${digits.slice(1)}`;
  return null;
}
