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
  // Adjusted calculation: Reduced multiplier from 1.3 to 1.15 and buffer from 5rem to 3.5rem
  // to tighten the width while still accommodating Korean characters.
  const widthStyle = {
    width: `calc(${state.answer.length * 1.15}ch + 3.5rem)`,
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
  let bgClass = "bg-input"; // Default background (Restored to bg-input)

  if (state.status === 'correct') {
    statusClasses = "border-emerald-500 text-emerald-400 font-bold";
    bgClass = "bg-emerald-500/20";
  } else if (state.status === 'wrong-1') {
    statusClasses = "border-orange-500 animate-shake text-foreground focus:border-orange-500";
    // Keep default background
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
        inline-flex mx-2 px-2 py-1 text-center outline-none border-b-4 rounded-lg
        transition-all duration-200 align-baseline shadow-sm
        text-[1.9rem] leading-none
        disabled:opacity-100 disabled:cursor-not-allowed
        ${bgClass}
        ${statusClasses}
      `}
      style={widthStyle}
      aria-label="빈칸 입력"
    />
  );
};