import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CurriculumDashboard from '../CurriculumDashboard';
import { CurriculumProvider } from '../../context/CurriculumContext';

// Mock the localStorage utilities
vi.mock('../../utils/localStorage', () => ({
  saveCurriculumState: vi.fn(),
  loadCurriculumState: vi.fn(() => null),
}));

// Mock the progress calculator
vi.mock('../../utils/progressCalculator', () => ({
  updateAllProgress: vi.fn((state) => state),
}));

// Test wrapper with CurriculumProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CurriculumProvider>
    {children}
  </CurriculumProvider>
);

describe('CurriculumDashboard', () => {
  it('should render overall progress section', () => {
    render(
      <TestWrapper>
        <CurriculumDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('전체 진행률')).toBeInTheDocument();
    expect(screen.getByLabelText(/전체 진행률 \d+%/)).toBeInTheDocument();
    
    // Check for the specific overall progress text (with total course count)
    expect(screen.getByText(/\d+% 완료 \(\d+\/36 과정\)/)).toBeInTheDocument();
  });

  it('should render weekly sections', () => {
    render(
      <TestWrapper>
        <CurriculumDashboard />
      </TestWrapper>
    );

    // Check that week titles are rendered
    expect(screen.getByText('1주차')).toBeInTheDocument();
    expect(screen.getByText('2주차')).toBeInTheDocument();
    expect(screen.getByText('3주차')).toBeInTheDocument();
  });

  it('should render course checkboxes and allow toggling when expanded', () => {
    render(
      <TestWrapper>
        <CurriculumDashboard />
      </TestWrapper>
    );

    // Initially, courses should be hidden (collapsed)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    // Expand the first week section
    const weekButtons = screen.getAllByRole('button', { expanded: false });
    const firstWeekButton = weekButtons[0];
    fireEvent.click(firstWeekButton);

    // Now checkboxes should be visible
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    // Test toggling a checkbox
    const firstCheckbox = checkboxes[0];
    const initialChecked = firstCheckbox.checked;
    
    fireEvent.click(firstCheckbox);
    
    // The checkbox state should have changed
    expect(firstCheckbox.checked).toBe(!initialChecked);
  });

  it('should display weekly progress percentages', () => {
    render(
      <TestWrapper>
        <CurriculumDashboard />
      </TestWrapper>
    );

    // Check that weekly progress percentages are displayed
    const progressTexts = screen.getAllByText(/\d+% 완료/);
    expect(progressTexts.length).toBeGreaterThan(0);
  });

  it('should render course names when week section is expanded', () => {
    render(
      <TestWrapper>
        <CurriculumDashboard />
      </TestWrapper>
    );

    // Initially, course names should not be visible (collapsed)
    expect(screen.queryByText(/QA 이슈 해결/)).not.toBeInTheDocument();

    // Expand the first week section
    const weekButtons = screen.getAllByRole('button', { expanded: false });
    const firstWeekButton = weekButtons[0];
    fireEvent.click(firstWeekButton);

    // Now course names should be visible
    expect(screen.getByText(/QA 이슈 해결/)).toBeInTheDocument();
    expect(screen.getByText(/상품 목록 페이지 추가 및 기능 구현/)).toBeInTheDocument();
  });
});