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