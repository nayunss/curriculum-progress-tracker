'use client';

import React, { useState } from 'react';
import { Week } from '../types/curriculum';
import { useCurriculum } from '../context/CurriculumContext';
import ProgressBar from './ProgressBar';
import CourseTable from './CourseTable';

/**
 * WeekSection component props
 */
interface WeekSectionProps {
  week: Week;
}

/**
 * WeekSection component that displays individual week information with expand/collapse functionality
 * Implements requirements 2.1, 2.2, 2.3, 2.4
 */
const WeekSection: React.FC<WeekSectionProps> = ({ week }) => {
  const { dispatch } = useCurriculum();
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Handle toggling completion status of a course
   * Requirement 2.4 - Course completion management
   */
  const handleToggleCompletion = (courseId: string) => {
    dispatch({
      type: 'TOGGLE_COMPLETION',
      payload: { weekId: week.id, courseId }
    });
  };

  /**
   * Toggle expand/collapse state
   * Requirement 2.3 - Expand/collapse functionality
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="card">
      {/* Week Header with Progress - Requirements 2.1, 2.2 */}
      <div className="card-header">
        <button
          onClick={toggleExpanded}
          className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-2 -m-2 touch-manipulation"
          aria-expanded={isExpanded}
          aria-controls={`week-${week.id}-content`}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <h3 className="text-responsive-lg font-semibold">{week.title}</h3>
              <span 
                className={`transform transition-transform duration-200 flex-shrink-0 ${
                  isExpanded ? 'rotate-90' : 'rotate-0'
                }`}
                aria-hidden="true"
              >
                ▶
              </span>
            </div>
            <div className="flex flex-col sm:items-end gap-1 min-w-0">
              <span className="text-responsive-sm text-muted-foreground">
                {week.progress}% 완료
              </span>
              <span className="text-xs text-muted-foreground">
                {week.courses.filter(c => c.completed).length}/{week.courses.length} 과정
              </span>
            </div>
          </div>
          
          {/* Week Progress Bar - Requirement 2.2 */}
          <div className="mt-3">
            <ProgressBar 
              progress={week.progress}
              label={`${week.title} 진행률 ${week.progress}%`}
              size="medium"
              showPercentage={false}
            />
          </div>
        </button>
      </div>
      
      {/* Expandable Course Table - Requirement 2.4 */}
      {isExpanded && (
        <div 
          id={`week-${week.id}-content`}
          className="card-content"
          role="region"
          aria-labelledby={`week-${week.id}-header`}
        >
          {/* Course Table - Requirements 3.1, 6.1, 6.4 */}
          <CourseTable courses={week.courses} weekId={week.id} />
          
          {/* Course count summary */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-responsive-sm text-muted-foreground">
              총 {week.courses.length}개 과정 중 {week.courses.filter(c => c.completed).length}개 완료
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekSection;