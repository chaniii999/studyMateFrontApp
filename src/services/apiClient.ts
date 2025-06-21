import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, ApiResponse } from '../types';

// API 기본 설정
const API_BASE_URL = 'http://192.168.0.7:8080/api'; // 개발 환경
// const API_BASE_URL = 'https://your-production-api.com/api'; // 프로덕션 환경

// 토큰 저장 키
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// 메모리 기반 임시 저장소 (AsyncStorage 실패 시 사용)
class MemoryStorage {
  private storage: Map<string, string> = new Map();

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];
  private memoryStorage: MemoryStorage;
  private useMemoryStorage = false;
  private static instance: ApiClient | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.memoryStorage = new MemoryStorage();
    this.setupInterceptors();
  }

  // 싱글톤 패턴으로 인스턴스 관리
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // 메모리 저장소 초기화 (캐시 삭제용)
  static clearMemoryStorage(): void {
    if (ApiClient.instance) {
      ApiClient.instance.memoryStorage = new MemoryStorage();
      ApiClient.instance.useMemoryStorage = false;
      console.log('메모리 저장소 초기화 완료');
    }
  }

  private setupInterceptors() {
    // 요청 인터셉터 - 토큰 추가
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 - 토큰 갱신, 에러 처리
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 이미 토큰 갱신 중이면 큐에 추가
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await this.getRefreshToken();
            if (refreshToken) {
              const newTokens = await this.refreshAccessToken(refreshToken);
              await this.setTokens(newTokens.accessToken, newTokens.refreshToken);
              
              // 실패한 요청들을 재시도
              this.processQueue(null, newTokens.accessToken);
              
              // 원래 요청 재시도
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.clearTokens();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // 서버 응답이 있는 경우
      return {
        code: error.response.data?.code || 'UNKNOWN_ERROR',
        message: error.response.data?.message || error.message,
        details: error.response.data?.details,
        timestamp: new Date().toISOString(),
      };
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      return {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        timestamp: new Date().toISOString(),
      };
    } else {
      // 요청 자체에 문제가 있는 경우
      return {
        code: 'REQUEST_ERROR',
        message: error.message || '요청 처리 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 토큰 관리 메서드들
  private async getAccessToken(): Promise<string | null> {
    try {
      if (this.useMemoryStorage) {
        return await this.memoryStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      }
      
      const token = await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
      console.log('Access token 조회 성공:', token ? '토큰 존재' : '토큰 없음');
      return token;
    } catch (error) {
      console.error('Access token 조회 실패:', error);
      // AsyncStorage 오류 시 메모리 저장소로 전환
      if (!this.useMemoryStorage) {
        console.log('AsyncStorage 오류로 메모리 저장소로 전환');
        this.useMemoryStorage = true;
      }
      return await this.memoryStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      if (this.useMemoryStorage) {
        return await this.memoryStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
      }
      
      const token = await AsyncStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
      console.log('Refresh token 조회 성공:', token ? '토큰 존재' : '토큰 없음');
      return token;
    } catch (error) {
      console.error('Refresh token 조회 실패:', error);
      if (!this.useMemoryStorage) {
        console.log('AsyncStorage 오류로 메모리 저장소로 전환');
        this.useMemoryStorage = true;
      }
      return await this.memoryStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    }
  }

  private async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      if (this.useMemoryStorage) {
        await Promise.all([
          this.memoryStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
          this.memoryStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
        ]);
        console.log('토큰 저장 성공 (메모리)');
        return;
      }
      
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
      ]);
      console.log('토큰 저장 성공 (AsyncStorage)');
    } catch (error) {
      console.error('토큰 저장 실패:', error);
      // AsyncStorage 오류 시 메모리 저장소로 전환
      if (!this.useMemoryStorage) {
        console.log('AsyncStorage 오류로 메모리 저장소로 전환');
        this.useMemoryStorage = true;
        await this.setTokens(accessToken, refreshToken); // 재귀 호출
      }
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      if (this.useMemoryStorage) {
        await Promise.all([
          this.memoryStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN),
          this.memoryStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN),
        ]);
        console.log('토큰 삭제 성공 (메모리)');
        return;
      }
      
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN),
      ]);
      console.log('토큰 삭제 성공 (AsyncStorage)');
    } catch (error) {
      console.error('토큰 삭제 실패:', error);
      if (!this.useMemoryStorage) {
        console.log('AsyncStorage 오류로 메모리 저장소로 전환');
        this.useMemoryStorage = true;
        await this.clearTokens(); // 재귀 호출
      }
    }
  }

  private async refreshAccessToken(refreshToken: string) {
    const response = await this.client.post('/auth/refresh', { refreshToken });
    return response.data.data;
  }

  // 공개 메서드들
  public async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.setTokens(accessToken, refreshToken);
  }

  public async logout(): Promise<void> {
    await this.clearTokens();
  }

  public async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      // 토큰이 존재하는지만 확인 (실제 API 호출은 하지 않음)
      return !!token;
    } catch (error) {
      console.error('토큰 확인 실패:', error);
      return false;
    }
  }

  // HTTP 메서드들
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();
export { ApiClient };
export default apiClient; 