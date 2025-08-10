'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Course } from '../types/curriculum';
import { useCurriculum } from '../context/CurriculumContext';
import DatePicker from './DatePicker';
import ErrorMessage from './ErrorMessage';
import { validateCourseDate, validateDateRange, type DateValidationOptions } from '../utils/dateValidation';

/**
 * CourseRow component props
 */
interface CourseRowProps {
  course: Course;
  weekId: number;
}

/**
 * CourseRow component that displays individual course information
 * with interactive date pickers and completion checkbox
 * 
 * Implements requirements:
 * - 3.1: Display course name, start date, end date, completion status
 * - 3.2: Interactive start date picker
 * - 3.3: Interactive end date picker  
 * - 3.4: Date validation and event handling
 */
const CourseRow: React.FC<CourseRowProps> = ({ course, weekId }) => {
  const { dispatch } = useCurriculum();
  const [dateError, setDateError] = useState<string>('');
  const [startDateError, setStartDateError] = useState<string>('');
  const [endDateError, setEndDateError] = useState<string>('');

  // Enhanced date validation options for start date (memoized to prevent re-renders)
  const startDateValidationOptions: DateValidationOptions = useMemo(() => ({
    disallowFutureDates: true,
    customMessages: {
      startAfterEnd: '시작일은 종료일보다 이전이어야 합니다.',
      futureDateNotAllowed: '시작일은 미래 날짜를 선택할 수 없습니다.',
      invalidFormat: '올바른 날짜 형식이 아닙니다.'
    }
  }), []);

  // Enhanced date validation options for end date (memoized to prevent re-renders)
  const endDateValidationOptions: DateValidationOptions = useMemo(() => ({
    customMessages: {
      startAfterEnd: '종료일은 시작일보다 이후여야 합니다.',
      invalidFormat: '올바른 날짜 형식이 아닙니다.'
    }
  }), []);

  // Validate date range
  const validateDates = useCallback((startDate?: Date, endDate?: Date): string => {
    const result = validateDateRange(startDate, endDate, startDateValidationOptions);
    return result.errorMessage;
  }, [startDateValidationOptions]);

  // Handle start date change with enhanced validation
  const handleStartDateChange = useCallback((date: Date | undefined) => {
    // Clear any existing errors
    setDateError('');
    setStartDateError('');
    
    // Validate the start date individually
    const startDateValidation = validateCourseDate(date, course.endDate, true, startDateValidationOptions);
    if (!startDateValidation.isValid) {
      setStartDateError(startDateValidation.errorMessage);
      return;
    }
    
    // Validate the overall date range
    const rangeError = validateDates(date, course.endDate);
    if (rangeError) {
      setDateError(rangeError);
      return;
    }
    
    // Date is valid, dispatch action to update start date
    dispatch({
      type: 'SET_START_DATE',
      payload: {
        weekId,
        courseId: course.id,
        date
      }
    });
  }, [dispatch, weekId, course.id, course.endDate, validateDates, startDateValidationOptions]);

  // Handle end date change with enhanced validation
  const handleEndDateChange = useCallback((date: Date | undefined) => {
    // Clear any existing errors
    setDateError('');
    setEndDateError('');
    
    // Validate the end date individually
    const endDateValidation = validateCourseDate(date, course.startDate, false, endDateValidationOptions);
    if (!endDateValidation.isValid) {
      setEndDateError(endDateValidation.errorMessage);
      return;
    }
    
    // Validate the overall date range
    const rangeError = validateDates(course.startDate, date);
    if (rangeError) {
      setDateError(rangeError);
      return;
    }
    
    // Date is valid, dispatch action to update end date
    dispatch({
      type: 'SET_END_DATE',
      payload: {
        weekId,
        courseId: course.id,
        date
      }
    });
  }, [dispatch, weekId, course.id, course.startDate, validateDates, endDateValidationOptions]);

  // Handle completion status toggle
  const handleCompletionToggle = useCallback(() => {
    dispatch({
      type: 'TOGGLE_COMPLETION',
      payload: {
        weekId,
        courseId: course.id
      }
    });
  }, [dispatch, weekId, course.id]);

  return (
    <>
      {/* Desktop Table Row */}
      <tr className="course-table-row">
        <td className="course-table-cell course-name-cell">
          <span className="course-name-text">
            {course.name}
          </span>
        </td>
        <td className="course-table-cell course-date-cell">
          <div className="date-cell-content">
            <DatePicker
              value={course.startDate}
              onChange={handleStartDateChange}
              placeholder="시작일 선택"
              className="course-date-picker"
              label=""
              id={`start-date-${course.id}`}
              error={startDateError}
              disallowFutureDates={true}
              validationOptions={startDateValidationOptions}
            />
          </div>
        </td>
        <td className="course-table-cell course-date-cell">
          <div className="date-cell-content">
            <DatePicker
              value={course.endDate}
              onChange={handleEndDateChange}
              placeholder="종료일 선택"
              className="course-date-picker"
              label=""
              id={`end-date-${course.id}`}
              error={endDateError}
              validationOptions={endDateValidationOptions}
            />
          </div>
        </td>
        <td className="course-table-cell course-status-cell">
          <div className="status-cell-content">
            <label className="completion-checkbox-label">
              <input
                type="checkbox"
                checked={course.completed}
                onChange={handleCompletionToggle}
                className="completion-checkbox"
                aria-label={`${course.name} 완료 여부`}
              />
              <span className="checkbox-custom"></span>
              <span className={`status-text ${course.completed ? 'completed' : 'pending'}`}>
                {course.completed ? '완료' : '미완료'}
              </span>
            </label>
          </div>
        </td>
      </tr>
      
      {/* Error row for date range validation */}
      {dateError && (
        <tr className="course-error-row">
          <td colSpan={4} className="course-error-cell">
            <ErrorMessage
              message={dateError}
              type="error"
              showIcon={true}
              inline={false}
            />
          </td>
        </tr>
      )}
    </>
  );
};

