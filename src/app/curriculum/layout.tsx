import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '커리큘럼 개요 | 커리큘럼 진행률 관리',
  description: '전체 커리큘럼을 한 눈에 확인할 수 있는 개요 페이지입니다.',
};

export default function CurriculumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}