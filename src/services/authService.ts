import apiClient from './apiClient';
import { demoUtils } from '../config/demoConfig';
import { demoAuthService } from './demoService';
import {
  SignInRequest,
  SignUpRequest,
  TokenResponse,
  LoginResponse,
  SendCodeRequest,
  VerifyCodeRequest,
  RefreshTokenRequest,
  User,
  ApiResponse,
} from '../types';

class AuthService {
  /**
   * 로그인
   */
  async signIn(credentials: SignInRequest): Promise<TokenResponse> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 로그인 시뮬레이션');
      return demoAuthService.signIn(credentials);
    }

    try {
      const response = await apiClient.post<LoginResponse>('/auth/sign-in', credentials);
      
      if (response.success && response.data) {
        // 토큰 저장
        await apiClient.setAuthTokens(response.data.token.accessToken, response.data.token.refreshToken);
        
        // TokenResponse 형태로 반환 (기존 호환성 유지)
        return {
          accessToken: response.data.token.accessToken,
          refreshToken: response.data.token.refreshToken,
          tokenType: response.data.token.tokenType,
          expiresIn: response.data.token.accessTokenExpiresIn
        };
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      throw error;
    }
  }

  /**
   * 로그인 후 사용자 정보 반환 (새로운 메서드)
   */
  async signInWithUserInfo(credentials: SignInRequest): Promise<{ tokenResponse: TokenResponse; user: User }> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 로그인 시뮬레이션');
      const tokenResponse = await demoAuthService.signIn(credentials);
      const user = await demoAuthService.getCurrentUser();
      return { tokenResponse, user };
    }

    try {
      const response = await apiClient.post<LoginResponse>('/auth/sign-in', credentials);
      
      if (response.success && response.data) {
        // 토큰 저장
        await apiClient.setAuthTokens(response.data.token.accessToken, response.data.token.refreshToken);
        
        // TokenResponse 형태로 변환
        const tokenResponse: TokenResponse = {
          accessToken: response.data.token.accessToken,
          refreshToken: response.data.token.refreshToken,
          tokenType: response.data.token.tokenType,
          expiresIn: response.data.token.accessTokenExpiresIn
        };

        // User 형태로 변환
        const user: User = {
          id: response.data.userId,
          email: response.data.email,
          nickname: response.data.nickname,
          age: response.data.age,
          sex: response.data.sex,
          totalStudyTime: 0, // 백엔드에서 제공하지 않으므로 기본값
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return { tokenResponse, user };
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      throw error;
    }
  }

  /**
   * 회원가입
   */
  async signUp(userData: SignUpRequest): Promise<void> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 회원가입 시뮬레이션');
      await demoAuthService.signUp(userData);
      return;
    }

    try {
      const response = await apiClient.post('/auth/sign-up', userData);
      
      if (!response.success) {
        throw new Error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      throw error;
    }
  }

  /**
   * 이메일 인증 코드 발송
   */
  async sendVerificationCode(email: string): Promise<void> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 인증 코드 발송 시뮬레이션');
      return demoUtils.simulateApiCall(undefined);
    }

    try {
      const request: SendCodeRequest = { email };
      const response = await apiClient.post('/auth/send-code', request);
      
      if (!response.success) {
        throw new Error(response.message || '인증 코드 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('인증 코드 발송 에러:', error);
      throw error;
    }
  }

  /**
   * 이메일 인증 코드 확인
   */
  async verifyCode(email: string, code: string): Promise<void> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 인증 코드 확인 시뮬레이션');
      return demoUtils.simulateApiCall(undefined);
    }

    try {
      const request: VerifyCodeRequest = { email, code };
      const response = await apiClient.post('/auth/verify-code', request);
      
      if (!response.success) {
        throw new Error(response.message || '인증 코드 확인에 실패했습니다.');
      }
    } catch (error) {
      console.error('인증 코드 확인 에러:', error);
      throw error;
    }
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 토큰 갱신 시뮬레이션');
      return demoUtils.simulateApiCall({
        accessToken: `demo_token_${Date.now()}`,
        refreshToken: `demo_refresh_${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 3600
      });
    }

    try {
      const request: RefreshTokenRequest = { refreshToken };
      const response = await apiClient.post<TokenResponse>('/auth/refresh', request);
      
      if (response.success && response.data) {
        // 새 토큰 저장
        await apiClient.setAuthTokens(response.data.accessToken, response.data.refreshToken);
        return response.data;
      } else {
        throw new Error(response.message || '토큰 갱신에 실패했습니다.');
      }
    } catch (error) {
      console.error('토큰 갱신 에러:', error);
      throw error;
    }
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 로그아웃 시뮬레이션');
      return demoAuthService.signOut();
    }

    try {
      await apiClient.logout();
    } catch (error) {
      console.error('로그아웃 에러:', error);
      throw error;
    }
  }

  /**
   * 인증 상태 확인
   */
  async isAuthenticated(): Promise<boolean> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 인증 상태 확인 시뮬레이션');
      return demoUtils.simulateApiCall(true);
    }

    try {
      return await apiClient.isAuthenticated();
    } catch (error) {
      console.error('인증 상태 확인 에러:', error);
      return false;
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<User> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 사용자 정보 조회 시뮬레이션');
      return demoAuthService.getCurrentUser();
    }

    try {
      const response = await apiClient.get<User>('/users/me');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '사용자 정보 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser(userData: Partial<User>): Promise<User> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 사용자 정보 업데이트 시뮬레이션');
      const currentUser = await demoAuthService.getCurrentUser();
      const updatedUser = { ...currentUser, ...userData };
      return demoUtils.simulateApiCall(updatedUser);
    }

    try {
      const response = await apiClient.put<User>('/users/me', userData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '사용자 정보 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 에러:', error);
      throw error;
    }
  }

  /**
   * 비밀번호 변경 (백엔드에 해당 API가 있다면)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 비밀번호 변경 시뮬레이션');
      return demoUtils.simulateApiCall(undefined);
    }

    try {
      const response = await apiClient.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      
      if (!response.success) {
        throw new Error(response.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 변경 에러:', error);
      throw error;
    }
  }

  /**
   * 계정 삭제 (백엔드에 해당 API가 있다면)
   */
  async deleteAccount(password: string): Promise<void> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 계정 삭제 시뮬레이션');
      await demoAuthService.signOut();
      return demoUtils.simulateApiCall(undefined);
    }

    try {
      const response = await apiClient.post('/users/delete-account', { password });
      
      if (response.success) {
        await this.logout();
      } else {
        throw new Error(response.message || '계정 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('계정 삭제 에러:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const authService = new AuthService();
export default authService; 