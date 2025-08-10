import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CourseRow, { CourseCard } from '../CourseRow';
import { Course } from '../../types/curriculum';

// Mock the context to avoid complex setup
const mockDispatch = vi.fn();
vi.mock('../../context/CurriculumContext', async () => {
  const actual = await vi.importActual('../../context/CurriculumContext');
  return {
    ...actual,
    useCurriculum: () => ({
      dispatch: mockDispatch,
      state: {
        weeks: [],
        overallProgress: 0
      }
    })
  };
});

const mockCourse: Course = {
  id: 'test-1',
  name: 'Test Course',
  startDate: undefined,
  endDate: undefined,
  completed: false
};

const completedCourse: Course = {
  id: 'test-2',
  name: 'Completed Course',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  completed: true
};

describe('CourseRow', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('renders course information correctly', () => {
    render(
      <table>
        <tbody>
          <CourseRow course={mockCourse} weekId={1} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('시작일 선택')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('종료일 선택')).toBeInTheDocument();
    expect(screen.getByText('미완료')).toBeInTheDocument();
  });

  it('displays completed course correctly', () => {
    render(
      <table>
        <tbody>
          <CourseRow course={completedCourse} weekId={1} />
        </tbody>
      </table>
    );

    expect(screen.getByText('Completed Course')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('handles completion toggle', () => {
    render(
      <table>
        <tbody>
          <CourseRow course={mockCourse} weekId={1} />
        </tbody>
      </table>
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_COMPLETION',
      payload: {
        weekId: 1,
        courseId: 'test-1'
      }
    });
  });

  it('handles start date change', () => {
    render(
      <table>
        <tbody>
          <CourseRow course={mockCourse} weekId={1} />
        </tbody>
      </table>
    );

    const startDateInput = screen.getByPlaceholderText('시작일 선택');
    // Use a past date (start date should allow past dates)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const pastDateString = pastDate.toISOString().split('T')[0];
    
    fireEvent.change(startDateInput, { target: { value: pastDateString } });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_START_DATE',
      payload: {
        weekId: 1,
        courseId: 'test-1',
        date: new Date(pastDateString + 'T00:00:00')
      }
    });
  });

  it('handles end date change', () => {
    render(
      <table>
        <tbody>
          <CourseRow course={mockCourse} weekId={1} />
        </tbody>
      </table>
    );

    const endDateInput = screen.getByPlaceholderText('종료일 선택');
    // Use a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    fireEvent.change(endDateInput, { target: { value: futureDateString } });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_END_DATE',
      payload: {
        weekId: 1,
        courseId: 'test-1',
        date: new Date(futureDateString + 'T00:00:00')
      }
    });
  });

  it('validates date order and shows error', () => {
    // Create dates where start date is after end date
    const pastEndDate = new Date();
    pastEndDate.setDate(pastEndDate.getDate() - 5);
    const pastStartDate = new Date();
    pastStartDate.setDate(pastStartDate.getDate() - 1); // Start date after end date
    
    const courseWithDates: Course = {
      ...mockCourse,
      startDate: pastStartDate,
      endDate: pastEndDate
    };

    render(
      <table>
        <tbody>
          <CourseRow course={courseWithDates} weekId={1} />
        </tbody>
      </table>
    );

    // Try to set start date even later (after end date)
    const startDateInput = screen.getByPlaceholderText('시작일 선택');
    const laterPastDate = new Date();
    laterPastDate.setDate(laterPastDate.getDate() - 2); // Still after the end date
    const laterPastDateString = laterPastDate.toISOString().split('T')[0];
    
    fireEvent.change(startDateInput, { target: { value: laterPastDateString } });

    // Should show error message (multiple instances expected)
    const errorMessages = screen.getAllByText('시작일은 종료일보다 이전이어야 합니다.');
    expect(errorMessages.length).toBeGreaterThan(0);
    
    // Should not dispatch action when validation fails
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

describe('CourseCard', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('renders mobile card correctly', () => {
    render(<CourseCard course={mockCourse} weekId={1} />);

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('시작일:')).toBeInTheDocument();
    expect(screen.getByText('종료일:')).toBeInTheDocument();
    expect(screen.getByText('미완료')).toBeInTheDocument();
  });

  it('handles completion toggle in mobile card', () => {
    render(<CourseCard course={mockCourse} weekId={1} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_COMPLETION',
      payload: {
        weekId: 1,
        courseId: 'test-1'
      }
    });
  });

  it('shows date validation error in mobile card', () => {
    // Create dates where start date is after end date
    const pastEndDate = new Date();
    pastEndDate.setDate(pastEndDate.getDate() - 5);
    const pastStartDate = new Date();
    pastStartDate.setDate(pastStartDate.getDate() - 1); // Start date after end date
    
    const courseWithDates: Course = {
      ...mockCourse,
      startDate: pastStartDate,
      endDate: pastEndDate
    };

    render(<CourseCard course={courseWithDates} weekId={1} />);

    // Try to set start date even later (after end date)
    const startDateString = pastStartDate.toISOString().split('T')[0];
    const startDateInput = screen.getByDisplayValue(startDateString);
    const laterPastDate = new Date();
    laterPastDate.setDate(laterPastDate.getDate() - 2); // Still after the end date
    const laterPastDateString = laterPastDate.toISOString().split('T')[0];
    
    fireEvent.change(startDateInput, { target: { value: laterPastDateString } });

    expect(screen.getByText('시작일은 종료일보다 이전이어야 합니다.')).toBeInTheDocument();
  });
});