/**
 * Student Finance Tracker - State & Constants
 */

export const STORAGE_KEY = 'content_finance_tracker_records';
export const SETTINGS_KEY = 'content_finance_tracker_settings';

export const REGEX = {
    description: /^\S(?:.*\S)?$/,                // No leading/trailing whitespace
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,        // Positive number, max 2 decimals
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/    // Letters, spaces/hyphens allowed
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
