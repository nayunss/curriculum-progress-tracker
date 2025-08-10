'use client';

import React from 'react';

export interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Type of error for styling */
  type?: 'error' | 'warning' | 'info';
  /** Whether to show an icon */
  showIcon?: boolean;
  /** Custom className for styling */
  className?: string;
  /** ID for the error message element */
  id?: string;
  /** Whether the error is inline or block */
  inline?: boolean;
  /** Callback when error is dismissed (if dismissible) */
  onDismiss?: () => void;
  /** Whether the error can be dismissed */
  dismissible?: boolean;
}

/**
 * ErrorMessage component for displaying validation errors and warnings
 * 
 * Features:
 * - Different error types with appropriate styling
 * - Accessibility support with ARIA attributes
 * - Optional icons and dismiss functionality
 * - Responsive design
 * - Support for inline and block layouts
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  showIcon = true,
  className = '',
  id,
  inline = false,
  onDismiss,
  dismissible = false
}) => {
  if (!message) return null;

  // Generate unique ID if not provided
  const errorId = id || `error-${Math.random().toString(36).substr(2, 9)}`;

  // Get icon based on error type
  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (type) {
      case 'error':
        return '⚠';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '⚠';
    }
  };

  // Get ARIA role based on error type
  const getAriaRole = () => {
    switch (type) {
      case 'error':
        return 'alert';
      case 'warning':
        return 'alert';
      case 'info':
        return 'status';
      default:
        return 'alert';
    }
  };

  const baseClasses = [
    'error-message',
    `error-message-${type}`,
    inline ? 'error-message-inline' : 'error-message-block',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      id={errorId}
      className={baseClasses}
      role={getAriaRole()}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="error-message-content">
        {showIcon && (
          <span className="error-message-icon" aria-hidden="true">
            {getIcon()}
          </span>
        )}
        <span className="error-message-text">
          {message}
        </span>
        {dismissible && onDismiss && (
          <button
            type="button"
            className="error-message-dismiss"
            onClick={onDismiss}
            aria-label="오류 메시지 닫기"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;