/**
 * Formats a number as currency (e.g., USD)
 * @param {number} amount - The amount to format
 * @returns {string} - The formatted currency string
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    amount = 0;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats a date string
 * @param {string | Date} dateString - The date to format
 * @returns {string} - The formatted date string (e.g., "October 31, 2025")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
