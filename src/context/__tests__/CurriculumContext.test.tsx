/**
 * Tests for CurriculumContext with localStorage integration
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurriculumProvider, useCurriculum } from '../CurriculumContext';
import * as localStorageUtils from '../../utils/localStorage';

// Mock localStorage utilities
vi.mock('../../utils/localStorage', () => ({
  saveCurriculumState: vi.fn(),
  loadCurriculumState: vi.fn(),
  clearCurriculumState: vi.fn(),
  getStorageInfo: vi.fn()
}));

// Test component that uses the context
const TestComponent: React.FC = () => {
  const { state, dispatch } = useCurriculum();
  
  return (
    <div>
      <div data-testid="overall-progress">{state.overallProgress}</div>
      <div data-testid="weeks-count">{state.weeks.length}</div>
      <div data-testid="first-course-completed">
        {state.weeks[0]?.courses[0]?.completed ? 'true' : 'false'}
      </div>
      <div data-testid="first-course-start-date">
        {state.weeks[0]?.courses[0]?.startDate?.toISOString() || 'null'}
      </div>
      <div data-testid="first-course-end-date">
        {state.weeks[0]?.courses[0]?.endDate?.toISOString() || 'null'}
      </div>
      <button 
        data-testid="toggle-completion"
        onClick={() => dispatch({
          type: 'TOGGLE_COMPLETION',
          payload: { weekId: 1, courseId: '1-1' }
        })}
      >
        Toggle Course 1-1
      </button>
      <button 
        data-testid="set-start-date"
        onClick={() => dispatch({
          type: 'SET_START_DATE',
          payload: { weekId: 1, courseId: '1-1', date: new Date('2024-01-01') }
        })}
      >
        Set Start Date
      </button>
      <button 
        data-testid="set-end-date"
        onClick={() => dispatch({
          type: 'SET_END_DATE',
          payload: { weekId: 1, courseId: '1-1', date: new Date('2024-01-07') }
        })}
      >
        Set End Date
      </button>
      <button 
        data-testid="load-data"
        onClick={() => dispatch({
          type: 'LOAD_DATA',
          payload: { 
            data: {
              weeks: [{
                id: 1,
                title: "Test Week",
                courses: [{ id: "test-1", name: "Test Course", completed: true }],
                progress: 100
              }],
              overallProgress: 100
            }
          }
        })}
      >
        Load Test Data
      </button>
      <button 
        data-testid="invalid-action"
        onClick={() => dispatch({
          type: 'TOGGLE_COMPLETION',
          payload: { weekId: undefined, courseId: undefined }
        })}
      >
        Invalid Action
      </button>
    </div>
  );
};

describe('CurriculumContext', () => {
  const mockSaveCurriculumState = localStorageUtils.saveCurriculumState as vi.MockedFunction<typeof localStorageUtils.saveCurriculumState>;
  const mockLoadCurriculumState = localStorageUtils.loadCurriculumState as vi.MockedFunction<typeof localStorageUtils.loadCurriculumState>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadCurriculumState.mockReturnValue(null);
    mockSaveCurriculumState.mockReturnValue(true);
  });

  it('should provide initial curriculum state', () => {
    render(
      <CurriculumProvider>
        <TestComponent />
      </CurriculumProvider>
    );

    expect(screen.getByTestId('overall-progress')).toHaveTextContent('0');
    expect(screen.getByTestId('weeks-count')).toHaveTextContent('7');
    expect(screen.getByTestId('first-course-completed')).toHaveTextContent('false');
  });

  it('should load saved state on mount', () => {
    const savedState = {
      weeks: [
        {
          id: 1,
          title: "1주차",
          courses: [
            { id: "1-1", name: "Test Course", completed: true }
          ],
          progress: 100
        }
      ],
      overallProgress: 100
    };

    mockLoadCurriculumState.mockReturnValue(savedState);

    render(
      <CurriculumProvider>
        <TestComponent />
      </CurriculumProvider>
    );

    expect(mockLoadCurriculumState).toHaveBeenCalledTimes(1);
  });

  it('should handle localStorage loading errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLoadCurriculumState.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    render(
      <CurriculumProvider>
        <TestComponent />
      </CurriculumProvider>
    );

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load curriculum state from localStorage:', expect.any(Error));
    expect(screen.getByTestId('overall-progress')).toHaveTextContent('0');
    
    consoleSpy.mockRestore();
  });

  it('should handle localStorage saving errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSaveCurriculumState.mockImplementation(() => {
      throw new Error('localStorage save error');
    });

    render(
      <CurriculumProvider>
        <TestComponent />
      </CurriculumProvider>
    );

    const toggleButton = screen.getByTestId('toggle-completion');
    
    await act(async () => {
      toggleButton.click();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to save curriculum state to localStorage:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  describe('Reducer Actions', () => {
    it('should toggle course completion', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      const toggleButton = screen.getByTestId('toggle-completion');
      
      // Initially false
      expect(screen.getByTestId('first-course-completed')).toHaveTextContent('false');
      
      await act(async () => {
        toggleButton.click();
      });

      // Should be true after toggle
      expect(screen.getByTestId('first-course-completed')).toHaveTextContent('true');
      
      await act(async () => {
        toggleButton.click();
      });

      // Should be false after second toggle
      expect(screen.getByTestId('first-course-completed')).toHaveTextContent('false');
    });

    it('should set start date', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      const setStartDateButton = screen.getByTestId('set-start-date');
      
      // Initially null
      expect(screen.getByTestId('first-course-start-date')).toHaveTextContent('null');
      
      await act(async () => {
        setStartDateButton.click();
      });

      // Should have the set date
      expect(screen.getByTestId('first-course-start-date')).toHaveTextContent('2024-01-01T00:00:00.000Z');
    });

    it('should set end date', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      const setEndDateButton = screen.getByTestId('set-end-date');
      
      // Initially null
      expect(screen.getByTestId('first-course-end-date')).toHaveTextContent('null');
      
      await act(async () => {
        setEndDateButton.click();
      });

      // Should have the set date
      expect(screen.getByTestId('first-course-end-date')).toHaveTextContent('2024-01-07T00:00:00.000Z');
    });

    it('should load external data', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      const loadDataButton = screen.getByTestId('load-data');
      
      await act(async () => {
        loadDataButton.click();
      });

      // Should have loaded the test data
      expect(screen.getByTestId('overall-progress')).toHaveTextContent('100');
      expect(screen.getByTestId('weeks-count')).toHaveTextContent('1');
    });

    it('should handle invalid action payloads gracefully', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      const invalidActionButton = screen.getByTestId('invalid-action');
      const initialCompleted = screen.getByTestId('first-course-completed').textContent;
      
      await act(async () => {
        invalidActionButton.click();
      });

      // State should remain unchanged
      expect(screen.getByTestId('first-course-completed')).toHaveTextContent(initialCompleted!);
    });

    it('should handle unknown action types', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      const { state, dispatch } = useCurriculum();
      const initialState = { ...state };

      await act(async () => {
        // @ts-expect-error - Testing unknown action type
        dispatch({ type: 'UNKNOWN_ACTION', payload: {} });
      });

      // State should remain unchanged
      expect(screen.getByTestId('overall-progress')).toHaveTextContent(initialState.overallProgress.toString());
    });
  });

  it('should save state when course completion is toggled', async () => {
    render(
      <CurriculumProvider>
        <TestComponent />
      </CurriculumProvider>
    );

    const toggleButton = screen.getByTestId('toggle-completion');
    
    await act(async () => {
      toggleButton.click();
    });

    // Should save state after toggle
    expect(mockSaveCurriculumState).toHaveBeenCalled();
  });

  it('should save state when start date is set', async () => {
    render(
      <CurriculumProvider>
        <TestComponent />
      </CurriculumProvider>
    );

    const setDateButton = screen.getByTestId('set-start-date');
    
    await act(async () => {
      setDateButton.click();
    });

    // Should save state after setting date
    expect(mockSaveCurriculumState).toHaveBeenCalled();
  });

  it('should not save initial state without changes', () => {
    render(
      <CurriculumProvider>
        <TestComponent />
      </CurriculumProvider>
    );

    // Should not save initial state immediately
    expect(mockSaveCurriculumState).not.toHaveBeenCalled();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCurriculum must be used within a CurriculumProvider');

    console.error = originalError;
  });

  describe('Requirements Verification', () => {
    it('should support requirement 4.3 - real-time progress updates', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      const toggleButton = screen.getByTestId('toggle-completion');
      
      // Initial progress should be 0
      expect(screen.getByTestId('overall-progress')).toHaveTextContent('0');
      
      await act(async () => {
        toggleButton.click();
      });

      // Progress should update immediately after completion toggle
      const progressAfterToggle = parseInt(screen.getByTestId('overall-progress').textContent || '0');
      expect(progressAfterToggle).toBeGreaterThan(0);
    });

    it('should support requirement 5.1 & 5.2 - localStorage persistence', async () => {
      render(
        <CurriculumProvider>
          <TestComponent />
        </CurriculumProvider>
      );

      const toggleButton = screen.getByTestId('toggle-completion');
      const setDateButton = screen.getByTestId('set-start-date');
      
      await act(async () => {
        toggleButton.click();
      });

      await act(async () => {
        setDateButton.click();
      });

      // Should save to localStorage for both completion and date changes
      expect(mockSaveCurriculumState).toHaveBeenCalledTimes(2);
    });
  });
});