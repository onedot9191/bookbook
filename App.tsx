
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, CheckCircle, ChevronRight, AlertTriangle, Lightbulb, Target, Shield, Users, Heart, Eye, RotateCcw, Home, List } from 'lucide-react';
import { SECTIONS, INTRO_CONTENT } from './constants';
import { InputState, STORAGE_KEY } from './types';
import { ClozeInput } from './components/ClozeInput';
import { playSound } from './sounds';

// Global declaration for confetti
declare var confetti: any;

const App: React.FC = () => {
  const [isLandingPage, setIsLandingPage] = useState(true);
  const [showIntroQuiz, setShowIntroQuiz] = useState(false);
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
    
    return initialStates;
  }, []);

  // Initialize input states once on mount
  useEffect(() => {
    setInputStates(parseAndInitContent());
  }, [parseAndInitContent]);


  // --- Core Logic ---

  const updateInput = (id: string, value: string) => {
    setInputStates(prev => ({
      ...prev,
      [id]: { ...prev[id], value }
    }));
  };

  const focusNextInput = (currentId: string) => {
    // Determine context (Intro vs Main)
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
          el.focus();
          // Smoothly scroll the next input into the center of the view
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handleValidate = (id: string) => {
    const currentState = inputStates[id];
    const inputVal = currentState.value.trim();
    const correctVal = currentState.answer;

    // Logic A-1: Correct
    if (inputVal === correctVal) {
      playSound('correct');
      // Remove from history
      if (wrongHistory.has(id)) {
        const newHistory = new Set(wrongHistory);
        newHistory.delete(id);
        setWrongHistory(newHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newHistory)));
      }

      setInputStates(prev => ({
        ...prev,
        [id]: { ...prev[id], status: 'correct', disabled: true }
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
        return key.startsWith(`${activeTab}-`); // Only reveal current tab in main view to avoid spoilers
    });
    
    // Actually, user requested "Reveal All" for all sections in main view. 
    // But for intro quiz, it should only reveal intro.
    const allKeys = Object.keys(nextStates);
    const targetKeys = showIntroQuiz 
        ? allKeys.filter(k => k.startsWith('intro-')) 
        : allKeys.filter(k => !k.startsWith('intro-')); // Reveal all main content if in main view

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
    if (!showIntroQuiz) {
         SECTIONS.forEach((_, idx) => completedTabsRef.current.add(idx));
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
                     firstInput?.focus();
                 }, 100);
             }, 1500);
        }
        return;
    }

    // 2. MAIN APP TAB COMPLETION LOGIC
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
    const allComplete = tabInputIds.every(id => inputStates[id]?.disabled);

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
                    el.focus();
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                const el = document.querySelector(`#tab-content-${nextTab} input`) as HTMLInputElement;
                if (el) {
                    el.focus();
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  }, [inputStates, activeTab, isLandingPage, showIntroQuiz]);


  // --- Render Helpers ---

  const renderLine = (text: string, secIdx: number | string, lineIdx: number) => {
    const parts: React.ReactNode[] = [];
    const regex = /\[(.*?)\]/g;
    let lastIndex = 0;
    let match;
    let matchCount = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const id = `${secIdx}-${lineIdx}-${matchCount}`;
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
                    2025 대구미래역량교육
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
                    onClick={() => {
                        setShowIntroQuiz(false);
                        setIsLandingPage(true);
                    }}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <div className="bg-primary p-2 rounded-lg">
                        <BookOpen className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">2025 대구미래역량교육</h1>
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

  // --- VIEW: MAIN LEARNING APP ---
  return (
    <div className="min-h-screen flex flex-col items-center pb-20 bg-background">
      {/* Header */}
      <header className="w-full max-w-5xl p-6 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <button 
            onClick={() => {
                setIsLandingPage(true);
                setShowIntroQuiz(false);
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            title="첫 화면으로"
        >
          <div className="bg-primary p-2 rounded-lg">
             <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">2025 대구미래역량교육</h1>
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
        
        {/* Manual Next Button */}
        <div className="mt-16 flex justify-center">
            <button 
                onClick={() => {
                    if (activeTab < SECTIONS.length - 1) setActiveTab(p => p + 1);
                }}
                className={`
                    group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all px-6 py-3 rounded-full hover:bg-muted
                    ${activeTab === SECTIONS.length - 1 ? 'hidden' : ''}
                `}
            >
                <span className="font-medium">다음 섹션으로 넘어가기</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </button>
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
