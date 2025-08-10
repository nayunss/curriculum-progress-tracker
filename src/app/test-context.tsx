'use client';

import React from 'react';
import { CurriculumProvider, useCurriculum } from '../context/CurriculumContext';

// Test component to verify Context functionality
const ContextTest = () => {
  const { state, dispatch } = useCurriculum();
  
  const handleToggleFirst = () => {
    dispatch({
      type: 'TOGGLE_COMPLETION',
      payload: { weekId: 1, courseId: '1-1' }
    });
  };
  
  const handleSetDate = () => {
    dispatch({
      type: 'SET_START_DATE',
      payload: { weekId: 1, courseId: '1-1', date: new Date('2024-01-01') }
    });
  };
  
  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-4">Context API Test</h3>
      <div className="space-y-2 mb-4">
        <p>Overall Progress: {state.overallProgress}%</p>
        <p>Total Weeks: {state.weeks.length}</p>
        <p>First Course Status: {state.weeks[0]?.courses[0]?.completed ? 'Completed' : 'Not Completed'}</p>
        <p>First Course Start Date: {state.weeks[0]?.courses[0]?.startDate?.toDateString() || 'Not Set'}</p>
      </div>
      <div className="space-x-2">
        <button 
          onClick={handleToggleFirst}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle First Course
        </button>
        <button 
          onClick={handleSetDate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Set Start Date
        </button>
      </div>
    </div>
  );
};

// Wrapper component with Provider
export const TestContextPage = () => {
  return (
    <CurriculumProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-6">Curriculum Context API Test</h1>
        <ContextTest />
      </div>
    </CurriculumProvider>
  );
};

export default TestContextPage;