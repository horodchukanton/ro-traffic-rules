import { useCallback, useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage interactions
 * This hook provides a centralized way to interact with localStorage
 * and ensures consistent data handling across the application.
 * Includes fallback mechanisms when localStorage is unavailable.
 */
function useStorage() {
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);
  const [fallbackStorage, setFallbackStorage] = useState(new Map());

  // Check localStorage availability on mount
  useEffect(() => {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      setIsStorageAvailable(true);
    } catch (error) {
      console.warn('localStorage is not available, using in-memory fallback:', error);
      setIsStorageAvailable(false);
    }
  }, []);

  /**
   * Get an item from localStorage or fallback storage
   * @param {string} key - The storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} The stored value or default value
   */
  const getItem = useCallback((key, defaultValue = null) => {
    try {
      if (isStorageAvailable) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } else {
        // Use fallback in-memory storage
        const item = fallbackStorage.get(key);
        return item !== undefined ? item : defaultValue;
      }
    } catch (error) {
      console.error(`Error reading storage key "${key}":`, error);
      return defaultValue;
    }
  }, [isStorageAvailable, fallbackStorage]);

  /**
   * Set an item in localStorage or fallback storage
   * @param {string} key - The storage key
   * @param {*} value - The value to store
   * @returns {boolean} - True if storage was successful
   */
  const setItem = useCallback((key, value) => {
    try {
      if (isStorageAvailable) {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } else {
        // Use fallback in-memory storage
        setFallbackStorage(prev => new Map(prev.set(key, value)));
        return true;
      }
    } catch (error) {
      console.error(`Error setting storage key "${key}":`, error);
      
      // If localStorage fails due to quota, try fallback
      if (error.name === 'QuotaExceededError' && isStorageAvailable) {
        console.warn('localStorage quota exceeded, switching to in-memory storage');
        setIsStorageAvailable(false);
        setFallbackStorage(prev => new Map(prev.set(key, value)));
        return true;
      }
      return false;
    }
  }, [isStorageAvailable]);

  /**
   * Remove an item from localStorage or fallback storage
   * @param {string} key - The storage key
   * @returns {boolean} - True if removal was successful
   */
  const removeItem = useCallback(key => {
    try {
      if (isStorageAvailable) {
        window.localStorage.removeItem(key);
      } else {
        setFallbackStorage(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      }
      return true;
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error);
      return false;
    }
  }, [isStorageAvailable]);

  /**
   * Clear all items from localStorage or fallback storage
   * @returns {boolean} - True if clearing was successful
   */
  const clear = useCallback(() => {
    try {
      if (isStorageAvailable) {
        window.localStorage.clear();
      } else {
        setFallbackStorage(new Map());
      }
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }, [isStorageAvailable]);

  return {
    getItem,
    setItem,
    removeItem,
    clear,
    isStorageAvailable,
  };
}

export default useStorage;
