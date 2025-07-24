import apiClient from './apiClient';
import { AiFeedbackRequest, AiFeedbackResponse } from '../types/aiFeedback';

export const aiFeedbackService = {
  // 새로운 AI 피드백 생성
  async createFeedback(request: AiFeedbackRequest): Promise<AiFeedbackResponse> {
    const response = await apiClient.post<AiFeedbackResponse>('/ai/feedback', request);
    if (!response.data) {
      throw new Error('AI 피드백 생성에 실패했습니다.');
    }
    return response.data;
  },

  // 기존 AI 피드백 조회
  async getExistingFeedback(timerId: number): Promise<AiFeedbackResponse> {
    const response = await apiClient.get<AiFeedbackResponse>(`/ai/feedback/${timerId}`);
    if (!response.data) {
      throw new Error('AI 피드백 조회에 실패했습니다.');
    }
    return response.data;
  },

  // 연결 테스트
  async testConnection(): Promise<string> {
    const response = await apiClient.get<string>('/ai/test');
    if (!response.data) {
      throw new Error('AI 서비스 연결 테스트에 실패했습니다.');
    }
    return response.data;
  }
}; 