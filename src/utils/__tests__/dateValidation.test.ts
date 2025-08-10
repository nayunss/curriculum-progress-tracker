import { describe, it, expect } from 'vitest';
import {
  validateDate,
  validateDateRange,
  validateCourseDate,
  isValidDateString,
  formatDateForDisplay,
  getTodayAtMidnight,
  isSameDay,
  type DateValidationOptions
} from '../dateValidation';

describe('dateValidation utilities', () => {
  describe('validateDate', () => {
    it('should return valid for undefined date when not required', () => {
      const result = validateDate(undefined);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should return invalid for undefined date when required', () => {
      const result = validateDate(undefined, { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('날짜를 입력해주세요.');
      expect(result.errorType).toBe('REQUIRED_FIELD');
    });

    it('should return invalid for invalid date', () => {
      const invalidDate = new Date('invalid');
      const result = validateDate(invalidDate);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('올바른 날짜 형식이 아닙니다.');
      expect(result.errorType).toBe('INVALID_FORMAT');
    });

    it('should return valid for valid date', () => {
      const validDate = new Date('2024-01-15');
      const result = validateDate(validDate);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should validate minDate constraint', () => {
      const date = new Date('2024-01-05');
      const minDate = new Date('2024-01-10');
      const result = validateDate(date, { minDate });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('이후여야 합니다');
      expect(result.errorType).toBe('INVALID_RANGE');
    });

    it('should validate maxDate constraint', () => {
      const date = new Date('2024-01-25');
      const maxDate = new Date('2024-01-20');
      const result = validateDate(date, { maxDate });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('이전이어야 합니다');
      expect(result.errorType).toBe('INVALID_RANGE');
    });

    it('should warn about future dates when enabled', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const result = validateDate(futureDate, { warnFutureDates: true });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('미래 날짜는 권장되지 않습니다.');
      expect(result.errorType).toBe('FUTURE_DATE');
    });

    it('should require future dates when enabled', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const result = validateDate(pastDate, { requireFutureDates: true });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('미래 날짜만 선택할 수 있습니다.');
      expect(result.errorType).toBe('FUTURE_DATE');
    });

    it('should allow future dates when requireFutureDates is enabled', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const result = validateDate(futureDate, { requireFutureDates: true });
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should disallow future dates when disallowFutureDates is enabled', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const result = validateDate(futureDate, { disallowFutureDates: true });
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('미래 날짜는 선택할 수 없습니다.');
      expect(result.errorType).toBe('FUTURE_DATE');
    });

    it('should allow past/present dates when disallowFutureDates is enabled', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const result = validateDate(pastDate, { disallowFutureDates: true });
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should use custom error messages', () => {
      const customMessages = {
        required: '커스텀 필수 메시지'
      };
      const result = validateDate(undefined, { required: true, customMessages });
      expect(result.errorMessage).toBe('커스텀 필수 메시지');
    });
  });

  describe('validateDateRange', () => {
    it('should return valid when either date is missing', () => {
      const result1 = validateDateRange(undefined, new Date('2024-01-15'));
      const result2 = validateDateRange(new Date('2024-01-15'), undefined);
      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });

    it('should return invalid when start date is after end date', () => {
      const startDate = new Date('2024-01-20');
      const endDate = new Date('2024-01-15');
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('시작일은 종료일보다 이전이어야 합니다.');
      expect(result.errorType).toBe('START_AFTER_END');
    });

    it('should return valid when start date is before end date', () => {
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-20');
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should return valid when dates are the same', () => {
      const date = new Date('2024-01-15');
      const result = validateDateRange(date, date);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBe('');
    });

    it('should handle invalid dates', () => {
      const invalidDate = new Date('invalid');
      const validDate = new Date('2024-01-15');
      const result = validateDateRange(invalidDate, validDate);
      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('INVALID_FORMAT');
    });
  });

  describe('validateCourseDate', () => {
    it('should validate start date correctly', () => {
      const startDate = new Date('2024-01-20');
      const endDate = new Date('2024-01-15');
      const result = validateCourseDate(startDate, endDate, true);
      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('START_AFTER_END');
    });

    it('should validate end date correctly', () => {
      const startDate = new Date('2024-01-20');
      const endDate = new Date('2024-01-15');
      const result = validateCourseDate(endDate, startDate, false);
      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('START_AFTER_END');
    });

    it('should validate individual date first', () => {
      const invalidDate = new Date('invalid');
      const validDate = new Date('2024-01-15');
      const result = validateCourseDate(invalidDate, validDate, true);
      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe('INVALID_FORMAT');
    });

    it('should return valid when only one date is provided', () => {
      const date = new Date('2024-01-15');
      const result = validateCourseDate(date, undefined, true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('isValidDateString', () => {
    it('should return true for valid date string', () => {
      expect(isValidDateString('2024-01-15')).toBe(true);
      expect(isValidDateString('2024-12-31')).toBe(true);
    });

    it('should return false for invalid date string', () => {
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString('invalid')).toBe(false);
      expect(isValidDateString('2024-13-01')).toBe(false);
      expect(isValidDateString('2024-01-32')).toBe(false);
      expect(isValidDateString('24-01-15')).toBe(false);
    });

    it('should return false for wrong format', () => {
      expect(isValidDateString('01/15/2024')).toBe(false);
      expect(isValidDateString('15-01-2024')).toBe(false);
      expect(isValidDateString('2024/01/15')).toBe(false);
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format date in Korean locale', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDateForDisplay(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('1');
      expect(formatted).toContain('15');
    });

    it('should handle invalid date gracefully', () => {
      const invalidDate = new Date('invalid');
      const formatted = formatDateForDisplay(invalidDate);
      expect(typeof formatted).toBe('string');
    });
  });

  describe('getTodayAtMidnight', () => {
    it('should return today at midnight', () => {
      const today = getTodayAtMidnight();
      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
      expect(today.getSeconds()).toBe(0);
      expect(today.getMilliseconds()).toBe(0);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2024-01-15T10:30:00');
      const date2 = new Date('2024-01-15T15:45:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2024-01-15T10:30:00');
      const date2 = new Date('2024-01-16T10:30:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for different months', () => {
      const date1 = new Date('2024-01-15T10:30:00');
      const date2 = new Date('2024-02-15T10:30:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('should return false for different years', () => {
      const date1 = new Date('2024-01-15T10:30:00');
      const date2 = new Date('2025-01-15T10:30:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('Requirements Verification', () => {
    // Requirement 3.5: 날짜 유효성 검사
    it('should validate start date before end date (Requirement 3.5)', () => {
      const startDate = new Date('2024-01-20');
      const endDate = new Date('2024-01-15');
      const result = validateDateRange(startDate, endDate);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('시작일은 종료일보다 이전이어야 합니다.');
    });

    it('should show warning message for invalid dates (Requirement 3.5)', () => {
      const invalidDate = new Date('invalid');
      const result = validateDate(invalidDate);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('올바른 날짜 형식이 아닙니다.');
    });

    it('should handle date range validation comprehensively (Requirement 3.5)', () => {
      const options: DateValidationOptions = {
        required: true,
        warnFutureDates: true,
        minDate: new Date('2024-01-01'),
        maxDate: new Date('2024-12-31')
      };

      // Test required validation
      const requiredResult = validateDate(undefined, options);
      expect(requiredResult.isValid).toBe(false);

      // Test min date validation
      const minDateResult = validateDate(new Date('2023-12-31'), options);
      expect(minDateResult.isValid).toBe(false);

      // Test max date validation
      const maxDateResult = validateDate(new Date('2025-01-01'), options);
      expect(maxDateResult.isValid).toBe(false);

      // Test valid date
      const validResult = validateDate(new Date('2024-06-15'), options);
      expect(validResult.isValid).toBe(true);
    });
  });
});