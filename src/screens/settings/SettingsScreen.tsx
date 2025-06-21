import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { demoUtils, demoModeManager } from '../../config/demoConfig';
import { theme } from '../../theme';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoIndicator, setShowDemoIndicator] = useState(true);

  useEffect(() => {
    // 초기 상태 로드
    setIsDemoMode(demoUtils.isDemoMode());
    setShowDemoIndicator(demoUtils.shouldShowDemoIndicator());
  }, []);

  const handleDemoModeToggle = (value: boolean) => {
    setIsDemoMode(value);
    if (value) {
      demoUtils.enableDemoMode();
    } else {
      demoUtils.disableDemoMode();
    }
    
    Alert.alert(
      '데모 모드 변경',
      `데모 모드가 ${value ? '활성화' : '비활성화'}되었습니다.\n${
        value 
          ? '이제 백엔드 서버 없이도 앱을 테스트할 수 있습니다.' 
          : '실제 백엔드 서버와 연결됩니다.'
      }`,
      [{ text: '확인' }]
    );
  };

  const handleDemoIndicatorToggle = (value: boolean) => {
    setShowDemoIndicator(value);
    demoModeManager.updateConfig({ showDemoIndicator: value });
  };

  const handleResetSettings = () => {
    Alert.alert(
      '설정 초기화',
      '모든 설정을 기본값으로 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: () => {
            demoModeManager.updateConfig({
              isEnabled: __DEV__,
              showDemoIndicator: true,
            });
            setIsDemoMode(__DEV__);
            setShowDemoIndicator(true);
            Alert.alert('완료', '설정이 초기화되었습니다.');
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      '캐시 삭제',
      '앱 캐시를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            // TODO: 실제 캐시 삭제 로직 구현
            Alert.alert('완료', '캐시가 삭제되었습니다.');
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    disabled = false
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.colors.border.light, true: theme.colors.primary[300] }}
        thumbColor={value ? theme.colors.primary[500] : theme.colors.text.disabled}
      />
    </View>
  );

  const renderButtonItem = (
    title: string,
    description: string,
    onPress: () => void,
    style: 'default' | 'destructive' = 'default'
  ) => (
    <TouchableOpacity style={styles.buttonItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle,
          style === 'destructive' && styles.destructiveText
        ]}>
          {title}
        </Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>설정</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 앱 관리 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 관리</Text>
          
          {renderButtonItem(
            '캐시 삭제',
            '앱 캐시를 삭제합니다',
            handleClearCache
          )}

          {renderButtonItem(
            '설정 초기화',
            '모든 설정을 기본값으로 되돌립니다',
            handleResetSettings,
            'destructive'
          )}
        </View>

        {/* 앱 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>앱 버전</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>빌드 번호</Text>
            <Text style={styles.infoValue}>1</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>현재 모드</Text>
            <Text style={[
              styles.infoValue,
              isDemoMode ? styles.demoModeText : styles.productionModeText
            ]}>
              {isDemoMode ? '데모 모드' : '프로덕션 모드'}
            </Text>
          </View>
        </View>

        {/* 개발자 옵션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개발자 옵션</Text>
          
          {renderSettingItem(
            '데모 모드',
            '백엔드 서버 없이 앱을 테스트할 수 있습니다',
            isDemoMode,
            handleDemoModeToggle
          )}

          {renderSettingItem(
            '데모 인디케이터',
            '화면 상단에 데모 모드 표시',
            showDemoIndicator,
            handleDemoIndicatorToggle,
            !isDemoMode
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[500],
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold' as const,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[2],
    marginTop: theme.spacing[4],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  buttonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  settingContent: {
    flex: 1,
    marginRight: theme.spacing[3],
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  arrow: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  destructiveText: {
    color: theme.colors.error,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontWeight: '500' as const,
  },
  demoModeText: {
    color: theme.colors.warning,
  },
  productionModeText: {
    color: theme.colors.success,
  },
});

export default SettingsScreen; 