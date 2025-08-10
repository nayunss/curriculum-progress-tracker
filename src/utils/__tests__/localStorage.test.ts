/**
 * Tests for localStorage utilities
 */

import { 
  saveCurriculumState, 
  loadCurriculumState, 
  clearCurriculumState, 
  getStorageInfo 
} from '../localStorage';
import { CurriculumState } from '../../types/curriculum';

// Mock localStorage
interface MockLocalStorage extends Storage {
  _setShouldThrowError: (should: boolean, error?: Error) => void;
  _getStore: () => Record<string, string>;
}

const localStorageMock: MockLocalStorage = (() => {
  let store: Record<string, string> = {};
  let shouldThrowError = false;
  let errorToThrow: Error | null = null;

  return {
    getItem: (key: string) => {
      if (shouldThrowError && errorToThrow) {
        throw errorToThrow;
      }
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      if (shouldThrowError && errorToThrow) {
        throw errorToThrow;
      }
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      if (shouldThrowError && errorToThrow) {
        throw errorToThrow;
      }
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    // Test helpers
    _setShouldThrowError: (should: boolean, error?: Error) => {
      shouldThrowError = should;
      errorToThrow = error || null;
    },
    _getStore: () => ({ ...store })
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Test data
const mockCurriculumState: CurriculumState = {
  weeks: [
    {
      id: 1,
      title: "1주차",
      courses: [
        { 
          id: "1-1", 
          name: "Test Course 1", 
          completed: true,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-07')
        },
        { 
          id: "1-2", 
          name: "Test Course 2", 
          completed: false 
        }
      ],
      progress: 50
    }
  ],
  overallProgress: 50
};

const initialState: CurriculumState = {
  weeks: [
    {
      id: 1,
      title: "1주차",
      courses: [
        { id: "1-1", name: "Test Course 1", completed: false },
        { id: "1-2", name: "Test Course 2", completed: false }
      ],
      progress: 0
    }
  ],
  overallProgress: 0
};

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock._setShouldThrowError(false);
  });

  describe('saveCurriculumState', () => {
    it('should save curriculum state successfully', () => {
      const result = saveCurriculumState(mockCurriculumState);
      expect(result).toBe(true);
      
      const stored = localStorageMock.getItem('curriculum-progress-tracker');
      expect(stored).toBeTruthy();
      
      const parsedData = JSON.parse(stored!);
      expect(parsedData.version).toBe('1.0.0');
      expect(parsedData.curriculum).toBeDefined();
      expect(parsedData.lastUpdated).toBeDefined();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      localStorageMock._setShouldThrowError(true, new Error('Storage error'));

      const result = saveCurriculumState(mockCurriculumState);
      expect(result).toBe(false);

      // Reset mock
      localStorageMock._setShouldThrowError(false);
    });

    it('should handle quota exceeded error', () => {
      // Mock localStorage to throw QuotaExceededError on first call, succeed on second
      let callCount = 0;
      const originalSetItem = localStorageMock.setItem;
      
      // Override both setItem and the test key check
      localStorageMock.setItem = (key: string, value: string) => {
        callCount++;
        if (key === '__localStorage_test__') {
          // Allow test key to work normally
          originalSetItem.call(localStorageMock, key, value);
          return;
        }
        
        if (callCount === 1) {
          const error = new Error('Quota exceeded');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // Second call should succeed - call original implementation
        originalSetItem.call(localStorageMock, key, value);
      };

      const result = saveCurriculumState(mockCurriculumState);
      expect(result).toBe(true);
      expect(callCount).toBe(2);

      // Restore original method
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('loadCurriculumState', () => {
    it('should load curriculum state successfully', () => {
      // First save some data
      saveCurriculumState(mockCurriculumState);
      
      // Then load it
      const loadedState = loadCurriculumState(initialState);
      expect(loadedState).toBeTruthy();
      expect(loadedState!.weeks).toHaveLength(1);
      expect(loadedState!.weeks[0].courses[0].completed).toBe(true);
      expect(loadedState!.weeks[0].courses[0].startDate).toEqual(new Date('2024-01-01'));
      expect(loadedState!.weeks[0].courses[0].endDate).toEqual(new Date('2024-01-07'));
    });

    it('should return null when no data exists', () => {
      const loadedState = loadCurriculumState(initialState);
      expect(loadedState).toBeNull();
    });

    it('should handle corrupted data gracefully', () => {
      // Store invalid JSON
      localStorageMock.setItem('curriculum-progress-tracker', 'invalid json');
      
      const loadedState = loadCurriculumState(initialState);
      expect(loadedState).toBeNull();
      
      // Should clear corrupted data
      const stored = localStorageMock.getItem('curriculum-progress-tracker');
      expect(stored).toBeNull();
    });

    it('should handle invalid data structure', () => {
      // Store valid JSON but invalid structure
      localStorageMock.setItem('curriculum-progress-tracker', JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        curriculum: 'invalid structure'
      }));
      
      const loadedState = loadCurriculumState(initialState);
      expect(loadedState).toBeNull();
    });

    it('should handle version mismatch', () => {
      // Store data with different version
      const invalidVersionData = {
        version: '2.0.0',
        lastUpdated: new Date().toISOString(),
        curriculum: {}
      };
      localStorageMock.setItem('curriculum-progress-tracker', JSON.stringify(invalidVersionData));
      
      const loadedState = loadCurriculumState(initialState);
      expect(loadedState).toBeNull();
    });
  });

  describe('clearCurriculumState', () => {
    it('should clear stored data successfully', () => {
      // First save some data
      saveCurriculumState(mockCurriculumState);
      expect(localStorageMock.getItem('curriculum-progress-tracker')).toBeTruthy();
      
      // Then clear it
      const result = clearCurriculumState();
      expect(result).toBe(true);
      expect(localStorageMock.getItem('curriculum-progress-tracker')).toBeNull();
    });
  });

  describe('getStorageInfo', () => {
    it('should return correct info when data exists', () => {
      saveCurriculumState(mockCurriculumState);
      
      const info = getStorageInfo();
      expect(info.hasData).toBe(true);
      expect(info.version).toBe('1.0.0');
      expect(info.lastUpdated).toBeDefined();
      expect(info.size).toBeGreaterThan(0);
    });

    it('should return correct info when no data exists', () => {
      const info = getStorageInfo();
      expect(info.hasData).toBe(false);
      expect(info.version).toBeUndefined();
      expect(info.lastUpdated).toBeUndefined();
      expect(info.size).toBeUndefined();
    });

    it('should handle corrupted data gracefully', () => {
      localStorageMock.setItem('curriculum-progress-tracker', 'invalid json');
      
      const info = getStorageInfo();
      expect(info.hasData).toBe(false);
    });
  });
});