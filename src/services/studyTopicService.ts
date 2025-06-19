import apiClient from './apiClient';
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