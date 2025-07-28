import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Alert, Platform, Vibration, Dimensions, ImageBackground } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
// import LinearGradient from 'react-native-linear-gradient'; // 임시 비활성화
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
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

// 야경 배경과 몽환적인 비눗방울 효과 컴포넌트
const DreamyNightBackground: React.FC = () => {
  // 고정된 전체 화면 크기 사용
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // 비눗방울들의 애니메이션 값들
  const bubble1Progress = useSharedValue(0);
  const bubble2Progress = useSharedValue(0);
  const bubble3Progress = useSharedValue(0);
  const bubble4Progress = useSharedValue(0);
  const bubble5Progress = useSharedValue(0);
  const bubble6Progress = useSharedValue(0);
  
  // 각 비눗방울의 스타일 애니메이션
  const bubbleStyle1 = useAnimatedStyle(() => {
    const translateY = interpolate(
      bubble1Progress.value,
      [0, 1],
      [screenHeight + 100, -200],
      Extrapolate.CLAMP
    );
    const translateX = interpolate(
      bubble1Progress.value,
      [0, 0.5, 1],
      [screenWidth * 0.1, screenWidth * 0.3, screenWidth * 0.2],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      bubble1Progress.value,
      [0, 0.5, 1],
      [0.5, 1.2, 0.8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      bubble1Progress.value,
      [0, 0.2, 0.8, 1],
      [0, 0.7, 0.7, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { translateX }, { scale }],
      opacity,
    };
  });

  const bubbleStyle2 = useAnimatedStyle(() => {
    const translateY = interpolate(
      bubble2Progress.value,
      [0, 1],
      [screenHeight + 150, -250],
      Extrapolate.CLAMP
    );
    const translateX = interpolate(
      bubble2Progress.value,
      [0, 0.3, 0.7, 1],
      [screenWidth * 0.8, screenWidth * 0.6, screenWidth * 0.9, screenWidth * 0.7],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      bubble2Progress.value,
      [0, 0.6, 1],
      [0.3, 1.5, 0.6],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      bubble2Progress.value,
      [0, 0.3, 0.7, 1],
      [0, 0.8, 0.8, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { translateX }, { scale }],
      opacity,
    };
  });

  const bubbleStyle3 = useAnimatedStyle(() => {
    const translateY = interpolate(
      bubble3Progress.value,
      [0, 1],
      [screenHeight + 80, -180],
      Extrapolate.CLAMP
    );
    const translateX = interpolate(
      bubble3Progress.value,
      [0, 0.4, 0.8, 1],
      [screenWidth * 0.5, screenWidth * 0.2, screenWidth * 0.6, screenWidth * 0.4],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      bubble3Progress.value,
      [0, 0.4, 1],
      [0.4, 1.0, 0.7],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      bubble3Progress.value,
      [0, 0.2, 0.8, 1],
      [0, 0.6, 0.6, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { translateX }, { scale }],
      opacity,
    };
  });

  // 애니메이션 시작
  useEffect(() => {
    // 서로 다른 타이밍으로 비눗방울들이 떠오르도록 설정
    const startBubbleAnimation = (progress: Reanimated.SharedValue<number>, delay: number, duration: number) => {
      setTimeout(() => {
        progress.value = withRepeat(
          withTiming(1, { duration }),
          -1,
          false
        );
      }, delay);
    };

    startBubbleAnimation(bubble1Progress, 0, 12000);
    startBubbleAnimation(bubble2Progress, 2000, 15000);
    startBubbleAnimation(bubble3Progress, 4000, 18000);
    startBubbleAnimation(bubble4Progress, 6000, 14000);
    startBubbleAnimation(bubble5Progress, 8000, 16000);
    startBubbleAnimation(bubble6Progress, 10000, 13000);
  }, []);

  return (
    <View style={styles.backgroundContainer}>
      {/* 야경 배경 이미지 - 블러 효과 */}
      <ImageBackground
        source={require('../../../assets/images/night_street.jpg')}
        style={styles.nightBackground}
        blurRadius={8}
        resizeMode="cover"
      >
        {/* 어두운 오버레이 */}
        <View style={styles.darkOverlay} />
      </ImageBackground>

      {/* 몽환적인 비눗방울들 */}
      <Reanimated.View style={[styles.bubble, bubbleStyle1]}>
        <View style={[styles.bubbleInner, { width: 60, height: 60 }]} />
      </Reanimated.View>

      <Reanimated.View style={[styles.bubble, bubbleStyle2]}>
        <View style={[styles.bubbleInner, { width: 80, height: 80 }]} />
      </Reanimated.View>

      <Reanimated.View style={[styles.bubble, bubbleStyle3]}>
        <View style={[styles.bubbleInner, { width: 45, height: 45 }]} />
      </Reanimated.View>

      {/* 추가 작은 비눗방울들 */}
      <Reanimated.View style={[styles.bubble, bubbleStyle1, { transform: [{ translateX: screenWidth * 0.7 }] }]}>
        <View style={[styles.bubbleInner, { width: 30, height: 30 }]} />
      </Reanimated.View>

      <Reanimated.View style={[styles.bubble, bubbleStyle2, { transform: [{ translateX: screenWidth * 0.3 }] }]}>
        <View style={[styles.bubbleInner, { width: 35, height: 35 }]} />
      </Reanimated.View>

      <Reanimated.View style={[styles.bubble, bubbleStyle3, { transform: [{ translateX: screenWidth * 0.9 }] }]}>
        <View style={[styles.bubbleInner, { width: 25, height: 25 }]} />
      </Reanimated.View>
    </View>
  );
};

const TimerScreen: React.FC = () => {
  const route = useRoute();
  const { width, height } = Dimensions.get('window');
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
  
  // 게이지바 애니메이션을 위한 Animated Value
  const gaugeAnimatedValue = useRef(new Animated.Value(0)).current;
  
  // 미니모드 상태와 애니메이션
  const [isMiniMode, setIsMiniMode] = useState(false);
  const scaleAnimatedValue = useRef(new Animated.Value(1)).current;
  const opacityAnimatedValue = useRef(new Animated.Value(1)).current;
  
  // 네비게이션 제어
  const navigation = useNavigation();
  
  // 타이머 탭 진입/나갈 때 네비게이션 바를 플로팅 스타일로 변경
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      if (!parent) return;
      
      // 타이머 탭 진입 시: 플로팅 스타일 적용
      parent.setOptions({
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
          borderRadius: 20,
          marginHorizontal: 16,
          marginBottom: Platform.OS === 'ios' ? 20 : 16,
          paddingBottom: Platform.OS === 'ios' ? 34 : 10,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 102 : 68,
          shadowColor: theme.colors.text.primary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }
      });
      
      // 타이머 탭에서 나갈 때: 원래 스타일로 복원
      return () => {
        parent.setOptions({
          tabBarStyle: {
            backgroundColor: theme.colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.light,
            paddingBottom: Platform.OS === 'ios' ? 34 : 10,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 102 : 68,
            shadowColor: theme.colors.text.primary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
            // position 없음 = 기본 고정
          }
        });
      };
    }, [navigation])
  );
  
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

  // 게이지바 애니메이션 효과 (모드 전환 시)
  useEffect(() => {
    if (isRunning) {
      // 타이머가 실행 중일 때는 실시간 진행률에 맞춰 애니메이션
      const totalTime = isStudy ? studyMinutes * 60 : breakMinutes * 60;
      const progressValue = Math.max(0, Math.min(1, (totalTime - remaining) / totalTime));
      
      Animated.timing(gaugeAnimatedValue, {
        toValue: progressValue,
        duration: 300, // 부드러운 전환
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    } else {
      // 타이머가 정지되었을 때는 0으로 리셋
      Animated.timing(gaugeAnimatedValue, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [isRunning, isStudy, studyMinutes, breakMinutes, remaining]);

  // 애니메이션(진행률)
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1 - remaining / (isStudy ? studyMinutes * 60 : breakMinutes * 60),
      duration: 500,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [remaining, isStudy, studyMinutes, breakMinutes]);

  // 네비게이션 바 스무스 슬라이드 애니메이션 (플로팅 스타일 적용)
  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    if (isMiniMode) {
      // 미니모드: 점진적으로 아래로 슬라이드하며 숨김
      let step = 0;
      const slideDown = () => {
        step += 15;
        parent.setOptions({
          tabBarStyle: {
            backgroundColor: theme.colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.light,
            borderRadius: 20,
            marginHorizontal: 16,
            marginBottom: Platform.OS === 'ios' ? 20 - step : 16 - step, // 아래로 이동
            paddingBottom: Platform.OS === 'ios' ? 34 : 10,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 102 : 68,
            shadowColor: theme.colors.text.primary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            opacity: Math.max(0, 1 - step / 100), // 점점 투명하게
          }
        });
        
        if (step < 100) {
          setTimeout(slideDown, 15); // 15ms마다 실행
        } else {
          // 완전히 숨김
          parent.setOptions({
            tabBarStyle: { display: 'none' }
          });
        }
      };
      
      setTimeout(slideDown, 200); // 다른 애니메이션과 동기화
    } else {
      // 일반모드: 아래서 위로 슬라이드하며 나타남
      let step = 100;
      const slideUp = () => {
        step -= 10;
        parent.setOptions({
          tabBarStyle: {
            backgroundColor: theme.colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.light,
            borderRadius: 20,
            marginHorizontal: 16,
            marginBottom: Platform.OS === 'ios' ? 20 - step : 16 - step, // 위로 이동
            paddingBottom: Platform.OS === 'ios' ? 34 : 10,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 102 : 68,
            shadowColor: theme.colors.text.primary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            opacity: Math.min(1, (100 - step) / 100), // 점점 불투명하게
          }
        });
        
        if (step > 0) {
          setTimeout(slideUp, 15);
        } else {
          // 기본 스타일로 복원 (플로팅 스타일 유지)
          parent.setOptions({
            tabBarStyle: {
              backgroundColor: theme.colors.background.primary,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border.light,
              borderRadius: 20,
              marginHorizontal: 16,
              marginBottom: Platform.OS === 'ios' ? 20 : 16,
              paddingBottom: Platform.OS === 'ios' ? 34 : 10,
              paddingTop: 8,
              height: Platform.OS === 'ios' ? 102 : 68,
              shadowColor: theme.colors.text.primary,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 10,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }
          });
        }
      };
      
      slideUp();
    }
  }, [isMiniMode, navigation]);

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

  // 모드 전환 시 게이지바를 0으로 리셋 후 다시 시작
  const resetGaugeAnimation = useCallback(() => {
    Animated.sequence([
      // 먼저 0으로 부드럽게 되돌리기
      Animated.timing(gaugeAnimatedValue, {
        toValue: 0,
        duration: 600,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      // 잠시 멈춤
      Animated.delay(200),
      // 새로운 진행률로 시작
      Animated.timing(gaugeAnimatedValue, {
        toValue: 0, // 새로 시작하므로 0에서 시작
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  // 미니모드 토글 함수
  const toggleMiniMode = useCallback(() => {
    const toMini = !isMiniMode;
    setIsMiniMode(toMini);
    
    if (toMini) {
      // 미니모드로 전환: 다른 요소들 줄어들면서 소멸 + 네비게이션 숨김
      Animated.parallel([
        Animated.timing(scaleAnimatedValue, {
          toValue: 0, // 다른 요소들 줄어들면서 소멸
          duration: 400,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimatedValue, {
          toValue: 0, // 투명화
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 일반모드로 복귀: 다른 요소들 나타나면서 확대
      Animated.parallel([
        Animated.timing(scaleAnimatedValue, {
          toValue: 1, // 원래 크기로
          duration: 400,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimatedValue, {
          toValue: 1, // 다른 요소들 표시
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isMiniMode]);

  const handleSwitch = useCallback(() => {
    console.log('handleSwitch 호출됨 - 현재 soundEnabled:', soundEnabled);
    setIsRunning(false);
    
    // 게이지바 리셋 애니메이션 시작
    resetGaugeAnimation();
    
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

  // iOS 스타일 배경 그라데이션 애니메이션 (Reanimated 사용)
  const gradientProgress = useSharedValue(0);
  const waveProgress = useSharedValue(0);
  const rotationProgress = useSharedValue(0);
  const scaleProgress = useSharedValue(0);
  const blurProgress = useSharedValue(0);

  // 컬러풀한 그라데이션 색상들
  const gradientColors = useMemo(() => [
    ['#FF6B6B', '#4ECDC4'], // 빨강-청록
    ['#A8E6CF', '#DCEDC8'], // 연한 초록-연한 노랑
    ['#FFD93D', '#FF6B6B'], // 노랑-빨강
    ['#6C5CE7', '#A29BFE'], // 보라-연한 보라
    ['#FD79A8', '#FDCB6E'], // 분홍-주황
    ['#00B894', '#00CEC9'], // 초록-청록
  ], []);

  // 현재 그라데이션 색상 (모드에 따라 변경)
  const currentGradient = useMemo(() => {
    const index = isStudy ? 0 : 1;
    return gradientColors[index];
  }, [isStudy, gradientColors]);

  useEffect(() => {
    // 무한 루프 애니메이션 시작
    gradientProgress.value = withRepeat(
      withTiming(1, { duration: 15000 }),
      -1,
      false
    );

    waveProgress.value = withRepeat(
      withTiming(1, { duration: 20000 }),
      -1,
      false
    );

    rotationProgress.value = withRepeat(
      withTiming(1, { duration: 30000 }),
      -1,
      false
    );

    scaleProgress.value = withRepeat(
      withTiming(1, { duration: 12000 }),
      -1,
      false
    );

    blurProgress.value = withRepeat(
      withTiming(1, { duration: 8000 }),
      -1,
      false
    );
  }, []);

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

  // 원형 타이머 스타일 (크기 고정)
  const circleSize = 270;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // SVG stroke-dasharray를 위한 계산
  const strokeDasharray = circumference;
  
  // 애니메이션된 strokeDashoffset 계산
  const animatedStrokeDashoffset = useMemo(() => {
    return gaugeAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, 0], // 0%에서 100%로 채워짐
      extrapolate: 'clamp',
    });
  }, [circumference]);

  return (
    <View style={styles.container}>
      {/* 야경 배경과 몽환적인 비눗방울 효과 */}
      <DreamyNightBackground />
      
            {/* 설정 버튼 */}
      <Animated.View style={[
        styles.settingsButton,
        {
          opacity: opacityAnimatedValue,
          transform: [{ scale: scaleAnimatedValue }]
        }
      ]}>
        <TouchableOpacity
          onPress={handleSettings}
          activeOpacity={0.7}
          style={{ width: '100%', height: '100%' }}
        >
          <View style={styles.glassButton}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* 알림 토글 버튼 */}
      <TouchableOpacity 
        style={styles.soundToggleButton} 
        onPress={handleSoundToggle}
        activeOpacity={0.7}
      >
        <View style={styles.glassButton}>
          <Text style={styles.soundToggleIcon}>
            {soundEnabled ? '♫' : '♪'}
          </Text>
        </View>
      </TouchableOpacity>
      
              <Animated.View 
          style={[
            styles.nightCycleBadge,
            { 
              opacity: opacityAnimatedValue,
              transform: [{ scale: scaleAnimatedValue }]
            }
          ]}
        >
        <Text style={styles.nightCycleText}>{cycle}번째 사이클</Text>
      </Animated.View>
      
              {/* 누적 시간 표시 */}
        {modeHistory.length > 0 && (
          <Animated.View 
            style={[
              styles.nightAccumulatedTimeContainer,
              { 
                opacity: opacityAnimatedValue,
                transform: [{ scale: scaleAnimatedValue }]
              }
            ]}
          >
            <View style={styles.timeStatRow}>
              <Text style={styles.nightAccumulatedTimeText}>
                누적 공부: {formatTime(totalStudySeconds)}
              </Text>
            </View>
            <View style={styles.timeStatRow}>
              <Text style={styles.nightAccumulatedTimeText}>
                누적 휴식: {formatTime(totalRestSeconds)}
              </Text>
            </View>

          </Animated.View>
        )}
              {/* 타이머 영역은 고정 (애니메이션 없음) */}
          <View style={styles.nightTimerWrapper}>
                        <TouchableOpacity
              onPress={toggleMiniMode}
              activeOpacity={0.8}
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              {/* 타이머 동그란 영역은 항상 표시 */}
              <View style={styles.nightShadowCircle} />
              
              {/* SVG 원형 진행바 */}
              <Svg
                width={circleSize}
                height={circleSize}
                style={styles.svgContainer}
              >
                {/* 배경 원 */}
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                
                {/* 진행 상황 원 */}
                <AnimatedCircle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke={isStudy ? '#A8D8EA' : '#FFD93D'}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={animatedStrokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
                />
              </Svg>
              
              <View style={styles.nightInnerCircle}>
                <Text style={styles.nightTimeText}>
                  {formatTime(remaining)}
                </Text>
                <Text style={styles.nightStatusText}>
                  {isStudy ? '집중 중 🌟' : '휴식 중 🌙'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
              <Animated.View 
          style={[
            styles.nightButtonRow,
            { 
              opacity: opacityAnimatedValue,
              transform: [{ scale: scaleAnimatedValue }]
            }
          ]}
        >
        <TouchableOpacity
          style={styles.nightButton}
          onPress={handleStartPause}
          activeOpacity={0.8}
        >
          <View style={styles.nightButtonInner}>
            <Text style={styles.nightButtonText}>{isRunning ? '일시정지' : '시작'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nightButton}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <View style={styles.nightButtonInner}>
            <Text style={styles.nightButtonText}>리셋</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nightButton}
          onPress={handleSwitch}
          activeOpacity={0.8}
        >
          <View style={styles.nightButtonInner}>
            <Text style={styles.nightButtonText}>모드전환</Text>
          </View>
        </TouchableOpacity>
        </Animated.View>
            {/* 공부 종료 버튼 - 조건부 활성화 */}
      {canFinishStudy() ? (
        <Animated.View style={{ 
          opacity: opacityAnimatedValue,
          transform: [{ scale: scaleAnimatedValue }]
        }}>
          <TouchableOpacity 
            style={styles.nightFinishButton} 
            onPress={handleFinishAndSave} 
            activeOpacity={0.85}
          >
            <View style={styles.nightFinishButtonInner}>
              <Text style={styles.nightFinishButtonText}>공부 종료</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View style={{ 
          opacity: opacityAnimatedValue,
          transform: [{ scale: scaleAnimatedValue }]
        }}>
          <TouchableOpacity 
            style={[styles.nightFinishButton, styles.nightFinishButtonDisabled]}
            activeOpacity={0.85}
            disabled={true}
          >
            <View style={styles.nightFinishButtonInner}>
              <Text style={[styles.nightFinishButtonText, styles.nightFinishButtonTextDisabled]}>공부 종료</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
      
            {/* AI 피드백 버튼 */}
      {savedTimerId && (
        <Animated.View style={{ 
          opacity: opacityAnimatedValue,
          transform: [{ scale: scaleAnimatedValue }]
        }}>
          <TouchableOpacity
            style={[styles.nightAiButton, aiLoading && styles.nightAiButtonDisabled]}
            onPress={handleAiFeedback}
            activeOpacity={0.85}
            disabled={aiLoading}
          >
            <View style={styles.nightAiButtonInner}>
              <Text style={styles.nightAiButtonText}>
                {aiLoading ? 'AI 분석 중...' : 'AI 피드백 받기'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
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
    backgroundColor: 'transparent',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  // iOS 스타일 배경 그라데이션 스타일

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
    zIndex: 10,
  },
  soundToggleIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  blurGradient: {
    flex: 1,
  },
  // 배경 컨테이너 스타일
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  // 야경 배경과 비눗방울 스타일
  nightBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bubble: {
    position: 'absolute',
    zIndex: 0,
  },
  bubbleInner: {
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  // 야경 분위기 스타일들
  glassButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    // 글래스모핑 효과를 위한 블러 백그라운드
    backdropFilter: 'blur(20px)',
  },
  nightCycleBadge: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  nightCycleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  nightAccumulatedTimeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  timeStatRow: {
    marginVertical: 4,
  },
  nightAccumulatedTimeText: {
    fontSize: 14,
    color: '#E8F4FD',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nightTimerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  nightShadowCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  svgContainer: {
    position: 'absolute',
  },
  nightInnerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  nightTimeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  nightStatusText: {
    fontSize: 16,
    color: '#B8E6B8',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nightButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  nightButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  nightButtonInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  nightButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nightFinishButton: {
    marginBottom: 15,
    marginHorizontal: 30,
  },
  nightFinishButtonInner: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  nightFinishButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  nightFinishButtonDisabled: {
    opacity: 0.3,
  },
  nightFinishButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  nightAiButton: {
    marginHorizontal: 30,
  },
  nightAiButtonInner: {
    backgroundColor: 'rgba(168, 216, 234, 0.15)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: 'rgba(168, 216, 234, 0.3)',
    shadowColor: '#A8D8EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  nightAiButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nightAiButtonDisabled: {
    opacity: 0.6,
  },
  mainGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradientFill: {
    flex: 1,
  },
  waveGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  rotationGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});

export default TimerScreen; 