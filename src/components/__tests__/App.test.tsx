import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the CurriculumDashboard component
vi.mock('../CurriculumDashboard', () => ({
  default: () => <div data-testid="curriculum-dashboard">Mocked CurriculumDashboard</div>
}));

describe('App Component', () => {
  it('should render the main application layout', () => {
    render(<App />);
    
    // Check for main structural elements
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should render the application header with title and description', () => {
    render(<App />);
    
    // Check for main title
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('커리큘럼 진행률 관리')).toBeInTheDocument();
    
    // Check for description
    expect(screen.getByText('7주차 개발 커리큘럼의 진행 상황을 체계적으로 추적하고 관리하세요')).toBeInTheDocument();
  });

  it('should display version information', () => {
    render(<App />);
    
    expect(screen.getByText('v1.0')).toBeInTheDocument();
  });

  it('should render the CurriculumDashboard component', () => {
    render(<App />);
    
    expect(screen.getByTestId('curriculum-dashboard')).toBeInTheDocument();
  });

  it('should render footer with system information', () => {
    render(<App />);
    
    expect(screen.getByText('커리큘럼 진행률 관리 시스템')).toBeInTheDocument();
    expect(screen.getByText('데이터는 브라우저 로컬 스토리지에 자동 저장됩니다')).toBeInTheDocument();
  });

  it('should have proper semantic HTML structure', () => {
    render(<App />);
    
    // Check for semantic elements
    const header = document.querySelector('header');
    const main = screen.getByRole('main');
    const footer = screen.getByRole('contentinfo');
    
    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    
    // Check for proper class names
    expect(header).toHaveClass('app-header');
    expect(main).toHaveClass('app-main');
    expect(footer).toHaveClass('app-footer');
  });

  it('should have responsive layout classes', () => {
    render(<App />);
    
    const appLayout = document.querySelector('.app-layout');
    expect(appLayout).toBeInTheDocument();
    
    // Check for responsive flex classes in header
    const headerContent = document.querySelector('.flex.flex-col.sm\\:flex-row');
    expect(headerContent).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<App />);
    
    const main = screen.getByRole('main');
    const footer = screen.getByRole('contentinfo');
    
    expect(main).toHaveAttribute('role', 'main');
    expect(footer).toHaveAttribute('role', 'contentinfo');
  });

  it('should render all text content correctly', () => {
    render(<App />);
    
    // Test all static text content
    const expectedTexts = [
      '커리큘럼 진행률 관리',
      '7주차 개발 커리큘럼의 진행 상황을 체계적으로 추적하고 관리하세요',
      'v1.0',
      '커리큘럼 진행률 관리 시스템',
      '데이터는 브라우저 로컬 스토리지에 자동 저장됩니다'
    ];
    
    expectedTexts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('should have container classes for proper layout', () => {
    render(<App />);
    
    const containers = document.querySelectorAll('.container');
    expect(containers.length).toBeGreaterThanOrEqual(3); // Header, main, footer containers
  });
});