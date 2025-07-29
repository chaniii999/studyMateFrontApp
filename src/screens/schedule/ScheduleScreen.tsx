import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Animated,
  StatusBar
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Swipeable } from 'react-native-gesture-handler';
import { theme } from '../../theme';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';
import { scheduleService } from '../../services/scheduleService';
import { ScheduleResponse, ScheduleStatus } from '../../types/schedule';
import Button from '../../components/common/Button';
import { DreamyNightBackground } from '../../components';

// 한글 설정 (date-fns용)
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};
LocaleConfig.defaultLocale = 'kr';

interface ScheduleScreenProps {
  navigation: any;
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ navigation }) => {
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [scrollY] = useState(new Animated.Value(0));

  // 스케줄 데이터 로드
  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getAllSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('스케줄 로드 에러:', error);
      Alert.alert('오류', '스케줄을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadSchedules();
    }, [])
  );

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSchedules();
    setRefreshing(false);
  };

  // 상태별 색상
  const getStatusColor = (status?: ScheduleStatus) => {
    if (!status) return theme.colors.primary[500];
    
    switch (status) {
      case ScheduleStatus.COMPLETED:
        return '#4CAF50';
      case ScheduleStatus.IN_PROGRESS:
        return '#2196F3';
      case ScheduleStatus.CANCELLED:
        return '#9E9E9E';
      case ScheduleStatus.POSTPONED:
        return '#FF9800';
      case ScheduleStatus.PLANNED:
        return theme.colors.primary[500];
      default:
        return theme.colors.primary[500];
    }
  };

  // 상태별 텍스트
  const getStatusText = (status?: ScheduleStatus) => {
    if (!status) return '계획됨';
    
    switch (status) {
      case ScheduleStatus.COMPLETED:
        return '완료';
      case ScheduleStatus.IN_PROGRESS:
        return '진행중';
      case ScheduleStatus.CANCELLED:
        return '취소';
      case ScheduleStatus.POSTPONED:
        return '연기';
      case ScheduleStatus.PLANNED:
        return '계획됨';
      default:
        return '계획됨';
    }
  };

  // 날짜별 스케줄 필터링
  const filteredSchedules = useMemo(() => {
    const date = new Date(selectedDate);
    
    if (viewMode === 'weekly') {
      // 주간 모드: 해당 주의 모든 스케줄을 시간순으로 표시
      const weekStart = startOfWeek(date, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
      
      return schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.scheduleDate);
        return isWithinInterval(scheduleDate, { start: weekStart, end: weekEnd });
      }).sort((a, b) => {
        // 날짜순 정렬 후 시간순 정렬
        const dateComparison = new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // 같은 날짜인 경우 시작 시간으로 정렬
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });
    } else {
      // 월간 모드: 선택된 날짜의 스케줄만 표시
      return schedules.filter(schedule => {
        return schedule.scheduleDate === selectedDate;
      }).sort((a, b) => {
        // 시작 시간순 정렬
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
      });
    }
  }, [schedules, selectedDate, viewMode]);

  // 캘린더 마킹 데이터
  const markedDates = useMemo(() => {
    const dots = schedules.reduce((acc, schedule) => {
      const color = getStatusColor(schedule.status);
      acc[schedule.scheduleDate] = { 
        marked: true, 
        dotColor: color,
        textColor: schedule.isOverdue ? '#FF6B6B' : undefined
      };
      return acc;
    }, {} as any);

    dots[selectedDate] = {
      ...dots[selectedDate],
      selected: true,
      selectedColor: theme.colors.primary[500],
    };

    return dots;
  }, [schedules, selectedDate]);

  // 주간 모드용 날짜 데이터
  const weekDates = useMemo(() => {
    if (viewMode === 'weekly') {
      const date = new Date(selectedDate);
      const weekStart = startOfWeek(date, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
      
      const dates = eachDayOfInterval({ start: weekStart, end: weekEnd }).map((date, index) => ({
        dateString: date.toISOString().split('T')[0],
        day: format(date, 'd'),
        dayName: format(date, 'EEE', { locale: ko }),
        isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
        isSelected: format(date, 'yyyy-MM-dd') === selectedDate,
        index: index,
      }));
      
      console.log('주간 날짜 데이터:', dates.map(d => ({ date: d.dateString, day: d.day, index: d.index })));
      return dates;
    }
    return [];
  }, [selectedDate, viewMode]);

  // 시간 포맷팅
  const formatTime = (time?: string) => {
    if (!time) return '종일';
    return time.substring(0, 5);
  };

  // 캘린더 날짜 클릭 핸들러
  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  // 주간 날짜 클릭 핸들러
  const handleWeekDayPress = (dateString: string) => {
    setSelectedDate(dateString);
  };

  // 주간 이동 핸들러
  const handleWeekChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  // 스케줄 클릭 핸들러
  const handleSchedulePress = (schedule: ScheduleResponse) => {
    navigation.navigate('ScheduleDetail', { scheduleId: schedule.id });
  };

  // 스케줄 수정
  const handleEditSchedule = (schedule: ScheduleResponse) => {
    navigation.navigate('ScheduleEdit', { scheduleId: schedule.id });
  };

  // 스케줄 삭제
  const handleDeleteSchedule = async (schedule: ScheduleResponse) => {
    Alert.alert(
      '스케줄 삭제',
      `"${schedule.title}" 스케줄을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await scheduleService.deleteSchedule(schedule.id);
              await loadSchedules();
              Alert.alert('완료', '스케줄이 삭제되었습니다.');
            } catch (error) {
              console.error('스케줄 삭제 에러:', error);
              Alert.alert('오류', '스케줄 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  // 스와이프 액션 렌더러
  const renderSwipeActions = (schedule: ScheduleResponse) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.editAction]}
          onPress={() => handleEditSchedule(schedule)}
        >
          <Text style={styles.swipeActionText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => handleDeleteSchedule(schedule)}
        >
          <Text style={styles.swipeActionText}>삭제</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 스케줄 아이템 렌더러
  const renderScheduleItem = ({ item }: { item: ScheduleResponse }) => {
    if (!item) return null;
    
    return (
      <Swipeable
        renderRightActions={() => renderSwipeActions(item)}
        rightThreshold={40}
      >
        <TouchableOpacity
          style={styles.scheduleItem}
          onPress={() => handleSchedulePress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusText(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
          
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleTime}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
            {item.studyGoal && (
              <Text style={styles.scheduleGoal} numberOfLines={1}>
                목표: {item.studyGoal}
              </Text>
            )}
          </View>

          {item.completionRate > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${item.completionRate}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{item.completionRate}%</Text>
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // 뷰 모드 변경
  const handleViewModeChange = () => {
    setViewMode(viewMode === 'monthly' ? 'weekly' : 'monthly');
  };

  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'monthly': return '월간';
      case 'weekly': return '주간';
      default: return '월간';
    }
  };

  // 주간 날짜 렌더러
  const renderWeekDays = () => {
    return (
      <View style={styles.weekDaysContainer}>
        <View style={styles.weekNavigation}>
          <TouchableOpacity onPress={() => handleWeekChange('prev')} style={styles.weekNavButton}>
            <Text style={styles.weekNavText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.weekTitle}>
            {format(new Date(selectedDate), 'M월 d일', { locale: ko })} 주
          </Text>
          <TouchableOpacity onPress={() => handleWeekChange('next')} style={styles.weekNavButton}>
            <Text style={styles.weekNavText}>▶</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.weekDays}>
          {weekDates.map((day, index) => (
            <TouchableOpacity
              key={day.dateString}
              style={[
                styles.weekDay,
                day.isSelected && styles.selectedWeekDay,
                day.isToday && styles.todayWeekDay,
              ]}
              onPress={() => {
                console.log('클릭된 날짜:', day.dateString, '인덱스:', index);
                handleWeekDayPress(day.dateString);
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.weekDayName,
                day.isSelected && styles.selectedWeekDayText,
                day.isToday && styles.todayWeekDayText,
              ]}>
                {day.dayName}
              </Text>
              <Text style={[
                styles.weekDayNumber,
                day.isSelected && styles.selectedWeekDayText,
                day.isToday && styles.todayWeekDayText,
              ]}>
                {day.day}
              </Text>
              {markedDates[day.dateString]?.marked && (
                <View style={[
                  styles.weekDayDot,
                  { backgroundColor: markedDates[day.dateString].dotColor }
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <DreamyNightBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>스케줄을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <DreamyNightBackground />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleViewModeChange}>
          <Text style={styles.title}>{getViewModeTitle()} 스케줄</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('ScheduleCreate', { selectedDate })}
        >
          <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 캘린더 영역 */}
        <View style={styles.calendarSection}>
          {viewMode === 'weekly' ? (
            renderWeekDays()
          ) : (
      <Calendar
        current={selectedDate}
              onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: theme.colors.background.primary,
          calendarBackground: theme.colors.background.primary,
          textSectionTitleColor: theme.colors.text.secondary,
          selectedDayBackgroundColor: theme.colors.primary[500],
          selectedDayTextColor: theme.colors.text.inverse,
          todayTextColor: theme.colors.primary[500],
          dayTextColor: theme.colors.text.primary,
          textDisabledColor: theme.colors.text.disabled,
          dotColor: theme.colors.primary[500],
          selectedDotColor: theme.colors.text.inverse,
          arrowColor: theme.colors.primary[500],
          monthTextColor: theme.colors.text.primary,
          indicatorColor: theme.colors.primary[500],
        }}
      />
          )}
        </View>

        {/* 스케줄 목록 영역 */}
      <View style={styles.scheduleList}>
          <Text style={styles.listTitle}>
            {viewMode === 'weekly' 
              ? `${format(new Date(selectedDate), 'M월 d일', { locale: ko })} 주 스케줄`
              : `${format(new Date(selectedDate), 'M월 d일 (EEE)', { locale: ko })} 스케줄`
            }
          </Text>
          
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((item) => (
              <View key={item.id}>
                {renderScheduleItem({ item })}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>스케줄이 없습니다</Text>
              <Button
                title="새 스케줄 만들기"
                onPress={() => navigation.navigate('ScheduleCreate', { selectedDate })}
                style={styles.emptyButton}
              />
            </View>
          )}
      </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60, // StatusBar 공간 확보
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    paddingTop: 60, // StatusBar 공간 확보
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scrollContainer: {
    flex: 1,
  },
  calendarSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    margin: theme.spacing[4],
    padding: theme.spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  weekDaysContainer: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[3],
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  weekNavButton: {
    padding: theme.spacing[2],
  },
  weekNavText: {
    fontSize: 18,
    color: theme.colors.primary[500],
    fontWeight: 'bold',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    width: '14.28%', // 100% / 7 = 14.28%
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[1],
    borderRadius: theme.borderRadius.base,
    position: 'relative',
    minHeight: 60,
    justifyContent: 'center',
  },
  selectedWeekDay: {
    backgroundColor: theme.colors.primary[500],
  },
  todayWeekDay: {
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  weekDayName: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  selectedWeekDayText: {
    color: theme.colors.text.inverse,
  },
  todayWeekDayText: {
    color: theme.colors.primary[500],
  },
  weekDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 8,
  },
  scheduleList: {
    padding: theme.spacing[4],
    paddingBottom: 120, // 네비게이션 바 공간 확보
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: theme.spacing[4],
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    letterSpacing: 0.5,
  },
  scheduleItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: '#64B5F6',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  scheduleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.3,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: '500',
  },
  scheduleInfo: {
    marginBottom: theme.spacing[2],
  },
  scheduleTime: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  scheduleGoal: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[2],
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  editAction: {
    backgroundColor: theme.colors.primary[500],
  },
  deleteAction: {
    backgroundColor: theme.colors.error,
  },
  swipeActionText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[8],
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    marginVertical: theme.spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: theme.spacing[4],
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    opacity: 0.9,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default ScheduleScreen; 