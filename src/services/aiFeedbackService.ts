import apiClient from './apiClient';
import { demoUtils } from '../config/demoConfig';
import { demoAIFeedbackService } from './demoService';
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
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: AI 피드백 목록 조회 시뮬레이션');
      const feedbacks = await demoAIFeedbackService.getFeedbacks();
      return demoUtils.simulateApiCall({
        content: feedbacks,
        totalElements: feedbacks.length,
        totalPages: 1,
        currentPage: 1,
        size: 10,
        hasNext: false,
        hasPrevious: false
      });
    }

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
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 일간 AI 피드백 조회 시뮬레이션');
      return demoUtils.simulateApiCall({
        id: 'daily-1',
        period: 'daily',
        date,
        summary: '오늘은 React Native 학습에 집중하셨네요!',
        insights: ['React Native 학습에 25분 집중', '목표 시간 달성률 100%'],
        recommendations: ['내일은 더 긴 세션으로 도전해보세요'],
        createdAt: demoUtils.getCurrentTimeString(),
        updatedAt: demoUtils.getCurrentTimeString(),
        stats: {
          totalStudyTime: 150,
          totalSessions: 3,
          averageFocusLevel: 4.2,
          mostProductiveTime: '오전 9-11시',
          topTopics: ['React Native', '알고리즘'],
          completionRate: 85
        }
      });
    }

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
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 주간 AI 피드백 조회 시뮬레이션');
      return demoUtils.simulateApiCall({
        id: 'weekly-1',
        period: 'weekly',
        weekStart,
        weekEnd: '2024-01-21',
        summary: '이번 주는 알고리즘 문제 풀이에 많은 시간을 투자하셨습니다.',
        insights: ['알고리즘 학습에 600분 투자', '주간 목표 달성률 85%'],
        recommendations: ['다음 주에는 새로운 주제도 도전해보세요'],
        createdAt: demoUtils.getCurrentTimeString(),
        updatedAt: demoUtils.getCurrentTimeString(),
        stats: {
          totalStudyTime: 600,
          averageDailyStudyTime: 85,
          totalSessions: 12,
          mostProductiveDay: '수요일',
          studyStreak: 5,
          goalAchievement: 85,
          topTopics: ['알고리즘', 'React Native']
        }
      });
    }

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
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 월간 AI 피드백 조회 시뮬레이션');
      return demoUtils.simulateApiCall({
        id: 'monthly-1',
        period: 'monthly',
        month,
        summary: '1월 한 달간 정말 열심히 학습하셨습니다!',
        insights: ['총 1350분 학습 시간 달성', '다양한 분야에 균형있게 투자'],
        recommendations: ['2월에는 더 구체적인 목표를 세워보세요'],
        createdAt: demoUtils.getCurrentTimeString(),
        updatedAt: demoUtils.getCurrentTimeString(),
        stats: {
          totalStudyTime: 1350,
          averageDailyStudyTime: 45,
          totalSessions: 45,
          mostProductiveWeek: '1월 2주차',
          studyStreak: 15,
          goalAchievement: 90,
          topTopics: ['React Native', '알고리즘', '영어'],
          improvementAreas: ['복습 시간 증가', '새로운 주제 도전']
        }
      });
    }

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
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: AI 피드백 생성 시뮬레이션');
      return demoAIFeedbackService.generateFeedback(request);
    }

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
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 특정 AI 피드백 조회 시뮬레이션');
      return demoAIFeedbackService.getFeedback(feedbackId);
    }

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
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: AI 피드백 삭제 시뮬레이션');
      return demoUtils.simulateApiCall(undefined);
    }

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
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: AI 피드백 통계 조회 시뮬레이션');
      return demoUtils.simulateApiCall({
        totalFeedbacks: 15,
        averageInsightsPerFeedback: 3.2,
        averageRecommendationsPerFeedback: 2.8,
        mostCommonInsights: ['학습 시간 증가', '목표 달성률 향상'],
        mostCommonRecommendations: ['더 구체적인 목표 설정', '복습 시간 증가'],
        feedbackTrend: 'improving'
      });
    }

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
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: AI 피드백 설정 조회 시뮬레이션');
      return demoUtils.simulateApiCall({
        enabled: true,
        autoGenerate: true,
        generationSchedule: {
          daily: true,
          weekly: true,
          monthly: true
        },
        notificationEnabled: true,
        language: 'ko'
      });
    }

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
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: AI 피드백 설정 업데이트 시뮬레이션');
      const currentSettings = await this.getAIFeedbackSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      return demoUtils.simulateApiCall(updatedSettings);
    }

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