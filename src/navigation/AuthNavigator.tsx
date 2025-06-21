import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// 임시 화면 컴포넌트들 (나중에 실제 화면으로 교체)
const WelcomeScreen = () => null;
const ForgotPasswordScreen = () => null;
const EmailVerificationScreen = () => null;

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          title: '환영합니다',
        }}
      />
      <Stack.Screen 
        name="SignIn" 
        component={LoginScreen}
        options={{
          title: '로그인',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{
          title: '회원가입',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: '비밀번호 찾기',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="EmailVerification" 
        component={EmailVerificationScreen}
        options={{
          title: '이메일 인증',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 