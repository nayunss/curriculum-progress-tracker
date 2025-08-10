import { describe, it, expect } from 'vitest';
import { 
  calculateWeekProgress, 
  calculateOverallProgress, 
  updateAllProgress,
  getProgressStatistics 
} from '../progressCalculator';
import { Week, Course, CurriculumState } from '../../types/curriculum';

describe('progressCalculator', () => {
  // Mock data for testing
  const mockCourses: Course[] = [
    { id: '1-1', name: 'Course 1', completed: true },
    { id: '1-2', name: 'Course 2', completed: false },
    { id: '1-3', name: 'Course 3', completed: true },
    { id: '1-4', name: 'Course 4', completed: false }
  ];

  const mockWeeks: Week[] = [
    {
      id: 1,
      title: 'Week 1',
      courses: [
        { id: '1-1', name: 'Course 1', completed: true },
        { id: '1-2', name: 'Course 2', completed: true }
      ],
      progress: 0 // Will be calculated
    },
    {
      id: 2,
      title: 'Week 2',
      courses: [
        { id: '2-1', name: 'Course 3', completed: false },
        { id: '2-2', name: 'Course 4', completed: false },
        { id: '2-3', name: 'Course 5', completed: true }
      ],
      progress: 0 // Will be calculated
    }
  ];

  const mockState: CurriculumState = {
    weeks: mockWeeks,
    overallProgress: 0
  };

  describe('calculateWeekProgress', () => {
    it('should return 0 for empty courses array', () => {
      expect(calculateWeekProgress([])).toBe(0);
    });

    it('should calculate correct progress for partially completed courses', () => {
      // 2 out of 4 courses completed = 50%
      expect(calculateWeekProgress(mockCourses)).toBe(50);
    });

    it('should return 100 for all completed courses', () => {
      const allCompleted = mockCourses.map(course => ({ ...course, completed: true }));
      expect(calculateWeekProgress(allCompleted)).toBe(100);
    });

    it('should return 0 for no completed courses', () => {
      const noneCompleted = mockCourses.map(course => ({ ...course, completed: false }));
      expect(calculateWeekProgress(noneCompleted)).toBe(0);
    });

    it('should round progress to nearest integer', () => {
      // 1 out of 3 courses = 33.33% -> should round to 33%
      const threeCourses: Course[] = [
        { id: '1', name: 'Course 1', completed: true },
        { id: '2', name: 'Course 2', completed: false },
        { id: '3', name: 'Course 3', completed: false }
      ];
      expect(calculateWeekProgress(threeCourses)).toBe(33);
    });
  });

  describe('calculateOverallProgress', () => {
    it('should return 0 for empty weeks array', () => {
      expect(calculateOverallProgress([])).toBe(0);
    });

    it('should calculate correct overall progress', () => {
      // Week 1: 2/2 completed, Week 2: 1/3 completed
      // Total: 3/5 completed = 60%
      expect(calculateOverallProgress(mockWeeks)).toBe(60);
    });

    it('should return 100 for all completed courses across all weeks', () => {
      const allCompletedWeeks = mockWeeks.map(week => ({
        ...week,
        courses: week.courses.map(course => ({ ...course, completed: true }))
      }));
      expect(calculateOverallProgress(allCompletedWeeks)).toBe(100);
    });

    it('should return 0 for no completed courses across all weeks', () => {
      const noneCompletedWeeks = mockWeeks.map(week => ({
        ...week,
        courses: week.courses.map(course => ({ ...course, completed: false }))
      }));
      expect(calculateOverallProgress(noneCompletedWeeks)).toBe(0);
    });

    it('should handle weeks with no courses', () => {
      const weeksWithEmpty: Week[] = [
        ...mockWeeks,
        { id: 3, title: 'Empty Week', courses: [], progress: 0 }
      ];
      // Still 3/5 completed = 60%
      expect(calculateOverallProgress(weeksWithEmpty)).toBe(60);
    });
  });

  describe('updateAllProgress', () => {
    it('should update progress for all weeks and overall progress', () => {
      const result = updateAllProgress(mockState);
      
      // Week 1: 2/2 = 100%
      expect(result.weeks[0].progress).toBe(100);
      // Week 2: 1/3 = 33%
      expect(result.weeks[1].progress).toBe(33);
      // Overall: 3/5 = 60%
      expect(result.overallProgress).toBe(60);
    });

    it('should not mutate the original state', () => {
      const originalState = JSON.parse(JSON.stringify(mockState));
      updateAllProgress(mockState);
      
      expect(mockState).toEqual(originalState);
    });

    it('should preserve all other properties of weeks and courses', () => {
      const result = updateAllProgress(mockState);
      
      expect(result.weeks[0].id).toBe(mockState.weeks[0].id);
      expect(result.weeks[0].title).toBe(mockState.weeks[0].title);
      expect(result.weeks[0].courses[0].id).toBe(mockState.weeks[0].courses[0].id);
      expect(result.weeks[0].courses[0].name).toBe(mockState.weeks[0].courses[0].name);
      expect(result.weeks[0].courses[0].completed).toBe(mockState.weeks[0].courses[0].completed);
    });
  });

  describe('getProgressStatistics', () => {
    it('should return comprehensive progress statistics', () => {
      const updatedState = updateAllProgress(mockState);
      const stats = getProgressStatistics(updatedState);
      
      expect(stats.totalCourses).toBe(5);
      expect(stats.completedCourses).toBe(3);
      expect(stats.remainingCourses).toBe(2);
      expect(stats.overallProgress).toBe(60);
      expect(stats.totalWeeks).toBe(2);
      expect(stats.completedWeeks).toBe(1); // Week 1 is 100%
      expect(stats.inProgressWeeks).toBe(1); // Week 2 is 33%
      expect(stats.notStartedWeeks).toBe(0);
    });

    it('should return correct week progress details', () => {
      const updatedState = updateAllProgress(mockState);
      const stats = getProgressStatistics(updatedState);
      
      expect(stats.weekProgresses).toHaveLength(2);
      expect(stats.weekProgresses[0]).toEqual({
        weekId: 1,
        title: 'Week 1',
        progress: 100,
        totalCourses: 2,
        completedCourses: 2
      });
      expect(stats.weekProgresses[1]).toEqual({
        weekId: 2,
        title: 'Week 2',
        progress: 33,
        totalCourses: 3,
        completedCourses: 1
      });
    });

    it('should handle state with no completed courses', () => {
      const emptyState: CurriculumState = {
        weeks: mockWeeks.map(week => ({
          ...week,
          courses: week.courses.map(course => ({ ...course, completed: false }))
        })),
        overallProgress: 0
      };
      
      const updatedState = updateAllProgress(emptyState);
      const stats = getProgressStatistics(updatedState);
      
      expect(stats.completedCourses).toBe(0);
      expect(stats.overallProgress).toBe(0);
      expect(stats.completedWeeks).toBe(0);
      expect(stats.inProgressWeeks).toBe(0);
      expect(stats.notStartedWeeks).toBe(2);
    });

    it('should handle state with all completed courses', () => {
      const completedState: CurriculumState = {
        weeks: mockWeeks.map(week => ({
          ...week,
          courses: week.courses.map(course => ({ ...course, completed: true }))
        })),
        overallProgress: 0
      };
      
      const updatedState = updateAllProgress(completedState);
      const stats = getProgressStatistics(updatedState);
      
      expect(stats.completedCourses).toBe(5);
      expect(stats.remainingCourses).toBe(0);
      expect(stats.overallProgress).toBe(100);
      expect(stats.completedWeeks).toBe(2);
      expect(stats.inProgressWeeks).toBe(0);
      expect(stats.notStartedWeeks).toBe(0);
    });
  });

  describe('Real-time progress updates', () => {
    it('should correctly update progress when a course is completed', () => {
      const initialState = updateAllProgress(mockState);
      
      // Complete one more course in week 2
      const updatedState: CurriculumState = {
        ...initialState,
        weeks: initialState.weeks.map(week => 
          week.id === 2 
            ? {
                ...week,
                courses: week.courses.map(course =>
                  course.id === '2-2' ? { ...course, completed: true } : course
                )
              }
            : week
        )
      };
      
      const result = updateAllProgress(updatedState);
      
      // Week 2 should now be 2/3 = 67%
      expect(result.weeks[1].progress).toBe(67);
      // Overall should be 4/5 = 80%
      expect(result.overallProgress).toBe(80);
    });

    it('should correctly update progress when a course is uncompleted', () => {
      const initialState = updateAllProgress(mockState);
      
      // Uncomplete a course in week 1
      const updatedState: CurriculumState = {
        ...initialState,
        weeks: initialState.weeks.map(week => 
          week.id === 1 
            ? {
                ...week,
                courses: week.courses.map(course =>
                  course.id === '1-1' ? { ...course, completed: false } : course
                )
              }
            : week
        )
      };
      
      const result = updateAllProgress(updatedState);
      
      // Week 1 should now be 1/2 = 50%
      expect(result.weeks[0].progress).toBe(50);
      // Overall should be 2/5 = 40%
      expect(result.overallProgress).toBe(40);
    });
  });
});