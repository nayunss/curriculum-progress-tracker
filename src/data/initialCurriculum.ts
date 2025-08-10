import { Week } from "../types/curriculum";

/**
 * Initial curriculum data for 10 weeks of development courses
 */
export const initialCurriculumData: Week[] = [
  {
    id: 1,
    title: "1주차",
    courses: [
      { id: "1-1", name: "QA 이슈 해결", completed: false },
      {
        id: "1-2",
        name: "4장 > 상품 목록 페이지 추가 및 기능 구현",
        completed: false,
      },
      {
        id: "1-3",
        name: "4장 > 상품 추가 페이지 추가 및 기능 구현",
        completed: false,
      },
      {
        id: "1-4",
        name: "4장 > 상품 목록 삭제 페이지 추가 및 기능 구현",
        completed: false,
      },
      {
        id: "1-5",
        name: "4장 > 상품 목록 수정 페이지 추가 및 기능 구현",
        completed: false,
      },
      {
        id: "1-6",
        name: "4장 > 상품 상세 페이지 추가 및 기능 구현",
        completed: false,
      },
    ],
    progress: 0,
  },
  {
    id: 2,
    title: "2주차",
    courses: [{ id: "2-1", name: "5장 > 컴포넌트 분리", completed: false }],
    progress: 0,
  },
  {
    id: 3,
    title: "3주차",
    courses: [
      { id: "3-1", name: "6장 > MUI 추가", completed: false },
      { id: "3-2", name: "6장 > MUI 기반 레이아웃 수정", completed: false },
      {
        id: "3-3",
        name: "6장 > MUI 기반 로딩 페이지 추가 및 기능 구현",
        completed: false,
      },
      {
        id: "3-4",
        name: "6장 > MUI 기반 상품 생성 컴포넌트 추가 및 기능 구현",
        completed: false,
      },
    ],
    progress: 0,
  },
  {
    id: 4,
    title: "4주차",
    courses: [
      {
        id: "4-1",
        name: "6장 > MUI 기반 썸네일 업로드 기능 구현",
        completed: false,
      },
      {
        id: "4-2",
        name: "6장 > MUI 기반 목록 수정 및 기능 구현",
        completed: false,
      },
    ],
    progress: 0,
  },
  {
    id: 5,
    title: "5주차",
    courses: [
      {
        id: "5-1",
        name: "6장 > MUI 기반 아이템 수정 및 기능 구현",
        completed: false,
      },
      {
        id: "5-2",
        name: "6장 > MUI 기반 상세보기 페이지 수정 및 기능 구현",
        completed: false,
      },
      {
        id: "5-3",
        name: "6장 > MUI 기반 구매 페이지 수정 및 기능 구현",
        completed: false,
      },
    ],
    progress: 0,
  },
  {
    id: 6,
    title: "6주차",
    courses: [
      {
        id: "6-1",
        name: "6장 > MUI 구매 모달 페이지 추가 및 기능 구현",
        completed: false,
      },
      {
        id: "6-2",
        name: "6장 > MUI 장바구니 페이지 추가 및 기능 구현",
        completed: false,
      },
      {
        id: "6-3",
        name: "6장 > MUI 404 및 에러 페이지 추가 및 기능 구현",
        completed: false,
      },
    ],
    progress: 0,
  },
  {
    id: 7,
    title: "7주차",
    courses: [
      {
        id: "7-1",
        name: "7장 > ID 기반 장바구니 쿠키 기능 구현",
        completed: false,
      },
      {
        id: "7-2",
        name: "7장 > 장바구니 중복 방지 기능 구현",
        completed: false,
      },
      {
        id: "7-3",
        name: "7장 > HTTP 요청 + fetch 함수로 변경",
        completed: false,
      },
      { id: "7-4", name: "7장 > useAsync 함수 구현 및 적용", completed: false },
    ],
    progress: 0,
  },
  {
    id: 8,
    title: "8주차",
    courses: [
      {
        id: "8-1",
        name: "전역 상태 관리 라이브러리 zustand로 변환",
        completed: false,
      },
    ],
    progress: 0,
  },
  {
    id: 9,
    title: "9주차",
    courses: [
      {
        id: "9-1",
        name: "API 관련 상태 관리 라이브러리 react-query로 변환",
        completed: false,
      },
    ],
    progress: 0,
  },
  {
    id: 10,
    title: "10주차",
    courses: [{ id: "10-1", name: "react-query 최적화", completed: false }],
    progress: 0,
  },
];

/**
 * Get initial curriculum state
 */
export const getInitialCurriculumState = () => ({
  weeks: initialCurriculumData,
  overallProgress: 0,
});
