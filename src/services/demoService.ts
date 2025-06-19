import { 
  demoUsers, 
  demoTimerSessions, 
  demoStudyTopics, 
  demoAIFeedbacks, 
  demoTimerStats,
  demoHelpers,
  DEMO_MODE_CONFIG 
} from './demoData';
import { User, SignInRequest, SignUpRequest, TokenResponse } from '../types/user';
import { Timer, TimerRequest, TimerResponse, TimerStatistics } from '../types/timer';
import { StudyTopic, CreateStudyTopicRequest, UpdateStudyTopicRequest } from '../types/studyTopic';
import { AIFeedback, GenerateAIFeedbackRequest } from '../types/aiFeedback';

// 데모 인증 서비스
export class DemoAuthService {
  private currentUser: User | null = null;
  private accessToken: string | null = null;

  async signIn(credentials: SignInRequest): Promise<TokenResponse> {
    const user = demoUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    this.currentUser = user;
    this.accessToken = `demo_token_${user.id}_${Date.now()}`;

    return demoHelpers.simulateApiCall({
      accessToken: this.accessToken,
      refreshToken: `demo_refresh_${user.id}_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 3600
    });
  }

  async signUp(userData: SignUpRequest): Promise<TokenResponse> {
    const existingUser = demoUsers.find(u => u.email === userData.email);
    
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    const newUser: User = {
      id: demoHelpers.generateId().toString(),
      email: userData.email,
      nickname: userData.nickname,
      age: userData.age,
      sex: userData.sex,
      totalStudyTime: 0,
      createdAt: demoHelpers.getCurrentTimeString(),
      updatedAt: demoHelpers.getCurrentTimeString()
    };

    demoUsers.push(newUser);
    this.currentUser = newUser;
    this.accessToken = `demo_token_${newUser.id}_${Date.now()}`;

    return demoHelpers.simulateApiCall({
      accessToken: this.accessToken,
      refreshToken: `demo_refresh_${newUser.id}_${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 3600
    });
  }

  async getCurrentUser(): Promise<User> {
    if (!this.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }
    return demoHelpers.simulateApiCall(this.currentUser);
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.accessToken = null;
    return demoHelpers.simulateApiCall(undefined);
  }

  getToken(): string | null {
    return this.accessToken;
  }
}

// 데모 타이머 서비스
export class DemoTimerService {
  private sessions: Timer[] = [...demoTimerSessions];

  async startTimer(request: TimerRequest): Promise<TimerResponse> {
    const newSession: Timer = {
      id: demoHelpers.generateId(),
      studyMinutes: request.studyMinutes,
      restMinutes: request.breakMinutes,
      mode: request.timerType === 'STUDY' ? 'CUSTOM' : 'CUSTOM',
      startTime: demoHelpers.getCurrentTimeString(),
      endTime: undefined,
      summary: `${request.timerType === 'STUDY' ? '학습' : '휴식'} 세션 시작`,
      createdAt: demoHelpers.getCurrentTimeString(),
      updatedAt: demoHelpers.getCurrentTimeString()
    };

    this.sessions.push(newSession);

    return demoHelpers.simulateApiCall({
      success: true,
      message: '타이머가 시작되었습니다.',
      status: 'STARTED',
      remainingTime: request.studyMinutes * 60,
      timerType: request.timerType,
      userNickname: '데모사용자',
      studyMinutes: request.studyMinutes,
      breakMinutes: request.breakMinutes,
      cycleCount: 1
    });
  }

  async stopTimer(sessionId: number): Promise<TimerResponse> {
    const session = this.sessions.find(s => s.id === sessionId);
    
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    session.endTime = demoHelpers.getCurrentTimeString();
    session.updatedAt = demoHelpers.getCurrentTimeString();

    return demoHelpers.simulateApiCall({
      success: true,
      message: '타이머가 중지되었습니다.',
      status: 'STOPPED',
      remainingTime: 0,
      timerType: 'STUDY',
      userNickname: '데모사용자',
      studyMinutes: session.studyMinutes,
      breakMinutes: session.restMinutes,
      cycleCount: 1
    });
  }

