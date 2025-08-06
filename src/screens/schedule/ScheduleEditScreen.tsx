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
import { ScheduleRequest, ScheduleResponse, ScheduleStatus } from '../../types/schedule';

// 무지개 색상 프리셋 (ScheduleCreateScreen과 동일)
const COLOR_PRESETS = [
  { name: '빨강', color: '#FF6B6B', description: '열정적인' },
  { name: '주황', color: '#FF8E53', description: '활동적인' },
  { name: '노랑', color: '#FFD93D', description: '밝은' },
  { name: '연두', color: '#6BCF7F', description: '상쾌한' },
  { name: '녹색', color: '#4ECDC4', description: '집중력' },
  { name: '하늘', color: '#45B7D1', description: '차분한' },
  { name: '파랑', color: '#6C5CE7', description: '신뢰할 수 있는' },
  { name: '보라', color: '#A29BFE', description: '창의적인' },
  { name: '핑크', color: '#FD79A8', description: '부드러운' },
  { name: '회색', color: '#636E72', description: '중성적인' },
];

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
    title: '',              // 1. 제목 (공부주제, 스케줄명칭)
    subtitle: '',           // 2. 소제목 (공부 어느정도 할지)
    description: '',        // 3. 설명 (구체적인 설명)
    scheduleDate: '',       // 4. 날짜
    startTime: '',
    endTime: '',
    difficulty: 'MEDIUM',   // 5. 난이도
    plannedStudyMinutes: '25',  // 6. 계획 학습시간
    plannedBreakMinutes: '5',   // 6. 계획 휴식시간
    color: '#6EC1E4',       // 색상
    isAllDay: false,
    isRecurring: false,
    studyMode: 'POMODORO',
    reminderMinutes: '15',
    isReminderEnabled: true,
  });

  useEffect(() => {
    loadSchedule();
  }, [route.params.scheduleId]);

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
        plannedStudyMinutes: data.plannedStudyMinutes?.toString() || '25',
        plannedBreakMinutes: data.plannedBreakMinutes?.toString() || '5',
        studyGoal: data.studyGoal || '',
        difficulty: data.difficulty || 'MEDIUM',
        reminderMinutes: data.reminderMinutes?.toString() || '15',
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

  const handleOptionSelect = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderTextInput = (
    title: string,
    field: string,
    placeholder: string,
    required: boolean = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputTitle}>
        {title} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={styles.textInput}
        onPress={() => {
          Alert.prompt(
            title,
            placeholder,
            [
              { text: '취소', style: 'cancel' },
              {
                text: '확인',
                onPress: (text) => {
                  if (text) {
                    handleOptionSelect(field, text);
                  }
                },
              },
            ],
            'plain-text',
            formData[field as keyof typeof formData] as string
          );
        }}
      >
        <Text style={formData[field as keyof typeof formData] ? styles.textInputText : styles.textInputPlaceholder}>
          {formData[field as keyof typeof formData] || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOptionGroup = (
    title: string,
    field: string,
    options: string[],
    required: boolean = false
  ) => (
    <View style={styles.optionGroup}>
      <Text style={styles.optionTitle}>
        {title} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              formData[field as keyof typeof formData] === option && styles.selectedOption,
            ]}
            onPress={() => handleOptionSelect(field, option)}
          >
            <Text
              style={[
                styles.optionText,
                formData[field as keyof typeof formData] === option && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSubmit = async () => {
    // 필수 필드 검증
    const requiredFields = ['title', 'scheduleDate'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      Alert.alert('입력 필요', '모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      const request: ScheduleRequest = {
        title: formData.title,
        description: formData.description,
        color: formData.color,
        scheduleDate: formData.scheduleDate,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        isAllDay: formData.isAllDay,
        isRecurring: formData.isRecurring,
        studyMode: formData.studyMode,
        plannedStudyMinutes: parseInt(formData.plannedStudyMinutes) || 25,
        plannedBreakMinutes: parseInt(formData.plannedBreakMinutes) || 5,
        studyGoal: formData.studyGoal,
        difficulty: formData.difficulty,
        reminderMinutes: parseInt(formData.reminderMinutes) || 15,
        isReminderEnabled: formData.isReminderEnabled,
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
        <Text style={styles.headerTitle}>✏️ 스케줄 수정</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.description}>
            스케줄 정보를 수정하고 저장하세요!
          </Text>

          {/* 기본 정보 */}
          {renderTextInput('제목', 'title', '스케줄 제목을 입력하세요', true)}
          {renderTextInput('설명', 'description', '스케줄에 대한 설명을 입력하세요')}
          {renderTextInput('색상', 'color', '#6EC1E4')}
          {renderTextInput('날짜', 'scheduleDate', 'YYYY-MM-DD', true)}
          {renderTextInput('시작 시간', 'startTime', 'HH:MM')}
          {renderTextInput('종료 시간', 'endTime', 'HH:MM')}

          {/* 학습 설정 */}
          {renderOptionGroup('학습 모드', 'studyMode', ['POMODORO', 'FOCUS', 'BREAK'], true)}
          {renderOptionGroup('난이도', 'difficulty', ['EASY', 'MEDIUM', 'HARD'], true)}
          {renderTextInput('계획 학습 시간 (분)', 'plannedStudyMinutes', '25')}
          {renderTextInput('계획 휴식 시간 (분)', 'plannedBreakMinutes', '5')}
          {renderTextInput('학습 목표', 'studyGoal', '이번 학습의 목표를 설정하세요')}
          {renderTextInput('알림 시간 (분 전)', 'reminderMinutes', '15')}

          {/* 미리보기 */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>👀 미리보기</Text>
            <View style={[styles.previewCard, { borderLeftColor: formData.color }]}>
              <Text style={styles.previewCardTitle}>{formData.title || '제목 미입력'}</Text>
              {formData.subtitle ? (
                <Text style={styles.previewCardSubtitle}>{formData.subtitle}</Text>
              ) : (
                <Text style={styles.previewCardSubtitle}>소제목 미입력</Text>
              )}
              {formData.description && (
                <Text style={styles.previewCardDescription}>{formData.description}</Text>
              )}
              <Text style={styles.previewCardDate}>📅 {formData.scheduleDate}</Text>
              <Text style={styles.previewCardTime}>
                {formData.startTime && formData.endTime 
                  ? `⏰ ${formData.startTime} - ${formData.endTime}`
                  : '⏰ 종일'
                }
              </Text>
              <Text style={styles.previewCardStudyTime}>
                📚 학습 {formData.plannedStudyMinutes}분 / 휴식 {formData.plannedBreakMinutes}분
              </Text>
              {formData.studyGoal && (
                <Text style={styles.previewCardGoal}>목표: {formData.studyGoal}</Text>
              )}
              <View style={styles.previewCardBadges}>
                <View style={[styles.previewCardBadge, { backgroundColor: getDifficultyColor(formData.difficulty) }]}>
                  <Text style={styles.previewCardBadgeText}>
                    {getDifficultyText(formData.difficulty)}
                  </Text>
                </View>
                <View style={[styles.previewCardBadge, { backgroundColor: theme.colors.primary[500] }]}>
                  <Text style={styles.previewCardBadgeText}>{formData.studyMode}</Text>
                </View>
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
    fontSize: 18,
    color: theme.colors.error,
    marginBottom: theme.spacing[4],
    textAlign: 'center',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: theme.spacing[4],
  },
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
  },
  description: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: theme.spacing[4],
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  textInput: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  textInputText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  textInputPlaceholder: {
    fontSize: 16,
    color: theme.colors.text.disabled,
  },
  optionGroup: {
    marginBottom: theme.spacing[4],
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  optionButton: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  selectedOptionText: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  required: {
    color: theme.colors.error,
  },
  previewSection: {
    marginTop: theme.spacing[4],
    paddingTop: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  previewCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    borderLeftWidth: 4,
  },
  previewCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  previewCardSubtitle: {
    fontSize: 15,
    fontStyle: 'italic',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  previewCardDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
    lineHeight: 20,
  },
  previewCardDate: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  previewCardTime: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  previewCardStudyTime: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  previewCardGoal: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
  },
  previewCardBadges: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  previewCardBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },
  previewCardBadgeText: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default ScheduleEditScreen; 