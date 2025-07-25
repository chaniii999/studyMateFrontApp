import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { theme } from '../../theme';
import apiClient from '../../services/apiClient';
import { aiFeedbackService, AiFeedbackRequest } from '../../services/aiFeedbackService';
import AiFeedbackSurvey, { AiFeedbackSurveyData } from '../../components/AiFeedbackSurvey';
import { useRoute } from '@react-navigation/native';

const STUDY_MINUTES = 25;
const BREAK_MINUTES = 5;

const pastelColors = {
  study: '#AEE6FF', // 파스텔 블루
  break: '#C8FFD4', // 파스텔 그린
  button: '#FFD6E0', // 파스텔 핑크
  shadow: '#E0E7FF',
};

const TimerScreen: React.FC = () => {
  const route = useRoute();
  const [isRunning, setIsRunning] = useState(false);
  const [isStudy, setIsStudy] = useState(true);
  const [remaining, setRemaining] = useState(STUDY_MINUTES * 60);
  const [cycle, setCycle] = useState(1);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [savedTimerId, setSavedTimerId] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [surveyVisible, setSurveyVisible] = useState(false);
  
  // 각 모드별 시간 누적을 위한 상태
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null);
  const [restStartTime, setRestStartTime] = useState<Date | null>(null);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);
  const [totalRestSeconds, setTotalRestSeconds] = useState(0);
  
  // 모드 전환 기록을 위한 상태
  const [modeHistory, setModeHistory] = useState<Array<{
    mode: 'study' | 'rest';
    startTime: Date;
    endTime?: Date;
    duration?: number;
  }>>([]);
  
  // 모드 히스토리에서 누적 시간 계산
  useEffect(() => {
    let studySeconds = 0;
    let restSeconds = 0;
    
    modeHistory.forEach(record => {
      if (record.duration) {
        if (record.mode === 'study') {
          studySeconds += record.duration;
        } else {
          restSeconds += record.duration;
        }
      }
    });
    
    setTotalStudySeconds(studySeconds);
    setTotalRestSeconds(restSeconds);
  }, [modeHistory]);
  


  // 타이머 진행
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setRemaining((prev) => {
          if (prev > 0) return prev - 1;
          // 타이머 종료 시
          handleSwitch();
          return 0;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isStudy]);

  // 애니메이션(진행률)
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1 - remaining / (isStudy ? STUDY_MINUTES * 60 : BREAK_MINUTES * 60),
      duration: 500,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [remaining, isStudy]);

  useEffect(() => {
    if (route.params && (route.params as any).autoStart) {
      if (!isRunning) {
        const now = new Date();
        setStartTime(now);
        // 공부 모드로 시작
        setStudyStartTime(now);
        setIsRunning(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  const handleStartPause = () => {
    if (!isRunning && !startTime) {
      const now = new Date();
      setStartTime(now);
      // 현재 모드에 따라 시작 시간 설정
      if (isStudy) {
        setStudyStartTime(now);
      } else {
        setRestStartTime(now);
      }
      
      // 첫 번째 모드 기록 추가
      setModeHistory([{
        mode: isStudy ? 'study' : 'rest',
        startTime: now
      }]);
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(isStudy ? STUDY_MINUTES * 60 : BREAK_MINUTES * 60);
    // 모든 시간 누적 초기화
    setTotalStudySeconds(0);
    setTotalRestSeconds(0);
    setStudyStartTime(null);
    setRestStartTime(null);
    setStartTime(null);
    setModeHistory([]);
  };

  const handleSwitch = () => {
    setIsRunning(false);
    
    const now = new Date();
    
    // 현재 모드 기록 완료
    setModeHistory(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        const lastRecord = updated[updated.length - 1];
        lastRecord.endTime = now;
        lastRecord.duration = Math.round((now.getTime() - lastRecord.startTime.getTime()) / 1000);
      }
      return updated;
    });
    
    // 모드 전환 및 새 모드 시작 시간 설정
    const newStartTime = new Date();
    if (isStudy) {
      // 공부 → 휴식
      setIsStudy(false);
      setRestStartTime(newStartTime);
      setRemaining(BREAK_MINUTES * 60);
      setCycle((c) => c + 1);
    } else {
      // 휴식 → 공부
      setIsStudy(true);
      setStudyStartTime(newStartTime);
      setRemaining(STUDY_MINUTES * 60);
    }
    
    // 새 모드 기록 추가
    setModeHistory(prev => [...prev, {
      mode: !isStudy ? 'study' : 'rest',
      startTime: newStartTime
    }]);
    
    // 즉시 타이머 재시작
    setIsRunning(true);
  };

  // 공부 종료 및 저장
  const handleFinishAndSave = async () => {
    console.log('[타이머] 공부 종료 버튼 클릭');
    if (!startTime) {
      Alert.alert('알림', '타이머를 먼저 시작하세요.');
      console.log('[타이머] startTime 없음');
      return;
    }
    
    const endTime = new Date();
    
    // modeHistory를 기반으로 정확한 공부/휴식 시간 계산
    let finalStudySeconds = 0;
    let finalRestSeconds = 0;
    
    // modeHistory의 모든 기록을 처리
    const updatedModeHistory = [...modeHistory];
    
    // 마지막 기록의 종료 시간 설정
    if (updatedModeHistory.length > 0) {
      const lastRecord = updatedModeHistory[updatedModeHistory.length - 1];
      lastRecord.endTime = endTime;
      lastRecord.duration = Math.round((endTime.getTime() - lastRecord.startTime.getTime()) / 1000);
    }
    
    // 각 모드별 시간 합계 계산
    updatedModeHistory.forEach(record => {
      if (record.duration) {
        if (record.mode === 'study') {
          finalStudySeconds += record.duration;
        } else if (record.mode === 'rest') {
          finalRestSeconds += record.duration;
        }
      }
    });
    
    console.log('[타이머] 모드 히스토리 분석:', {
      총기록수: updatedModeHistory.length,
      각기록: updatedModeHistory.map(r => `${r.mode}: ${r.duration}초`),
      계산된공부시간: finalStudySeconds,
      계산된휴식시간: finalRestSeconds
    });
    
    // 최소 1초 이상의 시간이 있어야 저장
    if (finalStudySeconds === 0 && finalRestSeconds === 0) {
      Alert.alert('알림', '최소 1초 이상의 시간을 기록해주세요.');
      return;
    }
    
    const mode = `${STUDY_MINUTES}/${BREAK_MINUTES}`; // 포모도로 모드
    const summary = '';
    const payload = {
      studyTimes: finalStudySeconds, // 초 단위로 직접 전송
      restTimes: finalRestSeconds,   // 초 단위로 직접 전송
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      mode,
      summary,
    };
    
    const totalSessionSeconds = finalStudySeconds + finalRestSeconds;
    console.log('[타이머] 저장 요청:', {
      공부시간: `${finalStudySeconds}초 (${(finalStudySeconds / 60).toFixed(2)}분)`,
      휴식시간: `${finalRestSeconds}초 (${(finalRestSeconds / 60).toFixed(2)}분)`,
      총세션시간: `${totalSessionSeconds}초`,
      모드: isStudy ? '공부' : '휴식'
    });
    try {
      const response = await apiClient.post('/timer/save', payload);
      console.log('[타이머] 저장 완료:', response.success ? '성공' : '실패');
      if (response.success) {
        // 저장된 타이머 ID 저장
        if (response.data && response.data.id) {
          setSavedTimerId(response.data.id);
        }
        Alert.alert('저장 완료', '공부 기록이 저장되었습니다!');
        // 모든 상태 초기화
        setStartTime(null);
        setStudyStartTime(null);
        setRestStartTime(null);
        setTotalStudySeconds(0);
        setTotalRestSeconds(0);
        setIsRunning(false);
        setRemaining(isStudy ? STUDY_MINUTES * 60 : BREAK_MINUTES * 60);
      } else {
        Alert.alert('저장 실패', response.message || '저장에 실패했습니다.');
      }
    } catch (e) {
      console.log('[타이머] 저장 실패:', e);
      Alert.alert('오류', '서버와 통신에 실패했습니다.');
    }
  };

  // AI 피드백 생성
  const handleAiFeedback = async () => {
    if (!savedTimerId) {
      Alert.alert('알림', '먼저 공부 기록을 저장해주세요.');
      return;
    }

    setSurveyVisible(true);
  };

  const handleSurveySubmit = async (surveyData: AiFeedbackSurveyData) => {
    if (!savedTimerId) return;

    try {
      setAiLoading(true);
      setSurveyVisible(false);
      
      const request: AiFeedbackRequest = {
        timerId: savedTimerId,
        studySummary: '타이머를 통한 학습',
        studyTime: STUDY_MINUTES, // 기본 설정값 사용
        restTime: BREAK_MINUTES,  // 기본 설정값 사용
        mode: `${STUDY_MINUTES}/${BREAK_MINUTES}`,
        // 설문조사 데이터 추가
        ...surveyData
      };

      const feedback = await aiFeedbackService.createFeedback(request);
      
      Alert.alert('AI 피드백 완료', 
        `피드백: ${feedback.feedback}\n\n제안: ${feedback.suggestions}\n\n동기부여: ${feedback.motivation}`);
    } catch (error) {
      console.error('AI 피드백 생성 에러:', error);
      Alert.alert('오류', 'AI 피드백 생성에 실패했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  // 시간 포맷 (시:분:초)
  const formatTime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // 원형 타이머 스타일
  const circleSize = 260;
  const strokeWidth = 18;
  const progress = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: isStudy ? pastelColors.study : pastelColors.break }]}>  
      <View style={styles.cycleBadge}>
        <Text style={styles.cycleText}>🍅 {cycle}번째 사이클</Text>
      </View>
      
      {/* 누적 시간 표시 */}
      {modeHistory.length > 0 && (
        <View style={styles.accumulatedTimeContainer}>
          <Text style={styles.accumulatedTimeText}>
            📚 누적 공부: {formatTime(totalStudySeconds)}
          </Text>
          <Text style={styles.accumulatedTimeText}>
            ☕ 누적 휴식: {formatTime(totalRestSeconds)}
          </Text>
          <Text style={styles.accumulatedTimeText}>
            🔄 모드 전환: {modeHistory.length}회
          </Text>
        </View>
      )}
      <View style={styles.timerWrapper}>
        <View style={styles.shadowCircle} />
        <Animated.View style={[styles.progressCircle, {
          transform: [{ rotate: progress }],
          borderColor: isStudy ? '#6EC1E4' : '#7ED957',
        }]} />
        <View style={styles.innerCircle}>
          <Text style={styles.timeText}>{formatTime(remaining)}</Text>
          <Text style={styles.statusText}>{isStudy ? '집중 중 😃' : '휴식 중 💤'}</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.roundButton, { backgroundColor: pastelColors.button }]}
          onPress={handleStartPause}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{isRunning ? '일시정지' : '시작'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roundButton, { backgroundColor: '#FFF6E0' }]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#FFB6B6' }]}>리셋</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roundButton, { backgroundColor: '#E0F7FA' }]}
          onPress={handleSwitch}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#6EC1E4' }]}>모드전환</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.finishButton} onPress={handleFinishAndSave} activeOpacity={0.85}>
        <Text style={styles.finishButtonText}>공부 종료</Text>
      </TouchableOpacity>
      
      {/* AI 피드백 버튼 */}
      {savedTimerId && (
        <TouchableOpacity 
          style={[styles.aiButton, aiLoading && styles.aiButtonDisabled]} 
          onPress={handleAiFeedback} 
          activeOpacity={0.85}
          disabled={aiLoading}
        >
          <Text style={styles.aiButtonText}>
            {aiLoading ? '🤖 AI 분석 중...' : '🤖 AI 피드백 받기'}
          </Text>
        </TouchableOpacity>
      )}

      {/* AI 피드백 설문조사 모달 */}
      <AiFeedbackSurvey
        visible={surveyVisible}
        onClose={() => setSurveyVisible(false)}
        onSubmit={handleSurveySubmit}
        loading={aiLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleBadge: {
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: '#FFF6E0',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    alignSelf: 'center',
    shadowColor: '#FFD6E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cycleText: {
    fontSize: 16,
    color: '#FFB6B6',
    fontWeight: '600',
  },
  timerWrapper: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  shadowCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: pastelColors.shadow,
    opacity: 0.5,
    top: 8,
    left: 0,
    zIndex: 0,
  },
  progressCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 18,
    borderColor: '#6EC1E4',
    borderStyle: 'solid',
    zIndex: 1,
    opacity: 0.7,
  },
  innerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#AEE6FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6EC1E4',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 20,
    color: '#7ED957',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  roundButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#FFD6E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF7F7F',
  },
  finishButton: {
    marginTop: 32,
    backgroundColor: '#7ED957',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#7ED957',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  aiButton: {
    marginTop: 16,
    backgroundColor: '#6EC1E4',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#6EC1E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  accumulatedTimeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accumulatedTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 2,
  },
});

export default TimerScreen; 