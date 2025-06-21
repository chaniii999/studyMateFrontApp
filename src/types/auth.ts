// 로그인 요청
export interface SignInRequest {
  email: string;
  password: string;
}

// 로그인 응답 (백엔드 LoginResponseDto와 일치)
export interface LoginResponse {
  userId: string;
  email: string;
  nickname: string;
  age: number;
  sex: string;
  token: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessTokenExpiresIn: number;
  };
  message: string;
}

// 토큰 응답 (기존 호환성 유지)
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// 회원가입 요청
export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
  age: number;
  sex: '남' | '여';
}

// 이메일 인증코드 발송 요청
export interface SendCodeRequest {
  email: string;
}

// 이메일 인증코드 확인 요청
export interface VerifyCodeRequest {
  email: string;
  code: string;
}

// 토큰 갱신 요청
export interface RefreshTokenRequest {
  refreshToken: string;
} 