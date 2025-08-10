'use client';

import React from 'react';
import { useCurriculum } from '../context/CurriculumContext';
import ProgressBar from './ProgressBar';
import WeekSection from './WeekSection';

/**
 * CurriculumDashboard component that displays overall progress and weekly sections
 * Implements requirements 1.1, 1.2, 2.1, 2.2
 */
const CurriculumDashboard: React.FC = () => {
  const { state, dispatch } = useCurriculum();
  
  // Calculate total courses and completed courses for display
  const totalCourses = state.weeks.reduce((total, week) => total + week.courses.length, 0);
  const completedCourses = state.weeks.reduce((total, week) => 
    total + week.courses.filter(course => course.completed).length, 0
  );



  return (
    <div className="curriculum-dashboard">
      {/* Overall Progress Section - Requirement 1.1, 1.2 */}
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h2 className="text-responsive-lg font-semibold">전체 진행률</h2>
            <span className="text-responsive-sm text-muted-foreground sm:text-right">
              {completedCourses}/{totalCourses} 과정 완료
            </span>
          </div>
        </div>
        
        <div className="card-content">
          <div className="mb-6">
            <ProgressBar 
              progress={state.overallProgress}
              label={`전체 진행률 ${state.overallProgress}%`}
              size="large"
              showPercentage={false}
              className="mb-2"
            />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <p className="text-responsive-sm text-muted-foreground">
                {state.overallProgress}% 완료
              </p>
              <p className="text-xs text-muted-foreground sm:text-right">
                총 {state.weeks.length}주차 커리큘럼
              </p>
            </div>
          </div>

          {/* Weekly Sections - Requirement 2.1, 2.2 */}
          <div className="space-y-4">
            {state.weeks.map((week) => (
              <WeekSection key={week.id} week={week} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumDashboard;