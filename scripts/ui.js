import { getRecords, saveRecord, updateRecord, deleteRecord, getSettings, saveSettings } from './storage.js';
import { validateRecord } from './validators.js';
import { searchAndSortRecords, compileRegex } from './search.js';
import { STORAGE_KEY, EXCHANGE_RATES } from './state.js';

// Global Error Handler
window.onerror = function (message, source, lineno, colno, error) {
    console.error(`Error: ${message}\nLine: ${lineno}`, error);
    announce(`A system error occurred: ${message}`, 'assertive');
};

export function announce(message, type = 'polite') {
    const regionId = type === 'assertive' ? 'live-region-assertive' : 'live-region-polite';
    const region = document.getElementById(regionId);
    if (region) {
        region.textContent = ''; // Clear first to force announcement
        setTimeout(() => { region.textContent = message; }, 50);
    }

    // Also inject inline error message if we are on the form page
    const form = document.getElementById('transaction-form');
    if (form) {
        let errorContainer = document.getElementById('form-error-message');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'form-error-message';
            form.prepend(errorContainer);
        }

        errorContainer.textContent = message;
        errorContainer.style.marginTop = '1rem';
        errorContainer.style.padding = '0.75rem';
        errorContainer.style.borderRadius = '0.5rem';
        errorContainer.style.border = '1px solid';
        errorContainer.style.fontSize = '0.875rem';

        if (type === 'assertive') {
            errorContainer.style.backgroundColor = 'var(--color-danger-soft)';
            errorContainer.style.color = 'var(--color-danger)';
            errorContainer.style.borderColor = 'var(--color-danger)';
        } else {
            errorContainer.style.backgroundColor = 'var(--color-primary-soft)';
            errorContainer.style.color = 'var(--color-primary)';
            errorContainer.style.borderColor = 'var(--color-primary)';
        }
    }
}

window.appInitialized = true;

// --- UI FORMATTING & RENDERING ---

export function formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0.00';

    const settings = getSettings();
    const rate = EXCHANGE_RATES[settings.currency] || 1;
    const converted = num * rate;

    const locales = {
        USD: 'en-US',
        EUR: 'de-DE',
        GBP: 'en-GB',
        JPY: 'ja-JP',
        RWF: 'rw-RW'
    };

    return new Intl.NumberFormat(locales[settings.currency] || 'en-US', {
        style: 'currency',
        currency: settings.currency || 'USD'
    }).format(converted);
}

export function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

export function highlight(text, re) {
    if (!re || !text) return text;
    return text.replace(re, m => `<mark class="search-highlight">${m}</mark>`);
}

