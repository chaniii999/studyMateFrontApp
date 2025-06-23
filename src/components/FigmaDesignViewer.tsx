import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFigmaDesign } from '../hooks/useFigmaDesign';

interface FigmaDesignViewerProps {
  fileId: string;
  nodeId?: string;
  onComponentSelect?: (component: any) => void;
  onExport?: (images: any) => void;
  showControls?: boolean;
}

export const FigmaDesignViewer: React.FC<FigmaDesignViewerProps> = ({
  fileId,
  nodeId,
  onComponentSelect,
  onExport,
  showControls = true,
}) => {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg'>('png');
  const [exportScale, setExportScale] = useState<number>(1);

  const {
    file,
    node,
    components,
    isLoading,
    error,
    fetchFile,
    fetchNode,
    exportImages,
    convertToReactNative,
    lastSync,
    isConnected,
  } = useFigmaDesign({
    fileId,
    nodeId,
    autoSync: true,
    syncInterval: 60000, // 1분마다 동기화
  });

  const handleComponentSelect = (component: any) => {
    if (onComponentSelect) {
      onComponentSelect(component);
    }
  };

  const handleExport = async () => {
    if (selectedComponents.length === 0) {
      Alert.alert('알림', '내보낼 컴포넌트를 선택해주세요.');
      return;
    }

    try {
      const result = await exportImages(selectedComponents, exportFormat, exportScale);
      if (result && onExport) {
        onExport(result);
      }
      Alert.alert('성공', '이미지가 성공적으로 내보내졌습니다.');
    } catch (err) {
      Alert.alert('오류', '이미지 내보내기에 실패했습니다.');
    }
  };

  const handleConvertToReactNative = () => {
    if (!node) {
      Alert.alert('알림', '변환할 노드가 없습니다.');
      return;
    }

    try {
      const code = convertToReactNative();
      if (code) {
        // 코드를 클립보드에 복사하거나 파일로 저장하는 로직 추가 가능
        Alert.alert('성공', 'React Native 컴포넌트로 변환되었습니다.');
        console.log('Generated Code:', code);
      }
    } catch (err) {
      Alert.alert('오류', '컴포넌트 변환에 실패했습니다.');
    }
  };

  const toggleComponentSelection = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>오류: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFile}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>Figma 디자인 뷰어</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>
            {isConnected ? '연결됨' : '연결 안됨'}
          </Text>
        </View>
      </View>

      {/* 컨트롤 패널 */}
      {showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton} onPress={fetchFile}>
              <Text style={styles.controlButtonText}>새로고침</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={handleConvertToReactNative}>
              <Text style={styles.controlButtonText}>RN 변환</Text>
            </TouchableOpacity>
          </View>
          
          {selectedComponents.length > 0 && (
            <View style={styles.exportControls}>
              <Text style={styles.exportLabel}>내보내기 설정:</Text>
              <View style={styles.exportOptions}>
                <TouchableOpacity
                  style={[styles.optionButton, exportFormat === 'png' && styles.optionButtonActive]}
                  onPress={() => setExportFormat('png')}
                >
                  <Text style={styles.optionButtonText}>PNG</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, exportFormat === 'svg' && styles.optionButtonActive]}
                  onPress={() => setExportFormat('svg')}
                >
                  <Text style={styles.optionButtonText}>SVG</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                <Text style={styles.exportButtonText}>
                  선택된 {selectedComponents.length}개 내보내기
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      )}

      {/* 파일 정보 */}
      {file && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{file.name}</Text>
          <Text style={styles.fileDetails}>
            마지막 동기화: {lastSync?.toLocaleString() || '없음'}
          </Text>
        </View>
      )}

      {/* 컴포넌트 목록 */}
      <ScrollView
        style={styles.componentsList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchFile} />
        }
      >
        {components.map((component) => (
          <TouchableOpacity
            key={component.key}
            style={[
              styles.componentItem,
              selectedComponents.includes(component.key) && styles.componentItemSelected
            ]}
            onPress={() => toggleComponentSelection(component.key)}
            onLongPress={() => handleComponentSelect(component)}
          >
            <View style={styles.componentInfo}>
              <Text style={styles.componentName}>{component.name}</Text>
              <Text style={styles.componentType}>{component.description || '컴포넌트'}</Text>
            </View>
            {selectedComponents.includes(component.key) && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedIndicatorText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        
        {components.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>컴포넌트가 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666666',
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  controlRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  controlButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 12,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  exportControls: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  exportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  exportOptions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 8,
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 12,
    color: '#333333',
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666666',
  },
  componentsList: {
    flex: 1,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  componentItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  componentType: {
    fontSize: 12,
    color: '#666666',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
}); 