import apiClient from './apiClient';
import { AiFeedbackRequest, AiFeedbackResponse } from '../types/aiFeedback';

export const aiFeedbackService = {
  // 새로운 AI 피드백 생성
  async createFeedback(request: AiFeedbackRequest): Promise<AiFeedbackResponse> {
    try {
      console.log('[AI 피드백] 생성 요청 시작:', {
        timerId: request.timerId,
        studyTime: request.studyTime,
        restTime: request.restTime,
        mode: request.mode,
        전체요청: request
      });
      
      // AI 피드백 생성은 시간이 오래 걸릴 수 있음 (백엔드에서 최대 3회 재시도 포함)
      // 재시도: 1초, 2초, 3초 대기 + OpenAI API 응답 시간 고려하여 90초로 설정
      const response = await apiClient.post<AiFeedbackResponse>('/ai/feedback', request, {
        timeout: 90000 // 90초 (재시도 로직 포함)
      });
      
      console.log('[AI 피드백] 생성 응답:', {
        success: response.success,
        message: response.message,
        data: response.data,
        전체응답: response
      });
      
      if (!response.success) {
        const errorMessage = response.message || 'AI 피드백 생성에 실패했습니다.';
        console.error('[AI 피드백] 생성 실패:', errorMessage);
        throw new Error(errorMessage);
      }
      
      if (!response.data) {
        console.error('[AI 피드백] 응답 데이터 없음');
        throw new Error('AI 피드백 생성에 실패했습니다.');
      }
      
      console.log('[AI 피드백] 생성 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[AI 피드백] 생성 에러 발생:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        response: error?.response,
        request: error?.request,
        stack: error?.stack
      });
      
      // 타임아웃이나 네트워크 에러인 경우, 백엔드에서 이미 처리되었을 수 있으므로
      // 기존 피드백이 있는지 확인
      if (error?.code === 'NETWORK_ERROR' || error?.code === 'REQUEST_ERROR' || error?.message?.includes('timeout')) {
        console.log('[AI 피드백] 네트워크/타임아웃 에러 - 기존 피드백 확인 시도');
        try {
          const existingFeedback = await this.getExistingFeedback(request.timerId);
          console.log('[AI 피드백] 기존 피드백 발견:', existingFeedback);
          return existingFeedback;
        } catch (checkError) {
          console.log('[AI 피드백] 기존 피드백 없음, 원래 에러 throw');
          // 기존 피드백이 없으면 원래 에러를 throw
        }
      }
      
      throw error;
    }
  },

  // 기존 AI 피드백 조회
  async getExistingFeedback(timerId: number): Promise<AiFeedbackResponse> {
    try {
      console.log('[AI 피드백] 조회 요청:', { timerId });
      const response = await apiClient.get<AiFeedbackResponse>(`/ai/feedback/${timerId}`);
      
      console.log('[AI 피드백] 조회 응답:', {
        success: response.success,
        message: response.message,
        data: response.data
      });
      
      if (!response.success || !response.data) {
        const errorMessage = response.message || 'AI 피드백 조회에 실패했습니다.';
        console.error('[AI 피드백] 조회 실패:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[AI 피드백] 조회 에러:', {
        message: error?.message,
        code: error?.code,
        details: error?.details
      });
      throw error;
    }
  },

  // 연결 테스트
  async testConnection(): Promise<string> {
    try {
      console.log('[AI 피드백] 연결 테스트 요청');
      const response = await apiClient.get<string>('/ai/test');
      
      if (!response.success || !response.data) {
        const errorMessage = response.message || 'AI 서비스 연결 테스트에 실패했습니다.';
        console.error('[AI 피드백] 연결 테스트 실패:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('[AI 피드백] 연결 테스트 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[AI 피드백] 연결 테스트 에러:', {
        message: error?.message,
        code: error?.code
      });
      throw error;
    }
  }
}; 