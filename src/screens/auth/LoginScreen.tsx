import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signIn, selectIsLoading, selectError } from '../../store/slices/authSlice';
import { theme } from '../../theme';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;

// 임시 컴포넌트들 (나중에 실제 컴포넌트로 교체)
const Button = ({ title, onPress, loading, style }: any) => (
  <TouchableOpacity style={[styles.loginButton, style]} onPress={onPress} disabled={loading}>
    <Text style={styles.buttonText}>
      {loading ? '로딩 중...' : title}
    </Text>
  </TouchableOpacity>
);

const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize }: any) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={theme.colors.text.disabled}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  </View>
);

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await dispatch(signIn({ email, password })).unwrap();
    } catch (error: any) {
      // 백엔드 서버가 없을 때의 처리
      if (error.message?.includes('Network Error') || error.message?.includes('ECONNREFUSED')) {
        Alert.alert(
          '서버 연결 실패', 
          '백엔드 서버가 실행되지 않았습니다.\n스프링 서버를 먼저 실행해주세요.',
          [
            { text: '확인', style: 'default' },
            { 
              text: '데모 모드로 진행', 
              onPress: () => {
                // 임시로 데모 모드로 진행 (나중에 구현)
                Alert.alert('데모 모드', '데모 모드로 앱을 실행합니다.');
              }
            }
          ]
        );
      } else {
        Alert.alert('로그인 실패', error.message || '로그인에 실패했습니다.');
      }
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>StudyMate</Text>
            <Text style={styles.subtitle}>효율적인 학습을 위한 동반자</Text>
          </View>

          {/* 로그인 폼 */}
          <View style={styles.form}>
            <Input
              label="이메일"
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <Button
              title="로그인"
              onPress={handleLogin}
              loading={isLoading}
            />

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signUpButtonText}>회원가입</Text>
            </TouchableOpacity>
          </View>

          {/* 추가 옵션 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              계정이 없으신가요? <Text style={styles.linkText} onPress={handleSignUp}>회원가입</Text>
            </Text>
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: 'bold' as const,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing[6],
  },
  inputContainer: {
    marginBottom: theme.spacing[4],
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500' as const,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.background.primary,
  },
  input: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing[3],
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    marginTop: theme.spacing[2],
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600' as const,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    marginTop: theme.spacing[3],
  },
  signUpButtonText: {
    color: theme.colors.primary[500],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600' as const,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  linkText: {
    color: theme.colors.primary[500],
    fontWeight: '500' as const,
  },
});

export default LoginScreen; 