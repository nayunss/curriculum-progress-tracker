import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CurriculumOverviewPage from '../page';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('CurriculumOverviewPage', () => {
  it('renders page title and description', () => {
    render(<CurriculumOverviewPage />);
    
    expect(screen.getByText('커리큘럼 개요')).toBeInTheDocument();
    expect(screen.getByText(/전체 \d+주차 커리큘럼을 한 눈에 확인하세요/)).toBeInTheDocument();
  });

  it('displays statistics cards', () => {
    render(<CurriculumOverviewPage />);
    
    expect(screen.getByText('전체 기간')).toBeInTheDocument();
    expect(screen.getByText('총 과정 수')).toBeInTheDocument();
    expect(screen.getByText('주당 평균 과정')).toBeInTheDocument();
  });

  it('shows navigation link to main page', () => {
    render(<CurriculumOverviewPage />);
    
    const backLink = screen.getByText('진도 관리로 돌아가기');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('displays curriculum data in desktop table', () => {
    render(<CurriculumOverviewPage />);
    
    // Check table headers
    expect(screen.getByText('주차')).toBeInTheDocument();
    expect(screen.getByText('과정명')).toBeInTheDocument();
    expect(screen.getByText('과정 수')).toBeInTheDocument();
  });

  it('displays curriculum data in mobile cards', () => {
    render(<CurriculumOverviewPage />);
    
    // Check for week titles (should appear in both desktop and mobile views)
    expect(screen.getAllByText('1주차')).toHaveLength(2); // Desktop table + mobile card
    expect(screen.getAllByText('2주차')).toHaveLength(2);
  });

  it('shows course names from curriculum data', () => {
    render(<CurriculumOverviewPage />);
    
    // Check for some specific course names (appear in both desktop and mobile views)
    expect(screen.getAllByText('QA 이슈 해결')).toHaveLength(2);
    expect(screen.getAllByText('5장 > 컴포넌트 분리')).toHaveLength(2);
  });

  it('displays footer information', () => {
    render(<CurriculumOverviewPage />);
    
    expect(screen.getByText((content) => {
      return content.includes('개 과정으로 구성된') && content.includes('주차 커리큘럼입니다');
    })).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<CurriculumOverviewPage />);
    
    // Check for proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('커리큘럼 개요');
  });
});