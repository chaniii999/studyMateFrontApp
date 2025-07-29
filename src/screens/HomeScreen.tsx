import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, StatusBar } from 'react-native';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DreamyNightBackground from '../components/common/DreamyNightBackground';
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

  // 홈 통계 조회 (백엔드 home-stats API 사용)
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
        // API 실패 시 폴백 로직
        await loadHomeStatsFromHistory();
      }
    } catch (error: any) {
      console.error('홈 통계 조회 에러:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // 에러 시 폴백 로직
      await loadHomeStatsFromHistory();
    }
  };

  // 폴백용 클라이언트 사이드 계산
  const loadHomeStatsFromHistory = async () => {
    try {
      console.log('폴백: 타이머 히스토리 API 호출 시작');
      const response = await apiClient.get('/timer/history');
      console.log('폴백: 타이머 히스토리 API 응답:', response);
      
      if (response.success && response.data) {
        // 오늘 날짜 (로컬 시간대 기준)
        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        
        // 이번 주 시작일 계산 (월요일)
        const dayOfWeek = now.getDay(); // 0 = 일요일, 1 = 월요일, ...
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 월요일까지의 오프셋
        const thisMonday = new Date(now);
        thisMonday.setDate(now.getDate() - mondayOffset);
        const weekStart = format(thisMonday, 'yyyy-MM-dd');
        
        console.log('폴백: 날짜 계산:', { 
          today, 
          weekStart, 
          currentDay: dayOfWeek,
          mondayOffset 
        });
        
        // 각 기록의 날짜를 확인하고 필터링
        console.log('폴백: 전체 기록 확인 시작');
        const todayRecords = [];
        const weekRecords = [];
        
        for (const record of response.data) {
          // startTime을 로컬 날짜로 변환 (시간대 고려)
          const recordDate = new Date(record.startTime);
          const recordDateString = format(recordDate, 'yyyy-MM-dd');
          
          console.log(`기록 ${record.id}: startTime=${record.startTime}, 변환된날짜=${recordDateString}, studyTime=${record.studyTime}`);
          
          // 오늘 기록인지 확인
          if (recordDateString === today) {
            todayRecords.push(record);
            console.log(`✅ 오늘 기록으로 추가: ${record.id}`);
          }
          
          // 이번 주 기록인지 확인 (월요일부터 오늘까지)
          if (recordDateString >= weekStart && recordDateString <= today) {
            weekRecords.push(record);
            console.log(`✅ 이번주 기록으로 추가: ${record.id}`);
          }
        }
        
        // 오늘 총 공부시간 계산
        const todayStudySeconds = todayRecords.reduce((total: number, record: any) => {
          const studyTime = record.studyTime || 0;
          console.log(`오늘 기록 ${record.id}: +${studyTime}초`);
          return total + studyTime;
        }, 0);
        
        // 이번 주 총 공부시간 계산
        const weekStudySeconds = weekRecords.reduce((total: number, record: any) => {
          const studyTime = record.studyTime || 0;
          console.log(`이번주 기록 ${record.id}: +${studyTime}초`);
          return total + studyTime;
        }, 0);
        
        const todayStudyMinutes = Math.floor(todayStudySeconds / 60);
        const weekStudyMinutes = Math.floor(weekStudySeconds / 60);
        
        setTodayStudyTime(todayStudyMinutes);
        setWeekStudyTime(weekStudyMinutes);
        
        console.log('폴백: 홈 통계 계산 완료:', {
          오늘기록수: todayRecords.length,
          이번주기록수: weekRecords.length,
          오늘공부초: todayStudySeconds,
          오늘공부분: todayStudyMinutes,
          이번주공부초: weekStudySeconds,
          이번주공부분: weekStudyMinutes,
          오늘기록들: todayRecords.map(r => ({ id: r.id, studyTime: r.studyTime, startTime: r.startTime })),
          이번주기록들: weekRecords.map(r => ({ id: r.id, studyTime: r.studyTime, startTime: r.startTime }))
        });
      } else {
        console.log('폴백: 타이머 히스토리 API 응답 실패:', response);
        setTodayStudyTime(0);
        setWeekStudyTime(0);
      }
    } catch (error: any) {
      console.error('폴백: 타이머 히스토리 조회 에러:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // 최종 실패 시 기본값 0으로 설정
      setTodayStudyTime(0);
      setWeekStudyTime(0);
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
    <View style={styles.container}>
      {/* StatusBar 설정 */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 야경 배경 추가 */}
      <DreamyNightBackground />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘의 총 공부시간 */}
        <Card style={styles.studyTimeCard} elevation="lg" borderRadius="lg">
          <Text style={styles.studyTimeTitle}>오늘의 총 공부시간</Text>
          <Text style={styles.studyTimeValue}>{formatStudyTime(todayStudyTime)}</Text>
        </Card>

        {/* 오늘 스케줄 */}
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>오늘 스케줄</Text>
          {loading ? (
            <Text style={styles.cardContent}>로딩 중...</Text>
          ) : todaySchedules.length > 0 ? (
            todaySchedules.slice(0, 3).map((schedule: any) => (
              <View
                key={schedule.id}
                style={styles.scheduleItem}
              >
                <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                <Text style={styles.scheduleTime}>{formatTime(schedule.startTime)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.cardContent}>오늘 예정된 스케줄이 없습니다.</Text>
          )}
          <Button 
            title="오늘 스케줄" 
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

        {/* 빠른 액션 */}
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>빠른 시작</Text>
          <Text style={styles.cardContent}>지금 바로 공부를 시작해보세요!</Text>
          <Button 
            title="타이머 시작" 
            onPress={() => {
              navigation.navigate('Timer' as any);
            }} 
            size="sm" 
            style={styles.button} 
            variant="primary" 
          />
        </Card>

        {/* 학습 목표 */}
        <Card style={styles.card} elevation="md" borderRadius="md">
          <Text style={styles.cardTitle}>학습 목표</Text>
          <Text style={styles.cardContent}>매일 조금씩 꾸준히 성장하세요.</Text>
          <Button 
            title="목표 설정" 
            onPress={() => {
              // TODO: 목표 설정 화면으로 이동
            }} 
            size="sm" 
            style={styles.button} 
            variant="outline" 
          />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // 배경을 투명하게 하여 DreamyNightBackground가 보이도록
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIDE_PADDING,
    paddingTop: 60, // StatusBar 영역을 고려한 상단 패딩
    paddingBottom: 120, // 네비게이션 바 영역을 고려한 하단 패딩
  },
  studyTimeCard: {
    marginBottom: CARD_SPACING,
    minHeight: CARD_HEIGHT + 20,
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // 반투명 글래스모피즘
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  studyTimeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // 흰색 텍스트
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  studyTimeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // 흰색 텍스트
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    marginBottom: CARD_SPACING,
    minHeight: CARD_HEIGHT,
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)', // 반투명 글래스모피즘
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // 흰색 텍스트
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)', // 약간 반투명한 흰색 텍스트
    marginBottom: 12,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleTitle: {
    fontSize: 14,
    color: '#FFFFFF', // 흰색 텍스트
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  scheduleTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)', // 반투명한 흰색 텍스트
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  button: {
    marginTop: 8,
  },
});

export default HomeScreen; 