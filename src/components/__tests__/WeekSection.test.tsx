import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WeekSection from '../WeekSection';
import { Week } from '../../types/curriculum';
import { CurriculumProvider } from '../../context/CurriculumContext';

// Mock the ProgressBar component
vi.mock('../ProgressBar', () => ({
  default: ({ progress, label }: { progress: number; label: string }) => (
    <div data-testid="progress-bar" aria-label={label}>
      Progress: {progress}%
    </div>
  ),
}));

// Mock the useCurriculum hook
const mockDispatch = vi.fn();
vi.mock('../../context/CurriculumContext', async () => {
  const actual = await vi.importActual('../../context/CurriculumContext');
  return {
    ...actual,
    useCurriculum: () => ({
      dispatch: mockDispatch,
      state: {
        weeks: [],
        overallProgress: 0,
      },
    }),
  };
});

describe('WeekSection', () => {
  const mockWeek: Week = {
    id: 1,
    title: '1주차',
    progress: 50,
    courses: [
      {
        id: '1-1',
        name: 'QA 이슈 해결',
        completed: false,
      },
      {
        id: '1-2',
        name: '4장 > 상품 목록 페이지 추가 및 기능 구현',
        completed: true,
      },
    ],
  };

  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('renders week title and progress correctly', () => {
    render(<WeekSection week={mockWeek} />);
    
    expect(screen.getByText('1주차')).toBeInTheDocument();
    expect(screen.getByText('50% 완료 (1/2 과정)')).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('starts in collapsed state', () => {
    render(<WeekSection week={mockWeek} />);
    
    // Courses should not be visible initially
    expect(screen.queryByText('QA 이슈 해결')).not.toBeInTheDocument();
    expect(screen.queryByText('4장 > 상품 목록 페이지 추가 및 기능 구현')).not.toBeInTheDocument();
  });

  it('expands and shows courses when header is clicked', () => {
    render(<WeekSection week={mockWeek} />);
    
    const headerButton = screen.getByRole('button', { expanded: false });
    fireEvent.click(headerButton);
    
    // Courses should now be visible
    expect(screen.getByText('QA 이슈 해결')).toBeInTheDocument();
    expect(screen.getByText('4장 > 상품 목록 페이지 추가 및 기능 구현')).toBeInTheDocument();
    
    // Button should show expanded state
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
  });

  it('collapses when header is clicked again', () => {
    render(<WeekSection week={mockWeek} />);
    
    const headerButton = screen.getByRole('button');
    
    // Expand first
    fireEvent.click(headerButton);
    expect(screen.getByText('QA 이슈 해결')).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(headerButton);
    expect(screen.queryByText('QA 이슈 해결')).not.toBeInTheDocument();
  });

  it('displays course completion status correctly', () => {
    render(<WeekSection week={mockWeek} />);
    
    // Expand to see courses
    const headerButton = screen.getByRole('button');
    fireEvent.click(headerButton);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    
    // First course should be unchecked
    expect(checkboxes[0]).not.toBeChecked();
    
    // Second course should be checked
    expect(checkboxes[1]).toBeChecked();
  });

  it('dispatches TOGGLE_COMPLETION action when checkbox is clicked', () => {
    render(<WeekSection week={mockWeek} />);
    
    // Expand to see courses
    const headerButton = screen.getByRole('button');
    fireEvent.click(headerButton);
    
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(firstCheckbox);
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_COMPLETION',
      payload: { weekId: 1, courseId: '1-1' },
    });
  });

  it('shows course count summary when expanded', () => {
    render(<WeekSection week={mockWeek} />);
    
    // Expand to see courses
    const headerButton = screen.getByRole('button');
    fireEvent.click(headerButton);
    
    expect(screen.getByText('총 2개 과정 중 1개 완료')).toBeInTheDocument();
  });

  it('applies correct styling to completed courses', () => {
    render(<WeekSection week={mockWeek} />);
    
    // Expand to see courses
    const headerButton = screen.getByRole('button');
    fireEvent.click(headerButton);
    
    const completedCourse = screen.getByText('4장 > 상품 목록 페이지 추가 및 기능 구현');
    const incompleteCourse = screen.getByText('QA 이슈 해결');
    
    expect(completedCourse).toHaveClass('line-through', 'text-muted-foreground');
    expect(incompleteCourse).toHaveClass('text-foreground');
    expect(incompleteCourse).not.toHaveClass('line-through');
  });

  it('has proper accessibility attributes', () => {
    render(<WeekSection week={mockWeek} />);
    
    const headerButton = screen.getByRole('button');
    expect(headerButton).toHaveAttribute('aria-expanded', 'false');
    expect(headerButton).toHaveAttribute('aria-controls', 'week-1-content');
    
    // Expand to check content accessibility
    fireEvent.click(headerButton);
    
    expect(headerButton).toHaveAttribute('aria-expanded', 'true');
    
    const contentRegion = screen.getByRole('region');
    expect(contentRegion).toHaveAttribute('id', 'week-1-content');
    expect(contentRegion).toHaveAttribute('aria-labelledby', 'week-1-header');
    
    // Check checkbox labels
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('aria-label', 'QA 이슈 해결 완료 상태');
    expect(checkboxes[1]).toHaveAttribute('aria-label', '4장 > 상품 목록 페이지 추가 및 기능 구현 완료 상태');
  });

  it('handles empty course list', () => {
    const emptyWeek: Week = {
      id: 2,
      title: '2주차',
      progress: 0,
      courses: [],
    };

    render(<WeekSection week={emptyWeek} />);
    
    expect(screen.getByText('0% 완료 (0/0 과정)')).toBeInTheDocument();
    
    // Expand to see empty state
    const headerButton = screen.getByRole('button');
    fireEvent.click(headerButton);
    
    expect(screen.getByText('총 0개 과정 중 0개 완료')).toBeInTheDocument();
  });
});