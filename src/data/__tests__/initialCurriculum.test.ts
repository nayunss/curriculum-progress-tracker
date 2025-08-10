import { describe, it, expect } from 'vitest';
import { initialCurriculumData, getInitialCurriculumState } from '../initialCurriculum';
import { Week, Course, CurriculumState } from '../../types/curriculum';

describe('Initial Curriculum Data', () => {
  describe('initialCurriculumData', () => {
    it('should have exactly 7 weeks', () => {
      expect(initialCurriculumData).toHaveLength(7);
    });

    it('should have sequential week IDs from 1 to 7', () => {
      initialCurriculumData.forEach((week, index) => {
        expect(week.id).toBe(index + 1);
      });
    });

    it('should have proper Korean week titles', () => {
      const expectedTitles = ['1주차', '2주차', '3주차', '4주차', '5주차', '6주차', '7주차'];
      
      initialCurriculumData.forEach((week, index) => {
        expect(week.title).toBe(expectedTitles[index]);
      });
    });

    it('should have all weeks with initial progress of 0', () => {
      initialCurriculumData.forEach(week => {
        expect(week.progress).toBe(0);
      });
    });

    it('should have all courses initially incomplete', () => {
      initialCurriculumData.forEach(week => {
        week.courses.forEach(course => {
          expect(course.completed).toBe(false);
        });
      });
    });

    it('should have unique course IDs across all weeks', () => {
      const allCourseIds = initialCurriculumData.flatMap(week => 
        week.courses.map(course => course.id)
      );
      
      const uniqueIds = new Set(allCourseIds);
      expect(uniqueIds.size).toBe(allCourseIds.length);
    });

    it('should have course IDs following the pattern "weekId-courseIndex"', () => {
      initialCurriculumData.forEach(week => {
        week.courses.forEach((course, courseIndex) => {
          const expectedId = `${week.id}-${courseIndex + 1}`;
          expect(course.id).toBe(expectedId);
        });
      });
    });

    it('should have meaningful course names', () => {
      initialCurriculumData.forEach(week => {
        week.courses.forEach(course => {
          expect(course.name).toBeTruthy();
          expect(course.name.length).toBeGreaterThan(0);
          expect(typeof course.name).toBe('string');
        });
      });
    });

    it('should have courses without initial dates', () => {
      initialCurriculumData.forEach(week => {
        week.courses.forEach(course => {
          expect(course.startDate).toBeUndefined();
          expect(course.endDate).toBeUndefined();
        });
      });
    });

    describe('Week-specific content validation', () => {
      it('should have Week 1 with product management courses', () => {
        const week1 = initialCurriculumData.find(week => week.id === 1);
        expect(week1).toBeDefined();
        expect(week1!.courses).toHaveLength(6);
        
        // Check for specific course content
        const courseNames = week1!.courses.map(course => course.name);
        expect(courseNames.some(name => name.includes('QA 이슈 해결'))).toBe(true);
        expect(courseNames.some(name => name.includes('상품 목록'))).toBe(true);
        expect(courseNames.some(name => name.includes('상품 추가'))).toBe(true);
        expect(courseNames.some(name => name.includes('상품 목록 삭제'))).toBe(true);
        expect(courseNames.some(name => name.includes('상품 목록 수정'))).toBe(true);
        expect(courseNames.some(name => name.includes('상품 상세'))).toBe(true);
      });

      it('should have Week 2 with authentication courses', () => {
        const week2 = initialCurriculumData.find(week => week.id === 2);
        expect(week2).toBeDefined();
        expect(week2!.courses).toHaveLength(5);
        
        const courseNames = week2!.courses.map(course => course.name);
        expect(courseNames.some(name => name.includes('사용자 인증'))).toBe(true);
        expect(courseNames.some(name => name.includes('로그인/로그아웃'))).toBe(true);
        expect(courseNames.some(name => name.includes('회원가입'))).toBe(true);
        expect(courseNames.some(name => name.includes('권한 관리'))).toBe(true);
        expect(courseNames.some(name => name.includes('세션 관리'))).toBe(true);
      });

      it('should have Week 3 with database and API courses', () => {
        const week3 = initialCurriculumData.find(week => week.id === 3);
        expect(week3).toBeDefined();
        expect(week3!.courses).toHaveLength(5);
        
        const courseNames = week3!.courses.map(course => course.name);
        expect(courseNames.some(name => name.includes('데이터베이스'))).toBe(true);
        expect(courseNames.some(name => name.includes('API 엔드포인트'))).toBe(true);
        expect(courseNames.some(name => name.includes('RESTful API'))).toBe(true);
        expect(courseNames.some(name => name.includes('유효성 검사'))).toBe(true);
        expect(courseNames.some(name => name.includes('에러 핸들링'))).toBe(true);
      });

      it('should have Week 4 with frontend optimization courses', () => {
        const week4 = initialCurriculumData.find(week => week.id === 4);
        expect(week4).toBeDefined();
        expect(week4!.courses).toHaveLength(5);
        
        const courseNames = week4!.courses.map(course => course.name);
        expect(courseNames.some(name => name.includes('상태 관리'))).toBe(true);
        expect(courseNames.some(name => name.includes('컴포넌트 최적화'))).toBe(true);
        expect(courseNames.some(name => name.includes('반응형 디자인'))).toBe(true);
        expect(courseNames.some(name => name.includes('사용자 경험'))).toBe(true);
        expect(courseNames.some(name => name.includes('접근성'))).toBe(true);
      });

      it('should have Week 5 with testing courses', () => {
        const week5 = initialCurriculumData.find(week => week.id === 5);
        expect(week5).toBeDefined();
        expect(week5!.courses).toHaveLength(5);
        
        const courseNames = week5!.courses.map(course => course.name);
        expect(courseNames.some(name => name.includes('테스트 코드'))).toBe(true);
        expect(courseNames.some(name => name.includes('단위 테스트'))).toBe(true);
        expect(courseNames.some(name => name.includes('통합 테스트'))).toBe(true);
        expect(courseNames.some(name => name.includes('E2E 테스트'))).toBe(true);
        expect(courseNames.some(name => name.includes('테스트 자동화'))).toBe(true);
      });

      it('should have Week 6 with performance optimization courses', () => {
        const week6 = initialCurriculumData.find(week => week.id === 6);
        expect(week6).toBeDefined();
        expect(week6!.courses).toHaveLength(5);
        
        const courseNames = week6!.courses.map(course => course.name);
        expect(courseNames.some(name => name.includes('성능 최적화'))).toBe(true);
        expect(courseNames.some(name => name.includes('번들 크기'))).toBe(true);
        expect(courseNames.some(name => name.includes('로딩 성능'))).toBe(true);
        expect(courseNames.some(name => name.includes('캐싱 전략'))).toBe(true);
        expect(courseNames.some(name => name.includes('모니터링'))).toBe(true);
      });

      it('should have Week 7 with deployment courses', () => {
        const week7 = initialCurriculumData.find(week => week.id === 7);
        expect(week7).toBeDefined();
        expect(week7!.courses).toHaveLength(5);
        
        const courseNames = week7!.courses.map(course => course.name);
        expect(courseNames.some(name => name.includes('배포 환경'))).toBe(true);
        expect(courseNames.some(name => name.includes('CI/CD'))).toBe(true);
        expect(courseNames.some(name => name.includes('프로덕션 배포'))).toBe(true);
        expect(courseNames.some(name => name.includes('문서화'))).toBe(true);
        expect(courseNames.some(name => name.includes('최종 검토'))).toBe(true);
      });
    });

    it('should have consistent course count across weeks', () => {
      const courseCounts = initialCurriculumData.map(week => week.courses.length);
      
      // Week 1 has 6 courses, others have 5
      expect(courseCounts[0]).toBe(6); // Week 1
      for (let i = 1; i < courseCounts.length; i++) {
        expect(courseCounts[i]).toBe(5); // Weeks 2-7
      }
    });

    it('should have total of 36 courses', () => {
      const totalCourses = initialCurriculumData.reduce(
        (total, week) => total + week.courses.length, 
        0
      );
      expect(totalCourses).toBe(36);
    });

    it('should conform to Week interface', () => {
      initialCurriculumData.forEach(week => {
        // Type checking is done at compile time, but we can verify structure
        expect(typeof week.id).toBe('number');
        expect(typeof week.title).toBe('string');
        expect(Array.isArray(week.courses)).toBe(true);
        expect(typeof week.progress).toBe('number');
        
        week.courses.forEach(course => {
          expect(typeof course.id).toBe('string');
          expect(typeof course.name).toBe('string');
          expect(typeof course.completed).toBe('boolean');
        });
      });
    });
  });

  describe('getInitialCurriculumState', () => {
    it('should return a valid CurriculumState object', () => {
      const state = getInitialCurriculumState();
      
      expect(state).toBeDefined();
      expect(state.weeks).toBeDefined();
      expect(state.overallProgress).toBeDefined();
    });

    it('should return state with initial progress of 0', () => {
      const state = getInitialCurriculumState();
      
      expect(state.overallProgress).toBe(0);
    });

    it('should return state with all 7 weeks', () => {
      const state = getInitialCurriculumState();
      
      expect(state.weeks).toHaveLength(7);
    });

    it('should return state with same data as initialCurriculumData', () => {
      const state = getInitialCurriculumState();
      
      expect(state.weeks).toEqual(initialCurriculumData);
    });

    it('should return a new object each time (not reference)', () => {
      const state1 = getInitialCurriculumState();
      const state2 = getInitialCurriculumState();
      
      expect(state1).not.toBe(state2);
      // Note: weeks array is the same reference to initialCurriculumData, which is expected
      // This is acceptable since the data is immutable and we use immutable updates in the reducer
      expect(state1.weeks).toBe(state2.weeks); // Same reference is OK for immutable data
      expect(state1).toEqual(state2);
    });

    it('should conform to CurriculumState interface', () => {
      const state = getInitialCurriculumState();
      
      expect(typeof state.overallProgress).toBe('number');
      expect(Array.isArray(state.weeks)).toBe(true);
      
      state.weeks.forEach(week => {
        expect(typeof week.id).toBe('number');
        expect(typeof week.title).toBe('string');
        expect(Array.isArray(week.courses)).toBe(true);
        expect(typeof week.progress).toBe('number');
      });
    });
  });

  describe('Requirements Verification', () => {
    it('should support requirement 2.1 - 7주차 커리큘럼 구조', () => {
      expect(initialCurriculumData).toHaveLength(7);
      
      initialCurriculumData.forEach((week, index) => {
        expect(week.id).toBe(index + 1);
        expect(week.title).toBe(`${index + 1}주차`);
      });
    });

    it('should support requirement 2.2 - 주차별 진행률 표시', () => {
      initialCurriculumData.forEach(week => {
        expect(typeof week.progress).toBe('number');
        expect(week.progress).toBeGreaterThanOrEqual(0);
        expect(week.progress).toBeLessThanOrEqual(100);
      });
    });

    it('should support requirement 3.1 - 과정명, 시작일, 종료일, 수행여부 컬럼', () => {
      initialCurriculumData.forEach(week => {
        week.courses.forEach(course => {
          expect(typeof course.name).toBe('string'); // 과정명
          expect(course.startDate === undefined || course.startDate instanceof Date).toBe(true); // 시작일
          expect(course.endDate === undefined || course.endDate instanceof Date).toBe(true); // 종료일
          expect(typeof course.completed).toBe('boolean'); // 수행여부
        });
      });
    });

    it('should support requirement 4.1 - 체크박스로 완료 여부 표시', () => {
      initialCurriculumData.forEach(week => {
        week.courses.forEach(course => {
          expect(typeof course.completed).toBe('boolean');
        });
      });
    });

    it('should provide data structure for requirement 1.1 - 전체 진행률 표시', () => {
      const state = getInitialCurriculumState();
      expect(typeof state.overallProgress).toBe('number');
    });
  });
});