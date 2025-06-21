import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signOut, selectUser } from '../../store/slices/authSlice';
import { demoUtils } from '../../config/demoConfig';
import { theme } from '../../theme';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const handleSignOut = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(signOut()).unwrap();
            } catch (error) {
              console.error('로그아웃 에러:', error);
            }
          }
        }
      ]
    );
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const renderMenuItem = (
    title: string,
    subtitle: string,
    onPress: () => void,
    icon?: string
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>프로필</Text>
      </View>

      {/* 사용자 정보 */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nickname?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.nickname || '사용자'}</Text>
        <Text style={styles.userEmail}>{user?.email || '이메일 없음'}</Text>
        
        {demoUtils.isDemoMode() && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>데모 모드</Text>
          </View>
        )}
      </View>

      {/* 메뉴 */}
      <View style={styles.menuSection}>
        {renderMenuItem(
          '설정',
          '앱 설정 및 개발자 옵션',
          handleSettings,
          '⚙️'
        )}
        
        {renderMenuItem(
          '학습 통계',
          '나의 학습 기록 및 통계',
          () => Alert.alert('준비 중', '학습 통계 기능은 준비 중입니다.'),
          '📊'
        )}
        
        {renderMenuItem(
          '알림 설정',
          '알림 및 소리 설정',
          () => Alert.alert('준비 중', '알림 설정 기능은 준비 중입니다.'),
          '🔔'
        )}
        
        {renderMenuItem(
          '도움말',
          '앱 사용법 및 FAQ',
          () => Alert.alert('준비 중', '도움말 기능은 준비 중입니다.'),
          '❓'
        )}
      </View>

      {/* 로그아웃 */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold' as const,
    color: theme.colors.text.primary,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  avatarText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: 'bold' as const,
    color: theme.colors.text.inverse,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '600' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  userEmail: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  demoBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
  },
  demoBadgeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.inverse,
    fontWeight: '500' as const,
  },
  menuSection: {
    marginTop: theme.spacing[4],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  menuContent: {
    flex: 1,
    marginRight: theme.spacing[3],
  },
  menuTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  menuSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  arrow: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  logoutSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[6],
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600' as const,
  },
});

export default ProfileScreen; 