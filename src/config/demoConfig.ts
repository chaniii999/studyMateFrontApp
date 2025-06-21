// 데모 모드 설정
export interface DemoConfig {
  isEnabled: boolean;
  showDemoIndicator: boolean;
  networkDelay: {
    min: number;
    max: number;
  };
  errorRate: number;
  autoLogin: boolean;
  demoCredentials: {
    email: string;
    password: string;
  };
}

// 기본 데모 설정
export const defaultDemoConfig: DemoConfig = {
  isEnabled: false, // 기본적으로 비활성화
  showDemoIndicator: true,
  networkDelay: {
    min: 200,
    max: 800
  },
  errorRate: 0.1, // 10% 확률로 에러 발생
  autoLogin: true,
  demoCredentials: {
    email: 'demo@studymate.com',
    password: 'demo123'
  }
};

// 데모 모드 상태 관리
class DemoModeManager {
  private config: DemoConfig = defaultDemoConfig;

  // 데모 모드 활성화/비활성화
  setDemoMode(enabled: boolean): void {
    this.config.isEnabled = enabled;
    console.log(`데모 모드 ${enabled ? '활성화' : '비활성화'}`);
  }

  // 데모 모드 상태 확인
  isDemoModeEnabled(): boolean {
    return this.config.isEnabled;
  }

  // 설정 업데이트
  updateConfig(newConfig: Partial<DemoConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 전체 설정 가져오기
  getConfig(): DemoConfig {
    return { ...this.config };
  }

  // 데모 인디케이터 표시 여부
  shouldShowDemoIndicator(): boolean {
    return this.config.isEnabled && this.config.showDemoIndicator;
  }

  // 네트워크 지연 시간 가져오기
  getNetworkDelay(): { min: number; max: number } {
    return this.config.networkDelay;
  }

  // 에러 발생 확률 가져오기
  getErrorRate(): number {
    return this.config.errorRate;
  }

  // 자동 로그인 여부
  shouldAutoLogin(): boolean {
    return this.config.isEnabled && this.config.autoLogin;
  }

  // 데모 계정 정보 가져오기
  getDemoCredentials(): { email: string; password: string } {
    return this.config.demoCredentials;
  }
}

// 싱글톤 인스턴스
export const demoModeManager = new DemoModeManager();

// 데모 모드 유틸리티 함수들
export const demoUtils = {
  // 데모 모드인지 확인
  isDemoMode: (): boolean => demoModeManager.isDemoModeEnabled(),

  // 데모 모드 토글
  toggleDemoMode: (): void => {
    const currentState = demoModeManager.isDemoModeEnabled();
    demoModeManager.setDemoMode(!currentState);
  },

  // 데모 모드 활성화
  enableDemoMode: (): void => demoModeManager.setDemoMode(true),

  // 데모 모드 비활성화
  disableDemoMode: (): void => demoModeManager.setDemoMode(false),

  // 데모 인디케이터 표시 여부 확인
  shouldShowDemoIndicator: (): boolean => demoModeManager.shouldShowDemoIndicator(),

  // 랜덤 지연 시간 생성
  getRandomDelay: (): number => {
    const { min, max } = demoModeManager.getNetworkDelay();
    return Math.random() * (max - min) + min;
  },

  // 에러 발생 여부 확인
  shouldThrowError: (): boolean => {
    return Math.random() < demoModeManager.getErrorRate();
  },

  // 현재 시간 문자열 생성
  getCurrentTimeString: (): string => {
    return new Date().toISOString();
  },

  // 시뮬레이션된 API 응답
  simulateApiCall: async <T>(data: T, shouldError = false): Promise<T> => {
    const delay = demoUtils.getRandomDelay();
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldError || demoUtils.shouldThrowError()) {
          reject(new Error('데모 모드: 시뮬레이션된 에러'));
        } else {
          resolve(data);
        }
      }, delay);
    });
  }
}; 