/**
 * Student Finance Tracker - Search & Sort Logic
 */

/**
 * Filters and sorts records based on user criteria
 * @param {Array} records 
 * @param {Object} criteria 
 * @returns {Array}
 */
export function searchAndSortRecords(records, { query, category, sortType }) {
    let filtered = [...records];

    // Filter by Category
    if (category) {
        filtered = filtered.filter(r => (r.category || '').toLowerCase() === category.toLowerCase());
    }

    // Search by Description
    if (query) {
        filtered = filtered.filter(r => (r.description || '').toLowerCase().includes(query.toLowerCase().trim()));
    }

    // Sort
    filtered.sort((a, b) => {
        switch (sortType) {
            case 'date-asc':
                return new Date(a.date || 0) - new Date(b.date || 0);
            case 'date-desc':
                return new Date(b.date || 0) - new Date(a.date || 0);
            case 'amount-asc':
                return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
            case 'amount-desc':
                return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
            case 'category-asc':
                return (a.category || '').localeCompare(b.category || '');
            case 'category-desc':
                return (b.category || '').localeCompare(a.category || '');
            default:
                return 0;
        }
    });

    return filtered;
}
