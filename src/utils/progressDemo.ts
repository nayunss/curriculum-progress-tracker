import { CurriculumState } from '../types/curriculum';
import { updateAllProgress, getProgressStatistics } from './progressCalculator';
import { getInitialCurriculumState } from '../data/initialCurriculum';

/**
 * Demo function to show real-time progress calculation
 * This demonstrates how progress updates work when courses are completed
 */
export const demonstrateProgressCalculation = () => {
  console.log('=== Curriculum Progress Calculation Demo ===\n');
  
  // Start with initial state
  let state: CurriculumState = getInitialCurriculumState();
  state = updateAllProgress(state);
  
  console.log('Initial State:');
  console.log(`Overall Progress: ${state.overallProgress}%`);
  state.weeks.forEach(week => {
    console.log(`${week.title}: ${week.progress}% (${week.courses.filter(c => c.completed).length}/${week.courses.length} completed)`);
  });
  
  console.log('\n--- Completing first course in Week 1 ---');
  
  // Complete first course in week 1
  state = {
    ...state,
    weeks: state.weeks.map(week => 
      week.id === 1 
        ? {
            ...week,
            courses: week.courses.map((course, index) =>
              index === 0 ? { ...course, completed: true } : course
            )
          }
        : week
    )
  };
  
  state = updateAllProgress(state);
  
  console.log(`Overall Progress: ${state.overallProgress}%`);
  console.log(`Week 1 Progress: ${state.weeks[0].progress}%`);
  
  console.log('\n--- Completing all courses in Week 1 ---');
  
  // Complete all courses in week 1
  state = {
    ...state,
    weeks: state.weeks.map(week => 
      week.id === 1 
        ? {
            ...week,
            courses: week.courses.map(course => ({ ...course, completed: true }))
          }
        : week
    )
  };
  
  state = updateAllProgress(state);
  
  console.log(`Overall Progress: ${state.overallProgress}%`);
  console.log(`Week 1 Progress: ${state.weeks[0].progress}%`);
  
  console.log('\n--- Completing half of Week 2 courses ---');
  
  // Complete half of week 2 courses
  state = {
    ...state,
    weeks: state.weeks.map(week => 
      week.id === 2 
        ? {
            ...week,
            courses: week.courses.map((course, index) =>
              index < Math.ceil(week.courses.length / 2) ? { ...course, completed: true } : course
            )
          }
        : week
    )
  };
  
  state = updateAllProgress(state);
  
  console.log(`Overall Progress: ${state.overallProgress}%`);
  console.log(`Week 2 Progress: ${state.weeks[1].progress}%`);
  
  console.log('\n--- Progress Statistics ---');
  const stats = getProgressStatistics(state);
  console.log(`Total Courses: ${stats.totalCourses}`);
  console.log(`Completed Courses: ${stats.completedCourses}`);
  console.log(`Remaining Courses: ${stats.remainingCourses}`);
  console.log(`Completed Weeks: ${stats.completedWeeks}`);
  console.log(`In Progress Weeks: ${stats.inProgressWeeks}`);
  console.log(`Not Started Weeks: ${stats.notStartedWeeks}`);
  
  console.log('\n=== Demo Complete ===');
  
  return state;
};

// Export for potential use in development
if (typeof window !== 'undefined') {
  (window as typeof window & { demonstrateProgressCalculation: typeof demonstrateProgressCalculation }).demonstrateProgressCalculation = demonstrateProgressCalculation;
}