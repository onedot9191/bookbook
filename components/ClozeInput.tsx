import React, { useRef, useEffect, KeyboardEvent, useState } from 'react';
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

// 스파클 효과 컴포넌트
const Sparkle: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => (
  <div 
    className="sparkle" 
    style={{ 
      left: `${x}%`, 
      top: `${y}%`,
      animationDelay: `${delay}s` 
    }} 
  />
);

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
  const containerRef = useRef<HTMLSpanElement>(null);
  const prevStatusRef = useRef<string>(state.status);
  const prevValueRef = useRef<string>(state.value);
  
  // 애니메이션 상태
  const [showSparkles, setShowSparkles] = useState(false);
  const [isTypingBounce, setIsTypingBounce] = useState(false);

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
    // 영어: 한글보다 약간 좁은 너비 적용 (짧은 답안은 여유있게)
    if (contentLength >= 15) {
      multiplier = 0.63;
    } else if (contentLength >= 10) {
      multiplier = 0.68;
    } else if (contentLength >= 6) {
      multiplier = 0.73;
    } else if (contentLength >= 4) {
      multiplier = 0.85;
    } else {
      multiplier = 0.9; // 3글자 이하 짧은 답안(wow, now 등)
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
  
  const calculatedWidth = contentLength * multiplier + (isCompact ? 1.0 : isEnglishMode ? 0.8 : 0.8);
  
  const widthStyle = {
    width: `${calculatedWidth}em`,
    minWidth: isCompact ? '3.5em' : isEnglishMode ? '3em' : '3em',
  };

  // Effect: Handle status changes for animations
  useEffect(() => {
    if (prevStatusRef.current !== state.status) {
      // 정답 시 스파클 효과
      if (state.status === 'correct') {
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 800);
      }
    }
    prevStatusRef.current = state.status;
  }, [state.status]);

  // Effect: 타이핑 바운스 효과
  useEffect(() => {
    if (prevValueRef.current !== state.value && state.value.length > prevValueRef.current.length) {
      setIsTypingBounce(true);
      const timer = setTimeout(() => setIsTypingBounce(false), 100);
      return () => clearTimeout(timer);
    }
    prevValueRef.current = state.value;
  }, [state.value]);

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
  let animationClasses = "";

  if (state.status === 'correct') {
    // Removed font-bold to prevent width shift (ch unit depends on font weight)
    statusClasses = "border-emerald-500/80 text-emerald-500 dark:text-emerald-400"; 
    bgClass = "bg-emerald-500/15 dark:bg-emerald-500/20";
    animationClasses = "animate-correct-glow";
  } else if (state.status === 'wrong-1') {
    // 1차 오답: wobble + ripple 효과
    statusClasses = "border-amber-500/80 text-foreground focus:border-amber-500";
    bgClass = "bg-input";
    animationClasses = "animate-wobble animate-ripple";
  } else if (state.status === 'wrong-2') {
    // 2차 오답: 빨간 배경 (크랙 효과 제거)
    statusClasses = "border-rose-500/80 text-rose-600 dark:text-rose-400";
    bgClass = "bg-rose-500/20 dark:bg-rose-500/25";
  } else {
    // Idle state
    if (isReviewNeeded) {
      // Visual Spec C: Persistent Review hint - Distinct background
      statusClasses = "border-border/60 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
      bgClass = "bg-rose-500/10 dark:bg-rose-500/15"; // Subtle Red for Review
    } else {
      statusClasses = "border-border/60 focus:border-primary text-foreground focus:ring-2 focus:ring-primary/25";
      bgClass = "bg-input";
    }
  }

  return (
    <span ref={containerRef} className="relative inline-block">
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
          inline-block text-center outline-none border-b-[3px] rounded-xl
          transition-all duration-200 align-baseline
          disabled:opacity-100 disabled:cursor-not-allowed
          input-hover-scale
          ${isCompact ? 'mx-0.5 my-0.5 px-2 py-1 text-base leading-normal border-b-2 rounded-lg shadow-sm' : 'mx-1 my-1 px-3 py-1.5 text-[1.5rem] leading-normal shadow-md'}
          ${bgClass}
          ${statusClasses}
          ${animationClasses}
          ${isTypingBounce ? 'animate-typing-bounce' : ''}
        `}
        style={widthStyle}
        aria-label="빈칸 입력"
      />
      
      {/* 스파클 효과 (정답 시) */}
      {showSparkles && (
        <>
          <Sparkle x={10} y={-25} delay={0} />
          <Sparkle x={50} y={-35} delay={0.1} />
          <Sparkle x={90} y={-25} delay={0.15} />
        </>
      )}
    </span>
  );
};
