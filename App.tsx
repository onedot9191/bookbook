
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BookOpen, CheckCircle, ChevronRight, AlertTriangle, Lightbulb, Target, Shield, Users, Heart, Eye, RotateCcw, Home, List, X, Volume2, VolumeX } from 'lucide-react';
import { SECTIONS, INTRO_CONTENT, INTERVIEW_SECTIONS, ENGLISH_DEMO_SECTIONS, POLICY_SECTIONS, POLICY_DETAILS } from './constants';
import { InputState, STORAGE_KEY } from './types';
import { ClozeInput } from './components/ClozeInput';
import { playSound } from './sounds';
import { speakText, stopSpeaking, loadVoices } from './utils/tts';

// Global declaration for confetti
declare var confetti: any;

// 캐릭터 경주로 컴포넌트
interface RaceTrackProps {
  progress: number; // 0-100
  className?: string;
}

const RaceTrack: React.FC<RaceTrackProps> = ({ progress, className = '' }) => {
  const isComplete = progress >= 100;
  
  // 캐릭터 위치 계산 (0%일 때도 짤리지 않도록 최소값 보장)
  const characterPosition = Math.max(8, Math.min(progress, 92));
  
  // 각 지점을 통과했는지 확인
  const checkpoints = [25, 50, 75];
  const isCheckpointPassed = (checkpoint: number) => progress >= checkpoint;
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 경주로 (측면 시점) */}
      <div className="relative w-64 sm:w-96 h-10">
        {/* 트랙 바닥 (측면에서 본 도로) */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 rounded-sm border-t border-slate-400/40 border-b border-slate-800/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.3)]">
          {/* 트랙 중앙선 (측면 시점) */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300/50 to-transparent -translate-y-1/2" />
          
          {/* 구간 표시 (트랙 내부) */}
          {checkpoints.map((marker) => {
            const passed = isCheckpointPassed(marker);
            return (
              <div 
                key={marker}
                className={`absolute top-1/2 -translate-y-1/2 w-[1px] h-full transition-all duration-500 ${
                  passed ? 'bg-blue-400/60' : 'bg-slate-400/40'
                }`}
                style={{ left: `${marker}%` }}
              />
            );
          })}
        
        {/* 구간 마커 (트랙 위) */}
        {checkpoints.map((marker) => {
          const passed = isCheckpointPassed(marker);
          return (
            <div 
              key={`marker-${marker}`}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
              style={{ left: `${marker}%` }}
            >
              <div 
                className={`rounded-full border transition-all duration-500 ${
                  passed 
                    ? 'w-2.5 h-2.5 bg-blue-400 border-blue-300 shadow-[0_0_8px_rgba(96,165,250,0.6)]' 
                    : 'w-1.5 h-1.5 bg-slate-400/60 border-slate-300/40'
                }`}
              />
            </div>
          );
        })}
          
          {/* 진행률 바 */}
          <div 
            className={`absolute bottom-0 left-0 h-full transition-all duration-700 ease-out ${
              isComplete 
                ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 shadow-[0_0_20px_rgba(251,191,36,0.5)]' 
                : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
            }`}
            style={{ width: `${Math.min(progress, 100)}%`, clipPath: 'inset(0 0 0 0 round 2px)' }}
          />
          
          {/* 진행률 바 상단 하이라이트 */}
          <div 
            className={`absolute bottom-0 left-0 h-1/2 w-full transition-all duration-700 ease-out opacity-40 ${
              isComplete ? 'bg-gradient-to-r from-transparent via-white/60 to-transparent' : 'bg-gradient-to-r from-transparent via-white/50 to-transparent'
            }`}
            style={{ width: `${Math.min(progress, 100)}%`, clipPath: 'inset(0 0 50% 0 round 2px 2px 0 0)' }}
          />
        </div>
        
        {/* 트랙 그림자 (깊이감 표현) */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black/20 to-transparent" />
        
        {/* 캐릭터 (트랙 위에 서 있는 사람) */}
        <div 
          className="absolute bottom-3 transition-all duration-700 ease-out z-20"
          style={{ left: `calc(${characterPosition}% - 14px)` }}
        >
          <span 
            className={`text-2xl inline-block drop-shadow-lg ${isComplete ? 'animate-bounce' : ''}`} 
            style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}
            role="img" 
            aria-label="runner"
          >
            {isComplete ? '🏆' : '🏃'}
          </span>
        </div>
        
        {/* 결승선 (트랙 위의 깃발) */}
        <div className="absolute bottom-3 right-2 z-10 drop-shadow-lg">
          <span className="text-2xl inline-block" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }} role="img" aria-label="finish">🚩</span>
        </div>
      </div>
      
      {/* 퍼센트 표시 */}
      <span className={`text-sm font-bold min-w-[3rem] tabular-nums transition-colors duration-300 ${
        isComplete ? 'text-amber-400' : 'text-slate-300'
      }`}>
        {Math.round(progress)}%
      </span>
    </div>
  );
};

