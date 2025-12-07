import React, { useRef, useEffect, KeyboardEvent } from 'react';
import { InputState } from '../types';

interface ClozeInputProps {
  state: InputState;
  isReviewNeeded: boolean;
  onUpdate: (id: string, value: string) => void;
  onSubmit: (id: string) => void;
  onFocusRequest: (id: string) => void;
}

export const ClozeInput: React.FC<ClozeInputProps> = ({
  state,
  isReviewNeeded,
  onUpdate,
  onSubmit,
  onFocusRequest,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevStatusRef = useRef<string>(state.status);

  // Calculate width based on answer length
  // 한글 기준: 답안 길이에 따라 타이트하게 조정
  const contentLength = Math.max(state.answer.length, state.value.length, 2);
  
  // 긴 답안일수록 더 타이트하게 (0.85~0.95 배수)
  let multiplier;
  if (contentLength >= 15) {
    multiplier = 0.85; // 매우 긴 텍스트: 더 타이트
  } else if (contentLength >= 10) {
    multiplier = 0.9; // 긴 텍스트
  } else if (contentLength >= 6) {
    multiplier = 0.95; // 중간 텍스트
  } else {
    multiplier = 1.0; // 짧은 텍스트
  }
  
  const calculatedWidth = contentLength * multiplier + 0.8;
  
  const widthStyle = {
    width: `${calculatedWidth}em`,
    minWidth: '3em',
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
        inline-block mx-1 my-1 px-2 py-1 text-center outline-none border-b-4 rounded-lg
        transition-all duration-200 align-baseline shadow-md
        text-[1.6rem] leading-normal
        disabled:opacity-100 disabled:cursor-not-allowed
        ${bgClass}
        ${statusClasses}
      `}
      style={widthStyle}
      aria-label="빈칸 입력"
    />
  );
};