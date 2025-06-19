import apiClient from './apiClient';
import {
  SignInRequest,
  SignUpRequest,
  TokenResponse,
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
    try {
      const response = await apiClient.post<TokenResponse>('/auth/sign-in', credentials);
      
      if (response.success && response.data) {
        // 토큰 저장
        await apiClient.setAuthTokens(response.data.accessToken, response.data.refreshToken);
        return response.data;
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