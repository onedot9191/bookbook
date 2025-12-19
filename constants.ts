
import { SectionData, PolicyDetailData, EnglishDemoSectionData } from './types';

export const INTRO_CONTENT = [
  "1. [비전]",
  "2. [학습자상]",
  "3. [전략]",
  "4. [미래역량]",
  "5. [정책 설계 원리]",
  "6. [지향점]"
];

export const SECTIONS: SectionData[] = [
  {
    id: 'vision',
    title: '1. 비전',
    content: [
      "비전: [미래를 배운다 함께 성장한다]",
      "학생들이 꿈꾸는 미래를 만들어 가기 위해서는 [미래]를 배워야 하며, 배움의 과정 또한 한 학생도 소외되지 않고 자신의 잠재력을 꽃 피울 수 있도록 [함께 성장]하는 교육을 추구하는 것을 의미함"
    ]
  },
  {
    id: 'student',
    title: '2. 학습자상',
    content: [
      "[삶을 주도하며 미래를 만들어 가는 사람]",
      "[성찰]하고 [배려]하며 [소통]하는 사람",
      "[생각]하고 [질문]하며 [탐구]하는 사람",
      "[균형감]과 [원칙]으로 [도전]하는 사람"
    ]
  },
  {
    id: 'strategies',
    title: '3. 전략',
    content: [
      "전략 1: [따뜻한 마음]을 키워 [올바른 인성]을 기르겠습니다",
      "과학기술의 발달과 풍요로움 속에서도 [사람답게 살아가는 힘]을 키우기 위해 마음교육, 인문·예술교육, 생활교육 강화로 아이들의 따뜻한 마음을 키워 올바른 인성을 기를 수 있도록 지원하겠습니다.",
      
      "전략 2: [학습역량]을 높여 [모두의 성장]을 돕겠습니다",
      "단순한 지식과 기능을 익히는 수준을 넘어서, [지혜롭게 생각하고 살아가는 힘]을 키우기 위해 기초·기본학력 신장, 수업과 평가 혁신, 맞춤형 교육으로 아이들의 학습역량을 길러 모두의 성장을 돕겠습니다.",
      
      "전략 3: [더 넓고 두터운 지원]으로 [모두의 가능성]을 열겠습니다",
      "능력, 환경, 지역, 장애, 국적 등에 관계없이 모든 아이가 희망과 꿈을 가지고 [당당하게 살아가는 힘]을 키우기 위해 한 아이, 한 아이의 여건과 상황에 맞도록 더 넓고 두텁게 지원하겠습니다.",
      
      "전략 4: [학교의 안전]을 채워 [건강한 성장]을 지원하겠습니다",
      "[밝고 건강하게 살아가는 힘]을 키워 미래사회를 주도할 인재로 자랄 수 있도록 쾌적하고 안전한 교육 환경을 구축하여 건강한 성장을 지원하겠습니다.",
      
      "전략 5: [교육공동체]가 힘을 모아 [배움의 장]을 넓히겠습니다",
      "친구·이웃들과 [다 함께 살아가는 힘]을 키우기 위해 참여와 소통, 존중의 교육문화를 조성하고 배움의 공간을 확장하여 학생, 학부모, 교원, 지역사회가 함께하는 따뜻한 교육공동체를 만들어 가겠습니다."
    ]
  },
  {
    id: 'competencies',
    title: '4. 미래역량',
    content: [
      "[공감 소통] 역량: 인간과 삶에 대한 [공감적 이해]와 [성찰]을 바탕으로 초연결 미래사회에서 상호 존중의 [협력적 소통]을 통해 [공동의 목적]을 구현할 수 있는 역량",
      "[창의융합적 사고] 역량: 다양한 분야의 지식, 정보, 기술, 경험을 [융합적]으로 활용하여 새로운 것을 [창출]하고 통합적으로 문제를 [해결]할 수 있는 역량",
      "[자기관리] 역량: [자아정체성]과 [자신감]을 가지고 새로운 환경에 적극적으로 [도전]하며, 삶과 진로에 필요한 신체적·정신적 [강인함]과 [회복탄력성]을 갖추어 [자기주도적]으로 살아갈 수 있는 역량",
      "[공동체] 역량: 지역, 국가, 세계 공동체 구성원에게 요구되는 [가치]와 [태도]를 지니고 남을 [배려]하며 함께 행복한 삶을 [실천]적으로 행동할 수 있는 역량"
    ]
  },
  {
    id: 'principles',
    title: '5. 정책 설계 원리',
    content: [
      "#[주도성]",
      "",
      "정의: 사회 구성원으로서 가치와 규범을 [내면화]하고 자신의 삶을 조직하여 [적극적]으로 이끌어 가는 것으로 정의할 수 있다.",
      "",
      "의의: 학생들은 두려움 없이 자신을 표현하고 학습 활동에 자발적으로 참여하는 경험을 통해 자신감을 얻게 되고, 이는 또 다른 동기부여와 성취감으로 발전하여 추진력과 방향성을 갖게 된다.",
      "",
      "#[관계성]",
      "",
      "정의: [두 사람 이상]의 사이에서 심리·정서·신체적으로 [연결]되거나 [관련]되는 것으로 정의할 수 있다.",
      "",
      "의의: 학생들은 교사와 친구 뿐만 아니라 이웃들과의 상호작용을 통해 '나'를 둘러싼 대상과 긍정적인 관계를 만들어가며, '나'의 존재를 성찰하는 과정을 통해 성장한다.",
      "",
      "#[자율성]",
      "",
      "정의: [자기결정]에 따라 스스로 [생각]하고 [행동]하는 것으로 정의할 수 있으며, [책임]을 전제로 한다.",
      "",
      "의의: 학생들은 학교 및 일상적인 삶 속에서 합리적인 선택과 결과에 대한 경험을 축적하는 과정을 통해 자기결정에 대한 확고한 신념과 끝까지 수행하려는 의지를 갖게 된다."
    ]
  },
  {
    id: 'goals',
    title: '6. 지향점',
    content: [
      "[학생]: 올바른 인성과 가치를 가지고 자기 삶을 [주도]하며 [지속가능한 미래]를 만들어가는 역량을 가지는 것을 지향함",
      "[학교]: [자율]과 [자치], [전문성]을 바탕으로 교육활동에 집중하며 배움의 시공간을 확장하여 [모든 학생의 배움]을 지원하는 것을 지향함",
      "[교육공동체]: [교사], [학생], [학부모], [지역사회]가 존중과 협력, 참여의 관계를 바탕으로 학교 교육을 신뢰하고 함께 성장해 나가는 것을 지향함"
    ]
  }
];

export const INTERVIEW_SECTIONS: SectionData[] = [
  {
    id: 'template',
    title: '답안틀',
    content: [
      "서론:",
      "",
      "[00하는 상황입니다]. [따라서 교사는 00에 대한 방안을 마련해야 합니다].",
      "",
      "본론:",
      "",
      "[00에 대한 방안 0가지는 다음과 같습니다].",
      "",
      "[첫째, 키워드입니다].",
      "",
      "[구체화]",
      "1. [용어 정의] 2. [구체적으로] 3. [예를 들어]",
      "",
      "[이를 통해 기대효과를 이룰 수 있습니다].",
      "",
      "결론:",
      "",
      "[이처럼 해당 방안을 통해 00를 이루겠습니다]."
    ]
  }
];

