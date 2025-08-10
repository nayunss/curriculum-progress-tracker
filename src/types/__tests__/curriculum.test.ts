import { describe, it, expect } from 'vitest';
import type { 
  Course, 
  Week, 
  CurriculumState, 
  CurriculumAction, 
  CurriculumActionType,
  StoredData 
} from '../curriculum';

describe('Curriculum Types', () => {
  describe('Course interface', () => {
    it('should accept valid course object', () => {
      const course: Course = {
        id: 'test-1',
        name: 'Test Course',
        completed: false
      };
      
      expect(course.id).toBe('test-1');
      expect(course.name).toBe('Test Course');
      expect(course.completed).toBe(false);
      expect(course.startDate).toBeUndefined();
      expect(course.endDate).toBeUndefined();
    });

    it('should accept course with dates', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');
      
      const course: Course = {
        id: 'test-2',
        name: 'Course with Dates',
        startDate,
        endDate,
        completed: true
      };
      
      expect(course.startDate).toBe(startDate);
      expect(course.endDate).toBe(endDate);
      expect(course.completed).toBe(true);
    });

    it('should enforce required properties', () => {
      // These should compile without errors
      const validCourse: Course = {
        id: 'required-test',
        name: 'Required Properties Test',
        completed: false
      };
      
      expect(validCourse).toBeDefined();
      
      // TypeScript should catch missing required properties at compile time
      // @ts-expect-error - Missing required properties
      const invalidCourse: Course = {
        id: 'invalid'
        // Missing name and completed
      };
      
      expect(invalidCourse).toBeDefined(); // This line won't execute due to TS error
    });
  });

  describe('Week interface', () => {
    it('should accept valid week object', () => {
      const courses: Course[] = [
        { id: '1-1', name: 'Course 1', completed: false },
        { id: '1-2', name: 'Course 2', completed: true }
      ];
      
      const week: Week = {
        id: 1,
        title: '1주차',
        courses,
        progress: 50
      };
      
      expect(week.id).toBe(1);
      expect(week.title).toBe('1주차');
      expect(week.courses).toHaveLength(2);
      expect(week.progress).toBe(50);
    });

    it('should accept week with empty courses array', () => {
      const week: Week = {
        id: 2,
        title: '2주차',
        courses: [],
        progress: 0
      };
      
      expect(week.courses).toHaveLength(0);
      expect(week.progress).toBe(0);
    });

    it('should enforce numeric id and progress', () => {
      const week: Week = {
        id: 1,
        title: 'Test Week',
        courses: [],
        progress: 100
      };
      
      expect(typeof week.id).toBe('number');
      expect(typeof week.progress).toBe('number');
    });
  });

  describe('CurriculumState interface', () => {
    it('should accept valid curriculum state', () => {
      const weeks: Week[] = [
        {
          id: 1,
          title: '1주차',
          courses: [
            { id: '1-1', name: 'Course 1', completed: true }
          ],
          progress: 100
        }
      ];
      
      const state: CurriculumState = {
        weeks,
        overallProgress: 100
      };
      
      expect(state.weeks).toHaveLength(1);
      expect(state.overallProgress).toBe(100);
    });

    it('should accept empty curriculum state', () => {
      const state: CurriculumState = {
        weeks: [],
        overallProgress: 0
      };
      
      expect(state.weeks).toHaveLength(0);
      expect(state.overallProgress).toBe(0);
    });
  });

  describe('CurriculumActionType', () => {
    it('should include all expected action types', () => {
      const actionTypes: CurriculumActionType[] = [
        'SET_START_DATE',
        'SET_END_DATE',
        'TOGGLE_COMPLETION',
        'LOAD_DATA'
      ];
      
      actionTypes.forEach(type => {
        expect(typeof type).toBe('string');
      });
      
      // Test that each type can be assigned
      const setStartDate: CurriculumActionType = 'SET_START_DATE';
      const setEndDate: CurriculumActionType = 'SET_END_DATE';
      const toggleCompletion: CurriculumActionType = 'TOGGLE_COMPLETION';
      const loadData: CurriculumActionType = 'LOAD_DATA';
      
      expect(setStartDate).toBe('SET_START_DATE');
      expect(setEndDate).toBe('SET_END_DATE');
      expect(toggleCompletion).toBe('TOGGLE_COMPLETION');
      expect(loadData).toBe('LOAD_DATA');
    });
  });

  describe('CurriculumAction interface', () => {
    it('should accept SET_START_DATE action', () => {
      const action: CurriculumAction = {
        type: 'SET_START_DATE',
        payload: {
          weekId: 1,
          courseId: '1-1',
          date: new Date('2024-01-01')
        }
      };
      
      expect(action.type).toBe('SET_START_DATE');
      expect(action.payload.weekId).toBe(1);
      expect(action.payload.courseId).toBe('1-1');
      expect(action.payload.date).toBeInstanceOf(Date);
    });

    it('should accept SET_END_DATE action', () => {
      const action: CurriculumAction = {
        type: 'SET_END_DATE',
        payload: {
          weekId: 2,
          courseId: '2-1',
          date: new Date('2024-01-07')
        }
      };
      
      expect(action.type).toBe('SET_END_DATE');
      expect(action.payload.weekId).toBe(2);
      expect(action.payload.courseId).toBe('2-1');
    });

    it('should accept TOGGLE_COMPLETION action', () => {
      const action: CurriculumAction = {
        type: 'TOGGLE_COMPLETION',
        payload: {
          weekId: 1,
          courseId: '1-2'
        }
      };
      
      expect(action.type).toBe('TOGGLE_COMPLETION');
      expect(action.payload.weekId).toBe(1);
      expect(action.payload.courseId).toBe('1-2');
      expect(action.payload.date).toBeUndefined();
    });

    it('should accept LOAD_DATA action', () => {
      const data: CurriculumState = {
        weeks: [],
        overallProgress: 0
      };
      
      const action: CurriculumAction = {
        type: 'LOAD_DATA',
        payload: {
          data
        }
      };
      
      expect(action.type).toBe('LOAD_DATA');
      expect(action.payload.data).toBe(data);
    });

    it('should accept action with empty payload', () => {
      const action: CurriculumAction = {
        type: 'TOGGLE_COMPLETION',
        payload: {}
      };
      
      expect(action.payload).toEqual({});
    });
  });

  describe('StoredData interface', () => {
    it('should accept valid stored data structure', () => {
      const storedData: StoredData = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        curriculum: {
          '1': {
            '1-1': {
              startDate: '2024-01-01T00:00:00.000Z',
              endDate: '2024-01-07T00:00:00.000Z',
              completed: true
            },
            '1-2': {
              completed: false
            }
          }
        }
      };
      
      expect(storedData.version).toBe('1.0.0');
      expect(storedData.lastUpdated).toBe('2024-01-01T00:00:00.000Z');
      expect(storedData.curriculum['1']['1-1'].completed).toBe(true);
      expect(storedData.curriculum['1']['1-2'].startDate).toBeUndefined();
    });

    it('should accept stored data with empty curriculum', () => {
      const storedData: StoredData = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        curriculum: {}
      };
      
      expect(Object.keys(storedData.curriculum)).toHaveLength(0);
    });

    it('should enforce string dates in stored data', () => {
      const storedData: StoredData = {
        version: '1.0.0',
        lastUpdated: '2024-01-01T00:00:00.000Z',
        curriculum: {
          '1': {
            '1-1': {
              startDate: '2024-01-01T00:00:00.000Z',
              endDate: '2024-01-07T00:00:00.000Z',
              completed: true
            }
          }
        }
      };
      
      const courseData = storedData.curriculum['1']['1-1'];
      expect(typeof courseData.startDate).toBe('string');
      expect(typeof courseData.endDate).toBe('string');
      expect(typeof courseData.completed).toBe('boolean');
    });
  });

  describe('Type compatibility and relationships', () => {
    it('should allow Course objects in Week.courses array', () => {
      const course: Course = {
        id: 'test',
        name: 'Test Course',
        completed: false
      };
      
      const week: Week = {
        id: 1,
        title: 'Test Week',
        courses: [course],
        progress: 0
      };
      
      expect(week.courses[0]).toBe(course);
    });

    it('should allow Week objects in CurriculumState.weeks array', () => {
      const week: Week = {
        id: 1,
        title: 'Test Week',
        courses: [],
        progress: 0
      };
      
      const state: CurriculumState = {
        weeks: [week],
        overallProgress: 0
      };
      
      expect(state.weeks[0]).toBe(week);
    });

    it('should allow CurriculumState in action payload', () => {
      const state: CurriculumState = {
        weeks: [],
        overallProgress: 0
      };
      
      const action: CurriculumAction = {
        type: 'LOAD_DATA',
        payload: {
          data: state
        }
      };
      
      expect(action.payload.data).toBe(state);
    });
  });

  describe('Requirements verification', () => {
    it('should support all required data structures for requirements', () => {
      // Requirement 1.1, 1.2: Overall progress tracking
      const state: CurriculumState = {
        weeks: [],
        overallProgress: 0
      };
      expect(typeof state.overallProgress).toBe('number');
      
      // Requirement 2.1, 2.2: Week-based organization
      const week: Week = {
        id: 1,
        title: '1주차',
        courses: [],
        progress: 0
      };
      expect(typeof week.id).toBe('number');
      expect(typeof week.progress).toBe('number');
      
      // Requirement 3.1, 3.2: Course date management
      const course: Course = {
        id: '1-1',
        name: 'Test Course',
        startDate: new Date(),
        endDate: new Date(),
        completed: false
      };
      expect(course.startDate).toBeInstanceOf(Date);
      expect(course.endDate).toBeInstanceOf(Date);
      
      // Requirement 4.1, 4.2: Completion tracking
      expect(typeof course.completed).toBe('boolean');
      
      // Requirement 5.1, 5.2: Data persistence
      const storedData: StoredData = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        curriculum: {}
      };
      expect(typeof storedData.version).toBe('string');
      expect(typeof storedData.lastUpdated).toBe('string');
    });
  });
});