/**
 * CourseCard component for mobile view
 */
interface CourseCardProps {
  course: Course;
  weekId: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, weekId }) => {
  const { dispatch } = useCurriculum();
  const [dateError, setDateError] = useState<string>('');
  const [startDateError, setStartDateError] = useState<string>('');
  const [endDateError, setEndDateError] = useState<string>('');

  // Enhanced date validation options for start date in mobile (memoized to prevent re-renders)
  const startDateValidationOptions: DateValidationOptions = useMemo(() => ({
    disallowFutureDates: true,
    customMessages: {
      startAfterEnd: '시작일은 종료일보다 이전이어야 합니다.',
      futureDateNotAllowed: '시작일은 미래 날짜를 선택할 수 없습니다.',
      invalidFormat: '올바른 날짜 형식이 아닙니다.'
    }
  }), []);

  // Enhanced date validation options for end date in mobile (memoized to prevent re-renders)
  const endDateValidationOptions: DateValidationOptions = useMemo(() => ({
    customMessages: {
      startAfterEnd: '종료일은 시작일보다 이후여야 합니다.',
      invalidFormat: '올바른 날짜 형식이 아닙니다.'
    }
  }), []);

  // Validate date range
  const validateDates = useCallback((startDate?: Date, endDate?: Date): string => {
    const result = validateDateRange(startDate, endDate, startDateValidationOptions);
    return result.errorMessage;
  }, [startDateValidationOptions]);

  // Handle start date change with enhanced validation
  const handleStartDateChange = useCallback((date: Date | undefined) => {
    setDateError('');
    setStartDateError('');
    
    // Validate the start date individually
    const startDateValidation = validateCourseDate(date, course.endDate, true, startDateValidationOptions);
    if (!startDateValidation.isValid) {
      setStartDateError(startDateValidation.errorMessage);
      return;
    }
    
    // Validate the overall date range
    const rangeError = validateDates(date, course.endDate);
    if (rangeError) {
      setDateError(rangeError);
      return;
    }
    
    dispatch({
      type: 'SET_START_DATE',
      payload: {
        weekId,
        courseId: course.id,
        date
      }
    });
  }, [dispatch, weekId, course.id, course.endDate, validateDates, startDateValidationOptions]);

  // Handle end date change with enhanced validation
  const handleEndDateChange = useCallback((date: Date | undefined) => {
    setDateError('');
    setEndDateError('');
    
    // Validate the end date individually
    const endDateValidation = validateCourseDate(date, course.startDate, false, endDateValidationOptions);
    if (!endDateValidation.isValid) {
      setEndDateError(endDateValidation.errorMessage);
      return;
    }
    
    // Validate the overall date range
    const rangeError = validateDates(course.startDate, date);
    if (rangeError) {
      setDateError(rangeError);
      return;
    }
    
    dispatch({
      type: 'SET_END_DATE',
      payload: {
        weekId,
        courseId: course.id,
        date
      }
    });
  }, [dispatch, weekId, course.id, course.startDate, validateDates, endDateValidationOptions]);

  // Handle completion status toggle
  const handleCompletionToggle = useCallback(() => {
    dispatch({
      type: 'TOGGLE_COMPLETION',
      payload: {
        weekId,
        courseId: course.id
      }
    });
  }, [dispatch, weekId, course.id]);

  return (
    <div className="course-card">
      <div className="course-card-header">
        <h4 className="course-card-title">
          {course.name}
        </h4>
        <label className="course-card-completion">
          <input
            type="checkbox"
            checked={course.completed}
            onChange={handleCompletionToggle}
            className="completion-checkbox"
            aria-label={`${course.name} 완료 여부`}
          />
          <span className="checkbox-custom"></span>
          <span className={`course-card-status ${course.completed ? 'completed' : 'pending'}`}>
            {course.completed ? '완료' : '미완료'}
          </span>
        </label>
      </div>
      
      <div className="course-card-content">
        <div className="course-card-dates">
          <div className="course-card-date-item">
            <label className="course-card-date-label">시작일:</label>
            <DatePicker
              value={course.startDate}
              onChange={handleStartDateChange}
              placeholder="시작일 선택"
              className="course-card-date-picker"
              label=""
              id={`mobile-start-date-${course.id}`}
              error={startDateError}
              disallowFutureDates={true}
              validationOptions={startDateValidationOptions}
            />
          </div>
          
          <div className="course-card-date-item">
            <label className="course-card-date-label">종료일:</label>
            <DatePicker
              value={course.endDate}
              onChange={handleEndDateChange}
              placeholder="종료일 선택"
              className="course-card-date-picker"
              label=""
              id={`mobile-end-date-${course.id}`}
              error={endDateError}
              validationOptions={endDateValidationOptions}
            />
          </div>
        </div>
        
        {dateError && (
          <ErrorMessage
            message={dateError}
            type="error"
            showIcon={true}
            inline={false}
            className="course-card-error-message"
          />
        )}
      </div>
    </div>
  );
};

export default CourseRow;