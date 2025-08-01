import React from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';

// 야경 배경 컴포넌트 (비눗방울 제거)
const DreamyNightBackground: React.FC = () => {
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
    </View>
  );
};

// 야경 배경 스타일
const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
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
});

export default DreamyNightBackground; 