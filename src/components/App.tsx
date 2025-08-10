'use client';

import React from 'react';
import Link from 'next/link';
import CurriculumDashboard from './CurriculumDashboard';

/**
 * Main App component that renders the curriculum dashboard
 * Handles the overall application layout and structure
 */
const App: React.FC = () => {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex-1">
              <h1 className="text-responsive-xl font-bold text-foreground mb-2">
                커리큘럼 진행률 관리
              </h1>
              <p className="text-responsive-base text-muted-foreground">
                10주차 개발 커리큘럼의 진행 상황을 체계적으로 추적하고 관리하세요
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:items-end gap-2">
              <Link 
                href="/curriculum"
                className="inline-flex items-center px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                📋 커리큘럼 개요
              </Link>
              <p className="text-xs text-muted-foreground">
                v1.0
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main" role="main">
        <div className="container">
          <CurriculumDashboard />
        </div>
      </main>

      <footer className="app-footer" role="contentinfo">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-center sm:text-left">
            <p className="text-responsive-sm text-muted-foreground">
              커리큘럼 진행률 관리 시스템
            </p>
            <p className="text-xs text-muted-foreground">
              데이터는 브라우저 로컬 스토리지에 자동 저장됩니다
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;