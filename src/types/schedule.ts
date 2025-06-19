// 스케줄 관련 타입 정의
export interface Schedule {
  id: string;
  title?: string; // 제목
  color?: string; // 스케줄의 표시될 배경색
  description?: string; // 설명
  summary?: string; // AI 요약
  startTime?: string; // 시작 시간
  endTime?: string; // 종료 시간
  createdAt: string;
  updatedAt: string;
  topicId?: string; // 연결된 학습 주제 ID
}

// 스케줄 생성 요청
export interface CreateScheduleRequest {
  title?: string;
  color?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  topicId?: string;
}

// 스케줄 업데이트 요청
export interface UpdateScheduleRequest {
  title?: string;
  color?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  topicId?: string;
}

// 스케줄 필터
export interface ScheduleFilter {
  startDate?: string;
  endDate?: string;
  topicId?: string;
  search?: string; // 제목 검색
  limit?: number;
  offset?: number;
}

// 일일 스케줄
export interface DailySchedule {
  date: string;
  schedules: Schedule[];
  totalStudyTime: number; // 총 학습 시간 (분)
  completedSessions: number; // 완료된 세션 수
  plannedSessions: number; // 계획된 세션 수
}

// 주간 스케줄
export interface WeeklySchedule {
  weekStart: string; // 주 시작일
  weekEnd: string; // 주 종료일
  dailySchedules: DailySchedule[];
  totalStudyTime: number; // 주간 총 학습 시간 (분)
  averageDailyStudyTime: number; // 일평균 학습 시간 (분)
  completionRate: number; // 완료율 (%)
}

// 월간 스케줄
export interface MonthlySchedule {
  month: string; // YYYY-MM 형식
  weeklySchedules: WeeklySchedule[];
  totalStudyTime: number; // 월간 총 학습 시간 (분)
  totalSessions: number; // 총 세션 수
  averageDailyStudyTime: number; // 일평균 학습 시간 (분)
  mostProductiveDay: string; // 가장 생산적인 요일
  mostProductiveTime: string; // 가장 생산적인 시간대
}

// 스케줄 통계
export interface ScheduleStatistics {
  totalSchedules: number;
  completedSchedules: number;
  totalStudyTime: number; // 총 학습 시간 (분)
  averageSessionLength: number; // 평균 세션 길이 (분)
  completionRate: number; // 완료율 (%)
  currentStreak: number; // 현재 연속 학습일
  bestStreak: number; // 최고 연속 학습일
} 