const App: React.FC = () => {
  const [isLandingPage, setIsLandingPage] = useState(true);
  const [showIntroQuiz, setShowIntroQuiz] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [showEnglishDemo, setShowEnglishDemo] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicyDetail, setSelectedPolicyDetail] = useState<string | null>(null);
  const [activePolicyTab, setActivePolicyTab] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [inputStates, setInputStates] = useState<Record<string, InputState>>({});
  const [wrongHistory, setWrongHistory] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [activeSkillTab, setActiveSkillTab] = useState<string>('listening');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  
  // Ref to track if we are in a transition period to prevent double triggers
  const isTransitioningRef = useRef(false);
  // Ref to track which tabs have already triggered the completion logic to prevent loops
  const completedTabsRef = useRef<Set<number>>(new Set());

  // --- 진행률 계산 ---
  const calculateProgress = useMemo(() => {
    const allInputs = Object.values(inputStates) as InputState[];
    if (allInputs.length === 0) return 0;
    
    // 현재 활성화된 모드에 따라 해당 입력들만 필터링
    let relevantInputs: InputState[] = [];
    
    if (showIntroQuiz) {
      relevantInputs = allInputs.filter(s => s.id.startsWith('intro-'));
    } else if (showInterview) {
      // interview 탭별로 필터링 (interview-{activeTab}- 패턴)
      relevantInputs = allInputs.filter(s => s.id.startsWith(`interview-${activeTab}-`));
    } else if (showEnglishDemo) {
      // english-demo 탭별로 필터링 (english-demo-{activeTab}- 패턴)
      relevantInputs = allInputs.filter(s => s.id.startsWith(`english-demo-${activeTab}-`));
    } else if (selectedPolicyDetail) {
      // policy-detail 탭별로 필터링 (policy-detail-{activePolicyTab}- 패턴)
      relevantInputs = allInputs.filter(s => s.id.startsWith(`policy-detail-${activePolicyTab}-`));
    } else if (showPolicy) {
      // policy 탭별로 필터링 (policy-{activePolicyTab}- 패턴)
      relevantInputs = allInputs.filter(s => s.id.startsWith(`policy-${activePolicyTab}-`));
    } else if (!isLandingPage) {
      // 메인 섹션 - 탭별로 필터링 ({activeTab}- 패턴, 숫자로 시작)
      relevantInputs = allInputs.filter(s => {
        // 숫자로 시작하는 ID만 (메인 섹션)
        if (!/^\d+-/.test(s.id)) return false;
        // 현재 activeTab과 일치하는 섹션만
        return s.id.startsWith(`${activeTab}-`);
      });
    }
    
    if (relevantInputs.length === 0) return 0;
    
    const completedCount = relevantInputs.filter(s => s.disabled || s.status === 'correct' || s.status === 'wrong-2').length;
    return (completedCount / relevantInputs.length) * 100;
  }, [inputStates, showIntroQuiz, showInterview, showEnglishDemo, showPolicy, selectedPolicyDetail, isLandingPage, activeTab, activePolicyTab]);


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

  // TTS 음성 목록 로드
  useEffect(() => {
    loadVoices();
  }, []);

  // TTS 재생 상태 모니터링
  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      if (!window.speechSynthesis.speaking && isSpeaking) {
        setIsSpeaking(false);
        setSpeakingText(null);
      }
    }, 100);

    return () => clearInterval(checkSpeaking);
  }, [isSpeaking]);

  // '1. 비전'과 '2. 학습자상' 탭에서 스크롤 고정
  useEffect(() => {
    // 메인 섹션이고 activeTab이 0 또는 1일 때 (비전, 학습자상)
    const shouldFixScroll = !isLandingPage && 
                            !showIntroQuiz && 
                            !showInterview && 
                            !showEnglishDemo && 
                            !showPolicy && 
                            !selectedPolicyDetail && 
                            (activeTab === 0 || activeTab === 1);
    
    if (shouldFixScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLandingPage, showIntroQuiz, showInterview, showEnglishDemo, showPolicy, selectedPolicyDetail, activeTab]);

  // 텍스트 읽기 함수
  const handleSpeak = (text: string) => {
    if (isSpeaking && speakingText === text) {
      stopSpeaking();
      setIsSpeaking(false);
      setSpeakingText(null);
    } else {
      stopSpeaking();
      // 빈칸 제거하고 텍스트 정리
      const cleanText = text.replace(/\[(.*?)\]/g, '$1').replace(/\(.*?\)/g, '').trim();
      if (cleanText) {
        speakText(cleanText, 'en-US', 0.9, 1.0);
        setIsSpeaking(true);
        setSpeakingText(text);
      }
    }
  };

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

  // Auto-focus first input when english demo starts
  useEffect(() => {
    if (showEnglishDemo) {
      // Use requestAnimationFrame for immediate focus after DOM renders
      const focusTimer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Focus first enabled input in the first english demo tab (DOM 순서 기준)
          if (!focusFirstInputInContainer('tab-content-0')) {
            focusFirstInputGlobally();
          }
        });
      });
      
      return () => cancelAnimationFrame(focusTimer);
    }
  }, [showEnglishDemo]);

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
  }, [activeTab, isLandingPage, showIntroQuiz, showInterview, showEnglishDemo, showPolicy]);

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

    // Parse English Demo Sections
    ENGLISH_DEMO_SECTIONS.forEach((section, secIdx) => {
      // Parse normal content if exists
      if (section.content) {
        section.content.forEach((line, lineIdx) => {
          const regex = /\[(.*?)\]/g;
          let match;
          let matchCount = 0;
          while ((match = regex.exec(line)) !== null) {
            const answer = match[1];
            const id = `english-demo-${secIdx}-${lineIdx}-${matchCount}`;
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
      }
      
      // Parse skill categories if exists (Activity 2, Activity 3)
      if (section.skillCategories) {
        section.skillCategories.forEach((category) => {
          category.activities.forEach((activity) => {
            activity.content.forEach((line, lineIdx) => {
              const regex = /\[(.*?)\]/g;
              let match;
              let matchCount = 0;
              while ((match = regex.exec(line)) !== null) {
                const answer = match[1];
                // ID 형식: english-demo-{탭인덱스}-{스킬ID}-{활동ID}-{라인인덱스}-{매치카운트}
                const id = `english-demo-${secIdx}-${category.id}-${activity.id}-${lineIdx}-${matchCount}`;
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
        });
      }
      
      // Parse closingContent if exists (도입의 학습문제 확인, Activity 3의 활동 마무리)
      if (section.closingContent) {
        section.closingContent.forEach((line, lineIdx) => {
          const regex = /\[(.*?)\]/g;
          let match;
          let matchCount = 0;
          while ((match = regex.exec(line)) !== null) {
            const answer = match[1];
            // ID 형식: english-demo-{탭인덱스}-closing-{라인인덱스}-{매치카운트}
            const id = `english-demo-${secIdx}-closing-${lineIdx}-${matchCount}`;
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
      }
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
      const parseHierarchyItem = (item: { title: string; children?: any[]; table?: { headers: string[]; rows: string[][] } }, path: string) => {
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
        
        // Parse table cells if exists
        if (item.table) {
          item.table.rows.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
              const cellRegex = /\[(.*?)\]/g;
              let cellMatch;
              let cellMatchCount = 0;
              while ((cellMatch = cellRegex.exec(cell)) !== null) {
                const answer = cellMatch[1];
                const id = `policy-detail-${policyIdx}-${path}-table-${rIdx}-${cIdx}-${cellMatchCount}`;
                initialStates[id] = {
                  id,
                  value: '',
                  status: 'idle',
                  attempts: 0,
                  disabled: false,
                  answer: answer.trim(),
                };
                cellMatchCount++;
              }
            });
          });
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
    setShowEnglishDemo(false);
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
  const focusAndScrollToInput = (element: HTMLElement, skipScroll: boolean = false) => {
    if (!element) return;
    
    // Focus first
    element.focus();
    
    // Skip scroll if requested (e.g., for intro quiz)
    if (skipScroll) return;
    
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
    } else if (showEnglishDemo) {
        // Find all inputs in current english demo tab in sequential order
        const currentSection = ENGLISH_DEMO_SECTIONS[activeTab];
        if (currentSection) {
            // 현재 빈칸이 서브탭 내부인지 확인
            const currentIdMatch = currentId.match(/^english-demo-\d+-(.+?)-(.+?)-(\d+)-(\d+)$/);
            const isInSubTab = currentIdMatch && !currentId.includes('-closing-');
            
            if (isInSubTab) {
                // 서브탭 내부인 경우: 현재 서브탭의 모든 빈칸 수집
                const currentSkillId = currentIdMatch[1];
                
                // 현재 서브탭의 모든 빈칸 찾기
                if (currentSection.skillCategories) {
                    const currentCategory = currentSection.skillCategories.find(cat => cat.id === currentSkillId);
                    if (currentCategory) {
                        currentCategory.activities.forEach((activity) => {
                            activity.content.forEach((line, lineIdx) => {
                                const regex = /\[(.*?)\]/g;
                                let matchCount = 0;
                                while (regex.exec(line) !== null) {
                                    currentInputs.push(`english-demo-${activeTab}-${currentSkillId}-${activity.id}-${lineIdx}-${matchCount}`);
                                    matchCount++;
                                }
                            });
                        });
                    }
                }
                
                // 현재 서브탭 내에서 다음 빈칸 찾기
                const currentIndex = currentInputs.indexOf(currentId);
                if (currentIndex !== -1) {
                    for (let i = currentIndex + 1; i < currentInputs.length; i++) {
                        const candidateId = currentInputs[i];
                        if (!inputStates[candidateId]?.disabled) {
                            const el = document.getElementById(`input-${candidateId}`);
                            if (el) {
                                focusAndScrollToInput(el);
                                return;
                            }
                        }
                    }
                }
                
                // 현재 서브탭의 모든 빈칸이 비활성화된 경우, 다음 서브탭으로 이동
                if (currentSection.skillCategories) {
                    const currentCategoryIndex = currentSection.skillCategories.findIndex(cat => cat.id === currentSkillId);
                    if (currentCategoryIndex !== -1 && currentCategoryIndex < currentSection.skillCategories.length - 1) {
                        // 다음 서브탭으로 이동
                        const nextCategory = currentSection.skillCategories[currentCategoryIndex + 1];
                        setActiveSkillTab(nextCategory.id);
                        
                        // 다음 서브탭의 첫 번째 빈칸 찾기
                        if (nextCategory.activities.length > 0) {
                            const firstActivity = nextCategory.activities[0];
                            if (firstActivity.content.length > 0) {
                                const firstLine = firstActivity.content[0];
                                const regex = /\[(.*?)\]/g;
                                const match = regex.exec(firstLine);
                                if (match) {
                                    const firstInputId = `english-demo-${activeTab}-${nextCategory.id}-${firstActivity.id}-0-0`;
                                    setTimeout(() => {
                                        const el = document.getElementById(`input-${firstInputId}`);
                                        if (el) {
                                            focusAndScrollToInput(el);
                                        }
                                    }, 100);
                                    return;
                                }
                            }
                        }
                    } else {
                        // 마지막 서브탭인 경우, 다음 콘텐츠(closingContent)로 이동
                        if (currentSection.closingContent) {
                            let foundNext = false;
                            currentSection.closingContent.forEach((line, lineIdx) => {
                                if (foundNext) return;
                                const regex = /\[(.*?)\]/g;
                                let matchCount = 0;
                                while (regex.exec(line) !== null) {
                                    const closingId = `english-demo-${activeTab}-closing-${lineIdx}-${matchCount}`;
                                    if (!inputStates[closingId]?.disabled) {
                                        foundNext = true;
                                        setTimeout(() => {
                                            const el = document.getElementById(`input-${closingId}`);
                                            if (el) {
                                                focusAndScrollToInput(el);
                                            }
                                        }, 100);
                                        return;
                                    }
                                    matchCount++;
                                }
                            });
                        }
                    }
                }
                return; // 서브탭 처리 완료
            }
            
            // 서브탭이 아닌 경우: 전체 순서대로 수집
            // Parse normal content if exists
            if (currentSection.content) {
                currentSection.content.forEach((line, lineIdx) => {
                    const regex = /\[(.*?)\]/g;
                    let matchCount = 0;
                    while (regex.exec(line) !== null) {
                        currentInputs.push(`english-demo-${activeTab}-${lineIdx}-${matchCount}`);
                        matchCount++;
                    }
                });
            }
            // Parse skill categories if exists (실제 렌더링 시 사용하는 ID 형식과 일치)
            if (currentSection.skillCategories) {
                currentSection.skillCategories.forEach((category) => {
                    category.activities.forEach((activity) => {
                        activity.content.forEach((line, lineIdx) => {
                            const regex = /\[(.*?)\]/g;
                            let matchCount = 0;
                            while (regex.exec(line) !== null) {
                                // 실제 렌더링 시 사용하는 ID 형식: english-demo-{탭}-{스킬ID}-{활동ID}-{라인}-{매치}
                                currentInputs.push(`english-demo-${activeTab}-${category.id}-${activity.id}-${lineIdx}-${matchCount}`);
                                matchCount++;
                            }
                        });
                    });
                });
            }
            // Parse closingContent if exists
            if (currentSection.closingContent) {
                currentSection.closingContent.forEach((line, lineIdx) => {
                    const regex = /\[(.*?)\]/g;
                    let matchCount = 0;
                    while (regex.exec(line) !== null) {
                        currentInputs.push(`english-demo-${activeTab}-closing-${lineIdx}-${matchCount}`);
                        matchCount++;
                    }
                });
            }
        }
    } else if (selectedPolicyDetail) {
        // Find all inputs in current policy detail tab in sequential order
        const policyDetail = POLICY_DETAILS.find(p => p.id === selectedPolicyDetail);
        if (policyDetail) {
            const policyDetailIdx = POLICY_DETAILS.findIndex(p => p.id === selectedPolicyDetail);
            const selectedItem = policyDetail.hierarchy[activePolicyTab];
            
            // parseHierarchyItem과 동일한 경로 계산
            const collectInputs = (item: { title: string; children?: any[]; table?: { headers: string[]; rows: string[][] } }, path: string) => {
                const matches = item.title.match(/\[(.*?)\]/g);
                if (matches) {
                    matches.forEach((_, matchIdx) => {
                        currentInputs.push(`policy-detail-${policyDetailIdx}-${path}-${matchIdx}`);
                    });
                }
                
                // Collect table cell input IDs
                if (item.table) {
                    item.table.rows.forEach((row, rIdx) => {
                        row.forEach((cell, cIdx) => {
                            const cellMatches = cell.match(/\[(.*?)\]/g);
                            if (cellMatches) {
                                cellMatches.forEach((_, matchIdx) => {
                                    currentInputs.push(`policy-detail-${policyDetailIdx}-${path}-table-${rIdx}-${cIdx}-${matchIdx}`);
                                });
                            }
                        });
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
          focusAndScrollToInput(el, showIntroQuiz); // Skip scroll for intro quiz
        }
      } else if (showEnglishDemo) {
        // 현재 섹션의 모든 빈칸이 비활성화된 경우
        const currentSection = ENGLISH_DEMO_SECTIONS[activeTab];
        if (currentSection) {
          // 상단 콘텐츠의 빈칸인 경우 (형식: english-demo-{탭}-{라인}-{매치})
          const isTopContent = currentId.match(/^english-demo-\d+-\d+-\d+$/);
          if (isTopContent && currentSection.skillCategories && currentSection.skillCategories.length > 0) {
            const firstCategory = currentSection.skillCategories[0];
            setActiveSkillTab(firstCategory.id);
            
            // 첫 번째 서브탭의 첫 번째 빈칸 찾기
            if (firstCategory.activities.length > 0) {
              const firstActivity = firstCategory.activities[0];
              if (firstActivity.content.length > 0) {
                const firstLine = firstActivity.content[0];
                const regex = /\[(.*?)\]/g;
                const match = regex.exec(firstLine);
                if (match) {
                  const firstInputId = `english-demo-${activeTab}-${firstCategory.id}-${firstActivity.id}-0-0`;
                  setTimeout(() => {
                    const el = document.getElementById(`input-${firstInputId}`);
                    if (el) {
                      focusAndScrollToInput(el);
                    }
                  }, 100);
                }
              }
            }
          }
        }
      }
    }
  };

  const handleValidate = (id: string) => {
    const currentState = inputStates[id];
    const inputVal = currentState.value.trim();
    const correctVal = currentState.answer;

    // 정규화 함수: 띄어쓰기, · 기호, 반점(쉼표), 작은따옴표 제거 후 소문자로 변환
    const normalize = (str: string) => str.replace(/\s+/g, '').replace(/·/g, '').replace(/,/g, '').replace(/'/g, '').toLowerCase();
    
    const normalizedInput = normalize(inputVal);
    const normalizedAnswer = normalize(correctVal);

    // 괄호와 그 안의 내용을 제거한 버전도 생성 (허용답안 인정)
    const answerWithoutParentheses = correctVal.replace(/\([^)]*\)/g, '').trim();
    const normalizedAnswerWithoutParentheses = normalize(answerWithoutParentheses);

    // Logic A-1: Correct (띄어쓰기, · 기호, 반점 무시 비교 또는 괄호 제거 버전 비교, 대소문자 구분 안 함)
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
        if (showEnglishDemo) return key.startsWith('english-demo-');
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
        : showEnglishDemo
        ? allKeys.filter(k => k.startsWith('english-demo-'))
        : selectedPolicyDetail
        ? allKeys.filter(k => k.startsWith('policy-detail-'))
        : showPolicy
        ? allKeys.filter(k => k.startsWith('policy-') && !k.startsWith('policy-detail-'))
        : allKeys.filter(k => !k.startsWith('intro-') && !k.startsWith('interview-') && !k.startsWith('english-demo-') && !k.startsWith('policy-')); // Reveal all main content if in main view

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
    if (!showIntroQuiz && !showInterview && !showEnglishDemo && !showPolicy && !selectedPolicyDetail) {
         SECTIONS.forEach((_, idx) => completedTabsRef.current.add(idx));
    } else if (showInterview) {
         INTERVIEW_SECTIONS.forEach((_, idx) => completedTabsRef.current.add(idx));
    } else if (showEnglishDemo) {
         ENGLISH_DEMO_SECTIONS.forEach((_, idx) => completedTabsRef.current.add(idx));
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

  const traverse = (item: { title: string; children?: any[]; table?: { headers: string[]; rows: string[][] } }, path: string) => {
    const matches = item.title.match(/\[(.*?)\]/g);
    if (matches) {
      matches.forEach((_, matchIdx) => {
        ids.push(`policy-detail-${policyDetailIdx}-${path}-${matchIdx}`);
      });
    }

    // Collect table cell input IDs
    if (item.table) {
      item.table.rows.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
          const cellMatches = cell.match(/\[(.*?)\]/g);
          if (cellMatches) {
            cellMatches.forEach((_, matchIdx) => {
              ids.push(`policy-detail-${policyDetailIdx}-${path}-table-${rIdx}-${cIdx}-${matchIdx}`);
            });
          }
        });
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

    // 3-1. ENGLISH DEMO TAB COMPLETION LOGIC
    if (showEnglishDemo) {
        const currentSection = ENGLISH_DEMO_SECTIONS[activeTab];
        if (!currentSection) return;

        // Gather IDs for current english demo tab
        const tabInputIds: string[] = [];
        
        // Parse normal content if exists
        if (currentSection.content) {
          currentSection.content.forEach((line, lineIdx) => {
            const regex = /\[(.*?)\]/g;
            let matchCount = 0;
            while (regex.exec(line) !== null) {
              tabInputIds.push(`english-demo-${activeTab}-${lineIdx}-${matchCount}`);
              matchCount++;
            }
          });
        }
        
        // Parse skill categories if exists
        if (currentSection.skillCategories) {
          currentSection.skillCategories.forEach((category, catIdx) => {
            category.activities.forEach((activity, actIdx) => {
              activity.content.forEach((line, lineIdx) => {
                const regex = /\[(.*?)\]/g;
                let matchCount = 0;
                while (regex.exec(line) !== null) {
                  tabInputIds.push(`english-demo-${activeTab}-skill-${catIdx}-${actIdx}-${lineIdx}-${matchCount}`);
                  matchCount++;
                }
              });
            });
          });
        }

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
            // Check Global Completion (English Demo sections only)
            const englishDemoInputs = (Object.values(inputStates) as InputState[])
                .filter(s => s.id.startsWith('english-demo-'));
            const allInputsDisabled = englishDemoInputs.every(s => s.disabled);

            if (allInputsDisabled) {
              playSound('finish');
              setShowToast({ message: "모든 학습을 완료했습니다!", type: "success" });
              isTransitioningRef.current = false;
            } else if (activeTab < ENGLISH_DEMO_SECTIONS.length - 1) {
              const nextTab = activeTab + 1;
              setActiveTab(nextTab);
              
              setTimeout(() => {
                const nextSection = ENGLISH_DEMO_SECTIONS[nextTab];
                const nextTabIds: string[] = [];
                nextSection.content.forEach((line, lineIdx) => {
                    const regex = /\[(.*?)\]/g;
                    let matchCount = 0;
                    while (regex.exec(line) !== null) {
                        nextTabIds.push(`english-demo-${nextTab}-${lineIdx}-${matchCount}`);
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
  }, [inputStates, activeTab, activePolicyTab, isLandingPage, showIntroQuiz, showInterview, showEnglishDemo, showPolicy, selectedPolicyDetail]);


  // --- Render Helpers ---

  const renderLine = (text: string, secIdx: number | string, lineIdx: number, matchOffset: number = 0, isInterview: boolean = false, isEnglishDemo: boolean = false, isPolicy: boolean = false, isCompact: boolean = false) => {
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
        : isEnglishDemo
        ? `english-demo-${secIdx}-${lineIdx}-${matchCount}` 
        : `${secIdx}-${lineIdx}-${matchCount}`;
      let state = inputStates[id];
      
      // Fallback: state를 찾지 못한 경우, 같은 라인에서 다른 matchCount로 찾아보기
      if (!state && (isInterview || isEnglishDemo || isPolicy || (typeof secIdx === 'string' && secIdx.startsWith('policy-detail-')))) {
        // 같은 라인에서 matchCount를 0부터 시작해서 찾아보기
        for (let i = 0; i < 10; i++) { // 최대 10개까지 시도
          const fallbackId = typeof secIdx === 'string' && secIdx.startsWith('policy-detail-')
            ? `${secIdx}-${i}`
            : isPolicy 
            ? `policy-${secIdx}-${lineIdx}-${i}` 
            : isInterview
            ? `interview-${secIdx}-${lineIdx}-${i}`
            : `english-demo-${secIdx}-${lineIdx}-${i}`;
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
            isEnglishMode={isEnglishDemo}
            isCompact={isCompact}
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
              isEnglishMode={isEnglishDemo}
              isCompact={isCompact}
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
    const commonTextClass = "text-[1.8rem] leading-[3.2rem] text-card-foreground font-medium break-keep";

    // Layout for 'strategies': Title + Content pairs
    if (section.id === 'strategies') {
        const blocks = [];
        const icons = [
            <Heart className="text-rose-500" size={28} />, 
            <Lightbulb className="text-amber-500" size={28} />, 
            <Target className="text-sky-500" size={28} />, 
            <Shield className="text-emerald-500" size={28} />, 
            <Users className="text-violet-500" size={28} />
        ];
        
        for (let i = 0; i < section.content.length; i += 2) {
            const icon = icons[i/2] || <CheckCircle className="text-primary" size={28} />;
            blocks.push(
                <div key={i} className="bg-card/80 glass p-8 rounded-2xl border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:translate-y-[-2px]">
                    <div className="flex items-start gap-4 mb-6 pb-5 border-b border-border/50">
                        <div className="mt-2 shrink-0 p-2 bg-primary/10 rounded-xl">{icon}</div>
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
        return <div className="space-y-6">{blocks}</div>;
    }

    // Layout for 'vision'
    if (section.id === 'vision') {
        return (
            <div className="bg-card/80 glass p-10 rounded-2xl border border-border/50 shadow-xl text-center">
                <div className={`${commonTextClass} text-primary mb-6 font-bold text-[2rem]`}>
                    {renderLine(section.content[0], activeTab, 0)}
                </div>
                <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto my-8 rounded-full" />
                <div className="text-left bg-muted/40 p-8 rounded-xl border border-border/30">
                    <span className="inline-block px-4 py-1.5 rounded-lg bg-primary/10 text-sm text-primary mb-4 font-bold">의미</span>
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
            <div className="flex flex-col gap-5">
                 <div className="bg-gradient-to-br from-primary/15 via-primary/10 to-card/80 glass p-10 rounded-2xl border border-primary/25 text-center shadow-lg">
                    <div className="text-primary text-xs font-bold mb-4 uppercase tracking-[0.2em]">학습자상</div>
                    <div className={`${commonTextClass} text-foreground font-bold`}>
                        {renderLine(section.content[0], activeTab, 0)}
                    </div>
                </div>
                <div className="grid gap-3">
                    {section.content.slice(1).map((line, idx) => (
                        <div key={idx+1} className="bg-card/80 glass p-7 rounded-xl border border-border/50 flex items-start gap-5 shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                            <div className="mt-4 w-2.5 h-2.5 rounded-full bg-primary shrink-0 ring-4 ring-primary/15" />
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
            <div className="space-y-6">
                {parts.map((part, partIdx) => {
                    // 정의 부분의 [ ] 패턴 개수 계산
                    const defMatches = (part.definition.match(/\[(.*?)\]/g) || []).length;
                    
                    return (
                        <div key={partIdx} className="bg-gradient-to-br from-card/90 to-card/70 glass p-9 rounded-2xl border border-primary/20 shadow-lg hover:shadow-xl hover:border-primary/35 transition-all duration-300">
                            {/* 파트 헤더 */}
                            <div className="mb-6 pb-4 border-b-2 border-primary/25">
                                <h3 className={`${commonTextClass} text-primary font-bold text-[2.1rem]`}>
                                    {renderLine(part.title, activeTab, part.titleLineIdx, 0)}
                                </h3>
                            </div>
                            
                            {/* 정의 섹션 */}
                            <div className="mb-6 pb-6 border-b border-border/40">
                                <div className="inline-block px-4 py-2 mb-4 rounded-xl bg-primary/10 border border-primary/20">
                                    <span className="text-primary font-bold text-base">정의</span>
                                </div>
                                <div className={commonTextClass}>
                                    {renderLine(part.definition, activeTab, part.defLineIdx, 0)}
                                </div>
                            </div>
                            
                            {/* 의의 섹션 */}
                            <div>
                                <div className="inline-block px-4 py-2 mb-4 rounded-xl bg-primary/10 border border-primary/20">
                                    <span className="text-primary font-bold text-base">의의</span>
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
            <div className="space-y-5">
                {section.content.map((line, idx) => {
                    // "A: B" 형식을 파싱하여 키워드와 설명 분리
                    const colonIndex = line.indexOf(':');
                    if (colonIndex === -1) {
                        // 콜론이 없으면 기존 방식으로 렌더링
                        return (
                            <div key={idx} className="bg-card/80 glass p-7 rounded-2xl border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
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
                        <div key={idx} className="bg-card/80 glass p-7 rounded-2xl border border-border/50 shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                            <div className="mb-4 pb-4 border-b border-border/40">
                                <div className={`${commonTextClass} text-primary font-bold text-[1.95rem]`}>
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
        <div className="space-y-5">
            {section.content.map((line, idx) => (
                 <div key={idx} className="bg-card/80 glass p-7 rounded-2xl border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden noise-overlay">
            {/* Background decorative elements - Enhanced */}
            <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
                {/* Primary gradient orb */}
                <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-[100px] animate-soft-pulse" />
                {/* Secondary gradient orb */}
                <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-gradient-to-tl from-secondary/25 via-accent/15 to-transparent rounded-full blur-[100px] animate-soft-pulse" style={{animationDelay: '1s'}} />
                {/* Accent glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[40%] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-[80px]" />
            </div>

            <div className="max-w-2xl w-full bg-card/70 glass border border-border/40 p-12 rounded-[2rem] shadow-2xl text-center animate-fade-in-up">
                {/* Logo with enhanced styling */}
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[1.5rem] bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground mb-10 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10" />
                    <BookOpen size={44} strokeWidth={2} className="relative z-10" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-5 tracking-tight leading-tight font-display">
                    2026 대구 미래역량 교육
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed font-medium max-w-md mx-auto">
                    미래를 배우고 함께 성장하는<br/>
                    대구교육의 핵심 가치를 학습해보세요.
                </p>
                
                <div className="flex flex-col gap-3 items-center w-full">
                    <button 
                        onClick={() => {
                            playSound('complete');
                            setIsLandingPage(false);
                            setShowIntroQuiz(true);
                        }}
                        className="w-full max-w-md group relative flex items-center justify-between px-7 py-4 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 active:translate-y-0 active:shadow-lg press-effect"
                    >
                        <span className="flex-1 text-center tracking-wide">Ⅱ 대구교육의 방향</span>
                        <div className="bg-white/20 rounded-lg p-1.5 group-hover:translate-x-1 group-hover:bg-white/30 transition-all duration-300">
                            <ChevronRight size={22} />
                        </div>
                    </button>
                    <button 
                        onClick={() => {
                            playSound('complete');
                            setShowPolicyModal(true);
                        }}
                        className="w-full max-w-md group relative flex items-center justify-between px-7 py-4 bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-bold rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-accent/30 active:translate-y-0 active:shadow-lg press-effect"
                    >
                        <span className="flex-1 text-center tracking-wide">Ⅲ 2026 시책</span>
                        <div className="bg-foreground/10 rounded-lg p-1.5 group-hover:translate-x-1 group-hover:bg-foreground/20 transition-all duration-300">
                            <ChevronRight size={22} />
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
                        className="w-full max-w-md group relative flex items-center justify-between px-7 py-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg font-bold rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-secondary/30 active:translate-y-0 active:shadow-lg press-effect"
                    >
                        <span className="flex-1 text-center tracking-wide">심층면접 답안틀</span>
                        <div className="bg-foreground/10 rounded-lg p-1.5 group-hover:translate-x-1 group-hover:bg-foreground/20 transition-all duration-300">
                            <ChevronRight size={22} />
                        </div>
                    </button>
                    <button 
                        onClick={() => {
                            playSound('complete');
                            setIsLandingPage(false);
                            setShowIntroQuiz(false);
                            setShowInterview(false);
                            setShowEnglishDemo(true);
                            setActiveTab(0);
                        }}
                        className="w-full max-w-md group relative flex items-center justify-between px-7 py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-violet-500/30 active:translate-y-0 active:shadow-lg press-effect"
                    >
                        <span className="flex-1 text-center tracking-wide">영어 답안틀</span>
                        <div className="bg-white/20 rounded-lg p-1.5 group-hover:translate-x-1 group-hover:bg-white/30 transition-all duration-300">
                            <ChevronRight size={22} />
                        </div>
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-8 text-muted-foreground text-sm font-medium opacity-50 tracking-wide">
                Daegu Metropolitan Office of Education
            </div>

            {/* Policy Modal - Enhanced */}
            {showPolicyModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 glass animate-in fade-in duration-300"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            playSound('complete');
                            setShowPolicyModal(false);
                        }
                    }}
                >
                    <div 
                        className="bg-card/95 glass border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-card/95 glass border-b border-border/50 px-6 py-5 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">2026 시책</h2>
                            <button
                                onClick={() => {
                                    playSound('complete');
                                    setShowPolicyModal(false);
                                }}
                                className="p-2.5 hover:bg-muted rounded-xl transition-all duration-200 hover:rotate-90"
                                aria-label="닫기"
                            >
                                <X size={22} className="text-muted-foreground" />
                            </button>
                        </div>
                        
                        <div className="p-5 space-y-2.5">
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
                                className="w-full text-left p-5 bg-gradient-to-r from-rose-500/8 to-pink-500/8 hover:from-rose-500/15 hover:to-pink-500/15 border border-rose-500/15 hover:border-rose-500/30 rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-rose-500/10 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-br from-rose-500/25 to-pink-500/25 p-3.5 rounded-xl group-hover:from-rose-500/35 group-hover:to-pink-500/35 transition-all duration-300 shadow-sm">
                                        <Heart className="text-rose-500" size={22} />
                                    </div>
                                    <span className="text-base font-semibold text-foreground flex-1 leading-relaxed">
                                        1. 따뜻한 마음을 키워 올바른 인성을 기르겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300" size={20} />
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
                                className="w-full text-left p-5 bg-gradient-to-r from-amber-500/8 to-yellow-500/8 hover:from-amber-500/15 hover:to-yellow-500/15 border border-amber-500/15 hover:border-amber-500/30 rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-amber-500/10 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-br from-amber-500/25 to-yellow-500/25 p-3.5 rounded-xl group-hover:from-amber-500/35 group-hover:to-yellow-500/35 transition-all duration-300 shadow-sm">
                                        <Lightbulb className="text-amber-500" size={22} />
                                    </div>
                                    <span className="text-base font-semibold text-foreground flex-1 leading-relaxed">
                                        2. 학습역량을 높여 모두의 성장을 돕겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" size={20} />
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
                                className="w-full text-left p-5 bg-gradient-to-r from-sky-500/8 to-blue-500/8 hover:from-sky-500/15 hover:to-blue-500/15 border border-sky-500/15 hover:border-sky-500/30 rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-sky-500/10 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-br from-sky-500/25 to-blue-500/25 p-3.5 rounded-xl group-hover:from-sky-500/35 group-hover:to-blue-500/35 transition-all duration-300 shadow-sm">
                                        <Target className="text-sky-500" size={22} />
                                    </div>
                                    <span className="text-base font-semibold text-foreground flex-1 leading-relaxed">
                                        3. 더 넓고 두터운 지원으로 모두의 가능성을 열겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-300" size={20} />
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
                                className="w-full text-left p-5 bg-gradient-to-r from-emerald-500/8 to-teal-500/8 hover:from-emerald-500/15 hover:to-teal-500/15 border border-emerald-500/15 hover:border-emerald-500/30 rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-emerald-500/10 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-br from-emerald-500/25 to-teal-500/25 p-3.5 rounded-xl group-hover:from-emerald-500/35 group-hover:to-teal-500/35 transition-all duration-300 shadow-sm">
                                        <Shield className="text-emerald-500" size={22} />
                                    </div>
                                    <span className="text-base font-semibold text-foreground flex-1 leading-relaxed">
                                        4. 학교의 안전을 채워 건강한 성장을 지원하겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" size={20} />
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
                                className="w-full text-left p-5 bg-gradient-to-r from-violet-500/8 to-purple-500/8 hover:from-violet-500/15 hover:to-purple-500/15 border border-violet-500/15 hover:border-violet-500/30 rounded-xl transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-violet-500/10 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-br from-violet-500/25 to-purple-500/25 p-3.5 rounded-xl group-hover:from-violet-500/35 group-hover:to-purple-500/35 transition-all duration-300 shadow-sm">
                                        <Users className="text-violet-500" size={22} />
                                    </div>
                                    <span className="text-base font-semibold text-foreground flex-1 leading-relaxed">
                                        5. 교육공동체가 힘을 모아 배움의 장을 넓히겠습니다.
                                    </span>
                                    <ChevronRight className="text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" size={20} />
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
        <div className="min-h-screen flex flex-col items-center pb-20 bg-background noise-overlay">
            <header className="w-full max-w-5xl px-6 py-4 flex items-center justify-between border-b border-border/50 bg-card/80 glass sticky top-0 z-50">
                 <button 
                    onClick={resetToInitialState}
                    className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group"
                >
                    <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                        <BookOpen className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h1 className="text-lg font-bold text-foreground tracking-tight">2026 대구 미래역량 교육</h1>
                </button>
                 <div className="flex items-center gap-3">
                     {/* 캐릭터 경주로 */}
                     <RaceTrack progress={calculateProgress} />
                     <button 
                        onClick={revealAllAnswers}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-secondary-foreground text-sm font-semibold transition-all duration-200 hover:shadow-md press-effect"
                    >
                        <Eye size={18} />
                        <span className="hidden sm:inline">정답 보기</span>
                    </button>
                 </div>
            </header>
            
            <main className="w-full max-w-3xl p-6 md:p-12 flex-1 flex flex-col items-center justify-center animate-fade-in-up">
                <div className="bg-card/80 glass p-10 rounded-2xl border border-border/50 shadow-xl w-full text-center">
                    <div className="mb-10 flex flex-col items-center">
                        <div className="bg-gradient-to-br from-secondary to-secondary/80 p-4 rounded-2xl mb-5 text-secondary-foreground shadow-lg">
                            <List size={30} />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">목차 학습</h2>
                        <p className="text-muted-foreground text-lg">빈칸을 채워 대구교육의 방향 목차를 완성하세요.</p>
                    </div>
                    
                    <div className="space-y-3 text-left inline-block">
                        {INTRO_CONTENT.map((line, idx) => (
                            <div key={idx} className="text-[1.8rem] leading-[3.2rem] font-bold text-card-foreground pl-5 border-l-[3px] border-primary/25 hover:border-primary hover:bg-primary/5 rounded-r-lg transition-all duration-200 py-1">
                                {renderLine(line, 'intro', idx)}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            
            {showToast && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-4 z-50 animate-fade-in-up glass">
                    <div className="bg-white/20 p-1.5 rounded-xl"><CheckCircle size={22} /></div>
                    <span className="text-lg font-bold tracking-wide">{showToast.message}</span>
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
                        {renderLine(item.title, `policy-detail-${policyDetailIdx}-${itemPath}`, 0, 0, false, false, true)}
                      </div>
                    </div>
                    {/* 콘텐츠 */}
                    {(hasChildren || item.table) && (
                      <div className="bg-card/50 p-6 border-t border-border/50">
                        {/* 표 렌더링 */}
                        {item.table && (
                          <div className="overflow-x-auto mb-4">
                            <table className="w-full border-collapse text-sm">
                              <thead>
                                <tr>
                                  {item.table.headers.map((header, hIdx) => (
                                    <th 
                                      key={hIdx} 
                                      className={`bg-primary/20 text-primary font-bold px-2 py-1.5 text-center border border-border/50 first:rounded-tl-lg last:rounded-tr-lg ${hIdx === 0 ? 'w-[15%]' : hIdx === 1 ? 'w-[40%]' : 'w-[45%]'}`}
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.table.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-card/30' : 'bg-card/50'}>
                                    {row.map((cell, cIdx) => (
                                      <td 
                                        key={cIdx} 
                                        className={`px-2 py-1 border border-border/50 align-middle ${cIdx === 0 ? 'font-semibold text-amber-400 bg-amber-500/10 text-center' : cIdx === 1 ? 'text-foreground text-center' : 'text-emerald-400'}`}
                                      >
                                        {renderLine(cell, `policy-detail-${policyDetailIdx}-${itemPath}-table-${rIdx}-${cIdx}`, 0, 0, false, false, true, true)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {hasChildren && renderHierarchy(item.children, level + 1, itemPath)}
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
                        {renderLine(item.title, `policy-detail-${policyDetailIdx}-${itemPath}`, 0, 0, false, false, true)}
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
                      {renderLine(item.title, `policy-detail-${policyDetailIdx}-${itemPath}`, 0, 0, false, false, true)}
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
                    {renderLine(item.title, `policy-detail-${policyDetailIdx}-${itemPath}`, 0, 0, false, false, true)}
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
      <div className="min-h-screen flex flex-col items-center pb-20 bg-background noise-overlay">
        {/* Header */}
        <header className="w-full max-w-5xl px-6 py-4 flex items-center justify-between border-b border-border/50 bg-card/80 glass sticky top-0 z-50">
          <button 
            onClick={() => {
              setInputStates(parseAndInitContent());
              setSelectedPolicyDetail(null);
              setActivePolicyTab(0);
              setIsLandingPage(true);
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group"
            title="첫 화면으로"
          >
            <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">2026 시책</h1>
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <RaceTrack progress={calculateProgress} />
            {wrongHistory.size > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-xl border border-destructive/20 text-destructive text-sm font-medium animate-soft-pulse">
                <AlertTriangle size={15} />
                <span>복습: {wrongHistory.size}</span>
              </div>
            )}
            <button 
              onClick={revealAllAnswers}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-secondary-foreground text-sm font-semibold transition-all duration-200 hover:shadow-md press-effect"
              title="정답 보기"
            >
              <Eye size={18} />
              <span className="hidden sm:inline">정답 보기</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full max-w-4xl p-6 md:p-12 flex-1">
          <div className="bg-card/80 glass p-8 md:p-10 rounded-2xl border border-border/50 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 pb-4 border-b-2 border-primary/25 whitespace-nowrap overflow-hidden text-ellipsis tracking-tight">
              {policyDetail.title}
            </h2>
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {topLevelItems.map((item, idx) => {
                const isCurrent = idx === activePolicyTab;
                return (
                  <button
                    key={idx}
                    onClick={() => setActivePolicyTab(idx)}
                    className={`
                      px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border press-effect
                      ${isCurrent 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.03]' 
                        : 'bg-secondary/70 text-secondary-foreground border-transparent hover:bg-secondary hover:shadow-md'}
                    `}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="mt-8 animate-fade-in-up">
              {selectedItem && selectedItem.children && renderHierarchy(selectedItem.children)}
            </div>
          </div>
        </main>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-4 z-50 animate-fade-in-up glass">
            <div className="bg-white/20 p-1.5 rounded-xl"><CheckCircle size={22} /></div>
            <span className="text-lg font-bold tracking-wide">{showToast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW: POLICY ---
  if (showPolicy) {
    const renderPolicyContentBlocks = () => {
      const section = POLICY_SECTIONS[activeTab];
      const commonTextClass = "text-[1.8rem] leading-[3.2rem] text-card-foreground font-medium break-keep";

      return (
        <div className="space-y-5">
          {section.content.map((line, idx) => (
            <div key={idx} className="bg-card/80 glass p-7 rounded-2xl border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
              <div className={commonTextClass}>
                {renderLine(line, activeTab, idx, 0, false, false, true)}
              </div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="min-h-screen flex flex-col items-center pb-20 bg-background noise-overlay">
        {/* Header */}
        <header className="w-full max-w-5xl px-6 py-4 flex items-center justify-between border-b border-border/50 bg-card/80 glass sticky top-0 z-50">
          <button 
            onClick={resetToInitialState}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group"
            title="첫 화면으로"
          >
            <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">2026 시책</h1>
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <RaceTrack progress={calculateProgress} />
            {wrongHistory.size > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-xl border border-destructive/20 text-destructive text-sm font-medium animate-soft-pulse">
                <AlertTriangle size={15} />
                <span>복습: {wrongHistory.size}</span>
              </div>
            )}
            <button 
              onClick={revealAllAnswers}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-secondary-foreground text-sm font-semibold transition-all duration-200 hover:shadow-md press-effect"
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

  // --- VIEW: ENGLISH DEMO ---
  if (showEnglishDemo) {
    const section = ENGLISH_DEMO_SECTIONS[activeTab];
    const commonTextClass = "text-[1.9rem] leading-[4rem] text-card-foreground font-medium break-keep tracking-wide";

    // 일반 콘텐츠 렌더링 (도입, Activity 1, 활동 마무리, 정리)
    const renderNormalContent = () => {
      if (!section.content) return null;

      // 각 라인에 대한 matchOffset 계산 (전체 섹션 기준)
      let globalMatchOffset = 0;
      const lineOffsets: Map<number, number> = new Map();
      
      section.content.forEach((line, idx) => {
        lineOffsets.set(idx, globalMatchOffset);
        const matches = line.match(/\[(.*?)\]/g);
        if (matches) {
          globalMatchOffset += matches.length;
        }
      });

      return (
        <div className="space-y-6">
          {section.content.map((line, idx) => {
            // 각 줄에서 matchCount는 0부터 시작 (parseAndInitContent와 동일하게)
            const matchOffset = 0;
            
            // 헤더 라인인 경우 스타일링 (#으로 시작하거나 콜론으로 끝나는 경우)
            if ((line.trim().startsWith('#') || (line.trim().endsWith(':') && !line.includes('[')))) {
              const headerText = line.trim().startsWith('#') ? line.trim().substring(1) : line;
              return (
                <div key={idx} className="mt-8 mb-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-primary border-b-2 border-primary/30 pb-2">
                    {headerText}
                  </h3>
                </div>
              );
            }
            
            // 빈 줄인 경우
            if (!line.trim()) {
              return <div key={idx} className="h-4" />;
            }
            
            return (
              <div key={idx} className="bg-card p-8 rounded-3xl border border-border shadow-md relative group">
                <button
                  onClick={() => handleSpeak(line)}
                  className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="읽기"
                >
                  {isSpeaking && speakingText === line ? (
                    <VolumeX size={18} className="text-muted-foreground" />
                  ) : (
                    <Volume2 size={18} className="text-muted-foreground" />
                  )}
                </button>
                <div className={commonTextClass}>
                  {renderLine(line, activeTab, idx, matchOffset, false, true)}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    // 기능별 서브탭 + 활동 카드 렌더링 (도입, Activity 1, Activity 2, Activity 3)
    const renderSkillBasedContent = () => {
      if (!section.skillCategories) return null;

      const skillColors: Record<string, { bg: string; border: string; text: string; icon: string; cardBg: string; cardText: string }> = {
        listening: { bg: 'bg-[hsl(var(--card))]', border: 'border-blue-400', text: 'text-blue-800', icon: '👂', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' },
        speaking: { bg: 'bg-[hsl(var(--card))]', border: 'border-green-400', text: 'text-green-800', icon: '🗣️', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' },
        reading: { bg: 'bg-[var(--card)]', border: 'border-amber-400', text: 'text-amber-800', icon: '📖', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' },
        writing: { bg: 'bg-[hsl(var(--card))]', border: 'border-purple-400', text: 'text-purple-800', icon: '✏️', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' },
        integrated: { bg: 'bg-[hsl(var(--card))]', border: 'border-rose-400', text: 'text-rose-800', icon: '🔗', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' }
      };

      const currentSkillCategory = section.skillCategories.find(cat => cat.id === activeSkillTab);
      // Activity 1의 경우 듣말읽/쓰 2개만 있으므로 첫번째 카테고리 선택
      const effectiveSkillCategory = currentSkillCategory || section.skillCategories[0];

      return (
        <div className="space-y-8">
          {/* 상단 도입 콘텐츠 */}
          {section.content && section.content.length > 0 && (() => {
            // 도입 탭의 경우 정리 탭과 동일한 스타일 적용
            if (section.id === 'introduction') {
              // 각 라인에 대한 matchOffset 계산 (전체 섹션 기준)
              let globalMatchOffset = 0;
              const lineOffsets: Map<number, number> = new Map();
              
              section.content.forEach((line, idx) => {
                lineOffsets.set(idx, globalMatchOffset);
                const matches = line.match(/\[(.*?)\]/g);
                if (matches) {
                  globalMatchOffset += matches.length;
                }
              });

              // 동기유발 섹션 인덱스 찾기
              const motivationIndex = section.content.findIndex(line => 
                line.trim() === "동기유발:"
              );
              
              // 배움문제 및 활동 안내 섹션 인덱스 찾기
              const activityGuideIndex = section.content.findIndex(line => 
                line.trim() === "배움문제 및 활동 안내:"
              );

              // 편지글 인덱스 찾기 (편지 내용 라인 찾기 - "Hi, everyone" 또는 "Hello, everyone"과 "Ellen" 또는 "problem"을 포함하는 라인)
              const letterIndex = section.content.findIndex(line => 
                (line.includes("Hi, everyone") || line.includes("Hello, everyone")) && 
                (line.includes("Ellen") || line.includes("problem") || line.includes("I have a new friend") || line.includes("I have a problem"))
              );

              const renderContentLine = (line: string, idx: number) => {
                // 각 줄에서 matchCount는 0부터 시작 (parseAndInitContent와 동일하게)
                const matchOffset = 0;
                const isLetterContent = letterIndex >= 0 && idx === letterIndex;
                
                // 헤더 라인인 경우 스타일링 (#으로 시작하거나 콜론으로 끝나는 경우)
                if ((line.trim().startsWith('#') || (line.trim().endsWith(':') && !line.includes('[')))) {
                  const headerText = line.trim().startsWith('#') ? line.trim().substring(1) : line;
                  return (
                    <div key={idx} className="mt-8 mb-4">
                      <h3 className="text-2xl md:text-3xl font-bold text-primary border-b-2 border-primary/30 pb-2">
                        {headerText}
                      </h3>
                    </div>
                  );
                }
                
                // 빈 줄인 경우
                if (!line.trim()) {
                  return <div key={idx} className="h-4" />;
                }
                
                // 편지글 내용인 경우 특별한 스타일 적용
                if (isLetterContent) {
                  return (
                    <div key={idx} className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-8 rounded-3xl border-2 border-pink-300 dark:border-pink-700 shadow-md">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">✉️</span>
                          <span className="text-sm font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wide">편지 내용</span>
                        </div>
                        <button
                          onClick={() => handleSpeak(line)}
                          className="p-2 hover:bg-pink-200 dark:hover:bg-pink-800 rounded-lg transition-colors"
                          aria-label="읽기"
                        >
                          {isSpeaking && speakingText === line ? (
                            <VolumeX size={18} className="text-pink-700 dark:text-pink-300" />
                          ) : (
                            <Volume2 size={18} className="text-pink-700 dark:text-pink-300" />
                          )}
                        </button>
                      </div>
                      <div className={commonTextClass}>
                        {renderLine(line, activeTab, idx, matchOffset, false, true)}
                      </div>
                      
                      {/* 편지 내용의 일부로 4가지 기능별 하위범주 표시 */}
                      {section.skillCategories && section.skillCategories.length > 0 && (() => {
                        const skillColors: Record<string, { bg: string; border: string; text: string; icon: string; cardBg: string; cardText: string }> = {
                          listening: { bg: 'bg-[hsl(var(--card))]', border: 'border-blue-400', text: 'text-blue-800', icon: '👂', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' },
                          speaking: { bg: 'bg-[hsl(var(--card))]', border: 'border-green-400', text: 'text-green-800', icon: '🗣️', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' },
                          reading: { bg: 'bg-[var(--card)]', border: 'border-amber-400', text: 'text-amber-800', icon: '📖', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' },
                          writing: { bg: 'bg-[hsl(var(--card))]', border: 'border-purple-400', text: 'text-purple-800', icon: '✏️', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' },
                          integrated: { bg: 'bg-[hsl(var(--card))]', border: 'border-rose-400', text: 'text-rose-800', icon: '🔗', cardBg: 'bg-[hsl(var(--card))]', cardText: 'text-slate-800 dark:text-slate-200' }
                        };

                        const currentSkillCategory = section.skillCategories.find(cat => cat.id === activeSkillTab);
                        const effectiveSkillCategory = currentSkillCategory || section.skillCategories[0];

                        return (
                          <div className="mt-6 pt-6 border-t-2 border-pink-300 dark:border-pink-700">
                            {/* 기능별 서브탭 */}
                            <div className={`grid gap-2 mb-6 ${section.skillCategories.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                              {section.skillCategories.map((category) => {
                                const colors = skillColors[category.id] || skillColors.listening;
                                const isActive = activeSkillTab === category.id || (section.skillCategories!.length <= 2 && section.skillCategories![0].id === category.id && !currentSkillCategory);
                                
                                return (
                                  <button
                                    key={category.id}
                                    onClick={() => setActiveSkillTab(category.id)}
                                    className={`
                                      relative p-2 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1
                                      ${isActive 
                                        ? `${colors.bg} ${colors.border} ${colors.text} shadow-md scale-105` 
                                        : 'bg-white/50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700 text-muted-foreground hover:border-pink-400 dark:hover:border-pink-600 hover:bg-white/70 dark:hover:bg-pink-900/30'}
                                    `}
                                  >
                                    <span className="text-xl">{category.icon || colors.icon}</span>
                                    <span className="font-semibold text-sm">{category.title}</span>
                                    {isActive && (
                                      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 ${colors.bg} ${colors.border} border-t-0 border-l-0`} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* 선택된 기능의 활동 카드들 */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <div className={`grid gap-6 ${effectiveSkillCategory.activities.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                                {effectiveSkillCategory.activities.map((activity, activityIdx) => {
                                  const colors = skillColors[effectiveSkillCategory.id] || skillColors.listening;
                                  
                                  // 활동 카드 내 라인별 matchOffset 계산
                                  let activityMatchOffset = 0;
                                  const activityLineOffsets: Map<number, number> = new Map();
                                  
                                  activity.content.forEach((line, lineIdx) => {
                                    activityLineOffsets.set(lineIdx, activityMatchOffset);
                                    const matches = line.match(/\[(.*?)\]/g);
                                    if (matches) {
                                      activityMatchOffset += matches.length;
                                    }
                                  });

                                  // 활동 카드용 고유 secIdx 생성 (탭-스킬-활동)
                                  const activitySecIdx = `${activeTab}-${effectiveSkillCategory.id}-${activity.id}`;
                                  
                                  return (
                                    <div 
                                      key={activity.id}
                                      className={`
                                        ${colors.cardBg} ${colors.border} border-2
                                        rounded-3xl p-6 shadow-md
                                        hover:shadow-lg transition-shadow duration-300
                                      `}
                                    >
                                      {/* 활동 카드 헤더 */}
                                      <div className={`flex items-center justify-between gap-3 mb-4 pb-3 border-b ${colors.border}`}>
                                        <div className="flex items-center gap-3">
                                          <span className="text-2xl">{effectiveSkillCategory?.icon || colors.icon}</span>
                                          <h4 className={`text-xl font-bold ${colors.text}`}>
                                            ●{activity.title}
                                          </h4>
                                        </div>
                                        {/* 활동 카드 내용 전체를 읽기 위한 스피커 버튼 */}
                                        <button
                                          onClick={() => {
                                            const allText = activity.content.join(' ');
                                            handleSpeak(allText);
                                          }}
                                          className={`p-2 rounded-lg transition-colors hover:bg-white/50 dark:hover:bg-black/20`}
                                          aria-label="읽기"
                                        >
                                          {isSpeaking && speakingText === activity.content.join(' ') ? (
                                            <VolumeX size={18} className={colors.text} />
                                          ) : (
                                            <Volume2 size={18} className={colors.text} />
                                          )}
                                        </button>
                                      </div>
                                      
                                      {/* 활동 카드 내용 */}
                                      <div className="space-y-3">
                                        {activity.content.map((line, lineIdx) => {
                                          const matchOffset = activityLineOffsets.get(lineIdx) ?? 0;
                                          
                                          // 빈 줄인 경우
                                          if (!line.trim()) {
                                            return <div key={lineIdx} className="h-3" />;
                                          }
                                          
                                          return (
                                            <div 
                                              key={lineIdx} 
                                              className={`text-[1.9rem] leading-[4rem] ${colors.cardText} font-medium break-keep tracking-wide`}
                                            >
                                              {renderLine(line, activitySecIdx, lineIdx, matchOffset, false, true)}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }
                
                return (
                  <div key={idx} className="bg-card p-8 rounded-3xl border border-border shadow-md relative group">
                    <button
                      onClick={() => handleSpeak(line)}
                      className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="읽기"
                    >
                      {isSpeaking && speakingText === line ? (
                        <VolumeX size={18} className="text-muted-foreground" />
                      ) : (
                        <Volume2 size={18} className="text-muted-foreground" />
                      )}
                    </button>
                    <div className={commonTextClass}>
                      {renderLine(line, activeTab, idx, matchOffset, false, true)}
                    </div>
                  </div>
                );
              };

              return (
                <div className="space-y-6 mb-8">
                  {/* 동기유발 섹션 이전 내용 */}
                  {section.content.slice(0, motivationIndex >= 0 ? motivationIndex : section.content.length).map((line, idx) => 
                    renderContentLine(line, idx)
                  )}
                  
                  {/* 동기유발 섹션 */}
                  {motivationIndex >= 0 && (
                    <>
                      {section.content.slice(motivationIndex, activityGuideIndex >= 0 ? activityGuideIndex : section.content.length).map((line, idx) => {
                        const actualIdx = motivationIndex + idx;
                        return renderContentLine(line, actualIdx);
                      })}
                    </>
                  )}
                  
                  {/* 배움문제 및 활동 안내 섹션 이후 내용 */}
                  {activityGuideIndex >= 0 && (
                    <>
                      {section.content.slice(activityGuideIndex).map((line, idx) => 
                        renderContentLine(line, activityGuideIndex + idx)
                      )}
                    </>
                  )}
                </div>
              );
            }
            
            // Activity 1, 2, 3의 경우 기존 스타일 유지
            return (
              <div className="bg-card p-8 rounded-3xl border border-border shadow-md mb-8">
                <div className="space-y-4">
                  {section.content.map((line, idx) => {
                    // 헤더 라인인 경우 스타일링 (#으로 시작하거나 콜론으로 끝나고 대괄호가 없는 경우)
                    if ((line.trim().startsWith('#') || (line.trim().endsWith(':') && !line.includes('[')))) {
                      const headerText = line.trim().startsWith('#') ? line.trim().substring(1) : line;
                      return (
                        <div key={idx} className="mt-6 mb-2">
                          <h3 className="text-2xl md:text-3xl font-bold text-primary border-b-2 border-primary/30 pb-2">
                            {headerText}
                          </h3>
                        </div>
                      );
                    }
                    if (!line.trim()) return <div key={idx} className="h-2" />;
                    
                    // matchOffset 계산
                    let matchOffset = 0;
                    for (let i = 0; i < idx; i++) {
                      const prevMatches = section.content![i].match(/\[(.*?)\]/g);
                      if (prevMatches) matchOffset += prevMatches.length;
                    }
                    
                    return (
                      <div key={idx} className="relative group">
                        <button
                          onClick={() => handleSpeak(line)}
                          className="absolute -top-2 -right-2 p-2 hover:bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                          aria-label="읽기"
                        >
                          {isSpeaking && speakingText === line ? (
                            <VolumeX size={16} className="text-muted-foreground" />
                          ) : (
                            <Volume2 size={16} className="text-muted-foreground" />
                          )}
                        </button>
                        <div className={commonTextClass}>
                          {renderLine(line, activeTab, idx, matchOffset, false, true)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 기능별 서브탭 - 도입 섹션은 편지 내용 바로 다음에 표시되므로 여기서는 제외 */}
          {section.id !== 'introduction' && (
            <div className={`grid gap-3 mb-8 ${section.skillCategories.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {section.skillCategories.map((category) => {
              const colors = skillColors[category.id] || skillColors.listening;
              const isActive = activeSkillTab === category.id || (section.skillCategories!.length <= 2 && section.skillCategories![0].id === category.id && !currentSkillCategory);
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveSkillTab(category.id)}
                  className={`
                    relative p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1
                    ${isActive 
                      ? `${colors.bg} ${colors.border} ${colors.text} shadow-lg scale-105` 
                      : 'bg-card border-border text-muted-foreground hover:border-primary/30 hover:bg-secondary/50'}
                  `}
                >
                  <span className="text-2xl">{category.icon || colors.icon}</span>
                  <span className="font-bold text-base">{category.title}</span>
                  {isActive && (
                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 ${colors.bg} ${colors.border} border-t-0 border-l-0`} />
                  )}
                </button>
              );
            })}
            </div>
          )}

          {/* 선택된 기능의 활동 카드들 - 도입 섹션은 편지 내용 바로 다음에 표시되므로 여기서는 제외 */}
          {section.id !== 'introduction' && effectiveSkillCategory && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`grid gap-6 ${effectiveSkillCategory.activities.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {effectiveSkillCategory.activities.map((activity, activityIdx) => {
                  const colors = skillColors[effectiveSkillCategory.id] || skillColors.listening;
                  
                  // 활동 카드 내 라인별 matchOffset 계산
                  let activityMatchOffset = 0;
                  const activityLineOffsets: Map<number, number> = new Map();
                  
                  activity.content.forEach((line, lineIdx) => {
                    activityLineOffsets.set(lineIdx, activityMatchOffset);
                    const matches = line.match(/\[(.*?)\]/g);
                    if (matches) {
                      activityMatchOffset += matches.length;
                    }
                  });

                  // 활동 카드용 고유 secIdx 생성 (탭-스킬-활동)
                  const activitySecIdx = `${activeTab}-${effectiveSkillCategory.id}-${activity.id}`;

                  // 도입 탭의 경우 편지글 스타일 적용
                  const isIntroductionLetter = section.id === 'introduction';
                  
                  return (
                    <div 
                      key={activity.id}
                      className={`
                        ${isIntroductionLetter 
                          ? 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-300 dark:border-pink-700' 
                          : `${colors.cardBg} ${colors.border} border-2`} 
                        rounded-3xl p-6 shadow-md
                        hover:shadow-lg transition-shadow duration-300
                      `}
                    >
                      {/* 활동 카드 헤더 */}
                      <div className={`flex items-center justify-between gap-3 mb-4 pb-3 border-b ${isIntroductionLetter ? 'border-pink-300 dark:border-pink-700' : colors.border}`}>
                        <div className="flex items-center gap-3">
                          {isIntroductionLetter && (
                            <span className="text-2xl">✉️</span>
                          )}
                          <span className="text-2xl">{effectiveSkillCategory?.icon || colors.icon}</span>
                          <h4 className={`text-xl font-bold ${isIntroductionLetter ? 'text-pink-700 dark:text-pink-300' : colors.text}`}>
                            ●{activity.title}
                          </h4>
                        </div>
                        {/* 활동 카드 내용 전체를 읽기 위한 스피커 버튼 */}
                        <button
                          onClick={() => {
                            const allText = activity.content.join(' ');
                            handleSpeak(allText);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isIntroductionLetter 
                              ? 'hover:bg-pink-200 dark:hover:bg-pink-800' 
                              : 'hover:bg-white/50 dark:hover:bg-black/20'
                          }`}
                          aria-label="읽기"
                        >
                          {isSpeaking && speakingText === activity.content.join(' ') ? (
                            <VolumeX size={18} className={isIntroductionLetter ? 'text-pink-700 dark:text-pink-300' : colors.text} />
                          ) : (
                            <Volume2 size={18} className={isIntroductionLetter ? 'text-pink-700 dark:text-pink-300' : colors.text} />
                          )}
                        </button>
                      </div>
                      
                      {/* 활동 카드 내용 - 가독성 개선 */}
                      <div className="space-y-3">
                        {activity.content.map((line, lineIdx) => {
                          const matchOffset = activityLineOffsets.get(lineIdx) ?? 0;
                          
                          // 빈 줄인 경우
                          if (!line.trim()) {
                            return <div key={lineIdx} className="h-3" />;
                          }
                          
                          return (
                            <div 
                              key={lineIdx} 
                              className={`text-[1.9rem] leading-[4rem] ${colors.cardText} font-medium break-keep tracking-wide`}
                            >
                              {renderLine(line, activitySecIdx, lineIdx, matchOffset, false, true)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 하단 마무리 콘텐츠 (도입의 학습문제 확인, Activity 3의 활동 마무리) */}
          {section.closingContent && section.closingContent.length > 0 && (() => {
            // closingContent용 matchOffset 계산
            const closingLineOffsets: Map<number, number> = new Map();
            let closingMatchOffset = 0;
            section.closingContent.forEach((line, idx) => {
              closingLineOffsets.set(idx, closingMatchOffset);
              const matches = line.match(/\[(.*?)\]/g);
              if (matches) closingMatchOffset += matches.length;
            });
            
            // 도입 탭의 경우 정리 탭과 동일한 스타일 적용
            if (section.id === 'introduction') {
              return (
                <div className="space-y-6 mt-8">
                  {section.closingContent.map((line, idx) => {
                    const matchOffset = closingLineOffsets.get(idx) ?? 0;
                    
                    // 헤더 라인인 경우 스타일링 (#으로 시작하거나 콜론으로 끝나는 경우)
                    if ((line.trim().startsWith('#') || (line.trim().endsWith(':') && !line.includes('[')))) {
                      const headerText = line.trim().startsWith('#') ? line.trim().substring(1) : line;
                      return (
                        <div key={idx} className="mt-8 mb-4">
                          <h3 className="text-2xl md:text-3xl font-bold text-primary border-b-2 border-primary/30 pb-2">
                            {headerText}
                          </h3>
                        </div>
                      );
                    }
                    
                    // 빈 줄인 경우
                    if (!line.trim()) {
                      return <div key={idx} className="h-4" />;
                    }
                    
                    return (
                      <div key={idx} className="bg-card p-8 rounded-3xl border border-border shadow-md relative group">
                        <button
                          onClick={() => handleSpeak(line)}
                          className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="읽기"
                        >
                          {isSpeaking && speakingText === line ? (
                            <VolumeX size={18} className="text-muted-foreground" />
                          ) : (
                            <Volume2 size={18} className="text-muted-foreground" />
                          )}
                        </button>
                        <div className={commonTextClass}>
                          {renderLine(line, `${activeTab}-closing`, idx, matchOffset, false, true)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }
            
            // Activity 3 등 다른 섹션은 기존 스타일 유지
            return (
              <div className="bg-card p-8 rounded-3xl border border-border shadow-md mt-8">
                <div className="space-y-4">
                  {section.closingContent.map((line, idx) => {
                    // 헤더 라인인 경우 스타일링 (#으로 시작하거나 콜론으로 끝나는 경우)
                    if ((line.trim().startsWith('#') || (line.trim().endsWith(':') && !line.includes('[')))) {
                      const headerText = line.trim().startsWith('#') ? line.trim().substring(1) : line;
                      return (
                        <div key={idx} className="mt-6 mb-2">
                          <h3 className="text-2xl md:text-3xl font-bold text-primary border-b-2 border-primary/30 pb-2">
                            {headerText}
                          </h3>
                        </div>
                      );
                    }
                    if (!line.trim()) return <div key={idx} className="h-2" />;
                    
                    const matchOffset = closingLineOffsets.get(idx) ?? 0;
                    
                    return (
                      <div key={idx} className="relative group">
                        <button
                          onClick={() => handleSpeak(line)}
                          className="absolute -top-2 -right-2 p-2 hover:bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                          aria-label="읽기"
                        >
                          {isSpeaking && speakingText === line ? (
                            <VolumeX size={16} className="text-muted-foreground" />
                          ) : (
                            <Volume2 size={16} className="text-muted-foreground" />
                          )}
                        </button>
                        <div className={commonTextClass}>
                          {renderLine(line, `${activeTab}-closing`, idx, matchOffset, false, true)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      );
    };

    return (
      <div className="min-h-screen flex flex-col items-center pb-20 bg-background noise-overlay">
        {/* Header */}
        <header className="w-full max-w-5xl px-6 py-4 flex items-center justify-between border-b border-border/50 bg-card/80 glass sticky top-0 z-50">
          <button 
            onClick={resetToInitialState}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group"
            title="첫 화면으로"
          >
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">영어 답안틀</h1>
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <RaceTrack progress={calculateProgress} />
            {wrongHistory.size > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-xl border border-destructive/20 text-destructive text-sm font-medium animate-soft-pulse">
                <AlertTriangle size={15} />
                <span>복습: {wrongHistory.size}</span>
              </div>
            )}
            <button 
              onClick={revealAllAnswers}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-secondary-foreground text-sm font-semibold transition-all duration-200 hover:shadow-md press-effect"
              title="정답 보기"
            >
              <Eye size={18} />
              <span className="hidden sm:inline">정답 보기</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full max-w-5xl p-6 md:p-12 flex-1">
          
          {/* Main Tabs (도입, Activity 1, Activity 2, Activity 3, 활동 마무리, 정리) */}
          {ENGLISH_DEMO_SECTIONS.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-10 justify-center items-center">
              {ENGLISH_DEMO_SECTIONS.map((sec, idx) => {
                const isCurrent = idx === activeTab;
                const sectionIds = Object.keys(inputStates).filter(k => k.startsWith(`english-demo-${idx}-`));
                const isDone = sectionIds.length > 0 && sectionIds.every(id => inputStates[id].status === 'correct' || inputStates[id].status === 'wrong-2');
                
                const isConclusionTab = sec.id === 'conclusion';
                const isInterviewTab = sec.id === 'interview';

                if (isInterviewTab) {
                  return null;
                }

                return (
                  <React.Fragment key={sec.id}>
                    <button
                      onClick={() => {
                        setActiveTab(idx);
                        setActiveSkillTab('listening');
                      }}
                      className={`
                        px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border press-effect
                        ${isCurrent 
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.03]' 
                          : 'bg-secondary/70 text-secondary-foreground border-transparent hover:bg-secondary hover:shadow-md'}
                        ${isDone && !isCurrent ? 'border-primary/40 text-primary bg-primary/8' : ''}
                      `}
                    >
                      {isDone && <CheckCircle size={14} className="text-emerald-500" />}
                      {sec.title}
                    </button>
                    {isConclusionTab && (
                      <div className="h-6 w-px bg-border/60 mx-2"></div>
                    )}
                  </React.Fragment>
                );
              })}
              {/* '면접' 탭 별도 배치 */}
              {(() => {
                const interviewIdx = ENGLISH_DEMO_SECTIONS.findIndex(sec => sec.id === 'interview');
                if (interviewIdx === -1) return null;
                
                const isCurrent = interviewIdx === activeTab;
                const sectionIds = Object.keys(inputStates).filter(k => k.startsWith(`english-demo-${interviewIdx}-`));
                const isDone = sectionIds.length > 0 && sectionIds.every(id => inputStates[id].status === 'correct' || inputStates[id].status === 'wrong-2');
                const interviewSec = ENGLISH_DEMO_SECTIONS[interviewIdx];

                return (
                  <button
                    onClick={() => {
                      setActiveTab(interviewIdx);
                      setActiveSkillTab('listening');
                    }}
                    className={`
                      px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border press-effect
                      ${isCurrent 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.03]' 
                        : 'bg-secondary/70 text-secondary-foreground border-transparent hover:bg-secondary hover:shadow-md'}
                      ${isDone && !isCurrent ? 'border-primary/40 text-primary bg-primary/8' : ''}
                    `}
                  >
                    {isDone && <CheckCircle size={14} />}
                    {interviewSec.title}
                  </button>
                );
              })()}
            </div>
          )}

          {/* Dynamic Content Block Render */}
          <div id={`tab-content-${activeTab}`} className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {section.skillCategories ? renderSkillBasedContent() : renderNormalContent()}
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
                    // 각 줄에서 matchCount는 0부터 시작 (parseAndInitContent와 동일하게)
                    const matchOffset = 0;
                    
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
      <div className="min-h-screen flex flex-col items-center pb-20 bg-background noise-overlay">
        {/* Header */}
        <header className="w-full max-w-5xl px-6 py-4 flex items-center justify-between border-b border-border/50 bg-card/80 glass sticky top-0 z-50">
          <button 
            onClick={resetToInitialState}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group"
            title="첫 화면으로"
          >
            <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">심층면접 답안틀</h1>
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <RaceTrack progress={calculateProgress} />
            {wrongHistory.size > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-xl border border-destructive/20 text-destructive text-sm font-medium animate-soft-pulse">
                <AlertTriangle size={15} />
                <span>복습: {wrongHistory.size}</span>
              </div>
            )}
            <button 
              onClick={revealAllAnswers}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-secondary-foreground text-sm font-semibold transition-all duration-200 hover:shadow-md press-effect"
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
          <div id={`tab-content-${activeTab}`} className="w-full animate-fade-in-up">
            {renderInterviewContentBlocks()}
          </div>
        </main>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-4 z-50 animate-fade-in-up glass">
            <div className="bg-white/20 p-1.5 rounded-xl"><CheckCircle size={22} /></div>
            <span className="text-lg font-bold tracking-wide">{showToast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW: MAIN LEARNING APP ---
  return (
    <div className="min-h-screen flex flex-col items-center pb-20 bg-background noise-overlay">
      {/* Header */}
      <header className="w-full max-w-5xl px-6 py-4 flex items-center justify-between border-b border-border/50 bg-card/80 glass sticky top-0 z-50">
        <button 
            onClick={resetToInitialState}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 group"
            title="첫 화면으로"
        >
          <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
             <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">2026 대구 미래역량 교육</h1>
        </button>
        <div className="flex items-center gap-3 sm:gap-4">
            <RaceTrack progress={calculateProgress} />
            {wrongHistory.size > 0 && (
                <div className="hidden sm:flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-xl border border-destructive/20 text-destructive text-sm font-medium animate-soft-pulse">
                    <AlertTriangle size={15} />
                    <span>복습: {wrongHistory.size}</span>
                </div>
            )}
            <button 
                onClick={revealAllAnswers}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-secondary-foreground text-sm font-semibold transition-all duration-200 hover:shadow-md press-effect"
                title="정답 보기"
            >
                <Eye size={18} />
                <span className="hidden sm:inline">정답 보기</span>
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-4xl p-6 md:p-12 flex-1">
        
        {/* Tabs - Refined pill style */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {SECTIONS.map((section, idx) => {
              const isCurrent = idx === activeTab;
              const sectionIds = Object.keys(inputStates).filter(k => k.startsWith(`${idx}-`));
              const isDone = sectionIds.length > 0 && sectionIds.every(id => inputStates[id].status === 'correct' || inputStates[id].status === 'wrong-2');

              return (
                <button
                    key={section.id}
                    onClick={() => setActiveTab(idx)}
                    className={`
                        px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border
                        ${isCurrent 
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.03]' 
                            : 'bg-secondary/70 text-secondary-foreground border-transparent hover:bg-secondary hover:shadow-md'}
                        ${isDone && !isCurrent ? 'border-primary/40 text-primary bg-primary/8' : ''}
                        press-effect
                    `}
                >
                    {isDone && <CheckCircle size={14} className="text-emerald-500" />}
                    {section.title}
                </button>
              );
          })}
        </div>

        {/* Dynamic Content Block Render */}
        <div id={`tab-content-${activeTab}`} className="w-full animate-fade-in-up">
             {renderContentBlocks()}
        </div>

      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-8 py-4 rounded-2xl shadow-2xl shadow-primary/40 flex items-center gap-4 z-50 animate-fade-in-up glass">
            <div className="bg-white/20 p-1.5 rounded-xl"><CheckCircle size={22} /></div>
            <span className="text-lg font-bold tracking-wide">{showToast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
