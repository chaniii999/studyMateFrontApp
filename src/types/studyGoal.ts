export interface StudyGoalRequest {
  title: string;
  subject: string;
  description?: string;
  color?: string;
  startDate: string; // ISO 날짜 형식
  targetDate: string; // ISO 날짜 형식
  targetHours: number;
  targetSessions?: number;
  status?: GoalStatus;
}

export interface StudyGoalResponse {
  id: number;
  title: string;
  subject: string;
  description?: string;
  color?: string;
  startDate: string;
  targetDate: string;
  targetHours: number;
  targetSessions?: number;
  status: GoalStatus;
  currentHours: number;
  currentSessions: number;
  progressRate: number;
  remainingHours: number;
  createdAt: string;
  updatedAt: string;
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED'
}

export interface StudyGoalStatistics {
  goalId: number;
  title: string;
  subject: string;
  color?: string;
  totalStudyHours: number;
  totalStudySessions: number;
  averageSessionTime: number;
  progressRate: number;
  studyHoursInPeriod: number;
  studySessionsInPeriod: number;
  dailyData: DailyStudyData[];
  weeklyData: Record<string, number>;
  monthlyData?: Record<string, number>;
}

export interface DailyStudyData {
  date: string; // ISO 날짜 형식
  studyMinutes: number;
  sessions: number;
  dayOfWeek: string;
}

// 홈 화면용 대시보드 데이터
export interface StudyGoalDashboard {
  activeGoals: StudyGoalResponse[];
  completedGoalsCount: number;
  totalStudyHours: number;
  todayStudyMinutes: number;
  weekStudyMinutes: number;
}

// 학습목표 선택용 옵션
export interface StudyGoalOption {
  id: number;
  title: string;
  subject: string;
  color?: string;
  progressRate: number;
}