/**
 * Student Finance Tracker - State & Constants
 */

export const STORAGE_KEY = 'content_finance_tracker_records';

export const REGEX = {
    description: /^\S(?:.*\S)?$/,                // No leading/trailing whitespace
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,        // Positive number, max 2 decimals
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/    // Letters, spaces/hyphens allowed
};
