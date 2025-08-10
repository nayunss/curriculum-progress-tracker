import { describe, it, expect, vi } from 'vitest';
import { demonstrateProgressCalculation } from '../progressDemo';

// Mock the console.log to capture output
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('progressDemo', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('demonstrateProgressCalculation', () => {
    it('should run the complete demo without errors', () => {
      expect(() => demonstrateProgressCalculation()).not.toThrow();
    });

    it('should return a valid curriculum state', () => {
      const result = demonstrateProgressCalculation();
      
      expect(result).toBeDefined();
      expect(result.weeks).toBeDefined();
      expect(result.overallProgress).toBeDefined();
      expect(Array.isArray(result.weeks)).toBe(true);
      expect(typeof result.overallProgress).toBe('number');
    });

    it('should log demo progress information', () => {
      demonstrateProgressCalculation();
      
      // Check that console.log was called multiple times
      expect(mockConsoleLog).toHaveBeenCalled();
      
      // Check for specific demo messages
      const logCalls = mockConsoleLog.mock.calls.map(call => call[0]);
      expect(logCalls.some(call => call?.includes('Curriculum Progress Calculation Demo'))).toBe(true);
      expect(logCalls.some(call => call?.includes('Initial State:'))).toBe(true);
      expect(logCalls.some(call => call?.includes('Demo Complete'))).toBe(true);
    });

    it('should demonstrate progress changes throughout the demo', () => {
      const result = demonstrateProgressCalculation();
      
      // After the demo, some courses should be completed
      const totalCompletedCourses = result.weeks.reduce((total, week) => 
        total + week.courses.filter(course => course.completed).length, 0
      );
      
      expect(totalCompletedCourses).toBeGreaterThan(0);
      expect(result.overallProgress).toBeGreaterThan(0);
    });

    it('should show week 1 as fully completed after demo', () => {
      const result = demonstrateProgressCalculation();
      
      const week1 = result.weeks.find(week => week.id === 1);
      expect(week1).toBeDefined();
      expect(week1!.progress).toBe(100);
      
      // All courses in week 1 should be completed
      const allCompleted = week1!.courses.every(course => course.completed);
      expect(allCompleted).toBe(true);
    });

    it('should show week 2 as partially completed after demo', () => {
      const result = demonstrateProgressCalculation();
      
      const week2 = result.weeks.find(week => week.id === 2);
      expect(week2).toBeDefined();
      expect(week2!.progress).toBeGreaterThan(0);
      expect(week2!.progress).toBeLessThan(100);
      
      // Some but not all courses in week 2 should be completed
      const completedCourses = week2!.courses.filter(course => course.completed).length;
      const totalCourses = week2!.courses.length;
      expect(completedCourses).toBeGreaterThan(0);
      expect(completedCourses).toBeLessThan(totalCourses);
    });

    it('should maintain data integrity throughout the demo', () => {
      const result = demonstrateProgressCalculation();
      
      // Check that all weeks have valid structure
      result.weeks.forEach(week => {
        expect(week.id).toBeDefined();
        expect(week.title).toBeDefined();
        expect(Array.isArray(week.courses)).toBe(true);
        expect(typeof week.progress).toBe('number');
        expect(week.progress).toBeGreaterThanOrEqual(0);
        expect(week.progress).toBeLessThanOrEqual(100);
        
        // Check that all courses have valid structure
        week.courses.forEach(course => {
          expect(course.id).toBeDefined();
          expect(course.name).toBeDefined();
          expect(typeof course.completed).toBe('boolean');
        });
      });
    });
  });
});