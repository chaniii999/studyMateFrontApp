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

// 로그인 요청
export interface SignInRequest {
  email: string;
  password: string;
}

// 회원가입 요청
export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  age?: number;
  sex: string;
}

// 토큰 응답
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// 이메일 인증 코드 요청
export interface SendCodeRequest {
  email: string;
}

// 이메일 인증 코드 확인
export interface VerifyCodeRequest {
  email: string;
  code: string;
}

// 토큰 갱신 요청
export interface RefreshTokenRequest {
  refreshToken: string;
}

// API 응답 래퍼
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
} 