/**
 * Date validation utilities for curriculum tracker
 * Implements comprehensive date validation logic as per requirement 3.5
 */

export interface DateValidationResult {
  isValid: boolean;
  errorMessage: string;
  errorType?: 'INVALID_FORMAT' | 'START_AFTER_END' | 'FUTURE_DATE' | 'INVALID_RANGE' | 'REQUIRED_FIELD';
}

export interface DateValidationOptions {
  /** Whether the date field is required */
  required?: boolean;
  /** Minimum allowed date */
  minDate?: Date;
  /** Maximum allowed date */
  maxDate?: Date;
  /** Whether to warn about future dates */
  warnFutureDates?: boolean;
  /** Whether to require future dates only */
  requireFutureDates?: boolean;
  /** Whether to disallow future dates (only past/present allowed) */
  disallowFutureDates?: boolean;
  /** Custom error messages */
  customMessages?: {
    required?: string;
    invalidFormat?: string;
    startAfterEnd?: string;
    futureDate?: string;
    pastDate?: string;
    futureDateNotAllowed?: string;
    beforeMin?: string;
    afterMax?: string;
  };
}

/**
 * Default error messages in Korean
 */
const DEFAULT_ERROR_MESSAGES = {
  required: '날짜를 입력해주세요.',
  invalidFormat: '올바른 날짜 형식이 아닙니다.',
  startAfterEnd: '시작일은 종료일보다 이전이어야 합니다.',
  futureDate: '미래 날짜는 권장되지 않습니다.',
  pastDate: '미래 날짜만 선택할 수 있습니다.',
  futureDateNotAllowed: '미래 날짜는 선택할 수 없습니다.',
  beforeMin: '날짜는 {minDate} 이후여야 합니다.',
  afterMax: '날짜는 {maxDate} 이전이어야 합니다.',
};

/**
 * Validates a single date value
 */
export function validateDate(
  date: Date | undefined | null,
  options: DateValidationOptions = {}
): DateValidationResult {
  const messages = { ...DEFAULT_ERROR_MESSAGES, ...options.customMessages };

  // Check if required field is empty
  if (options.required && !date) {
    return {
      isValid: false,
      errorMessage: messages.required!,
      errorType: 'REQUIRED_FIELD'
    };
  }

  // If date is not provided and not required, it's valid
  if (!date) {
    return {
      isValid: true,
      errorMessage: ''
    };
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      errorMessage: messages.invalidFormat!,
      errorType: 'INVALID_FORMAT'
    };
  }

  // Check minimum date constraint
  if (options.minDate && date < options.minDate) {
    const minDateStr = options.minDate.toLocaleDateString('ko-KR');
    return {
      isValid: false,
      errorMessage: messages.beforeMin!.replace('{minDate}', minDateStr),
      errorType: 'INVALID_RANGE'
    };
  }

  // Check maximum date constraint
  if (options.maxDate && date > options.maxDate) {
    const maxDateStr = options.maxDate.toLocaleDateString('ko-KR');
    return {
      isValid: false,
      errorMessage: messages.afterMax!.replace('{maxDate}', maxDateStr),
      errorType: 'INVALID_RANGE'
    };
  }

  // Check if future dates are disallowed (for start dates)
  if (options.disallowFutureDates) {
    const today = getTodayAtMidnight();
    if (date > today) {
      return {
        isValid: false,
        errorMessage: messages.futureDateNotAllowed!,
        errorType: 'FUTURE_DATE'
      };
    }
  }

  // Check if future dates are required (for end dates)
  if (options.requireFutureDates) {
    const today = getTodayAtMidnight();
    if (date <= today) {
      return {
        isValid: false,
        errorMessage: messages.pastDate!,
        errorType: 'FUTURE_DATE'
      };
    }
  }

  // Warn about future dates if enabled (but don't fail validation)
  if (options.warnFutureDates && date > new Date()) {
    return {
      isValid: false,
      errorMessage: messages.futureDate!,
      errorType: 'FUTURE_DATE'
    };
  }

  return {
    isValid: true,
    errorMessage: ''
  };
}

/**
 * Validates start and end date relationship
 */
export function validateDateRange(
  startDate: Date | undefined | null,
  endDate: Date | undefined | null,
  options: DateValidationOptions = {}
): DateValidationResult {
  const messages = { ...DEFAULT_ERROR_MESSAGES, ...options.customMessages };

  // If either date is missing, we can't validate the range
  if (!startDate || !endDate) {
    return {
      isValid: true,
      errorMessage: ''
    };
  }

  // Check if both dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return {
      isValid: false,
      errorMessage: messages.invalidFormat!,
      errorType: 'INVALID_FORMAT'
    };
  }

  // Check if start date is after end date (start date can be equal to end date)
  if (startDate > endDate) {
    return {
      isValid: false,
      errorMessage: messages.startAfterEnd!,
      errorType: 'START_AFTER_END'
    };
  }

  return {
    isValid: true,
    errorMessage: ''
  };
}

/**
 * Comprehensive validation for course dates
 */
export function validateCourseDate(
  date: Date | undefined | null,
  otherDate: Date | undefined | null,
  isStartDate: boolean,
  options: DateValidationOptions = {}
): DateValidationResult {
  // First validate the individual date
  const singleDateValidation = validateDate(date, options);
  if (!singleDateValidation.isValid) {
    return singleDateValidation;
  }

  // Then validate the date range if both dates are present
  if (date && otherDate) {
    const startDate = isStartDate ? date : otherDate;
    const endDate = isStartDate ? otherDate : date;
    
    const rangeValidation = validateDateRange(startDate, endDate, options);
    if (!rangeValidation.isValid) {
      return rangeValidation;
    }
  }

  return {
    isValid: true,
    errorMessage: ''
  };
}

/**
 * Utility to check if a date string is in valid format (YYYY-MM-DD)
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString) return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString + 'T00:00:00');
  return !isNaN(date.getTime());
}

/**
 * Utility to format date for display in error messages
 */
export function formatDateForDisplay(date: Date): string {
  try {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Utility to get today's date at midnight for comparison
 */
export function getTodayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Utility to check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}