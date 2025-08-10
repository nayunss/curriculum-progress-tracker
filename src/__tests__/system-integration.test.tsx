/**
 * System Integration Tests
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

describe('System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadCurriculumState.mockReturnValue(null);
  });

  it('should complete full data flow: action → state → UI → localStorage', async () => {
    render(<TestApp />);

    // Verify initial state
    expect(screen.getByText('0% 완료')).toBeInTheDocument();
    expect(screen.getByText('0/35 과정 완료')).toBeInTheDocument();

    // Expand first week
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    });

    // Find and click checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    const qaCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label')?.includes('QA 이슈 해결')
    );

    expect(qaCheckbox).toBeDefined();
    expect(qaCheckbox).not.toBeChecked();

    // Complete course
    act(() => {
      fireEvent.click(qaCheckbox!);
    });

    // Verify UI updates
    await waitFor(() => {
      expect(qaCheckbox).toBeChecked();
      expect(screen.getByText('1/35 과정 완료')).toBeInTheDocument();
      expect(screen.getByText(/[1-9]% 완료/)).toBeInTheDocument();
    });

    // Verify localStorage was called
    expect(mockSaveCurriculumState).toHaveBeenCalled();
    
    // Verify saved state
    const savedState = mockSaveCurriculumState.mock.calls[0][0];
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

    // Set date
    const testDate = '2024-01-15';
    act(() => {
      fireEvent.change(startDateInput, { target: { value: testDate } });
    });

    // Verify date was set
    await waitFor(() => {
      expect(startDateInput.value).toBe(testDate);
    });

    // Verify localStorage save
    expect(mockSaveCurriculumState).toHaveBeenCalled();
    const savedState = mockSaveCurriculumState.mock.calls[0][0];
    expect(savedState.weeks[0].courses[0].startDate).toEqual(new Date(testDate));
  });

  it('should load saved data on initialization', async () => {
    // Mock saved data
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
      overallProgress: 3
    };

    mockLoadCurriculumState.mockReturnValue(mockSavedState);

    render(<TestApp />);

    // Verify loaded state is displayed
    await waitFor(() => {
      expect(screen.getByText('3% 완료')).toBeInTheDocument();
    });
  });

  it('should handle multiple state changes consistently', async () => {
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

    // Complete both courses
    act(() => {
      fireEvent.click(qaCheckbox!);
      fireEvent.click(productCheckbox!);
    });

    // Verify both are completed
    await waitFor(() => {
      expect(qaCheckbox).toBeChecked();
      expect(productCheckbox).toBeChecked();
      expect(screen.getByText('2/35 과정 완료')).toBeInTheDocument();
    });

    // Uncomplete one
    act(() => {
      fireEvent.click(qaCheckbox!);
    });

    // Verify consistency
    await waitFor(() => {
      expect(qaCheckbox).not.toBeChecked();
      expect(productCheckbox).toBeChecked();
      expect(screen.getByText('1/35 과정 완료')).toBeInTheDocument();
    });

    // Verify localStorage was called multiple times
    expect(mockSaveCurriculumState).toHaveBeenCalledTimes(3);
  });

  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage to throw error
    mockSaveCurriculumState.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    render(<TestApp />);

    // Expand first week
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    await waitFor(() => {
      expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    });

    // Try to complete a course
    const checkboxes = screen.getAllByRole('checkbox');
    const qaCheckbox = checkboxes.find(cb => 
      cb.getAttribute('aria-label')?.includes('QA 이슈 해결')
    );

    // Should not crash despite localStorage error
    act(() => {
      fireEvent.click(qaCheckbox!);
    });

    // UI should still update
    await waitFor(() => {
      expect(qaCheckbox).toBeChecked();
      expect(screen.getByText('1/35 과정 완료')).toBeInTheDocument();
    });
  });

  it('should synchronize desktop and mobile views', async () => {
    render(<TestApp />);

    // Expand first week
    const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
    fireEvent.click(firstWeekButton);

    await waitFor(() => {
      expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    });

    // Get all QA checkboxes (desktop and mobile)
    const checkboxes = screen.getAllByRole('checkbox');
    const qaCheckboxes = checkboxes.filter(cb => 
      cb.getAttribute('aria-label')?.includes('QA 이슈 해결')
    );

    expect(qaCheckboxes.length).toBe(2);

    // Click first one
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
      updatedProgressBars.forEach(bar => {
        const value = parseInt(bar.getAttribute('aria-valuenow') || '0');
        expect(value).toBeGreaterThan(0);
      });
    });
  });
});