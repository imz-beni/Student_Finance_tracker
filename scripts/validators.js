import { REGEX } from './state.js';
import { announce } from './ui.js';

/**
 * Validates record data against predefined regex patterns
 * @param {Object} data 
 * @returns {boolean}
 */
export function validateRecord(data) {
    if (!REGEX.description.test(data.description)) {
        announce('Invalid Description: Cannot be empty or start/end with whitespace.', 'assertive');
        return false;
    }

    // Advanced Regex Check: Repeated Words
    if (REGEX.repeatedWords.test(data.description)) {
        announce('Warning: Your description contains repeated consecutive words.', 'polite');
        // We allow this, so we don't return false
    }

    if (!REGEX.amount.test(data.amount)) {
        announce('Invalid Amount: Must be a positive number with up to 2 decimal places.', 'assertive');
        return false;
    }
    if (!REGEX.category.test(data.category)) {
        announce('Invalid Category: Only letters, spaces, and hyphens allowed.', 'assertive');
        return false;
    }

    // 4th Regex Rule: Date Validation
    if (!REGEX.date.test(data.date)) {
        announce('Invalid Date: Please use YYYY-MM-DD format.', 'assertive');
        return false;
    }

    return true;
}
