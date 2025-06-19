import { useNavigation, useRoute } from '@react-navigation/native';
import {
  MainTabParamList,
  HomeStackParamList,
  TimerStackParamList,
  TopicsStackParamList,
  StatisticsStackParamList,
  ProfileStackParamList,
  AuthStackParamList,
  RootStackParamList,
} from './types';

// 루트 네비게이션 훅
export const useRootNavigation = () => {
  return useNavigation<any>();
};

// 메인 탭 네비게이션 훅
export const useMainTabNavigation = () => {
  return useNavigation<any>();
};

// 홈 스택 네비게이션 훅
export const useHomeNavigation = () => {
  return useNavigation<any>();
};

// 타이머 스택 네비게이션 훅
export const useTimerNavigation = () => {
  return useNavigation<any>();
};

// 주제 스택 네비게이션 훅
export const useTopicsNavigation = () => {
  return useNavigation<any>();
};

// 통계 스택 네비게이션 훅
export const useStatisticsNavigation = () => {
  return useNavigation<any>();
};

// 프로필 스택 네비게이션 훅
export const useProfileNavigation = () => {
  return useNavigation<any>();
};

// 인증 스택 네비게이션 훅
export const useAuthNavigation = () => {
  return useNavigation<any>();
};

// 라우트 훅들
export const useMainTabRoute = () => {
  return useRoute<any>();
};

export const useHomeRoute = () => {
  return useRoute<any>();
};

export const useTimerRoute = () => {
  return useRoute<any>();
};

export const useTopicsRoute = () => {
  return useRoute<any>();
};

export const useStatisticsRoute = () => {
  return useRoute<any>();
};

export const useProfileRoute = () => {
  return useRoute<any>();
};

export const useAuthRoute = () => {
  return useRoute<any>();
}; 