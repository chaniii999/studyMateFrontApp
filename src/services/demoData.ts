import { User, SignInRequest, SignUpRequest } from '../types/user';
import { Timer, TimerRequest, TimerResponse, TimerStatistics } from '../types/timer';
import { StudyTopic, CreateStudyTopicRequest, UpdateStudyTopicRequest } from '../types/studyTopic';
import { AIFeedback, GenerateAIFeedbackRequest } from '../types/aiFeedback';

// 데모 사용자 데이터
export const demoUsers: User[] = [
  {
    id: '1',
    email: 'demo@studymate.com',
    nickname: '데모사용자',
    age: 25,
    sex: '남성',
    totalStudyTime: 1350,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'test@studymate.com',
    nickname: '테스트사용자',
    age: 28,
    sex: '여성',
    totalStudyTime: 900,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// 데모 타이머 세션 데이터
export const demoTimerSessions: Timer[] = [
  {
    id: 1,
    studyMinutes: 25,
    restMinutes: 5,
    mode: '25/5',
    startTime: '2024-01-20T09:00:00Z',
    endTime: '2024-01-20T09:25:00Z',
    summary: 'React Native 학습 세션 완료',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:25:00Z'
  },
  {
    id: 2,
    studyMinutes: 30,
    restMinutes: 10,
    mode: '50/10',
    startTime: '2024-01-20T10:00:00Z',
    endTime: '2024-01-20T10:30:00Z',
    summary: '알고리즘 문제 풀이 세션',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 3,
    studyMinutes: 15,
    restMinutes: 3,
    mode: 'CUSTOM',
    startTime: '2024-01-20T14:00:00Z',
    endTime: undefined,
    summary: '영어 공부 세션 진행 중',
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z'
  }
];

// 데모 학습 주제 데이터
export const demoStudyTopics: StudyTopic[] = [
  {
    id: '1',
    name: 'React Native 학습',
    goal: 'React Native 앱 개발 마스터하기',
    totalStudyTime: 450,
    totalStudyCount: 18,
    strategy: '매일 25분씩 실습 위주로 학습',
    summary: 'React Native 기초를 탄탄히 다지고 있습니다',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: '알고리즘 문제 풀이',
    goal: 'LeetCode 100문제 풀이',
    totalStudyTime: 600,
    totalStudyCount: 25,
    strategy: '하루 2문제씩 꾸준히 풀기',
    summary: '알고리즘 사고력이 점진적으로 향상되고 있습니다',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '3',
    name: '영어 공부',
    goal: '토익 800점 달성',
    totalStudyTime: 300,
    totalStudyCount: 12,
    strategy: '듣기와 독해 균형있게 학습',
    summary: '영어 실력이 꾸준히 향상되고 있습니다',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '4',
    name: '운동',
    goal: '매일 30분 운동하기',
    totalStudyTime: 180,
    totalStudyCount: 6,
    strategy: '홈 트레이닝과 스트레칭',
    summary: '규칙적인 운동 습관을 만들어가고 있습니다',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// 데모 AI 피드백 데이터
export const demoAIFeedbacks: AIFeedback[] = [
  {
    id: '1',
    period: 'daily',
    summary: '오늘은 React Native 학습에 집중하셨네요! 25분간 꾸준히 학습하신 점이 인상적입니다.',
    insights: [
      'React Native 학습에 25분 집중',
      '목표 시간 달성률 100%',
      '집중도가 높은 상태 유지'
    ],
    recommendations: [
      '내일은 조금 더 긴 세션으로 도전해보세요',
      '실습 위주의 학습을 더 늘려보세요'
    ],
    createdAt: '2024-01-20T23:59:59Z',
    updatedAt: '2024-01-20T23:59:59Z'
  },
  {
    id: '2',
    period: 'weekly',
    summary: '이번 주는 알고리즘 문제 풀이에 많은 시간을 투자하셨습니다.',
    insights: [
      '알고리즘 학습에 600분 투자',
      '주간 목표 달성률 85%',
      '가장 생산적인 시간대: 오전 9-11시'
    ],
    recommendations: [
      '다음 주에는 새로운 주제도 도전해보세요',
      '복습 시간을 더 늘려보세요'
    ],
    createdAt: '2024-01-21T23:59:59Z',
    updatedAt: '2024-01-21T23:59:59Z'
  },
  {
    id: '3',
    period: 'monthly',
    summary: '1월 한 달간 정말 열심히 학습하셨습니다!',
    insights: [
      '총 1350분 학습 시간 달성',
      '다양한 분야에 균형있게 투자',
      '연속 학습일 15일 달성'
    ],
    recommendations: [
      '2월에는 더 구체적인 목표를 세워보세요',
      '학습 효율성을 높이는 방법을 찾아보세요'
    ],
    createdAt: '2024-01-31T23:59:59Z',
    updatedAt: '2024-01-31T23:59:59Z'
  }
];

// 데모 타이머 통계 데이터
export const demoTimerStats: TimerStatistics = {
  totalSessions: 15,
  totalStudyTime: 450,
  totalRestTime: 90,
  averageSessionLength: 30,
  longestSession: 60,
  currentStreak: 5,
  bestStreak: 15
};

// 데모 모드 설정
export const DEMO_MODE_CONFIG = {
  isEnabled: true,
  delay: 500, // API 응답 시뮬레이션을 위한 지연 시간 (ms)
  errorRate: 0.1, // 10% 확률로 에러 발생
  networkDelay: {
    min: 200,
    max: 800
  }
};

// 데모 모드 헬퍼 함수들
export const demoHelpers = {
  // 랜덤 지연 시간 생성
  getRandomDelay: () => {
    const { min, max } = DEMO_MODE_CONFIG.networkDelay;
    return Math.random() * (max - min) + min;
  },

  // 에러 발생 여부 확인
  shouldThrowError: () => {
    return Math.random() < DEMO_MODE_CONFIG.errorRate;
  },

  // 시뮬레이션된 API 응답
  simulateApiCall: async <T>(data: T, shouldError = false): Promise<T> => {
    const delay = demoHelpers.getRandomDelay();
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldError || demoHelpers.shouldThrowError()) {
          reject(new Error('데모 모드: 시뮬레이션된 에러'));
        } else {
          resolve(data);
        }
      }, delay);
    });
  },

  // ID 생성 (데모용)
  generateId: () => {
    return Math.floor(Math.random() * 10000) + 1000;
  },

  // 현재 시간 문자열 생성
  getCurrentTimeString: () => {
    return new Date().toISOString();
  }
}; 