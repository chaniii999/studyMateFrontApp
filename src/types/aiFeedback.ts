// AI 피드백 관련 타입 정의
export interface AIFeedback {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  summary: string; // AI 요약
  insights: string[]; // 인사이트 목록
  recommendations: string[]; // 개선 제안
  createdAt: string;
  updatedAt: string;
}

// 일간 AI 피드백
export interface DailyAIFeedback extends AIFeedback {
  period: 'daily';
  date: string;
  stats: {
    totalStudyTime: number; // 총 학습 시간 (분)
    totalSessions: number; // 총 세션 수
    averageFocusLevel: number; // 평균 집중도 (1-5)
    mostProductiveTime: string; // 가장 생산적인 시간대
    topTopics: string[]; // 가장 많이 공부한 주제들
    completionRate: number; // 완료율 (%)
  };
}

// 주간 AI 피드백
export interface WeeklyAIFeedback extends AIFeedback {
  period: 'weekly';
  weekStart: string;
  weekEnd: string;
  stats: {
    totalStudyTime: number; // 주간 총 학습 시간 (분)
    averageDailyStudyTime: number; // 일평균 학습 시간 (분)
    totalSessions: number; // 총 세션 수
    mostProductiveDay: string; // 가장 생산적인 요일
    studyStreak: number; // 연속 학습일
    goalAchievement: number; // 목표 달성률 (%)
    topTopics: string[]; // 가장 많이 공부한 주제들
  };
}

// 월간 AI 피드백
export interface MonthlyAIFeedback extends AIFeedback {
  period: 'monthly';
  month: string; // YYYY-MM 형식
  stats: {
    totalStudyTime: number; // 월간 총 학습 시간 (분)
    averageDailyStudyTime: number; // 일평균 학습 시간 (분)
    totalSessions: number; // 총 세션 수
    mostProductiveWeek: string; // 가장 생산적인 주
    studyStreak: number; // 최고 연속 학습일
    goalAchievement: number; // 목표 달성률 (%)
    topTopics: string[]; // 가장 많이 공부한 주제들
    improvementAreas: string[]; // 개선이 필요한 영역들
  };
}

// AI 피드백 생성 요청
export interface GenerateAIFeedbackRequest {
  period: 'daily' | 'weekly' | 'monthly';
  date?: string; // 일간의 경우
  weekStart?: string; // 주간의 경우
  month?: string; // 월간의 경우 (YYYY-MM)
}

// AI 피드백 필터
export interface AIFeedbackFilter {
  period?: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// AI 피드백 통계
export interface AIFeedbackStatistics {
  totalFeedbacks: number;
  averageInsightsPerFeedback: number;
  averageRecommendationsPerFeedback: number;
  mostCommonInsights: string[];
  mostCommonRecommendations: string[];
  feedbackTrend: 'improving' | 'declining' | 'stable';
}

// AI 피드백 설정
export interface AIFeedbackSettings {
  enabled: boolean;
  autoGenerate: boolean; // 자동 생성 여부
  generationSchedule: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  notificationEnabled: boolean; // 피드백 생성 시 알림
  language: 'ko' | 'en'; // 피드백 언어
} 