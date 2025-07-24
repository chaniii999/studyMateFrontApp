import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from './common/Card';
import Button from './common/Button';
import { theme } from '../theme';

export interface AiFeedbackSurveyData {
  studyTopic: string;
  studyGoal: string;
  difficulty: string;
  concentration: string;
  mood: string;
  interruptions: string;
  studyMethod: string;
  environment: string;
  energyLevel: string;
  stressLevel: string;
}

interface AiFeedbackSurveyProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AiFeedbackSurveyData) => void;
  loading?: boolean;
}

const AiFeedbackSurvey: React.FC<AiFeedbackSurveyProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [surveyData, setSurveyData] = useState<AiFeedbackSurveyData>({
    studyTopic: '',
    studyGoal: '',
    difficulty: '',
    concentration: '',
    mood: '',
    interruptions: '',
    studyMethod: '',
    environment: '',
    energyLevel: '',
    stressLevel: '',
  });

  const handleOptionSelect = (field: keyof AiFeedbackSurveyData, value: string) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // 필수 필드 검증
    const requiredFields: (keyof AiFeedbackSurveyData)[] = [
      'studyTopic', 'studyGoal', 'difficulty', 'concentration', 'mood'
    ];
    
    const missingFields = requiredFields.filter(field => !surveyData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('입력 필요', '모든 필수 항목을 입력해주세요.');
      return;
    }

    onSubmit(surveyData);
  };

  const renderOptionGroup = (
    title: string,
    field: keyof AiFeedbackSurveyData,
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
              surveyData[field] === option && styles.selectedOption,
            ]}
            onPress={() => handleOptionSelect(field, option)}
          >
            <Text
              style={[
                styles.optionText,
                surveyData[field] === option && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTextInput = (
    title: string,
    field: keyof AiFeedbackSurveyData,
    placeholder: string,
    required: boolean = false
  ) => (
    <View style={styles.textInputGroup}>
      <Text style={styles.optionTitle}>
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
            surveyData[field]
          );
        }}
      >
        <Text style={surveyData[field] ? styles.textInputText : styles.textInputPlaceholder}>
          {surveyData[field] || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🤖 AI 피드백 설문조사</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Text style={styles.description}>
              더 정확한 AI 피드백을 위해 학습 상황에 대해 알려주세요!
            </Text>

            {/* 학습 주제 */}
            {renderTextInput(
              '학습 주제',
              'studyTopic',
              '예: React Native, 알고리즘, 영어...',
              true
            )}

            {/* 학습 목표 */}
            {renderTextInput(
              '학습 목표',
              'studyGoal',
              '예: 앱 완성하기, 기초 문법 마스터...',
              true
            )}

            {/* 학습 난이도 */}
            {renderOptionGroup(
              '학습 난이도',
              'difficulty',
              ['쉬움', '보통', '어려움'],
              true
            )}

            {/* 집중도 */}
            {renderOptionGroup(
              '집중도',
              'concentration',
              ['높음', '보통', '낮음'],
              true
            )}

            {/* 학습 기분 */}
            {renderOptionGroup(
              '학습 기분',
              'mood',
              ['좋음', '보통', '나쁨'],
              true
            )}

            {/* 방해 요소 */}
            {renderOptionGroup(
              '방해 요소',
              'interruptions',
              ['없음', '휴대폰', '소음', '다른 사람', '기타']
            )}

            {/* 학습 방법 */}
            {renderOptionGroup(
              '학습 방법',
              'studyMethod',
              ['독서', '실습', '강의 시청', '문제 풀이', '토론', '기타']
            )}

            {/* 학습 환경 */}
            {renderOptionGroup(
              '학습 환경',
              'environment',
              ['집', '도서관', '카페', '학교/회사', '기타']
            )}

            {/* 에너지 레벨 */}
            {renderOptionGroup(
              '에너지 레벨',
              'energyLevel',
              ['높음', '보통', '낮음']
            )}

            {/* 스트레스 레벨 */}
            {renderOptionGroup(
              '스트레스 레벨',
              'stressLevel',
              ['높음', '보통', '낮음']
            )}
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={loading ? "AI 분석 중..." : "AI 피드백 받기"}
            onPress={handleSubmit}
            disabled={loading}
            size="lg"
            variant="primary"
            style={styles.submitButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary[500],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  optionGroup: {
    marginBottom: 24,
  },
  textInputGroup: {
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  required: {
    color: '#EF4444',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInputText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  textInputPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    width: '100%',
  },
});

export default AiFeedbackSurvey; 