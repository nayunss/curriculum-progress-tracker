/**
 * LocalStorage utilities for curriculum progress tracker
 * Handles data persistence, validation, and error handling
 */

import { CurriculumState, StoredData, Week, Course } from '../types/curriculum';

// Constants
const STORAGE_KEY = 'curriculum-progress-tracker';
const STORAGE_VERSION = '1.0.0';

/**
 * Check if localStorage is available
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('LocalStorage is not available:', error);
    return false;
  }
};

/**
 * Validate stored data structure
 */
const validateStoredData = (data: unknown): data is StoredData => {
  if (!data || typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (!obj.version || !obj.lastUpdated || !obj.curriculum) {
    return false;
  }

  // Check curriculum structure
  if (typeof obj.curriculum !== 'object' || obj.curriculum === null) {
    return false;
  }

  const curriculum = obj.curriculum as Record<string, unknown>;

  // Validate curriculum data structure
  for (const weekId in curriculum) {
    const weekData = curriculum[weekId];
    if (typeof weekData !== 'object' || weekData === null) {
      return false;
    }

    const weekObj = weekData as Record<string, unknown>;

    for (const courseId in weekObj) {
      const courseData = weekObj[courseId];
      if (typeof courseData !== 'object' || courseData === null) {
        return false;
      }

      const courseObj = courseData as Record<string, unknown>;

      // Check required fields
      if (typeof courseObj.completed !== 'boolean') {
        return false;
      }

      // Check optional date fields
      if (courseObj.startDate && typeof courseObj.startDate !== 'string') {
        return false;
      }

      if (courseObj.endDate && typeof courseObj.endDate !== 'string') {
        return false;
      }
    }
  }

  return true;
};

/**
 * Convert CurriculumState to StoredData format
 */
const curriculumStateToStoredData = (state: CurriculumState): StoredData => {
  const curriculum: StoredData['curriculum'] = {};

  state.weeks.forEach(week => {
    curriculum[week.id.toString()] = {};
    
    week.courses.forEach(course => {
      curriculum[week.id.toString()][course.id] = {
        startDate: course.startDate?.toISOString(),
        endDate: course.endDate?.toISOString(),
        completed: course.completed
      };
    });
  });

  return {
    version: STORAGE_VERSION,
    lastUpdated: new Date().toISOString(),
    curriculum
  };
};

/**
 * Convert StoredData to CurriculumState format
 */
const storedDataToCurriculumState = (storedData: StoredData, initialState: CurriculumState): CurriculumState => {
  const updatedWeeks: Week[] = initialState.weeks.map(week => {
    const weekData = storedData.curriculum[week.id.toString()];
    if (!weekData) {
      return week;
    }

    const updatedCourses: Course[] = week.courses.map(course => {
      const courseData = weekData[course.id];
      if (!courseData) {
        return course;
      }

      return {
        ...course,
        startDate: courseData.startDate ? new Date(courseData.startDate) : undefined,
        endDate: courseData.endDate ? new Date(courseData.endDate) : undefined,
        completed: courseData.completed
      };
    });

    return {
      ...week,
      courses: updatedCourses
    };
  });

  // Calculate progress (will be recalculated by the reducer)
  return {
    weeks: updatedWeeks,
    overallProgress: 0
  };
};

/**
 * Save curriculum state to localStorage
 */
export const saveCurriculumState = (state: CurriculumState): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn('Cannot save curriculum state: localStorage not available');
    return false;
  }

  try {
    const storedData = curriculumStateToStoredData(state);
    const serializedData = JSON.stringify(storedData);
    
    localStorage.setItem(STORAGE_KEY, serializedData);
    console.log('Curriculum state saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save curriculum state:', error);
    
    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, attempting to clear old data');
      try {
        // Clear the storage and try again
        localStorage.removeItem(STORAGE_KEY);
        const storedData = curriculumStateToStoredData(state);
        const serializedData = JSON.stringify(storedData);
        localStorage.setItem(STORAGE_KEY, serializedData);
        console.log('Curriculum state saved after clearing old data');
        return true;
      } catch (retryError) {
        console.error('Failed to save even after clearing storage:', retryError);
        return false;
      }
    }
    
    return false;
  }
};

/**
 * Load curriculum state from localStorage
 */
export const loadCurriculumState = (initialState: CurriculumState): CurriculumState | null => {
  if (!isLocalStorageAvailable()) {
    console.warn('Cannot load curriculum state: localStorage not available');
    return null;
  }

  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    
    if (!serializedData) {
      console.log('No saved curriculum state found');
      return null;
    }

    const parsedData = JSON.parse(serializedData);
    
    if (!validateStoredData(parsedData)) {
      console.warn('Invalid stored data format, using initial state');
      // Clear invalid data
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Check version compatibility
    if (parsedData.version !== STORAGE_VERSION) {
      console.warn(`Version mismatch: stored ${parsedData.version}, expected ${STORAGE_VERSION}`);
      // For now, clear incompatible data. In the future, we could implement migration
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const curriculumState = storedDataToCurriculumState(parsedData, initialState);
    console.log('Curriculum state loaded successfully');
    return curriculumState;
  } catch (error) {
    console.error('Failed to load curriculum state:', error);
    
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Cleared corrupted localStorage data');
    } catch (clearError) {
      console.error('Failed to clear corrupted data:', clearError);
    }
    
    return null;
  }
};

/**
 * Clear all stored curriculum data
 */
export const clearCurriculumState = (): boolean => {
  if (!isLocalStorageAvailable()) {
    console.warn('Cannot clear curriculum state: localStorage not available');
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Curriculum state cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear curriculum state:', error);
    return false;
  }
};

/**
 * Get storage info (for debugging/monitoring)
 */
export const getStorageInfo = (): { hasData: boolean; lastUpdated?: string; version?: string; size?: number } => {
  if (!isLocalStorageAvailable()) {
    return { hasData: false };
  }

  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    
    if (!serializedData) {
      return { hasData: false };
    }

    const parsedData = JSON.parse(serializedData);
    
    return {
      hasData: true,
      lastUpdated: parsedData.lastUpdated,
      version: parsedData.version,
      size: serializedData.length
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { hasData: false };
  }
};