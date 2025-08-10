'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CurriculumState, CurriculumAction } from '../types/curriculum';
import { getInitialCurriculumState } from '../data/initialCurriculum';
import { saveCurriculumState, loadCurriculumState } from '../utils/localStorage';
import { updateAllProgress } from '../utils/progressCalculator';

/**
 * Context for curriculum state management
 */
interface CurriculumContextType {
  state: CurriculumState;
  dispatch: React.Dispatch<CurriculumAction>;
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

/**
 * Curriculum reducer function
 */
const curriculumReducer = (state: CurriculumState, action: CurriculumAction): CurriculumState => {
  switch (action.type) {
    case 'SET_START_DATE': {
      const { weekId, courseId, date } = action.payload;
      if (!weekId || !courseId || !date) return state;
      
      const updatedState = {
        ...state,
        weeks: state.weeks.map(week => 
          week.id === weekId 
            ? {
                ...week,
                courses: week.courses.map(course =>
                  course.id === courseId
                    ? { ...course, startDate: date }
                    : course
                )
              }
            : week
        )
      };
      
      return updateAllProgress(updatedState);
    }
    
    case 'SET_END_DATE': {
      const { weekId, courseId, date } = action.payload;
      if (!weekId || !courseId || !date) return state;
      
      const updatedState = {
        ...state,
        weeks: state.weeks.map(week => 
          week.id === weekId 
            ? {
                ...week,
                courses: week.courses.map(course =>
                  course.id === courseId
                    ? { ...course, endDate: date }
                    : course
                )
              }
            : week
        )
      };
      
      return updateAllProgress(updatedState);
    }
    
    case 'TOGGLE_COMPLETION': {
      const { weekId, courseId } = action.payload;
      if (!weekId || !courseId) return state;
      
      const updatedState = {
        ...state,
        weeks: state.weeks.map(week => 
          week.id === weekId 
            ? {
                ...week,
                courses: week.courses.map(course =>
                  course.id === courseId
                    ? { ...course, completed: !course.completed }
                    : course
                )
              }
            : week
        )
      };
      
      return updateAllProgress(updatedState);
    }
    
    case 'LOAD_DATA': {
      const { data } = action.payload;
      if (!data) return state;
      
      return updateAllProgress(data);
    }
    
    default:
      return state;
  }
};

/**
 * Curriculum Provider component
 */
interface CurriculumProviderProps {
  children: ReactNode;
}

export const CurriculumProvider: React.FC<CurriculumProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(curriculumReducer, getInitialCurriculumState());
  
  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedState = loadCurriculumState(getInitialCurriculumState());
      if (savedState) {
        dispatch({
          type: 'LOAD_DATA',
          payload: { data: savedState }
        });
      }
    } catch (error) {
      console.error('Failed to load curriculum state from localStorage:', error);
      // Continue with initial state if loading fails
    }
  }, []);
  
  // Save data to localStorage whenever state changes
  useEffect(() => {
    // Skip saving on initial render (when state is still initial)
    if (state.weeks.some(week => week.courses.some(course => course.completed || course.startDate || course.endDate))) {
      try {
        saveCurriculumState(state);
      } catch (error) {
        console.error('Failed to save curriculum state to localStorage:', error);
        // Continue execution - don't break the app if localStorage fails
      }
    }
  }, [state]);
  
  const value = {
    state,
    dispatch
  };
  
  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
};

/**
 * Custom hook to use curriculum context
 */
export const useCurriculum = (): CurriculumContextType => {
  const context = useContext(CurriculumContext);
  if (context === undefined) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
};

export default CurriculumContext;