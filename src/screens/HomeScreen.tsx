import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_HEIGHT = 120;
const CARD_SPACING = theme.spacing[3];
const SIDE_PADDING = theme.spacing[4];
// SafeAreaView가 상단 패딩을 처리하므로 TOP_PADDING 제거

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>오늘의 할 일</Text>
          <Text style={styles.cardContent}>오늘 완료해야 할 학습 과제를 확인하세요.</Text>
          <Button title="할 일 보기" onPress={() => {}} size="sm" style={styles.button} />
        </Card>
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>학습 통계</Text>
          <Text style={styles.cardContent}>이번 주 학습 시간: 5시간 30분</Text>
          <Button title="통계 보기" onPress={() => {}} size="sm" style={styles.button} variant="secondary" />
        </Card>
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>빠른 시작</Text>
          <Text style={styles.cardContent}>지금 바로 타이머를 시작해 집중 학습을 시작하세요.</Text>
          <Button title="타이머 시작" onPress={() => {
            navigation.navigate('Timer', {
              screen: 'TimerScreen',
              params: { autoStart: true },
            });
          }} size="sm" style={styles.button} variant="primary" />
        </Card>
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>알림</Text>
          <Text style={styles.cardContent}>새로운 알림이 없습니다.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 32,
  },
  card: {
    marginBottom: CARD_SPACING,
    minHeight: CARD_HEIGHT,
    width: '100%',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    // 그림자와 라운드가 Card 컴포넌트에서 적용됨
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  cardContent: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});

export default HomeScreen; 