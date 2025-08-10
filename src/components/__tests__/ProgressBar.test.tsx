import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProgressBar from '../ProgressBar';

describe('ProgressBar Component', () => {
  it('renders with correct progress value', () => {
    render(<ProgressBar progress={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays correct color class for low progress (0-30%)', () => {
    render(<ProgressBar progress={25} />);
    
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveClass('low');
  });

  it('displays correct color class for medium progress (31-70%)', () => {
    render(<ProgressBar progress={50} />);
    
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveClass('medium');
  });

  it('displays correct color class for high progress (71-100%)', () => {
    render(<ProgressBar progress={85} />);
    
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveClass('high');
  });

  it('handles progress values outside valid range', () => {
    render(<ProgressBar progress={150} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('handles negative progress values', () => {
    render(<ProgressBar progress={-10} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<ProgressBar progress={50} size="small" />);
    expect(document.querySelector('.progress-bar')).toHaveClass('progress-bar-small');

    rerender(<ProgressBar progress={50} size="medium" />);
    expect(document.querySelector('.progress-bar')).toHaveClass('progress-bar-medium');

    rerender(<ProgressBar progress={50} size="large" />);
    expect(document.querySelector('.progress-bar')).toHaveClass('progress-bar-large');
  });

  it('shows percentage when showPercentage is true', () => {
    render(<ProgressBar progress={75} showPercentage={true} />);
    
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides percentage when showPercentage is false', () => {
    render(<ProgressBar progress={75} showPercentage={false} />);
    
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('uses custom label for accessibility', () => {
    const customLabel = '커스텀 진행률 75%';
    render(<ProgressBar progress={75} label={customLabel} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', customLabel);
  });

  it('applies custom className', () => {
    render(<ProgressBar progress={50} className="custom-class" />);
    
    const container = document.querySelector('.progress-container');
    expect(container).toHaveClass('custom-class');
  });

  it('has correct width style for progress fill', () => {
    render(<ProgressBar progress={60} />);
    
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle({ width: '60%' });
  });
});