  async getTimerHistory(): Promise<Timer[]> {
    return demoHelpers.simulateApiCall(this.sessions);
  }

  async getTimerStatistics(): Promise<TimerStatistics> {
    return demoHelpers.simulateApiCall(demoTimerStats);
  }
}

// 데모 학습 주제 서비스
export class DemoStudyTopicService {
  private topics: StudyTopic[] = [...demoStudyTopics];

  async getTopics(): Promise<StudyTopic[]> {
    return demoHelpers.simulateApiCall(this.topics);
  }

  async getTopic(id: string): Promise<StudyTopic> {
    const topic = this.topics.find(t => t.id === id);
    
    if (!topic) {
      throw new Error('학습 주제를 찾을 수 없습니다.');
    }

    return demoHelpers.simulateApiCall(topic);
  }

  async createTopic(request: CreateStudyTopicRequest): Promise<StudyTopic> {
    const newTopic: StudyTopic = {
      id: demoHelpers.generateId().toString(),
      name: request.name,
      goal: request.goal,
      totalStudyTime: 0,
      totalStudyCount: 0,
      strategy: request.strategy,
      summary: '새로운 학습 주제가 생성되었습니다.',
      createdAt: demoHelpers.getCurrentTimeString(),
      updatedAt: demoHelpers.getCurrentTimeString()
    };

    this.topics.push(newTopic);
    return demoHelpers.simulateApiCall(newTopic);
  }

  async updateTopic(id: string, request: UpdateStudyTopicRequest): Promise<StudyTopic> {
    const topicIndex = this.topics.findIndex(t => t.id === id);
    
    if (topicIndex === -1) {
      throw new Error('학습 주제를 찾을 수 없습니다.');
    }

    const updatedTopic = {
      ...this.topics[topicIndex],
      ...request,
      updatedAt: demoHelpers.getCurrentTimeString()
    };

    this.topics[topicIndex] = updatedTopic;
    return demoHelpers.simulateApiCall(updatedTopic);
  }

  async deleteTopic(id: string): Promise<void> {
    const topicIndex = this.topics.findIndex(t => t.id === id);
    
    if (topicIndex === -1) {
      throw new Error('학습 주제를 찾을 수 없습니다.');
    }

    this.topics.splice(topicIndex, 1);
    return demoHelpers.simulateApiCall(undefined);
  }
}

// 데모 AI 피드백 서비스
export class DemoAIFeedbackService {
  private feedbacks: AIFeedback[] = [...demoAIFeedbacks];

  async generateFeedback(request: GenerateAIFeedbackRequest): Promise<AIFeedback> {
    const newFeedback: AIFeedback = {
      id: demoHelpers.generateId().toString(),
      period: request.period,
      summary: `${request.period === 'daily' ? '오늘' : request.period === 'weekly' ? '이번 주' : '이번 달'} 학습 피드백이 생성되었습니다.`,
      insights: [
        '학습 시간이 꾸준히 증가하고 있습니다',
        '목표 달성률이 향상되고 있습니다',
        '집중도가 높은 상태를 유지하고 있습니다'
      ],
      recommendations: [
        '다음 기간에는 더 구체적인 목표를 세워보세요',
        '복습 시간을 늘려보세요',
        '새로운 주제에도 도전해보세요'
      ],
      createdAt: demoHelpers.getCurrentTimeString(),
      updatedAt: demoHelpers.getCurrentTimeString()
    };

    this.feedbacks.push(newFeedback);
    return demoHelpers.simulateApiCall(newFeedback);
  }

  async getFeedbacks(): Promise<AIFeedback[]> {
    return demoHelpers.simulateApiCall(this.feedbacks);
  }

  async getFeedback(id: string): Promise<AIFeedback> {
    const feedback = this.feedbacks.find(f => f.id === id);
    
    if (!feedback) {
      throw new Error('피드백을 찾을 수 없습니다.');
    }

    return demoHelpers.simulateApiCall(feedback);
  }
}

// 데모 서비스 인스턴스들
export const demoAuthService = new DemoAuthService();
export const demoTimerService = new DemoTimerService();
export const demoStudyTopicService = new DemoStudyTopicService();
export const demoAIFeedbackService = new DemoAIFeedbackService(); 