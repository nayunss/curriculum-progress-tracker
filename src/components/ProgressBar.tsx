'use client';

import React from 'react';

interface ProgressBarProps {
  /** Progress value between 0 and 100 */
  progress: number;
  /** Optional label for accessibility */
  label?: string;
  /** Size variant of the progress bar */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the percentage text */
  showPercentage?: boolean;
  /** Custom className for styling */
  className?: string;
}

/**
 * ProgressBar component for visualizing progress with color-coded states
 * 
 * Color logic:
 * - 0-30%: Red (low progress)
 * - 31-70%: Yellow (medium progress) 
 * - 71-100%: Green (high progress)
 * 
 * Features:
 * - Smooth animation transitions
 * - Accessibility support with ARIA attributes
 * - Responsive design
 * - Color-coded progress states
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  size = 'medium',
  showPercentage = false,
  className = ''
}) => {
  // Ensure progress is within valid range
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // Determine color class based on progress value
  const getProgressColorClass = (value: number): string => {
    if (value <= 30) return 'low';
    if (value <= 70) return 'medium';
    return 'high';
  };

  // Get size-specific classes
  const getSizeClasses = (sizeVariant: string): string => {
    switch (sizeVariant) {
      case 'small':
        return 'progress-bar-small';
      case 'large':
        return 'progress-bar-large';
      default:
        return 'progress-bar-medium';
    }
  };

  const colorClass = getProgressColorClass(normalizedProgress);
  const sizeClass = getSizeClasses(size);
  const progressLabel = label || `진행률 ${normalizedProgress}%`;

  return (
    <div className={`progress-container ${className}`}>
      <div 
        className={`progress-bar ${sizeClass}`}
        role="progressbar"
        aria-valuenow={normalizedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={progressLabel}
      >
        <div 
          className={`progress-fill ${colorClass}`}
          style={{ 
            width: `${normalizedProgress}%`,
            // Add a subtle animation delay for smoother transitions
            transitionDelay: '0.1s'
          }}
        />
      </div>
      
      {showPercentage && (
        <div className="progress-text">
          <span className="text-responsive-sm text-muted-foreground">
            {normalizedProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;