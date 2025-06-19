import apiClient from './apiClient';
import { demoUtils } from '../config/demoConfig';
import { demoTimerService } from './demoService';
import {
  Timer,
  TimerRequest,
  TimerResponse,
  TimerStatistics,
  TimerHistoryFilter,
  TimerSettings,
  PaginatedResponse,
  DateRange,
} from '../types';

class TimerService {
  /**
   * 타이머 시작
   */
  async startTimer(timerData: TimerRequest): Promise<TimerResponse> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 타이머 시작 시뮬레이션');
      return demoTimerService.startTimer(timerData);
    }

    try {
      const response = await apiClient.post<TimerResponse>('/timer/start', timerData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 시작에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 시작 에러:', error);
      throw error;
    }
  }

  /**
   * 타이머 정지
   */
  async stopTimer(): Promise<TimerResponse> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 타이머 정지 시뮬레이션');
      const sessions = await demoTimerService.getTimerHistory();
      const currentSession = sessions.find(s => !s.endTime);
      if (currentSession) {
        return demoTimerService.stopTimer(currentSession.id);
      }
      throw new Error('진행 중인 타이머가 없습니다.');
    }

    try {
      const response = await apiClient.post<TimerResponse>('/timer/stop');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 정지에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 정지 에러:', error);
      throw error;
    }
  }

  /**
   * 타이머 일시정지
   */
  async pauseTimer(): Promise<TimerResponse> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 타이머 일시정지 시뮬레이션');
      return demoUtils.simulateApiCall({
        success: true,
        message: '타이머가 일시정지되었습니다.',
        status: 'PAUSED',
        remainingTime: 1200,
        timerType: 'STUDY',
        userNickname: '데모사용자',
        studyMinutes: 25,
        breakMinutes: 5,
        cycleCount: 1
      });
    }

    try {
      const response = await apiClient.post<TimerResponse>('/timer/pause');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 일시정지에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 일시정지 에러:', error);
      throw error;
    }
  }

  /**
   * 타이머 재개
   */
  async resumeTimer(): Promise<TimerResponse> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 타이머 재개 시뮬레이션');
      return demoUtils.simulateApiCall({
        success: true,
        message: '타이머가 재개되었습니다.',
        status: 'STARTED',
        remainingTime: 1200,
        timerType: 'STUDY',
        userNickname: '데모사용자',
        studyMinutes: 25,
        breakMinutes: 5,
        cycleCount: 1
      });
    }

    try {
      const response = await apiClient.post<TimerResponse>('/timer/resume');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 재개에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 재개 에러:', error);
      throw error;
    }
  }

  /**
   * 현재 타이머 상태 조회
   */
  async getCurrentTimer(): Promise<TimerResponse> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 현재 타이머 상태 조회 시뮬레이션');
      return demoUtils.simulateApiCall({
        success: true,
        message: '현재 타이머 상태',
        status: 'STOPPED',
        remainingTime: 0,
        timerType: 'STUDY',
        userNickname: '데모사용자',
        studyMinutes: 25,
        breakMinutes: 5,
        cycleCount: 0
      });
    }

    try {
      const response = await apiClient.get<TimerResponse>('/timer/current');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '현재 타이머 상태 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('현재 타이머 상태 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 타이머 히스토리 조회
   */
  async getTimerHistory(filter?: TimerHistoryFilter): Promise<PaginatedResponse<Timer>> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 타이머 히스토리 조회 시뮬레이션');
      const sessions = await demoTimerService.getTimerHistory();
      return demoUtils.simulateApiCall({
        content: sessions,
        totalElements: sessions.length,
        totalPages: 1,
        currentPage: 1,
        size: 10,
        hasNext: false,
        hasPrevious: false
      });
    }

    try {
      const params = new URLSearchParams();
      
      if (filter?.startDate) params.append('startDate', filter.startDate);
      if (filter?.endDate) params.append('endDate', filter.endDate);
      if (filter?.topicId) params.append('topicId', filter.topicId);
      if (filter?.mode) params.append('mode', filter.mode);
      if (filter?.limit) params.append('limit', filter.limit.toString());
      if (filter?.offset) params.append('offset', filter.offset.toString());

      const response = await apiClient.get<PaginatedResponse<Timer>>(`/timer/history?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 히스토리 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 히스토리 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 타이머 통계 조회
   */
  async getTimerStatistics(dateRange?: DateRange): Promise<TimerStatistics> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 타이머 통계 조회 시뮬레이션');
      return demoTimerService.getTimerStatistics();
    }

    try {
      const params = new URLSearchParams();
      
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

      const response = await apiClient.get<TimerStatistics>(`/timer/statistics?${params.toString()}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 통계 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 통계 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 특정 타이머 세션 조회
   */
  async getTimerById(timerId: number): Promise<Timer> {
    // 데모 모드인 경우 데모 서비스 사용
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 특정 타이머 세션 조회 시뮬레이션');
      const sessions = await demoTimerService.getTimerHistory();
      const session = sessions.find(s => s.id === timerId);
      if (!session) {
        throw new Error('타이머 세션을 찾을 수 없습니다.');
      }
      return demoUtils.simulateApiCall(session);
    }

    try {
      const response = await apiClient.get<Timer>(`/timer/${timerId}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 세션 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 세션 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 타이머 세션 업데이트 (요약 등)
   */
  async updateTimer(timerId: number, updateData: Partial<Timer>): Promise<Timer> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 타이머 세션 업데이트 시뮬레이션');
      const sessions = await demoTimerService.getTimerHistory();
      const session = sessions.find(s => s.id === timerId);
      if (!session) {
        throw new Error('타이머 세션을 찾을 수 없습니다.');
      }
      const updatedSession = { ...session, ...updateData };
      return demoUtils.simulateApiCall(updatedSession);
    }

    try {
      const response = await apiClient.put<Timer>(`/timer/${timerId}`, updateData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 세션 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 세션 업데이트 에러:', error);
      throw error;
    }
  }

  /**
   * 타이머 세션 삭제
   */
  async deleteTimer(timerId: number): Promise<void> {
    // 데모 모드인 경우 시뮬레이션
    if (demoUtils.isDemoMode()) {
      console.log('데모 모드: 타이머 세션 삭제 시뮬레이션');
      return demoUtils.simulateApiCall(undefined);
    }

    try {
      const response = await apiClient.delete(`/timer/${timerId}`);
      
      if (!response.success) {
        throw new Error(response.message || '타이머 세션 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 세션 삭제 에러:', error);
      throw error;
    }
  }

  /**
   * 타이머 설정 조회
   */
  async getTimerSettings(): Promise<TimerSettings> {
    try {
      const response = await apiClient.get<TimerSettings>('/timer/settings');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 설정 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 설정 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 타이머 설정 업데이트
   */
  async updateTimerSettings(settings: Partial<TimerSettings>): Promise<TimerSettings> {
    try {
      const response = await apiClient.put<TimerSettings>('/timer/settings', settings);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '타이머 설정 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('타이머 설정 업데이트 에러:', error);
      throw error;
    }
  }

  /**
   * 일일 타이머 요약
   */
  async getDailySummary(date: string): Promise<{
    totalStudyTime: number;
    totalSessions: number;
    averageSessionLength: number;
    sessions: Timer[];
  }> {
    try {
      const response = await apiClient.get(`/timer/daily-summary?date=${date}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '일일 요약 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('일일 요약 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 주간 타이머 요약
   */
  async getWeeklySummary(weekStart: string): Promise<{
    totalStudyTime: number;
    totalSessions: number;
    averageDailyStudyTime: number;
    dailySummaries: Array<{
      date: string;
      studyTime: number;
      sessions: number;
    }>;
  }> {
    try {
      const response = await apiClient.get(`/timer/weekly-summary?weekStart=${weekStart}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '주간 요약 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('주간 요약 조회 에러:', error);
      throw error;
    }
  }

  /**
   * 월간 타이머 요약
   */
  async getMonthlySummary(month: string): Promise<{
    totalStudyTime: number;
    totalSessions: number;
    averageDailyStudyTime: number;
    mostProductiveDay: string;
    weeklySummaries: Array<{
      weekStart: string;
      studyTime: number;
      sessions: number;
    }>;
  }> {
    try {
      const response = await apiClient.get(`/timer/monthly-summary?month=${month}`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '월간 요약 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('월간 요약 조회 에러:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const timerService = new TimerService();
export default timerService; 