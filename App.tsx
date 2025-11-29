
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, CheckCircle, ChevronRight, AlertTriangle, Lightbulb, Target, Shield, Users, Heart, Eye, RotateCcw, Home, List } from 'lucide-react';
import { SECTIONS, INTRO_CONTENT, INTERVIEW_SECTIONS } from './constants';
import { InputState, STORAGE_KEY } from './types';
import { ClozeInput } from './components/ClozeInput';
import { playSound } from './sounds';

// Global declaration for confetti
declare var confetti: any;

const App: React.FC = () => {
  const [isLandingPage, setIsLandingPage] = useState(true);
  const [showIntroQuiz, setShowIntroQuiz] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [inputStates, setInputStates] = useState<Record<string, InputState>>({});
  const [wrongHistory, setWrongHistory] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // Ref to track if we are in a transition period to prevent double triggers
  const isTransitioningRef = useRef(false);
  // Ref to track which tabs have already triggered the completion logic to prevent loops
  const completedTabsRef = useRef<Set<number>>(new Set());

  // --- Initialization & Parsing ---

  // Load history
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWrongHistory(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Auto-focus first input when intro quiz starts
  useEffect(() => {
    if (showIntroQuiz) {
      // Use requestAnimationFrame for immediate focus after DOM renders
      const focusTimer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
        // Find the first intro input field
        const firstIntroInput = document.getElementById('input-intro-0-0');
        if (firstIntroInput) {
          focusAndScrollToInput(firstIntroInput);
        }
        });
      });
      
      return () => cancelAnimationFrame(focusTimer);
    }
  }, [showIntroQuiz]);

  // Auto-focus first input when interview starts
  useEffect(() => {
    if (showInterview) {
      // Use requestAnimationFrame for immediate focus after DOM renders
      const focusTimer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Find the first interview input field
          const firstInterviewInput = document.getElementById('input-interview-0-0-0');
          if (firstInterviewInput) {
            focusAndScrollToInput(firstInterviewInput);
          } else {
            // Fallback: find any interview input in the first tab
            const tabContentArea = document.getElementById('tab-content-0');
            if (tabContentArea) {
              const anyInput = tabContentArea.querySelector('input:not([disabled])') as HTMLInputElement;
              if (anyInput) {
                focusAndScrollToInput(anyInput);
              }
            }
          }
        });
      });
      
      return () => cancelAnimationFrame(focusTimer);
    }
  }, [showInterview]);

  // Auto-focus first input when tab changes
  useEffect(() => {
    if (isLandingPage || showIntroQuiz) return;
    
    // Wait for DOM to render after tab change
    const focusTimer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Find the first enabled input in the active tab's content area
        const tabContentArea = document.getElementById(`tab-content-${activeTab}`);
        if (!tabContentArea) return;
        
        // Find first enabled input element in the tab content
        const firstInput = tabContentArea.querySelector('input:not([disabled])') as HTMLInputElement;
        if (firstInput) {
          focusAndScrollToInput(firstInput);
        } else {
          // If no enabled input found, try any input (fallback)
          const anyInput = tabContentArea.querySelector('input') as HTMLInputElement;
          if (anyInput) {
            focusAndScrollToInput(anyInput);
          }
        }
      });
    });
    
    return () => cancelAnimationFrame(focusTimer);
  }, [activeTab, isLandingPage, showIntroQuiz, showInterview]);

  // Helper: Parse text into tokens and initialize state
  const parseAndInitContent = useCallback(() => {
    const initialStates: Record<string, InputState> = {};
    
    // Parse Intro Content
    INTRO_CONTENT.forEach((line, lineIdx) => {
      const regex = /\[(.*?)\]/g;
      let match;
      let matchCount = 0;
      while ((match = regex.exec(line)) !== null) {
        const answer = match[1];
        const id = `intro-${lineIdx}-${matchCount}`;
        initialStates[id] = {
          id,
          value: '',
          status: 'idle',
          attempts: 0,
          disabled: false,
          answer: answer.trim(),
        };
        matchCount++;
      }
    });

    // Parse Main Sections
    SECTIONS.forEach((section, secIdx) => {
      section.content.forEach((line, lineIdx) => {
        const regex = /\[(.*?)\]/g;
        let match;
        let matchCount = 0;
        while ((match = regex.exec(line)) !== null) {
          const answer = match[1];
          const id = `${secIdx}-${lineIdx}-${matchCount}`;
          initialStates[id] = {
            id,
            value: '',
            status: 'idle',
            attempts: 0,
            disabled: false,
            answer: answer.trim(),
          };
          matchCount++;
        }
      });
    });

    // Parse Interview Sections
    INTERVIEW_SECTIONS.forEach((section, secIdx) => {
      section.content.forEach((line, lineIdx) => {
        const regex = /\[(.*?)\]/g;
        let match;
        let matchCount = 0;
        while ((match = regex.exec(line)) !== null) {
          const answer = match[1];
          const id = `interview-${secIdx}-${lineIdx}-${matchCount}`;
          initialStates[id] = {
            id,
            value: '',
            status: 'idle',
            attempts: 0,
            disabled: false,
            answer: answer.trim(),
          };
          matchCount++;
        }
      });
    });
    
    return initialStates;
  }, []);

  // Initialize input states once on mount
  useEffect(() => {
    setInputStates(parseAndInitContent());
  }, [parseAndInitContent]);

  // Reset function: 초기화 (오답 기록은 유지)
  const resetToInitialState = useCallback(() => {
    setActiveTab(0);
    setInputStates(parseAndInitContent());
    setShowToast(null);
    isTransitioningRef.current = false;
    completedTabsRef.current.clear();
    setIsLandingPage(true);
    setShowIntroQuiz(false);
    setShowInterview(false);
  }, [parseAndInitContent]);

  // --- Core Logic ---

  const updateInput = (id: string, value: string) => {
    setInputStates(prev => ({
      ...prev,
      [id]: { ...prev[id], value }
    }));
  };

  // Helper: Smooth focus and scroll to input element
  const focusAndScrollToInput = (element: HTMLElement) => {
    if (!element) return;
    
    // Focus first
    element.focus();
    
    // Always use smooth scroll when moving to next input
    // Use requestAnimationFrame for smoother, more reliable scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      });
    });
  };

  const focusNextInput = (currentId: string) => {
    // Determine context (Intro vs Interview vs Main)
    let currentInputs: string[] = [];

    if (showIntroQuiz) {
        // Gather all intro IDs
        INTRO_CONTENT.forEach((line, lineIdx) => {
            const regex = /\[(.*?)\]/g;
            let matchCount = 0;
            while (regex.exec(line) !== null) {
                currentInputs.push(`intro-${lineIdx}-${matchCount}`);
                matchCount++;
            }
        });
    } else if (showInterview) {
        // Find all inputs in current interview tab in sequential order
        const currentSection = INTERVIEW_SECTIONS[activeTab];
        if (currentSection) {
            currentSection.content.forEach((line, lineIdx) => {
            const regex = /\[(.*?)\]/g;
            let matchCount = 0;
            while (regex.exec(line) !== null) {
                currentInputs.push(`interview-${activeTab}-${lineIdx}-${matchCount}`);
                matchCount++;
            }
            });
        }
    } else {
        // Find all inputs in current tab in sequential order
        const currentSection = SECTIONS[activeTab];
        if (currentSection) {
            currentSection.content.forEach((line, lineIdx) => {
            const regex = /\[(.*?)\]/g;
            let matchCount = 0;
            while (regex.exec(line) !== null) {
                currentInputs.push(`${activeTab}-${lineIdx}-${matchCount}`);
                matchCount++;
            }
            });
        }
    }

    const currentIndex = currentInputs.indexOf(currentId);
    
    if (currentIndex !== -1) {
      // Search for the next *enabled* input (skip completed/disabled ones)
      let nextId: string | null = null;
      
      for (let i = currentIndex + 1; i < currentInputs.length; i++) {
          const candidateId = currentInputs[i];
          // Check if the input is still editable (not disabled)
          if (!inputStates[candidateId]?.disabled) {
              nextId = candidateId;
              break;
          }
      }

      if (nextId) {
        const el = document.getElementById(`input-${nextId}`);
        if (el) {
          focusAndScrollToInput(el);
        }
      }
    }
  };

  const handleValidate = (id: string) => {
    const currentState = inputStates[id];
    const inputVal = currentState.value.trim();
    const correctVal = currentState.answer;

    // 띄어쓰기 제거 후 비교 (허용답안 인정)
    const normalizedInput = inputVal.replace(/\s+/g, '');
    const normalizedAnswer = correctVal.replace(/\s+/g, '');

    // Logic A-1: Correct (띄어쓰기 무시 비교)
    if (normalizedInput === normalizedAnswer) {
      playSound('correct');
      // Remove from history
      if (wrongHistory.has(id)) {
        const newHistory = new Set(wrongHistory);
        newHistory.delete(id);
        setWrongHistory(newHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newHistory)));
      }

      // 정답 처리 후 모범답안 표시 (띄어쓰기가 다를 수 있으므로)
      setInputStates(prev => ({
        ...prev,
        [id]: { 
          ...prev[id], 
          status: 'correct', 
          disabled: true,
          value: correctVal // 모범답안으로 표시
        }
      }));

      // Proceed: 0.1s delay then focus next
      setTimeout(() => {
        focusNextInput(id);
      }, 100);
      return;
    }

    // Logic A-2 & A-3: Incorrect
    const newAttempts = currentState.attempts + 1;

    if (newAttempts === 1) {
      // 1st Wrong
      playSound('wrong-1'); // Warning Sound
      setInputStates(prev => ({
        ...prev,
        [id]: { 
          ...prev[id], 
          status: 'wrong-1', 
          attempts: newAttempts, 
          value: '' // Clear immediately
        }
      }));
    } else {
      // 2nd Wrong (Fail)
      playSound('wrong-2'); // Fail Sound
      // Add to history
      const newHistory = new Set(wrongHistory);
      newHistory.add(id);
      setWrongHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newHistory)));

      setInputStates(prev => ({
        ...prev,
        [id]: { 
          ...prev[id], 
          status: 'wrong-2', 
          value: correctVal, // Auto-fill
          disabled: true 
        }
      }));

      // Proceed: 0.5s delay then focus next
      setTimeout(() => {
        focusNextInput(id);
      }, 500);
    }
  };

  // Reveal All Logic
  const revealAllAnswers = () => {
    const nextStates = { ...inputStates };
    let changed = false;

    // Determine scope of reveal based on view
    const keysToReveal = Object.keys(nextStates).filter(key => {
        if (showIntroQuiz) return key.startsWith('intro-');
        if (showInterview) return key.startsWith('interview-');
        return key.startsWith(`${activeTab}-`); // Only reveal current tab in main view to avoid spoilers
    });
    
    // Actually, user requested "Reveal All" for all sections in main view. 
    // But for intro quiz, it should only reveal intro.
    const allKeys = Object.keys(nextStates);
    const targetKeys = showIntroQuiz 
        ? allKeys.filter(k => k.startsWith('intro-'))
        : showInterview
        ? allKeys.filter(k => k.startsWith('interview-'))
        : allKeys.filter(k => !k.startsWith('intro-') && !k.startsWith('interview-')); // Reveal all main content if in main view

    targetKeys.forEach(id => {
      const state = nextStates[id];
      if (state.status !== 'correct' && state.status !== 'wrong-2') {
        nextStates[id] = {
          ...state,
          status: 'wrong-2', // Treat as revealed/failed visually
          value: state.answer,
          disabled: true
        };
        changed = true;
      }
    });

    // If in main view, prevent auto-transitions by marking tabs as done
    if (!showIntroQuiz && !showInterview) {
         SECTIONS.forEach((_, idx) => completedTabsRef.current.add(idx));
    } else if (showInterview) {
         INTERVIEW_SECTIONS.forEach((_, idx) => completedTabsRef.current.add(idx));
    }

    if (changed) {
      setInputStates(nextStates);
      playSound('complete'); 
      setShowToast({ message: "정답이 공개되었습니다.", type: "info" });
    } else {
      setShowToast({ message: "이미 모든 정답이 공개되었습니다.", type: "info" });
    }
  };

  // --- Logic B: Auto-Tab / Intro Transition ---
  useEffect(() => {
    if (isTransitioningRef.current || isLandingPage) return;

    // 1. INTRO QUIZ COMPLETION LOGIC
    if (showIntroQuiz) {
        const introIds = Object.keys(inputStates).filter(k => k.startsWith('intro-'));
        if (introIds.length > 0 && introIds.every(id => inputStates[id].disabled)) {
             isTransitioningRef.current = true;
             setShowToast({ message: "목차 학습 완료!", type: "success" });
             playSound('complete');
             
             setTimeout(() => {
                 setShowIntroQuiz(false); // Move to Main App
                 isTransitioningRef.current = false;
                 setShowToast(null);
                 // Focus first input of first tab
                 setTimeout(() => {
                     const firstInput = document.querySelector(`#tab-content-0 input`) as HTMLInputElement;
                     if (firstInput) {
                         focusAndScrollToInput(firstInput);
                     }
                 }, 100);
             }, 1500);
        }
        return;
    }

    // 2. INTERVIEW TAB COMPLETION LOGIC
    if (showInterview) {
        const currentSection = INTERVIEW_SECTIONS[activeTab];
        if (!currentSection) return;

        // Gather IDs for current interview tab
        const tabInputIds: string[] = [];
        currentSection.content.forEach((line, lineIdx) => {
          const regex = /\[(.*?)\]/g;
          let matchCount = 0;
          while (regex.exec(line) !== null) {
            tabInputIds.push(`interview-${activeTab}-${lineIdx}-${matchCount}`);
            matchCount++;
          }
        });

        if (tabInputIds.length === 0) return;

        // Check if all are disabled (completed or failed)
        const allComplete = tabInputIds.length > 0 && 
                            tabInputIds.every(id => {
                              const state = inputStates[id];
                              return state && (state.disabled || state.status === 'correct' || state.status === 'wrong-2');
                            });

        if (allComplete) {
          if (completedTabsRef.current.has(activeTab)) {
            return;
          }

          completedTabsRef.current.add(activeTab);
          isTransitioningRef.current = true;

          setShowToast({ message: "Section Complete!", type: "success" });
          playSound('complete');
          if (typeof confetti === 'function') {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
          }

          setTimeout(() => {
            // Check Global Completion (Interview sections only)
            const interviewInputs = (Object.values(inputStates) as InputState[])
                .filter(s => s.id.startsWith('interview-'));
            const allInputsDisabled = interviewInputs.every(s => s.disabled);

            if (allInputsDisabled) {
              playSound('finish');
              setShowToast({ message: "모든 학습을 완료했습니다!", type: "success" });
              isTransitioningRef.current = false;
            } else if (activeTab < INTERVIEW_SECTIONS.length - 1) {
              const nextTab = activeTab + 1;
              setActiveTab(nextTab);
              
              setTimeout(() => {
                const nextSection = INTERVIEW_SECTIONS[nextTab];
                const nextTabIds: string[] = [];
                nextSection.content.forEach((line, lineIdx) => {
                    const regex = /\[(.*?)\]/g;
                    let matchCount = 0;
                    while (regex.exec(line) !== null) {
                        nextTabIds.push(`interview-${nextTab}-${lineIdx}-${matchCount}`);
                        matchCount++;
                    }
                });

                const firstAvailableId = nextTabIds.find(id => !inputStates[id]?.disabled);
                if (firstAvailableId) {
                    const el = document.getElementById(`input-${firstAvailableId}`);
                    if (el) {
                        focusAndScrollToInput(el);
                    }
                } else {
                    const el = document.querySelector(`#tab-content-${nextTab} input`) as HTMLInputElement;
                    if (el) {
                        focusAndScrollToInput(el);
                    }
                }

                isTransitioningRef.current = false;
                setShowToast(null);
              }, 100);
            } else {
              isTransitioningRef.current = false;
              setShowToast(null);
            }
          }, 1000);
        }
        return;
    }

    // 3. MAIN APP TAB COMPLETION LOGIC
    const currentSection = SECTIONS[activeTab];
    if (!currentSection) return;

    // Gather IDs for current tab
    const tabInputIds: string[] = [];
    currentSection.content.forEach((line, lineIdx) => {
      const regex = /\[(.*?)\]/g;
      let matchCount = 0;
      while (regex.exec(line) !== null) {
        tabInputIds.push(`${activeTab}-${lineIdx}-${matchCount}`);
        matchCount++;
      }
    });

    if (tabInputIds.length === 0) return;

    // Check if all are disabled (completed or failed)
    // 모든 입력이 존재하고 비활성화되었는지 확인
    const allComplete = tabInputIds.length > 0 && 
                        tabInputIds.every(id => {
                          const state = inputStates[id];
                          return state && (state.disabled || state.status === 'correct' || state.status === 'wrong-2');
                        });

    if (allComplete) {
      if (completedTabsRef.current.has(activeTab)) {
        return;
      }

      completedTabsRef.current.add(activeTab);
      isTransitioningRef.current = true;

      setShowToast({ message: "Section Complete!", type: "success" });
      playSound('complete');
      if (typeof confetti === 'function') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
      }

      setTimeout(() => {
        // Check Global Completion (Excluding Intro)
        const mainInputs = (Object.values(inputStates) as InputState[])
            .filter(s => !s.id.startsWith('intro-'));
        const allInputsDisabled = mainInputs.every(s => s.disabled);

        if (allInputsDisabled) {
          playSound('finish');
          setShowToast({ message: "모든 학습을 완료했습니다!", type: "success" });
          isTransitioningRef.current = false;
        } else if (activeTab < SECTIONS.length - 1) {
          const nextTab = activeTab + 1;
          setActiveTab(nextTab);
          
          setTimeout(() => {
            const nextSection = SECTIONS[nextTab];
            const nextTabIds: string[] = [];
            nextSection.content.forEach((line, lineIdx) => {
                const regex = /\[(.*?)\]/g;
                let matchCount = 0;
                while (regex.exec(line) !== null) {
                    nextTabIds.push(`${nextTab}-${lineIdx}-${matchCount}`);
                    matchCount++;
                }
            });

            const firstAvailableId = nextTabIds.find(id => !inputStates[id]?.disabled);
            if (firstAvailableId) {
                const el = document.getElementById(`input-${firstAvailableId}`);
                if (el) {
                    focusAndScrollToInput(el);
                }
            } else {
                const el = document.querySelector(`#tab-content-${nextTab} input`) as HTMLInputElement;
                if (el) {
                    focusAndScrollToInput(el);
                }
            }

            isTransitioningRef.current = false;
            setShowToast(null);
          }, 100);
        } else {
          isTransitioningRef.current = false;
          setShowToast(null);
        }
      }, 1000);
    }
  }, [inputStates, activeTab, isLandingPage, showIntroQuiz, showInterview]);


  // --- Render Helpers ---

  const renderLine = (text: string, secIdx: number | string, lineIdx: number, matchOffset: number = 0, isInterview: boolean = false) => {
    const parts: React.ReactNode[] = [];
    const regex = /\[(.*?)\]/g;
    let lastIndex = 0;
    let match;
    let matchCount = matchOffset;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const id = isInterview ? `interview-${secIdx}-${lineIdx}-${matchCount}` : `${secIdx}-${lineIdx}-${matchCount}`;
      const state = inputStates[id];

      if (state) {
        parts.push(
          <ClozeInput
            key={id}
            state={state}
            isReviewNeeded={wrongHistory.has(id)}
            onUpdate={updateInput}
            onSubmit={handleValidate}
            onFocusRequest={() => {}} 
          />
        );
      } else {
          parts.push(<span key={id} className="text-muted-foreground">...</span>);
      }

      lastIndex = regex.lastIndex;
      matchCount++;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  const renderContentBlocks = () => {
    const section = SECTIONS[activeTab];
    const commonTextClass = "text-[1.9rem] leading-[3.5rem] text-card-foreground font-medium break-keep";

    // Layout for 'strategies': Title + Content pairs
    if (section.id === 'strategies') {
        const blocks = [];
        const icons = [
            <Heart className="text-primary" size={32} />, 
            <Lightbulb className="text-yellow-400" size={32} />, 
            <Target className="text-blue-400" size={32} />, 
            <Shield className="text-emerald-400" size={32} />, 
            <Users className="text-purple-400" size={32} />
        ];
        
        for (let i = 0; i < section.content.length; i += 2) {
            const icon = icons[i/2] || <CheckCircle className="text-primary" size={32} />;
            blocks.push(
                <div key={i} className="bg-card p-8 rounded-3xl border border-border shadow-md hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-4 mb-6 pb-4 border-b border-border">
                        <div className="mt-2 shrink-0">{icon}</div>
                        <div className={`${commonTextClass} text-primary font-bold`}>
                            {renderLine(section.content[i], activeTab, i)}
                        </div>
                    </div>
                    <div className={commonTextClass}>
                        {renderLine(section.content[i+1], activeTab, i+1)}
                    </div>
                </div>
            );
        }
        return <div className="space-y-8">{blocks}</div>;
    }

    // Layout for 'vision'
    if (section.id === 'vision') {
        return (
            <div className="bg-card p-10 rounded-3xl border border-border shadow-lg text-center">
                <div className={`${commonTextClass} text-primary mb-6 font-bold text-[2.2rem]`}>
                    {renderLine(section.content[0], activeTab, 0)}
                </div>
                <div className="w-24 h-1 bg-muted mx-auto my-8 rounded-full" />
                <div className="text-left bg-muted/30 p-8 rounded-2xl">
                    <span className="inline-block px-3 py-1 rounded bg-muted text-sm text-muted-foreground mb-4 font-bold">의미</span>
                    <div className={`${commonTextClass} text-foreground`}>
                        {renderLine(section.content[1], activeTab, 1)}
                    </div>
                </div>
            </div>
        );
    }

    // Layout for 'student'
    if (section.id === 'student') {
        return (
            <div className="flex flex-col gap-6">
                 <div className="bg-gradient-to-br from-primary/20 to-card p-10 rounded-3xl border border-primary/30 text-center shadow-md">
                    <div className="text-primary text-sm font-bold mb-3 uppercase tracking-widest">학습자상</div>
                    <div className={`${commonTextClass} text-foreground font-bold`}>
                        {renderLine(section.content[0], activeTab, 0)}
                    </div>
                </div>
                <div className="grid gap-4">
                    {section.content.slice(1).map((line, idx) => (
                        <div key={idx+1} className="bg-card p-8 rounded-2xl border border-border flex items-start gap-6 shadow-sm">
                            <div className="mt-5 w-3 h-3 rounded-full bg-primary shrink-0 ring-4 ring-primary/20" />
                            <div className={commonTextClass}>
                                {renderLine(line, activeTab, idx + 1)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Layout for 'principles': 파트별 시각적 구분
    if (section.id === 'principles') {
        const parts: Array<{title: string, titleLineIdx: number, definition: string, meaning: string, defLineIdx: number, meanLineIdx: number}> = [];
        let currentPart: {title: string, titleLineIdx: number, definition: string, meaning: string, defLineIdx: number, meanLineIdx: number} | null = null;

        section.content.forEach((line, idx) => {
            // 빈 줄 건너뛰기
            if (!line.trim()) return;
            
            // 헤더 감지 (#[주도성], #[관계성], #[자율성])
            if (line.startsWith('#')) {
                if (currentPart) {
                    parts.push(currentPart);
                }
                currentPart = {
                    title: line.substring(1), // "#" 제거, "[주도성]" 형태로 저장
                    titleLineIdx: idx,
                    definition: '',
                    meaning: '',
                    defLineIdx: -1,
                    meanLineIdx: -1
                };
            } else if (currentPart && line.startsWith('정의:')) {
                currentPart.definition = line.substring(3).trim(); // "정의: " 제거
                currentPart.defLineIdx = idx;
            } else if (currentPart && line.startsWith('의의:')) {
                currentPart.meaning = line.substring(3).trim(); // "의의: " 제거
                currentPart.meanLineIdx = idx;
            }
        });
        
        if (currentPart) {
            parts.push(currentPart);
        }

        return (
            <div className="space-y-8">
                {parts.map((part, partIdx) => {
                    // 정의 부분의 [ ] 패턴 개수 계산
                    const defMatches = (part.definition.match(/\[(.*?)\]/g) || []).length;
                    
                    return (
                        <div key={partIdx} className="bg-gradient-to-br from-card to-card/50 p-10 rounded-3xl border-2 border-primary/20 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all">
                            {/* 파트 헤더 */}
                            <div className="mb-6 pb-4 border-b-2 border-primary/30">
                                <h3 className={`${commonTextClass} text-primary font-bold text-[2.3rem]`}>
                                    {renderLine(part.title, activeTab, part.titleLineIdx, 0)}
                                </h3>
                            </div>
                            
                            {/* 정의 섹션 */}
                            <div className="mb-6 pb-6 border-b border-border/50">
                                <div className="inline-block px-4 py-2 mb-4 rounded-lg bg-primary/10 border border-primary/20">
                                    <span className="text-primary font-bold text-lg">정의</span>
                                </div>
                                <div className={commonTextClass}>
                                    {renderLine(part.definition, activeTab, part.defLineIdx, 0)}
                                </div>
                            </div>
                            
                            {/* 의의 섹션 */}
                            <div>
                                <div className="inline-block px-4 py-2 mb-4 rounded-lg bg-primary/10 border border-primary/20">
                                    <span className="text-primary font-bold text-lg">의의</span>
                                </div>
                                <div className={commonTextClass}>
                                    {renderLine(part.meaning, activeTab, part.meanLineIdx, defMatches)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Layout for sections with "A: B" format (competencies, goals)
    if (section.id === 'competencies' || section.id === 'goals') {
        return (
            <div className="space-y-6">
                {section.content.map((line, idx) => {
                    // "A: B" 형식을 파싱하여 키워드와 설명 분리
                    const colonIndex = line.indexOf(':');
                    if (colonIndex === -1) {
                        // 콜론이 없으면 기존 방식으로 렌더링
                        return (
                            <div key={idx} className="bg-card p-8 rounded-3xl border border-border shadow-md">
                                <div className={commonTextClass}>
                                    {renderLine(line, activeTab, idx)}
                                </div>
                            </div>
                        );
                    }
                    
                    const keyword = line.substring(0, colonIndex).trim();
                    const description = line.substring(colonIndex + 1).trim();
                    
                    // 키워드 부분의 [ ] 패턴 개수를 세어서 설명 부분의 matchOffset 계산
                    const keywordMatches = (keyword.match(/\[(.*?)\]/g) || []).length;
                    
                    return (
                        <div key={idx} className="bg-card p-8 rounded-3xl border border-border shadow-md">
                            <div className="mb-4 pb-4 border-b border-border/50">
                                <div className={`${commonTextClass} text-primary font-bold text-[2.1rem]`}>
                                    {renderLine(keyword, activeTab, idx, 0)}
                                </div>
                            </div>
                            <div className={commonTextClass}>
                                {renderLine(description, activeTab, idx, keywordMatches)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Layout for other sections (List items)
    return (
        <div className="space-y-6">
            {section.content.map((line, idx) => (
                 <div key={idx} className="bg-card p-8 rounded-3xl border border-border shadow-md">
                    <div className={commonTextClass}>
                        {renderLine(line, activeTab, idx)}
                    </div>
                </div>
            ))}
        </div>
    );
  };

  // --- VIEW: LANDING PAGE ---
  if (isLandingPage) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
            </div>

            <div className="max-w-2xl w-full bg-card/50 backdrop-blur-sm border border-border/50 p-10 rounded-[2.5rem] shadow-2xl text-center animate-in fade-in zoom-in duration-500">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mb-8 shadow-lg shadow-primary/30">
                    <BookOpen size={40} strokeWidth={2.5} />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                    2025 대구 미래역량 교육
                </h1>
                
                <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-medium">
                    미래를 배우고 함께 성장하는<br/>
                    대구교육의 핵심 가치를 학습해보세요.
                </p>
                
                <div className="flex flex-col gap-4 items-center w-full">
                    <button 
                        onClick={() => {
                            playSound('complete');
                            setIsLandingPage(false);
                            setShowIntroQuiz(true); // Start Intro Quiz instead of going straight to app
                        }}
                        className="w-full max-w-md group relative flex items-center justify-between px-8 py-5 bg-primary hover:bg-primary/90 text-primary-foreground text-xl font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/25 active:scale-95"
                    >
                        <span className="flex-1 text-center">Ⅱ 대구교육의 방향</span>
                        <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                            <ChevronRight size={24} />
                        </div>
                    </button>
                    <button 
                        onClick={() => {
                            playSound('complete');
                            setIsLandingPage(false);
                            setShowIntroQuiz(false);
                            setShowInterview(true);
                            setActiveTab(0);
                        }}
                        className="w-full max-w-md group relative flex items-center justify-between px-8 py-5 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xl font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/25 active:scale-95"
                    >
                        <span className="flex-1 text-center">심층면접 서결론</span>
                        <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                            <ChevronRight size={24} />
                        </div>
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-8 text-muted-foreground text-sm font-medium opacity-60">
                Daegu Metropolitan Office of Education
            </div>
        </div>
    );
  }

  // --- VIEW: INTRO QUIZ ---
  if (showIntroQuiz) {
      return (
        <div className="min-h-screen flex flex-col items-center pb-20 bg-background">
            <header className="w-full max-w-5xl p-6 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
                 <button 
                    onClick={resetToInitialState}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <div className="bg-primary p-2 rounded-lg">
                        <BookOpen className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">2025 대구 미래역량 교육</h1>
                </button>
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={revealAllAnswers}
                        className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-secondary-foreground text-sm font-medium transition-colors"
                    >
                        <Eye size={18} />
                        <span className="hidden sm:inline">정답 보기</span>
                    </button>
                 </div>
            </header>
            
            <main className="w-full max-w-3xl p-6 md:p-12 flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-card p-10 rounded-[2.5rem] border border-border shadow-xl w-full text-center">
                    <div className="mb-8 flex flex-col items-center">
                        <div className="bg-secondary p-4 rounded-full mb-4 text-secondary-foreground">
                            <List size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">목차 학습</h2>
                        <p className="text-muted-foreground">빈칸을 채워 대구교육의 방향 목차를 완성하세요.</p>
                    </div>
                    
                    <div className="space-y-4 text-left inline-block">
                        {INTRO_CONTENT.map((line, idx) => (
                            <div key={idx} className="text-[1.9rem] leading-[3.5rem] font-bold text-card-foreground pl-4 border-l-4 border-primary/20 hover:border-primary transition-colors">
                                {renderLine(line, 'intro', idx)}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            
            {showToast && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-8 py-4 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-4 z-50 animate-bounce-gentle">
                    <div className="bg-white/20 p-1 rounded-full"><CheckCircle size={24} /></div>
                    <span className="text-xl font-bold">{showToast.message}</span>
                </div>
            )}
        </div>
      );
  }

  // --- VIEW: INTERVIEW ---
  if (showInterview) {
    const renderInterviewContentBlocks = () => {
      const section = INTERVIEW_SECTIONS[activeTab];
      const commonTextClass = "text-[1.9rem] leading-[3.5rem] text-card-foreground font-medium break-keep tracking-wide";

      // 구조화된 데이터로 변환
      const blocks: Array<{
        type: 'header' | 'intro' | 'conclusion';
        header?: string; // "1. 구상형", "2. 즉답형"
        content: string;
        lineIdx: number;
      }> = [];

      let currentHeader: string | null = null;
      
      section.content.forEach((line, idx) => {
        if (!line.trim()) return;
        
        // 헤더 감지
        if (/^\d+\.\s/.test(line.trim())) {
          currentHeader = line.trim();
          blocks.push({
            type: 'header',
            header: currentHeader,
            content: '',
            lineIdx: idx
          });
        }
        // 서론/결론 감지
        else if (line.trim().startsWith('서론:') || line.trim().startsWith('결론:')) {
          const isConclusion = line.trim().startsWith('결론:');
          // "서론:" 또는 "결론:" 부분을 제거하고 본문만 추출
          const content = line.substring(line.indexOf(':') + 1).trim();
          blocks.push({
            type: isConclusion ? 'conclusion' : 'intro',
            header: currentHeader || undefined,
            content,
            lineIdx: idx
          });
        }
      });

      // 헤더별로 그룹화하여 렌더링
      const groupedBlocks: { [key: string]: Array<typeof blocks[0]> } = {};
      blocks.forEach(block => {
        const key = block.header || 'default';
        if (!groupedBlocks[key]) {
          groupedBlocks[key] = [];
        }
        groupedBlocks[key].push(block);
      });

      return (
        <div className="space-y-16">
          {Object.entries(groupedBlocks).map(([headerKey, groupBlocks], groupIdx) => {
            const headerBlock = groupBlocks.find(b => b.type === 'header');
            const introBlock = groupBlocks.find(b => b.type === 'intro');
            const conclusionBlock = groupBlocks.find(b => b.type === 'conclusion');

            return (
              <div key={groupIdx} className="space-y-10">
                {/* 헤더 (구상형/즉답형) */}
                {headerBlock && headerBlock.header && (
                  <div className="flex items-center gap-4">
                    {(() => {
                      const match = headerBlock.header.match(/^(\d+)\.\s*(.+)/);
                      const number = match ? match[1] : null;
                      const title = match ? match[2] : headerBlock.header;
                      return (
                        <>
                          {number && (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary text-lg font-bold">
                              {number}
                            </div>
                          )}
                          <h3 className="text-[2.2rem] font-bold text-primary">
                            {title}
                          </h3>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="space-y-8">
                  {/* 서론 */}
                  {introBlock && (
                    <div className="bg-card p-10 rounded-2xl shadow-sm">
                      <div className="mb-6">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                          서론
                        </span>
                      </div>
                      <div className={commonTextClass}>
                        {renderLine(introBlock.content, activeTab, introBlock.lineIdx, 0, true)}
                      </div>
                    </div>
                  )}

                  {/* 결론 */}
                  {conclusionBlock && (
                    <div className="bg-card p-10 rounded-2xl shadow-sm">
                      <div className="mb-6">
                        <span className="text-sm font-bold text-primary uppercase tracking-wider">
                          결론
                        </span>
                      </div>
                      <div className={commonTextClass}>
                        {renderLine(conclusionBlock.content, activeTab, conclusionBlock.lineIdx, 0, true)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="min-h-screen flex flex-col items-center pb-20 bg-background">
        {/* Header */}
        <header className="w-full max-w-5xl p-6 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
          <button 
            onClick={resetToInitialState}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            title="첫 화면으로"
          >
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">심층면접 서결론</h1>
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            {wrongHistory.size > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/20 text-destructive text-sm font-medium animate-pulse">
                <AlertTriangle size={16} />
                <span>복습: {wrongHistory.size}</span>
              </div>
            )}
            <button 
              onClick={revealAllAnswers}
              className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-secondary-foreground text-sm font-medium transition-colors"
              title="정답 보기"
            >
              <Eye size={18} />
              <span className="hidden sm:inline">정답 보기</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full max-w-4xl p-6 md:p-12 flex-1">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {INTERVIEW_SECTIONS.map((section, idx) => {
              const isCurrent = idx === activeTab;
              const sectionIds = Object.keys(inputStates).filter(k => k.startsWith(`interview-${idx}-`));
              const isDone = sectionIds.length > 0 && sectionIds.every(id => inputStates[id].status === 'correct' || inputStates[id].status === 'wrong-2');

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(idx)}
                  className={`
                    px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border
                    ${isCurrent 
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80'}
                    ${isDone && !isCurrent ? 'border-primary/50 text-primary bg-primary/10' : ''}
                  `}
                >
                  {isDone && <CheckCircle size={14} />}
                  {section.title}
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Block Render */}
          <div id={`tab-content-${activeTab}`} className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {renderInterviewContentBlocks()}
          </div>

        </main>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-8 py-4 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-4 z-50 animate-bounce-gentle">
            <div className="bg-white/20 p-1 rounded-full"><CheckCircle size={24} /></div>
            <span className="text-xl font-bold">{showToast.message}</span>
          </div>
        )}
        
        <style>{`
          @keyframes bounce-gentle {
              0%, 100% { transform: translate(-50%, 0); }
              50% { transform: translate(-50%, -10px); }
          }
          .animate-bounce-gentle {
              animation: bounce-gentle 2s infinite;
          }
        `}</style>
      </div>
    );
  }

  // --- VIEW: MAIN LEARNING APP ---
  return (
    <div className="min-h-screen flex flex-col items-center pb-20 bg-background">
      {/* Header */}
      <header className="w-full max-w-5xl p-6 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <button 
            onClick={resetToInitialState}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            title="첫 화면으로"
        >
          <div className="bg-primary p-2 rounded-lg">
             <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">2025 대구 미래역량 교육</h1>
        </button>
        <div className="flex items-center gap-3 sm:gap-4">
            {wrongHistory.size > 0 && (
                <div className="hidden sm:flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/20 text-destructive text-sm font-medium animate-pulse">
                    <AlertTriangle size={16} />
                    <span>복습: {wrongHistory.size}</span>
                </div>
            )}
            <button 
                onClick={revealAllAnswers}
                className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-secondary-foreground text-sm font-medium transition-colors"
                title="정답 보기"
            >
                <Eye size={18} />
                <span className="hidden sm:inline">정답 보기</span>
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl p-6 md:p-12 flex-1">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {SECTIONS.map((section, idx) => {
              const isCurrent = idx === activeTab;
              const sectionIds = Object.keys(inputStates).filter(k => k.startsWith(`${idx}-`));
              const isDone = sectionIds.length > 0 && sectionIds.every(id => inputStates[id].status === 'correct' || inputStates[id].status === 'wrong-2');

              return (
                <button
                    key={section.id}
                    onClick={() => setActiveTab(idx)}
                    className={`
                        px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border
                        ${isCurrent 
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105' 
                            : 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80'}
                        ${isDone && !isCurrent ? 'border-primary/50 text-primary bg-primary/10' : ''}
                    `}
                >
                    {isDone && <CheckCircle size={14} />}
                    {section.title}
                </button>
              );
          })}
        </div>

        {/* Dynamic Content Block Render */}
        <div id={`tab-content-${activeTab}`} className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
             {renderContentBlocks()}
        </div>

      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-8 py-4 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-4 z-50 animate-bounce-gentle">
            <div className="bg-white/20 p-1 rounded-full"><CheckCircle size={24} /></div>
            <span className="text-xl font-bold">{showToast.message}</span>
        </div>
      )}
      
      <style>{`
        @keyframes bounce-gentle {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, -10px); }
        }
        .animate-bounce-gentle {
            animation: bounce-gentle 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
