const QUESTIONS = [
  // ==================== 한국사 (10문제) ====================
  {
    id: 1,
    category: "한국사",
    difficulty: "easy",
    question: "조선을 건국한 왕은 누구인가?",
    options: ["이성계", "왕건", "이방원", "세종대왕"],
    correctAnswer: 0,
    explanation: "이성계는 1392년 고려를 멸망시키고 조선을 건국하였습니다."
  },
  {
    id: 2,
    category: "한국사",
    difficulty: "easy",
    question: "한글을 창제한 왕은 누구인가?",
    options: ["성종", "세조", "세종대왕", "태종"],
    correctAnswer: 2,
    explanation: "세종대왕은 1443년 훈민정음(한글)을 창제하였습니다."
  },
  {
    id: 3,
    category: "한국사",
    difficulty: "medium",
    question: "임진왜란이 발발한 연도는?",
    options: ["1492년", "1592년", "1692년", "1392년"],
    correctAnswer: 1,
    explanation: "임진왜란은 1592년 일본의 도요토미 히데요시가 조선을 침략하면서 시작되었습니다."
  },
  {
    id: 4,
    category: "한국사",
    difficulty: "medium",
    question: "거북선을 만든 장군은 누구인가?",
    options: ["권율", "이순신", "김시민", "곽재우"],
    correctAnswer: 1,
    explanation: "이순신 장군은 거북선(귀선)을 제작하여 임진왜란에서 큰 전과를 올렸습니다."
  },
  {
    id: 5,
    category: "한국사",
    difficulty: "medium",
    question: "고려를 건국한 인물은 누구인가?",
    options: ["궁예", "왕건", "견훤", "김춘추"],
    correctAnswer: 1,
    explanation: "왕건은 918년 고려를 건국하고 후삼국을 통일하였습니다."
  },
  {
    id: 6,
    category: "한국사",
    difficulty: "hard",
    question: "삼국 중 가장 먼저 불교를 수용한 나라는?",
    options: ["백제", "고구려", "신라", "가야"],
    correctAnswer: 1,
    explanation: "고구려는 소수림왕 2년(372년)에 전진으로부터 불교를 수용하였습니다."
  },
  {
    id: 7,
    category: "한국사",
    difficulty: "medium",
    question: "3·1 운동이 일어난 연도는?",
    options: ["1910년", "1919년", "1945년", "1920년"],
    correctAnswer: 1,
    explanation: "3·1 운동은 1919년 3월 1일 일제 강점기에 전국적으로 일어난 독립운동입니다."
  },
  {
    id: 8,
    category: "한국사",
    difficulty: "hard",
    question: "조선시대 과거 시험에서 최종 시험의 이름은?",
    options: ["초시", "복시", "전시", "향시"],
    correctAnswer: 2,
    explanation: "전시(殿試)는 왕이 직접 주관하는 최종 시험으로, 과거의 마지막 단계입니다."
  },
  {
    id: 9,
    category: "한국사",
    difficulty: "easy",
    question: "대한민국 임시정부가 수립된 도시는?",
    options: ["도쿄", "베이징", "상하이", "워싱턴"],
    correctAnswer: 2,
    explanation: "대한민국 임시정부는 1919년 중국 상하이에서 수립되었습니다."
  },
  {
    id: 10,
    category: "한국사",
    difficulty: "hard",
    question: "조선의 기본 법전인 '경국대전'을 완성한 왕은?",
    options: ["세조", "성종", "세종대왕", "태조"],
    correctAnswer: 1,
    explanation: "경국대전은 세조 때 편찬을 시작하여 성종 16년(1485년)에 완성·반포되었습니다."
  },
  {
    id: 41,
    category: "한국사",
    difficulty: "hard",
    question: "조선시대 붕당 정치에서, 동인이 남인과 북인으로 분열되는 계기가 된 사건은?",
    options: ["기축옥사", "무오사화", "을사사화", "임술농민봉기"],
    correctAnswer: 0,
    explanation: "1589년(선조 22년) 정여립 모반 사건을 계기로 일어난 기축옥사의 처리를 둘러싸고 동인이 강경파인 북인과 온건파인 남인으로 분열되었습니다."
  },

  // ==================== 과학 (10문제) ====================
  {
    id: 11,
    category: "과학",
    difficulty: "easy",
    question: "물의 화학식은 무엇인가?",
    options: ["CO2", "H2O", "NaCl", "O2"],
    correctAnswer: 1,
    explanation: "물의 화학식은 H2O로, 수소 원자 2개와 산소 원자 1개로 구성됩니다."
  },
  {
    id: 12,
    category: "과학",
    difficulty: "easy",
    question: "지구에서 가장 가까운 항성은?",
    options: ["북극성", "시리우스", "태양", "프록시마 센타우리"],
    correctAnswer: 2,
    explanation: "태양은 지구에서 약 1억 5천만 km 떨어진 가장 가까운 항성입니다."
  },
  {
    id: 13,
    category: "과학",
    difficulty: "medium",
    question: "인체에서 면적이 가장 큰 장기는?",
    options: ["심장", "뇌", "간", "피부"],
    correctAnswer: 3,
    explanation: "피부는 성인 기준 약 1.5~2㎡의 면적을 가진 인체에서 면적이 가장 큰 장기입니다."
  },
  {
    id: 14,
    category: "과학",
    difficulty: "medium",
    question: "진공에서 빛의 속도는 초속 약 얼마인가?",
    options: ["30만 km", "15만 km", "100만 km", "3만 km"],
    correctAnswer: 0,
    explanation: "빛의 속도는 진공에서 초속 약 299,792km(약 30만 km)이며, 매질에 따라 달라집니다."
  },
  {
    id: 15,
    category: "과학",
    difficulty: "hard",
    question: "DNA의 이중나선 구조를 발견한 과학자는?",
    options: ["다윈", "왓슨과 크릭", "멘델", "파스퇴르"],
    correctAnswer: 1,
    explanation: "제임스 왓슨과 프랜시스 크릭이 1953년 DNA의 이중나선 구조를 규명하였습니다."
  },
  {
    id: 16,
    category: "과학",
    difficulty: "medium",
    question: "원소 주기율표에서 원자번호 1번인 원소는?",
    options: ["헬륨", "산소", "수소", "탄소"],
    correctAnswer: 2,
    explanation: "수소(H)는 원자번호 1번으로 가장 가벼운 원소입니다."
  },
  {
    id: 17,
    category: "과학",
    difficulty: "hard",
    question: "절대 영도(0K)는 섭씨 몇 도인가?",
    options: ["-273.15°C", "-100°C", "0°C", "-459.67°C"],
    correctAnswer: 0,
    explanation: "절대 영도는 -273.15°C로, 이론적으로 물질의 열운동이 완전히 멈추는 온도입니다."
  },
  {
    id: 18,
    category: "과학",
    difficulty: "easy",
    question: "태양계에서 가장 큰 행성은?",
    options: ["토성", "목성", "해왕성", "천왕성"],
    correctAnswer: 1,
    explanation: "목성은 지름이 약 14만 km로 태양계에서 가장 큰 행성입니다."
  },
  {
    id: 19,
    category: "과학",
    difficulty: "medium",
    question: "광합성에서 식물이 흡수하는 기체는?",
    options: ["산소", "질소", "이산화탄소", "수소"],
    correctAnswer: 2,
    explanation: "식물은 광합성 과정에서 이산화탄소(CO2)를 흡수하고 산소(O2)를 방출합니다."
  },
  {
    id: 20,
    category: "과학",
    difficulty: "hard",
    question: "뉴턴의 운동 제2법칙을 올바르게 나타낸 것은?",
    options: ["F = ma", "E = mc²", "F = mv", "P = mv"],
    correctAnswer: 0,
    explanation: "뉴턴의 운동 제2법칙은 F = ma로, 힘은 질량과 가속도의 곱입니다."
  },

  // ==================== 지리 (10문제) ====================
  {
    id: 21,
    category: "지리",
    difficulty: "easy",
    question: "면적이 가장 큰 대륙은?",
    options: ["아프리카", "북아메리카", "아시아", "유럽"],
    correctAnswer: 2,
    explanation: "아시아는 면적 약 4,457만 km²로 세계에서 면적이 가장 큰 대륙입니다."
  },
  {
    id: 22,
    category: "지리",
    difficulty: "easy",
    question: "전통적으로 세계에서 가장 긴 강으로 알려진 것은?",
    options: ["아마존강", "나일강", "미시시피강", "양쯔강"],
    correctAnswer: 1,
    explanation: "나일강은 총 길이 약 6,650km로 전통적으로 세계에서 가장 긴 강으로 알려져 있습니다. 다만, 측정 방법에 따라 아마존강이 더 길다는 연구 결과도 있습니다."
  },
  {
    id: 23,
    category: "지리",
    difficulty: "medium",
    question: "남한에서 가장 높은 산은?",
    options: ["지리산", "설악산", "한라산", "북한산"],
    correctAnswer: 2,
    explanation: "한라산은 해발 1,947m로 남한에서 가장 높은 산입니다."
  },
  {
    id: 24,
    category: "지리",
    difficulty: "medium",
    question: "세계에서 가장 높은 산은?",
    options: ["K2", "에베레스트", "킬리만자로", "몽블랑"],
    correctAnswer: 1,
    explanation: "에베레스트산은 해발 8,849m로 세계에서 가장 높은 산입니다."
  },
  {
    id: 25,
    category: "지리",
    difficulty: "medium",
    question: "호주의 수도는 어디인가?",
    options: ["시드니", "멜버른", "캔버라", "브리즈번"],
    correctAnswer: 2,
    explanation: "호주의 수도는 캔버라입니다. 시드니와 멜버른은 가장 큰 도시이지만 수도는 아닙니다."
  },
  {
    id: 26,
    category: "지리",
    difficulty: "hard",
    question: "면적이 가장 작은 독립 국가는?",
    options: ["모나코", "바티칸 시국", "산마리노", "리히텐슈타인"],
    correctAnswer: 1,
    explanation: "바티칸 시국은 면적 약 0.44km²로 세계에서 면적이 가장 작은 독립 국가입니다."
  },
  {
    id: 27,
    category: "지리",
    difficulty: "easy",
    question: "일본의 수도는 어디인가?",
    options: ["오사카", "교토", "도쿄", "나고야"],
    correctAnswer: 2,
    explanation: "도쿄는 일본의 수도이자 세계 최대 도시권 중 하나입니다."
  },
  {
    id: 28,
    category: "지리",
    difficulty: "hard",
    question: "세계에서 가장 깊은 호수는?",
    options: ["카스피해", "바이칼호", "빅토리아호", "탕가니카호"],
    correctAnswer: 1,
    explanation: "러시아의 바이칼호는 최대 수심 1,642m로 세계에서 가장 깊은 호수입니다."
  },
  {
    id: 29,
    category: "지리",
    difficulty: "medium",
    question: "적도가 지나는 대륙이 아닌 것은?",
    options: ["아시아", "아프리카", "남아메리카", "유럽"],
    correctAnswer: 3,
    explanation: "유럽은 북반구에 위치하여 적도가 지나지 않습니다."
  },
  {
    id: 30,
    category: "지리",
    difficulty: "hard",
    question: "대한민국의 최동단 섬은?",
    options: ["울릉도", "독도", "마라도", "백령도"],
    correctAnswer: 1,
    explanation: "독도는 동경 131° 52′에 위치한 대한민국의 최동단 영토입니다."
  },
  {
    id: 42,
    category: "지리",
    difficulty: "easy",
    question: "세계에서 면적이 가장 큰 나라는?",
    options: ["캐나다", "미국", "중국", "러시아"],
    correctAnswer: 3,
    explanation: "러시아는 면적 약 1,710만 km²로 세계에서 면적이 가장 큰 나라입니다."
  },

  // ==================== 예술과 문화 (10문제) ====================
  {
    id: 31,
    category: "예술과 문화",
    difficulty: "easy",
    question: "'모나리자'를 그린 화가는 누구인가?",
    options: ["미켈란젤로", "레오나르도 다빈치", "라파엘로", "렘브란트"],
    correctAnswer: 1,
    explanation: "레오나르도 다빈치가 16세기 초에 그린 모나리자는 현재 루브르 박물관에 전시되어 있습니다."
  },
  {
    id: 32,
    category: "예술과 문화",
    difficulty: "easy",
    question: "'운명 교향곡'으로 유명한 작곡가는?",
    options: ["모차르트", "바흐", "베토벤", "쇼팽"],
    correctAnswer: 2,
    explanation: "베토벤의 교향곡 5번은 '운명 교향곡'으로 불리며, 유명한 '다다다단~' 모티프로 시작합니다."
  },
  {
    id: 33,
    category: "예술과 문화",
    difficulty: "medium",
    question: "판소리 다섯 마당에 포함되지 않는 것은?",
    options: ["춘향가", "심청가", "배비장전", "흥보가"],
    correctAnswer: 2,
    explanation: "판소리 다섯 마당은 춘향가, 심청가, 흥보가, 수궁가, 적벽가입니다."
  },
  {
    id: 34,
    category: "예술과 문화",
    difficulty: "medium",
    question: "'별이 빛나는 밤'을 그린 화가는?",
    options: ["클로드 모네", "빈센트 반 고흐", "파블로 피카소", "폴 세잔"],
    correctAnswer: 1,
    explanation: "빈센트 반 고흐가 1889년에 그린 '별이 빛나는 밤'은 후기 인상주의의 대표작입니다."
  },
  {
    id: 35,
    category: "예술과 문화",
    difficulty: "hard",
    question: "2025년 기준, 유네스코 세계유산으로 지정되지 않은 한국 문화재는?",
    options: ["종묘", "해인사 장경판전", "숭례문", "석굴암과 불국사"],
    correctAnswer: 2,
    explanation: "숭례문은 국보 제1호이지만, 2025년 현재 유네스코 세계유산 목록에는 포함되어 있지 않습니다."
  },
  {
    id: 36,
    category: "예술과 문화",
    difficulty: "medium",
    question: "셰익스피어의 4대 비극에 포함되지 않는 작품은?",
    options: ["햄릿", "맥베스", "로미오와 줄리엣", "오셀로"],
    correctAnswer: 2,
    explanation: "셰익스피어 4대 비극은 햄릿, 맥베스, 오셀로, 리어왕입니다. 로미오와 줄리엣은 비극이지만 4대 비극에는 포함되지 않습니다."
  },
  {
    id: 37,
    category: "예술과 문화",
    difficulty: "easy",
    question: "한국의 전통 탈춤에서 사용되는 탈의 종류가 아닌 것은?",
    options: ["양반탈", "각시탈", "사자탈", "용탈"],
    correctAnswer: 3,
    explanation: "전통 탈춤에서는 양반탈, 각시탈, 사자탈, 할미탈 등이 사용되며 용탈은 없습니다."
  },
  {
    id: 38,
    category: "예술과 문화",
    difficulty: "hard",
    question: "'게르니카'를 그린 화가는 누구인가?",
    options: ["살바도르 달리", "파블로 피카소", "앙리 마티스", "잭슨 폴록"],
    correctAnswer: 1,
    explanation: "피카소의 '게르니카'(1937)는 스페인 내전 중 게르니카 폭격을 고발한 반전 작품입니다."
  },
  {
    id: 39,
    category: "예술과 문화",
    difficulty: "medium",
    question: "한국 최초의 근대 장편 소설로 알려진 작품은?",
    options: ["무정", "상록수", "토지", "태백산맥"],
    correctAnswer: 0,
    explanation: "이광수의 '무정'(1917)은 한국 최초의 근대 장편 소설로 평가받고 있습니다. 신소설로는 이인직의 '혈의 누'(1906)가 더 앞섭니다."
  },
  {
    id: 40,
    category: "예술과 문화",
    difficulty: "hard",
    question: "비틀즈의 멤버가 아닌 사람은?",
    options: ["존 레논", "폴 매카트니", "믹 재거", "링고 스타"],
    correctAnswer: 2,
    explanation: "믹 재거는 롤링 스톤스의 보컬입니다. 비틀즈는 존 레논, 폴 매카트니, 조지 해리슨, 링고 스타로 구성됩니다."
  }
];

const CATEGORIES = ["한국사", "과학", "지리", "예술과 문화"];

function getQuestionsByCategory(category) {
  return QUESTIONS.filter(q => q.category === category);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
