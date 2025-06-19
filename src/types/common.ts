// 공통 타입 정의
export type Period = 'daily' | 'weekly' | 'monthly';

export type SortOrder = 'asc' | 'desc';

export type Status = 'success' | 'error' | 'loading' | 'idle';

// 페이지네이션
export interface PaginationParams {
  page?: number;
  size?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 날짜 범위
export interface DateRange {
  startDate: string;
  endDate: string;
}

// 필터 옵션
export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  dateRange?: DateRange;
  category?: string;
  status?: string;
}

// API 에러
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// 로딩 상태
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  retry?: () => void;
}

// 설정
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  notifications: {
    enabled: boolean;
    timerComplete: boolean;
    dailyReminder: boolean;
    weeklyReport: boolean;
  };
  timer: {
    defaultStudyMinutes: number;
    defaultBreakMinutes: number;
    autoStartBreak: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
  };
}

// 통계 데이터
export interface Statistics {
  totalStudyTime: number; // 총 학습 시간 (분)
  totalSessions: number; // 총 세션 수
  averageSessionLength: number; // 평균 세션 길이 (분)
  currentStreak: number; // 현재 연속 학습일
  bestStreak: number; // 최고 연속 학습일
  completionRate: number; // 완료율 (%)
  mostProductiveTime: string; // 가장 생산적인 시간대
  mostProductiveDay: string; // 가장 생산적인 요일
}

// 차트 데이터
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// 알림
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  action?: {
    type: string;
    data: any;
  };
}

// 파일 업로드
export interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// 검색 결과
export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  searchTerm: string;
  filters: FilterOptions;
}

// 유틸리티 타입들
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
}; 