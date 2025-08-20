import { useCallback } from 'react';

/**
 * Custom hook for managing localStorage interactions
 * This hook provides a centralized way to interact with localStorage
 * and ensures consistent data handling across the application
 */
function useStorage() {
  /**
   * Get an item from localStorage
   * @param {string} key - The storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} The stored value or default value
   */
  const getItem = useCallback((key, defaultValue = null) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, []);

  /**
   * Set an item in localStorage
   * @param {string} key - The storage key
   * @param {*} value - The value to store
   */
  const setItem = useCallback((key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, []);

  /**
   * Remove an item from localStorage
   * @param {string} key - The storage key
   */
  const removeItem = useCallback(key => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, []);

  /**
   * Clear all items from localStorage
   */
  const clear = useCallback(() => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);

  return {
    getItem,
    setItem,
    removeItem,
    clear,
  };
}

export default useStorage;
