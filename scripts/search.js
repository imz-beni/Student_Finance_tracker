export function compileRegex(input, flags = 'i') {
    try {
        return input ? new RegExp(input, flags) : null;
    } catch (e) {
        return null;
    }
}

export function searchAndSortRecords(records, { query, category, sortType }) {
    let filtered = [...records];

    if (category) {
        filtered = filtered.filter(r => (r.category || '').toLowerCase() === category.toLowerCase());
    }

    if (query) {
        const re = compileRegex(query);
        if (re) {
            filtered = filtered.filter(r => re.test(r.description || ''));
        } else {
            filtered = filtered.filter(r => (r.description || '').toLowerCase().includes(query.toLowerCase().trim()));
        }
    }

    filtered.sort((a, b) => {
        switch (sortType) {
            case 'date-asc': return new Date(a.date || 0) - new Date(b.date || 0);
            case 'date-desc': return new Date(b.date || 0) - new Date(a.date || 0);
            case 'amount-asc': return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
            case 'amount-desc': return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
            case 'category-asc': return (a.category || '').localeCompare(b.category || '');
            case 'category-desc': return (b.category || '').localeCompare(a.category || '');
            default: return 0;
        }
    });

    return filtered;
}