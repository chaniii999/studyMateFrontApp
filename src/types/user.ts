// 사용자 관련 타입 정의
export interface User {
  id: string;
  email: string;
  nickname: string;
  age?: number;
  sex: string;
  totalStudyTime: number; // 총 학습 시간 (분)
  createdAt: string;
  updatedAt: string;
}

// 사용자 생성 요청
export interface CreateUserRequest {
  email: string;
  password: string;
  nickname: string;
  age?: number;
  sex: string;
}

// 사용자 업데이트 요청
export interface UpdateUserRequest {
  nickname?: string;
  age?: number;
  sex?: string;
}

// API 응답 래퍼
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
} 