'use client';

import React from 'react';
import { Course } from '../types/curriculum';
import CourseRow, { CourseCard } from './CourseRow';

/**
 * CourseTable component props
 */
interface CourseTableProps {
  courses: Course[];
  weekId: number;
}

/**
 * CourseTable component that displays courses in a responsive table format
 * Implements requirements 3.1, 6.1, 6.4
 */
const CourseTable: React.FC<CourseTableProps> = ({ courses, weekId }) => {
  return (
    <div className="course-table-container">
      {/* Desktop Table View */}
      <div className="course-table-desktop">
        <div className="table-responsive">
          <table className="course-table">
            <thead>
              <tr>
                <th scope="col" className="course-table-header course-name-header">
                  과정명
                </th>
                <th scope="col" className="course-table-header course-date-header">
                  시작일
                </th>
                <th scope="col" className="course-table-header course-date-header">
                  종료일
                </th>
                <th scope="col" className="course-table-header course-status-header">
                  수행여부
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <CourseRow 
                  key={course.id} 
                  course={course} 
                  weekId={weekId} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="course-table-mobile">
        <div className="course-cards-container">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              weekId={weekId} 
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="course-table-empty">
          <div className="empty-state-content">
            <p className="empty-state-message">
              이 주차에는 등록된 과정이 없습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseTable;