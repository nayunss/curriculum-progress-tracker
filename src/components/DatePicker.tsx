'use client';

import React, { useState, useCallback } from 'react';
import { validateDate, isValidDateString, type DateValidationOptions } from '../utils/dateValidation';
import ErrorMessage from './ErrorMessage';

interface DatePickerProps {
  /** Current date value */
  value?: Date;
  /** Callback when date changes */
  onChange: (date: Date | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Minimum allowed date */
  minDate?: Date;
  /** Maximum allowed date */
  maxDate?: Date;
  /** Custom className for styling */
  className?: string;
  /** Label for accessibility */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** ID for the input element */
  id?: string;
  /** Whether to warn about future dates */
  warnFutureDates?: boolean;
  /** Whether to require future dates only */
  requireFutureDates?: boolean;
  /** Whether to disallow future dates (only past/present allowed) */
  disallowFutureDates?: boolean;
  /** Custom validation options */
  validationOptions?: DateValidationOptions;
}

/**
 * DatePicker component using HTML5 date input with validation
 * 
 * Features:
 * - HTML5 date input for native date picker support
 * - Date validation (min/max dates)
 * - Error handling and display
 * - Accessibility support with ARIA attributes
 * - Responsive design
 * - Korean locale support
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = '날짜를 선택하세요',
  disabled = false,
  minDate,
  maxDate,
  className = '',
  label,
  required = false,
  error,
  id,
  warnFutureDates = false,
  requireFutureDates = false,
  disallowFutureDates = false,
  validationOptions = {}
}) => {
  const [internalError, setInternalError] = useState<string>('');

  // Convert Date to YYYY-MM-DD string format for HTML5 date input
  const formatDateForInput = useCallback((date: Date | undefined): string => {
    if (!date) return '';
    
    try {
      // Ensure we have a valid date
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('DatePicker: Invalid date format', error);
      return '';
    }
  }, []);

  // Convert YYYY-MM-DD string to Date object
  const parseDateFromInput = useCallback((dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    
    try {
      const date = new Date(dateString + 'T00:00:00');
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return undefined;
      }
      
      return date;
    } catch (error) {
      console.warn('DatePicker: Failed to parse date', error);
      return undefined;
    }
  }, []);

  // Enhanced date validation using the validation utility
  const validateDateValue = useCallback((date: Date | undefined): string => {
    const options: DateValidationOptions = {
      required,
      minDate,
      maxDate,
      warnFutureDates,
      requireFutureDates,
      disallowFutureDates,
      ...validationOptions
    };
    
    const result = validateDate(date, options);
    return result.errorMessage;
  }, [minDate, maxDate, required, warnFutureDates, requireFutureDates, disallowFutureDates, validationOptions]);

  // Handle date input change with enhanced validation
  const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // Don't process changes if disabled
    if (disabled) {
      return;
    }
    
    const inputValue = event.target.value;
    
    // Clear internal error first
    setInternalError('');
    
    // If empty input, validate if required and call onChange
    if (!inputValue) {
      const validationError = validateDateValue(undefined);
      if (validationError) {
        setInternalError(validationError);
      }
      onChange(undefined);
      return;
    }
    
    // Check if the input string is in valid format first
    if (!isValidDateString(inputValue)) {
      setInternalError('올바른 날짜 형식이 아닙니다.');
      return;
    }
    
    const parsedDate = parseDateFromInput(inputValue);
    
    // If parsing failed, show error
    if (!parsedDate) {
      setInternalError('올바른 날짜 형식이 아닙니다.');
      return;
    }
    
    // Validate the parsed date using enhanced validation
    const validationError = validateDateValue(parsedDate);
    if (validationError) {
      setInternalError(validationError);
      return;
    }
    
    // Date is valid, call onChange
    onChange(parsedDate);
  }, [disabled, onChange, parseDateFromInput, validateDateValue]);

  // Generate input props
  const inputValue = formatDateForInput(value);
  const minDateStr = minDate ? formatDateForInput(minDate) : undefined;
  const maxDateStr = maxDate ? formatDateForInput(maxDate) : undefined;
  
  // Determine which error to show (external or internal)
  const displayError = error || internalError;
  const hasError = Boolean(displayError);
  
  // Generate unique ID if not provided
  const inputId = id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  
  return (
    <div className={`date-picker-container ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="date-picker-label"
        >
          {label}
          {required && <span className="required-indicator" aria-label="필수">*</span>}
        </label>
      )}
      
      <div className="date-picker-input-wrapper">
        <input
          id={inputId}
          type="date"
          value={inputValue}
          onChange={handleDateChange}
          disabled={disabled}
          required={required}
          min={minDateStr}
          max={maxDateStr}
          className={`date-picker-input ${hasError ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          placeholder={placeholder}
        />
      </div>
      
      {hasError && (
        <ErrorMessage
          id={errorId}
          message={displayError}
          type="error"
          inline={true}
          showIcon={true}
        />
      )}
    </div>
  );
};

export default DatePicker;