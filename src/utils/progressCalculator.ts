import { Week, Course, CurriculumState } from '../types/curriculum';

/**
 * Calculate progress for a specific week
 * @param courses Array of courses in the week
 * @returns Progress percentage (0-100)
 */
export const calculateWeekProgress = (courses: Course[]): number => {
  if (courses.length === 0) return 0;
  
  const completedCourses = courses.filter(course => course.completed).length;
  return Math.round((completedCourses / courses.length) * 100);
};

/**
 * Calculate overall progress across all weeks
 * @param weeks Array of all weeks
 * @returns Overall progress percentage (0-100)
 */
export const calculateOverallProgress = (weeks: Week[]): number => {
  const totalCourses = weeks.reduce((total, week) => total + week.courses.length, 0);
  if (totalCourses === 0) return 0;
  
  const completedCourses = weeks.reduce((total, week) => {
    return total + week.courses.filter(course => course.completed).length;
  }, 0);
  
  return Math.round((completedCourses / totalCourses) * 100);
};

/**
 * Update progress for all weeks and overall progress
 * This function recalculates progress for each week and the overall curriculum
 * @param state Current curriculum state
 * @returns Updated state with recalculated progress
 */
export const updateAllProgress = (state: CurriculumState): CurriculumState => {
  const updatedWeeks = state.weeks.map(week => ({
    ...week,
    progress: calculateWeekProgress(week.courses)
  }));
  
  return {
    weeks: updatedWeeks,
    overallProgress: calculateOverallProgress(updatedWeeks)
  };
};

/**
 * Get progress statistics for the curriculum
 * @param state Current curriculum state
 * @returns Object containing various progress statistics
 */
export const getProgressStatistics = (state: CurriculumState) => {
  const totalCourses = state.weeks.reduce((total, week) => total + week.courses.length, 0);
  const completedCourses = state.weeks.reduce((total, week) => {
    return total + week.courses.filter(course => course.completed).length;
  }, 0);
  const remainingCourses = totalCourses - completedCourses;
  
  const completedWeeks = state.weeks.filter(week => week.progress === 100).length;
  const inProgressWeeks = state.weeks.filter(week => week.progress > 0 && week.progress < 100).length;
  const notStartedWeeks = state.weeks.filter(week => week.progress === 0).length;
  
  return {
    totalCourses,
    completedCourses,
    remainingCourses,
    overallProgress: state.overallProgress,
    totalWeeks: state.weeks.length,
    completedWeeks,
    inProgressWeeks,
    notStartedWeeks,
    weekProgresses: state.weeks.map(week => ({
      weekId: week.id,
      title: week.title,
      progress: week.progress,
      totalCourses: week.courses.length,
      completedCourses: week.courses.filter(course => course.completed).length
    }))
  };
};