import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { theme } from '../../theme';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';

// 한글 설정 (date-fns용)
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};
LocaleConfig.defaultLocale = 'kr';

// Mock 데이터
const MOCK_SCHEDULES = [
  { id: '1', date: '2024-07-29', title: 'React Native 스터디', time: '10:00 - 12:00' },
  { id: '2', date: '2024-07-29', title: '알고리즘 문제 풀이', time: '14:00 - 15:00' },
  { id: '3', date: '2024-07-31', title: '프로젝트 기획 회의', time: '11:00 - 12:30' },
  { id: '4', date: '2024-08-01', title: '디자인 시스템 작업', time: '16:00 - 18:00' },
  { id: '5', date: '2024-08-05', title: '백엔드 API 연동', time: '09:00 - 11:00' },
];


const ScheduleScreen = () => {
  const [viewMode, setViewMode] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTitlePress = () => {
    if (viewMode === 'monthly') setViewMode('weekly');
    else if (viewMode === 'weekly') setViewMode('daily');
    else setViewMode('monthly');
  };

  const title = useMemo(() => {
    if (viewMode === 'monthly') return '월간 스케쥴';
    if (viewMode === 'weekly') return '주간 스케쥴';
    return '일간 스케쥴';
  }, [viewMode]);

  const listTitle = useMemo(() => {
    const date = new Date(selectedDate);
    if (viewMode === 'daily') {
      return format(date, 'M월 d일 (EEE)', { locale: ko });
    }
    if (viewMode === 'weekly') {
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${format(start, 'M월 d일')} - ${format(end, 'M월 d일')}`;
    }
    return format(date, 'yyyy년 M월', { locale: ko });
  }, [viewMode, selectedDate]);


  const filteredSchedules = useMemo(() => {
    const date = new Date(selectedDate);
    
    if (viewMode === 'daily') {
      return MOCK_SCHEDULES.filter(schedule => schedule.date === selectedDate);
    }
    
    let interval;
    if (viewMode === 'weekly') {
      interval = {
        start: startOfWeek(date, { weekStartsOn: 0 }), // 0: 일요일 시작
        end: endOfWeek(date, { weekStartsOn: 0 }),
      };
    } else { // 'monthly'
      interval = {
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    }

    return MOCK_SCHEDULES.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return isWithinInterval(scheduleDate, interval);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [viewMode, selectedDate]);


  const markedDates = useMemo(() => {
    const dots = MOCK_SCHEDULES.reduce((acc, schedule) => {
      acc[schedule.date] = { marked: true, dotColor: theme.colors.secondary[500] };
      return acc;
    }, {} as any);

    dots[selectedDate] = {
      ...dots[selectedDate],
      selected: true,
      selectedColor: theme.colors.primary[500],
    };

    return dots;
  }, [selectedDate]);


  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={handleTitlePress}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>클릭하여 뷰 변경</Text>
      </TouchableOpacity>
      <Calendar
        key={viewMode}
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
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
        <Text style={styles.listTitle}>{listTitle}</Text>
        <FlatList
          data={filteredSchedules}
          extraData={viewMode}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.scheduleItem}>
              <Text style={styles.itemTime}>{item.time}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>스케쥴이 없습니다.</Text>}
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
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },
  scheduleList: {
    flex: 1,
    padding: theme.spacing[4],
  },
  listTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  scheduleItem: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    width: 100,
  },
  itemTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing[8],
    color: theme.colors.text.secondary,
  }
});

export default ScheduleScreen; 