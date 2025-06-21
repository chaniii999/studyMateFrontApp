import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

interface SignUpData {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  age: string;
  sex: '남' | '여' | '';
}

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [signUpData, setSignUpData] = useState<SignUpData>({
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    age: '',
    sex: '',
  });
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [codeTimer, setCodeTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 인증코드 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (codeTimer > 0) {
      interval = setInterval(() => {
        setCodeTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [codeTimer]);

  // 이메일 인증코드 발송
  const handleSendCode = async () => {
    if (!signUpData.email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendVerificationCode(signUpData.email);
      setIsCodeSent(true);
      setCodeTimer(180); // 3분
      Alert.alert('성공', '인증코드가 이메일로 발송되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '인증코드 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 인증코드 확인
  const handleVerifyCode = async () => {
    if (!signUpData.verificationCode) {
      Alert.alert('알림', '인증코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyCode(signUpData.email, signUpData.verificationCode);
      setIsEmailVerified(true);
      Alert.alert('성공', '이메일 인증이 완료되었습니다.');
      setCurrentStep(2);
    } catch (error: any) {
      Alert.alert('오류', error.message || '인증코드가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 다음 단계로 이동
  const handleNextStep = () => {
    if (currentStep === 1 && !isEmailVerified) {
      Alert.alert('알림', '이메일 인증을 완료해주세요.');
      return;
    }

    if (currentStep === 2) {
      // 비밀번호 유효성 검사
      if (signUpData.password.length < 8) {
        Alert.alert('알림', '비밀번호는 8자 이상이어야 합니다.');
        return;
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]*$/.test(signUpData.password)) {
        Alert.alert('알림', '비밀번호는 영문자와 숫자를 포함해야 합니다.');
        return;
      }
      if (signUpData.password !== signUpData.confirmPassword) {
        Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
        return;
      }
      setCurrentStep(3);
    }
  };

  // 회원가입 완료
  const handleSignUp = async () => {
    if (!signUpData.nickname || !signUpData.age || !signUpData.sex) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }

    const age = parseInt(signUpData.age);
    if (isNaN(age) || age < 1 || age > 100) {
      Alert.alert('알림', '나이는 1-100 사이의 숫자여야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signUp({
        email: signUpData.email,
        password: signUpData.password,
        nickname: signUpData.nickname,
        age: age,
        sex: signUpData.sex,
      });
      Alert.alert('성공', '회원가입이 완료되었습니다.', [
        { text: '확인', onPress: () => navigation.navigate('SignIn') }
      ]);
    } catch (error: any) {
      Alert.alert('오류', error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 이전 단계로 이동
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>1단계: 이메일 인증</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>이메일</Text>
        <View style={styles.emailContainer}>
          <TextInput
            style={[styles.input, styles.emailInput]}
            placeholder="이메일을 입력하세요"
            value={signUpData.email}
            onChangeText={(text) => setSignUpData({ ...signUpData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isEmailVerified}
          />
          <TouchableOpacity
            style={[styles.sendCodeButton, isEmailVerified && styles.disabledButton]}
            onPress={handleSendCode}
            disabled={isEmailVerified || isLoading || codeTimer > 0}
          >
            <Text style={styles.sendCodeButtonText}>
              {codeTimer > 0 ? `${Math.floor(codeTimer / 60)}:${(codeTimer % 60).toString().padStart(2, '0')}` : '발송'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isCodeSent && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>인증코드</Text>
          <View style={styles.codeContainer}>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="인증코드를 입력하세요"
              value={signUpData.verificationCode}
              onChangeText={(text) => setSignUpData({ ...signUpData, verificationCode: text })}
              keyboardType="number-pad"
              editable={!isEmailVerified}
            />
            <TouchableOpacity
              style={[styles.verifyButton, isEmailVerified && styles.disabledButton]}
              onPress={handleVerifyCode}
              disabled={isEmailVerified || isLoading}
            >
              <Text style={styles.verifyButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isEmailVerified && (
        <View style={styles.verifiedContainer}>
          <Text style={styles.verifiedText}>✓ 이메일 인증 완료</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.nextButton, !isEmailVerified && styles.disabledButton]}
        onPress={handleNextStep}
        disabled={!isEmailVerified || isLoading}
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>2단계: 비밀번호 설정</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요 (8-40자, 영문+숫자)"
          value={signUpData.password}
          onChangeText={(text) => setSignUpData({ ...signUpData, password: text })}
          secureTextEntry
          maxLength={40}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 다시 입력하세요"
          value={signUpData.confirmPassword}
          onChangeText={(text) => setSignUpData({ ...signUpData, confirmPassword: text })}
          secureTextEntry
          maxLength={40}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.prevButton} onPress={handlePrevStep}>
          <Text style={styles.prevButtonText}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>3단계: 개인정보 입력</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임을 입력하세요 (최대 15자)"
          value={signUpData.nickname}
          onChangeText={(text) => setSignUpData({ ...signUpData, nickname: text })}
          maxLength={15}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>나이</Text>
        <TextInput
          style={styles.input}
          placeholder="나이를 입력하세요 (1-100)"
          value={signUpData.age}
          onChangeText={(text) => setSignUpData({ ...signUpData, age: text })}
          keyboardType="number-pad"
          maxLength={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>성별</Text>
        <View style={styles.sexContainer}>
          <TouchableOpacity
            style={[
              styles.sexButton,
              signUpData.sex === '남' && styles.selectedSexButton
            ]}
            onPress={() => setSignUpData({ ...signUpData, sex: '남' })}
          >
            <Text style={[
              styles.sexButtonText,
              signUpData.sex === '남' && styles.selectedSexButtonText
            ]}>남</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sexButton,
              signUpData.sex === '여' && styles.selectedSexButton
            ]}
            onPress={() => setSignUpData({ ...signUpData, sex: '여' })}
          >
            <Text style={[
              styles.sexButtonText,
              signUpData.sex === '여' && styles.selectedSexButtonText
            ]}>여</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.prevButton} onPress={handlePrevStep}>
          <Text style={styles.prevButtonText}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.signUpButton, isLoading && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          <Text style={styles.signUpButtonText}>
            {isLoading ? '처리중...' : '회원가입'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← 뒤로</Text>
            </TouchableOpacity>
            <Text style={styles.title}>회원가입</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{currentStep}/3</Text>
          </View>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    marginRight: 10,
  },
  sendCodeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  sendCodeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    marginRight: 10,
  },
  verifyButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  verifiedContainer: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  verifiedText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  sexContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  sexButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  selectedSexButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sexButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSexButtonText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  prevButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  prevButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  signUpButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
});

export default SignUpScreen; 