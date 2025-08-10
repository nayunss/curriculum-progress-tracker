import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CourseTable from '../CourseTable';
import { Course } from '../../types/curriculum';

// Mock courses data for testing
const mockCourses: Course[] = [
  {
    id: '1-1',
    name: 'QA 이슈 해결',
    completed: false,
  },
  {
    id: '1-2',
    name: '4장 > 상품 목록 페이지 추가 및 기능 구현',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-20'),
    completed: true,
  },
];

const emptyCourses: Course[] = [];

describe('CourseTable', () => {
  it('renders table headers correctly', () => {
    render(<CourseTable courses={mockCourses} weekId={1} />);
    
    // Check table headers
    expect(screen.getByText('과정명')).toBeInTheDocument();
    expect(screen.getByText('시작일')).toBeInTheDocument();
    expect(screen.getByText('종료일')).toBeInTheDocument();
    expect(screen.getByText('수행여부')).toBeInTheDocument();
  });

  it('renders course data correctly in desktop table', () => {
    render(<CourseTable courses={mockCourses} weekId={1} />);
    
    // Check course names (should appear in both desktop and mobile views)
    expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    expect(screen.getAllByText('4장 > 상품 목록 페이지 추가 및 기능 구현')).toHaveLength(2);
    
    // Check completion status (should appear in both desktop and mobile views)
    expect(screen.getAllByText('미완료')).toHaveLength(2);
    expect(screen.getAllByText('완료')).toHaveLength(2);
  });

  it('displays dates correctly when provided', () => {
    render(<CourseTable courses={mockCourses} weekId={1} />);
    
    // Check formatted dates (Korean locale) - should appear in both desktop and mobile views
    expect(screen.getAllByText('2024. 1. 15.')).toHaveLength(2);
    expect(screen.getAllByText('2024. 1. 20.')).toHaveLength(2);
  });

  it('displays placeholder for missing dates', () => {
    render(<CourseTable courses={mockCourses} weekId={1} />);
    
    // Check for date placeholders
    const placeholders = screen.getAllByText('날짜 미설정');
    expect(placeholders).toHaveLength(2); // Two missing dates for first course
  });

  it('renders mobile card view structure', () => {
    render(<CourseTable courses={mockCourses} weekId={1} />);
    
    // Check mobile card structure exists
    const mobileContainer = document.querySelector('.course-table-mobile');
    expect(mobileContainer).toBeInTheDocument();
    
    const cardContainer = document.querySelector('.course-cards-container');
    expect(cardContainer).toBeInTheDocument();
  });

  it('shows empty state when no courses provided', () => {
    render(<CourseTable courses={emptyCourses} weekId={1} />);
    
    expect(screen.getByText('이 주차에는 등록된 과정이 없습니다.')).toBeInTheDocument();
  });

  it('applies correct CSS classes for responsive design', () => {
    render(<CourseTable courses={mockCourses} weekId={1} />);
    
    // Check main container classes
    const container = document.querySelector('.course-table-container');
    expect(container).toBeInTheDocument();
    
    // Check desktop table classes
    const desktopTable = document.querySelector('.course-table-desktop');
    expect(desktopTable).toBeInTheDocument();
    
    // Check mobile view classes
    const mobileView = document.querySelector('.course-table-mobile');
    expect(mobileView).toBeInTheDocument();
  });

  it('renders table with proper semantic structure', () => {
    render(<CourseTable courses={mockCourses} weekId={1} />);
    
    // Check table semantic structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Check column headers
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(4);
    
    // Check table rows (excluding header)
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // 1 header + 2 data rows
  });

  it('applies correct status indicator classes', () => {
    render(<CourseTable courses={mockCourses} weekId={1} />);
    
    // Check status indicators
    const completedStatus = document.querySelector('.status-indicator.completed');
    const pendingStatus = document.querySelector('.status-indicator.pending');
    
    expect(completedStatus).toBeInTheDocument();
    expect(pendingStatus).toBeInTheDocument();
  });
});