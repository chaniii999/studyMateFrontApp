import { apiClient } from './apiClient';
import {
  StudyGoalRequest,
  StudyGoalResponse,
  StudyGoalStatistics,
  StudyGoalDashboard,
  ApiResponse,
} from '../types';

export const studyGoalService = {
  // 모든 학습목표 조회
  async getAllStudyGoals(): Promise<ApiResponse<StudyGoalResponse[]>> {
    return apiClient.get('/study-goals');
  },

  // 활성 학습목표 조회
  async getActiveStudyGoals(): Promise<ApiResponse<StudyGoalResponse[]>> {
    return apiClient.get('/study-goals/active');
  },

  // 특정 학습목표 조회
  async getStudyGoal(goalId: number): Promise<ApiResponse<StudyGoalResponse>> {
    return apiClient.get(`/study-goals/${goalId}`);
  },

  // 새로운 학습목표 생성
  async createStudyGoal(request: StudyGoalRequest): Promise<ApiResponse<StudyGoalResponse>> {
    return apiClient.post('/study-goals', request);
  },

  // 학습목표 수정
  async updateStudyGoal(goalId: number, request: StudyGoalRequest): Promise<ApiResponse<StudyGoalResponse>> {
    return apiClient.put(`/study-goals/${goalId}`, request);
  },

  // 학습목표 삭제
  async deleteStudyGoal(goalId: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/study-goals/${goalId}`);
  },

  // 학습목표별 통계 조회
  async getStudyGoalStatistics(
    goalId: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<StudyGoalStatistics>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = `/study-goals/${goalId}/statistics${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get(url);
  },

  // 홈 화면용 대시보드 데이터 조회
  async getDashboardData(): Promise<StudyGoalDashboard> {
    try {
      const activeGoalsResponse = await this.getActiveStudyGoals();
      const homeStatsResponse = await apiClient.get('/timer/home-stats');
      
      return {
        activeGoals: activeGoalsResponse.data || [],
        completedGoalsCount: 0, // TODO: 완료된 목표 수 API 추가
        totalStudyHours: 0, // TODO: 총 학습 시간 API 추가
        todayStudyMinutes: homeStatsResponse.data?.todayStudyMinutes || 0,
        weekStudyMinutes: homeStatsResponse.data?.weekStudyMinutes || 0,
      };
    } catch (error) {
      console.error('대시보드 데이터 조회 실패:', error);
      return {
        activeGoals: [],
        completedGoalsCount: 0,
        totalStudyHours: 0,
        todayStudyMinutes: 0,
        weekStudyMinutes: 0,
      };
    }
  },

  // 학습목표 선택용 옵션 조회
  async getStudyGoalOptions(): Promise<ApiResponse<StudyGoalResponse[]>> {
    return this.getActiveStudyGoals();
  },
};