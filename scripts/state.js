export const STORAGE_KEY = 'content_finance_tracker_records';
export const SETTINGS_KEY = 'content_finance_tracker_settings';

export const REGEX = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    repeatedWords: /\b(\w+)\s+\1\b/i
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
