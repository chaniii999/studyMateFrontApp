import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { scheduleService } from '../../services/scheduleService';
import { ScheduleRequest, ScheduleResponse } from '../../types/schedule';

interface ScheduleEditScreenProps {
  navigation: any;
  route: {
    params: {
      scheduleId: string;
    };
  };
}

const ScheduleEditScreen: React.FC<ScheduleEditScreenProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#6EC1E4',
    scheduleDate: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    isRecurring: false,
    studyMode: 'POMODORO',
    plannedStudyMinutes: '',       // 숫자 필드도 string으로
    plannedBreakMinutes: '',
    studyGoal: '',
    difficulty: 'MEDIUM',
    reminderMinutes: '',
    isReminderEnabled: true,
  });

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getSchedule(route.params.scheduleId);
      setSchedule(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        color: data.color || '#6EC1E4',
        scheduleDate: data.scheduleDate,
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        isAllDay: data.isAllDay,
        isRecurring: data.isRecurring,
        studyMode: data.studyMode || 'POMODORO',
        plannedStudyMinutes: data.plannedStudyMinutes?.toString() || '',
        plannedBreakMinutes: data.plannedBreakMinutes?.toString() || '',
        studyGoal: data.studyGoal || '',
        difficulty: data.difficulty || 'MEDIUM',
        reminderMinutes: data.reminderMinutes?.toString() || '',
        isReminderEnabled: data.isReminderEnabled,
      });
    } catch (error) {
      console.error('스케줄 로드 에러:', error);
      Alert.alert('오류', '스케줄을 불러오는데 실패했습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 개별 필드 핸들러들
  const handleTitleChange = useCallback((text: string) => handleInputChange('title', text), [handleInputChange]);
  const handleDescriptionChange = useCallback((text: string) => handleInputChange('description', text), [handleInputChange]);
  const handleStudyModeChange = useCallback((text: string) => handleInputChange('studyMode', text), [handleInputChange]);
  const handleDifficultyChange = useCallback((text: string) => handleInputChange('difficulty', text), [handleInputChange]);
  const handlePlannedStudyMinutesChange = useCallback((text: string) => handleInputChange('plannedStudyMinutes', text), [handleInputChange]);
  const handlePlannedBreakMinutesChange = useCallback((text: string) => handleInputChange('plannedBreakMinutes', text), [handleInputChange]);
  const handleStudyGoalChange = useCallback((text: string) => handleInputChange('studyGoal', text), [handleInputChange]);
  const handleReminderMinutesChange = useCallback((text: string) => handleInputChange('reminderMinutes', text), [handleInputChange]);
  const handleColorChange = useCallback((text: string) => handleInputChange('color', text), [handleInputChange]);
  const handleScheduleDateChange = useCallback((text: string) => handleInputChange('scheduleDate', text), [handleInputChange]);
  const handleStartTimeChange = useCallback((text: string) => handleInputChange('startTime', text), [handleInputChange]);
  const handleEndTimeChange = useCallback((text: string) => handleInputChange('endTime', text), [handleInputChange]);

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    if (!formData.scheduleDate) {
      Alert.alert('오류', '날짜를 선택해주세요.');
      return;
    }

    try {
      setSaving(true);
      const request: ScheduleRequest = {
        title: formData.title!,
        description: formData.description || '',
        color: formData.color || '#6EC1E4',
        scheduleDate: formData.scheduleDate!,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        isAllDay: formData.isAllDay || false,
        isRecurring: formData.isRecurring || false,
        studyMode: formData.studyMode || 'POMODORO',
        plannedStudyMinutes: parseInt(formData.plannedStudyMinutes || '25'),
        plannedBreakMinutes: parseInt(formData.plannedBreakMinutes || '5'),
        studyGoal: formData.studyGoal || '',
        difficulty: formData.difficulty || 'MEDIUM',
        reminderMinutes: parseInt(formData.reminderMinutes || '15'),
        isReminderEnabled: formData.isReminderEnabled || true,
      };

      await scheduleService.updateSchedule(route.params.scheduleId, request);
      Alert.alert('완료', '스케줄이 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('스케줄 수정 에러:', error);
      Alert.alert('오류', '스케줄 수정에 실패했습니다.');
    } finally {
      setSaving(false);
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
        <Text style={styles.title}>스케줄 수정</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 기본 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 기본 정보</Text>
          
          <Input
            label="제목"
            value={formData.title}
            onChangeText={handleTitleChange}
            placeholder="스케줄 제목을 입력하세요"
            required
          />

          <Input
            label="설명"
            value={formData.description}
            onChangeText={handleDescriptionChange}
            placeholder="스케줄에 대한 설명을 입력하세요"
            multiline
            numberOfLines={3}
          />

          <Input
            label="색상"
            value={formData.color}
            onChangeText={handleColorChange}
            placeholder="#6EC1E4"
          />
        </View>

        {/* 날짜/시간 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 날짜 & 시간</Text>
          
          <Input
            label="날짜"
            value={formData.scheduleDate}
            onChangeText={handleScheduleDateChange}
            placeholder="YYYY-MM-DD"
            required
          />

          <Input
            label="시작 시간"
            value={formData.startTime}
            onChangeText={handleStartTimeChange}
            placeholder="HH:mm"
          />

          <Input
            label="종료 시간"
            value={formData.endTime}
            onChangeText={handleEndTimeChange}
            placeholder="HH:mm"
          />
        </View>

        {/* 학습 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 학습 설정</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="학습 모드"
                value={formData.studyMode}
                onChangeText={handleStudyModeChange}
                placeholder="POMODORO"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="난이도"
                value={formData.difficulty}
                onChangeText={handleDifficultyChange}
                placeholder="MEDIUM"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="계획 학습 시간 (분)"
                value={formData.plannedStudyMinutes}
                onChangeText={(text) => handleInputChange('plannedStudyMinutes', text)}
                placeholder="25"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="계획 휴식 시간 (분)"
                value={formData.plannedBreakMinutes}
                onChangeText={(text) => handleInputChange('plannedBreakMinutes', text)}
                placeholder="5"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="학습 목표"
            value={formData.studyGoal}
            onChangeText={handleStudyGoalChange}
            placeholder="이번 학습의 목표를 설정하세요"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* 알림 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 알림 설정</Text>
          
          <Input
            label="알림 시간 (분 전)"
            value={formData.reminderMinutes}
            onChangeText={(text) => handleInputChange('reminderMinutes', text)}
            placeholder="15"
            keyboardType="numeric"
          />
        </View>

        {/* 미리보기 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👀 미리보기</Text>
          <View style={[styles.previewCard, { borderLeftColor: formData.color }]}>
            <Text style={styles.previewTitle}>{formData.title || '제목 미입력'}</Text>
            <Text style={styles.previewTime}>
              {formData.startTime && formData.endTime 
                ? `${formData.startTime} - ${formData.endTime}`
                : '종일'
              }
            </Text>
            {formData.studyGoal && (
              <Text style={styles.previewGoal}>목표: {formData.studyGoal}</Text>
            )}
            <View style={styles.previewBadges}>
              <View style={[styles.previewBadge, { backgroundColor: getDifficultyColor(formData.difficulty || 'MEDIUM') }]}>
                <Text style={styles.previewBadgeText}>
                  {getDifficultyText(formData.difficulty || 'MEDIUM')}
                </Text>
              </View>
              <View style={[styles.previewBadge, { backgroundColor: theme.colors.primary[500] }]}>
                <Text style={styles.previewBadgeText}>{formData.studyMode || 'POMODORO'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="취소"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="스케줄 수정"
          onPress={handleSubmit}
          loading={saving}
          style={styles.submitButton}
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
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing[4],
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  halfInput: {
    flex: 1,
  },
  previewCard: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[4],
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  previewTime: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  previewGoal: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  previewBadges: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewBadgeText: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default ScheduleEditScreen; 