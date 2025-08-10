/**
 * Integration tests for localStorage with CurriculumContext
 */

import { saveCurriculumState, loadCurriculumState } from '../localStorage';
import { getInitialCurriculumState } from '../../data/initialCurriculum';
import { CurriculumState } from '../../types/curriculum';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
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
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('localStorage integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should handle complete save and load cycle', () => {
    const initialState = getInitialCurriculumState();
    
    // Modify some data
    const modifiedState: CurriculumState = {
      ...initialState,
      weeks: initialState.weeks.map((week, index) => 
        index === 0 
          ? {
              ...week,
              courses: week.courses.map((course, courseIndex) => 
                courseIndex === 0 
                  ? {
                      ...course,
                      completed: true,
                      startDate: new Date('2024-01-01'),
                      endDate: new Date('2024-01-07')
                    }
                  : course
              )
            }
          : week
      )
    };

    // Save the modified state
    const saveResult = saveCurriculumState(modifiedState);
    expect(saveResult).toBe(true);

    // Load the state back
    const loadedState = loadCurriculumState(initialState);
    expect(loadedState).toBeTruthy();
    
    if (loadedState) {
      // Verify the data was preserved
      expect(loadedState.weeks[0].courses[0].completed).toBe(true);
      expect(loadedState.weeks[0].courses[0].startDate).toEqual(new Date('2024-01-01'));
      expect(loadedState.weeks[0].courses[0].endDate).toEqual(new Date('2024-01-07'));
      
      // Verify other courses remain unchanged
      expect(loadedState.weeks[0].courses[1].completed).toBe(false);
      expect(loadedState.weeks[0].courses[1].startDate).toBeUndefined();
      expect(loadedState.weeks[0].courses[1].endDate).toBeUndefined();
    }
  });

  it('should handle partial data updates', () => {
    const initialState = getInitialCurriculumState();
    
    // Save initial state
    saveCurriculumState(initialState);
    
    // Modify only completion status
    const partiallyModifiedState: CurriculumState = {
      ...initialState,
      weeks: initialState.weeks.map((week, index) => 
        index === 0 
          ? {
              ...week,
              courses: week.courses.map((course, courseIndex) => 
                courseIndex === 0 
                  ? { ...course, completed: true }
                  : course
              )
            }
          : week
      )
    };

    // Save the partially modified state
    saveCurriculumState(partiallyModifiedState);

    // Load and verify
    const loadedState = loadCurriculumState(initialState);
    expect(loadedState).toBeTruthy();
    
    if (loadedState) {
      expect(loadedState.weeks[0].courses[0].completed).toBe(true);
      expect(loadedState.weeks[0].courses[0].startDate).toBeUndefined();
      expect(loadedState.weeks[0].courses[0].endDate).toBeUndefined();
    }
  });

  it('should handle multiple weeks and courses', () => {
    const initialState = getInitialCurriculumState();
    
    // Modify data across multiple weeks
    const multiWeekModifiedState: CurriculumState = {
      ...initialState,
      weeks: initialState.weeks.map((week, weekIndex) => ({
        ...week,
        courses: week.courses.map((course, courseIndex) => 
          weekIndex < 2 && courseIndex === 0
            ? {
                ...course,
                completed: true,
                startDate: new Date(`2024-0${weekIndex + 1}-01`),
                endDate: new Date(`2024-0${weekIndex + 1}-07`)
              }
            : course
        )
      }))
    };

    // Save and load
    saveCurriculumState(multiWeekModifiedState);
    const loadedState = loadCurriculumState(initialState);
    
    expect(loadedState).toBeTruthy();
    
    if (loadedState) {
      // Check first week
      expect(loadedState.weeks[0].courses[0].completed).toBe(true);
      expect(loadedState.weeks[0].courses[0].startDate).toEqual(new Date('2024-01-01'));
      
      // Check second week
      expect(loadedState.weeks[1].courses[0].completed).toBe(true);
      expect(loadedState.weeks[1].courses[0].startDate).toEqual(new Date('2024-02-01'));
      
      // Check third week (should be unchanged)
      expect(loadedState.weeks[2].courses[0].completed).toBe(false);
      expect(loadedState.weeks[2].courses[0].startDate).toBeUndefined();
    }
  });
});