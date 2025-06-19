import apiClient from './apiClient';
import {
  AIFeedback,
  DailyAIFeedback,
  WeeklyAIFeedback,
  MonthlyAIFeedback,
  GenerateAIFeedbackRequest,
  AIFeedbackFilter,
  AIFeedbackStatistics,
  AIFeedbackSettings,
  PaginatedResponse,
} from '../types';

class AIFeedbackService {
  /**
   * AI 피드백 목록 조회
   */
  async getAIFeedbacks(filter?: AIFeedbackFilter): Promise<PaginatedResponse<AIFeedback>> {
    try {
      const params = new URLSearchParams();
      
      if (filter?.period) params.append('period', filter.period);
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.limit) params.append('limit', filter.limit.toString());
      if (filter?.offset) params.append('offset', filter.offset.toString());

      const response = await apiClient.get<PaginatedResponse<AIFeedback>>(`/feedback?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'AI 피드백 목록 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 목록 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 일간 AI 피드백 조회
   */
  async getDailyFeedback(date: string): Promise<DailyAIFeedback> {
    try {
      const response = await apiClient.get<DailyAIFeedback>(`/feedback/daily?date=${date}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '일간 AI 피드백 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('일간 AI 피드백 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 주간 AI 피드백 조회
   */
  async getWeeklyFeedback(weekStart: string): Promise<WeeklyAIFeedback> {
    try {
      const response = await apiClient.get<WeeklyAIFeedback>(`/feedback/weekly?weekStart=${weekStart}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '주간 AI 피드백 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('주간 AI 피드백 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 월간 AI 피드백 조회
   */
  async getMonthlyFeedback(month: string): Promise<MonthlyAIFeedback> {
    try {
      const response = await apiClient.get<MonthlyAIFeedback>(`/feedback/monthly?month=${month}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '월간 AI 피드백 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('월간 AI 피드백 조회 에러:', error);
      throw error;
    }
  }

  /**
   * AI 피드백 생성 요청
   */
  async generateAIFeedback(request: GenerateAIFeedbackRequest): Promise<AIFeedback> {
    try {
      const response = await apiClient.post<AIFeedback>('/feedback/generate', request);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'AI 피드백 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 생성 에러:', error);
      throw error;
    }
  }

  /**
   * 특정 AI 피드백 조회
   */
  async getAIFeedbackById(feedbackId: string): Promise<AIFeedback> {
    try {
      const response = await apiClient.get<AIFeedback>(`/feedback/${feedbackId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'AI 피드백 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 조회 에러:', error);
      throw error;
    }
  }

  /**
   * AI 피드백 삭제
   */
  async deleteAIFeedback(feedbackId: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/feedback/${feedbackId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'AI 피드백 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 삭제 에러:', error);
      throw error;
    }
  }

  /**
   * AI 피드백 통계 조회
   */
  async getAIFeedbackStatistics(): Promise<AIFeedbackStatistics> {
    try {
      const response = await apiClient.get<AIFeedbackStatistics>('/feedback/statistics');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'AI 피드백 통계 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 통계 조회 에러:', error);
      throw error;
    }
  }

  /**
   * AI 피드백 설정 조회
   */
  async getAIFeedbackSettings(): Promise<AIFeedbackSettings> {
    try {
      const response = await apiClient.get<AIFeedbackSettings>('/feedback/settings');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'AI 피드백 설정 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 설정 조회 에러:', error);
      throw error;
    }
  }

  /**
   * AI 피드백 설정 업데이트
   */
  async updateAIFeedbackSettings(settings: Partial<AIFeedbackSettings>): Promise<AIFeedbackSettings> {
    try {
      const response = await apiClient.put<AIFeedbackSettings>('/feedback/settings', settings);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'AI 피드백 설정 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 설정 업데이트 에러:', error);
      throw error;
    }
  }

  /**
   * 최근 AI 피드백 조회
   */
  async getRecentAIFeedbacks(limit: number = 5): Promise<AIFeedback[]> {
    try {
      const response = await apiClient.get<AIFeedback[]>(`/feedback/recent?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '최근 AI 피드백 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('최근 AI 피드백 조회 에러:', error);
      throw error;
    }
  }

  /**
   * AI 피드백 요약 (모든 피드백의 핵심 내용)
   */
  async getAIFeedbackSummary(dateRange?: { startDate: string; endDate: string }): Promise<{
    totalFeedbacks: number;
    keyInsights: string[];
    commonRecommendations: string[];
    improvementTrend: 'positive' | 'negative' | 'neutral';
    period: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

      const response = await apiClient.get(`/feedback/summary?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'AI 피드백 요약 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 요약 조회 에러:', error);
      throw error;
    }
  }

  /**
   * AI 피드백 공유 (다른 사용자와 공유)
   */
  async shareAIFeedback(feedbackId: string, shareWith: string[]): Promise<void> {
    try {
      const response = await apiClient.post(`/feedback/${feedbackId}/share`, { shareWith });
      
      if (!response.success) {
        throw new Error(response.message || 'AI 피드백 공유에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 공유 에러:', error);
      throw error;
    }
  }

  /**
   * 공유된 AI 피드백 조회
   */
  async getSharedAIFeedbacks(): Promise<AIFeedback[]> {
    try {
      const response = await apiClient.get<AIFeedback[]>('/feedback/shared');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '공유된 AI 피드백 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('공유된 AI 피드백 조회 에러:', error);
      throw error;
    }
  }

  /**
   * AI 피드백 내보내기 (PDF, 이미지 등)
   */
  async exportAIFeedback(feedbackId: string, format: 'pdf' | 'image' | 'json'): Promise<{
    url: string;
    expiresAt: string;
  }> {
    try {
      const response = await apiClient.post(`/feedback/${feedbackId}/export`, { format });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'AI 피드백 내보내기에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 내보내기 에러:', error);
      throw error;
    }
  }

  /**
   * AI 피드백 피드백 (사용자가 AI 피드백에 대한 평가)
   */
  async rateAIFeedback(feedbackId: string, rating: number, comment?: string): Promise<void> {
    try {
      const response = await apiClient.post(`/feedback/${feedbackId}/rate`, { rating, comment });
      
      if (!response.success) {
        throw new Error(response.message || 'AI 피드백 평가에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 피드백 평가 에러:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const aiFeedbackService = new AIFeedbackService();
export default aiFeedbackService; 