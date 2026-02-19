/**
 * Student Finance Tracker - Storage Logic
 */

import { STORAGE_KEY } from './state.js';

/**
 * Get all records from LocalStorage
 * @returns {Array} Array of record objects
 */
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

/**
 * Save a new record
 * @param {Object} record 
 */
export function saveRecord(record) {
    try {
        const records = getRecords();
        records.push(record);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return true;
    } catch (e) {
        console.error('Failed to save record to storage:', e);
        alert('Storage error: Could not save your record.');
        return false;
    }
}

/**
 * Update an existing record by ID
 * @param {string} id 
 * @param {Object} updatedData 
 */
export function updateRecord(id, updatedData) {
    try {
        let records = getRecords();
        const index = records.findIndex(r => String(r.id) === String(id));
        if (index !== -1) {
            records[index] = { ...records[index], ...updatedData };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
            return true;
        }
    } catch (e) {
        console.error('Failed to update record in storage:', e);
    }
    return false;
}

/**
 * Delete a record by ID
 * @param {string} id 
 */
export function deleteRecord(id) {
    try {
        let records = getRecords();
        records = records.filter(r => String(r.id) !== String(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
        console.error('Failed to delete record from storage:', e);
    }
}
