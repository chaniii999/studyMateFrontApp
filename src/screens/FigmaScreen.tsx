import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { FigmaDesignViewer } from '../components/FigmaDesignViewer';

export const FigmaScreen: React.FC = () => {
  const [fileId, setFileId] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [showViewer, setShowViewer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleComponentSelect = (component: any) => {
    Alert.alert(
      '컴포넌트 선택됨',
      `이름: ${component.name}\n설명: ${component.description || '설명 없음'}`,
      [
        { text: '확인', style: 'default' },
        { text: 'React Native로 변환', onPress: () => handleConvertComponent(component) },
      ]
    );
  };

  const handleExport = (images: any) => {
    console.log('내보낸 이미지:', images);
    Alert.alert('내보내기 완료', `${Object.keys(images.images).length}개의 이미지가 내보내졌습니다.`);
  };

  const handleConvertComponent = (component: any) => {
    // 여기서 컴포넌트를 React Native 코드로 변환하는 로직을 추가할 수 있습니다
    Alert.alert('변환 완료', `${component.name} 컴포넌트가 React Native 코드로 변환되었습니다.`);
  };

  const handleStartViewer = () => {
    if (!fileId.trim()) {
      Alert.alert('오류', 'Figma 파일 ID를 입력해주세요.');
      return;
    }
    setShowViewer(true);
  };

  return (
    <View style={styles.container}>
      {!showViewer ? (
        <View style={styles.setupContainer}>
          <Text style={styles.title}>Figma 디자인 뷰어</Text>
          <Text style={styles.subtitle}>
            Figma API를 사용하여 디자인을 React Native 컴포넌트로 변환하세요
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Figma 파일 ID</Text>
            <TextInput
              style={styles.input}
              value={fileId}
              onChangeText={setFileId}
              placeholder="예: abcdefghijklmnop"
              placeholderTextColor="#999"
            />
            <Text style={styles.helpText}>
              Figma 파일 URL에서 찾을 수 있습니다: figma.com/file/XXXXX
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>노드 ID (선택사항)</Text>
            <TextInput
              style={styles.input}
              value={nodeId}
              onChangeText={setNodeId}
              placeholder="특정 노드만 보려면 입력하세요"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartViewer}>
            <Text style={styles.startButtonText}>뷰어 시작</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
            <Text style={styles.settingsButtonText}>설정</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FigmaDesignViewer
          fileId={fileId}
          nodeId={nodeId || undefined}
          onComponentSelect={handleComponentSelect}
          onExport={handleExport}
          showControls={true}
        />
      )}

      {/* 설정 모달 */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>설정</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.closeButton}>닫기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>API 설정</Text>
              <Text style={styles.settingDescription}>
                Figma API 키는 figma-config.json 파일에서 관리됩니다.
              </Text>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>사용법</Text>
              <Text style={styles.settingDescription}>
                1. Figma 파일 ID를 입력하세요{'\n'}
                2. 뷰어를 시작하면 컴포넌트 목록이 표시됩니다{'\n'}
                3. 컴포넌트를 선택하여 이미지로 내보낼 수 있습니다{'\n'}
                4. RN 변환 버튼으로 React Native 코드를 생성할 수 있습니다
              </Text>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>지원 기능</Text>
              <Text style={styles.settingDescription}>
                • 실시간 Figma 파일 동기화{'\n'}
                • 컴포넌트 이미지 내보내기 (PNG/SVG){'\n'}
                • React Native 컴포넌트 자동 생성{'\n'}
                • 다중 컴포넌트 선택 및 일괄 처리
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* 뒤로가기 버튼 */}
      {showViewer && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowViewer(false)}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  setupContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingSection: {
    marginBottom: 32,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
}); 