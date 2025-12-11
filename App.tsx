
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, CheckCircle, ChevronRight, AlertTriangle, Lightbulb, Target, Shield, Users, Heart, Eye, RotateCcw, Home, List, X } from 'lucide-react';
import { SECTIONS, INTRO_CONTENT, INTERVIEW_SECTIONS, POLICY_SECTIONS, POLICY_DETAILS } from './constants';
import { InputState, STORAGE_KEY } from './types';
import { ClozeInput } from './components/ClozeInput';
import { playSound } from './sounds';

// Global declaration for confetti
declare var confetti: any;

const App: React.FC = () => {
  const [isLandingPage, setIsLandingPage] = useState(true);
  const [showIntroQuiz, setShowIntroQuiz] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicyDetail, setSelectedPolicyDetail] = useState<string | null>(null);
  const [activePolicyTab, setActivePolicyTab] = useState(0);
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
          // Focus the first enabled intro input (DOM 순서 기준)
          focusFirstInputGlobally();
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
          // Focus first enabled input in the first interview tab (DOM 순서 기준)
          if (!focusFirstInputInContainer('tab-content-0')) {
            focusFirstInputGlobally();
          }
        });
      });
      
      return () => cancelAnimationFrame(focusTimer);
    }
  }, [showInterview]);

  // Auto-focus first input when policy starts
  useEffect(() => {
    if (showPolicy) {
      // Use requestAnimationFrame for immediate focus after DOM renders
      const focusTimer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Focus first enabled input in the first policy tab (DOM 순서 기준)
          if (!focusFirstInputInContainer('tab-content-0')) {
            focusFirstInputGlobally();
          }
        });
      });
      
      return () => cancelAnimationFrame(focusTimer);
    }
  }, [showPolicy]);

  // Auto-focus first input when policy detail starts or tab changes
  useEffect(() => {
    if (selectedPolicyDetail) {
      const focusTimer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Focus first enabled input in the current policy detail tab (DOM 순서 기준)
          const containerId = `tab-content-${activePolicyTab}`;
          if (!focusFirstInputInContainer(containerId)) {
            focusFirstInputGlobally();
          }
        });
      });
      
      return () => cancelAnimationFrame(focusTimer);
    }
  }, [selectedPolicyDetail, activePolicyTab]);

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
  }, [activeTab, isLandingPage, showIntroQuiz, showInterview, showPolicy]);

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

    // Parse Policy Sections
    POLICY_SECTIONS.forEach((section, secIdx) => {
      section.content.forEach((line, lineIdx) => {
        const regex = /\[(.*?)\]/g;
        let match;
        let matchCount = 0;
        while ((match = regex.exec(line)) !== null) {
          const answer = match[1];
          const id = `policy-${secIdx}-${lineIdx}-${matchCount}`;
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

    // Parse Policy Details Hierarchy
    POLICY_DETAILS.forEach((policyDetail, policyIdx) => {
      const parseHierarchyItem = (item: { title: string; children?: any[] }, path: string) => {
        const regex = /\[(.*?)\]/g;
        let match;
        let matchCount = 0;
        while ((match = regex.exec(item.title)) !== null) {
          const answer = match[1];
          const id = `policy-detail-${policyIdx}-${path}-${matchCount}`;
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
        
        if (item.children) {
          item.children.forEach((child, childIdx) => {
            parseHierarchyItem(child, `${path}-${childIdx}`);
          });
        }
      };

      // 최상위 항목(탭)의 children 파싱 (Level 0 아이템도 포함)
      policyDetail.hierarchy.forEach((topItem, topIdx) => {
        // Level 0 아이템 자체도 파싱
        parseHierarchyItem(topItem, `top-${topIdx}`);
        // Level 0 아이템의 children도 파싱
        if (topItem.children) {
          topItem.children.forEach((child, childIdx) => {
            parseHierarchyItem(child, `top-${topIdx}-${childIdx}`);
          });
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
    setActivePolicyTab(0);
    setInputStates(parseAndInitContent());
    setShowToast(null);
    isTransitioningRef.current = false;
    completedTabsRef.current.clear();
    setIsLandingPage(true);
    setShowIntroQuiz(false);
    setShowInterview(false);
    setShowPolicy(false);
    setSelectedPolicyDetail(null);
    setShowPolicyModal(false);
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

  // Helper: Focus the first enabled input within a container (DOM order)
  const focusFirstInputInContainer = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return false;

    const firstEnabled = container.querySelector('input:not([disabled])') as HTMLInputElement | null;
    if (firstEnabled) {
      focusAndScrollToInput(firstEnabled);
      return true;
    }

    const anyInput = container.querySelector('input') as HTMLInputElement | null;
    if (anyInput) {
      focusAndScrollToInput(anyInput);
      return true;
    }

    return false;
  };

  // Helper: Focus the first enabled input in the current view (fallback to document order)
  const focusFirstInputGlobally = () => {
    const firstEnabled = document.querySelector('input:not([disabled])') as HTMLInputElement | null;
    if (firstEnabled) {
      focusAndScrollToInput(firstEnabled);
      return true;
    }
    const anyInput = document.querySelector('input') as HTMLInputElement | null;
    if (anyInput) {
      focusAndScrollToInput(anyInput);
      return true;
    }
    return false;
  };

  const focusNextInput = (currentId: string) => {
    // Determine context (Intro vs Interview vs Policy vs PolicyDetail vs Main)
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
    } else if (selectedPolicyDetail) {
        // Find all inputs in current policy detail tab in sequential order
        const policyDetail = POLICY_DETAILS.find(p => p.id === selectedPolicyDetail);
        if (policyDetail) {
            const policyDetailIdx = POLICY_DETAILS.findIndex(p => p.id === selectedPolicyDetail);
            const selectedItem = policyDetail.hierarchy[activePolicyTab];
            
            // parseHierarchyItem과 동일한 경로 계산
            const collectInputs = (item: { title: string; children?: any[] }, path: string) => {
                const matches = item.title.match(/\[(.*?)\]/g);
                if (matches) {
                    matches.forEach((_, matchIdx) => {
                        currentInputs.push(`policy-detail-${policyDetailIdx}-${path}-${matchIdx}`);
                    });
                }
                
                if (item.children) {
                    item.children.forEach((child, childIdx) => {
                        collectInputs(child, `${path}-${childIdx}`);
                    });
                }
            };
            
            // 최상위 항목(탭) 자체와 children 모두 수집
            if (selectedItem) {
                // Level 0 아이템 자체도 수집
                collectInputs(selectedItem, `top-${activePolicyTab}`);
                // Level 0 아이템의 children도 수집
                if (selectedItem.children) {
                    selectedItem.children.forEach((child, childIdx) => {
                        collectInputs(child, `top-${activePolicyTab}-${childIdx}`);
                    });
                }
            }
        }
    } else if (showPolicy) {
        // Find all inputs in current policy tab in sequential order
        const currentSection = POLICY_SECTIONS[activeTab];
        if (currentSection) {
            currentSection.content.forEach((line, lineIdx) => {
            const regex = /\[(.*?)\]/g;
            let matchCount = 0;
            while (regex.exec(line) !== null) {
                currentInputs.push(`policy-${activeTab}-${lineIdx}-${matchCount}`);
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

    // 띄어쓰기 및 · 기호 제거 후 비교 (허용답안 인정)
    // 대소문자 구분하지 않음
    const normalizedInput = inputVal.replace(/\s+/g, '').replace(/·/g, '').toLowerCase();
    const normalizedAnswer = correctVal.replace(/\s+/g, '').replace(/·/g, '').toLowerCase();

    // 괄호와 그 안의 내용을 제거한 버전도 생성 (허용답안 인정)
    const answerWithoutParentheses = correctVal.replace(/\([^)]*\)/g, '').trim();
    const normalizedAnswerWithoutParentheses = answerWithoutParentheses.replace(/\s+/g, '').replace(/·/g, '').toLowerCase();

    // Logic A-1: Correct (띄어쓰기 및 · 기호 무시 비교 또는 괄호 제거 버전 비교, 대소문자 구분 안 함)
    if (normalizedInput === normalizedAnswer || normalizedInput === normalizedAnswerWithoutParentheses) {
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
        if (showPolicy) return key.startsWith('policy-') && !key.startsWith('policy-detail-');
        if (selectedPolicyDetail) return key.startsWith('policy-detail-');
        return key.startsWith(`${activeTab}-`); // Only reveal current tab in main view to avoid spoilers
    });
    
    // Actually, user requested "Reveal All" for all sections in main view. 
    // But for intro quiz, it should only reveal intro.
    const allKeys = Object.keys(nextStates);
    const targetKeys = showIntroQuiz 
        ? allKeys.filter(k => k.startsWith('intro-'))
        : showInterview
        ? allKeys.filter(k => k.startsWith('interview-'))
        : selectedPolicyDetail
        ? allKeys.filter(k => k.startsWith('policy-detail-'))
        : showPolicy
        ? allKeys.filter(k => k.startsWith('policy-') && !k.startsWith('policy-detail-'))
        : allKeys.filter(k => !k.startsWith('intro-') && !k.startsWith('interview-') && !k.startsWith('policy-')); // Reveal all main content if in main view

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
    if (!showIntroQuiz && !showInterview && !showPolicy && !selectedPolicyDetail) {
         SECTIONS.forEach((_, idx) => completedTabsRef.current.add(idx));
    } else if (showInterview) {
         INTERVIEW_SECTIONS.forEach((_, idx) => completedTabsRef.current.add(idx));
    } else if (showPolicy) {
         POLICY_SECTIONS.forEach((_, idx) => completedTabsRef.current.add(idx));
    }

    if (changed) {
      setInputStates(nextStates);
      playSound('complete'); 
      setShowToast({ message: "정답이 공개되었습니다.", type: "info" });
    } else {
      setShowToast({ message: "이미 모든 정답이 공개되었습니다.", type: "info" });
    }
  };

  // Helper function to collect input IDs for a section (matches rendering logic)
  const collectSectionInputIds = (section: typeof SECTIONS[0], tabIdx: number): string[] => {
    const inputIds: string[] = [];
    
    // 'principles' 섹션의 특수 처리
    if (section.id === 'principles') {
      const parts: Array<{title: string, titleLineIdx: number, definition: string, meaning: string, defLineIdx: number, meanLineIdx: number}> = [];
      let currentPart: {title: string, titleLineIdx: number, definition: string, meaning: string, defLineIdx: number, meanLineIdx: number} | null = null;

      section.content.forEach((line, idx) => {
        if (!line.trim()) return;
        
        if (line.startsWith('#')) {
          if (currentPart) {
            parts.push(currentPart);
          }
          currentPart = {
            title: line.substring(1),
            titleLineIdx: idx,
            definition: '',
            meaning: '',
            defLineIdx: -1,
            meanLineIdx: -1
          };
        } else if (currentPart && line.startsWith('정의:')) {
          currentPart.definition = line.substring(3).trim();
          currentPart.defLineIdx = idx;
        } else if (currentPart && line.startsWith('의의:')) {
          currentPart.meaning = line.substring(3).trim();
          currentPart.meanLineIdx = idx;
        }
      });
      
      if (currentPart) {
        parts.push(currentPart);
      }

      // 각 part의 ID 수집 (렌더링 로직과 동일)
      parts.forEach((part) => {
        // title의 매치들 (matchOffset = 0)
        const titleMatches = (part.title.match(/\[(.*?)\]/g) || []);
        titleMatches.forEach((_, matchIdx) => {
          inputIds.push(`${tabIdx}-${part.titleLineIdx}-${matchIdx}`);
        });

        // definition의 매치들 (matchOffset = 0)
        const defMatches = (part.definition.match(/\[(.*?)\]/g) || []);
        defMatches.forEach((_, matchIdx) => {
          inputIds.push(`${tabIdx}-${part.defLineIdx}-${matchIdx}`);
        });

        // meaning의 매치들 (matchOffset = defMatches.length)
        const meanMatches = (part.meaning.match(/\[(.*?)\]/g) || []);
        meanMatches.forEach((_, matchIdx) => {
          inputIds.push(`${tabIdx}-${part.meanLineIdx}-${defMatches.length + matchIdx}`);
        });
      });
    }
    // 'competencies', 'goals' 섹션의 특수 처리
    else if (section.id === 'competencies' || section.id === 'goals') {
      section.content.forEach((line, idx) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) {
          // 콜론이 없으면 일반 방식
          const regex = /\[(.*?)\]/g;
          let matchCount = 0;
          while (regex.exec(line) !== null) {
            inputIds.push(`${tabIdx}-${idx}-${matchCount}`);
            matchCount++;
          }
        } else {
          const keyword = line.substring(0, colonIndex).trim();
          const description = line.substring(colonIndex + 1).trim();
          
          // keyword의 매치들 (matchOffset = 0)
          const keywordMatches = (keyword.match(/\[(.*?)\]/g) || []);
          keywordMatches.forEach((_, matchIdx) => {
            inputIds.push(`${tabIdx}-${idx}-${matchIdx}`);
          });

          // description의 매치들 (matchOffset = keywordMatches.length)
          const descMatches = (description.match(/\[(.*?)\]/g) || []);
          descMatches.forEach((_, matchIdx) => {
            inputIds.push(`${tabIdx}-${idx}-${keywordMatches.length + matchIdx}`);
          });
        }
      });
    }
    // 일반 섹션 처리
    else {
      section.content.forEach((line, lineIdx) => {
        const regex = /\[(.*?)\]/g;
        let matchCount = 0;
        while (regex.exec(line) !== null) {
          inputIds.push(`${tabIdx}-${lineIdx}-${matchCount}`);
          matchCount++;
        }
      });
    }
    
    return inputIds;
  };

// Helper function to collect all input IDs for a policy detail top-level tab (includes the top item itself)
const collectPolicyDetailInputIds = (
  policyDetail: (typeof POLICY_DETAILS)[number],
  policyDetailIdx: number,
  topIdx: number
): string[] => {
  const ids: string[] = [];

  const traverse = (item: { title: string; children?: any[] }, path: string) => {
    const matches = item.title.match(/\[(.*?)\]/g);
    if (matches) {
      matches.forEach((_, matchIdx) => {
        ids.push(`policy-detail-${policyDetailIdx}-${path}-${matchIdx}`);
      });
    }

    if (item.children) {
      item.children.forEach((child, childIdx) => {
        traverse(child, `${path}-${childIdx}`);
      });
    }
  };

  const topItem = policyDetail.hierarchy[topIdx];
  if (topItem) {
    traverse(topItem, `top-${topIdx}`);
  }

  return ids;
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

    // 2. POLICY DETAIL TAB COMPLETION LOGIC
    if (selectedPolicyDetail) {
        const policyDetail = POLICY_DETAILS.find(p => p.id === selectedPolicyDetail);
        if (!policyDetail) return;

        const currentTopItem = policyDetail.hierarchy[activePolicyTab];
        if (!currentTopItem || !currentTopItem.children) return;

        // Gather IDs for current policy detail tab (top item + 모든 하위)
        const policyDetailIdx = POLICY_DETAILS.findIndex(p => p.id === selectedPolicyDetail);
        const tabInputIds = collectPolicyDetailInputIds(policyDetail, policyDetailIdx, activePolicyTab);

        if (tabInputIds.length === 0) return;

        // Check if all are disabled (completed or failed)
        const allComplete = tabInputIds.length > 0 && 
                            tabInputIds.every(id => {
                              const state = inputStates[id];
                              return state && (state.disabled || state.status === 'correct' || state.status === 'wrong-2');
                            });

        if (allComplete) {
          if (completedTabsRef.current.has(activePolicyTab)) {
            return;
          }

          completedTabsRef.current.add(activePolicyTab);
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
            // Check Global Completion (Policy detail sections only)
            const policyDetailInputs = (Object.values(inputStates) as InputState[])
                .filter(s => s.id.startsWith('policy-detail-'));
            const allInputsDisabled = policyDetailInputs.every(s => s.disabled);

            if (allInputsDisabled) {
              playSound('finish');
              setShowToast({ message: "모든 학습을 완료했습니다!", type: "success" });
              isTransitioningRef.current = false;
            } else if (activePolicyTab < policyDetail.hierarchy.length - 1) {
              const nextTab = activePolicyTab + 1;
              setActivePolicyTab(nextTab);
              
              setTimeout(() => {
                const nextTabIds = collectPolicyDetailInputIds(policyDetail, policyDetailIdx, nextTab);

                const firstAvailableId = nextTabIds.find(id => !inputStates[id]?.disabled);
                if (firstAvailableId) {
                    const el = document.getElementById(`input-${firstAvailableId}`);
                    if (el) {
                        focusAndScrollToInput(el);
                    }
                } else {
                    // Fallback: find any input in the content area
                    const contentArea = document.querySelector('.animate-in');
                    if (contentArea) {
                        const anyInput = contentArea.querySelector('input:not([disabled])') as HTMLInputElement;
                        if (anyInput) {
                            focusAndScrollToInput(anyInput);
                        }
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

    // 3. INTERVIEW TAB COMPLETION LOGIC
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

    // 3. POLICY TAB COMPLETION LOGIC
    if (showPolicy) {
        const currentSection = POLICY_SECTIONS[activeTab];
        if (!currentSection) return;

        // Gather IDs for current policy tab
        const tabInputIds: string[] = [];
        currentSection.content.forEach((line, lineIdx) => {
          const regex = /\[(.*?)\]/g;
          let matchCount = 0;
          while (regex.exec(line) !== null) {
            tabInputIds.push(`policy-${activeTab}-${lineIdx}-${matchCount}`);
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
            // Check Global Completion (Policy sections only)
            const policyInputs = (Object.values(inputStates) as InputState[])
                .filter(s => s.id.startsWith('policy-'));
            const allInputsDisabled = policyInputs.every(s => s.disabled);

            if (allInputsDisabled) {
              playSound('finish');
              setShowToast({ message: "모든 학습을 완료했습니다!", type: "success" });
              isTransitioningRef.current = false;
            } else if (activeTab < POLICY_SECTIONS.length - 1) {
              const nextTab = activeTab + 1;
              setActiveTab(nextTab);
              
              setTimeout(() => {
                const nextSection = POLICY_SECTIONS[nextTab];
                const nextTabIds: string[] = [];
                nextSection.content.forEach((line, lineIdx) => {
                    const regex = /\[(.*?)\]/g;
                    let matchCount = 0;
                    while (regex.exec(line) !== null) {
                        nextTabIds.push(`policy-${nextTab}-${lineIdx}-${matchCount}`);
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

    // 4. MAIN APP TAB COMPLETION LOGIC
    const currentSection = SECTIONS[activeTab];
    if (!currentSection) return;

    // Gather IDs for current tab - 렌더링 로직과 동일한 방식으로 수집
    const tabInputIds = collectSectionInputIds(currentSection, activeTab);

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
            const nextTabIds = collectSectionInputIds(nextSection, nextTab);

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
  }, [inputStates, activeTab, activePolicyTab, isLandingPage, showIntroQuiz, showInterview, showPolicy, selectedPolicyDetail]);


  // --- Render Helpers ---

  const renderLine = (text: string, secIdx: number | string, lineIdx: number, matchOffset: number = 0, isInterview: boolean = false, isPolicy: boolean = false) => {
    // <br> 태그를 기준으로 텍스트를 분할
    const lines = text.split(/<br\s*\/?>/i);
    const allParts: React.ReactNode[] = [];
    
    let globalMatchCount = matchOffset;
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        // 이전 줄 다음에 <br /> 요소 추가
        allParts.push(<br key={`br-${lineIndex}`} />);
      }
      
      const parts: React.ReactNode[] = [];
      const regex = /\[(.*?)\]/g;
      let lastIndex = 0;
      let match;
      let matchCount = globalMatchCount;
      const matches: RegExpExecArray[] = [];
      
      // 먼저 모든 매치를 수집 (정규식의 lastIndex를 초기화하기 위해)
      const regexForCollection = /\[(.*?)\]/g;
      let tempMatch;
      while ((tempMatch = regexForCollection.exec(line)) !== null) {
        matches.push({...tempMatch});
      }
      
      // 수집한 매치들을 처리
      matches.forEach((match, matchIdx) => {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }

      // secIdx가 문자열이고 policy-detail로 시작하는 경우 그대로 사용, 아니면 일반 형식 사용
      const id = typeof secIdx === 'string' && secIdx.startsWith('policy-detail-') 
        ? `${secIdx}-${matchCount}` 
        : isPolicy 
        ? `policy-${secIdx}-${lineIdx}-${matchCount}` 
        : isInterview 
        ? `interview-${secIdx}-${lineIdx}-${matchCount}` 
        : `${secIdx}-${lineIdx}-${matchCount}`;
      let state = inputStates[id];
      
      // Fallback: state를 찾지 못한 경우, 같은 라인에서 다른 matchCount로 찾아보기
      if (!state && (isInterview || isPolicy || (typeof secIdx === 'string' && secIdx.startsWith('policy-detail-')))) {
        // 같은 라인에서 matchCount를 0부터 시작해서 찾아보기
        for (let i = 0; i < 10; i++) { // 최대 10개까지 시도
          const fallbackId = typeof secIdx === 'string' && secIdx.startsWith('policy-detail-')
            ? `${secIdx}-${i}`
            : isPolicy 
            ? `policy-${secIdx}-${lineIdx}-${i}` 
            : `interview-${secIdx}-${lineIdx}-${i}`;
          const fallbackState = inputStates[fallbackId];
          if (fallbackState) {
            // answer가 일치하는지 확인
            const currentAnswer = match[1].trim();
            if (fallbackState.answer === currentAnswer) {
              state = fallbackState;
              break;
            }
          }
        }
      }

      if (state) {
        parts.push(
          <ClozeInput
            key={`${id}-${matchIdx}`}
            state={state}
            isReviewNeeded={wrongHistory.has(state.id)}
            onUpdate={updateInput}
            onSubmit={handleValidate}
            onFocusRequest={() => {}} 
          />
        );
      } else {
          // state를 찾지 못한 경우, 빈 입력 필드 생성
          const fallbackState: InputState = {
            id,
            value: '',
            status: 'idle',
            attempts: 0,
            disabled: false,
            answer: match[1].trim(),
          };
          parts.push(
            <ClozeInput
              key={`${id}-${matchIdx}`}
              state={fallbackState}
              isReviewNeeded={false}
              onUpdate={updateInput}
              onSubmit={handleValidate}
              onFocusRequest={() => {}} 
            />
          );
      }

        lastIndex = match.index + match[0].length;
        matchCount++;
        globalMatchCount++;
      });

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      allParts.push(...parts);
    });

    return allParts;
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
                            setShowPolicyModal(true);
                        }}
                        className="w-full max-w-md group relative flex items-center justify-between px-8 py-5 bg-accent hover:bg-accent/90 text-accent-foreground text-xl font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/25 active:scale-95"
                    >
                        <span className="flex-1 text-center">Ⅲ 2026 시책</span>
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
                        <span className="flex-1 text-center">심층면접 답안틀</span>
                        <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                            <ChevronRight size={24} />
                        </div>
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-8 text-muted-foreground text-sm font-medium opacity-60">
                Daegu Metropolitan Office of Education
            </div>

            {/* Policy Modal */}
            {showPolicyModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            playSound('complete');
                            setShowPolicyModal(false);
                        }
                    }}
                >
                    <div 
                        className="bg-card border border-border rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-3xl">
                            <h2 className="text-2xl font-bold text-foreground">2026 시책</h2>
                            <button
                                onClick={() => {
                                    playSound('complete');
                                    setShowPolicyModal(false);
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                aria-label="닫기"
                            >
                                <X size={24} className="text-muted-foreground" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-3">
                            <button
                                onClick={() => {
                                    playSound('complete');
                                    setShowPolicyModal(false);
                                    setSelectedPolicyDetail('warm-heart');
                                    setActivePolicyTab(0);
                                    setIsLandingPage(false);
                                    setShowIntroQuiz(false);
                                    setShowInterview(false);
                                    setShowPolicy(false);
                                }}
                                className="w-full text-left p-6 bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border border-pink-500/20 hover:border-pink-500/40 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-pink-500/20 p-3 rounded-xl group-hover:bg-pink-500/30 transition-colors">
                                        <Heart className="text-pink-500" size={24} />
                                    </div>
                                    <span className="text-lg font-bold text-foreground flex-1">
                                        1. 따뜻한 마음을 키워 올바른 인성을 기르겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    playSound('complete');
                                    setShowPolicyModal(false);
                                    setSelectedPolicyDetail('learning-growth');
                                    setActivePolicyTab(0);
                                    setIsLandingPage(false);
                                    setShowIntroQuiz(false);
                                    setShowInterview(false);
                                    setShowPolicy(false);
                                }}
                                className="w-full text-left p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 hover:to-amber-500/20 border border-yellow-500/20 hover:border-yellow-500/40 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-yellow-500/20 p-3 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                                        <Lightbulb className="text-yellow-500" size={24} />
                                    </div>
                                    <span className="text-lg font-bold text-foreground flex-1">
                                        2. 학습역량을 높여 모두의 성장을 돕겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    playSound('complete');
                                    setShowPolicyModal(false);
                                    setSelectedPolicyDetail('wider-support');
                                    setActivePolicyTab(0);
                                    setIsLandingPage(false);
                                    setShowIntroQuiz(false);
                                    setShowInterview(false);
                                    setShowPolicy(false);
                                }}
                                className="w-full text-left p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-500/20 p-3 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                                        <Target className="text-blue-500" size={24} />
                                    </div>
                                    <span className="text-lg font-bold text-foreground flex-1">
                                        3. 더 넓고 두터운 지원으로 모두의 가능성을 열겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    playSound('complete');
                                    setShowPolicyModal(false);
                                    setSelectedPolicyDetail('school-safety');
                                    setActivePolicyTab(0);
                                    setIsLandingPage(false);
                                    setShowIntroQuiz(false);
                                    setShowInterview(false);
                                    setShowPolicy(false);
                                }}
                                className="w-full text-left p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-emerald-500/20 p-3 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                                        <Shield className="text-emerald-500" size={24} />
                                    </div>
                                    <span className="text-lg font-bold text-foreground flex-1">
                                        4. 학교의 안전을 채워 건강한 성장을 지원하겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    playSound('complete');
                                    setShowPolicyModal(false);
                                    setSelectedPolicyDetail('education-community');
                                    setActivePolicyTab(0);
                                    setIsLandingPage(false);
                                    setShowIntroQuiz(false);
                                    setShowInterview(false);
                                    setShowPolicy(true);
                                    setActiveTab(0);
                                }}
                                className="w-full text-left p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-500/20 p-3 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                                        <Users className="text-purple-500" size={24} />
                                    </div>
                                    <span className="text-lg font-bold text-foreground flex-1">
                                        5. 교육공동체가 힘을 모아 배움의 장을 넓히겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

  // --- VIEW: POLICY DETAIL (Hierarchy) ---
  if (selectedPolicyDetail) {
    const policyDetail = POLICY_DETAILS.find(p => p.id === selectedPolicyDetail);
    
    if (!policyDetail) {
      return null;
    }

    // 최상위 항목들을 탭으로 사용
    const topLevelItems = policyDetail.hierarchy;
    const selectedItem = topLevelItems[activePolicyTab];
    const policyDetailIdx = POLICY_DETAILS.findIndex(p => p.id === selectedPolicyDetail);

    // ID 형식: policy-detail-{policyIdx}-{path}-{matchCount}
    // path 형식: top-{tabIdx}-{childIdx}-{grandchildIdx}-...
    
    const renderHierarchy = (items: typeof selectedItem.children, level: number = 0, parentPath: string = `top-${activePolicyTab}`) => {
      if (!items) return null;
      
      // 레벨별 색상 정의
      const levelColors = [
        { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', accent: 'bg-primary' },
        { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', accent: 'bg-blue-500' },
        { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', accent: 'bg-emerald-500' },
        { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', accent: 'bg-amber-500' },
      ];
      const colors = levelColors[Math.min(level, levelColors.length - 1)];
      
      return (
        <div className={`${level === 0 ? 'space-y-6' : 'space-y-3'}`}>
          {items.map((item, idx) => {
            const itemPath = `${parentPath}-${idx}`;
            const hasChildren = item.children && item.children.length > 0;
            
            // Level 0: 대분류 카드
            if (level === 0) {
              return (
                <div key={idx} className="group">
                  <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all`}>
                    {/* 헤더 */}
                    <div className={`${colors.bg} px-6 py-4 flex items-center gap-4`}>
                      <div className={`${colors.accent} text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shrink-0`}>
                        {idx + 1}
                      </div>
                      <div className={`text-xl md:text-2xl font-bold ${colors.text} flex-1 leading-[2]`}>
                        {renderLine(item.title, `policy-detail-${policyDetailIdx}-${itemPath}`, 0, 0, false, true)}
                      </div>
                    </div>
                    {/* 콘텐츠 */}
                    {hasChildren && (
                      <div className="bg-card/50 p-6 border-t border-border/50">
                        {renderHierarchy(item.children, level + 1, itemPath)}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            // Level 1: 중분류 카드
            if (level === 1) {
              return (
                <div key={idx} className="group">
                  <div className={`${colors.bg} border ${colors.border} rounded-xl overflow-hidden`}>
                    {/* 헤더 */}
                    <div className="px-5 py-3 flex items-center gap-3">
                      <div className={`${colors.accent} w-2 h-6 rounded-full shrink-0`}></div>
                      <div className={`text-lg md:text-xl font-semibold ${colors.text} flex-1 leading-[2]`}>
                        {renderLine(item.title, `policy-detail-${policyDetailIdx}-${itemPath}`, 0, 0, false, true)}
                      </div>
                    </div>
                    {/* 콘텐츠 */}
                    {hasChildren && (
                      <div className="bg-card/30 px-5 pb-4 pt-2">
                        {renderHierarchy(item.children, level + 1, itemPath)}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            // Level 2: 세부 항목 (bullet point)
            if (level === 2) {
              return (
                <div key={idx} className="relative pl-6">
                  {/* 연결선 */}
                  <div className={`absolute left-2 top-0 bottom-0 w-px ${colors.border} border-l border-dashed`}></div>
                  <div className={`absolute left-[5px] top-3 w-2 h-2 rounded-full ${colors.accent}`}></div>
                  
                  <div className="py-1">
                    <div className={`text-base md:text-lg text-foreground leading-[2]`}>
                      {renderLine(item.title, `policy-detail-${policyDetailIdx}-${itemPath}`, 0, 0, false, true)}
                    </div>
                    {hasChildren && (
                      <div className="mt-2 ml-2">
                        {renderHierarchy(item.children, level + 1, itemPath)}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            // Level 3+: 하위 항목 (작은 bullet)
            return (
              <div key={idx} className="relative pl-5">
                {/* 작은 bullet */}
                <div className={`absolute left-1 top-3 w-1.5 h-1.5 rounded-full ${colors.accent}/60`}></div>
                
                <div className="py-0.5">
                  <div className="text-sm md:text-base text-muted-foreground leading-[2]">
                    {renderLine(item.title, `policy-detail-${policyDetailIdx}-${itemPath}`, 0, 0, false, true)}
                  </div>
                  {hasChildren && (
                    <div className="mt-1 ml-2">
                      {renderHierarchy(item.children, level + 1, itemPath)}
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
            onClick={() => {
              // 답안 초기화 (오답 이력은 유지)
              setInputStates(parseAndInitContent());
              setSelectedPolicyDetail(null);
              setActivePolicyTab(0);
              setIsLandingPage(true);
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            title="첫 화면으로"
          >
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">2026 시책</h1>
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
          <div className="bg-card p-8 md:p-12 rounded-3xl border border-border shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 pb-4 border-b-2 border-primary/30 whitespace-nowrap overflow-hidden text-ellipsis">
              {policyDetail.title}
            </h2>
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center">
              {topLevelItems.map((item, idx) => {
                const isCurrent = idx === activePolicyTab;
                return (
                  <button
                    key={idx}
                    onClick={() => setActivePolicyTab(idx)}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border
                      ${isCurrent 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105' 
                        : 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80'}
                    `}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {selectedItem && selectedItem.children && renderHierarchy(selectedItem.children)}
            </div>
          </div>
        </main>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-8 py-4 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-4 z-50 animate-bounce-gentle">
            <div className="bg-white/20 p-1 rounded-full"><CheckCircle size={24} /></div>
            <span className="text-xl font-bold">{showToast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW: POLICY ---
  if (showPolicy) {
    const renderPolicyContentBlocks = () => {
      const section = POLICY_SECTIONS[activeTab];
      const commonTextClass = "text-[1.9rem] leading-[3.5rem] text-card-foreground font-medium break-keep";

      return (
        <div className="space-y-6">
          {section.content.map((line, idx) => (
            <div key={idx} className="bg-card p-8 rounded-3xl border border-border shadow-md">
              <div className={commonTextClass}>
                {renderLine(line, activeTab, idx, 0, false, true)}
              </div>
            </div>
          ))}
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">2026 시책</h1>
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
          {POLICY_SECTIONS.length > 1 && (
            <div className="flex flex-wrap gap-3 mb-12 justify-center">
              {POLICY_SECTIONS.map((section, idx) => {
                const isCurrent = idx === activeTab;
                const sectionIds = Object.keys(inputStates).filter(k => k.startsWith(`policy-${idx}-`));
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
          )}

          {/* Dynamic Content Block Render */}
          <div id={`tab-content-${activeTab}`} className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {renderPolicyContentBlocks()}
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

  // --- VIEW: INTERVIEW ---
  if (showInterview) {
    const renderInterviewContentBlocks = () => {
      const section = INTERVIEW_SECTIONS[activeTab];
      const commonTextClass = "text-[1.9rem] leading-[4rem] text-card-foreground font-medium break-keep tracking-wide";

      // 구조화된 데이터로 변환 (각 라인에 원본 인덱스 포함)
      const blocks: Array<{
        type: 'intro' | 'body' | 'conclusion';
        content: Array<{ text: string; originalIdx: number }>;
      }> = [];

      let currentType: 'intro' | 'body' | 'conclusion' | null = null;
      let currentContent: Array<{ text: string; originalIdx: number }> = [];
      
      section.content.forEach((line, idx) => {
        // 섹션 헤더 감지
        if (line.trim() === '서론:') {
          if (currentType && currentContent.length > 0) {
            blocks.push({
              type: currentType,
              content: currentContent
            });
          }
          currentType = 'intro';
          currentContent = [];
        } else if (line.trim() === '본론:') {
          if (currentType && currentContent.length > 0) {
            blocks.push({
              type: currentType,
              content: currentContent
            });
          }
          currentType = 'body';
          currentContent = [];
        } else if (line.trim() === '결론:') {
          if (currentType && currentContent.length > 0) {
            blocks.push({
              type: currentType,
              content: currentContent
            });
          }
          currentType = 'conclusion';
          currentContent = [];
        } else if (currentType && line.trim()) {
          // 빈 줄이 아닌 경우에만 추가 (원본 인덱스와 함께)
          currentContent.push({ text: line, originalIdx: idx });
        }
      });

      // 마지막 블록 추가
      if (currentType && currentContent.length > 0) {
        blocks.push({
          type: currentType,
          content: currentContent
        });
      }

      // 각 라인에 대한 matchOffset 계산 (전체 섹션 기준)
      // matchOffset은 해당 라인 이전까지의 모든 빈칸 개수
      let globalMatchOffset = 0;
      const lineOffsets: Map<number, number> = new Map();
      
      section.content.forEach((line, idx) => {
        // 현재 라인 이전까지의 빈칸 개수를 저장
        lineOffsets.set(idx, globalMatchOffset);
        // 현재 라인의 빈칸 개수를 계산하여 다음 라인에 반영
        const matches = line.match(/\[(.*?)\]/g);
        if (matches) {
          globalMatchOffset += matches.length;
        }
      });

      return (
        <div className="space-y-10">
          {blocks.map((block, blockIdx) => {
            const titleMap = {
              intro: '서론',
              body: '본론',
              conclusion: '결론'
            };

            const colorMap = {
              intro: 'text-muted-foreground',
              body: 'text-primary',
              conclusion: 'text-muted-foreground'
            };

            return (
              <div key={blockIdx} className="bg-card p-10 rounded-2xl shadow-sm">
                <div className="mb-8 pb-4 border-b-2 border-primary/30">
                  <h2 className={`text-3xl md:text-4xl font-bold ${colorMap[block.type]} tracking-tight`}>
                    {titleMap[block.type]}
                  </h2>
                </div>
                <div className="space-y-6">
                  {block.content.map((lineData, lineIdx) => {
                    const actualLineIdx = lineData.originalIdx;
                    const matchOffset = lineOffsets.get(actualLineIdx) ?? 0;
                    
                    return (
                      <div key={lineIdx} className={`${commonTextClass} py-2`}>
                        {renderLine(lineData.text, activeTab, actualLineIdx, matchOffset, true)}
                      </div>
                    );
                  })}
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">심층면접 답안틀</h1>
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
