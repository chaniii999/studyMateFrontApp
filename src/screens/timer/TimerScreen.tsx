import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert, Platform, Vibration } from 'react-native';
import { theme } from '../../theme';
import apiClient from '../../services/apiClient';
import { aiFeedbackService } from '../../services/aiFeedbackService';
import { AiFeedbackRequest } from '../../types/aiFeedback';
import AiFeedbackSurvey, { AiFeedbackSurveyData } from '../../components/AiFeedbackSurvey';
import { useRoute } from '@react-navigation/native';

const DEFAULT_STUDY_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

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
  const [studyMinutes, setStudyMinutes] = useState(DEFAULT_STUDY_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [remaining, setRemaining] = useState(DEFAULT_STUDY_MINUTES * 60);
  const [cycle, setCycle] = useState(1);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [savedTimerId, setSavedTimerId] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [surveyVisible, setSurveyVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
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
          // 타이머 종료 시 - 무한 루프 방지를 위해 즉시 정지
          setIsRunning(false);
          // 다음 tick에서 handleSwitch 호출
          setTimeout(() => {
            console.log('타이머 종료 - handleSwitch 호출');
            console.log('타이머 종료 시점의 soundEnabled:', soundEnabled);
            // soundEnabled 상태를 직접 확인하여 안전하게 처리
            if (soundEnabled) {
              console.log('타이머 종료 시점에서 알림이 켜져있음 - 진동 실행');
              Vibration.vibrate(200);
            } else {
              console.log('타이머 종료 시점에서 알림이 꺼져있음');
            }
            handleSwitch();
          }, 0);
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
      toValue: 1 - remaining / (isStudy ? studyMinutes * 60 : breakMinutes * 60),
      duration: 500,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [remaining, isStudy, studyMinutes, breakMinutes]);

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
    setRemaining(isStudy ? studyMinutes * 60 : breakMinutes * 60);
    // 모든 시간 누적 초기화
    setTotalStudySeconds(0);
    setTotalRestSeconds(0);
    setStudyStartTime(null);
    setRestStartTime(null);
    setStartTime(null);
    setModeHistory([]);
  };

  const handleSwitch = useCallback(() => {
    console.log('handleSwitch 호출됨 - 현재 soundEnabled:', soundEnabled);
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
      console.log('공부 → 휴식 모드전환');
      setIsStudy(false);
      setRestStartTime(newStartTime);
      setRemaining(breakMinutes * 60);
      setCycle((c) => c + 1);
    } else {
      // 휴식 → 공부
      console.log('휴식 → 공부 모드전환');
      setIsStudy(true);
      setStudyStartTime(newStartTime);
      setRemaining(studyMinutes * 60);
    }
    
    // 새 모드 기록 추가
    setModeHistory(prev => [...prev, {
      mode: !isStudy ? 'study' : 'rest',
      startTime: newStartTime
    }]);
    
    // 효과음 재생은 이미 타이머 종료 시점에서 처리했으므로 여기서는 로그만 출력
    console.log('handleSwitch 내부 - 모드전환 완료');
    console.log('현재 soundEnabled 상태:', soundEnabled);
    
    // 즉시 타이머 재시작
    setIsRunning(true);
  }, [soundEnabled, isStudy, studyMinutes, breakMinutes]);

  // soundEnabled 상태 변경 감지
  useEffect(() => {
    console.log('soundEnabled 상태 변경됨:', soundEnabled);
  }, [soundEnabled]);

  // 공부 종료 버튼 활성화 조건
  const canFinishStudy = () => {
    // 1. 타이머가 시작되었거나 (startTime이 있음)
    // 2. 모드 히스토리가 있거나 (실제 공부/휴식 기록이 있음)
    // 3. 현재 타이머가 실행 중이거나
    return startTime !== null || modeHistory.length > 0 || isRunning;
  };

  // 알림 토글 핸들러
  const handleSoundToggle = () => {
    setSoundEnabled(prev => !prev);
  };

  // 효과음 재생 함수
  const playNotificationSound = () => {
    console.log('🔔 모드전환 알림음 재생 - soundEnabled:', soundEnabled);
    
    // 하드웨어 피드백으로 효과음 시뮬레이션
    if (Platform.OS === 'ios') {
      // iOS의 경우 간단한 진동 사용
      Vibration.vibrate(200); // 200ms 진동
    } else {
      // Android의 경우 Vibration API 사용
      Vibration.vibrate(200); // 200ms 진동
    }
  };

  // 설정 다이얼 핸들러
  const handleSettings = () => {
    Alert.prompt(
      '공부 시간 설정',
      '공부 시간을 분 단위로 입력하세요:',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: (studyTimeText) => {
            if (studyTimeText) {
              const newStudyMinutes = parseInt(studyTimeText);
              if (newStudyMinutes > 0 && newStudyMinutes <= 120) {
                setStudyMinutes(newStudyMinutes);
                // 현재 공부 모드이고 타이머가 정지된 상태라면 remaining 업데이트
                if (isStudy && !isRunning) {
                  setRemaining(newStudyMinutes * 60);
                }
                
                // 휴식 시간 설정 다이얼
                Alert.prompt(
                  '휴식 시간 설정',
                  '휴식 시간을 분 단위로 입력하세요:',
                  [
                    { text: '취소', style: 'cancel' },
                    {
                      text: '확인',
                      onPress: (breakTimeText) => {
                        if (breakTimeText) {
                          const newBreakMinutes = parseInt(breakTimeText);
                          if (newBreakMinutes > 0 && newBreakMinutes <= 60) {
                            setBreakMinutes(newBreakMinutes);
                            // 현재 휴식 모드이고 타이머가 정지된 상태라면 remaining 업데이트
                            if (!isStudy && !isRunning) {
                              setRemaining(newBreakMinutes * 60);
                            }
                            Alert.alert('설정 완료', `공부: ${newStudyMinutes}분, 휴식: ${newBreakMinutes}분`);
                          } else {
                            Alert.alert('오류', '휴식 시간은 1-60분 사이로 입력해주세요.');
                          }
                        }
                      }
                    }
                  ],
                  'plain-text',
                  breakMinutes.toString()
                );
              } else {
                Alert.alert('오류', '공부 시간은 1-120분 사이로 입력해주세요.');
              }
            }
          }
        }
      ],
      'plain-text',
      studyMinutes.toString()
    );
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
    
    const mode = `${studyMinutes}/${breakMinutes}`; // 포모도로 모드
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
        setRemaining(isStudy ? studyMinutes * 60 : breakMinutes * 60);
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
        studyTime: studyMinutes, // 현재 설정값 사용
        restTime: breakMinutes,  // 현재 설정값 사용
        mode: `${studyMinutes}/${breakMinutes}`,
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
      {/* 설정 버튼 */}
      <TouchableOpacity 
        style={styles.settingsButton} 
        onPress={handleSettings}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>

      {/* 알림 토글 버튼 */}
      <TouchableOpacity 
        style={styles.soundToggleButton} 
        onPress={handleSoundToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.soundToggleIcon}>
          {soundEnabled ? '🔔' : '🔕'}
        </Text>
      </TouchableOpacity>
      
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
      {/* 공부 종료 버튼 - 조건부 활성화 */}
      {canFinishStudy() ? (
        <TouchableOpacity 
          style={styles.finishButton} 
          onPress={handleFinishAndSave} 
          activeOpacity={0.85}
        >
          <Text style={styles.finishButtonText}>공부 종료</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.finishButton, styles.finishButtonDisabled]} 
          activeOpacity={0.85}
          disabled={true}
        >
          <Text style={[styles.finishButtonText, styles.finishButtonTextDisabled]}>공부 종료</Text>
        </TouchableOpacity>
      )}
      
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
  finishButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
  },
  finishButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
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
  soundToggleButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  soundToggleIcon: {
    fontSize: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 20,
  },
});

export default TimerScreen; 