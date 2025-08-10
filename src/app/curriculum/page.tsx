'use client';

import React from 'react';
import { initialCurriculumData } from '../../data/initialCurriculum';
import Link from 'next/link';

/**
 * 커리큘럼 개요 페이지
 * 전체 커리큘럼을 한 눈에 볼 수 있는 읽기 전용 테이블
 */
export default function CurriculumOverviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                커리큘럼 개요
              </h1>
              <p className="text-muted-foreground">
                전체 {initialCurriculumData.length}주차 커리큘럼을 한 눈에 확인하세요
              </p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              진도 관리로 돌아가기
            </Link>
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">
              {initialCurriculumData.length}주차
            </div>
            <div className="text-sm text-muted-foreground">전체 기간</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">
              {initialCurriculumData.reduce((total, week) => total + week.courses.length, 0)}개
            </div>
            <div className="text-sm text-muted-foreground">총 과정 수</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">
              {Math.round(initialCurriculumData.reduce((total, week) => total + week.courses.length, 0) / initialCurriculumData.length * 10) / 10}개
            </div>
            <div className="text-sm text-muted-foreground">주당 평균 과정</div>
          </div>
        </div>

        {/* 데스크톱 테이블 뷰 */}
        <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground border-b border-border">
                    주차
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground border-b border-border">
                    과정명
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground border-b border-border">
                    과정 수
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialCurriculumData.map((week, weekIndex) => (
                  <React.Fragment key={week.id}>
                    {week.courses.map((course, courseIndex) => (
                      <tr 
                        key={course.id}
                        className={`
                          ${weekIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                          hover:bg-muted/40 transition-colors
                        `}
                      >
                        {/* 주차 정보 (첫 번째 과정에서만 표시) */}
                        {courseIndex === 0 && (
                          <td 
                            className="px-6 py-4 border-b border-border/50 align-top"
                            rowSpan={week.courses.length}
                          >
                            <div className="flex flex-col">
                              <span className="text-lg font-semibold text-primary">
                                {week.title}
                              </span>
                              <span className="text-sm text-muted-foreground mt-1">
                                Week {week.id}
                              </span>
                            </div>
                          </td>
                        )}
                        
                        {/* 과정명 */}
                        <td className="px-6 py-4 border-b border-border/50">
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground mr-3 min-w-[2rem]">
                              {week.id}-{courseIndex + 1}
                            </span>
                            <span className="text-foreground">
                              {course.name}
                            </span>
                          </div>
                        </td>
                        
                        {/* 과정 수 (첫 번째 과정에서만 표시) */}
                        {courseIndex === 0 && (
                          <td 
                            className="px-6 py-4 border-b border-border/50 text-center align-top"
                            rowSpan={week.courses.length}
                          >
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                              {week.courses.length}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 모바일 카드 뷰 */}
        <div className="md:hidden space-y-4">
          {initialCurriculumData.map((week) => (
            <div 
              key={week.id}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              {/* 주차 헤더 */}
              <div className="bg-primary/5 px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {week.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Week {week.id}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                    {week.courses.length}
                  </span>
                </div>
              </div>
              
              {/* 과정 목록 */}
              <div className="divide-y divide-border/50">
                {week.courses.map((course, courseIndex) => (
                  <div key={course.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-muted text-muted-foreground rounded text-xs font-medium mt-0.5">
                        {courseIndex + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm leading-relaxed">
                          {course.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 푸터 정보 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            총 {initialCurriculumData.reduce((total, week) => total + week.courses.length, 0)}개 과정으로 구성된 
            {initialCurriculumData.length}주차 커리큘럼입니다.
          </p>
        </div>
      </div>
    </div>
  );
}