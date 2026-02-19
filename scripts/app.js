/**
 * Student Finance Tracker - Main Module entry point
 */

import { getRecords, saveRecord, updateRecord, deleteRecord } from './storage.js';
import { validateRecord } from './validators.js';
import { renderTable, renderDashboard, enableInlineEdit } from './ui.js';
import { STORAGE_KEY } from './state.js';

// Global Error Handler
window.onerror = function (message, source, lineno, colno, error) {
    console.error(`Error: ${message}\nLine: ${lineno}`, error);
};

window.appInitialized = true;

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
