import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// 타입 안전한 useDispatch와 useSelector 훅들
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 선택적 셀렉터 훅들
export const useAuth = () => useAppSelector((state) => state.auth);
export const useTimer = () => useAppSelector((state) => state.timer);
export const useTopics = () => useAppSelector((state) => state.topics);
export const useAIFeedback = () => useAppSelector((state) => state.aiFeedback);
export const useApp = () => useAppSelector((state) => state.app);

// 인증 관련 셀렉터들
export const useUser = () => useAppSelector((state) => state.auth.user);
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated);
export const useAuthLoading = () => useAppSelector((state) => state.auth.isLoading);
export const useAuthError = () => useAppSelector((state) => state.auth.error);

// 타이머 관련 셀렉터들
export const useCurrentTimer = () => useAppSelector((state) => state.timer.currentTimer);
export const useTimerHistory = () => useAppSelector((state) => state.timer.timerHistory);
export const useTimerStatistics = () => useAppSelector((state) => state.timer.statistics);
export const useTimerSettings = () => useAppSelector((state) => state.timer.settings);
export const useIsTimerRunning = () => useAppSelector((state) => state.timer.isRunning);
export const useIsTimerPaused = () => useAppSelector((state) => state.timer.isPaused);
export const useRemainingTime = () => useAppSelector((state) => state.timer.remainingTime);
export const useTotalTime = () => useAppSelector((state) => state.timer.totalTime);

// 주제 관련 셀렉터들
export const useTopicsList = () => useAppSelector((state) => state.topics.topics);
export const useCurrentTopic = () => useAppSelector((state) => state.topics.currentTopic);
export const useTopicsStatistics = () => useAppSelector((state) => state.topics.statistics);
export const useCurrentTopicFeedback = () => useAppSelector((state) => state.topics.currentFeedback);
export const useTopicsLoading = () => useAppSelector((state) => state.topics.isLoading);
export const useTopicsError = () => useAppSelector((state) => state.topics.error);

// AI 피드백 관련 셀렉터들
export const useAIFeedbacksList = () => useAppSelector((state) => state.aiFeedback.feedbacks);
export const useDailyFeedback = () => useAppSelector((state) => state.aiFeedback.dailyFeedback);
export const useWeeklyFeedback = () => useAppSelector((state) => state.aiFeedback.weeklyFeedback);
export const useMonthlyFeedback = () => useAppSelector((state) => state.aiFeedback.monthlyFeedback);
export const useCurrentAIFeedback = () => useAppSelector((state) => state.aiFeedback.currentFeedback);
export const useAIFeedbackStatistics = () => useAppSelector((state) => state.aiFeedback.statistics);
export const useAIFeedbackSettings = () => useAppSelector((state) => state.aiFeedback.settings);
export const useAIFeedbackLoading = () => useAppSelector((state) => state.aiFeedback.isLoading);
export const useAIFeedbackError = () => useAppSelector((state) => state.aiFeedback.error);

// 앱 설정 관련 셀렉터들
export const useAppSettings = () => useAppSelector((state) => state.app.settings);
export const useAppTimerSettings = () => useAppSelector((state) => state.app.settings.timer);
export const useNotificationSettings = () => useAppSelector((state) => state.app.settings.notifications);
export const usePrivacySettings = () => useAppSelector((state) => state.app.settings.privacy);
export const useNotifications = () => useAppSelector((state) => state.app.notifications);
export const useUnreadNotifications = () => useAppSelector((state) => 
  state.app.notifications.filter(n => !n.read)
);
export const useAppLoading = () => useAppSelector((state) => state.app.isLoading);
export const useAppError = () => useAppSelector((state) => state.app.error);
export const useIsOnline = () => useAppSelector((state) => state.app.isOnline);
export const useCurrentTheme = () => useAppSelector((state) => state.app.currentTheme);
export const useLanguage = () => useAppSelector((state) => state.app.language);
export const useIsFirstLaunch = () => useAppSelector((state) => state.app.isFirstLaunch);
export const useLastSyncTime = () => useAppSelector((state) => state.app.lastSyncTime);
export const usePendingActions = () => useAppSelector((state) => state.app.pendingActions); 