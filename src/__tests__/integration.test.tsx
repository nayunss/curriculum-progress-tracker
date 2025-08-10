/**
 * Integration tests for the entire curriculum tracking system
 * Tests the complete data flow: Action → State Update → UI Reflection → LocalStorage Sync
 * Requirements: 1.3, 5.3, 4.3, 4.4
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import App from '../components/App';
import { CurriculumProvider } from '../context/CurriculumContext';
import * as localStorage from '../utils/localStorage';

// Mock localStorage utilities
vi.mock('../utils/localStorage', () => ({
  saveCurriculumState: vi.fn(),
  loadCurriculumState: vi.fn(),
}));

const mockSaveCurriculumState = vi.mocked(localStorage.saveCurriculumState);
const mockLoadCurriculumState = vi.mocked(localStorage.loadCurriculumState);

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CurriculumProvider>
    {children}
  </CurriculumProvider>
);

describe('System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock initial load to return null (no saved data)
    mockLoadCurriculumState.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Data Flow Integration', () => {
    it('should handle complete workflow: checkbox toggle → progress update → localStorage save', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('커리큘럼 진행률 관리')).toBeInTheDocument();
      });

      // Initial state: 0% progress (35 total courses: 6+5+5+5+5+5+5)
      expect(screen.getByText('0% 완료')).toBeInTheDocument();
      expect(screen.getByText('0/35 과정 완료')).toBeInTheDocument();

      // Expand first week section
      const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
      fireEvent.click(firstWeekButton);

      // Wait for week section to expand - use getAllByText for multiple instances
      await waitFor(() => {
        expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2); // Desktop and mobile versions
      });

      // Find and click the first checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes.find(checkbox => 
        checkbox.getAttribute('aria-label')?.includes('QA 이슈 해결')
      );
      
      expect(firstCheckbox).toBeDefined();
      expect(firstCheckbox).not.toBeChecked();

      // Toggle completion
      act(() => {
        fireEvent.click(firstCheckbox!);
      });

      // Verify UI updates
      await waitFor(() => {
        expect(firstCheckbox).toBeChecked();
      });

      // Verify progress calculation updates
      await waitFor(() => {
        // Should show updated progress (1/35 = ~3%)
        expect(screen.getByText(/[1-9]% 완료/)).toBeInTheDocument();
        expect(screen.getByText('1/35 과정 완료')).toBeInTheDocument();
      });

      // Verify localStorage save was called
      await waitFor(() => {
        expect(mockSaveCurriculumState).toHaveBeenCalled();
      });

      // Verify the saved state contains the completed course
      const savedState = mockSaveCurriculumState.mock.calls[0][0];
      expect(savedState.weeks[0].courses[0].completed).toBe(true);
    });

    it('should handle date setting → progress update → localStorage save', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('커리큘럼 진행률 관리')).toBeInTheDocument();
      });

      // Expand first week section
      const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
      fireEvent.click(firstWeekButton);

      // Wait for week section to expand
      await waitFor(() => {
        expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
      });

      // Find start date input for first course
      const dateInputs = screen.getAllByDisplayValue('');
      const startDateInput = dateInputs.find(input => 
        (input as HTMLInputElement).type === 'date'
      ) as HTMLInputElement;
      
      expect(startDateInput).toBeDefined();

      // Set start date
      const testDate = '2024-01-15';
      act(() => {
        fireEvent.change(startDateInput, { target: { value: testDate } });
      });

      // Verify date was set
      await waitFor(() => {
        expect(startDateInput.value).toBe(testDate);
      });

      // Verify localStorage save was called
      await waitFor(() => {
        expect(mockSaveCurriculumState).toHaveBeenCalled();
      });

      // Verify the saved state contains the date
      const savedState = mockSaveCurriculumState.mock.calls[0][0];
      expect(savedState.weeks[0].courses[0].startDate).toEqual(new Date(testDate));
    });

    it('should load saved data on initialization', async () => {
      // Mock saved data with complete structure
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
        overallProgress: 3 // 1/35 courses completed
      };

      mockLoadCurriculumState.mockReturnValue(mockSavedState);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for data to load and render
      await waitFor(() => {
        expect(screen.getByText('3% 완료')).toBeInTheDocument();
      });
    });

    it('should handle multiple actions and maintain data consistency', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('커리큘럼 진행률 관리')).toBeInTheDocument();
      });

      // Expand first week section
      const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
      fireEvent.click(firstWeekButton);

      await waitFor(() => {
        expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
      });

      // Get checkboxes
      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes.find(checkbox => 
        checkbox.getAttribute('aria-label')?.includes('QA 이슈 해결')
      );
      const secondCheckbox = checkboxes.find(checkbox => 
        checkbox.getAttribute('aria-label')?.includes('4장 > 상품 목록 페이지')
      );

      // Complete first course
      act(() => {
        fireEvent.click(firstCheckbox!);
      });

      // Complete second course
      act(() => {
        fireEvent.click(secondCheckbox!);
      });

      // Verify both are checked
      await waitFor(() => {
        expect(firstCheckbox).toBeChecked();
        expect(secondCheckbox).toBeChecked();
      });

      // Verify progress updated to reflect both completions
      await waitFor(() => {
        expect(screen.getByText('2/35 과정 완료')).toBeInTheDocument();
      });

      // Uncomplete first course
      act(() => {
        fireEvent.click(firstCheckbox!);
      });

      // Verify state consistency
      await waitFor(() => {
        expect(firstCheckbox).not.toBeChecked();
        expect(secondCheckbox).toBeChecked();
        expect(screen.getByText('1/35 과정 완료')).toBeInTheDocument();
      });

      // Verify localStorage was called for each action
      expect(mockSaveCurriculumState).toHaveBeenCalledTimes(3);
    });

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw error
      mockSaveCurriculumState.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('커리큘럼 진행률 관리')).toBeInTheDocument();
      });

      // Expand first week section
      const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
      fireEvent.click(firstWeekButton);

      await waitFor(() => {
        expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
      });

      // Try to complete a course (should not crash despite localStorage error)
      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes.find(checkbox => 
        checkbox.getAttribute('aria-label')?.includes('QA 이슈 해결')
      );

      act(() => {
        fireEvent.click(firstCheckbox!);
      });

      // UI should still update despite localStorage error
      await waitFor(() => {
        expect(firstCheckbox).toBeChecked();
        expect(screen.getByText('1/35 과정 완료')).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Component Data Flow', () => {
    it('should synchronize data between desktop and mobile views', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('커리큘럼 진행률 관리')).toBeInTheDocument();
      });

      // Expand first week section
      const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
      fireEvent.click(firstWeekButton);

      await waitFor(() => {
        expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
      });

      // Both desktop and mobile checkboxes should be present
      const checkboxes = screen.getAllByRole('checkbox');
      const qaCheckboxes = checkboxes.filter(checkbox => 
        checkbox.getAttribute('aria-label')?.includes('QA 이슈 해결')
      );

      // Should have both desktop and mobile versions
      expect(qaCheckboxes.length).toBe(2);

      // Click desktop version
      act(() => {
        fireEvent.click(qaCheckboxes[0]);
      });

      // Both should be checked (synchronized)
      await waitFor(() => {
        qaCheckboxes.forEach(checkbox => {
          expect(checkbox).toBeChecked();
        });
      });
    });

    it('should update progress bars across all components', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('커리큘럼 진행률 관리')).toBeInTheDocument();
      });

      // Should have overall progress bar and week progress bars
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(1);

      // Expand first week and complete a course
      const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
      fireEvent.click(firstWeekButton);

      await waitFor(() => {
        expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
      });

      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes.find(checkbox => 
        checkbox.getAttribute('aria-label')?.includes('QA 이슈 해결')
      );

      act(() => {
        fireEvent.click(firstCheckbox!);
      });

      // All progress bars should update
      await waitFor(() => {
        const updatedProgressBars = screen.getAllByRole('progressbar');
        updatedProgressBars.forEach(bar => {
          const ariaValueNow = bar.getAttribute('aria-valuenow');
          expect(parseInt(ariaValueNow || '0')).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid date inputs gracefully', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for initial render and expand first week
      await waitFor(() => {
        expect(screen.getByText('커리큘럼 진행률 관리')).toBeInTheDocument();
      });

      const firstWeekButton = screen.getByRole('button', { name: /1주차/ });
      fireEvent.click(firstWeekButton);

      await waitFor(() => {
        expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
      });

      // Find date inputs
      const dateInputs = screen.getAllByDisplayValue('').filter(input => 
        (input as HTMLInputElement).type === 'date'
      ) as HTMLInputElement[];
      
      expect(dateInputs.length).toBeGreaterThan(1);
      const startDateInput = dateInputs[0];
      const endDateInput = dateInputs[1];

      // Set end date before start date (invalid)
      act(() => {
        fireEvent.change(startDateInput, { target: { value: '2024-01-20' } });
        fireEvent.change(endDateInput, { target: { value: '2024-01-15' } });
      });

      // System should handle this gracefully without crashing
      await waitFor(() => {
        expect(startDateInput).toHaveValue('2024-01-20');
        expect(endDateInput).toHaveValue('2024-01-15');
      });

      // Should still save to localStorage
      expect(mockSaveCurriculumState).toHaveBeenCalled();
    });
  });
});