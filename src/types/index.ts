// 모든 타입들을 한 곳에서 export
export * from './user';
export * from './timer';
export * from './studyTopic';
export * from './schedule';
export * from './aiFeedback';
export * from './common';
export * from './auth';
export * from './studyGoal';

// 주요 타입들을 다시 export하여 편의성 제공
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponse,
} from './user';

export type {
  SignInRequest,
  SignUpRequest,
  TokenResponse,
  LoginResponse,
  SendCodeRequest,
  VerifyCodeRequest,
  RefreshTokenRequest,
} from './auth';

export type {
  Timer,
  TimerResponse,
  TimerRequest,
  TimerStatus,
  TimerMode,
  TimerStatistics,
} from './timer';

export type {
  StudyTopic,
  CreateStudyTopicRequest,
  UpdateStudyTopicRequest,
  StudyTopicStatistics,
} from './studyTopic';

export type {
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  DailySchedule,
  WeeklySchedule,
  MonthlySchedule,
} from './schedule';

export type {
  AIFeedback,
  DailyAIFeedback,
  WeeklyAIFeedback,
  MonthlyAIFeedback,
  GenerateAIFeedbackRequest,
} from './aiFeedback';

export type {
  StudyGoalRequest,
  StudyGoalResponse,
  StudyGoalStatistics,
  StudyGoalDashboard,
  StudyGoalOption,
  DailyStudyData,
  GoalStatus,
} from './studyGoal';

export type {
  Statistics,
  AppSettings,
  ApiError,
  LoadingState,
  Period,
  Status,
  SortOrder,
  PaginationParams,
  PaginatedResponse,
  DateRange,
  FilterOptions,
  ChartData,
  Notification,
  FileUpload,
  SearchResult,
} from './common'; 