import { NavigatorScreenParams } from '@react-navigation/native';

// 메인 탭 네비게이션 파라미터
export type MainTabParamList = {
  Home: undefined;
  Timer: NavigatorScreenParams<TimerStackParamList>;
  Schedule: undefined;
  Statistics: undefined;
  Profile: undefined;
};

// 홈 스택 네비게이션 파라미터
export type HomeStackParamList = {
  HomeScreen: undefined;
  Dashboard: undefined;
  QuickStart: undefined;
  Notifications: undefined;
};

// 타이머 스택 네비게이션 파라미터
export type TimerStackParamList = {
  TimerScreen: { autoStart?: boolean } | undefined;
  TimerSettings: undefined;
  TimerHistory: undefined;
  FocusLevel: { timerId: number };
  SessionComplete: { timerId: number; studyTime: number };
};

// 스케쥴 스택 네비게이션 파라미터 (새로 추가)
export type ScheduleStackParamList = {
  ScheduleScreen: undefined;
  // 추후 스케쥴 관련 다른 화면 추가 가능
};

// 통계 스택 네비게이션 파라미터
export type StatisticsStackParamList = {
  StatisticsOverview: undefined;
  DailyStats: { date: string };
  WeeklyStats: { weekStart: string };
  MonthlyStats: { month: string };
  AIFeedback: { period: 'daily' | 'weekly' | 'monthly' };
  FeedbackDetail: { feedbackId: string };
};

// 프로필 스택 네비게이션 파라미터
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Privacy: undefined;
  About: undefined;
  Help: undefined;
};

// 인증 스택 네비게이션 파라미터
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  EmailVerification: { email: string };
};

// 루트 네비게이션 파라미터
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Modal: {
    type: 'timer' | 'feedback' | 'settings';
    data?: any;
  };
};

// 네비게이션 프로퍼티 타입
export type NavigationProps<T extends keyof any> = {
  navigation: any;
  route: {
    params: T;
  };
}; 