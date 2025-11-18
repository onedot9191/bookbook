export interface SectionData {
  id: string;
  title: string;
  content: string[];
}

export interface InputState {
  id: string;
  value: string;
  status: 'idle' | 'correct' | 'wrong-1' | 'wrong-2';
  attempts: number;
  disabled: boolean;
  answer: string;
}

export interface ParsedToken {
  type: 'text' | 'input';
  value: string;
  id?: string; // Only for input
}

export const STORAGE_KEY = 'daegu-edu-wrong-history';