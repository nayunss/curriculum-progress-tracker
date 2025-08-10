/**
 * Core data types for the curriculum progress tracker
 */

export interface Course {
  id: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
  completed: boolean;
}

export interface Week {
  id: number;
  title: string;
  courses: Course[];
  progress: number;
}

export interface CurriculumState {
  weeks: Week[];
  overallProgress: number;
}

export type CurriculumActionType = 
  | 'SET_START_DATE' 
  | 'SET_END_DATE' 
  | 'TOGGLE_COMPLETION' 
  | 'LOAD_DATA';

export interface CurriculumAction {
  type: CurriculumActionType;
  payload: {
    weekId?: number;
    courseId?: string;
    date?: Date;
    data?: CurriculumState;
  };
}

/**
 * LocalStorage data structure for persistence
 */
export interface StoredData {
  version: string;
  lastUpdated: string;
  curriculum: {
    [weekId: string]: {
      [courseId: string]: {
        startDate?: string; // ISO string
        endDate?: string;   // ISO string
        completed: boolean;
      }
    }
  };
}