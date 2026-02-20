import { STORAGE_KEY, SETTINGS_KEY, DEFAULT_SETTINGS } from './state.js';

export function getRecords() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Failed to parse records from storage:', e);
        return [];
    }
}

export function saveRecord(record) {
    try {
        const records = getRecords();
        const now = new Date().toISOString();
        const newRecord = {
            ...record,
            createdAt: now,
            updatedAt: now
        };
        records.push(newRecord);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return true;
    } catch (e) {
        console.error('Failed to save record to storage:', e);
        return false;
    }
}

export function updateRecord(id, updatedData) {
    try {
        let records = getRecords();
        const index = records.findIndex(r => String(r.id) === String(id));
        if (index !== -1) {
            const now = new Date().toISOString();
            records[index] = {
                ...records[index],
                ...updatedData,
                updatedAt: now
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
            return true;
        }
    } catch (e) {
        console.error('Failed to update record in storage:', e);
    }
    return false;
}

export function deleteRecord(id) {
    try {
        let records = getRecords();
        records = records.filter(r => String(r.id) !== String(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
        console.error('Failed to delete record from storage:', e);
    }
}

export function getSettings() {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
        console.error('Failed to parse settings:', e);
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (e) {
        console.error('Failed to save settings:', e);
        return false;
    }
}
