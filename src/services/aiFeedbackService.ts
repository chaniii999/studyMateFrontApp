import apiClient from './apiClient';
import { AiFeedbackRequest, AiFeedbackResponse } from '../types/aiFeedback';

export const aiFeedbackService = {
  // 새로운 AI 피드백 생성
  async createFeedback(request: AiFeedbackRequest): Promise<AiFeedbackResponse> {
    try {
      // AI 피드백 생성은 시간이 오래 걸릴 수 있음 (백엔드에서 최대 3회 재시도 포함)
      // 재시도: 1초, 2초, 3초 대기 + OpenAI API 응답 시간 고려하여 90초로 설정
      const response = await apiClient.post<AiFeedbackResponse>('/ai/feedback', request, {
        timeout: 90000 // 90초 (재시도 로직 포함)
      });
      
      if (!response.success) {
        const errorMessage = response.message || 'AI 피드백 생성에 실패했습니다.';
        throw new Error(errorMessage);
      }
      
      if (!response.data) {
        throw new Error('AI 피드백 생성에 실패했습니다.');
      }
      
      return response.data;
    } catch (error: any) {
      // 타임아웃이나 네트워크 에러인 경우, 백엔드에서 이미 처리되었을 수 있으므로
      // 기존 피드백이 있는지 확인
      if (error?.code === 'NETWORK_ERROR' || error?.code === 'REQUEST_ERROR' || error?.message?.includes('timeout')) {
        try {
          const existingFeedback = await this.getExistingFeedback(request.timerId);
          return existingFeedback;
        } catch (checkError) {
          // 기존 피드백이 없으면 원래 에러를 throw
        }
      }
      
      throw error;
    }
  },

  // 기존 AI 피드백 조회
  async getExistingFeedback(timerId: number): Promise<AiFeedbackResponse> {
    try {
      const response = await apiClient.get<AiFeedbackResponse>(`/ai/feedback/${timerId}`);
      
      if (!response.success || !response.data) {
        const errorMessage = response.message || 'AI 피드백 조회에 실패했습니다.';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // 연결 테스트
  async testConnection(): Promise<string> {
    try {
      const response = await apiClient.get<string>('/ai/test');
      
      if (!response.success || !response.data) {
        const errorMessage = response.message || 'AI 서비스 연결 테스트에 실패했습니다.';
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}; 