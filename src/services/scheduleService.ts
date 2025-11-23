import apiClient from './apiClient';
import { ScheduleRequest, ScheduleResponse, ScheduleFilter, ScheduleStatus } from '../types/schedule';

export const scheduleService = {
  // === CRUD 작업 ===

  // 스케줄 생성
  async createSchedule(request: ScheduleRequest): Promise<ScheduleResponse> {
    const response = await apiClient.post<ScheduleResponse>('/schedule', request);
    if (!response.data) {
      throw new Error('스케줄 생성에 실패했습니다.');
    }
    return response.data;
  },

  // 스케줄 조회 (단일)
  async getSchedule(scheduleId: string): Promise<ScheduleResponse> {
    const response = await apiClient.get<ScheduleResponse>(`/schedule/${scheduleId}`);
    if (!response.data) {
      throw new Error('스케줄 조회에 실패했습니다.');
    }
    return response.data;
  },

  // 스케줄 수정
  async updateSchedule(scheduleId: string, request: ScheduleRequest): Promise<ScheduleResponse> {
    const response = await apiClient.put<ScheduleResponse>(`/schedule/${scheduleId}`, request);
    if (!response.data) {
      throw new Error('스케줄 수정에 실패했습니다.');
    }
    return response.data;
  },

  // 스케줄 삭제
  async deleteSchedule(scheduleId: string): Promise<void> {
    await apiClient.delete(`/schedule/${scheduleId}`);
  },

  // === 조회 작업 ===

  // 사용자의 모든 스케줄 조회
  async getAllSchedules(): Promise<ScheduleResponse[]> {
    const response = await apiClient.get<ScheduleResponse[]>('/schedule');
    if (!response.data) {
      throw new Error('스케줄 목록 조회에 실패했습니다.');
    }
    return response.data;
  },

  // 특정 날짜 범위 스케줄 조회
  async getSchedulesByDateRange(startDate: string, endDate: string): Promise<ScheduleResponse[]> {
    const response = await apiClient.get<ScheduleResponse[]>(`/schedule/range?startDate=${startDate}&endDate=${endDate}`);
    if (!response.data) {
      throw new Error('날짜 범위 스케줄 조회에 실패했습니다.');
    }
    return response.data;
  },

  // 특정 날짜 스케줄 조회
  async getSchedulesByDate(date: string): Promise<ScheduleResponse[]> {
    const response = await apiClient.get<ScheduleResponse[]>(`/schedule/date/${date}`);
    if (!response.data) {
      throw new Error('특정 날짜 스케줄 조회에 실패했습니다.');
    }
    return response.data;
  },

  // 오늘의 스케줄 조회
  async getTodaySchedules(): Promise<ScheduleResponse[]> {
    const response = await apiClient.get<ScheduleResponse[]>('/schedule/today');
    if (!response.data) {
      throw new Error('오늘의 스케줄 조회에 실패했습니다.');
    }
    return response.data;
  },

  // 완료된 스케줄 조회
  async getCompletedSchedules(): Promise<ScheduleResponse[]> {
    const response = await apiClient.get<ScheduleResponse[]>('/schedule/completed');
    if (!response.data) {
      throw new Error('완료된 스케줄 조회에 실패했습니다.');
    }
    return response.data;
  },

  // 진행 중인 스케줄 조회
  async getInProgressSchedules(): Promise<ScheduleResponse[]> {
    const response = await apiClient.get<ScheduleResponse[]>('/schedule/in-progress');
    if (!response.data) {
      throw new Error('진행 중인 스케줄 조회에 실패했습니다.');
    }
    return response.data;
  },

  // === 상태 관리 ===

  // 스케줄 상태 변경
  // 백엔드 API: PUT /api/schedule/{scheduleId}/status?status={status}
  async updateScheduleStatus(scheduleId: string, status: ScheduleStatus): Promise<ScheduleResponse> {
    // 쿼리 파라미터로 status 전달 (URL 인코딩 포함)
    const encodedStatus = encodeURIComponent(status);
    const response = await apiClient.put<ScheduleResponse>(`/schedule/${scheduleId}/status?status=${encodedStatus}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || '스케줄 상태 변경에 실패했습니다.');
    }
    return response.data;
  },

  // 완료율 업데이트
  async updateCompletionRate(scheduleId: string, completionRate: number): Promise<ScheduleResponse> {
    const response = await apiClient.patch<ScheduleResponse>(`/schedule/${scheduleId}/completion`, { completionRate });
    if (!response.data) {
      throw new Error('완료율 업데이트에 실패했습니다.');
    }
    return response.data;
  },

  // === 필터링 ===

  // 필터로 스케줄 조회
  async getSchedulesByFilter(filter: ScheduleFilter): Promise<ScheduleResponse[]> {
    const params = new URLSearchParams();
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.status) params.append('status', filter.status);
    if (filter.topicId) params.append('topicId', filter.topicId.toString());

    const response = await apiClient.get<ScheduleResponse[]>(`/schedule/filter?${params.toString()}`);
    if (!response.data) {
      throw new Error('필터 스케줄 조회에 실패했습니다.');
    }
    return response.data;
  }
}; 