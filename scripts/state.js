/**
 * Student Finance Tracker - State & Constants
 */

export const STORAGE_KEY = 'content_finance_tracker_records';
export const SETTINGS_KEY = 'content_finance_tracker_settings';

export const REGEX = {
    description: /^\S(?:.*\S)?$/,                // No leading/trailing whitespace
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,        // Positive number, max 2 decimals
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,   // Letters, spaces/hyphens allowed
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, // YYYY-MM-DD
    repeatedWords: /\b(\w+)\s+\1\b/i             // Consecutive duplicate words
};

export const EXCHANGE_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.15,
    RWF: 1462.86
};

export const DEFAULT_SETTINGS = {
    theme: 'light',
    currency: 'RWF',
    language: 'en',
    monthlyReport: true,
    displayName: 'Student'
};
