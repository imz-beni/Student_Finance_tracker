import { REGEX } from './state.js';
import { announce } from './ui.js';

export function validateRecord(data) {
    if (!REGEX.description.test(data.description)) {
        announce('Invalid Description: Cannot be empty or start/end with whitespace.', 'assertive');
        return false;
    }

    if (REGEX.repeatedWords.test(data.description)) {
        announce('Warning: Your description contains repeated consecutive words.', 'polite');
    }

    if (!REGEX.amount.test(data.amount)) {
        announce('Invalid Amount: Must be a positive number with up to 2 decimal places.', 'assertive');
        return false;
    }
    if (!REGEX.category.test(data.category)) {
        announce('Invalid Category: Only letters, spaces, and hyphens allowed.', 'assertive');
        return false;
    }

    if (!REGEX.date.test(data.date)) {
        announce('Invalid Date: Please use YYYY-MM-DD format.', 'assertive');
        return false;
    }

    return true;
}
