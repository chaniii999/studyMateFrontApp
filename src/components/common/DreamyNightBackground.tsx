import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

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

      <Reanimated.View style={[styles.bubble, bubbleStyle3, { transform: [{ translateX: screenWidth * 0.6 }] }]}>
        <View style={[styles.bubbleInner, { width: 25, height: 25 }]} />
      </Reanimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default DreamyNightBackground; 