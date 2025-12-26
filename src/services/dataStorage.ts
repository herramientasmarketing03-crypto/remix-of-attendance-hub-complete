// Data persistence service using localStorage

const STORAGE_PREFIX = 'attendancehub_';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
  } catch (error) {
    console.error(`Error saving to storage [${key}]:`, error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const serialized = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Error loading from storage [${key}]:`, error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Error removing from storage [${key}]:`, error);
  }
}

export function clearAllStorage(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  MESSAGES: 'messages',
  SANCTIONS: 'sanctions',
  VACATIONS: 'vacations',
  PERMISSIONS: 'permissions',
  JUSTIFICATIONS: 'justifications',
  SETTINGS: 'settings',
  AUDIT_LOGS: 'audit_logs',
  PAYSLIPS: 'payslips',
  EVALUATIONS: 'evaluations',
  BIOMETRIC_RESULTS: 'biometric_results',
} as const;