export const ENGLISH_DEMO_SECTIONS: EnglishDemoSectionData[] = [
  {
    id: 'introduction',
    title: '도입',
    content: [
      "인사:",
      "",
      "[Hello, everyone]! [How are you today]?",
      "",
      "[Good]? [Great]? [I'm also happy to hear that]!",
      "",
      "[Is everyone here]? [One, two, three...] <br> [Yes]! [All] (학생 수) [students are here].",
      "",
      "[Are you ready]? [Let's start]!",
      "",
      "전시학습:",
      "",
      "[Let's review]. [Do you remember yesterday]?",
      "",
      "[What did we learn]? (잠시 대기) [Very good]! [You remember everything]!",
      "",
      "동기유발:",
      "",
      "[Look! I have a letter]. (편지 봉투를 보여주며)",
      "",
      "[It's from Dobby]. [He has a problem].",
      "",
      "[Listen carefully].",
      "",
      "[Hello, everyone]! [I have a new friend, Ellen]. [But I have a problem].",
      "",
      "배움문제 및 활동 안내:",
      "",
      "[Poor Dobby]! [Can we help him]?",
      "",
      "[Today, we will learn] (학습목표).",
      "",
      "[We have three activities].",
      "",
      "[We will do three activities].<br><br>[First, Look and Guess].<br> [Second, Practice together]. <br> [Third, Play a game]!"
    ],
    skillCategories: [
      {
        id: 'listening',
        title: '듣기',
        icon: '👂',
        activities: [
          {
            id: 'intro-listening',
            title: '듣기 상황',
            content: [
              "[I can't understand her]."
            ]
          }
        ]
      },
      {
        id: 'speaking',
        title: '말하기',
        icon: '🗣️',
        activities: [
          {
            id: 'intro-speaking',
            title: '말하기 상황',
            content: [
              "[I can't speak English]."
            ]
          }
        ]
      },
      {
        id: 'reading',
        title: '읽기',
        icon: '📖',
        activities: [
          {
            id: 'intro-reading',
            title: '읽기 상황',
            content: [
              "[I can't read her message]."
            ]
          }
        ]
      },
      {
        id: 'writing',
        title: '쓰기',
        icon: '✏️',
        activities: [
          {
            id: 'intro-writing',
            title: '쓰기 상황',
            content: [
              "[I can't write back.]."
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'activity1',
    title: 'Activity 1',
    content: [
      "#시작",
      "",
      "[Let's start Activity 1], [Look and Guess]!",
      "[Look at the screen].",
      "[Who are they]? [Yes]! [They are Tom and Mina].",
      "[What are they doing]? [Right]. [They are talking].",
      "",
      "#추측",
      "",
      "[What are they saying]? [Can you guess]? (잠시 대기)",
      "[Wow]! [Nice guess]!",
      "[Now, let's watch the video].",
      "(비디오 시청 후)",
      "[Did you listen well]? [Let's check]!",
      "[What did Tom say]? (잠시 대기) Good!",
      "[How did Mina answer]? (잠시 대기) Great!",
      "[You are such a good] [listener]/[speaker]!",
      "",
      "#key expression 제시",
      "",
      "[Now], [look at the board].",
      "[These are today's expressions]. (천천히 가리키며)",
      "",
      "#반복",
      "",
      "[Listen and repeat after me], [please].",
      "(표현 1) - (듣는 척)",
      "(표현 2) - (듣는 척)",
      "[Perfect]! [One more time]?",
      "(표현 반복)",
      "[You are so good]!"
    ],
    skillCategories: [
      {
        id: 'listening',
        title: '듣기',
        icon: '👂',
        activities: [
          {
            id: 'activity1-listening',
            title: '듣기 (TPR 활동)',
            content: [
              "[Now], [let's learn how to listen].",
              "[Listen to me and move your body].",
              "(표현을 말하며 동작 시범)",
              "[Great]!  [You are great listeners]!"
            ]
          }
        ]
      },
      {
        id: 'speaking',
        title: '말하기',
        icon: '🗣️',
        activities: [
          {
            id: 'activity1-speaking',
            title: '말하기 (역할 연습 - 짝 활동)',
            content: [
              "[Now], [let's learn how to speak].",
              "[Practice with your partner].",
              "[Ready]? [Start]! (연습 대기)",
              "[Now], [switch the roles].",
              "[Great]! [You are great speakers]!"
            ]
          }
        ]
      },
      {
        id: 'reading',
        title: '읽기',
        icon: '📖',
        activities: [
          {
            id: 'activity1-reading',
            title: '읽기',
            content: [
              "[Now], [let's learn how to read].",
              "[Look at the screen and read after me].",
              "(표현들을 천천히, 끊어서 읽어주기)",
              "[Great]!  [You are great readers]!"
            ]
          }
        ]
      },
      {
        id: 'writing',
        title: '쓰기',
        icon: '✏️',
        activities: [
          {
            id: 'activity1-writing',
            title: '쓰기 (Air Writing)',
            content: [
              "[Now], [let's learn how to write].",
              "[Raise your finger and do air writing].",
              "[Ready]? [Start]! (공중에 쓰는 척)",
              "[Great]!  [You are great writers]!"
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'activity2',
    title: 'Activity 2',
    content: [
      "#시작",
      "",
      "[ok], [then let's move on to second activity], [Practice Together]!",
      "[Let's do pair work].",
      "",
      "# 활동지 설명",
      "",
      "[Look at this worksheet].",
      "[There are many pictures of our daily life].",
      "[What can you see]? [Right]!",
      "",
      "#방법 안내",
      "",
      "[Listen]! [Rule is simple]."
    ],
    skillCategories: [
      {
        id: 'listening',
        title: '듣기',
        icon: '👂',
        activities: [
          {
            id: 'activity2-listening',
            title: '듣기',
            content: [
              "[First], [Listen to the dialogue].",
              "[Second], [Circle the picture]."
            ]
          }
        ]
      },
      {
        id: 'speaking',
        title: '말하기',
        icon: '🗣️',
        activities: [
          {
            id: 'activity2-speaking',
            title: '말하기',
            content: [
              "[First], [Look at the picture].",
              "[Second], [Talk to your friend]."
            ]
          }
        ]
      },
      {
        id: 'reading',
        title: '읽기',
        icon: '📖',
        activities: [
          {
            id: 'activity2-reading',
            title: '읽기',
            content: [
              "[First], [Read the sentence].",
              "[Second], [Circle the picture]."
            ]
          }
        ]
      },
      {
        id: 'writing',
        title: '쓰기',
        icon: '✏️',
        activities: [
          {
            id: 'activity2-writing',
            title: '쓰기',
            content: [
              "[First], [Look at the picture].",
              "[Second], [Fill in the blanks].",
              "(과정) [Don't worry about mistakes]. [You can fix them]."
            ]
          }
        ]
      }
    ],
    closingContent: [
      "[Any questions]? [No]?",
      "[Okay]. [Please pass it on]. (나눠주는 척)",
      "[Remember]! [Please cooperate with your partner].",
      "(홀수 고려: [You three], [work together].)",
      "",
      "#ICQ (확인 질문)",
      "",
      "[Let me check].",
      "[What is the most important thing]? [Yes], [cooperation]!",
      "[What should you do first]? (잠시 대기) [Nice understanding]!",
      "",
      "#시간",
      "",
      "[I'll give you 10 minutes].",
      "[Ready]? [Start]!",
      "",
      "(순회지도)",
      "\"[Good job]!\", \"[Oh, nice]!\", \"[Need help]?\"",
      "",
      "#마무리 + 정답 확인",
      "",
      "[Time is up]! [Let's check the answers].",
      "[Did everyone get the correct answer]?",
      "[Excellent]! [You are such good] [listeners]/[speakers]/[readers]/[writers]!",
      "[Put your worksheet in your portfolio]."
    ]
  },
  {
    id: 'activity3',
    title: 'Activity 3',
    content: [
      "#시작",
      "",
      "[Now], [it's time for third activity], [Role play].",
      "[This activity is group work], [so make 6 group of 4].",
      "",
      "#활동지 설명",
      "",
      "[Look at the worksheet]. [There are some pictures].",
      "[What can you see in these pictures]?",
      "",
      "#방법 안내",
      "",
      "[Before we start Role play], [let me explain how to Role play]."
    ],
    skillCategories: [
      {
        id: 'listening',
        title: '듣기&말하기',
        icon: '👂🗣️',
        activities: [
          {
            id: 'activity3-listening-speaking',
            title: '듣기&말하기',
            content: [
              "[First], [pick a picture].",
              "[Second], [make a dialogue with key expressions].",
              "[Third], [practice it with your partner]."
            ]
          }
        ]
      },
      {
        id: 'reading',
        title: '읽기',
        icon: '📖',
        activities: [
          {
            id: 'activity3-reading',
            title: '읽기',
            content: [
              "[First], [pick a picture].",
              "[Second], [read the dialogue aloud].",
              "[Third], [practice it with your partner]."
            ]
          }
        ]
      },
      {
        id: 'writing',
        title: '쓰기',
        icon: '✏️',
        activities: [
          {
            id: 'activity3-writing',
            title: '쓰기',
            content: [
              "[First], [pick a picture].",
              "[Second], [fill in the blanks and write the dialogue].",
              "[Third], [practice it with your partner]."
            ]
          }
        ]
      },
      {
        id: 'integrated',
        title: '통합',
        icon: '🔗',
        activities: [
          {
            id: 'activity3-integrated',
            title: '통합',
            content: [
              "[First], [pick a picture].",
              "[Second], [read the dialogue and fill in the blanks].",
              "[Third], [practice speaking with your partner]."
            ]
          }
        ]
      }
    ],
    closingContent: [
      "#ICQ",
      "",
      "[Let me check your understanding].",
      "[What should you do first]?",
      "[Is this group work or pair work]? [Right]. [It's group work].",
      "[What is the most important thing in group activity]?",
      "[Right]. [It's] ([Cooperation] / [Participation])",
      "",
      "#시간 안내",
      "",
      "[I'll give you 15 minutes].",
      "(순회지도)",
      "",
      "#마무리",
      "",
      "[Time's up]! [It's time to show your performance]."
    ]
  },
  {
    id: 'conclusion',
    title: '정리',
    content: [
      "수업정리:",
      "",
      "[Time is up]! [Let's wrap up].",
      "",
      "[What did we learn today]?",
      "",
      "[Today's English was] (주요 표현).",
      "",
      "[Now we can help Dobby]! [Good job]!",
      "",
      "자기평가:",
      "",
      "[Now, finger check time]!",
      "",
      "[One to five]. [Five is \"Great!\"], [One is \"So-so\"].",
      "",
      "[How was your work today]? [One, two, three, show me]!",
      "",
      "[Wow, many fives]! [You are stars]!",
      "",
      "과제/환류:",
      "",
      "[Here is your homework].",
      "",
      "[Use this worksheet]. [Review at home].",
      "",
      "끝:",
      "",
      "[You did a great job today].",
      "",
      "[Let's clap together]! (짝짝짝!)",
      "",
      "[See you next time]. [Bye-bye]!"
    ]
  },
  {
    id: 'interview',
    title: '면접',
    content: [
      "서론:",
      "",
      "[Nowadays], <br> (주제) [is very important in English class.]",
      "",
      "1) [It has some good points.]",
      "",
      "2) [But, it has some bad points.]",
      "",
      "[So, I will talk about] (내용).",
      "",
      "본론:",
      "",
      "[First,] . [For example,] .",
      "",
      "[Second,] . [For example,] .",
      "",
      "결론:",
      "",
      "[If a teacher uses] (내용) [well],",
      "",
      "[students can learn English better.]"
    ]
  }
];

export const POLICY_SECTIONS: SectionData[] = [
  {
    id: 'policy2026',
    title: '2026 시책',
    content: [
      "[2026 시책 내용을 여기에 입력하세요]"
    ]
  }
];

export const POLICY_DETAILS: PolicyDetailData[] = [
  {
    id: 'warm-heart',
    title: '1. 따뜻한 마음을 키워 올바른 인성을 기르겠습니다.',
    hierarchy: [
      {
        title: '인성·인문·예술교육',
        children: [
          {
            title: '[인성]・[마음]교육',
            children: [
              {
                title: '인성중심 교육과정',
                children: [
                  { title: '[인성]중심 학교교육과정 편성ㆍ운영' },
                  { title: '[1교 1브랜드] 인성교육 운영' },
                  { title: '[효의 날], [효의 달] 및 [효행교육] 프로그램 운영' }
                ]
              },
              {
                title: '마음교육',
                children: [
                  {
                    title: '[마음학기제] (초5, 중1)',
                    children: [
                      { title: '마음수업 [15]차시 + [러닝페어]' }
                    ]
                  },
                  {
                    title: '학생 [마음챙김] 프로그램 운영',
                    children: [
                      { title: '[마음챙김 명상]' },
                      { title: '[감사하기 실천]' },
                      { title: '[감정조절프로그램]' }
                    ]
                  },
                  { title: '마음교육 자료 개발 보급' }
                ]
              }
            ]
          },
          {
            title: '[독서인문]교육',
            children: [
              {
                title: '융합적 독서, 글쓰기 교육',
                children: [
                  { title: '1교과 1책읽기 ‘[수품책]’ 활동' },
                  {
                    title: '[독서토론] 동아리 활성화',
                    children: [
                      { title: '독서인문 학생 동아리, 공모형 학생 및 교직원 독서토론 동아리' }
                    ]
                  },
                  { title: '학생(교원)저자 [출판] 지원 및 [출판기념회] 운영' },
                  { title: '학생 주도 [독서캠프] 운영' }
                ]
              },
              {
                title: '인문교육',
                children: [
                  { title: '대구 [학생 책축제] 운영(10월)' },
                  {
                    title: '[인문학Eday] 운영',
                    children: [
                      { title: '[책읽기3S 운동]' },
                      { title: '[화요일의 인문학]' }
                    ]
                  },
                  { title: '‘[내 손의 책, 내 삶의 힘]’ [독서 실천 3운동] 전개' },
                  { title: '한글날 기념 한글사랑 교육활동 실천사례 공모' }
                ]
              }
            ]
          },
          {
            title: '[예술]교육',
            children: [
              {
                title: '예술교육 환경조성',
                children: [
                  { title: '[1학생 1예술활동] 운영 지원' },
                  { title: '학교문화예술교육주간 운영' },
                  {
                    title: '[대구학생예술창작터] 운영 내실화',
                    children: [
                      { title: '체험학습(초4~중2), 주말·방학프로그램(초4~고3)' }
                    ]
                  },
                  { title: '[예술·체육 교구나눔은행] 운영' }
                ]
              },
              {
                title: '학생 예술활동 지원',
                children: [
                  { title: '문화소외지역 ‘[예술숲학교]’, ‘[예술드림거점학교]’ 운영' },
                  { title: '평생친구 [1인 1악기 성취목표인증제] 운영' },
                  { title: '[1교 1예술동아리] 운영 내실화' },
                  { title: '꿈과 끼를 살리는 [학예행사] 운영' }
                ]
              },
              {
                title: '지역연계 예술교육',
                children: [
                  { title: '[토요가족 아트와락] 및 [지역주민 초청의 날] 운영' }
                ]
              }
            ]
          }
        ]
      },
      {
        title: '생활·체험교육',
        children: [
          {
            title: '관계존중교육',
            children: [
              {
                title: '[교우관계] 존중교육',
                children: [
                  { title: '교육과정 연계 [어울림 프로그램] 및 [공감 프로젝트] 확대 실시' },
                  { title: '전 학교 전문상담인력 지원' },
                  {
                    title: 'Wee 프로젝트 운영(Wee[클래스]-Wee[센터]-Wee[스쿨])',
                    children: [
                      { title: '학생 상담, 위기학생 진단-상담-치유 One-Stop서비스' }
                    ]
                  },
                  { title: '학생 [심리정서회복] [다품사업] 지원' },
                  { title: '교육청 [사이버 상담실] 운영' },
                  { title: '[또래활동] 프로그램 운영(초)' }
                ]
              },
              {
                title: '[사제관계] 존중교육',
                children: [
                  {
                    title: '[사제존중 행복시간] 운영',
                    children: [
                      { title: '연간 12회(시간) 이상 운영' },
                      { title: '사제 간 신뢰 형성 및 부적응 학생 조기 발견' }
                    ]
                  },
                  { title: '[학교 밖] 사제존중 체험활동(스포츠 관람, [사제동행 캠프])' }
                ]
              }
            ]
          },
          {
            title: '생활교육',
            children: [
              {
                title: '학생 생활교육 지원',
                children: [
                  { title: '「개별학생교육지원」 및 생활고시 관련 교육 연수 운영' },
                  { title: '[학교문화 책임규약], [사회·정서] 프로그램 운영' },
                  { title: '보금자리 안착 프로젝트 운영' },
                  { title: '사랑의 고리 맺기 운영' }
                ]
              },
              {
                title: '회복중심 생활교육',
                children: [
                  {
                    title: '(초)[관계회복지원단] 운영',
                    children: [
                      { title: '[학교로 찾아가는 대화 모임], [회복교실], [또래조정교육] 등' }
                    ]
                  }
                ]
              },
              {
                title: '상담치유 위(Wee) 센터',
                children: [
                  {
                    title: '교육지원청 위(Wee) 센터(7기관)',
                    children: [
                      { title: '학교 응급심리 지원 및 위(Wee)클래스 컨설팅, 정신건강 전문가 학교 방문 사업' }
                    ]
                  },
                  {
                    title: '병원 위(Wee) 센터(5기관)',
                    children: [
                      { title: '정신건강 위기학생 상담 및 치료비 지원, 정신건강 교육' }
                    ]
                  },
                  {
                    title: '가정형 위(Wee) 센터',
                    children: [
                      { title: '학교생활 및 가정위기 학생 대상 주거환경 제공, 교육, 상담, 돌봄' }
                    ]
                  }
                ]
              },
              {
                title: 'SW∙AI 디지털 시민윤리 교육',
                children: [
                  { title: '저작권 및 찾아가는 정보화 역기능 교육 프로그램 운영' },
                  { title: '청소년 [디지털 미디어 이용습관] [진단]조사(초6, 중2, 고2) 및 상담 지원' },
                  { title: '[디지털 시민성] 함양 [미디어 리터러시] 교육 운영' },
                  { title: '[책임감 있는 AI 활용] 교육' }
                ]
              }
            ]
          },
          {
            title: '대안교육',
            children: [
              {
                title: '맞춤형 대안교육',
                children: [
                  { title: '학교 내 [대안교실] 운영' }
                ]
              },
              {
                title: '학업중단 예방',
                children: [
                  {
                    title: '학업중단 숙려제 내실화',
                    children: [
                      { title: '위(Wee) 클래스, 위(Wee) 센터, 꿈&CUM 등' }
                    ]
                  },
                  { title: '[꿈키움멘토단] 운영' },
                  { title: '현장형 Wee Cafe「[친구랑]」, [가정]형 Wee 센터 운영' }
                ]
              },
            ]
          },
          {
            title: '자기주도 체험활동',
            children: [
              {
                title: '수련활동',
                children: [
                  {
                    title: '[대구교육팔공산수련원] 운영',
                    children: [
                      { title: '[팔공수련과정] (초6)' },
                      { title: '[리더십캠프] (초4)' }
                    ]
                  }
                ]
              },
              {
                title: '체육체험 학습장 운영',
                children: [
                  { title: '[1일 체육체험활동] 운영' },
                  {
                    title: '[가족단위 체육체험활동] 운영',
                    children: [
                      { title: '토요 및 방학 프로그램' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        title: '대구사랑·나라사랑교육',
        children: [
          {
            title: '[대구사랑]교육',
            children: [
              {
                title: '지역화 자료',
                children: [
                  { title: '「[참 좋은 우리 대구]」사회과 지역화 [교재] 활용(초4)' },
                  { title: '「[대구·경북 다시보기]」지역화 [프로그램] 운영' }
                ]
              },
              {
                title: '대구사랑 체험학습',
                children: [
                  { title: '[대구사랑 골목탐방] 체험학습 운영(초3~6)' },
                  { title: '[대구교육시티투어] 체험학습 운영' }
                ]
              },
              {
                title: '[대구교육 박물관] 운영',
                children: [
                  { title: '지역의 교육 및 역사 관련 상설·기획 전시 운영' },
                  { title: '박물관 연계 수업 및 가족대상 역사융합 프로그램 운영' }
                ]
              }
            ]
          },
          {
            title: '[나라사랑]교육',
            children: [
              {
                title: '나라사랑 체험교육',
                children: [
                  { title: '국경일 및 국가기념일 [계기교육] 실시' },
                  { title: '[나라 상징물 바로알기] 프로그램 운영' },
                  { title: '[나라사랑 청소년 충효교실] 운영 지원' }
                ]
              },
              {
                title: '[안보]·[통일] 교육',
                children: [
                  { title: '[안보]·[통일]교육 [체험] 프로그램 운영' },
                  { title: '[통일]교육 동아리 운영' }
                ]
              },
              {
                title: '[역사]·[독도] 교육',
                children: [
                  { title: '지역 연계 [역사 체험] 프로그램 운영' },
                  { title: '교사·학생 [독도 탐방] 지원' }
                ]
              }
            ]
          },
          {
            title: '[민주시민]교육',
            children: [
              {
                title: '지원체제 구축',
                children: [
                  { title: '[2.28민주운동 정신계승사업] 추진 지원' }
                ]
              },
              {
                title: '민주시민 체험교육',
                children: [
                  {
                    title: '[대구민주시민교육]센터 운영',
                    children: [
                      { title: '[체험]중심 및 [지역 연계] 민주시민교육 프로그램' }
                    ]
                  },
                  { title: '학생 [유권자] 교육 및 동아리 운영 지원' },
                  { title: '[체험] 중심의 [헌법]교육' }
                ]
              }
            ]
          }
        ]
      },
      {
        title: '글로벌 교육',
        children: [
          {
            title: '기후환경·생태전환교육',
            children: [
              {
                title: '교육과정 연계 실천중심 환경교육',
                children: [
                  { title: '[환경학습권] 보장 및 교육과정 연계 환경교육 실시' },
                  { title: '[1교 1필수·특색 환경 실천 과제] 운영' },
                  { title: '[1교 1환경·지속가능한 발전교육(ESD) 동아리] 운영' },
                  { title: '[생태나침반] 학교(유・초) 및 네트워크 운영' },
                  { title: '학교 밖 [생물다양성] 및 [생태감수성] 환경교육 프로그램 운영' }
                ]
              },
              {
                title: '학교 환경교육 활성화 지원',
                children: [
                  { title: '[기후변화환경]교육 프로그램 운영' },
                  { title: '[탄소중립]학생위원회 운영' },
                  { title: '학교 환경교육 [콜로키움] 개최' },
                  { title: '[대구녹색학습원] 운영' }
                ]
              }
            ]
          },
          {
            title: '세계시민교육',
            children: [
              {
                title: '세계시민성 함양교육',
                children: [
                  {
                    title: '[대구세계시민교육]센터 운영',
                    children: [
                      { title: '세계시민교육체험, 세계문화체험 프로그램' },
                      { title: '[가족] 단위 [세계시민성]함양 프로그램' },
                      { title: '[다다익선 세계시민] 프로젝트' }
                    ]
                  }
                ]
              },
              {
                title: '국제교류',
                children: [
                  {
                    title: '국제교류 지원시스템 운영',
                    children: [
                      { title: '국제교류 컨설팅단, 학부모 통역단, 네트워크 홈페이지' }
                    ]
                  }
                ]
              },
              {
                title: '[실용외국어] 교육',
                children: [
                  {
                    title: '학생미래역량 강화 [실용영어]교육 지원',
                    children: [
                      { title: '[인공지능(AI)] 활용 영어 학습 프로그램' },
                      { title: '체험 및 활동 중심 영어캠프' },
                      { title: '[영어온책읽기], [영어동화] 기반 [오디오북] 보급·활용 (초)' }
                    ]
                  },
                  { title: '[원어민 보조교사] 배치' },
                  { title: '[대구글로벌교육센터] 운영' }
                ]
              },
              {
                title: '교육국제화 특구',
                children: [
                  { title: '학습자 맞춤형 [외국어]교육 및 [세계시민]교육 프로그램 운영' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'learning-growth',
    title: '2. 학습역량을 높여 모두의 성장을 돕겠습니다.',
    hierarchy: [
      {
        title: '배움의 기본이 되는 교육',
        children: [
          {
            title: '기초·기본학력 지원',
            children: [
              {
                title: '맞춤형 기초·기본 학력 지원',
                children: [
                  {
                    title: '다각적인 기초학력 진단 및 체계적인 학습이력 관리',
                    children: [
                      { title: '[기초학력] [진단]검사 (초2~고2)' },
                      { title: '[책임교육학년] 학력 진단 강화 및 체계적 학습 (초[3], 중1)' },
                      { title: '[컴퓨터]기반 [맞춤형 학업성취도] [자율]평가 (초3~고2)' },
                      { title: '[학기말] [성취수준] [진단]검사 및 [개별학력 분석] 프로그램(초)' },
                      { title: '[학업문제] 및 [학생 특성] 파악 [표준화]검사(초)' },
                      { title: '[국가기초학력지원포털] 온라인 [진단]-[보정] 시스템 활용 학습이력관리 (초3~고2)' }
                    ]
                  },
                  {
                    title: '단위학교 학생 맞춤형 지원 강화',
                    children: [
                      { title: '부진 요인에 따른 [다중복합지원]' },
                      { title: '교과보충프로그램 (초등저학년:[학습도움닫기])' },
                      { title: '[1수업2교사]제' }
                    ]
                  },
                  { title: '[AI디지털교육자료] 활용 맞춤형 학력 지원' },
                  { title: '공교육 기반 [자기주도학습센터] 운영 지원' }
                ]
              },
              {
                title: '기초 문해력, 수리력 향상 지원',
                children: [
                  { title: '기초 [문해력] 및 [수리력] [진단검사 도구] 보급ㆍ활용(초)' },
                  { title: '문해력 향상 단계별 맞춤형 자료 보급․활용(초)' },
                  { title: '[문해력 돋움]학교, 문해력 교사연구회 운영(초)' },
                ]
              },
              {
                title: '두뇌기반 맞춤형 교육, 난독 및 경계선지능 학생 지원',
                children: [
                  { title: '[기초학력지원센터] 운영(시교육청1, 교육지원청5)' },
                  {
                    title: '두뇌기반 학생 맞춤형 교육 지원',
                    children: [
                      { title: '두뇌기반 [학생이해검사]' },
                      { title: '두뇌기반 [학습코칭] 및 [학습바우처] 서비스' }
                    ]
                  },
                  {
                    title: '난독학생 맞춤형 교육 지원',
                    children: [
                      { title: '난독 [진단]검사' },
                      { title: '난독[바우처] 서비스 및 난독학생 [지원단]' }
                    ]
                  },
                  {
                    title: '경계선지능학생 맞춤형 교육 지원',
                    children: [
                      { title: '경계선지능학생 전문[진단]검사' },
                      { title: '[학습코칭] 및 [학습바우처]' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            title: '인공지능(AI) 교육',
            children: [
              {
                title: '수업 활성화',
                children: [
                  { title: '대구형 인공지능 교육 [인증 프레임워크] 확산' },
                  { title: '인공지능 교육 [연구회] 운영' },
                  { title: '소프트웨어·인공지능 교육 맞춤형 [컨설팅]' },
                  { title: 'SW·AI 보조 교재 및 인공지능 교육 콘텐츠 개발·보급' }
                ]
              },
              {
                title: '학생역량 강화',
                children: [
                  { title: '[인공지능(AI) 교육] 센터 및 [디지털 문제해결] 센터 운영' },
                  { title: 'SW·AI 창의적 체험활동 운영(초·중)' },
                  { title: '주말 및 방학 중 소프트웨어 기본·심화 과정 운영(초5~고3)' },
                  { title: 'SW·AI기반 [문제 해결 프로젝트] 운영 지원(초)' },
                  { title: '[ICT활용 창의성 경진]대회 운영' }
                ]
              },
              {
                title: '교원역량 강화',
                children: [
                  { title: '[찾아가는 SW·AI] 교육역량 강화 연수 운영(초)' },
                  { title: '[마이크로러닝]형 연수 운영' },
                  { title: '[AIEDAP] 연수 운영 지원' },
                  { title: '[디지털교육연구]대회 운영' }
                ]
              }
            ]
          },
          {
            title: '메이커교육',
            children: [
              {
                title: '운영 기반 구축',
                children: [
                  { title: '[창의융합메이커]실 여건 개선 및 운영 지원' },
                  { title: '메이커 관련 기자재 안전시설 지원' },
                  {
                    title: '메이커융합교육지원단 조직 및 운영',
                    children: [
                      { title: '메이커교육 교수-학습 자료 개발' },
                      { title: '권역별 수업나눔 활성화' }
                    ]
                  },
                  { title: '[메이커교육거점]센터 운영' }
                ]
              },
              {
                title: '메이커교육 운영',
                children: [
                  { title: '진로학기(전환기) 메이커 프로그램 운영 지원' },
                  { title: '대구 [메이커페스타] [스쿨존 부스] 운영' },
                  { title: '메이커교육 우수사례 발굴 및 성과 발표회 운영' }
                ]
              }
            ]
          },
          {
            title: '창의융합교육',
            children: [
              {
                title: '융합교육(STEAM) 내실화',
                children: [
                  {
                    title: '과학·수학 등 수업 중심 융합교육(STEAM) 운영',
                    children: [
                      { title: '[지능형 과학실] 기반 학생 참여형 과학수업' },
                      { title: '지능정보기술 활용 데이터 기반 과학실험 가이드북' },
                      { title: '지역대학 연계 과학탐구 프로그램' },
                      { title: 'AI 활용 [수학점핑학교] 및 지원단' },
                      { title: 'AI디지털교육자료 활용 [지능형 수학점핑교실]' }
                    ]
                  },
                  {
                    title: '학생 중심 융합교육(STEAM) 활동 실시',
                    children: [
                      { title: '수학·과학·정보·융합 체험 프로그램' },
                      { title: '학생과학발명품경진대회, 과학전람회, 학생과학탐구올림픽대회, 청소년과학탐구대회' },
                      { title: '보고, 만지고, 탐구하는 [수학체험센터]' },
                      { title: '수학·예술 중심의 STEAM 융합 체험 공간 [아트수학관]' },
                      { title: '[STEAM+] 클럽' },
                      { title: '전국 [창의융합경진]대회(초·중)' },
                      { title: '[창의융합교육] 동아리 및 [창의융합넷]' }
                    ]
                  },
                  {
                    title: '융합교육(STEAM) 문화 확산',
                    children: [
                      { title: '학생 [과학 탐구 페스티벌]' },
                      { title: '학생 주도의 탐구·체험 중심 [대구수학페스티벌]' },
                      { title: '수학가치 인식 개선 연극(뮤지컬)' },
                      { title: '대구형 융합교육(STEAM) 탐구 학술제' },
                      { title: '대구[창의융합교육축전](수학·과학·SW·메이커·환경·직업교육 등)' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        title: '교육과정 중심 학교문화',
        children: [
          {
            title: '미래역량교육과정',
            children: [
              {
                title: '[교육과정 문해력] 강화',
                children: [
                  { title: '교육과정탐구 교원연구회 운영 지원' }
                ]
              },
              {
                title: '교육과정 편성·운영',
                children: [
                  { title: '교육과정협의회 및 소협의회 구성·운영' },
                  { title: '[대구미래역량]교육과정 발간 및 보급' },
                  { title: '학교급별 교육과정 편성·운영 자료 개발 및 보급' }
                ]
              },
              {
                title: '교육과정 컨설팅',
                children: [
                  { title: '특색 있는 학교(학년) 교육과정 편성·운영 컨설팅' },
                  { title: '교육과정 재구성 및 선행교육 예방 컨설팅' },
                  { title: '학교급별 [교육과정지원단] 운영' }
                ]
              }
            ]
          },
          {
            title: '특색 있는 교육과정',
            children: [
              {
                title: '[학년군 공동 탐구 프로젝트] (초)',
                children: [
                  { title: '학년군 상호 연계 및 협력 기반 공동 탐구프로젝트 설계와 운영' }
                ]
              },
              {
                title: '[학교자율시간]',
                children: [
                  { title: '학교자율시간 과목 개발 및 승인 지원' },
                  { title: '학교자율시간 편성·운영 지원' }
                ]
              },
              {
                title: '[학교브랜드 특화사업]',
                children: [
                  { title: '자율적 학교문화 조성 학교브랜드특화사업 운영 지원' },
                  { title: '학교브랜드특화사업 선정학교 컨설팅 및 우수사례 공유' }
                ]
              },
              {
                title: '자율과 성장의 학교평가',
                children: [
                  {
                    title: '자율적인 학교평가 문화 정착 지원',
                    children: [
                      { title: '모든 구성원이 참여하는 학교평가' },
                      { title: '[학교자체평가위원회] 구성' },
                      { title: '학교교육활동과 일체화된 평가지표 자율 설정' }
                    ]
                  },
                  {
                    title: '학교평가역량 강화',
                    children: [
                      { title: '[학교평가 자율협의체] 구성' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            title: '[국제 바칼로레아(IB)] 프로그램',
            table: {
              headers: ['핵심개념', '질문', '연결단어'],
              rows: [
                ['[형태]', '[어떻게 생겼는가?]', '[있다], [가진다], [존재한다]'],
                ['[기능]', '[어떻게 작동하는가?]', '[수행한다], [사용된다], [만든다]'],
                ['[인과]', '[왜 그런 것인가?]', '[초래한다], [일어난다], [비롯된다]'],
                ['[변화]', '[어떻게 변하는가?]', '[변화시킨다], [발전한다], [바꾼다]'],
                ['[연결성]', '[다른 것과 어떻게 연결되는가?]', '[관련된다], [영향을 준다], [상호작용한다]'],
                ['[관점]', '[여러 관점들은 무엇인가?]', '[다양한 입장이 있다], [다르다], [필요하다]'],
                ['[책임]', '[우리의 의무는 무엇인가?]', '[의무가 있다], [요구된다], [성찰한다]']
              ]
            },
            children: [
              {
                title: '탐구 사이클',
                children: [
                  { title: '[관계맺기] -> [집중하기] <br> -> [조사하기] -> [조직 및 정리하기] <br> -> [일반화하기] -> [전이하기] <br> (through [성찰하기])' }
                ]
              }
            ]
          },
          {
            title: '[대구미래학교]',
            children: [
              {
                title: '학습의 사고 과정',
                children: [
                  { title: '[읽고] -> [탐구하고] -> [공유하고] -> [적용하고] (through [성찰])' }
                ]
              }
            ]
          }
        ]
      },
      {
        title: '학생주도수업 및 평가',
        children: [
          {
            title: '수업 중심 학교문화',
            children: [
              {
                title: '교육과정 [설계·성찰 주간]',
                children: [
                  {
                    title: '학교「교수평기」설계 및 성찰 주간 운영',
                    children: [
                      { title: '학교 교육철학, 목표 등 비전 공동 수립 및 공유' },
                      { title: '학교 단위 교육과정 설계-실행-성찰 역량 강화 연수 및 워크숍' }
                    ]
                  }
                ]
              },
              {
                title: '수업몰입 여건조성',
                children: [
                  { title: '교육감 표창 통합 운영' },
                  { title: '[학교대상사업]의 지속적 정비' },
                  { title: '[공모사업 자율선택제] 운영' },
                  { title: '학교자율 현장 자문단 운영(연 2회)' },
                  { title: '[공문서 감축 모니터링단](연 2회) 및 자료검색시스템 운영(매월)' },
                  { title: '계약제 교직원 채용업무 지원 [학교인력풀센터] 운영' },
                  { title: '교직원 대상 전달회의 통합 운영' }
                ]
              }
            ]
          },
          {
            title: '탐구중심 학생주도수업',
            children: [
              {
                title: '탐구중심 학생주도수업 기반조성',
                children: [
                  {
                    title: '[교원 전문학습공동체] 운영',
                    children: [
                      { title: '교사 전문학습공동체, 학교관리자 전문학습공동체, 교원연구회' }
                    ]
                  },
                  {
                    title: '교실 동행 멘토링 운영 신설',
                    children: [
                      { title: '개념기반 탐구수업 멘토-멘티 교사연구회(초)' },
                      { title: '수업 전문성 신장 [수수친(수석교사 수업 친구)](초)' }
                    ]
                  },
                  {
                    title: '[D-블렌디드] 수업 안착',
                    children: [
                      { title: '대구 [쌤튜브(SSam-Tube)] 활용 [D-블렌디드] 자료 공유(초)' },
                      { title: 'AI·디지털 기반 [미래형 수업모델] 발굴 및 확산(초)' }
                    ]
                  }
                ]
              },
              {
                title: '[탐구중심 학생주도]수업 활성화',
                children: [
                  {
                    title: '[탐구중심 학생주도수업] 선도학교 운영(초)',
                    children: [
                      { title: '삶과 연계한 교육과정 재구성 및 학생주도수업 실천 선도- 동료 교사 간 공동 수업 연구' },
                      { title: '교내·외 수업 공개(연 3~6회)' },
                      { title: '외부수업성장지원팀 활용 수업 장학' }
                    ]
                  },
                  { title: '[질문하는 학교] 선도학교 운영(초·중)' },
                  {
                    title: '대구 [글로벌 원격협력학습] 운영 지원(초)',
                    children: [
                      { title: '[Web] 기반 [협력]수업(호주, 뉴질랜드, 대만 등)' },
                      { title: '국가 간 교사 및 학생 [협력]을 통한 [공동 탐구학습] 운영' }
                    ]
                  },
                  {
                    title: '우수 수업 실천 사례 공유 및 수업-평가 관련 연구대회 운영',
                    children: [
                      { title: '교과별 [좋은 수업] 나눔 워크숍 및 세미나' },
                      { title: '초등 [수업연구대회](개인 및 팀 영역) , 수업우수교사 및 연구교사제(초)' }
                    ]
                  },
                  {
                    title: '수석교사제 활동 지원',
                    children: [
                      { title: '수석교사 [수업·평가 나눔 한마당] 운영 및 자료집 발간' },
                      { title: '수석교사 [대외 공개수업의 날](초·중) 및 [수업 나눔 릴레이](초)' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            title: '학생평가·기록',
            children: [
              {
                title: '학생평가의 혁신적 개선',
                children: [
                  {
                    title: '교육과정 기반 수업·평가 연계 강화',
                    children: [
                      { title: '대구미래역량교육과정 기반 [수업]-[평가] 현장 안착' },
                      { title: '[수업]-[평가]-[피드백]-[성찰]의 유기적 연계' }
                    ]
                  },
                  {
                    title: '성장과 발달을 지원하는 학생 평가 내실화 지원',
                    children: [
                      { title: '[수업-평가 현장지원단]' },
                      { title: '단위학교 모니터링 및 찾아가는 [컨설팅]' },
                      { title: '학생평가도구 개발 및 사례 나눔 자료 보급' }
                    ]
                  },
                  { title: '역량 성장을 지원하는 [서·논술형 평가] 운영(초)' },
                  { title: '[평가 전문가] 양성 프로젝트 실시' }
                ]
              },
              {
                title: '배움과 성장의 기록',
                children: [
                  { title: '학생의 배움과 성장 기반 [학교생활기록부] 기록' },
                  { title: '[학교생활기록부] 점검 및 컨설팅' },
                  { title: '[학교생활기록부] 현장실무지원단 운영' }
                ]
              }
            ]
          }
        ]
      },
      {
        title: '잠재력을 꽃피우는 맞춤형 교육',
        children: [
          {
            title: '맞춤형 진로교육',
            children: [
              {
                title: '진로 탐색 및 설계',
                children: [
                  {
                    title: '학생 맞춤형 진로탐색·설계 지원',
                    children: [
                      { title: 'AI 진로탐색 및 체험 프로그램 신설' },
                      { title: '진로교육체험비(초4~고2)' },
                      { title: '진로탐색 및 진로설계 프로그램([꿈탐색동행팀])' },
                      { title: '학교급 간 진로교육활동 이력 연계 관리' }
                    ]
                  },
                  {
                    title: '진로교육 자료 제공(초): [진로비타민]',
                    children: [
                      { title: '[진로탄력성] 향상 진로교육 자료(초5~초6)' },
                      { title: '[현장체험학습] 연계 진로교육 자료(초3~초6)' }
                    ]
                  },
                  {
                    title: '진로·진학교육 활성화 지원',
                    children: [
                      { title: '신입생 학교 적응 프로그램 \'[비포스쿨]\'' }
                    ]
                  },
                  {
                    title: '[진로진학지원]센터 운영(시교육청1, 교육지원청5)',
                    children: [
                      { title: '현장 밀착형 진로·진학지원' },
                      { title: '교육기부 진로체험 인증기관' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            title: '영재교육',
            children: [
              {
                title: '맞춤형 영재교육',
                children: [
                  { title: '[영재학급] 운영(초4∼고1)' },
                  {
                    title: '[영재교육원] 운영',
                    children: [
                      { title: '수학, 과학, 정보, 발명, 문예, 외국어, 예술 분야' },
                      { title: '[영재캠프]' }
                    ]
                  },
                  { title: '[영재키움]프로젝트 운영' },
                  {
                    title: '[소외계층] 영재교육 기회 확대',
                    children: [
                      { title: '사회통합전형 우선 선발(정원의 10%)' },
                      { title: '수익자부담금 및 직접교육활동경비 지원' }
                    ]
                  }
                ]
              },
              {
                title: '영재교육 역량 강화',
                children: [
                  { title: '영재학급 컨설팅 및 지원단 운영' },
                  { title: '영재교육원 기관평가 및 컨설팅' },
                  { title: '[영재교육연구회] 운영' },
                  { title: '융합형 영재교육 프로그램 개발 및 적용' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'wider-support',
    title: '3. 더 넓고 두터운 지원으로 모두의 가능성을 열겠습니다.',
    hierarchy: [
      {
        title: '함께 가는 교육',
        children: [
          {
            title: '교육복지',
            children: [
              { title: '학기 중 평일 중식 [무상급식]' },
              { title: '[학생맞춤통합지원체계] 구축 및 [교육복지우선지원사업]' },
              { title: '1:1 맞춤형 [다품멘토링] 운영' }
            ]
          },
          {
            title: '다문화교육',
            children: [
              {
                title: '모든 학생을 위한 다문화교육',
                children: [
                  {
                    title: '교육공동체 [다문화 감수성] 함양 교육',
                    children: [
                      { title: '교육과정 연계 학교 [다문화]교육' }
                    ]
                  },
                  {
                    title: '[상호문화이해] 교육',
                    children: [
                      { title: '[이중언어교실], [이중언어말하기대회], [이중언어교재]' }
                    ]
                  }
                ]
              },
              {
                title: '[이주배경] 학생 맞춤형 교육 + 지원체제',
                children: [
                  {
                    title: '공교육 진입 및 학교 적응 지원',
                    children: [
                      { title: '학력 인정 및 학년 결정 지정교 운영, 안내 리플릿 배부' },
                      { title: '[이주배경]학생 [학교생활 적응 길라잡이] 보급' },
                      { title: '[이주배경]학생 맞춤형 통·번역 서비스, 통역 멘토링교' }
                    ]
                  },
                  {
                    title: '맞춤형 [한국어]교육 및 교과 학습 지원',
                    children: [
                      { title: '한국어 예비과정: [한국어교육]센터, 달성 한국어교육(예비과정) 거점학교' },
                      { title: '한국어학급, 한국어집중배움과정, 찾아가는 한국어교육' },
                      { title: '[이중언어] 튜터 지원' }
                    ]
                  },
                  {
                    title: '유관기관 협력 체계 구축 및 운영',
                    children: [
                      { title: '학부모-학교-교육청-지역사회 [다-잇다] 서비스' }
                    ]
                  },
                  {
                    title: '[밀집학교] 중심 네트워크 활성화'
                  }
                ]
              }
            ]
          },
          {
            title: '초등돌봄·교육([늘봄학교])',
            children: [
              { title: '기존 초등학교의 [방과후]와 [돌봄]을 통합·개선한 단일체제' },
              { title: '무상 돌봄: [초1~2] / 방과후: [놀이·체험] 중심, [특기·적성] 개발 프로그램 등' },
              { title: '확장: 지역사회와 함께하는 [온동네 초등돌봄] 도입' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'school-safety',
    title: '4. 학교의 안전을 채워 건강한 성장을 지원하겠습니다.',
    hierarchy: [
      {
        title: '자기존중 건강교육',
        children: [
          {
            title: '[보건]·[건강증진]교육',
            children: [
              {
                title: '[보건]교육',
                children: [
                  { title: '학교급별 [보건교육] 실시(1개 학년 17차시 이상)' },
                  { title: '마약류 등 [유해약물 오ㆍ남용] 예방교육 실시' },
                  { title: '[학교흡연예방]사업 추진 및 [학생금연상담]센터 위탁 운영' },
                  { title: '학생·교직원 대상 [심폐소생술] 등 [응급처치] 교육 실시' }
                ]
              },
              {
                title: '[감염병] 관리',
                children: [
                  { title: '학교 [감염병 예방]교육 및 학생ㆍ교직원 [1830] 실천' }
                ]
              },
              {
                title: '학생 [신체]건강 증진',
                children: [
                  { title: '[학생건강검사](건강조사, 건강검진) 실시' },
                  { title: '[학생건강증진]센터 및 [학생건강증진]캠프 운영' }
                ]
              },
              {
                title: '학생 [마음]건강 증진',
                children: [
                  { title: '[학생생명존중]교육 및 [마음건강증진]교육 운영' },
                  {
                    title: '[마음건강 위기학생] 조기 발견 및 지원 강화',
                    children: [
                      { title: '[학생정서·행동특성] 검사' },
                      { title: '[정신건강전문가] 학교 긴급 지원' }
                    ]
                  },
                  { title: '학생, 학부모 [인식개선]을 위한 교육프로그램 운영' },
                  { title: '관심군 및 [마음건강 위기학생] 심리 상담 및 치료비 지원' }
                ]
              }
            ]
          },
          {
            title: '[체육]교육',
            children: [
              { title: '[신체활동 7560+] 및 <br> (가정)[가족공감 1160] 실천' },
              {
                title: '[생존수영교육] 실시',
                children: [
                  { title: '실기: [3]·[4]학년' },
                  { title: '이론: [1]·[2]·[5]·[6]학년' }
                ]
              },
              { title: '[스포츠클럽] 활성화' },
              { title: '[1인 1스포츠] 활성화 <br> cf.[다:체(體)로운 우리학교 365] 프로젝트' }
            ]
          },
          {
            title: '건강한 [학교급식]',
            children: [
              { title: '[건강한 식생활 및 영양교육](연2회)' },
              { title: '[찾아가는 영양 체험관] 운영' },
              { title: '(가정) [온가족이 함께하는 영양 캠프] 운영 ' }
            ]
          }
        ]
      },
      {
        title: '미래형 교육환경',
        children: [
          {
            title: '미래형 학교공간',
            children: [
              { title: '미래교육 대비 [공간 재구조화] 사업' },
              { title: '학교공간혁신 사업: 초등 미래교실 [리노베이션]' }
            ]
          },
          {
            title: '디지털 학습환경',
            children: [
              { title: '디지털 인프라 구축: [대구교육망 고도화] 추진' },
              { title: '[지식샘터] 시스템 운영 지원' },
              { title: '대구교육포털([에듀나비]) 운영' },
              { title: '대구 [에듀테크 소프트랩] 운영' }
            ]
          },
          {
            title: '도서관 활용 서비스',
            children: [
              { title: '[지역사회] [개방형] [거점 학교도서관] 운영 <br> ex. 대구 테크노초' }
            ]
          },
          {
            title: '학교시설 융·복합화',
            children: [
              { title: '소규모학교 [적정규모화](학교 통폐합, 군위[거점]학교)' },
              { title: '지역 맞춤형 미래형 [통합학교] 모델 추진' }
            ]
          }
        ]
      },
      {
        title: '안전한 배움터',
        children: [
          {
            title: '안전교육',
            children: [
              {
                title: '맞춤형 안전체험',
                children: [
                  { title: '[교육과정] 연계 [체험]중심 안전교육 실시' }
                ]
              },
              {
                title: '교통안전',
                children: [
                  { title: '어린이[통학버스] 안전관리' },
                  { title: '교통안전 [순회교육] 운영' }
                ]
              }
            ]
          },
          {
            title: '폭력 없는 안심학교',
            children: [
              {
                title: '학교폭력 예방․대응',
                children: [
                  {
                    title: '학교폭력 최소화를 위한「[3-Step]」체제 운영',
                    children: [
                      { title: 'Step 1: [학교폭력예방] 프로그램 강화' },
                      { title: 'Step 2: 학교폭력 발생 [신속 대응]' },
                      { title: 'Step 3: 학교폭력 [피·가해학생] 지원 강화' }
                    ]
                  },
                  {
                    title: '[학생 주도] 학교폭력예방 활동 지원',
                    children: [
                      { title: '[학생언어문화개선], [또래 상담] 등 활동' },
                      { title: '[(사이버)어울림 프로그램]을 통한 학교폭력예방교육' }
                    ]
                  },
                  { title: '[학교폭력제로]센터 ([학교폭력전담조사관] 제도) 운영' }
                ]
              },
              {
                title: '성폭력 예방․대응',
                children: [
                  { title: '[성폭력 예방]교육 실시' },
                  { title: '[성인지 감수성] 함양 [양성평등]교육 실시' }
                ]
              }
            ]
          },
          {
            title: '학교 안전',
            children: [
              {
                title: '24시간 안전한 학교',
                children: [
                  { title: '학생보호자원봉사인력([학교보안관]) 운영' },
                  { title: '[안심알리미 서비스] 운영' },
                  { title: '[117] [학교폭력신고센터] 운영' },
                  { title: '범죄예방환경설계([CPTED]) 적용학교 운영' }
                ]
              },
              {
                title: '안전사고 대응체제',
                children: [
                  { title: '학교안전사고 [24시간 긴급대응체제] 운영(카카오톡 채널 dge119)' },
                  { title: '시설물 [안전점검] 실시' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'education-community',
    title: '5. 교육공동체가 힘을 모아 배움의 장을 넓히겠습니다.',
    hierarchy: [
      {
        title: '서로 존중하고 협력하는 학교문화',
        children: [
          {
            title: '존중받는 학생',
            children: [
              {
                title: '[학생 자치] 활성화',
                children: [
                  { title: '학생자치회 [자율 사업] 운영' },
                  { title: '[학생 참여 예산제] 운영' }
                ]
              },
              {
                title: '인권존중 문화 조성',
                children: [
                  {
                    title: '아동학대 안전망「[대구 아이 SAFE]」운영',
                    children: [
                      { title: '「[e아동행복지원시스템]」으로 조기 발견' },
                      { title: '학대 피해아동 학생맞춤통합 집중 지원' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            title: '존경받는 교사',
            children: [
              {
                title: '교육활동 보호',
                children: [
                  {
                    title: '교육활동 보호 시스템 구축',
                    children: [
                      { title: '[교육활동 침해행위] 예방교육 및 [교원안심번호(투넘버)] 서비스 제공' },
                      { title: '교직원 다:행복한 소통·회복 프로그램 운영 지원' }
                    ]
                  },
                  {
                    title: '교육활동 보호 역량 강화',
                    children: [
                      { title: '[교육권보호]센터 교육활동 보호 컨설팅(법률상담, 심리상담)' },
                      { title: '교직원 법률상담 지원 법무행정 홈페이지 운영' },
                      { title: '교원보호공제 법률 비용 지원 및 교원 보호 서비스 운영' },
                      { title: '전 교원 대상 교원배상 책임보험(학교안전공제회) 가입' }
                    ]
                  },
                  {
                    title: '교육활동 침해 교원 회복 지원',
                    children: [
                      { title: '교직원 [마음챙김] 프로그램 운영' }
                    ]
                  }
                ]
              },
              {
                title: '교권증진',
                children: [
                  { title: '[전보 유예] 및 [초빙제], [우수교사 학습연구년제] 운영' },
                  { title: '교육활동 우수 교원 [인센티브] 제공' },
                  { title: '교장공모제 정착 및 신임 교장·교감 멘토링제 운영' },
                  { title: '교육(지원)청 [통합민원팀] 운영' },
                  { title: '[아름다운 선생님] 발굴·홍보' }
                ]
              },
              {
                title: '교직원 문화행사',
                children: [
                  { title: '교사 음악회 및 전시회, 워크숍 등 지원' },
                  { title: '예뜨레온 전시 및 교직원 미술전시회 운영' },
                  { title: '교직원 예술·체육 활동 지원' }
                ]
              }
            ]
          },
          {
            title: '참여하는 학부모',
            children: [
              {
                title: '자녀교육 역량 강화',
                children: [
                  {
                    title: '자녀교육서 기반 [학부모 역량] 강화 교육',
                    children: [
                      { title: '기본과정 및 [마음챙김] 프로그램' },
                      { title: '[찾아가는] 학부모교육' }
                    ]
                  },
                  { title: '앎과 삶을 잇는 [학부모아카데미] 운영' },
                  { title: '맞춤 실천형 심화과정, 프로젝트형 학부모교육 운영' },
                  {
                    title: '학부모 및 [가족 상담] 프로그램 운영',
                    children: [
                      { title: '가족코칭 프로그램, 1:1 진로생활 상담' },
                      { title: '학생 성장단계별 학부모 집단상담 캠프' }
                    ]
                  },
                  { title: '학부모와 함께하는 다:행복한 체험 프로그램 운영' }
                ]
              },
              {
                title: '학부모교육 지원',
                children: [
                  { title: '[대구교육학부모]센터 운영' },
                  {
                    title: '자녀교육 원스톱 온라인서비스 강화',
                    children: [
                      { title: '빅데이터 활용 학부모교육 시스템「[모두모아]」' },
                      { title: '「대구학부모교육」유튜브 채널, 챗봇시스템' }
                    ]
                  },
                  { title: '[학부모코디네이터] 운영 지원' }
                ]
              },
              {
                title: '학부모 학교교육 참여 활성화',
                children: [
                  { title: '학(조)부모 중심 참여형 프로그램 확대' },
                  {
                    title: '「[믿어요 함께해요 우리 학교]」캠페인 운영',
                    children: [
                      { title: '시민과 함께하는 다:행복한 대구교육 공모전' }
                    ]
                  },
                  {
                    title: '함께 만드는 참여중심 학교 문화 조성',
                    children: [
                      { title: '학부모 모니터링단, 학부모 지원단' },
                      { title: '학부모 학교참여 교사지원단' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        title: '함께 만들어가는 대구교육',
        children: [
          {
            title: '지속가능한 가족공동체 형성 교육',
            children: [
              {
                title: '[저출생 대응] 교육',
                children: [
                  {
                    title: '학교급별 저출생 대응 교육 실시',
                    children: [
                      { title: '지속가능한 가족공동체 [개념기반 탐구] 프로젝트' }
                    ]
                  }
                ]
              },
              {
                title: '[가족 친화적 가치] 확산',
                children: [
                  { title: '부서(기관)별 가족 친화 프로그램 운영' }
                ]
              }
            ]
          },
          {
            title: '지자체와 함께하는 공교육 혁신',
            children: [
              {
                title: '[대구미래교육지구] 운영 (Local)',
                children: [
                  { title: '구·군청 대상 대구미래교육지구 지정 운영(9지구)' },
                  { title: '지구별 학교-교육지원청-기초지자체의 [교육거버넌스] 운영 활성화' },
                  { title: '지역과 함께하는 「다:행복한 마을 학교」운영 지원' },
                  { title: '대구미래교육지구 돌봄 사업 확대로 학교 밖 돌봄 다양화 지원' }
                ]
              },
              {
                title: '[대구교육발전특구] 운영 (Special)',
                children: [
                  {
                    title: '지자체-교육청 협력으로 우수인재 양성 및 지역 정주 체제 구축',
                    children: [
                      { title: '지역 늘봄 및 영유아교육 지원' },
                      { title: '국제인증교육과정(IB) 특구 운영' },
                      { title: '디지털교육 혁신' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            title: '사랑나눔 교육기부',
            children: [
              {
                title: '[기부문화] 조성',
                children: [
                  { title: '인문도서 기부' },
                  { title: '사랑나눔 소액 기부 문화 운동 추진' },
                  { title: '난치병 학생 의료비 지원사업 추진' },
                  { title: '1교 1기부(봉사) 동아리 지원 내실화' }
                ]
              },
              {
                title: '[나눔문화] 확산',
                children: [
                  { title: '개인·기관(단체)·지역사회 연계 교육기부 문화 조성' },
                  { title: '교육기부 유공자 발굴 및 표창, 교육기부 공모전 운영' }
                ]
              }
            ]
          },
          {
            title: '소통하는 대구교육',
            children: [
              {
                title: '함께 만드는 대구교육',
                children: [
                  { title: '교육공동체 [의견 수렴]을 통한 교육정책 수립' },
                  {
                    title: '시민 대상 미래 교육정책 공모 확대',
                    children: [
                      { title: '우수 제안 교육 [정책화]' }
                    ]
                  },
                  { title: '[주민참여예산제] 운영' }
                ]
              },
              {
                title: '미래교육 정책홍보',
                children: [
                  { title: '누리집 및 유튜브, 인스타그램, 블로그 등 [SNS] 채널 연계 운영' },
                  { title: '[대구교육기자단](학생, 시민) 및 정책홍보자문단 운영' },
                  { title: '대구미래교육뉴스, 홍보영상, 기획영상, 주간단신 등 제작' },
                  { title: '대구교육 소식지·화보·신문 발간, 카드뉴스 제작' },
                  { title: '다품캠페인 이벤트 개최, 교육청 브랜드 온·오프라인 홍보' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];


