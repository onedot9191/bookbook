// src/types.ts (또는 루트의 types.ts)

export const STORAGE_KEY = 'bookbook-storage';

// 빈칸 입력 상태 관리용
export interface InputState {
  id: string;
  value: string;
  status: 'idle' | 'correct' | 'wrong-1' | 'wrong-2';
  attempts: number;
  disabled: boolean;
  answer: string;
}

// constants.ts에서 사용하는 데이터 구조
export interface SectionData {
  id: string;
  title: string;
  content: string[];
}

// 영어수업실연 Activity 카드 데이터 구조
export interface ActivityCard {
  id: string;
  title: string;
  content: string[];
}

export interface SkillCategory {
  id: 'listening' | 'speaking' | 'reading' | 'writing' | 'integrated';
  title: string;
  icon: string;
  activities: ActivityCard[];
}

export interface EnglishDemoSectionData {
  id: string;
  title: string;
  content?: string[];  // 일반 섹션용 (상단 도입부)
  skillCategories?: SkillCategory[];  // Activity 2, 3용
  closingContent?: string[];  // 하단 마무리 콘텐츠 (도입의 학습문제 확인, Activity 3의 활동 마무리 등)
}

// 표 데이터 타입
export interface TableData {
  headers: string[];
  rows: string[][];
}

// 계층 구조 데이터 타입
export interface HierarchyItem {
  title: string;
  children?: HierarchyItem[];
  table?: TableData;
}

export interface PolicyDetailData {
  id: string;
  title: string;
  hierarchy: HierarchyItem[];
}