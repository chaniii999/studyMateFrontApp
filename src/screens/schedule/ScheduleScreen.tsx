import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Swipeable } from 'react-native-gesture-handler';
import { theme } from '../../theme';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';
import { scheduleService } from '../../services/scheduleService';
import { ScheduleResponse, ScheduleStatus } from '../../types/schedule';

import Button from '../../components/common/Button';

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
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('monthly');

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
    
    if (viewMode === 'daily') {
      return schedules.filter(schedule => schedule.scheduleDate === selectedDate);
    }
    
    let interval;
    if (viewMode === 'weekly') {
      interval = {
        start: startOfWeek(date, { weekStartsOn: 0 }),
        end: endOfWeek(date, { weekStartsOn: 0 }),
      };
    } else {
      interval = {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    }

    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.scheduleDate);
      return isWithinInterval(scheduleDate, interval);
    }).sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());
  }, [schedules, viewMode, selectedDate]);

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

  // 시간 포맷팅
  const formatTime = (time?: string) => {
    if (!time) return '종일';
    return time.substring(0, 5);
  };

  // 캘린더 날짜 클릭 핸들러
  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    // 해당 날짜에 스케줄이 없으면 생성 페이지로 이동
    const hasSchedule = schedules.some(schedule => schedule.scheduleDate === day.dateString);
    if (!hasSchedule) {
      navigation.navigate('ScheduleCreate', { selectedDate: day.dateString });
    }
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
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
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
    if (viewMode === 'monthly') setViewMode('weekly');
    else if (viewMode === 'weekly') setViewMode('daily');
    else setViewMode('monthly');
  };

  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'monthly': return '월간';
      case 'weekly': return '주간';
      case 'daily': return '일간';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>스케줄을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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

      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        hideExtraDays={viewMode !== 'monthly'}
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

      <View style={styles.scheduleList}>
        <Text style={styles.listTitle}>
          {format(new Date(selectedDate), 'M월 d일 (EEE)', { locale: ko })} 스케줄
        </Text>
        
        <FlatList
          data={filteredSchedules}
          keyExtractor={(item) => item.id}
          renderItem={renderScheduleItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>스케줄이 없습니다</Text>
              <Button
                title="새 스케줄 만들기"
                onPress={() => navigation.navigate('ScheduleCreate', { selectedDate })}
                style={styles.emptyButton}
              />
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  },
  scheduleList: {
    flex: 1,
    padding: theme.spacing[4],
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  scheduleItem: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[8],
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default ScheduleScreen; 