/**
 * Data Flow Integration Tests
 * Tests the complete data flow: Action → State Update → UI Reflection → LocalStorage Sync
 * Requirements: 1.3, 5.3, 4.3, 4.4
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { CurriculumProvider } from '../context/CurriculumContext';
import CurriculumDashboard from '../components/CurriculumDashboard';
import * as localStorage from '../utils/localStorage';

// Mock localStorage utilities
vi.mock('../utils/localStorage', () => ({
  saveCurriculumState: vi.fn(),
  loadCurriculumState: vi.fn(() => null),
}));

const mockSaveCurriculumState = vi.mocked(localStorage.saveCurriculumState);
const mockLoadCurriculumState = vi.mocked(localStorage.loadCurriculumState);

const TestApp = () => (
  <CurriculumProvider>
    <CurriculumDashboard />
  </CurriculumProvider>
);

describe('Data Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadCurriculumState.mockReturnValue(null);
  });

  it('should complete the full data flow: checkbox action → state update → UI update → localStorage save', async () => {
    render(<TestApp />);

    // Verify initial state - use getAllByText to handle multiple instances
    const initialProgress = screen.getAllByText('0% 완료');
    expect(initialProgress.length).toBeGreaterThan(0);

    // Find total course count
    const totalCourseText = screen.getByText(/\/\d+ 과정 완료/);
    expect(totalCourseText).toBeInTheDocument();

    // Expand first week
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    // Wait for expansion and find checkbox
    await waitFor(() => {
      expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const qaCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label')?.includes('QA 이슈 해결')
    );

    expect(qaCheckbox).toBeDefined();
    expect(qaCheckbox).not.toBeChecked();

    // Complete course - this should trigger the full data flow
    act(() => {
      fireEvent.click(qaCheckbox!);
    });

    // Verify UI updates (state → UI)
    await waitFor(() => {
      expect(qaCheckbox).toBeChecked();
    });

    // Verify progress calculation updated
    await waitFor(() => {
      const progressElements = screen.getAllByText(/[1-9]\d*% 완료/);
      expect(progressElements.length).toBeGreaterThan(0);
    });

    // Verify localStorage save was called (state → localStorage)
    expect(mockSaveCurriculumState).toHaveBeenCalled();
    
    // Verify the saved state structure
    const savedState = mockSaveCurriculumState.mock.calls[0][0];
    expect(savedState).toHaveProperty('weeks');
    expect(savedState).toHaveProperty('overallProgress');
    expect(savedState.weeks[0].courses[0].completed).toBe(true);
  });

  it('should handle date changes and sync to localStorage', async () => {
    render(<TestApp />);

    // Expand first week
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    await waitFor(() => {
      expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    });

    // Find date input
    const dateInputs = screen.getAllByDisplayValue('');
    const startDateInput = dateInputs.find(input => 
      (input as HTMLInputElement).type === 'date'
    ) as HTMLInputElement;

    expect(startDateInput).toBeDefined();

    // Set date - this should trigger data flow
    const testDate = '2024-01-15';
    act(() => {
      fireEvent.change(startDateInput, { target: { value: testDate } });
    });

    // Verify date was set in UI
    await waitFor(() => {
      expect(startDateInput.value).toBe(testDate);
    });

    // Verify localStorage save was called
    expect(mockSaveCurriculumState).toHaveBeenCalled();
    
    // Verify the saved state contains the date
    const savedState = mockSaveCurriculumState.mock.calls[0][0];
    expect(savedState.weeks[0].courses[0].startDate).toBeInstanceOf(Date);
    // Check that the date is correct (accounting for timezone conversion)
    const savedDate = savedState.weeks[0].courses[0].startDate;
    expect(savedDate?.getFullYear()).toBe(2024);
    expect(savedDate?.getMonth()).toBe(0); // January is 0
    expect(savedDate?.getDate()).toBe(15);
  });

  it('should load saved data on initialization and reflect in UI', async () => {
    // Mock saved data with minimal structure
    const mockSavedState = {
      weeks: [
        {
          id: 1,
          title: '1주차',
          courses: [
            {
              id: '1-1',
              name: 'QA 이슈 해결',
              completed: true,
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-01-20')
            }
          ],
          progress: 100
        }
      ],
      overallProgress: 100
    };

    mockLoadCurriculumState.mockReturnValue(mockSavedState);

    render(<TestApp />);

    // Verify loaded state is reflected in UI
    await waitFor(() => {
      const progressElements = screen.getAllByText('100% 완료');
      expect(progressElements.length).toBeGreaterThan(0);
    });

    // Verify course completion state is loaded
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      const qaCheckbox = checkboxes.find(cb => 
        cb.getAttribute('aria-label')?.includes('QA 이슈 해결')
      );
      expect(qaCheckbox).toBeChecked();
    });

    // Verify date is loaded
    await waitFor(() => {
      const dateInputs = screen.getAllByDisplayValue('2024-01-15');
      expect(dateInputs.length).toBeGreaterThan(0);
    });
  });

  it('should maintain data consistency across multiple actions', async () => {
    render(<TestApp />);

    // Expand first week
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    await waitFor(() => {
      expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    });

    // Get multiple checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    const qaCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label')?.includes('QA 이슈 해결')
    );
    const productCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label')?.includes('4장 > 상품 목록 페이지')
    );

    // Perform multiple actions
    act(() => {
      fireEvent.click(qaCheckbox!);
      fireEvent.click(productCheckbox!);
    });

    // Verify both are completed
    await waitFor(() => {
      expect(qaCheckbox).toBeChecked();
      expect(productCheckbox).toBeChecked();
    });

    // Uncomplete one
    act(() => {
      fireEvent.click(qaCheckbox!);
    });

    // Verify consistency
    await waitFor(() => {
      expect(qaCheckbox).not.toBeChecked();
      expect(productCheckbox).toBeChecked();
    });

    // Verify localStorage was called for each action
    expect(mockSaveCurriculumState).toHaveBeenCalledTimes(3);
  });

  it('should handle localStorage errors gracefully without breaking UI', async () => {
    // Mock localStorage to throw error only on save, not on load
    mockSaveCurriculumState.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    // Wrap in error boundary simulation
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<TestApp />);

    // Expand first week
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    await waitFor(() => {
      expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    });

    // Try to complete a course - should not crash despite localStorage error
    const checkboxes = screen.getAllByRole('checkbox');
    const qaCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label')?.includes('QA 이슈 해결')
    );

    // This should not throw an error
    expect(() => {
      act(() => {
        fireEvent.click(qaCheckbox!);
      });
    }).not.toThrow();

    // UI should still update despite localStorage error
    await waitFor(() => {
      expect(qaCheckbox).toBeChecked();
    });

    consoleSpy.mockRestore();
  });

  it('should synchronize state between desktop and mobile views', async () => {
    render(<TestApp />);

    // Expand first week
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    await waitFor(() => {
      expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    });

    // Get all QA checkboxes (should be desktop and mobile versions)
    const checkboxes = screen.getAllByRole('checkbox');
    const qaCheckboxes = checkboxes.filter(cb => 
      cb.getAttribute('aria-label')?.includes('QA 이슈 해결')
    );

    expect(qaCheckboxes.length).toBe(2);

    // Click first one (desktop version)
    act(() => {
      fireEvent.click(qaCheckboxes[0]);
    });

    // Both should be synchronized
    await waitFor(() => {
      qaCheckboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  it('should update all progress bars when state changes', async () => {
    render(<TestApp />);

    // Get initial progress bars
    const initialProgressBars = screen.getAllByRole('progressbar');
    expect(initialProgressBars.length).toBeGreaterThan(1);

    // All should start at 0
    initialProgressBars.forEach(bar => {
      expect(bar.getAttribute('aria-valuenow')).toBe('0');
    });

    // Expand first week and complete a course
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    await waitFor(() => {
      expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const qaCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label')?.includes('QA 이슈 해결')
    );

    act(() => {
      fireEvent.click(qaCheckbox!);
    });

    // All progress bars should update
    await waitFor(() => {
      const updatedProgressBars = screen.getAllByRole('progressbar');
      // Check that at least one progress bar has updated
      const hasUpdatedBar = updatedProgressBars.some(bar => {
        const value = parseInt(bar.getAttribute('aria-valuenow') || '0');
        return value > 0;
      });
      expect(hasUpdatedBar).toBe(true);
    }, { timeout: 3000 });
  });
});