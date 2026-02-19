/**
 * Student Finance Tracker - UI & App Entry Point
 */

import { getRecords, saveRecord, updateRecord, deleteRecord } from './storage.js';
import { validateRecord } from './validators.js';
import { searchAndSortRecords } from './search.js';
import { STORAGE_KEY } from './state.js';

// --- CONFIGURATION & ERRORS ---

// Global Error Handler
window.onerror = function (message, source, lineno, colno, error) {
    console.error(`Error: ${message}\nLine: ${lineno}`, error);
};

window.appInitialized = true;

// --- UI FORMATTING & RENDERING ---

/**
 * Format number as currency
 * @param {any} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(num);
}

/**
 * Render the records table with filtering and sorting
 */
export function renderTable() {
    const tbody = document.getElementById('records-table-body');
    if (!tbody) return;

    const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    const category = document.getElementById('category-filter')?.value || '';
    const sortType = document.getElementById('sort-select')?.value || 'date-desc';

    const allRecords = getRecords();
    const filteredRecords = searchAndSortRecords(allRecords, { query, category, sortType });

    tbody.innerHTML = '';
    if (filteredRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-8">No records found.</td></tr>';
        return;
    }

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
                    <div class="btn-icon bg-surface border border-border icon-32">${icon}</div>
                    <div><strong class="text-main block text-sm record-desc">${record.description}</strong></div>
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

/**
 * Render basic stats on the dashboard
 */
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

// --- EVENT HANDLERS ---

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
        amount: document.getElementById('amount-input').value.trim(),
        description: document.getElementById('desc-input').value.trim(),
        category: document.getElementById('category-input').value.trim(),
        date: document.getElementById('date-input').value
    };

    if (validateRecord(data)) {
        if (saveRecord(data)) {
            alert('Record Saved!');
            window.location.href = 'records.html';
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
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', () => toggle.classList.toggle('active'));
    });
    document.getElementById('profile-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Profile saved!');
    });
}

// --- APP INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
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
