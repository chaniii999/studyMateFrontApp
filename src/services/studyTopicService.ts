import apiClient from './apiClient';
import { demoUtils } from '../config/demoConfig';
import { demoStudyTopicService } from './demoService';
import {
  StudyTopic,
  CreateStudyTopicRequest,
  UpdateStudyTopicRequest,
  StudyTopicStatistics,
  StudyTopicFilter,
  StudyTopicGoal,
  StudyTopicFeedback,
  PaginatedResponse,
} from '../types';

class StudyTopicService {
  /**
   * 학습 주제 목록 조회
   */
  async getStudyTopics(filter?: StudyTopicFilter): Promise<PaginatedResponse<StudyTopic>> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 학습 주제 목록 조회 시뮬레이션');
      const topics = await demoStudyTopicService.getTopics();
      return demoUtils.simulateApiCall({
        content: topics,
        totalElements: topics.length,
        totalPages: 1,
        currentPage: 1,
        size: 10,
        hasNext: false,
        hasPrevious: false
      });
    }

    try {
      const params = new URLSearchParams();
      
      if (filter?.search) params.append('search', filter.search);
      if (filter?.sortBy) params.append('sortBy', filter.sortBy);
      if (filter?.sortOrder) params.append('sortOrder', filter.sortOrder);
      if (filter?.limit) params.append('limit', filter.limit.toString());
      if (filter?.offset) params.append('offset', filter.offset.toString());

      const response = await apiClient.get<PaginatedResponse<StudyTopic>>(`/topics?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 목록 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 목록 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 생성
   */
  async createStudyTopic(topicData: CreateStudyTopicRequest): Promise<StudyTopic> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 학습 주제 생성 시뮬레이션');
      return demoStudyTopicService.createTopic(topicData);
    }

    try {
      const response = await apiClient.post<StudyTopic>('/topics', topicData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 생성 에러:', error);
      throw error;
    }
  }

  /**
   * 특정 학습 주제 조회
   */
  async getStudyTopicById(topicId: string): Promise<StudyTopic> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 특정 학습 주제 조회 시뮬레이션');
      return demoStudyTopicService.getTopic(topicId);
    }

    try {
      const response = await apiClient.get<StudyTopic>(`/topics/${topicId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 업데이트
   */
  async updateStudyTopic(topicId: string, updateData: UpdateStudyTopicRequest): Promise<StudyTopic> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 학습 주제 업데이트 시뮬레이션');
      return demoStudyTopicService.updateTopic(topicId, updateData);
    }

    try {
      const response = await apiClient.put<StudyTopic>(`/topics/${topicId}`, updateData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 업데이트 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 삭제
   */
  async deleteStudyTopic(topicId: string): Promise<void> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 학습 주제 삭제 시뮬레이션');
      return demoStudyTopicService.deleteTopic(topicId);
    }

    try {
      const response = await apiClient.delete(`/topics/${topicId}`);
      
      if (!response.success) {
        throw new Error(response.message || '학습 주제 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 삭제 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 통계 조회
   */
  async getStudyTopicStatistics(topicId: string): Promise<StudyTopicStatistics> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 학습 주제 통계 조회 시뮬레이션');
      const topic = await demoStudyTopicService.getTopic(topicId);
      return demoUtils.simulateApiCall({
        topicId: topic.id,
        topicName: topic.name,
        totalStudyTime: topic.totalStudyTime,
        totalStudyCount: topic.totalStudyCount,
        averageSessionLength: topic.totalStudyTime / Math.max(topic.totalStudyCount, 1),
        lastStudiedAt: topic.updatedAt,
        studyStreak: 5,
        weeklyProgress: 75,
        monthlyProgress: 60
      });
    }

    try {
      const response = await apiClient.get<StudyTopicStatistics>(`/topics/${topicId}/statistics`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 통계 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 통계 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 모든 학습 주제 통계 조회
   */
  async getAllStudyTopicStatistics(): Promise<StudyTopicStatistics[]> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 모든 학습 주제 통계 조회 시뮬레이션');
      const topics = await demoStudyTopicService.getTopics();
      const statistics = await Promise.all(
        topics.map(topic => this.getStudyTopicStatistics(topic.id))
      );
      return demoUtils.simulateApiCall(statistics);
    }

    try {
      const response = await apiClient.get<StudyTopicStatistics[]>('/topics/statistics');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '전체 학습 주제 통계 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('전체 학습 주제 통계 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 목표 설정
   */
  async setStudyTopicGoal(topicId: string, goal: StudyTopicGoal): Promise<void> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 학습 주제 목표 설정 시뮬레이션');
      return demoUtils.simulateApiCall(undefined);
    }

    try {
      const response = await apiClient.post(`/topics/${topicId}/goals`, goal);
      
      if (!response.success) {
        throw new Error(response.message || '학습 주제 목표 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 목표 설정 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 목표 조회
   */
  async getStudyTopicGoal(topicId: string): Promise<StudyTopicGoal> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 학습 주제 목표 조회 시뮬레이션');
      return demoUtils.simulateApiCall({
        topicId,
        dailyGoal: 60,
        weeklyGoal: 300,
        monthlyGoal: 1200,
        targetDate: '2024-12-31'
      });
    }

    try {
      const response = await apiClient.get<StudyTopicGoal>(`/topics/${topicId}/goals`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 목표 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 목표 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 AI 피드백 조회
   */
  async getStudyTopicFeedback(topicId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<StudyTopicFeedback> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 학습 주제 AI 피드백 조회 시뮬레이션');
      return demoUtils.simulateApiCall({
        topicId,
        period,
        summary: `${period === 'daily' ? '오늘' : period === 'weekly' ? '이번 주' : '이번 달'} 학습 피드백`,
        insights: ['학습 시간이 증가하고 있습니다', '목표 달성률이 향상되고 있습니다'],
        recommendations: ['더 구체적인 목표를 세워보세요', '복습 시간을 늘려보세요'],
        progressAnalysis: {
          currentProgress: 75,
          goalProgress: 80,
          trend: 'increasing' as const
        }
      });
    }

    try {
      const response = await apiClient.get<StudyTopicFeedback>(`/topics/${topicId}/feedback?period=${period}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 AI 피드백 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 AI 피드백 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 AI 피드백 생성 요청
   */
  async generateStudyTopicFeedback(topicId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<StudyTopicFeedback> {
    try {
      const response = await apiClient.post<StudyTopicFeedback>(`/topics/${topicId}/feedback/generate`, { period });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 AI 피드백 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 AI 피드백 생성 에러:', error);
      throw error;
    }
  }

  /**
   * 인기 학습 주제 조회
   */
  async getPopularStudyTopics(limit: number = 10): Promise<StudyTopic[]> {
    try {
      const response = await apiClient.get<StudyTopic[]>(`/topics/popular?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '인기 학습 주제 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('인기 학습 주제 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 최근 학습 주제 조회
   */
  async getRecentStudyTopics(limit: number = 10): Promise<StudyTopic[]> {
    try {
      const response = await apiClient.get<StudyTopic[]>(`/topics/recent?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '최근 학습 주제 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('최근 학습 주제 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 검색
   */
  async searchStudyTopics(query: string, limit: number = 20): Promise<StudyTopic[]> {
    try {
      const response = await apiClient.get<StudyTopic[]>(`/topics/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 검색에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 검색 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 복사 (템플릿으로 사용)
   */
  async duplicateStudyTopic(topicId: string, newName: string): Promise<StudyTopic> {
    try {
      const response = await apiClient.post<StudyTopic>(`/topics/${topicId}/duplicate`, { name: newName });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 복사에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 복사 에러:', error);
      throw error;
    }
  }

  /**
   * 학습 주제 내보내기 (데이터 백업)
   */
  async exportStudyTopic(topicId: string): Promise<{
    topic: StudyTopic;
    statistics: StudyTopicStatistics;
    feedback: StudyTopicFeedback[];
  }> {
    try {
      const response = await apiClient.get(`/topics/${topicId}/export`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '학습 주제 내보내기에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 주제 내보내기 에러:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const studyTopicService = new StudyTopicService();
export default studyTopicService; 