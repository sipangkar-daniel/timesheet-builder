import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'timesheet_persistent_data';

/**
 * Reads the saved data from localStorage.
 * Returns null if nothing saved or parsing fails.
 */
export const loadPersistedData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Saves data to localStorage.
 * Accepts an object with any serialisable fields.
 */
export const savePersistedData = (data) => {
  try {
    const existing = loadPersistedData() || {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {
    // Ignore quota errors silently
  }
};

/**
 * Clears all persisted data from localStorage.
 */
export const clearPersistedData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Hook that auto-saves a value to localStorage whenever it changes,
 * but only when `enabled` (consent) is true.
 *
 * @param {string} key    - Sub-key within the persisted object
 * @param {*}      value  - Current value to persist
 * @param {boolean} enabled - Whether persistence is allowed (cookie consent)
 */
export const useAutoSave = (key, value, enabled) => {
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip the very first render to avoid overwriting loaded data
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (!enabled) return;
    savePersistedData({ [key]: value });
  }, [key, value, enabled]);
};
