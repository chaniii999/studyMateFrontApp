import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';
import Button from '../../components/common/Button';
import { scheduleService } from '../../services/scheduleService';
import { ScheduleResponse, ScheduleStatus } from '../../types/schedule';
import Card from '../../components/common/Card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ScheduleDetailScreenProps {
  navigation: any;
  route: {
    params: {
      scheduleId: string;
    };
  };
}

const ScheduleDetailScreen: React.FC<ScheduleDetailScreenProps> = ({ navigation, route }) => {
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getSchedule(route.params.scheduleId);
      setSchedule(data);
    } catch (error) {
      console.error('스케줄 로드 에러:', error);
      Alert.alert('오류', '스케줄을 불러오는데 실패했습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('ScheduleEdit', { scheduleId: schedule!.id });
  };

  const handleDelete = async () => {
    Alert.alert(
      '스케줄 삭제',
      `"${schedule!.title}" 스케줄을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await scheduleService.deleteSchedule(schedule!.id);
              Alert.alert('완료', '스케줄이 삭제되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('스케줄 삭제 에러:', error);
              Alert.alert('오류', '스케줄 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleStatusChange = async (newStatus: ScheduleStatus) => {
    try {
      const updatedSchedule = await scheduleService.updateScheduleStatus(schedule!.id, newStatus);
      setSchedule(updatedSchedule);
      Alert.alert('완료', '상태가 변경되었습니다.');
    } catch (error) {
      console.error('상태 변경 에러:', error);
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
  };

  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.COMPLETED:
        return '#4CAF50';
      case ScheduleStatus.IN_PROGRESS:
        return '#2196F3';
      case ScheduleStatus.CANCELLED:
        return '#9E9E9E';
      case ScheduleStatus.POSTPONED:
        return '#FF9800';
      default:
        return theme.colors.primary[500];
    }
  };

  const getStatusText = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.COMPLETED:
        return '완료';
      case ScheduleStatus.IN_PROGRESS:
        return '진행중';
      case ScheduleStatus.CANCELLED:
        return '취소';
      case ScheduleStatus.POSTPONED:
        return '연기';
      default:
        return '계획됨';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '#4CAF50';
      case 'MEDIUM': return '#FF9800';
      case 'HARD': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '쉬움';
      case 'MEDIUM': return '보통';
      case 'HARD': return '어려움';
      default: return '보통';
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '종일';
    return time.substring(0, 5);
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

  if (!schedule) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>스케줄을 찾을 수 없습니다.</Text>
          <Button title="돌아가기" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>스케줄 상세</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 기본 정보 */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📝 기본 정보</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
              <Text style={styles.statusText}>{getStatusText(schedule.status)}</Text>
            </View>
          </View>
          
          <Text style={styles.scheduleTitle}>{schedule.title}</Text>
          
          {schedule.description && (
            <Text style={styles.description}>{schedule.description}</Text>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>날짜:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(schedule.scheduleDate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>시간:</Text>
            <Text style={styles.infoValue}>
              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
            </Text>
          </View>

          {schedule.color && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>색상:</Text>
              <View style={[styles.colorPreview, { backgroundColor: schedule.color }]} />
            </View>
          )}
        </Card>

        {/* 학습 정보 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📚 학습 정보</Text>
          
          <View style={styles.badgesContainer}>
            <View style={[styles.badge, { backgroundColor: getDifficultyColor(schedule.difficulty || 'MEDIUM') }]}>
              <Text style={styles.badgeText}>
                {getDifficultyText(schedule.difficulty || 'MEDIUM')}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.primary[500] }]}>
              <Text style={styles.badgeText}>{schedule.studyMode || 'POMODORO'}</Text>
            </View>
          </View>

          {schedule.studyGoal && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>학습 목표:</Text>
              <Text style={styles.infoValue}>{schedule.studyGoal}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>계획 학습 시간:</Text>
            <Text style={styles.infoValue}>{schedule.plannedStudyMinutes}분</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>계획 휴식 시간:</Text>
            <Text style={styles.infoValue}>{schedule.plannedBreakMinutes}분</Text>
          </View>
        </Card>

        {/* 진행 상황 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📊 진행 상황</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>완료율</Text>
              <Text style={styles.progressValue}>{schedule.completionRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${schedule.completionRate}%` }
                ]} 
              />
            </View>
          </View>

          {schedule.totalStudyTime && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>실제 학습 시간:</Text>
              <Text style={styles.infoValue}>{schedule.actualStudyMinutes}분</Text>
            </View>
          )}

          {schedule.totalRestTime && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>실제 휴식 시간:</Text>
              <Text style={styles.infoValue}>{schedule.actualRestMinutes}분</Text>
            </View>
          )}
        </Card>

        {/* AI 정보 */}
        {(schedule.aiSummary || schedule.aiSuggestions) && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>🤖 AI 분석</Text>
            
            {schedule.aiSummary && (
              <View style={styles.aiSection}>
                <Text style={styles.aiLabel}>요약</Text>
                <Text style={styles.aiText}>{schedule.aiSummary}</Text>
              </View>
            )}

            {schedule.aiSuggestions && (
              <View style={styles.aiSection}>
                <Text style={styles.aiLabel}>개선 제안</Text>
                <Text style={styles.aiText}>{schedule.aiSuggestions}</Text>
              </View>
            )}
          </Card>
        )}

        {/* 메타데이터 */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📋 메타데이터</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>생성일:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(schedule.createdAt), 'yyyy-MM-dd HH:mm')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>수정일:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(schedule.updatedAt), 'yyyy-MM-dd HH:mm')}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* 상태 변경 버튼 */}
      <View style={styles.footer}>
        <View style={styles.statusButtons}>
          <Button
            title="시작"
            onPress={() => handleStatusChange(ScheduleStatus.IN_PROGRESS)}
            variant="secondary"
            size="sm"
            disabled={schedule.status === ScheduleStatus.IN_PROGRESS}
          />
          <Button
            title="완료"
            onPress={() => handleStatusChange(ScheduleStatus.COMPLETED)}
            variant="primary"
            size="sm"
            disabled={schedule.status === ScheduleStatus.COMPLETED}
          />
          <Button
            title="연기"
            onPress={() => handleStatusChange(ScheduleStatus.POSTPONED)}
            variant="outline"
            size="sm"
            disabled={schedule.status === ScheduleStatus.POSTPONED}
          />
          <Button
            title="취소"
            onPress={() => handleStatusChange(ScheduleStatus.CANCELLED)}
            variant="outline"
            size="sm"
            disabled={schedule.status === ScheduleStatus.CANCELLED}
          />
        </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
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
  backButton: {
    fontSize: 24,
    color: theme.colors.primary[500],
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: theme.spacing[4],
  },
  card: {
    marginBottom: theme.spacing[4],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: '500',
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    flex: 1,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: theme.spacing[3],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
  },
  aiSection: {
    marginBottom: theme.spacing[3],
  },
  aiLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  aiText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
});

export default ScheduleDetailScreen; 