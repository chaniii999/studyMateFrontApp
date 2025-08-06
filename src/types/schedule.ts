// 스케줄 관련 타입 정의

// 스케줄 상태
export enum ScheduleStatus {
  PLANNED = 'PLANNED',      // 계획됨
  IN_PROGRESS = 'IN_PROGRESS',  // 진행 중
  COMPLETED = 'COMPLETED',    // 완료됨
  CANCELLED = 'CANCELLED',    // 취소됨
  POSTPONED = 'POSTPONED'     // 연기됨
}

// 학습 주제 정보
export interface StudyTopic {
  id: string;
  name: string;
}

// 스케줄 생성/수정 요청
export interface ScheduleRequest {
  title: string;
  subtitle?: string;   // 2. 소제목 (학습 범위) 추가
  description?: string;
  color?: string;
  scheduleDate: string; // YYYY-MM-DD 형식
  startTime?: string; // HH:mm 형식
  endTime?: string; // HH:mm 형식
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrenceRule?: string;
  studyMode?: string;
  plannedStudyMinutes?: number;
  plannedBreakMinutes?: number;
  studyGoal?: string;
  difficulty?: string;
  reminderMinutes?: number;
  isReminderEnabled?: boolean;
  topicId?: number;
}

// 스케줄 응답
export interface ScheduleResponse {
  id: string;
  title: string;
  subtitle?: string;    // 2. 소제목 (학습 범위) 추가
  description?: string;
  color?: string;
  scheduleDate: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrenceRule?: string;
  studyMode?: string;
  plannedStudyMinutes?: number;
  plannedBreakMinutes?: number;
  studyGoal?: string;
  difficulty?: string;
  status: ScheduleStatus;
  completionRate: number;
  isOverdue: boolean;
  reminderMinutes?: number;
  isReminderEnabled: boolean;
  topic?: StudyTopic;
  totalStudyTime?: number; // 초 단위
  totalRestTime?: number; // 초 단위
  actualStudyMinutes?: number;
  actualRestMinutes?: number;
  aiSummary?: string;
  aiSuggestions?: string;
  createdAt: string;
  updatedAt: string;
}

// 스케줄 필터
export interface ScheduleFilter {
  startDate?: string;
  endDate?: string;
  status?: ScheduleStatus;
  topicId?: number;
}

// 캘린더 이벤트
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  color?: string;
  isAllDay: boolean;
  status: ScheduleStatus;
  schedule: ScheduleResponse;
}

// 스케줄 통계
export interface ScheduleStatistics {
  totalSchedules: number;
  completedSchedules: number;
  inProgressSchedules: number;
  overdueSchedules: number;
  averageCompletionRate: number;
  totalPlannedStudyTime: number; // 분 단위
  totalActualStudyTime: number; // 분 단위
} 