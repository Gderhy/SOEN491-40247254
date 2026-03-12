/**
 * Formatting utilities
 * Shared number / date formatters used across the portfolio UI.
 */

/**
 * Format a number as USD currency with the given decimal places.
 * Example: fmtCurrency(1234.5) => "$1,234.50"
 */
export const fmtCurrency = (n: number, digits = 2): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);

/**
 * Format a number as USD currency with no decimal places (used in charts).
 * Example: fmtCurrencyCompact(1234.5) => "$1,235"
 */
export const fmtCurrencyCompact = (n: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Format a quantity with up to 8 decimal places (for crypto support).
 * Example: fmtQty(0.000123) => "0.000123"
 */
export const fmtQty = (n: number): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(n);

/**
 * Format a Date object as a human-readable string.
 * Example: fmtDate(new Date('2024-01-20')) => "Jan 20, 2024"
 */
export const fmtDate = (d: Date): string =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
