import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './store';
import RootNavigator from './navigation/RootNavigator';
import { theme } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // AsyncStorage 초기화 테스트
        await AsyncStorage.setItem('test_key', 'test_value');
        await AsyncStorage.removeItem('test_key');
        console.log('AsyncStorage 초기화 성공');
      } catch (error) {
        console.warn('AsyncStorage 초기화 실패, 메모리 저장소로 전환:', error);
        // 사용자에게 알림 (선택사항)
        Alert.alert(
          '앱 초기화',
          '일부 기능이 제한될 수 있지만 앱을 계속 사용할 수 있습니다.',
          [{ text: '확인' }]
        );
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return null; // 또는 로딩 화면
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
} 