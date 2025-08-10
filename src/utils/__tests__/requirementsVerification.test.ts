import { describe, it, expect } from 'vitest';
import {
  validateDate,
  validateDateRange,
  validateCourseDate,
  isValidDateString,
  type DateValidationOptions
} from '../dateValidation';

/**
 * Integration tests to verify that all requirements from task 14 are met
 * 
 * Task 14 requirements:
 * - 시작일/종료일 유효성 검사 로직 구현
 * - 에러 메시지 표시 컴포넌트 생성
 * - 잘못된 날짜 입력 시 처리 로직 구현
 * - Requirements: 3.5
 */
describe('Requirements Verification - Task 14: Date Validation and Error Handling', () => {
  describe('Requirement 3.5: Date Validation Logic', () => {
    it('validates start date before end date constraint', () => {
      // Test case: Start date after end date should be invalid
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-01-15');
      
      const result = validateDateRange(startDate, endDate);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('시작일은 종료일보다 이전이어야 합니다.');
      expect(result.errorType).toBe('START_AFTER_END');
    });

    it('validates date format correctly', () => {
      // Test case: Invalid date format should be caught
      const invalidDate = new Date('invalid-date');
      
      const result = validateDate(invalidDate);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('올바른 날짜 형식이 아닙니다.');
      expect(result.errorType).toBe('INVALID_FORMAT');
    });

    it('validates date string format', () => {
      // Test valid formats
      expect(isValidDateString('2024-01-15')).toBe(true);
      expect(isValidDateString('2024-12-31')).toBe(true);
      
      // Test invalid formats
      expect(isValidDateString('2024-13-01')).toBe(false); // Invalid month
      expect(isValidDateString('2024-01-32')).toBe(false); // Invalid day
      expect(isValidDateString('invalid')).toBe(false);    // Invalid format
      expect(isValidDateString('')).toBe(false);           // Empty string
    });

    it('handles edge cases in date validation', () => {
      // Test same date for start and end (should be valid)
      const sameDate = new Date('2024-01-15');
      const sameDateResult = validateDateRange(sameDate, sameDate);
      expect(sameDateResult.isValid).toBe(true);
      
      // Test undefined dates (should be valid when not required)
      const undefinedResult = validateDateRange(undefined, undefined);
      expect(undefinedResult.isValid).toBe(true);
      
      // Test one undefined date (should be valid)
      const oneUndefinedResult = validateDateRange(sameDate, undefined);
      expect(oneUndefinedResult.isValid).toBe(true);
    });
  });

  describe('Comprehensive Date Validation Scenarios', () => {
    it('validates course dates with all constraints', () => {
      const options: DateValidationOptions = {
        required: false,
        warnFutureDates: true,
        minDate: new Date('2024-01-01'),
        maxDate: new Date('2024-12-31'),
        customMessages: {
          startAfterEnd: '시작일은 종료일보다 이전이어야 합니다.',
          futureDate: '미래 날짜가 설정되었습니다. 확인해주세요.',
          beforeMin: '날짜는 2024년 1월 1일 이후여야 합니다.',
          afterMax: '날짜는 2024년 12월 31일 이전이어야 합니다.'
        }
      };

      // Test valid course date scenario
      const validStartDate = new Date('2024-06-01');
      const validEndDate = new Date('2024-06-30');
      
      const startValidation = validateCourseDate(validStartDate, validEndDate, true, options);
      const endValidation = validateCourseDate(validEndDate, validStartDate, false, options);
      
      expect(startValidation.isValid).toBe(true);
      expect(endValidation.isValid).toBe(true);

      // Test invalid course date scenario (start after end)
      const invalidStartDate = new Date('2024-06-30');
      const invalidEndDate = new Date('2024-06-01');
      
      const invalidStartValidation = validateCourseDate(invalidStartDate, invalidEndDate, true, options);
      const invalidEndValidation = validateCourseDate(invalidEndDate, invalidStartDate, false, options);
      
      expect(invalidStartValidation.isValid).toBe(false);
      expect(invalidEndValidation.isValid).toBe(false);
      expect(invalidStartValidation.errorMessage).toBe('시작일은 종료일보다 이전이어야 합니다.');
    });

    it('handles future date warnings', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future
      
      const options: DateValidationOptions = {
        warnFutureDates: true
      };
      
      const result = validateDate(futureDate, options);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('미래 날짜는 권장되지 않습니다.');
      expect(result.errorType).toBe('FUTURE_DATE');
    });

    it('validates min/max date constraints', () => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-12-31');
      
      const options: DateValidationOptions = {
        minDate,
        maxDate
      };

      // Test date before minimum
      const tooEarlyDate = new Date('2023-12-31');
      const tooEarlyResult = validateDate(tooEarlyDate, options);
      expect(tooEarlyResult.isValid).toBe(false);
      expect(tooEarlyResult.errorType).toBe('INVALID_RANGE');

      // Test date after maximum
      const tooLateDate = new Date('2025-01-01');
      const tooLateResult = validateDate(tooLateDate, options);
      expect(tooLateResult.isValid).toBe(false);
      expect(tooLateResult.errorType).toBe('INVALID_RANGE');

      // Test date within range
      const validDate = new Date('2024-06-15');
      const validResult = validateDate(validDate, options);
      expect(validResult.isValid).toBe(true);
    });
  });

  describe('Error Message Generation', () => {
    it('generates appropriate error messages for different validation failures', () => {
      // Test required field error
      const requiredResult = validateDate(undefined, { required: true });
      expect(requiredResult.errorMessage).toBe('날짜를 입력해주세요.');

      // Test invalid format error
      const invalidResult = validateDate(new Date('invalid'));
      expect(invalidResult.errorMessage).toBe('올바른 날짜 형식이 아닙니다.');

      // Test date range error
      const rangeResult = validateDateRange(
        new Date('2024-02-01'),
        new Date('2024-01-01')
      );
      expect(rangeResult.errorMessage).toBe('시작일은 종료일보다 이전이어야 합니다.');

      // Test custom error messages
      const customOptions: DateValidationOptions = {
        required: true,
        customMessages: {
          required: '커스텀 필수 메시지'
        }
      };
      const customResult = validateDate(undefined, customOptions);
      expect(customResult.errorMessage).toBe('커스텀 필수 메시지');
    });

    it('provides error types for different validation scenarios', () => {
      // Test all error types are properly assigned
      expect(validateDate(undefined, { required: true }).errorType).toBe('REQUIRED_FIELD');
      expect(validateDate(new Date('invalid')).errorType).toBe('INVALID_FORMAT');
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(validateDate(futureDate, { warnFutureDates: true }).errorType).toBe('FUTURE_DATE');
      
      expect(validateDateRange(
        new Date('2024-02-01'),
        new Date('2024-01-01')
      ).errorType).toBe('START_AFTER_END');
      
      expect(validateDate(
        new Date('2023-01-01'),
        { minDate: new Date('2024-01-01') }
      ).errorType).toBe('INVALID_RANGE');
    });
  });

  describe('Integration with Course Date Validation', () => {
    it('validates complete course date workflow', () => {
      // Simulate a complete course date validation workflow
      const courseStartDate = new Date('2024-01-15');
      const courseEndDate = new Date('2024-01-10'); // Invalid: end before start
      
      // Step 1: Validate start date individually
      const startDateValidation = validateCourseDate(
        courseStartDate,
        courseEndDate,
        true // isStartDate = true
      );
      
      // Step 2: Validate end date individually  
      const endDateValidation = validateCourseDate(
        courseEndDate,
        courseStartDate,
        false // isStartDate = false
      );
      
      // Both should fail due to date range validation
      expect(startDateValidation.isValid).toBe(false);
      expect(endDateValidation.isValid).toBe(false);
      expect(startDateValidation.errorType).toBe('START_AFTER_END');
      expect(endDateValidation.errorType).toBe('START_AFTER_END');
      
      // Step 3: Test with valid dates
      const validEndDate = new Date('2024-01-20');
      const validStartValidation = validateCourseDate(
        courseStartDate,
        validEndDate,
        true
      );
      const validEndValidation = validateCourseDate(
        validEndDate,
        courseStartDate,
        false
      );
      
      expect(validStartValidation.isValid).toBe(true);
      expect(validEndValidation.isValid).toBe(true);
    });

    it('handles partial date validation (only one date provided)', () => {
      const singleDate = new Date('2024-01-15');
      
      // When only start date is provided
      const startOnlyResult = validateCourseDate(singleDate, undefined, true);
      expect(startOnlyResult.isValid).toBe(true);
      
      // When only end date is provided
      const endOnlyResult = validateCourseDate(singleDate, undefined, false);
      expect(endOnlyResult.isValid).toBe(true);
    });
  });

  describe('Task 14 Completion Verification', () => {
    it('verifies all task 14 sub-requirements are implemented', () => {
      // Sub-requirement 1: 시작일/종료일 유효성 검사 로직 구현
      const dateRangeValidation = validateDateRange(
        new Date('2024-02-01'),
        new Date('2024-01-01')
      );
      expect(dateRangeValidation.isValid).toBe(false);
      expect(dateRangeValidation.errorMessage).toBeTruthy();
      
      // Sub-requirement 2: 에러 메시지 표시 컴포넌트 생성
      // (This is tested in ErrorMessage.test.tsx)
      
      // Sub-requirement 3: 잘못된 날짜 입력 시 처리 로직 구현
      const invalidDateHandling = validateDate(new Date('invalid'));
      expect(invalidDateHandling.isValid).toBe(false);
      expect(invalidDateHandling.errorMessage).toBe('올바른 날짜 형식이 아닙니다.');
      
      // Requirement 3.5: IF 시작일이 종료일보다 늦으면 THEN 시스템은 경고 메시지를 표시해야 한다
      const requirement35Validation = validateDateRange(
        new Date('2024-01-20'),
        new Date('2024-01-10')
      );
      expect(requirement35Validation.isValid).toBe(false);
      expect(requirement35Validation.errorMessage).toBe('시작일은 종료일보다 이전이어야 합니다.');
    });
  });
});