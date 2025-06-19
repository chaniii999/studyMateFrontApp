// 타이머 관련 타입 정의
export interface Timer {
  id: number;
  startTime?: string;
  endTime?: string;
  studyMinutes: number; // 공부 시간 (분)
  restMinutes: number; // 휴식 시간 (분)
  mode: string; // "25/5", "50/10" 등
  summary?: string; // AI 요약
  createdAt: string;
  updatedAt?: string;
}

// 타이머 생성 요청
export interface TimerRequest {
  studyMinutes: number; // 공부 시간 (분)
  breakMinutes: number; // 휴식 시간 (분)
  topicId?: string; // 학습 주제 ID (선택)
  timerType: 'STUDY' | 'BREAK'; // 타이머 타입
}

// 타이머 응답
export interface TimerResponse {
  success: boolean;
  message: string;
  status: 'STARTED' | 'STOPPED' | 'PAUSED';
  remainingTime: number; // 남은 시간 (초)
  timerType: 'STUDY' | 'BREAK';
  userNickname: string;
  studyMinutes: number;
  breakMinutes: number;
  cycleCount: number; // 현재 사이클 수
}

// 타이머 상태
export type TimerStatus = 'IDLE' | 'STUDY' | 'BREAK' | 'PAUSED' | 'COMPLETED';

// 타이머 모드
export type TimerMode = '25/5' | '50/10' | 'CUSTOM';

// 타이머 통계
export interface TimerStatistics {
  totalSessions: number;
  totalStudyTime: number; // 총 공부 시간 (분)
  totalRestTime: number; // 총 휴식 시간 (분)
  averageSessionLength: number; // 평균 세션 길이 (분)
  longestSession: number; // 가장 긴 세션 (분)
  currentStreak: number; // 현재 연속 학습일
  bestStreak: number; // 최고 연속 학습일
}

// 타이머 히스토리 필터
export interface TimerHistoryFilter {
  startDate?: string;
  endDate?: string;
  topicId?: string;
  mode?: string;
  limit?: number;
  offset?: number;
}

// 타이머 설정
export interface TimerSettings {
  defaultStudyMinutes: number;
  defaultBreakMinutes: number;
  defaultMode: TimerMode;
  autoStartBreak: boolean;
  autoStartNextSession: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
} 