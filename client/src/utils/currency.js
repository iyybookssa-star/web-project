/**
 * Currency utility — Saudi Riyal (SAR)
 *
 * Usage:
 *   import { formatPrice, SAR_SYMBOL } from '../utils/currency';
 *   formatPrice(149.99)  → "149.99 SAR"
 */

export const SAR_SYMBOL = 'SAR';

/**
 * Format a number as Saudi Riyal price (string version for non-React contexts like PDFs).
 * @param {number} amount - the price value
 * @param {number} [decimals=2] - decimal places
 * @returns {string} formatted price, e.g. "149.99 SAR"
 */
export function formatPrice(amount, decimals = 2) {
    return `${Number(amount).toFixed(decimals)} ${SAR_SYMBOL}`;
}