export function renderTable() {
    const tbody = document.getElementById('records-table-body');
    if (!tbody) return;

    const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const category = document.getElementById('category-filter')?.value || '';
    const sortType = document.getElementById('sort-select')?.value || 'date-desc';

    const allRecords = getRecords();
    const filteredRecords = searchAndSortRecords(allRecords, { query, category, sortType });
    const searchRe = compileRegex(query, 'gi'); // Global for multiple matches

    tbody.innerHTML = '';
    if (filteredRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-8">No records found.</td></tr>';
        announce('No records found matching your search.', 'polite');
        return;
    }

    announce(`${filteredRecords.length} result${filteredRecords.length !== 1 ? 's' : ''} found`, 'polite');

    filteredRecords.forEach(record => {
        const catName = record.category || 'Other';
        const isIncome = catName.toLowerCase() === 'income';
        const amountClass = isIncome ? 'text-success-custom' : 'text-main';
        const amountPrefix = isIncome ? '+' : '-';

        let icon = '📄';
        const lower = catName.toLowerCase();
        if (lower.includes('food')) icon = '🍕';
        else if (lower.includes('transport')) icon = '🚌';
        else if (lower.includes('utilities')) icon = '💡';
        else if (lower.includes('entertainment')) icon = '🎬';
        else if (lower.includes('income')) icon = '💰';
        else if (lower.includes('education')) icon = '📚';

        const tr = document.createElement('tr');
        tr.dataset.id = record.id;
        tr.innerHTML = `
            <td>
                <div class="flex items-center gap-3">
                    <div class="btn-icon bg-surface border border-border icon-32" aria-hidden="true">${icon}</div>
                    <div><strong class="text-main block text-sm record-desc">${highlight(record.description, searchRe)}</strong></div>
                </div>
            </td>
            <td><span class="badge badge-secondary record-cat">${catName}</span></td>
            <td class="text-muted text-sm record-date">${record.date}</td>
            <td class="text-right font-bold ${amountClass} record-amount">${amountPrefix}${formatCurrency(record.amount).replace('$', '')}</td>
            <td class="text-right">
                <div class="flex justify-end gap-2 action-buttons">
                    <button class="btn-icon text-muted hover:text-primary btn-edit" title="Edit">✏️</button>
                    <button class="btn-icon text-muted hover:text-danger btn-delete" title="Delete">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderDashboard() {
    const records = getRecords();
    const income = records.filter(r => (r.category || '').toLowerCase() === 'income').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    const expenses = records.filter(r => (r.category || '').toLowerCase() !== 'income').reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const elBalance = document.getElementById('total-balance');
    const elIncome = document.getElementById('total-income');
    const elExpenses = document.getElementById('total-expenses');

    if (elBalance) elBalance.textContent = formatCurrency(income - expenses);
    if (elIncome) elIncome.textContent = formatCurrency(income);
    if (elExpenses) elExpenses.textContent = formatCurrency(expenses);

    updateSpendingChart(records);
    updateBudgetLimits(records);
}

function updateSpendingChart(records) {
    const chartContainer = document.getElementById('spending-chart');
    if (!chartContainer) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const spendingByDay = [0, 0, 0, 0, 0, 0, 0];

    records.forEach(r => {
        if ((r.category || '').toLowerCase() !== 'income') {
            const date = new Date(r.date);
            if (!isNaN(date)) spendingByDay[date.getDay()] += parseFloat(r.amount || 0);
        }
    });

    const maxSpent = Math.max(...spendingByDay, 1);
    const order = [1, 2, 3, 4, 5, 6, 0];

    chartContainer.innerHTML = '';
    order.forEach(dayIdx => {
        const spent = spendingByDay[dayIdx];
        const heightPct = (spent / maxSpent) * 100;
        const barCol = document.createElement('div');
        barCol.className = 'bar-column';
        barCol.innerHTML = `
            <div class="bar-visual" style="height: ${Math.max(heightPct, 5)}%;" data-value="${formatCurrency(spent)}"></div>
            <span class="bar-label">${days[dayIdx]}</span>
        `;
        chartContainer.appendChild(barCol);
    });
}

function updateBudgetLimits(records) {
    const curMonth = new Date().getMonth();
    const curYear = new Date().getFullYear();

    const monthlySpent = records.filter(r => {
        const d = new Date(r.date);
        return (r.category || '').toLowerCase() !== 'income' && d.getMonth() === curMonth && d.getFullYear() === curYear;
    }).reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const entSpent = records.filter(r => (r.category || '').toLowerCase().includes('entertainment')).reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const updateEl = (id, badgeId, fillId, spent, limit, accent = false) => {
        const pct = Math.min((spent / limit) * 100, 100);
        const elBadge = document.getElementById(badgeId);
        const elFill = document.getElementById(fillId);
        const elSpent = document.getElementById(id);
        if (elBadge) {
            elBadge.textContent = accent && pct >= 90 ? 'Limit Near' : `${Math.round(pct)}% Used`;
            if (accent) elBadge.className = pct >= 90 ? 'badge badge-accent' : 'badge badge-primary';
        }
        if (elFill) elFill.style.width = `${pct}%`;
        if (elSpent) elSpent.textContent = `${formatCurrency(spent)} Spent`;
    };

    updateEl('monthly-budget-spent', 'monthly-budget-badge', 'monthly-budget-fill', monthlySpent, 1000);
    updateEl('entertainment-budget-spent', 'entertainment-budget-badge', 'entertainment-budget-fill', entSpent, 200, true);

    if (monthlySpent > 1000) {
        announce('Alert: You have exceeded your monthly budget limit of $1,000!', 'assertive');
    } else if (monthlySpent > 800) {
        announce('Budget Update: You have used over 800 of your monthly budget.', 'polite');
    }

    if (entSpent > 200) {
        announce('Alert: Entertainment budget limit exceeded!', 'assertive');
    }
}

export function enableInlineEdit(tr, record) {
    tr.classList.add('editing-row');
    tr.querySelector('.record-desc').parentElement.innerHTML = `<input type="text" class="form-input text-sm edit-desc" value="${record.description || ''}">`;
    tr.querySelector('.record-cat').parentElement.innerHTML = `<input type="text" class="form-input text-sm edit-cat" value="${record.category || ''}">`;
    tr.querySelector('.record-date').innerHTML = `<input type="date" class="form-input text-sm edit-date" value="${record.date || ''}">`;
    tr.querySelector('.record-amount').innerHTML = `<input type="number" step="0.01" class="form-input text-sm edit-amount" value="${record.amount || 0}">`;
    tr.querySelector('.action-buttons').innerHTML = `
        <button class="btn btn-primary btn-save-edit" style="padding: 4px 8px; font-size: 0.7rem;">Save</button>
        <button class="btn btn-secondary btn-cancel-edit" style="padding: 4px 8px; font-size: 0.7rem;">Cancel</button>
    `;
}

function initDiagnostics() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            const panel = document.getElementById('diagnostics-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                refreshDiagnostics();
            }
        }
    });

    document.getElementById('btn-show-data')?.addEventListener('click', refreshDiagnostics);

    document.getElementById('btn-clear-storage')?.addEventListener('click', () => {
        if (confirm('REALLY clear ALL records?')) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });
}

function refreshDiagnostics() {
    const data = localStorage.getItem(STORAGE_KEY);
    const pre = document.getElementById('raw-storage-data');
    if (pre) pre.textContent = data || 'Storage is empty';
}

function handleFormSubmit(e) {
    e.preventDefault();
    const data = {
        id: Date.now().toString(),
        amount: document.getElementById('amount-input').value,
        description: document.getElementById('desc-input').value,
        category: document.getElementById('category-input').value,
        date: document.getElementById('date-input').value
    };

    if (validateRecord(data)) {
        // Collapse middle spaces before saving as per requirement
        data.description = data.description.trim().replace(/\s{2,}/g, ' ');
        data.amount = data.amount.trim();
        data.category = data.category.trim().replace(/\s{2,}/g, ' ');

        if (saveRecord(data)) {
            announce('Success: Record Saved!', 'polite');
            setTimeout(() => { window.location.href = 'records.html'; }, 1000);
        }
    }
}

function handleTableActions(e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const tr = btn.closest('tr');
    const id = tr.dataset.id;
    const records = getRecords();
    const record = records.find(r => r.id === id);

    if (btn.classList.contains('btn-delete')) {
        if (confirm('Delete this record?')) {
            deleteRecord(id);
            renderTable();
        }
    } else if (btn.classList.contains('btn-edit')) {
        enableInlineEdit(tr, record);
    } else if (btn.classList.contains('btn-save-edit')) {
        const updated = {
            description: tr.querySelector('.edit-desc').value,
            category: tr.querySelector('.edit-cat').value,
            date: tr.querySelector('.edit-date').value,
            amount: tr.querySelector('.edit-amount').value
        };
        if (validateRecord(updated)) {
            if (updateRecord(id, updated)) renderTable();
        }
    } else if (btn.classList.contains('btn-cancel-edit')) {
        renderTable();
    }
}

function initSettingsPage() {
    const settings = getSettings();

    // Initialize UI state
    const themeToggle = document.getElementById('theme-toggle');
    const currencySelect = document.getElementById('currency-select');

    if (themeToggle) {
        // Initial State
        const isDark = settings.theme === 'dark';
        themeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
        if (isDark) themeToggle.classList.add('active');
        else themeToggle.classList.remove('active');

        themeToggle.addEventListener('click', () => {
            const currentlyDark = themeToggle.getAttribute('aria-checked') === 'true';
            const newIsDark = !currentlyDark;

            themeToggle.setAttribute('aria-checked', newIsDark ? 'true' : 'false');
            themeToggle.classList.toggle('active');

            const newTheme = newIsDark ? 'dark' : 'light';
            const s = getSettings();
            s.theme = newTheme;
            saveSettings(s);
            applyTheme(newTheme);

            announce(`Theme changed to ${newTheme} mode.`, 'polite');
        });
    }

    if (currencySelect) {
        currencySelect.value = settings.currency;
        currencySelect.addEventListener('change', () => {
            const s = getSettings();
            s.currency = currencySelect.value;
            saveSettings(s);
        });
    }

    // Profile
    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        announce('Profile updated successfully!', 'polite');
    });

    // Export
    document.getElementById('export-btn')?.addEventListener('click', () => {
        const data = {
            records: getRecords(),
            settings: getSettings(),
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Import
    const importInput = document.getElementById('import-input');
    const importBtn = document.getElementById('import-btn');

    importBtn?.addEventListener('click', () => importInput?.click());

    importInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Basic Validation
                if (!data.records || !Array.isArray(data.records)) {
                    throw new Error('Invalid format: Missing records array.');
                }

                if (confirm(`Import ${data.records.length} records? This will merge with your current data.`)) {
                    const currentRecords = getRecords();
                    const merged = [...currentRecords, ...data.records];
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

                    if (data.settings) {
                        saveSettings(data.settings);
                    }

                    announce('Import Successful! Reloading...', 'polite');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (err) {
                announce('Import Failed: ' + err.message, 'assertive');
            }
        };
        reader.readAsText(file);
    });

    // Reset
    document.getElementById('reset-btn')?.addEventListener('click', () => {
        if (confirm('DANGER: This will delete ALL your data and reset settings. Continue?')) {
            localStorage.clear();
            location.reload();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const settings = getSettings();
    applyTheme(settings.theme);

    // Form Page
    const form = document.getElementById('transaction-form');
    if (form) {
        const dateInput = document.getElementById('date-input');
        if (dateInput && !dateInput.value) dateInput.valueAsDate = new Date();
        form.addEventListener('submit', handleFormSubmit);
    }

    // Records Page
    const tableBody = document.getElementById('records-table-body');
    if (tableBody) {
        renderTable();
        initDiagnostics();
        tableBody.addEventListener('click', handleTableActions);

        document.getElementById('search-input')?.addEventListener('input', () => renderTable());
        document.getElementById('category-filter')?.addEventListener('change', () => renderTable());
        document.getElementById('sort-select')?.addEventListener('change', () => renderTable());
    }

    // Settings Page
    if (document.getElementById('profile-form')) initSettingsPage();

    // Dashboard
    if (document.getElementById('total-balance')) renderDashboard();
});
