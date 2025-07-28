import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { scheduleService } from '../services/scheduleService';
import { ScheduleResponse } from '../types/schedule';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import apiClient from '../services/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_HEIGHT = 120;
const CARD_SPACING = theme.spacing[3];
const SIDE_PADDING = theme.spacing[4];

interface HomeStats {
  todayStudyMinutes: number;
  weekStudyMinutes: number;
  todayStudySeconds: number;
  weekStudySeconds: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [todaySchedules, setTodaySchedules] = useState<ScheduleResponse[]>([]);
  const [todayStudyTime, setTodayStudyTime] = useState(0); // 분 단위
  const [weekStudyTime, setWeekStudyTime] = useState(0); // 분 단위
  const [loading, setLoading] = useState(true);

  // 오늘 날짜
  const today = format(new Date(), 'yyyy-MM-dd');

  // 오늘 스케줄 로드
  const loadTodaySchedules = async () => {
    try {
      setLoading(true);
      const allSchedules = await scheduleService.getAllSchedules();
      const todaySchedules = allSchedules.filter(schedule => 
        schedule.scheduleDate === today
      );
      setTodaySchedules(todaySchedules);
    } catch (error) {
      console.error('오늘 스케줄 로드 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  // 홈 통계 조회 (새로운 API 사용)
  const loadHomeStats = async () => {
    try {
      console.log('홈 통계 API 호출 시작');
      const response = await apiClient.get('/timer/home-stats');
      console.log('홈 통계 API 응답:', response);
      
      if (response.success && response.data) {
        const stats: HomeStats = response.data;
        setTodayStudyTime(stats.todayStudyMinutes);
        setWeekStudyTime(stats.weekStudyMinutes);
        
        console.log('홈 통계 조회 성공:', {
          오늘공부분: stats.todayStudyMinutes,
          이번주공부분: stats.weekStudyMinutes,
          오늘공부초: stats.todayStudySeconds,
          이번주공부초: stats.weekStudySeconds
        });
      } else {
        console.log('홈 통계 API 응답 실패:', response);
      }
    } catch (error) {
      console.error('홈 통계 조회 에러:', error);
      // 에러 시 기본값 0으로 설정
      setTodayStudyTime(0);
      setWeekStudyTime(0);
      
      // 기존 방식으로 폴백
      console.log('기존 방식으로 폴백 시도');
      try {
        const response = await apiClient.get('/timer/history');
        if (response.success && response.data) {
          const todayRecords = response.data.filter((record: any) => {
            const recordDate = new Date(record.startTime).toISOString().split('T')[0];
            return recordDate === today;
          });
          
          const totalStudySeconds = todayRecords.reduce((total: number, record: any) => {
            console.log('레코드 확인:', record);
            return total + (record.studyTime || 0);
          }, 0);
          
          const totalStudyMinutes = Math.floor(totalStudySeconds / 60);
          setTodayStudyTime(totalStudyMinutes);
          
          console.log('폴백 방식으로 오늘 공부시간 계산:', {
            오늘기록수: todayRecords.length,
            총공부초: totalStudySeconds,
            총공부분: totalStudyMinutes,
            개별기록: todayRecords.map((r: any) => ({ id: r.id, studyTime: r.studyTime, startTime: r.startTime }))
          });
        }
      } catch (fallbackError) {
        console.error('폴백 방식도 실패:', fallbackError);
      }
    }
  };

  // 시간 포맷팅
  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}시간`;
    }
    return `${hours}시간 ${remainingMinutes}분`;
  };

  // 시간 포맷팅 (스케줄용)
  const formatTime = (time?: string) => {
    if (!time) return '종일';
    return time.substring(0, 5);
  };

  useEffect(() => {
    loadTodaySchedules();
    loadHomeStats(); // 기존 calculateTodayStudyTime 대신 새로운 API 사용
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘 총 공부시간 */}
        <Card style={styles.studyTimeCard} elevation="lg" borderRadius="lg">
          <Text style={styles.studyTimeTitle}>오늘 총 공부시간</Text>
          <Text style={styles.studyTimeValue}>{formatStudyTime(todayStudyTime)}</Text>
        </Card>

        {/* 오늘의 할 일 */}
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>오늘의 할 일</Text>
          {loading ? (
            <Text style={styles.cardContent}>스케줄을 불러오는 중...</Text>
          ) : todaySchedules.length > 0 ? (
            <View style={styles.scheduleList}>
              {todaySchedules.slice(0, 3).map((schedule) => (
                <View key={schedule.id} style={styles.scheduleItem}>
                  <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                  <Text style={styles.scheduleTime}>
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </Text>
                </View>
              ))}
              {todaySchedules.length > 3 && (
                <Text style={styles.moreSchedules}>+{todaySchedules.length - 3}개 더</Text>
              )}
            </View>
          ) : (
            <Text style={styles.cardContent}>오늘 예정된 스케줄이 없습니다.</Text>
          )}
          <Button 
            title="할 일 보기" 
            onPress={() => {
              navigation.navigate('Schedule' as any);
            }} 
            size="sm" 
            style={styles.button} 
          />
        </Card>

        {/* 학습 통계 */}
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>학습 통계</Text>
          <Text style={styles.cardContent}>이번 주 학습 시간: {formatStudyTime(weekStudyTime)}</Text>
          <Button 
            title="통계 보기" 
            onPress={() => {
              navigation.navigate('Statistics' as any);
            }} 
            size="sm" 
            style={styles.button} 
            variant="secondary" 
          />
        </Card>

        {/* 빠른 시작 */}
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>빠른 시작</Text>
          <Text style={styles.cardContent}>지금 바로 타이머를 시작해 집중 학습을 시작하세요.</Text>
          <Button 
            title="타이머 시작" 
            onPress={() => {
              navigation.navigate('Timer', {
                screen: 'TimerScreen',
                params: { autoStart: true },
              });
            }} 
            size="sm" 
            style={styles.button} 
            variant="primary" 
          />
        </Card>

        {/* 알림 */}
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
  studyTimeCard: {
    marginBottom: CARD_SPACING,
    minHeight: 100,
    width: '100%',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.primary[500],
  },
  studyTimeTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  studyTimeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
    textAlign: 'center',
  },
  card: {
    marginBottom: CARD_SPACING,
    minHeight: CARD_HEIGHT,
    width: '100%',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
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
  scheduleList: {
    marginBottom: theme.spacing[2],
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[1],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  scheduleTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    flex: 1,
  },
  scheduleTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  moreSchedules: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    textAlign: 'center',
    marginTop: theme.spacing[1],
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});

export default HomeScreen; 