import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/common/Card';
import { theme } from '../../theme';

interface TimerRecord {
  id: number;
  startTime: string;
  endTime: string;
  studyMinutes: number;
  restMinutes: number;
  mode: string;
  summary: string;
}

const StatisticsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<TimerRecord[]>([]);

  useEffect(() => {
    // 실제로는 인증 토큰 필요, 예시용 fetch
    fetch('http://localhost:8080/api/timer/history', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecords(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: TimerRecord }) => (
    <Card style={styles.card} elevation="md" borderRadius="md">
      <Text style={styles.dateText}>{formatDate(item.startTime)}</Text>
      <View style={styles.row}>
        <Text style={styles.modeText}>모드: {item.mode}</Text>
        <Text style={styles.timeText}>공부 {item.studyMinutes}분 / 휴식 {item.restMinutes}분</Text>
      </View>
      <Text style={styles.summaryText}>{item.summary || '요약 없음'}</Text>
    </Card>
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <Text style={styles.title}>타이머 기록 통계</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary[500]} style={{ marginTop: 40 }} />
        ) : records.length === 0 ? (
          <Text style={styles.emptyText}>아직 기록이 없습니다.</Text>
        ) : (
          <FlatList
            data={records}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    // paddingTop: 24, // SafeAreaView가 처리하므로 제거
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary[500],
    marginBottom: 18,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: 32,
  },
  card: {
    marginBottom: theme.spacing[4],
    backgroundColor: '#FFF',
    borderRadius: 18,
    shadowColor: '#AEE6FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
    padding: theme.spacing[4],
  },
  dateText: {
    fontSize: 16,
    color: '#7ED957',
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modeText: {
    fontSize: 15,
    color: '#6EC1E4',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 15,
    color: '#FFB6B6',
    fontWeight: '500',
  },
  summaryText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    fontSize: 16,
    marginTop: 40,
  },
});

export default StatisticsScreen; 