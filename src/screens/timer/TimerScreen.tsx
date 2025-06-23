import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { theme } from '../../theme';

const STUDY_MINUTES = 25;
const BREAK_MINUTES = 5;

const pastelColors = {
  study: '#AEE6FF', // 파스텔 블루
  break: '#C8FFD4', // 파스텔 그린
  button: '#FFD6E0', // 파스텔 핑크
  shadow: '#E0E7FF',
};

const TimerScreen: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isStudy, setIsStudy] = useState(true);
  const [remaining, setRemaining] = useState(STUDY_MINUTES * 60);
  const [cycle, setCycle] = useState(1);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [startTime, setStartTime] = useState<Date | null>(null);

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

  const handleStartPause = () => {
    if (!isRunning && !startTime) {
      setStartTime(new Date());
    }
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(isStudy ? STUDY_MINUTES * 60 : BREAK_MINUTES * 60);
  };

  const handleSwitch = () => {
    setIsRunning(false);
    setIsStudy((prev) => !prev);
    setRemaining((prev) => {
      if (isStudy) {
        setCycle((c) => c + 1);
        return BREAK_MINUTES * 60;
      } else {
        return STUDY_MINUTES * 60;
      }
    });
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
    const studyMinutes = isStudy ? Math.round(((endTime.getTime() - startTime.getTime()) / 1000) / 60) : STUDY_MINUTES;
    const restMinutes = !isStudy ? Math.round(((endTime.getTime() - startTime.getTime()) / 1000) / 60) : BREAK_MINUTES;
    const mode = `${STUDY_MINUTES}/${BREAK_MINUTES}`;
    const summary = '';
    const payload = {
      studyMinutes,
      restMinutes,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      mode,
      summary,
    };
    console.log('[타이머] 서버로 보낼 데이터:', payload);
    try {
      const res = await fetch('http://192.168.0.7:8080/api/timer/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      console.log('[타이머] fetch 응답 status:', res.status);
      const data = await res.json();
      console.log('[타이머] fetch 응답 데이터:', data);
      if (data.success) {
        Alert.alert('저장 완료', '공부 기록이 저장되었습니다!');
        setStartTime(null);
        setIsRunning(false);
        setRemaining(isStudy ? STUDY_MINUTES * 60 : BREAK_MINUTES * 60);
      } else {
        Alert.alert('저장 실패', data.message || '저장에 실패했습니다.');
      }
    } catch (e) {
      console.log('[타이머] fetch 에러:', e);
      Alert.alert('오류', '서버와 통신에 실패했습니다.');
    }
  };

  // 시간 포맷
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
});

export default TimerScreen; 