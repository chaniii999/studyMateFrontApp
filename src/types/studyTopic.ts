// 학습 주제 관련 타입 정의
export interface StudyTopic {
  id: string;
  name: string; // 공부 제목 (예: 리액트, 영어단어)
  goal?: string; // 공부 목표
  totalStudyTime: number; // 총 공부 시간 (분)
  totalStudyCount: number; // 공부한 횟수
  strategy?: string; // 공부 전략 or 프롬프트
  summary?: string; // AI 요약
  createdAt: string;
  updatedAt: string;
}

// 학습 주제 생성 요청
export interface CreateStudyTopicRequest {
  name: string;
  goal?: string;
  strategy?: string;
}

// 학습 주제 업데이트 요청
export interface UpdateStudyTopicRequest {
  name?: string;
  goal?: string;
  strategy?: string;
}

// 학습 주제 통계
export interface StudyTopicStatistics {
  topicId: string;
  topicName: string;
  totalStudyTime: number; // 총 공부 시간 (분)
  totalStudyCount: number; // 총 공부 횟수
  averageSessionLength: number; // 평균 세션 길이 (분)
  lastStudiedAt?: string; // 마지막 공부 시간
  studyStreak: number; // 연속 공부일
  weeklyProgress: number; // 주간 진행률 (%)
  monthlyProgress: number; // 월간 진행률 (%)
}

// 학습 주제 필터
export interface StudyTopicFilter {
  search?: string; // 이름 검색
  sortBy?: 'name' | 'totalStudyTime' | 'totalStudyCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 학습 주제 목표
export interface StudyTopicGoal {
  topicId: string;
  dailyGoal?: number; // 일일 목표 시간 (분)
  weeklyGoal?: number; // 주간 목표 시간 (분)
  monthlyGoal?: number; // 월간 목표 시간 (분)
  targetDate?: string; // 목표 달성 날짜
}

// 학습 주제 AI 피드백
export interface StudyTopicFeedback {
  topicId: string;
  period: 'daily' | 'weekly' | 'monthly';
  summary: string;
  insights: string[];
  recommendations: string[];
  progressAnalysis: {
    currentProgress: number; // 현재 진행률 (%)
    goalProgress: number; // 목표 대비 진행률 (%)
    trend: 'increasing' | 'decreasing' | 'stable';
  };
} 