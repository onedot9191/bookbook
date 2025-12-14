import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { InputState } from '../types';

interface ClozeInputProps {
  state: InputState;
  isReviewNeeded: boolean;
  onUpdate: (id: string, value: string) => void;
  onSubmit: (id: string) => void;
  onFocusRequest: (id: string) => void;
  isEnglishMode?: boolean; // 영어수업실연 답안틀용 좁은 너비
  isCompact?: boolean; // 표 안에서 사용하는 컴팩트 모드
}

export const ClozeInput: React.FC<ClozeInputProps> = ({
  state,
  isReviewNeeded,
  onUpdate,
  onSubmit,
  onFocusRequest,
  isEnglishMode = false,
  isCompact = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevStatusRef = useRef<string>(state.status);

  // Calculate width based on answer length
  const contentLength = Math.max(state.answer.length, state.value.length, 2);
  
  // 영어 모드: 영문 답안은 한글보다 좁게 (ch 단위 기준 더 타이트)
  // 한글 모드: 기존 로직 유지
  // 컴팩트 모드: 더 작은 크기
  let multiplier;
  if (isCompact) {
    // 컴팩트: 표 안에서 사용할 크기
    if (contentLength >= 15) {
      multiplier = 0.85;
    } else if (contentLength >= 10) {
      multiplier = 0.9;
    } else if (contentLength >= 6) {
      multiplier = 0.95;
    } else {
      multiplier = 1.0;
    }
  } else if (isEnglishMode) {
    // 영어: 한글보다 약간 좁은 너비 적용
    if (contentLength >= 15) {
      multiplier = 0.63;
    } else if (contentLength >= 10) {
      multiplier = 0.68;
    } else if (contentLength >= 6) {
      multiplier = 0.73;
    } else {
      multiplier = 0.78;
    }
  } else {
    // 한글: 기존 로직
    if (contentLength >= 15) {
      multiplier = 0.85;
    } else if (contentLength >= 10) {
      multiplier = 0.9;
    } else if (contentLength >= 6) {
      multiplier = 0.95;
    } else {
      multiplier = 1.0;
    }
  }
  
  const calculatedWidth = contentLength * multiplier + (isCompact ? 1.0 : isEnglishMode ? 0.58 : 0.8);
  
  const widthStyle = {
    width: `${calculatedWidth}em`,
    minWidth: isCompact ? '3.5em' : isEnglishMode ? '2.3em' : '3em',
  };

  // Effect: Handle focus and shake animation reset
  useEffect(() => {
    // If we just transitioned to wrong-1, the value was cleared in parent. 
    // We need to ensure focus remains here.
    if (prevStatusRef.current !== state.status) {
       // Logic handled by status class rendering
    }
    prevStatusRef.current = state.status;
  }, [state.status]);

  // Handle Enter Key
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!state.disabled) {
        onSubmit(state.id);
      }
    }
  };

  // Determine specific visual styles based on state
  let statusClasses = "";
  let bgClass = "bg-input"; // Default background

  if (state.status === 'correct') {
    // Removed font-bold to prevent width shift (ch unit depends on font weight)
    statusClasses = "border-emerald-500 text-emerald-400"; 
    bgClass = "bg-emerald-500/20";
  } else if (state.status === 'wrong-1') {
    statusClasses = "border-orange-500 animate-shake text-foreground focus:border-orange-500";
  } else if (state.status === 'wrong-2') {
    statusClasses = "border-destructive animate-shake text-destructive";
    bgClass = "bg-red-500/30"; // Strong Red for Fail/Reveal
  } else {
    // Idle state
    if (isReviewNeeded) {
      // Visual Spec C: Persistent Review hint - Distinct background
      statusClasses = "border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
      bgClass = "bg-red-500/15"; // Subtle Red for Review
    } else {
      statusClasses = "border-input focus:border-primary text-foreground focus:ring-2 focus:ring-primary/20";
      bgClass = "bg-input";
    }
  }

  return (
    <input
      ref={inputRef}
      id={`input-${state.id}`}
      type="text"
      value={state.value}
      disabled={state.disabled}
      onChange={(e) => onUpdate(state.id, e.target.value)}
      onKeyDown={handleKeyDown}
      onFocus={() => onFocusRequest(state.id)}
      autoComplete="off"
      className={`
        inline-block text-center outline-none border-b-4 rounded-lg
        transition-all duration-200 align-baseline shadow-md
        disabled:opacity-100 disabled:cursor-not-allowed
        ${isCompact ? 'mx-0.5 my-0.5 px-2 py-1 text-base leading-normal border-b-2 rounded-md' : 'mx-1 my-1 px-2 py-1 text-[1.6rem] leading-normal'}
        ${bgClass}
        ${statusClasses}
      `}
      style={widthStyle}
      aria-label="빈칸 입력"
    />
  );
};