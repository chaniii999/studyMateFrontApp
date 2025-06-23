import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { theme } from '../../theme';

// 한글 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};
LocaleConfig.defaultLocale = 'kr';

const ScheduleScreen = () => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>주간 스케쥴</Text>
      </View>
      <Calendar
        current={today}
        // 주간 캘린더로 보이도록 설정 (라이브러리 자체 기능은 월간)
        // week모드는 react-native-calendars의 기본 기능이 아님
        // UI 커스터마이징을 통해 주간처럼 보이게 만들어야 함
        // 여기서는 기본 월간 캘린더를 보여주고, 추후 주간 뷰로 커스텀하는 것을 제안합니다.
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
          textDayFontFamily: theme.typography.fontFamily.regular,
          textMonthFontFamily: theme.typography.fontFamily.bold,
          textDayHeaderFontFamily: theme.typography.fontFamily.medium,
          textDayFontSize: theme.typography.fontSize.base,
          textMonthFontSize: theme.typography.fontSize.lg,
          textDayHeaderFontSize: theme.typography.fontSize.sm,
        }}
      />
      <View style={styles.scheduleList}>
        <Text style={styles.listTitle}>오늘의 스케쥴</Text>
        {/* 스케쥴 목록이 여기에 표시됩니다. */}
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
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: 'bold',
    color: theme.colors.text.primary,
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
  }
});

export default ScheduleScreen; 