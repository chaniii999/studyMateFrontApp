import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { StudyGoalRequest, GoalStatus } from '../../types';
import { studyGoalService } from '../../services';

interface StudyGoalCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const SUBJECT_OPTIONS = [
  '영어', '수학', '과학', '국어', '사회', '프로그래밍', 
  '디자인', '경영', '외국어', '기타'
];

const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const StudyGoalCreateModal: React.FC<StudyGoalCreateModalProps> = ({
  visible,
  onClose,
  onCreated,
}) => {
  const [formData, setFormData] = useState<StudyGoalRequest>({
    title: '',
    subject: '',
    description: '',
    color: COLOR_OPTIONS[0],
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    targetHours: 10,
    targetSessions: undefined,
    status: GoalStatus.ACTIVE,
  });

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!formData.title || !formData.subject || !formData.targetDate) {
      Alert.alert('오류', '필수 항목을 모두 입력해주세요.');
      return;
    }

    if (new Date(formData.targetDate) <= new Date(formData.startDate)) {
      Alert.alert('오류', '목표일은 시작일보다 늦어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      await studyGoalService.createStudyGoal(formData);
      Alert.alert('성공', '학습목표가 생성되었습니다!');
      onCreated();
      handleClose();
    } catch (error) {
      console.error('학습목표 생성 실패:', error);
      Alert.alert('오류', '학습목표 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      color: COLOR_OPTIONS[0],
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      targetHours: 10,
      targetSessions: undefined,
      status: GoalStatus.ACTIVE,
    });
    onClose();
  };

  const renderSubjectSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>과목 *</Text>
      <ScrollView horizontal style={styles.optionsScroll} showsHorizontalScrollIndicator={false}>
        {SUBJECT_OPTIONS.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.optionButton,
              formData.subject === subject && styles.selectedOption,
            ]}
            onPress={() => setFormData({ ...formData, subject })}
          >
            <Text
              style={[
                styles.optionText,
                formData.subject === subject && styles.selectedOptionText,
              ]}
            >
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderColorSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>색상</Text>
      <View style={styles.colorContainer}>
        {COLOR_OPTIONS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              formData.color === color && styles.selectedColorOption,
            ]}
            onPress={() => setFormData({ ...formData, color })}
          />
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>새 학습목표 만들기</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>목표명 *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(title) => setFormData({ ...formData, title })}
                placeholder="예: 토익 900점 달성"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            {renderSubjectSelector()}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>목표 설명</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(description) => setFormData({ ...formData, description })}
                placeholder="구체적인 학습 계획을 작성해보세요"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>목표 시간 (시간) *</Text>
              <TextInput
                style={styles.input}
                value={formData.targetHours.toString()}
                onChangeText={(value) => setFormData({ 
                  ...formData, 
                  targetHours: parseInt(value) || 0 
                })}
                placeholder="10"
                keyboardType="numeric"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>목표일 *</Text>
              <TextInput
                style={styles.input}
                value={formData.targetDate}
                onChangeText={(targetDate) => setFormData({ ...formData, targetDate })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            {renderColorSelector()}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreate}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>
                  {loading ? '생성 중...' : '생성하기'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectorContainer: {
    marginBottom: 16,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StudyGoalCreateModal;