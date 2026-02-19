/**
 * Student Finance Tracker - Validation Logic
 */

import { REGEX } from './state.js';

/**
 * Validates record data against predefined regex patterns
 * @param {Object} data 
 * @returns {boolean}
 */
export function validateRecord(data) {
    if (!REGEX.description.test(data.description)) {
        alert('Invalid Description: Cannot be empty or start/end with whitespace.');
        return false;
    }
    if (!REGEX.amount.test(data.amount)) {
        alert('Invalid Amount: Must be a positive number with up to 2 decimal places.');
        return false;
    }
    if (!REGEX.category.test(data.category)) {
        alert('Invalid Category: Only letters, spaces, and hyphens allowed.');
        return false;
    }
    if (!data.date) {
        alert('Invalid Date: Please select a date.');
        return false;
    }
    return true;
}
