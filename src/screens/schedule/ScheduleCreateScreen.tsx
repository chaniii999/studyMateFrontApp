import React, { useState } from 'react';
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
import { ScheduleRequest } from '../../types/schedule';
import { Platform } from 'react-native';

interface ScheduleCreateScreenProps {
  navigation: any;
  route: {
    params: {
      selectedDate?: string;
    };
  };
}

const ScheduleCreateScreen: React.FC<ScheduleCreateScreenProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ScheduleRequest>>({
    title: '',
    description: '',
    color: '#6EC1E4',
    scheduleDate: route.params?.selectedDate || new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    isAllDay: false,
    isRecurring: false,
    studyMode: 'POMODORO',
    plannedStudyMinutes: 25,
    plannedBreakMinutes: 5,
    studyGoal: '',
    difficulty: 'MEDIUM',
    reminderMinutes: 15,
    isReminderEnabled: true,
  });

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleInputChange = (field: keyof ScheduleRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().substring(0, 5);
      handleInputChange('startTime', timeString);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().substring(0, 5);
      handleInputChange('endTime', timeString);
    }
  };

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
      setLoading(true);
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
        plannedStudyMinutes: formData.plannedStudyMinutes || 25,
        plannedBreakMinutes: formData.plannedBreakMinutes || 5,
        studyGoal: formData.studyGoal || '',
        difficulty: formData.difficulty || 'MEDIUM',
        reminderMinutes: formData.reminderMinutes || 15,
        isReminderEnabled: formData.isReminderEnabled || true,
      };

      await scheduleService.createSchedule(request);
      Alert.alert('완료', '스케줄이 생성되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('스케줄 생성 에러:', error);
      Alert.alert('오류', '스케줄 생성에 실패했습니다.');
    } finally {
      setLoading(false);
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
          <Text style={styles.loadingText}>스케줄을 생성하는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>새 스케줄 만들기</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 기본 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 기본 정보</Text>
          
          <Input
            label="제목"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholder="스케줄 제목을 입력하세요"
            required
          />

          <Input
            label="설명"
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="스케줄에 대한 설명을 입력하세요"
            multiline
            numberOfLines={3}
          />

          <Input
            label="색상"
            value={formData.color}
            onChangeText={(text) => handleInputChange('color', text)}
            placeholder="#6EC1E4"
          />
        </View>

        {/* 날짜/시간 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 날짜 & 시간</Text>
          
          <Input
            label="날짜"
            value={formData.scheduleDate}
            onChangeText={(text) => handleInputChange('scheduleDate', text)}
            placeholder="YYYY-MM-DD"
            required
          />

          <View style={styles.timeContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.inputLabel}>시작 시간</Text>
              <Button
                title={formData.startTime || '시간 선택'}
                onPress={() => setShowStartTimePicker(true)}
                variant="outline"
                size="sm"
              />
            </View>

            <View style={styles.timeInput}>
              <Text style={styles.inputLabel}>종료 시간</Text>
              <Button
                title={formData.endTime || '시간 선택'}
                onPress={() => setShowEndTimePicker(true)}
                variant="outline"
                size="sm"
              />
            </View>
          </View>


        </View>

        {/* 학습 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 학습 설정</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="학습 모드"
                value={formData.studyMode}
                onChangeText={(text) => handleInputChange('studyMode', text)}
                placeholder="POMODORO"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="난이도"
                value={formData.difficulty}
                onChangeText={(text) => handleInputChange('difficulty', text)}
                placeholder="MEDIUM"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="계획 학습 시간 (분)"
                value={formData.plannedStudyMinutes?.toString()}
                onChangeText={(text) => handleInputChange('plannedStudyMinutes', parseInt(text) || 25)}
                placeholder="25"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="계획 휴식 시간 (분)"
                value={formData.plannedBreakMinutes?.toString()}
                onChangeText={(text) => handleInputChange('plannedBreakMinutes', parseInt(text) || 5)}
                placeholder="5"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="학습 목표"
            value={formData.studyGoal}
            onChangeText={(text) => handleInputChange('studyGoal', text)}
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
            value={formData.reminderMinutes?.toString()}
            onChangeText={(text) => handleInputChange('reminderMinutes', parseInt(text) || 15)}
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
          title="스케줄 생성"
          onPress={handleSubmit}
          loading={loading}
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
  timeContainer: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  timeInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
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

export default ScheduleCreateScreen; 